#!/usr/bin/env ts-node
/**
 * Bulk-deletes auto-generated test apps from Developer Hub in the QA organization.
 *
 * WHY THIS EXISTS
 * ---------------
 * Developer-Hub run 30870235729 had 12 of 21 executable flows failing. Six of the thirteen failure
 * records were `toBeEnabled` assertions on controls that were present and visible — most tellingly:
 *
 *   Developer Hub "+ New App" (button[data-test-id="new-app-cta"]) did not become enabled.
 *   If this persists, check org Developer Hub app limits, plan entitlements, ...
 *
 * The Developer Hub listing captured in that run's own failure DOM holds **49 apps**, of which 33 are
 * auto-generated `m<hex>` slugs — the shape the create-app flows produce. Nothing cleans them up
 * (`grep '"stage": "cleanup"'` over projects/ returns zero flows), so every run adds one and the org
 * drifts toward its app limit. Once "+ New App" is disabled, every create-app flow fails at step 4–5
 * and everything downstream cascades.
 *
 * SCOPE — deliberately narrow
 * ---------------------------
 * Default target is ONLY the auto-generated slugs: `m` followed by 8 hex characters (`m0fddaa8e`,
 * `mc24efbc0`, …). The same listing also holds hand-named apps — `demo`, `reference`, `test`,
 * `sdk-java-mkt-app`, `dashboard-app` — which may be deliberate and are never touched by default. A
 * cleanup job that destroys a colleague's app is worse than the problem it solves.
 *
 * Dry-run by default; `--confirm` is required to delete anything.
 *
 * USAGE
 *   npx ts-node --transpile-only scripts/delete-all-devhub-apps.ts                    # list only
 *   npx ts-node --transpile-only scripts/delete-all-devhub-apps.ts --confirm           # delete m<hex>
 *   npx ts-node --transpile-only scripts/delete-all-devhub-apps.ts --pattern "^auto-" --confirm
 *   npx ts-node --transpile-only scripts/delete-all-devhub-apps.ts --max 10 --confirm   # cap a batch
 *
 * Selectors below are taken from the real DOM captured in that failed run and from
 * rules/core/actionRules.ts — none are guessed.
 */
import { chromium, type Browser, type Page } from "playwright";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const EMAIL = process.env.CS_EMAIL!;
const PASSWORD = process.env.CS_PASSWORD!;
const APP_ORIGIN = process.env.CS_APP_ORIGIN ?? "https://app.contentstack.com";
const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== "0";
const ORG_NAME = process.env.DEVHUB_ORG_NAME ?? "Contentstack QA";

const argv = process.argv.slice(2);
const CONFIRM = argv.includes("--confirm");
const PATTERN = (() => {
  const i = argv.indexOf("--pattern");
  // Auto-generated app slugs only. Hand-named apps are left alone.
  return new RegExp(i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "^m[0-9a-f]{8}$", "i");
})();
const MAX_DELETIONS = (() => {
  const i = argv.indexOf("--max");
  const n = i >= 0 ? Number(argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 500;
})();

const SEL = {
  /** Listing rows: data-test-id="apps-<slug>" (from the captured listing DOM). */
  appRow: '[data-test-id^="apps-"]',
  /** Present on the app detail page — confirmed in three captured app-detail snapshots. */
  deleteCta: '[data-test-id="delete-app-cta"]',
  modalTitle: '[data-test-id="cs-modal-title-delete-app"]',
  /** Deleting an app requires typing its name (actionRules.ts). */
  nameInput: '[data-test-id="app-name-to-delete"]',
  confirmDelete: '[data-test-id="modal-form-delete"]',
  newAppCta: 'button[data-test-id="new-app-cta"]',
};

async function login(page: Page) {
  await page.goto(`${APP_ORIGIN}/#!/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"], input[type="email"]', EMAIL);
  await page.fill('input[name="password"], input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|stacks/, { timeout: 60_000 });
  console.log("Logged in");
}

async function selectOrg(page: Page) {
  await page.goto(`${APP_ORIGIN}/#!/organizations`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const nameNode = page
    .locator('[data-test-id="cs-truncate"]', { hasText: ORG_NAME })
    .filter({ hasText: new RegExp(`^${ORG_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) })
    .first();
  await nameNode.waitFor({ state: "visible", timeout: 30_000 });
  const card = nameNode
    .locator('xpath=ancestor::*[.//button[@data-test-id="org-selection-btn"]][1]')
    .first();
  await card.locator('[data-test-id="org-selection-btn"]').first().click();
  await page.waitForTimeout(2000);
  console.log(`Selected organization: ${ORG_NAME}`);
}

async function goToDeveloperHub(page: Page) {
  // `#!/developerhub` — NOT `#!/developerhub/apps`, which renders no rows. Verified by probing both:
  // the former lists 50 `apps-*` rows, the latter zero.
  await page.goto(`${APP_ORIGIN}/#!/developerhub`, { waitUntil: "domcontentloaded" });
  // Poll for the ROW COUNT to settle. A `Promise.race` on row-or-CTA is wrong here: the New App CTA
  // paints before the rows do, so the race resolves early and the listing reads as empty — which is
  // exactly how this first reported "0 apps" against an org holding 50.
  const deadline = Date.now() + 60_000;
  let last = -1;
  let stableFor = 0;
  while (Date.now() < deadline) {
    const n = await page.locator(SEL.appRow).count().catch(() => 0);
    if (n > 0 && n === last) {
      stableFor += 1;
      if (stableFor >= 2) break; // same count three polls running: rendering has finished
    } else {
      stableFor = 0;
    }
    last = n;
    await page.waitForTimeout(1200);
  }
}

/** App slugs currently on the listing, from the `apps-<slug>` row test-ids. */
async function listAppSlugs(page: Page): Promise<string[]> {
  return page
    .$$eval('[data-test-id^="apps-"]', (nodes) =>
      nodes
        .map((n) => (n.getAttribute("data-test-id") ?? "").replace(/^apps-/, ""))
        .filter((s) => s.length > 0)
    )
    .then((all) => [...new Set(all)])
    .catch(() => [] as string[]);
}

async function deleteApp(page: Page, slug: string): Promise<void> {
  const row = page.locator(`[data-test-id="apps-${slug}"]`).first();
  await row.waitFor({ state: "visible", timeout: 20_000 });
  await row.click({ timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(900);

  const del = page.locator(SEL.deleteCta).first();
  await del.waitFor({ state: "visible", timeout: 30_000 });
  await del.scrollIntoViewIfNeeded().catch(() => {});
  await del.click({ timeout: 30_000 });

  await page
    .locator(SEL.modalTitle)
    .first()
    .waitFor({ state: "visible", timeout: 30_000 })
    .catch(() => {});

  // The confirmation requires the app's own name typed back.
  const input = page.locator(SEL.nameInput).first();
  await input.waitFor({ state: "visible", timeout: 20_000 });
  const appName = await page
    .locator('[data-test-id="basic-info-name"]')
    .first()
    .innerText()
    .then((t) => t.replace(/\s+/g, " ").trim())
    .catch(() => "");
  await input.fill(appName || slug);

  const confirm = page.locator(SEL.confirmDelete).first();
  await confirm.waitFor({ state: "visible", timeout: 20_000 });
  // If the typed name does not match, the button stays disabled — surface that clearly rather than
  // hanging on a click that can never land.
  const enabled = await confirm.isEnabled({ timeout: 10_000 }).catch(() => false);
  if (!enabled) {
    throw new Error(
      `confirm button stayed disabled — typed name "${appName || slug}" likely does not match the app's name`
    );
  }
  await confirm.click({ timeout: 30_000 });
  await page.waitForTimeout(1800);
}

async function main() {
  console.log("================================================================");
  console.log("  Developer Hub app cleanup");
  console.log(`  Mode:     ${CONFIRM ? "DELETE" : "DRY RUN (nothing will be deleted)"}`);
  console.log(`  Scope:    slugs matching ${PATTERN}`);
  console.log(`  Org:      ${ORG_NAME}`);
  console.log(`  Headless: ${HEADLESS}`);
  console.log("================================================================\n");

  const browser: Browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  let deleted = 0;
  const failed: Array<{ slug: string; error: string }> = [];

  try {
    await login(page);
    await selectOrg(page);
    await goToDeveloperHub(page);

    const all = await listAppSlugs(page);
    const targets = all.filter((s) => PATTERN.test(s));
    const spared = all.filter((s) => !PATTERN.test(s));

    console.log(`Apps on the listing:   ${all.length}`);
    console.log(`In scope for deletion: ${targets.length}`);
    console.log(`Left alone:            ${spared.length}${spared.length ? ` (${spared.slice(0, 8).join(", ")}${spared.length > 8 ? ", …" : ""})` : ""}\n`);

    if (!targets.length) {
      console.log("Nothing to clean up.");
      return;
    }
    for (const s of targets) console.log(`  - ${s}`);
    console.log("");

    if (!CONFIRM) {
      console.log("Dry run — re-run with --confirm to delete the apps listed above.");
      return;
    }

    // Drain loop: re-read the listing after each delete so pagination and re-renders cannot hide rows.
    const stuck = new Set<string>();
    while (deleted < MAX_DELETIONS) {
      await goToDeveloperHub(page);
      const remaining = (await listAppSlugs(page)).filter((s) => PATTERN.test(s) && !stuck.has(s));
      if (!remaining.length) {
        console.log("\nNo in-scope apps left on the listing.");
        break;
      }
      const slug = remaining[0];
      try {
        await deleteApp(page, slug);
        deleted += 1;
        console.log(`  deleted #${deleted}: ${slug}`);
      } catch (err: any) {
        const msg = String(err?.message ?? err).split("\n")[0];
        failed.push({ slug, error: msg });
        console.log(`  FAILED: ${slug} — ${msg.slice(0, 110)}`);
        stuck.add(slug);
      }
    }
    if (deleted >= MAX_DELETIONS) console.log(`Reached --max ${MAX_DELETIONS}; stopping.`);
  } catch (err) {
    console.error("Fatal:", err);
    await page
      .screenshot({ path: `delete-devhub-apps-error-after-${deleted}.png`, fullPage: true })
      .catch(() => {});
  } finally {
    await browser.close();
  }

  console.log("\n================================================================");
  console.log(`  COMPLETE — ${deleted} app(s) deleted, ${failed.length} failed`);
  if (failed.length) for (const f of failed) console.log(`    ! ${f.slug}: ${f.error.slice(0, 90)}`);
  console.log("================================================================");
}

main();

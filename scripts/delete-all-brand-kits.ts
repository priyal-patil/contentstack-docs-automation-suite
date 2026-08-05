#!/usr/bin/env ts-node
/**
 * Bulk-deletes accumulated test Brand Kits from the QA organization.
 *
 * WHY THIS EXISTS
 * ---------------
 * BrandKit's scheduled run failed six consecutive nights (29 Jul – 3 Aug 2026). The cause was not the
 * app and not the docs: 15 orphaned `AUTO-BK-*` Brand Kits had accumulated, and the flows that look up
 * "the card for the created kit" by name prefix started matching stale cards — or the newly created kit
 * fell off the rendered page. 13 of 15 flows failed from that one condition.
 *
 * No flow cleans up after itself: `grep '"stage": "cleanup"'` over projects/ returns zero flows. So the
 * backlog only grows. Follows the same pattern as `delete-all-content-types.ts` and
 * `delete-all-launch-projects.ts`.
 *
 * TWO DELIBERATE DIFFERENCES FROM THAT PRECEDENT
 * ---------------------------------------------
 * 1. **Dry-run by default.** `delete-all-launch-projects.ts` deletes the moment you run it. Bulk
 *    deletion against a shared QA org should not be one mistyped command away, so this lists what it
 *    would delete and requires `--confirm` to act.
 * 2. **Only test data by default.** It deletes Brand Kits whose name starts with `AUTO-` (the prefix the
 *    flows generate). A colleague's hand-made Brand Kit is not test data and must not be destroyed by a
 *    cleanup job. `--prefix` changes it; `--all` removes the filter and requires `--confirm` as well.
 *
 * USAGE
 *   npx ts-node --transpile-only scripts/delete-all-brand-kits.ts                 # dry run, lists only
 *   npx ts-node --transpile-only scripts/delete-all-brand-kits.ts --confirm       # delete AUTO-* kits
 *   npx ts-node --transpile-only scripts/delete-all-brand-kits.ts --prefix AUTO-CBK- --confirm
 *   npx ts-node --transpile-only scripts/delete-all-brand-kits.ts --all --confirm # everything (careful)
 *
 * Env: CS_EMAIL, CS_PASSWORD, CS_APP_ORIGIN, BRAND_KIT_ORG_NAME (default "Contentstack QA"),
 *      PLAYWRIGHT_HEADLESS=0 to watch it.
 */
import { chromium, type Browser, type Page } from "playwright";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const EMAIL = process.env.CS_EMAIL!;
const PASSWORD = process.env.CS_PASSWORD!;
const APP_ORIGIN = process.env.CS_APP_ORIGIN ?? "https://app.contentstack.com";
const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== "0";
const ORG_NAME = process.env.BRAND_KIT_ORG_NAME ?? "Contentstack QA";

const argv = process.argv.slice(2);
const CONFIRM = argv.includes("--confirm");
const DELETE_ALL = argv.includes("--all");
const PREFIX = (() => {
  const i = argv.indexOf("--prefix");
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "AUTO-";
})();
const MAX_DELETIONS = (() => {
  const i = argv.indexOf("--max");
  const n = i >= 0 ? Number(argv[i + 1]) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 500;
})();

/** Selectors taken verbatim from projects/BrandKit/get-started/selectors/delete-a-brand-kit.selectors.ts */
const SEL = {
  dashboardTile: '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',
  card: 'a[data-testid="brand-kit-card-link"], a.brand-kit-card-link',
  settingsNav:
    '[data-test-id="brandkit-nav-settings"], nav.TopNavbar a[href*="settings"] button, nav.TopNavbar button:has-text("Settings")',
  openDeleteModal:
    '[data-test-id="brand-kit-click-btn-secondary-action-settings-general-open-delete-brand-kit-modal"]',
  confirmInput:
    '[data-test-id="brand-kit-change-input-text-settings-general-delete-brand-kit"], [data-test-id="brand-kit-settings-general-delete-brand-kit-modal"] input[name="delete"]',
  confirmDelete:
    '[data-test-id="brand-kit-click-btn-primary-action-settings-general-delete-brand-kit-confirm"]',
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
  const selectBtn = card.locator('[data-test-id="org-selection-btn"]').first();
  await selectBtn.waitFor({ state: "visible", timeout: 15_000 });
  await selectBtn.click();
  await page.waitForTimeout(2000);
  console.log(`Selected organization: ${ORG_NAME}`);
}

async function goToBrandKits(page: Page) {
  await page.goto(`${APP_ORIGIN}/#!/brand-kit`, { waitUntil: "domcontentloaded" });
  // The listing is client-rendered; the app inlines a large bundle so the shell paints well before the
  // cards exist. Wait for a card or an empty state rather than a fixed delay.
  await page
    .locator(SEL.card)
    .first()
    .waitFor({ state: "visible", timeout: 45_000 })
    .catch(() => {});
}

/** Visible Brand Kit names on the listing, in DOM order. */
async function listKitNames(page: Page): Promise<string[]> {
  return page
    .$$eval('a[data-testid="brand-kit-card-link"], a.brand-kit-card-link', (nodes) =>
      nodes.map((n) => ((n as HTMLElement).innerText ?? "").replace(/\s+/g, " ").trim())
    )
    .catch(() => [] as string[]);
}

/** First card whose text contains `name`. Names are matched, not positions, so pagination cannot skew it. */
function cardByName(page: Page, name: string) {
  return page.locator(SEL.card).filter({ hasText: name }).first();
}

/** Extract the AUTO-… identifier from a card's full text blob. */
function kitIdentifier(cardText: string, prefix: string): string | undefined {
  const re = new RegExp(`${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[A-Za-z0-9_-]*`);
  return re.exec(cardText)?.[0];
}

async function deleteKit(page: Page, name: string): Promise<void> {
  await cardByName(page, name).click({ timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(800);

  const settings = page.locator(SEL.settingsNav).first();
  await settings.waitFor({ state: "visible", timeout: 30_000 });
  await settings.click();
  await page.waitForTimeout(600);

  const openModal = page.locator(SEL.openDeleteModal).first();
  await openModal.scrollIntoViewIfNeeded().catch(() => {});
  await openModal.waitFor({ state: "visible", timeout: 30_000 });
  await openModal.click();

  const input = page.locator(SEL.confirmInput).first();
  await input.waitFor({ state: "visible", timeout: 15_000 });
  await input.fill("DELETE");

  const confirm = page.locator(SEL.confirmDelete).first();
  await confirm.waitFor({ state: "visible", timeout: 15_000 });
  await confirm.click();
  await page.waitForTimeout(1500);
}

async function main() {
  const mode = CONFIRM ? "DELETE" : "DRY RUN (nothing will be deleted)";
  const scope = DELETE_ALL ? "ALL Brand Kits" : `Brand Kits named "${PREFIX}*"`;

  console.log("================================================================");
  console.log("  Brand Kit cleanup");
  console.log(`  Mode:     ${mode}`);
  console.log(`  Scope:    ${scope}`);
  console.log(`  Org:      ${ORG_NAME}`);
  console.log(`  Headless: ${HEADLESS}`);
  console.log("================================================================\n");

  if (DELETE_ALL && !CONFIRM) {
    console.log("--all is a destructive scope; it still requires --confirm. Listing only.\n");
  }

  const browser: Browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  let deleted = 0;
  const failed: Array<{ name: string; error: string }> = [];

  try {
    await login(page);
    await selectOrg(page);
    await goToBrandKits(page);

    const all = await listKitNames(page);
    const targets = DELETE_ALL
      ? all
      : all.filter((t) => t.toUpperCase().includes(PREFIX.toUpperCase()));

    console.log(`Brand Kits visible on the listing: ${all.length}`);
    console.log(`Matching the scope:                ${targets.length}\n`);

    if (!targets.length) {
      console.log("Nothing to clean up.");
      return;
    }

    for (const t of targets) {
      console.log(`  - ${kitIdentifier(t, DELETE_ALL ? "" : PREFIX) ?? t.slice(0, 40)}`);
    }
    console.log("");

    if (!CONFIRM) {
      console.log(
        "Dry run — re-run with --confirm to delete these.\n" +
          "Note: the listing paginates, so the count above is what is currently rendered; a --confirm run\n" +
          "drains every page and may therefore delete more than is listed here."
      );
      return;
    }

    // Drain loop rather than iterating the snapshot above.
    //
    // The listing PAGINATES — the dry run sees only the first page — and this backlog is large enough
    // that the newly created kit falling off page 1 is what broke the suite in the first place. Taking
    // the first matching card each pass and re-reading after every delete drains every page, and is how
    // delete-all-launch-projects.ts behaves too. Iterating a one-shot list would silently leave the
    // deeper pages behind, which is precisely the bug being cleaned up.
    const stuck = new Set<string>();
    while (deleted < MAX_DELETIONS) {
      await goToBrandKits(page);
      const names = await listKitNames(page);
      const remaining = (DELETE_ALL ? names : names.filter((t) => t.toUpperCase().includes(PREFIX.toUpperCase())))
        .filter((n) => !stuck.has(n));

      if (!remaining.length) {
        console.log("\nNo matching Brand Kits left on the listing.");
        break;
      }

      const name = remaining[0];
      const id = kitIdentifier(name, DELETE_ALL ? "" : PREFIX) ?? name.slice(0, 40);
      try {
        await deleteKit(page, name);
        deleted += 1;
        console.log(`  deleted #${deleted}: ${id}`);
      } catch (err: any) {
        const msg = String(err?.message ?? err).split("\n")[0];
        failed.push({ name: id, error: msg });
        console.log(`  FAILED: ${id} — ${msg.slice(0, 110)}`);
        // Park it so one stubborn kit cannot spin the loop forever.
        stuck.add(name);
      }
    }
    if (deleted >= MAX_DELETIONS) console.log(`Reached --max ${MAX_DELETIONS}; stopping.`);
  } catch (err) {
    console.error("Fatal:", err);
    await page
      .screenshot({ path: `delete-brand-kits-error-after-${deleted}.png`, fullPage: true })
      .catch(() => {});
  } finally {
    await browser.close();
  }

  console.log("\n================================================================");
  console.log(`  COMPLETE — ${deleted} Brand Kit(s) deleted, ${failed.length} failed`);
  if (failed.length) for (const f of failed) console.log(`    ! ${f.name}: ${f.error.slice(0, 90)}`);
  console.log("================================================================");
}

main();

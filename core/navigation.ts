// core/navigation.ts
import { Page, expect } from "@playwright/test";
import { appUrl, loadRuntimeEnv } from "./env";

const envPath = loadRuntimeEnv();
console.log("✅ Loaded .env from:", envPath);

const DASHBOARD_URL = appUrl("/#!/dashboard");
const STACKS_URL = appUrl("/#!/stacks");

const HEADLESS_TILE = '[data-test-id="cs-global-dashboard-product-tile-headless-cms"]';

// ✅ Only use markers that confirm stack cards are actually rendered — generic page markers
// (cs-page-title, cs-page-layout-contentBody) fire before cards load and cause false-ready.
const STACKS_READY_MARKERS = [
  '[data-test-id^=”cs-stacklist-card-”]',
  “.StackList”,
];

async function waitForAnySelector(page: Page, selectors: string[], timeout = 90_000) {
  const start = Date.now();
  const errors: string[] = [];

  while (Date.now() - start < timeout) {
    for (const sel of selectors) {
      try {
        const loc = page.locator(sel).first();
        if (await loc.isVisible().catch(() => false)) return sel;
      } catch (e: any) {
        errors.push(`${sel}: ${e?.message || e}`);
      }
    }
    await page.waitForTimeout(300);
  }

  throw new Error(
    `Timed out waiting for any selector: ${selectors.join(", ")}\n` +
      (errors.length ? `Last errors:\n${errors.slice(-5).join("\n")}` : "")
  );
}

async function clickHeadlessTileIfVisible(page: Page) {
  const tile = page.locator(HEADLESS_TILE).first();

  const exists = (await tile.count().catch(() => 0)) > 0;
  if (!exists) return;

  const visible = await tile.isVisible().catch(() => false);
  if (!visible) return;

  await tile.scrollIntoViewIfNeeded().catch(() => {});
  await tile.click({ force: true, timeout: 60_000 });
  await page.waitForTimeout(500);
}

export async function ensureOnStacksAndSelectStack(page: Page) {
  console.log("🧪 DEFAULT_STACK from env:", process.env.DEFAULT_STACK);

  // 1) Go to dashboard
  await page.goto(DASHBOARD_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/#!\/dashboard/i, { timeout: 90_000 });

  // 2) Click Headless CMS tile if visible
  await clickHeadlessTileIfVisible(page);

  // 3) Force open stacks
  await page.goto(STACKS_URL, { waitUntil: "domcontentloaded" });

  // 4) If it bounced back to dashboard, click tile again and retry stacks once
  if (page.url().includes("/#!/dashboard")) {
    await clickHeadlessTileIfVisible(page);
    await page.goto(STACKS_URL, { waitUntil: "domcontentloaded" });
  }

  // 5) Confirm stacks UI loaded — wait for an actual stack card, not just any page element.
  // Under GHA load (10+ concurrent workers all hitting the stacks page), cards can take
  // longer than 90s to render. 150s stays within the 5-min flow timeout.
  const marker = await waitForAnySelector(page, STACKS_READY_MARKERS, 150_000);
  console.log("✅ Stacks page looks ready via marker:", marker, "| URL:", page.url());

  // 6) Select configured stack with PriyalDocsStack as fallback.
  const stackName = process.env.DEFAULT_STACK;
  if (!stackName) {
    throw new Error("DEFAULT_STACK is not set in .env (required for deterministic stack selection).");
  }

  const FALLBACK_STACK = "PriyalDocsStack";

  // Stack display names may contain spaces; the test-id replaces them with hyphens
  // e.g. "Compass starter app" → cs-stacklist-card-Compass-starter-app
  const toStackId = (name: string) => name.replace(/\s+/g, "-");

  // Try the configured DEFAULT_STACK first; fall back to PriyalDocsStack if not found within 10s.
  let stackLink = page.locator(`[data-test-id="cs-stacklist-card-${toStackId(stackName)}"]`).first();
  const primaryFound = await stackLink.isVisible({ timeout: 10_000 }).catch(() => false);

  if (!primaryFound) {
    console.warn(`⚠️ Stack card "${stackName}" not found — trying fallback "${FALLBACK_STACK}"`);
    stackLink = page.locator(`[data-test-id="cs-stacklist-card-${toStackId(FALLBACK_STACK)}"]`).first();
    await expect(stackLink).toBeVisible({ timeout: 150_000 });
    console.log(`✅ Using fallback stack: ${FALLBACK_STACK}`);
  }

  await stackLink.scrollIntoViewIfNeeded().catch(() => {});
  await stackLink.click({ timeout: 60_000, force: true });
  console.log(`✅ Clicked stack: ${primaryFound ? stackName : FALLBACK_STACK}`);

  // ✅ Confirm route changed into a stack dashboard
  await page.waitForURL(/#!\/stack\/[^/]+\/dashboard/i, { timeout: 90_000 });

  await page.waitForTimeout(800);
}

// Backward compatible alias
export const openDefaultStack = ensureOnStacksAndSelectStack;

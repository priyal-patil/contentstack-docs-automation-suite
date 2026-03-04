// core/navigation.ts
import { Page, expect } from "@playwright/test";
import { appUrl, loadRuntimeEnv } from "./env";

const envPath = loadRuntimeEnv();
console.log("✅ Loaded .env from:", envPath);

const DASHBOARD_URL = appUrl("/#!/dashboard");
const STACKS_URL = appUrl("/#!/stacks");

const HEADLESS_TILE = '[data-test-id="cs-global-dashboard-product-tile-headless-cms"]';

// ✅ Prefer true “ready” markers for stacks list, not the title (title can be duplicated/hidden)
const STACKS_READY_MARKERS = [
  ".StackList",
  '[data-test-id^="cs-stacklist-card-"]',
  '[data-test-id="cs-page-layout-contentBody"]',
  '[data-test-id="cs-page-title"]',
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

  // 5) Confirm stacks UI loaded (use list/card markers, not just title text)
  const marker = await waitForAnySelector(page, STACKS_READY_MARKERS, 90_000);
  console.log("✅ Stacks page looks ready via marker:", marker, "| URL:", page.url());

  // 6) Select configured stack (MUST click exactly DEFAULT_STACK; do not fallback silently)
  const stackName = process.env.DEFAULT_STACK;
  if (!stackName) {
    throw new Error("DEFAULT_STACK is not set in .env (required for deterministic stack selection).");
  }

  // ✅ Best locator from your DOM:
  // Wrapper link: data-test-id="cs-stacklist-card-<STACKNAME>"
  const stackLink = page.locator(`[data-test-id="cs-stacklist-card-${stackName}"]`).first();
  await expect(stackLink).toBeVisible({ timeout: 90_000 });

  await stackLink.scrollIntoViewIfNeeded().catch(() => {});
  await stackLink.click({ timeout: 60_000, force: true });
  console.log(`✅ Clicked configured stack: ${stackName}`);

  // ✅ Confirm route changed into a stack dashboard
  await page.waitForURL(/#!\/stack\/[^/]+\/dashboard/i, { timeout: 90_000 });

  await page.waitForTimeout(800);
}

// Backward compatible alias
export const openDefaultStack = ensureOnStacksAndSelectStack;

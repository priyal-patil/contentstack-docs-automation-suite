/**
 * Deletes all content types from PriyalDocsStack one by one until none remain.
 * Run with: npx ts-node scripts/delete-all-content-types.ts
 */

import { chromium, Browser, Page } from "playwright";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const EMAIL = process.env.CS_EMAIL!;
const PASSWORD = process.env.CS_PASSWORD!;
const APP_ORIGIN = process.env.CS_APP_ORIGIN ?? "https://app.contentstack.com";
const STACK_NAME = "PriyalDocsStack";
const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== "0";

// Selectors from module.selectors.ts
const SEL = {
  contentModelsNav: '[data-test-id="cms-nav-content-models"]',
  newCtBtn: '[data-test-id="cs-cb-new-ct"]',            // readiness gate
  firstRow: '[data-test-id="cs-table-body-row-0"]',
  ellipsis: '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  deleteMenuItem: '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-delete"]',
  confirmDeleteBtn: '[role="dialog"] button:has-text("Delete")',
  modal: '[role="dialog"]',
};

async function login(page: Page) {
  await page.goto(`${APP_ORIGIN}/#!/login`, { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"], input[type="email"]', EMAIL);
  await page.fill('input[name="password"], input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|stacks/, { timeout: 60_000 });
  console.log("✅ Logged in");
}

async function goToContentModels(page: Page) {
  // Navigate to stacks list
  await page.goto(`${APP_ORIGIN}/#!/stacks`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".StackList", { timeout: 30_000 });

  // Click PriyalDocsStack card
  const stackCard = page.locator(`[data-test-id="cs-stacklist-card-${STACK_NAME}"]`).first();
  await stackCard.waitFor({ state: "visible", timeout: 30_000 });
  await stackCard.click();
  await page.waitForURL(/#!\/stack\/[^/]+\/dashboard/i, { timeout: 30_000 });
  console.log(`✅ Opened stack: ${STACK_NAME}`);

  // Click Content Models in top nav
  const contentModelsLink = page.locator(SEL.contentModelsNav).first();
  await contentModelsLink.waitFor({ state: "visible", timeout: 30_000 });
  await contentModelsLink.click();

  // Wait for the New Content Type button (readiness gate for the table)
  await page.locator(SEL.newCtBtn).waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(2000);
  console.log("✅ Opened Content Models — table ready, URL:", page.url());
  // Debug: count rows and capture screenshot
  const rowCount = await page.locator('[data-test-id^="cs-table-body-row-"]').count();
  console.log(`  DEBUG: row count = ${rowCount}`);
  await page.screenshot({ path: "debug-content-models.png", fullPage: false });
  console.log("  DEBUG: screenshot saved to debug-content-models.png");
}

async function deleteOneContentType(page: Page): Promise<boolean> {
  // Extra wait for table data to settle
  await page.waitForTimeout(1000);

  // Check if the first row exists
  const firstRow = page.locator(SEL.firstRow).first();
  const hasRow = await firstRow.isVisible({ timeout: 5_000 }).catch(() => false);
  if (!hasRow) {
    console.log("✅ No rows visible — all content types deleted!");
    return false;
  }

  // Hover the first row to reveal the ellipsis, then click it
  await firstRow.hover();
  await page.waitForTimeout(300);

  const ellipsis = page.locator(SEL.ellipsis).first();
  await ellipsis.waitFor({ state: "visible", timeout: 5_000 });
  await ellipsis.click({ force: true });
  console.log("  ▶ Clicked vertical ellipsis on row 0");

  // Wait for tooltip/dropdown and click Delete
  const deleteMenuItem = page.locator(SEL.deleteMenuItem).first();
  await deleteMenuItem.waitFor({ state: "visible", timeout: 10_000 });
  await deleteMenuItem.click();
  console.log("  ▶ Clicked Delete from dropdown");

  // Wait for confirmation modal and click Delete button
  const modalDeleteBtn = page.locator(SEL.confirmDeleteBtn).first();
  await modalDeleteBtn.waitFor({ state: "visible", timeout: 15_000 });
  await modalDeleteBtn.click();
  console.log("  ▶ Confirmed deletion");

  // Wait for modal to close
  await page.locator(SEL.modal).waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(800);

  return true;
}

async function main() {
  console.log("================================================================");
  console.log(`  Deleting all content types from: ${STACK_NAME}`);
  console.log(`  Headless: ${HEADLESS}`);
  console.log("================================================================\n");

  const browser: Browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  let deleted = 0;

  try {
    await login(page);
    await goToContentModels(page);

    while (true) {
      const success = await deleteOneContentType(page);
      if (!success) break;
      deleted++;
      console.log(`✅ Deleted #${deleted}\n`);
    }
  } catch (err) {
    console.error("❌ Error:", err);
    await page.screenshot({ path: `delete-ct-error-after-${deleted}.png`, fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log("\n================================================================");
  console.log(`  COMPLETE — ${deleted} content type(s) deleted`);
  console.log("================================================================");
}

main();

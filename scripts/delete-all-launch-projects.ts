/**
 * Deletes all projects from the Launch product one by one until none remain.
 * Run with: npx ts-node scripts/delete-all-launch-projects.ts
 */

import { chromium, Browser, Page } from "playwright";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const EMAIL = process.env.CS_EMAIL!;
const PASSWORD = process.env.CS_PASSWORD!;
const APP_ORIGIN = process.env.CS_APP_ORIGIN ?? "https://app.contentstack.com";
const HEADLESS = process.env.PLAYWRIGHT_HEADLESS !== "0";
const ORG_NAME = process.env.LAUNCH_ORG_NAME ?? "Contentstack QA";

const SEL = {
  projectCard: '[data-testid^="project-settings-"]',
  settingsNav: '[data-test-id="launch-nav-settings"]',
  deleteSection: '[data-testid="delete-project-section"]',
  deleteBtn: '[data-testid="delete-project-button"]',
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

  const nameNode = page.locator('[data-test-id="cs-truncate"]', { hasText: ORG_NAME }).filter({
    hasText: new RegExp(`^${ORG_NAME.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
  }).first();
  await nameNode.waitFor({ state: "visible", timeout: 30_000 });

  const card = nameNode.locator(
    'xpath=ancestor::*[.//button[@data-test-id="org-selection-btn"]][1]'
  ).first();
  const selectBtn = card.locator('[data-test-id="org-selection-btn"]').first();
  await selectBtn.waitFor({ state: "visible", timeout: 15_000 });
  await selectBtn.click();
  await page.waitForTimeout(2000);
  console.log(`Selected organization: ${ORG_NAME}, URL:`, page.url());
}

async function goToLaunch(page: Page) {
  await page.goto(`${APP_ORIGIN}/#!/launch`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const count = await page.locator(SEL.projectCard).count();
  console.log("Opened Launch, URL:", page.url(), "| project card count:", count);
}

async function deleteOneProject(page: Page): Promise<boolean> {
  await page.waitForTimeout(1000);

  const card = page.locator(SEL.projectCard).first();
  const hasCard = await card.isVisible({ timeout: 15_000 }).catch(() => false);
  if (!hasCard) {
    console.log("No project cards visible — all Launch projects deleted!");
    return false;
  }

  await card.click({ timeout: 30_000 });
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForTimeout(800);
  console.log("  Opened project");

  const settingsBtn = page.locator(SEL.settingsNav).first();
  await settingsBtn.waitFor({ state: "visible", timeout: 30_000 });
  await settingsBtn.click();
  await page.waitForTimeout(600);
  console.log("  Opened Settings");

  const section = page.locator(SEL.deleteSection).first();
  await section.waitFor({ state: "visible", timeout: 30_000 });
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);

  const triggerBtn = page.locator(SEL.deleteBtn).first();
  await triggerBtn.scrollIntoViewIfNeeded().catch(() => {});
  await triggerBtn.waitFor({ state: "visible", timeout: 30_000 });
  await triggerBtn.click();
  await page.waitForTimeout(500);
  console.log("  Clicked Delete Project");

  const dlg = page.getByRole("dialog").last();
  await dlg.waitFor({ state: "visible", timeout: 15_000 });

  let input = dlg.locator('input[placeholder*="DELETE" i], input[aria-label*="DELETE" i]').first();
  if (!(await input.isVisible({ timeout: 3_000 }).catch(() => false))) {
    input = dlg.locator('input[type="text"]:not([readonly])').first();
  }
  await input.fill("DELETE");
  console.log("  Typed DELETE confirmation");

  let confirmBtn = dlg.locator(SEL.deleteBtn).last();
  if (!(await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
    confirmBtn = dlg.getByRole("button", { name: /^Yes,\s*Delete$/i }).first();
  }
  if (!(await confirmBtn.isVisible({ timeout: 3_000 }).catch(() => false))) {
    confirmBtn = dlg.getByRole("button", { name: /Delete/i }).last();
  }
  await confirmBtn.waitFor({ state: "visible", timeout: 15_000 });
  await confirmBtn.click();
  console.log("  Confirmed deletion");

  await page.waitForURL(/#!\/launch(\/projects)?(\?.*)?$/i, { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(1000);

  return true;
}

async function main() {
  console.log("================================================================");
  console.log("  Deleting all Launch projects");
  console.log(`  Headless: ${HEADLESS}`);
  console.log("================================================================\n");

  const browser: Browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  let deleted = 0;

  try {
    await login(page);
    await selectOrg(page);
    await goToLaunch(page);

    while (true) {
      const success = await deleteOneProject(page);
      if (!success) break;
      deleted++;
      console.log(`Deleted #${deleted}\n`);
      await goToLaunch(page);
    }
  } catch (err) {
    console.error("Error:", err);
    await page.screenshot({ path: `delete-launch-projects-error-after-${deleted}.png`, fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log("\n================================================================");
  console.log(`  COMPLETE — ${deleted} Launch project(s) deleted`);
  console.log("================================================================");
}

main();

/**
 * Quick debug script: navigate to Content Models, click the first AUTO- row ellipsis,
 * wait 1s, then dump the full body DOM to data/dom/CMS/content-models/ct-popup-open.html
 * Run: npx ts-node scripts/capture-ct-popup.ts
 */

import { chromium } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

(async () => {
  const browser = await chromium.launch({ headless: false, args: ["--start-maximized"] });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();

  // Load credentials from env or defaults
  const email = process.env.CS_EMAIL || "priyal.patil@contentstack.com";
  const password = process.env.CS_PASSWORD || "";

  console.log("Navigating to login...");
  await page.goto("https://app.contentstack.com/#!/login");
  await page.waitForLoadState("networkidle");

  // Login
  await page.locator('input[name="email"], input[type="email"]').first().fill(email);
  await page.locator('input[name="password"], input[type="password"]').first().fill(password);
  await page.locator('button[type="submit"], button:has-text("Sign in")').first().click();
  await page.waitForLoadState("networkidle");
  console.log("Logged in, current URL:", page.url());

  // Navigate to stack / content models — adjust URL as needed
  await page.goto("https://app.contentstack.com/#!/stacks");
  await page.waitForLoadState("networkidle");

  // Click PriyalDocsStack
  const stack = page.getByText("PriyalDocsStack").first();
  await stack.waitFor({ state: "visible", timeout: 15_000 });
  await stack.click();
  await page.waitForLoadState("networkidle");

  // Navigate to Content Models
  const nav = page.locator('[data-test-id="cms-nav-content-models"]').first();
  await nav.waitFor({ state: "visible", timeout: 15_000 });
  await nav.click();
  await page.waitForLoadState("networkidle");
  console.log("Content Models page loaded");

  // Find first AUTO- row and click its ellipsis
  const firstAutoRow = page.locator('[role="row"]').filter({ hasText: /AUTO-/i }).first();
  await firstAutoRow.waitFor({ state: "visible", timeout: 10_000 });
  const ellipsis = firstAutoRow.locator('[data-test-id="cs-table-action-options"]').first();
  await ellipsis.waitFor({ state: "visible", timeout: 5_000 });
  console.log("Clicking ellipsis...");
  await ellipsis.click();

  // Wait for popup to appear
  await page.waitForTimeout(1500);
  console.log("Capturing DOM...");

  // Dump body
  const dom = await page.evaluate(() => document.body.innerHTML);
  const outPath = path.join(__dirname, "../data/dom/CMS/content-models/ct-popup-open.html");
  fs.writeFileSync(outPath, dom);
  console.log("Saved DOM to", outPath);

  // Also log what popup elements exist
  const popupInfo = await page.evaluate(() => {
    const selectors = [
      "#tableRowActionNode",
      '[data-test-id="cs-vertical-action-tooltip"]',
      ".VerticalActionTooltip",
      '[role="menu"]',
    ];
    return selectors.map((sel) => {
      const els = document.querySelectorAll(sel);
      return {
        selector: sel,
        count: els.length,
        visible: Array.from(els).map((el) => {
          const rect = (el as HTMLElement).getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }),
        innerHTML: Array.from(els)
          .slice(0, 2)
          .map((el) => el.innerHTML.slice(0, 200)),
      };
    });
  });
  console.log("Popup elements:", JSON.stringify(popupInfo, null, 2));

  await browser.close();
})();

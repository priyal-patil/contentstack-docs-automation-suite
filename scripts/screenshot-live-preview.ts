import { chromium } from 'playwright';
import * as path from 'path';
import * as fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({ storageState: fs.existsSync('auth.json') ? 'auth.json' : undefined });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  require('dotenv').config();
  const origin = process.env.CS_APP_ORIGIN || 'https://app.contentstack.com';

  // Log in if needed
  await page.goto(origin);
  if (await page.locator('input[name="email"], input[type="email"]').isVisible({ timeout: 5000 }).catch(() => false)) {
    await page.fill('input[name="email"], input[type="email"]', process.env.CS_EMAIL!);
    await page.fill('input[name="password"], input[type="password"]', process.env.CS_PASSWORD!);
    await page.locator('[data-test-id="cs-email-login"]').click();
    await page.waitForLoadState('networkidle');
  }

  // Click Headless CMS
  await page.locator('[data-test-id="cs-cms-button"], button:has-text("Headless CMS")').first().click();
  await page.waitForLoadState('networkidle');

  // Click first stack card
  await page.locator('[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"]').first().click();
  await page.waitForLoadState('networkidle');

  // Click Entries
  await page.locator('a[href*="/#!/stack/"][href*="/entries"], [data-test-id="cms-nav-entries"]').first().click();
  await page.waitForLoadState('networkidle');

  // Click first entry row
  await page.locator('[data-test-id^="cs-table-body-row-0"]').first().click();
  await page.waitForLoadState('networkidle');

  // Screenshot: entry open, before Live Preview click
  const outDir = 'reports/lp-screenshot-test';
  fs.mkdirSync(outDir, { recursive: true });
  await page.screenshot({ path: path.join(outDir, '1-entry-open.png'), fullPage: false });
  console.log('Screenshot 1: entry open');

  // Click Live Preview icon
  const lpIcon = page.locator('[data-test-id="cs-entry-edit-tab-live-preview"]').first();
  await lpIcon.waitFor({ state: 'visible' });
  await lpIcon.click();
  console.log('Clicked Live Preview icon');

  // Wait for panel to appear
  await page.waitForTimeout(3000);

  // Screenshot: after Live Preview icon click
  await page.screenshot({ path: path.join(outDir, '2-live-preview-open.png'), fullPage: false });
  console.log('Screenshot 2: after Live Preview click');
  console.log('Done. Screenshots saved to', outDir);

  await browser.close();
})();

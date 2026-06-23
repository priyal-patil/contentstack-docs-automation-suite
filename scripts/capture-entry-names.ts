/**
 * One-off: capture entry titles from PriyalDocsStack entries list.
 * Navigates to Entries, clears any active filters, then lists first 20 titles.
 * Run: npx ts-node scripts/capture-entry-names.ts
 */
import { chromium } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const AUTH_FILE = path.resolve(__dirname, '../auth.json');
const BASE_URL = process.env.CS_BASE_URL || 'https://app.contentstack.com';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    storageState: AUTH_FILE,
  });
  const page = await context.newPage();

  // Navigate to stack — find the entries list from the left nav
  await page.goto(`${BASE_URL}/#!/stack`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click "Entries" in the left sidebar
  const entriesLink = page.locator('a:has-text("Entries"), [data-test-id="cs-nav-entries"]').first();
  if (await entriesLink.isVisible({ timeout: 5000 })) {
    await entriesLink.click();
    await page.waitForTimeout(2000);
  }

  // Clear all filters if present
  const clearAll = page.locator('a:has-text("Clear All Filters"), button:has-text("Clear All Filters")').first();
  if (await clearAll.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Filter active — clicking Clear All Filters');
    await clearAll.click();
    await page.waitForTimeout(2000);
  }

  // Capture entry titles
  const titleSelectors = [
    '[data-test-id^="cs-table-body-row-"] .title',
    '[data-test-id^="cs-table-body-row-"] a',
    '.Table__body__row .title',
    '.entries-table-row .entry-title',
    '[data-test-id="entry-title"]',
  ];

  let titles: string[] = [];
  for (const sel of titleSelectors) {
    const els = await page.locator(sel).allTextContents();
    if (els.length > 0) {
      titles = els.map(t => t.trim()).filter(Boolean).slice(0, 20);
      console.log(`Found ${titles.length} titles with selector: ${sel}`);
      break;
    }
  }

  if (titles.length === 0) {
    // Screenshot fallback
    await page.screenshot({ path: 'data/dom/CMS/entries/entries-with-clear.png', fullPage: true });
    // Try page text
    const body = await page.locator('body').textContent();
    console.log('No titles found. Page text snippet:\n', body?.slice(0, 1000));
  } else {
    console.log('\nEntry titles:');
    titles.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));

    // Find common 4-char substrings
    const freq: Record<string, number> = {};
    for (const t of titles) {
      for (let i = 0; i <= t.length - 4; i++) {
        const sub = t.slice(i, i + 4).toLowerCase();
        if (/^[a-z]{4}$/.test(sub)) {
          freq[sub] = (freq[sub] || 0) + 1;
        }
      }
    }
    const ranked = Object.entries(freq)
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    console.log('\nTop 4-char substrings (appearing in ≥2 entries):');
    ranked.forEach(([k, c]) => console.log(`  "${k}" — ${c}x`));
  }

  await browser.close();
})();

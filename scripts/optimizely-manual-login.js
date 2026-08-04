// One-off helper: opens a REAL, VISIBLE Chromium window on this machine so the
// user can log into Optimizely themselves. Claude never sees or types the
// password. After the user clicks "Resume" in the Playwright Inspector,
// this script saves the authenticated session (cookies/localStorage) to
// optimizely-auth.json for reuse, then takes a screenshot so progress can be
// confirmed without asking the user to paste anything sensitive.
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://app.optimizely.com/signin', { waitUntil: 'domcontentloaded' });

  console.log('\n=================================================================');
  console.log(' A real Chrome window should now be open on THIS screen.');
  console.log(' Please log in to Optimizely there with your own credentials.');
  console.log(' Once you land on your Optimizely dashboard, click "Resume"');
  console.log(' in the Playwright Inspector window to continue.');
  console.log('=================================================================\n');

  await page.pause();

  // Repo root (this file lives in scripts/) — matches OPTIMIZELY_AUTH_FILE default in actionRules.ts.
  const outDir = path.resolve(__dirname, '..');
  await context.storageState({ path: path.join(outDir, 'optimizely-auth.json') });
  await page.screenshot({ path: path.join(outDir, 'optimizely-after-login.png'), fullPage: true });
  console.log('Current URL after resume:', page.url());
  console.log('Saved session to optimizely-auth.json and screenshot to optimizely-after-login.png');

  await browser.close();
})();

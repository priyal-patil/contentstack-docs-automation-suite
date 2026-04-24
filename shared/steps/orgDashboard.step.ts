import { Page, expect } from "@playwright/test";
import { appUrl } from "../../core/env";

const LAUNCH_TILE = '[data-test-id="cs-global-dashboard-product-tile-launch"]';

/**
 * Open the organization **global product dashboard** (Headless CMS, Launch, … tiles).
 * DOM: `data/dom/Launch/common/dashboard-launch.html` — Launch tile `cs-global-dashboard-product-tile-launch`.
 *
 * Contrast with `login.step.ts`, which often ends on `#!/stacks` (stack list, no product tiles).
 *
 * Waits generously for slow loads: network settle, Launch tile visible, then optional buffer (`CS_ORG_DASHBOARD_SETTLE_MS`, default 4000 ms).
 */
export async function orgDashboardStep(page: Page) {
  await page.goto(appUrl("/#!/dashboard"), { waitUntil: "domcontentloaded", timeout: 120_000 });
  await page.waitForLoadState("networkidle", { timeout: 90_000 }).catch(() => {});
  await expect(page).toHaveURL(/#!\/(dashboard|launch)/i, { timeout: 90_000 });
  // Some orgs redirect the hash to #!/launch first; force the global product dashboard so Launch tile is present.
  if (/\/#!\/launch/i.test(page.url())) {
    await page.goto(appUrl("/#!/dashboard"), { waitUntil: "domcontentloaded", timeout: 120_000 });
    await page.waitForLoadState("networkidle", { timeout: 90_000 }).catch(() => {});
    await expect(page).toHaveURL(/#!\/dashboard/i, { timeout: 90_000 });
  }

  const launchTile = page.locator(LAUNCH_TILE).first();
  await expect(launchTile).toBeVisible({ timeout: 120_000 });

  const settleMs = Math.min(60_000, Math.max(0, Number(process.env.CS_ORG_DASHBOARD_SETTLE_MS || 4000) || 4000));
  if (settleMs > 0) {
    await page.waitForTimeout(settleMs);
  }
}

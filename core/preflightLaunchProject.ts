/**
 * Before Launch flows that click "Launch first project card (doc step)", ensure the Projects list has
 * at least one project. If not, runs a prerequisite flow (e.g. import-project-using-github) to create one.
 * Avoids flows silently landing on whichever project another flow just created (list sorts newest-first).
 * Leaves the page back on the org dashboard either way, since the calling flow's own leading steps
 * (verify/click "Launch dashboard entry") expect to start from there.
 *
 * If the org has hit its Launch "Projects Limit Reached" cap while creating the prerequisite project,
 * deletes the 5 oldest project cards to free up quota, then retries once.
 */
import { Page, expect } from "@playwright/test";
import { loadFlowById } from "./flowDiscovery";
import { orgDashboardStep } from "../shared/steps/orgDashboard.step";

const LAUNCH_TILE = '[data-test-id="cs-global-dashboard-product-tile-launch"]';

async function goToLaunchProjectsPage(page: Page): Promise<void> {
  await orgDashboardStep(page);
  const tile = page.locator(LAUNCH_TILE).first();
  await tile.waitFor({ state: "visible", timeout: 30_000 });
  await tile.click({ timeout: 30_000 });
  await page.waitForURL(/#!\/launch/i, { timeout: 30_000 }).catch(() => {});
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 30_000 }).catch(() => {});
}

async function launchProjectsListHasProjectCard(page: Page): Promise<boolean> {
  await goToLaunchProjectsPage(page);
  const card = page.locator('[data-testid^="project-settings-"]').first();
  // isVisible() does not poll (its timeout option is deprecated/ignored) — use expect(...).toBeVisible() to wait.
  try {
    await expect(card).toBeVisible({ timeout: 30_000 });
    return true;
  } catch {
    return false;
  }
}

async function isProjectsLimitReachedModalVisible(page: Page): Promise<boolean> {
  const modal = page.getByRole("dialog").filter({ hasText: /Projects Limit Reached/i }).first();
  try {
    await expect(modal).toBeVisible({ timeout: 5_000 });
    return true;
  } catch {
    return false;
  }
}

/** Cards sort newest-first — delete from the end so freshly created projects survive. */
async function deleteOldestLaunchProjects(page: Page, count: number): Promise<void> {
  for (let i = 0; i < count; i++) {
    await goToLaunchProjectsPage(page);
    const cards = page.locator('[data-testid^="project-settings-"]');
    const n = await cards.count();
    if (n === 0) return;
    const card = cards.nth(n - 1);
    await expect(card).toBeVisible({ timeout: 30_000 });
    await card.click({ timeout: 30_000 });
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await page.waitForTimeout(800);

    const settingsBtn = page.locator('[data-test-id="launch-nav-settings"]').first();
    await expect(settingsBtn).toBeVisible({ timeout: 30_000 });
    await settingsBtn.click({ timeout: 30_000 });
    await page.waitForTimeout(600);

    const deleteSection = page.locator('[data-testid="delete-project-section"]').first();
    await expect(deleteSection).toBeVisible({ timeout: 30_000 });
    await deleteSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const deleteBtn = page.locator('[data-testid="delete-project-button"]').first();
    await deleteBtn.scrollIntoViewIfNeeded().catch(() => {});
    await expect(deleteBtn).toBeVisible({ timeout: 30_000 });
    await deleteBtn.click({ timeout: 30_000 });
    await page.waitForTimeout(500);

    const dlg = page.getByRole("dialog").last();
    await expect(dlg).toBeVisible({ timeout: 30_000 });
    let confirmInput = dlg.locator('input[placeholder*="DELETE" i], input[aria-label*="DELETE" i]').first();
    if (!(await confirmInput.isVisible().catch(() => false))) {
      confirmInput = dlg.locator('input[type="text"]:not([readonly]), input:not([type])').first();
    }
    await expect(confirmInput).toBeVisible({ timeout: 30_000 });
    await confirmInput.click({ timeout: 30_000 }).catch(() => {});
    await confirmInput.fill("");
    await confirmInput.fill("DELETE");
    await confirmInput.dispatchEvent("input").catch(() => {});
    await confirmInput.blur().catch(() => {});
    await page.waitForTimeout(400);

    const confirmBtn = dlg.locator('[data-testid="delete-project-button"]').last();
    await expect(confirmBtn).toBeVisible({ timeout: 30_000 });
    await confirmBtn.click({ timeout: 30_000 });
    await page.waitForTimeout(1_500);
  }
}

export async function ensureLaunchProjectExists(page: Page, createFlowId: string): Promise<void> {
  const id = createFlowId.trim();
  if (!id) return;

  const hasProject = await launchProjectsListHasProjectCard(page);
  if (hasProject) {
    console.log("ℹ️ Preflight: Launch Projects already has a project card; skipping prerequisite create flow.");
    await orgDashboardStep(page);
    return;
  }

  console.log(`ℹ️ Preflight: Launch Projects has no project cards; running prerequisite flow "${id}" to create one, then continuing.`);
  const nested = loadFlowById(id);
  if (!nested) throw new Error(`Preflight: prerequisite flow not found: ${id}`);

  const { executeFlow } = await import("./executor");
  await orgDashboardStep(page);
  try {
    await executeFlow(page, { ...nested, use: [] });
  } catch (err) {
    if (!(await isProjectsLimitReachedModalVisible(page))) throw err;
    console.warn(
      "⚠️ Preflight: Launch Projects limit reached while creating a prerequisite project — deleting 5 existing projects to free up quota, then retrying."
    );
    const closeBtn = page
      .getByRole("dialog")
      .filter({ hasText: /Projects Limit Reached/i })
      .locator('button:has-text("Close"), [aria-label="Close"]')
      .first();
    await closeBtn.click({ timeout: 10_000 }).catch(() => {});
    await deleteOldestLaunchProjects(page, 5);
    await orgDashboardStep(page);
    await executeFlow(page, { ...nested, use: [] });
  }
  console.log(`✅ Preflight: finished "${id}". Continuing primary flow.`);
  await orgDashboardStep(page);
}

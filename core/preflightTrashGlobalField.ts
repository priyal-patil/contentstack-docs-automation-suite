/**
 * Before "restore deleted global field", ensure Trash → Global Fields has at least one row.
 * If empty, runs another flow (e.g. delete-a-global-field) so a deleted global field appears in Trash.
 */
import { Page } from "@playwright/test";
import { CLICK_SELECTORS } from "../projects/CMS/trash/selectors/module.selectors";
import { loadFlowById } from "./flowDiscovery";

async function navigateToTrashGlobalFieldsTab(page: Page): Promise<void> {
  const t = 60_000;
  const moreSel =
    '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), button[aria-label*="more" i]';
  const more = page.locator(moreSel).first();
  if (await more.isVisible().catch(() => false)) {
    await more.click({ timeout: 10_000, force: true }).catch(() => {});
    await page.waitForTimeout(300);
  }
  const settingsSel = CLICK_SELECTORS["Settings (doc step)"];
  await page.locator(settingsSel).first().click({ timeout: t, force: true });
  await page.waitForTimeout(350);
  const trashSel = CLICK_SELECTORS["Trash in settings left nav (doc step)"];
  await page.locator(trashSel).first().click({ timeout: t, force: true });
  await page.waitForTimeout(500);
  const tabSel = CLICK_SELECTORS["Trash Global Fields tab (doc step)"];
  await page.locator(tabSel).first().click({ timeout: t, force: true });
  await page.waitForTimeout(600);
  await page.locator(".trash-global-fields").first().waitFor({ state: "visible", timeout: t }).catch(() => {});
}

async function trashGlobalFieldsListingHasDataRows(page: Page): Promise<boolean> {
  await navigateToTrashGlobalFieldsTab(page);
  const dataRows = page.locator('.trash-global-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
  const n = await dataRows.count().catch(() => 0);
  return n > 0;
}

export async function ensureTrashHasDeletedGlobalFieldIfNeeded(page: Page, deleteFlowId: string): Promise<void> {
  const id = deleteFlowId.trim();
  if (!id) return;

  const hasRows = await trashGlobalFieldsListingHasDataRows(page);
  if (hasRows) {
    console.log("ℹ️ Preflight: Trash → Global Fields already lists deleted global field row(s); skipping prerequisite flow.");
    return;
  }

  console.log(`ℹ️ Preflight: Trash → Global Fields has no data rows; running prerequisite flow "${id}" (delete a global field), then continuing.`);
  const nested = loadFlowById(id);
  if (!nested) throw new Error(`Preflight: prerequisite flow not found: ${id}`);

  const { executeFlow } = await import("./executor");
  await executeFlow(page, { ...nested, use: [] });
  console.log(`✅ Preflight: finished "${id}". Continuing primary flow.`);
}

/**
 * Preflight for Trash → Assets tab: ensure a deleted **asset folder** or **file asset** row exists
 * before restore flows, by running delete-a-folder or delete-an-asset when the listing is empty
 * for that row kind.
 */
import { Locator, Page } from "@playwright/test";
import { CLICK_SELECTORS } from "../projects/CMS/trash/selectors/module.selectors";
import { loadFlowById } from "./flowDiscovery";

async function navigateToTrashAssetsTab(page: Page): Promise<void> {
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
  const tabSel = CLICK_SELECTORS["Trash Assets tab (doc step)"];
  await page.locator(tabSel).first().click({ timeout: t, force: true });
  await page.waitForTimeout(600);
  await page.locator(".trash-assets").first().waitFor({ state: "visible", timeout: t }).catch(() => {});
}

/** Heuristic: folder row (href, folder icon, or non-file size in Size column). */
export async function rowIsTrashAssetFolder(row: Locator): Promise<boolean> {
  const href = await row.locator("a[href]").first().getAttribute("href").catch(() => "");
  if (/\/folders\//i.test(href || "")) return true;
  const hasFolderIcon = await row
    .locator(
      '[data-test-id="cs-trash-asset-title"] svg[name="Folder"], svg[name="Folder"], svg[name="FolderSimple"], svg[name="FolderSimplePlus"]'
    )
    .first()
    .isVisible()
    .catch(() => false);
  if (hasFolderIcon) return true;
  const size = await row.locator('[data-test-id="cs-trash-asset-size"]').first().innerText().catch(() => "");
  const t = (size || "").trim();
  if (/^[—–\-]+$/.test(t)) return true;
  if (/^0\s+items?$/i.test(t)) return true;
  return false;
}

/** Heuristic: file asset row (has byte/KB/MB size; not classified as folder). */
export async function rowIsTrashFileAsset(row: Locator): Promise<boolean> {
  if (await rowIsTrashAssetFolder(row)) return false;
  const size = await row.locator('[data-test-id="cs-trash-asset-size"]').first().innerText().catch(() => "");
  const t = (size || "").trim();
  return !!(t && /\d/.test(t) && /bytes|kb|mb|gb/i.test(t));
}

async function countTrashAssetRowsMatching(page: Page, predicate: (row: Locator) => Promise<boolean>): Promise<number> {
  await navigateToTrashAssetsTab(page);
  const dataRows = page.locator('.trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
  const pollUntil = Date.now() + 90_000;
  let n = 0;
  while (Date.now() < pollUntil) {
    n = await dataRows.count().catch(() => 0);
    if (n > 0) break;
    const loading = page.locator(
      ".trash-assets .Spinner, .trash-assets [class*='Spinner'], .trash-assets .ListLoader, .trash-assets [data-test-id*='loading' i]"
    );
    if (await loading.first().isVisible().catch(() => false)) {
      await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
    }
    await page.waitForTimeout(400);
  }
  if (n === 0) return 0;
  let match = 0;
  for (let i = 0; i < n; i++) {
    const row = dataRows.nth(i);
    if (await predicate(row)) match++;
  }
  return match;
}

export async function ensureTrashHasDeletedAssetFolderIfNeeded(page: Page, deleteFlowId: string): Promise<void> {
  const id = deleteFlowId.trim();
  if (!id) return;

  const count = await countTrashAssetRowsMatching(page, rowIsTrashAssetFolder);
  if (count > 0) {
    console.log("ℹ️ Preflight: Trash → Assets already lists deleted folder row(s); skipping prerequisite flow.");
    return;
  }

  console.log(`ℹ️ Preflight: Trash → Assets has no deleted folder rows; running prerequisite flow "${id}", then continuing.`);
  const nested = loadFlowById(id);
  if (!nested) throw new Error(`Preflight: prerequisite flow not found: ${id}`);
  const { executeFlow } = await import("./executor");
  await executeFlow(page, { ...nested, use: [] });
  console.log(`✅ Preflight: finished "${id}". Continuing primary flow.`);
}

export async function ensureTrashHasDeletedFileAssetIfNeeded(page: Page, deleteFlowId: string): Promise<void> {
  const id = deleteFlowId.trim();
  if (!id) return;

  const count = await countTrashAssetRowsMatching(page, rowIsTrashFileAsset);
  if (count > 0) {
    console.log("ℹ️ Preflight: Trash → Assets already lists deleted file asset row(s); skipping prerequisite flow.");
    return;
  }

  console.log(`ℹ️ Preflight: Trash → Assets has no deleted file asset rows; running prerequisite flow "${id}", then continuing.`);
  const nested = loadFlowById(id);
  if (!nested) throw new Error(`Preflight: prerequisite flow not found: ${id}`);
  const { executeFlow } = await import("./executor");
  await executeFlow(page, { ...nested, use: [] });
  console.log(`✅ Preflight: finished "${id}". Continuing primary flow.`);
}

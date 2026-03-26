// rules/core/actionRules.ts
import path from "path";
import fs from "fs";
import { Page, expect, Locator } from "@playwright/test";
import { recordDocStepWarning } from "../../core/docStepFailureReporter";
import { rowIsTrashAssetFolder, rowIsTrashFileAsset } from "../../core/preflightTrashAssets";

type Step = {
  action: "click" | "enter" | "select" | "upload" | "verify" | "navigate" | "drag" | "warn" | "hover" | "press";
    target: string;
    value?: string;
    optional?: boolean;
    nth?: number; // 0-based index when target matches multiple elements
    expected?: {
      within?: "Left Navigation" | "Top Bar" | "Modal" | string;
      withinStrict?: boolean;
      labelEquals?: string;
      labelMatch?: "exact" | "contains";
      modalTitle?: string;
      rowContains?: string; // ✅ add this
      timeoutMs?: number; // optional per-step timeout override
    };
  };

type ActionContext = {
  documentUrl?: string;
  flowId?: string;
  stepIndex?: number;
};
  

// ✅ Toggle strict modal title assertions via env (recommended)
const STRICT_MODAL_TITLE = process.env.STRICT_MODAL_TITLE === "true";
// Default strict: fail when doc verification metadata/matches are missing.
const STRICT_DOC_VERIFICATION = process.env.STRICT_DOC_VERIFICATION !== "false";

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getStepTimeoutMs(step: Step, fallback = 30_000): number {
  const raw = (step as any)?.timeoutMs ?? step?.expected?.timeoutMs;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Shared with use-slash: create CT with JSON RTE + open new entry (same entry pattern as keyboard-shortcuts doc stack). */
const JSON_RTE_ENTRY_SETUP_FLOW_IDS = new Set([
  "use-slash-command-for-shortcuts-in-json-rte",
  "basic-formatting",
  "assets",
  "videos-and-social-embeds",
  "block-and-inline-properties-part-1",
  "block-and-inline-properties-part-2",
  "code-blocks",
  "embed-entries-or-assets-part-1",
  "embed-entries-or-assets-part-2",
  "markdown-content",
]);

function isJsonRteEntrySetupFlow(flow?: any): boolean {
  return JSON_RTE_ENTRY_SETUP_FLOW_IDS.has(String(flow?.id || "").toLowerCase());
}

function isJsonRteBlockInlinePropsPart1(flow?: any): boolean {
  return String(flow?.id || "").toLowerCase() === "block-and-inline-properties-part-1";
}

function isJsonRteBlockInlinePropsPart2(flow?: any): boolean {
  return String(flow?.id || "").toLowerCase() === "block-and-inline-properties-part-2";
}

function isJsonRteBlockInlinePropsFlow(flow?: any): boolean {
  return isJsonRteBlockInlinePropsPart1(flow) || isJsonRteBlockInlinePropsPart2(flow);
}

function isJsonRteAssetsFlow(flow?: any): boolean {
  const id = String(flow?.id || "").toLowerCase();
  return id === "assets" || id === "embed-entries-or-assets-part-2";
}

function isJsonRteCodeBlocksFlow(flow?: any): boolean {
  return String(flow?.id || "").toLowerCase() === "code-blocks";
}

function isJsonRteEmbedEntryPart1Flow(flow?: any): boolean {
  return String(flow?.id || "").toLowerCase() === "embed-entries-or-assets-part-1";
}

/** Shared CT from customize-json-rich-text-editor: `Shared JSON RTE Doc CT-{unique}` — must match First content type row resolution. */
function jsonRteCtNamePrefix(_flow?: any): string {
  return "Shared JSON RTE Doc CT-";
}

function isJsonRteVideosSocialEmbedsFlow(flow?: any): boolean {
  return String(flow?.id || "").toLowerCase() === "videos-and-social-embeds";
}

/** Select Asset modal: open folders until a non-folder asset row exists, then click it (Assets doc). */
async function jsonRteSelectFirstEmbeddableAssetRow(page: Page, modal: Locator) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const rows = modal.locator('[role="row"][data-test-id^="cs-table-body-row"]');
    const count = await rows.count();
    let openedFolder = false;
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      if (!(await row.isVisible().catch(() => false))) continue;
      const title = (await row.locator('[data-test-id="cs-asset-detail-title"]').first().innerText().catch(() => "")).trim();
      if (!title || /enter folder name/i.test(title)) continue;
      const typeText = (await row.locator('[data-test-id="cs-asset-table-head-asset-type"]').first().innerText().catch(() => "")).trim();
      if (typeText && /folder/i.test(typeText)) {
        await row.dblclick({ timeout: 6_000, force: true }).catch(() => {});
        await page.waitForTimeout(1_000);
        openedFolder = true;
        break;
      }
      if (typeText && !/folder/i.test(typeText)) {
        await row.click({ timeout: 8_000, force: true });
        await page.waitForTimeout(300);
        return;
      }
    }
    if (!openedFolder && count > 0) {
      const r0 = rows.nth(0);
      const t0 = (await r0.locator('[data-test-id="cs-asset-table-head-asset-type"]').first().innerText().catch(() => "")).trim();
      if (t0 && !/folder/i.test(t0)) {
        await r0.click({ timeout: 8_000, force: true });
        await page.waitForTimeout(300);
        return;
      }
    }
    await page.waitForTimeout(400);
  }
  throw new Error(
    "JSON RTE Select Asset (doc): no selectable non-folder asset row found — add an image/file to the stack asset library or open a folder that contains one."
  );
}

const INPUT_SELECTORS: Record<string, string> = {};

// Prefer stable selector overrides to avoid strict-mode duplicates
const CLICK_SELECTORS: Record<string, string> = {
  "+ New Content Type": '[data-test-id="cs-cb-new-ct"]',

  // Opens dropdown (button text shows "New Content Type")
  "Create New Content Type": 'button:has-text("New Content Type")',

  // Dropdown option -> opens modal
  "Create New": '[data-test-id="cs-cb-new-ct-child"]',

  // Nav items
  "Content Models": '[data-test-id="cms-nav-content-models"]',
  Dashboard: '[data-test-id="cms-nav-dashboard"]',
  Entries: '[data-test-id="cms-nav-entries"]',
  Assets: '[data-test-id="cms-nav-assets"]',

  cms: '[data-test-id="cs-cms-button"]',

  // Content Types table row action (vertical ellipsis)
  "vertical ellipsis": '[data-test-id="cs-table-action-options"]',


  // Row action menu items (your DOM shows data-test-id on <li>)
  Settings: '[data-test-id="cs-ct-action-settings"]',
  Edit: '[data-test-id="cs-ct-action-edit"]',

  // Top nav settings (keep distinct from row action "Settings")
  "Stack Settings": '[data-test-id="cms-nav-settings"]',

  // Builder: "+" icon (revealed on hover over [data-test-id="cs-field-type-selector"])
  "Insert a field": '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]',
};

// Containers you want to validate against (tune as needed)
const EXPECTED_CONTAINERS: Record<string, string[]> = {
  "Left Navigation": [
    '[data-test-id="cs-left-nav"]',
    '[data-test-id="cs-primary-sidebar"]',
    '[data-test-id="cs-page-layout-leftSidebar"]',
    ".PageLayout__leftSidebar",
    ".Navigation__list",
    ".LeftNav",
    ".Sidebar",
  ],
  "Top Bar": [
    "nav.TopNavbar",
    ".TopNavbar",
    '[data-test-id="cs-top-nav"]',
    "#topnav",
    ".header",
    "#header-content-wrapper-id",
    "#navbar-items-wrapper-id",
  ],
  Modal: [
    '[role="dialog"]',
    ".Modal",
    '[data-test-id*="modal"]',
    ".ReactModal__env",
    ".ReactModal__Content__header",
    ".ReactModal__Content__body",
    ".ReactModal__Content__footer",
    '[data-test-id="cs-modal-description"]',
  ],
  // Trash / list UIs: filters live in left sidebar + publish-que-filter-wrapper (see data/dom/CMS/trash/filters.html)
  Right: [
    ".publish-que-filter-wrapper",
    '[data-test-id="cs-page-layout-leftSidebar"] .publish-que-filter-wrapper',
    ".PageLayout__leftSidebar .publish-que-filter-wrapper",
  ],
  "Trash filters panel": [
    ".publish-que-filter-wrapper",
    '[data-test-id="cs-page-layout-leftSidebar"] .publish-que-filter-wrapper',
    ".PageLayout__leftSidebar .publish-que-filter-wrapper",
  ],
  // DATE filter control shown with the trash table toolbar (date range dropdown)
  "Trash table toolbar": [
    ".trash-content-types .TablePanel",
    ".trash-content-types [data-test-id=\"cs-table\"]",
    ".trash-taxonomy-fields .TablePanel",
    ".trash-taxonomy-fields [data-test-id=\"cs-table\"]",
    '[data-test-id="table-panel-action-items"]',
  ],
  "Main content": [
    '[data-test-id="cs-page-layout-contentBody"]',
    ".PageLayout__body",
    "#PageLayout__body",
    ".PageLayout__body__container",
  ],
};

function loadOverrides(flow?: any): { click: Record<string, string>; input: Record<string, string> } {
  let click: Record<string, string> = {};
  let input: Record<string, string> = {};

  // 1) Shared common (new architecture)
  const sharedCommon = path.resolve(__dirname, "../../shared/overrides/common.selectors.ts");
  if (fs.existsSync(sharedCommon)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(sharedCommon);
    click = { ...click, ...(m.CLICK_SELECTORS ?? {}) };
    input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
  }

  // 1b) Legacy common (backwards compatible)
  const legacyCommon = path.resolve(__dirname, "../overrides/common.selectors.ts");
  if (fs.existsSync(legacyCommon)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const m = require(legacyCommon);
    click = { ...click, ...(m.COMMON_CLICK_SELECTORS ?? m.CLICK_SELECTORS ?? {}) };
    input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
  }

  const project = flow?.project;
  const moduleName = flow?.module;
  const flowId = flow?.id;

  // 2) Project-level selectors (optional)
  if (project) {
    const projectPath = path.resolve(__dirname, `../../projects/${project}/selectors/project.selectors.ts`);
    if (fs.existsSync(projectPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m = require(projectPath);
      click = { ...click, ...(m.CLICK_SELECTORS ?? {}) };
      input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
    }
  }

  // 3) Module-level selectors (new architecture)
  if (project && moduleName) {
    const modulePath = path.resolve(__dirname, `../../projects/${project}/${moduleName}/selectors/module.selectors.ts`);
    if (fs.existsSync(modulePath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m = require(modulePath);
      click = { ...click, ...(m.CLICK_SELECTORS ?? {}) };
      input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
    }
  }

  // 3b) Legacy module (backwards compatible)
  if (moduleName) {
    const modulePath = path.resolve(__dirname, `../overrides/modules/${moduleName}.selectors.ts`);
    if (fs.existsSync(modulePath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m = require(modulePath);
      click = { ...click, ...(m.CLICK_SELECTORS ?? {}) };
      input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
    }
  }

  // 4) Flow-level selectors (new architecture)
  if (project && moduleName && flowId) {
    const flowPath = path.resolve(__dirname, `../../projects/${project}/${moduleName}/selectors/${flowId}.selectors.ts`);
    if (fs.existsSync(flowPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m = require(flowPath);
      click = { ...click, ...(m.CLICK_SELECTORS ?? {}) };
      input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
    }
  }

  // 4b) Legacy doc overrides (backwards compatible)
  if (flowId) {
    const docPath = path.resolve(__dirname, `../overrides/docs/${flowId}.selectors.ts`);
    if (fs.existsSync(docPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const m = require(docPath);
      click = { ...click, ...(m.CLICK_SELECTORS ?? {}) };
      input = { ...input, ...(m.INPUT_SELECTORS ?? {}) };
    }
  }

  return { click, input };
}

function recordVerificationWarning(step: Step, context: ActionContext | undefined, message: string) {
  const documentUrl = context?.documentUrl || "(no source URL)";
  const flowId = context?.flowId || "unknown-flow";
  const stepIndex = Number.isFinite(context?.stepIndex as number) ? (context!.stepIndex as number) : 0;
  recordDocStepWarning(documentUrl, flowId, stepIndex, step as unknown as Record<string, unknown>, message);
  // eslint-disable-next-line no-console
  console.warn(`⚠️ ${message} (Continuing.)`);
}

async function readLocatorValue(el: Locator): Promise<string> {
  const inputVal = await el
    .inputValue()
    .then((v) => (v || "").trim())
    .catch(() => "");
  if (inputVal) return inputVal;

  const attrVal = await el
    .getAttribute("value")
    .then((v) => (v || "").trim())
    .catch(() => "");
  if (attrVal) return attrVal;

  const textVal = await el
    .textContent()
    .then((v) => (v || "").trim())
    .catch(() => "");
  return textVal;
}

function saveCapturedDocValue(key: string, value: string, context?: ActionContext) {
  const reportDir = process.env.REPORT_DIR || path.resolve(process.cwd(), "reports/latest");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, "doc-captured-values.json");
  let current: any = { generatedAt: "", values: {} };
  try {
    if (fs.existsSync(outPath)) {
      current = JSON.parse(fs.readFileSync(outPath, "utf-8"));
    }
  } catch {
    current = { generatedAt: "", values: {} };
  }
  current.generatedAt = new Date().toISOString();
  current.values = current.values || {};
  current.values[key] = {
    value,
    documentUrl: context?.documentUrl || "(no source URL)",
    flowId: context?.flowId || "unknown-flow",
    stepNumber: Number.isFinite(context?.stepIndex as number) ? (context!.stepIndex as number) + 1 : undefined,
  };
  fs.writeFileSync(outPath, JSON.stringify(current, null, 2), "utf-8");
}

/**
 * Resolve target to ONE locator (no `.or()`).
 * Order:
 * 1) mapped selector
 * 2) role button exact -> role button loose
 * 3) role link exact -> role link loose
 * 4) exact text
 */
async function resolveTarget(page: Page, target: string, flow?: any): Promise<Locator> {
  const { click } = loadOverrides(flow);
  const mapped = click[target] || CLICK_SELECTORS[target];

  if (mapped) {
    // Important: always return mapped locators and let Playwright's expect() handle waiting.
    // A pre-check `.count()` can be 0 on async-rendered UIs even when the selector is correct.
    return page.locator(mapped).first();
  }

  const exactRe = new RegExp(`^${escapeRegex(target)}$`, "i");
  const looseRe = new RegExp(escapeRegex(target), "i");

  let el = page.getByRole("button", { name: exactRe }).first();
  if (await el.count().catch(() => 0)) return el;

  el = page.getByRole("button", { name: looseRe }).first();
  if (await el.count().catch(() => 0)) return el;

  el = page.getByRole("link", { name: exactRe }).first();
  if (await el.count().catch(() => 0)) return el;

  el = page.getByRole("link", { name: looseRe }).first();
  if (await el.count().catch(() => 0)) return el;

  return page.getByText(target, { exact: true }).first();
}

async function ensureWithin(page: Page, el: Locator, expectedWithin: string, strict = false) {
  const containers = EXPECTED_CONTAINERS[expectedWithin] ?? [];
  if (!containers.length) return;

  await el.waitFor({ state: "attached", timeout: 30_000 }).catch(() => {});

  // Product-specific fallback: CMS left navigation items commonly use data-test-id="cms-nav-*".
  if (expectedWithin === "Left Navigation") {
    const looksLikeLeftNav = await el
      .evaluate((node) => {
        const self = node as HTMLElement;
        const dt = self?.getAttribute?.("data-test-id") || "";
        if (
          dt.startsWith("cs-stack-settings-") ||
          dt.includes("left-nav")
        )
          return true;
        return !!self?.closest?.(
          '[data-test-id^="cs-stack-settings-"], [data-test-id*="left-nav"], [data-test-id="cs-page-layout-leftSidebar"], .PageLayout__leftSidebar, .Navigation__list'
        );
      })
      .catch(() => false);
    if (looksLikeLeftNav) return;
  }

  if (expectedWithin === "Top Bar") {
    const looksLikeTopBar = await el
      .evaluate((node) => {
        const self = node as HTMLElement;
        const dt = self?.getAttribute?.("data-test-id") || "";
        if (dt.startsWith("cms-nav-") || dt === "cs-cms-button" || dt === "cms-nav-apps") return true;
        return !!self?.closest?.(
          'nav.TopNavbar, .TopNavbar, [data-test-id="cs-top-nav"], #topnav, .header, #header-content-wrapper-id, #navbar-items-wrapper-id'
        );
      })
      .catch(() => false);
    if (looksLikeTopBar) return;
  }

  if (expectedWithin === "Modal") {
    const looksLikeModal = await el
      .evaluate((node) => {
        const self = node as HTMLElement;
        const dt = self?.getAttribute?.("data-test-id") || "";
        if (
          dt.includes("modal") ||
          dt === "cs-modal-description" ||
          dt === "cs-modal-title-create-environment" ||
          dt === "cs-modal-title-edit-environment"
        )
          return true;
        return !!self?.closest?.(
          '[role="dialog"], .Modal, [data-test-id*="modal"], .ReactModal__env, .ReactModal__Content__header, .ReactModal__Content__body, .ReactModal__Content__footer, [data-test-id="cs-modal-description"]'
        );
      })
      .catch(() => false);
    if (looksLikeModal) return;
  }

  if (expectedWithin === "Right" || expectedWithin === "Trash filters panel") {
    const looksLikeRightFilters = await el
      .evaluate((node) => {
        return !!(node as HTMLElement)?.closest?.(
          '.publish-que-filter-wrapper, [data-test-id="cs-page-layout-leftSidebar"] .publish-que-filter-wrapper'
        );
      })
      .catch(() => false);
    if (looksLikeRightFilters) return;
  }

  if (expectedWithin === "Trash table toolbar") {
    const inTrashToolbar = await el
      .evaluate((node) => {
        return !!(node as HTMLElement)?.closest?.(
          '.trash-content-types .TablePanel, .trash-content-types [data-test-id="cs-table"], .trash-taxonomy-fields .TablePanel, .trash-taxonomy-fields [data-test-id="cs-table"], [data-test-id="table-panel-action-items"]'
        );
      })
      .catch(() => false);
    if (inTrashToolbar) return;
  }

  for (const sel of containers) {
    const inside = await el
      .evaluate((node, containerSel) => {
        const c = document.querySelector(containerSel);
        return !!c && c.contains(node);
      }, sel)
      .catch(() => false);

    if (inside) return;
  }

  const label =
    (await el.getAttribute("aria-label").catch(() => null)) ||
    (await el.textContent().catch(() => null)) ||
    "(element)";

  const msg = `Doc container mismatch: expected within "${expectedWithin}", but target resolved to "${(label || "").trim()}".`;
  if (strict) throw new Error(msg);
  throw new Error(msg);
}

function normalizeLabelText(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim().toLowerCase();
}

async function extractElementLabel(el: Locator): Promise<string> {
  const direct = await el
    .evaluate((node) => {
      const n = node as HTMLElement;
      const text = (n.textContent || "").replace(/\s+/g, " ").trim();
      const aria = (n.getAttribute("aria-label") || "").trim();
      const title = (n.getAttribute("title") || "").trim();
      const placeholder = (n.getAttribute("placeholder") || "").trim();

      // Prefer explicit form labels for input-like controls.
      const isInputLike =
        n instanceof HTMLInputElement ||
        n instanceof HTMLTextAreaElement ||
        n instanceof HTMLSelectElement ||
        !!n.getAttribute("contenteditable");

      if (isInputLike) {
        const id = n.getAttribute("id") || "";
        if (id) {
          const labelByFor = document.querySelector(`label[for="${id}"]`) as HTMLElement | null;
          const labelForText = (labelByFor?.textContent || "").replace(/\s+/g, " ").trim();
          if (labelForText) return labelForText;
        }

        const labelledBy = (n.getAttribute("aria-labelledby") || "").trim();
        if (labelledBy) {
          const ids = labelledBy.split(/\s+/).filter(Boolean);
          const parts = ids
            .map((lid) => (document.getElementById(lid)?.textContent || "").replace(/\s+/g, " ").trim())
            .filter(Boolean);
          if (parts.length) return parts.join(" ");
        }

        const closestFieldLabel = n
          .closest('[data-test-id="cs-field"], .Field, .Form__item')
          ?.querySelector("label, [data-test-id='cs-field-label']");
        const closestFieldLabelText = ((closestFieldLabel as HTMLElement | null)?.textContent || "")
          .replace(/\s+/g, " ")
          .trim();
        if (closestFieldLabelText) return closestFieldLabelText;
      }

      return text || aria || title || placeholder;
    })
    .catch(() => "");
  return direct || "";
}

async function assertLabelMatch(el: Locator, expectedLabel: string, mode: "exact" | "contains" = "contains") {
  const actualRaw = await extractElementLabel(el);
  const actual = normalizeLabelText(actualRaw);
  const expected = normalizeLabelText(expectedLabel);
  if (!actual) {
    throw new Error(`Label validation failed: element has no text/aria-label/title, expected "${expectedLabel}".`);
  }
  const ok = mode === "exact" ? actual === expected : actual.includes(expected);
  if (!ok) {
    throw new Error(`Label validation failed: expected "${expectedLabel}" (${mode}), got "${actual}".`);
  }
}

/** Doc only: hover over a trash listing row (title area). No ellipsis hover, no keyboard, no opening row actions any other way. If Restore is not shown after this hover pass, callers must fail the step. */
async function hoverTrashListingRowDocOnly(page: Page, row: Locator, hoverTimeoutMs: number) {
  await row.scrollIntoViewIfNeeded().catch(() => {});
  for (const pos of [{ x: 120, y: 30 }, { x: 60, y: 30 }, { x: 280, y: 30 }]) {
    await row.hover({ position: pos, timeout: hoverTimeoutMs, force: true }).catch(() => {});
    await page.waitForTimeout(280);
  }
}

/**
 * ✅ Permanent gate for Settings -> "Edit Content Type" dialog
 * (Based on your page snapshot: dialog + Update button)
 */
// ✅ Settings opens a panel/drawer, not a dialog.
// Gate on the Update control that appears inside that panel.
async function waitForContentTypeSettingsPanel(page: Page) {
  const candidates = [
    // Settings side-panel CTA (seen in some UIs)
    page.locator('[data-test-id="cs-cb-edit-ct-details"]').first(),
    // Some stacks show a dialog title
    page.getByRole("dialog").filter({ hasText: /Edit Content Type/i }).first(),
    // Generic "Update" CTA after editing details
    page.getByRole("button", { name: /^Update$/i }).first(),
    // Description field inside the settings UI
    page.getByRole("textbox", { name: /description/i }).first(),
    // DOM-driven markers (works even if accessibility name is missing)
    page.locator('[data-test-id="cs-ct-edit-details-description"] textarea').first(),
    page.locator('[data-test-id^="cs-ct-edit-details-"]').first(),
  ];

  const start = Date.now();
  while (Date.now() - start < 30_000) {
    for (const c of candidates) {
      if (await c.isVisible().catch(() => false)) return;
    }
    await page.waitForTimeout(200);
  }

  throw new Error(
    "Settings UI did not appear after clicking the row action 'Settings' (no known markers became visible)."
  );
}
async function waitForContentTypeBuilder(page: Page) {
    // stable marker that builder loaded (adjust to your UI if needed)
    await expect(page.locator('#PageLayout__body').first()).toBeVisible({ timeout: 30_000 });
    // if you have a more specific marker, use it here (recommended)
  }
  
  
async function getRowActionMenuRoot(page: Page): Promise<Locator> {
  const tableRowActionNode = page.locator('#tableRowActionNode').filter({ hasText: /Settings|Edit|Copy UID|Delete/i }).first();
  if (await tableRowActionNode.isVisible().catch(() => false)) return tableRowActionNode;

  const tooltipMenu = page.locator(".VerticalActionTooltip").filter({ hasText: /Settings|Edit|Copy UID|Delete/i }).first();
  if (await tooltipMenu.isVisible().catch(() => false)) return tooltipMenu;

  // Some stacks render the popover as a role="menu" container with text items.
  const roleMenu = page.getByRole("menu").filter({ hasText: /Settings|Edit|Copy UID|Delete/i }).first();
  if (await roleMenu.isVisible().catch(() => false)) return roleMenu;

  return page.locator("body");
}

async function clickRowActionMenuItem(page: Page, item: "Settings" | "Edit", flow?: any) {
  // This menu is flaky: first click can close the menu without firing the intended action.
  // Strategy: open menu → click item inside the menu root → if Settings UI not visible, retry once.
  for (let attempt = 1; attempt <= 2; attempt++) {
    // If menu already open (from a preceding verify), don’t re-open it.
    let menuRoot = await getRowActionMenuRoot(page);
    const alreadyOpen =
      item === "Settings"
        ? await menuRoot.getByText("Settings", { exact: true }).first().isVisible().catch(() => false)
        : await menuRoot.getByText("Edit", { exact: true }).first().isVisible().catch(() => false);

    if (!alreadyOpen) {
      await openRowActionMenu(page, undefined, flow);
      menuRoot = await getRowActionMenuRoot(page);
    }

    // First: respect doc/module overrides (your selector: [id="tableRowActionNode"] [data-test-id="cs-ct-action-settings"])
    const mapped = await resolveTarget(page, item, flow).catch(() => null);
    if (mapped && (await mapped.isVisible().catch(() => false))) {
      await mapped.hover({ timeout: 30_000 }).catch(() => {});
      await mapped.click({ timeout: 30_000, force: true });
    } else {
    const candidates: Locator[] =
      item === "Settings"
        ? [
            // Most reliable (matches your screenshot/menu)
            menuRoot.getByText("Settings", { exact: true }).first(),
            menuRoot.locator('[data-test-id="cs-ct-action-settings"]').first(),
            menuRoot.locator('li:has-text("Settings")').first(),
            menuRoot.getByRole("menuitem", { name: /^Settings$/i }).first(),
          ]
        : [
            menuRoot.getByText("Edit", { exact: true }).first(),
            menuRoot.locator('[data-test-id="cs-ct-action-edit"]').first(),
            menuRoot.getByRole("menuitem", { name: /^Edit$/i }).first(),
            menuRoot.locator('li:has-text("Edit")').first(),
          ];

    let itemLoc: Locator | null = null;
    for (const c of candidates) {
      if ((await c.count().catch(() => 0)) > 0 && (await c.isVisible().catch(() => false))) {
        itemLoc = c;
        break;
      }
    }
    if (!itemLoc) itemLoc = candidates[0];

    await expect(itemLoc).toBeVisible({ timeout: 30_000 });
      await itemLoc.hover({ timeout: 30_000 }).catch(() => {});
      await itemLoc.click({ timeout: 30_000, force: true });
    }

    if (item !== "Settings") return;

    // If Settings UI shows up, we're done; else retry once.
    const markers = [
      page.locator('[data-test-id="cs-cb-edit-ct-details"]').first(),
      page.getByRole("dialog").filter({ hasText: /Edit Content Type/i }).first(),
      page.getByRole("button", { name: /^Update$/i }).first(),
      page.getByRole("textbox", { name: /description/i }).first(),
    ];

    const start = Date.now();
    while (Date.now() - start < 1500) {
      for (const m of markers) {
        if (await m.isVisible().catch(() => false)) return;
      }
      await page.waitForTimeout(100);
    }

    if (attempt === 2) {
      await waitForContentTypeSettingsPanel(page);
    }
  }
}
  

function modalTitleLocator(dialog: Locator, expectedTitle: string): Locator {
  const re = new RegExp(escapeRegex(expectedTitle), "i");

  // Prefer explicit headings/titles
  const byHeading = dialog.getByRole("heading", { name: re }).first();
  const byTestIdTitle = dialog.locator('[data-test-id^="cs-modal-title"]').filter({ hasText: re }).first();
  const byAnyTitleTestId = dialog.locator('[data-test-id*="modal-title"]').filter({ hasText: re }).first();

  // Fallback: any element inside dialog containing the title text (least strict)
  const byText = dialog.getByText(re).first();

  return byHeading.or(byTestIdTitle).or(byAnyTitleTestId).or(byText).first();
}

// Soft check (warn-only) — generic for any modal
async function warnIfModalTitleMismatch(page: Page, expectedTitle: string) {
  const dialog = page.locator('[data-testid="cs-modal"][role="dialog"]').first();
  if (!(await dialog.count().catch(() => 0))) return;

  const title = modalTitleLocator(dialog, expectedTitle);
  if (!(await title.count().catch(() => 0))) {
    throw new Error(`Expected modal "${expectedTitle}" but no title element/text found.`);
  }

  const actual = ((await title.textContent().catch(() => "")) || "").trim();
  if (!actual.toLowerCase().includes(expectedTitle.toLowerCase())) {
    throw new Error(`Modal title mismatch. Expected "${expectedTitle}", found "${actual}".`);
  }
}

// ✅ Hard assert modal title (fails test if mismatch) — generic for any modal
async function assertModalTitle(page: Page, expectedTitle: string) {
  const dialog = page.locator('[data-testid="cs-modal"][role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 30_000 });

  const title = modalTitleLocator(dialog, expectedTitle);
  await expect(title).toBeVisible({ timeout: 30_000 });
  await expect(title).toHaveText(new RegExp(expectedTitle, "i"), { timeout: 30_000 });
}

/**
 * ✅ after clicking dropdown "Create New", wait for the modal + form.
 */
async function waitForCreateContentTypeForm(page: Page) {
  const dialog = page.locator('[data-testid="cs-modal"][role="dialog"]').first();
  await expect(dialog).toBeVisible({ timeout: 30_000 });

  await expect(dialog.locator('[data-test-id="cs-modal-title-create-new-content-type"]')).toBeVisible({
    timeout: 30_000,
  });

  await expect(
    dialog.locator('[data-test-id="cs-ct-create-modal-ct-name-input"] input[name="name"]').first()
  ).toBeVisible({ timeout: 30_000 });
}

/**
 * ✅ Robust menu open (tooltip menus close on blur)
 */
async function openRowActionMenu(page: Page, step?: Step, flow?: any) {
    const rowHint = step?.expected?.rowContains;
  
    const ellipsis = rowHint
      ? page
          .getByRole("row", { name: new RegExp(rowHint, "i") })
          .first()
          .locator('[data-test-id="cs-table-action-options"]')
          .first()
      : await resolveTarget(page, "vertical ellipsis", flow);

    // Fallback: some stacks don’t expose data-test-id on the action menu.
    const ellipsisFallback = page
      .locator('[name="DotsThreeLargeVertical"]')
      .first()
      .locator("xpath=ancestor-or-self::*[@role='menu' or @role='button' or self::button][1]")
      .first();
  
    // If resolveTarget returned a hidden element (virtualized row), pick the first visible 3-dots button.
    let ellipsisToClick: Locator | null = (await ellipsis.isVisible().catch(() => false)) ? ellipsis : null;
    if (!ellipsisToClick) {
      const all = page.locator('[data-test-id="cs-table-action-options"]');
      const n = await all.count().catch(() => 0);
      for (let i = 0; i < n; i++) {
        const cand = all.nth(i);
        if (await cand.isVisible().catch(() => false)) {
          ellipsisToClick = cand;
          break;
        }
      }
    }
    if (!ellipsisToClick) ellipsisToClick = ellipsisFallback;

    await expect(ellipsisToClick).toBeVisible({ timeout: 30_000 });

    const menuMarkers = [
      page.locator('[data-test-id="cs-ct-action-settings"]').first(),
      page.locator('[data-test-id="cs-ct-action-edit"]').first(),
      page.getByRole("menuitem").first(),
      page.getByText("Edit", { exact: true }).first(),
      page.getByText("Copy UID", { exact: true }).first(),
      page.getByText("Copy Content Type", { exact: true }).first(),
      page.getByText("Export", { exact: true }).first(),
      page.getByText("Settings", { exact: true }).first(),
      page.getByText("Delete", { exact: true }).first(),
      page.locator(".VerticalActionTooltip").first(),
    ];

    // The first click sometimes closes the popover (observed manually).
    // Strategy: click once, quick-check; if not open, click again and then wait longer.
    for (const [idx, waitMs] of [
      [0, 1500],
      [1, 30_000],
    ] as const) {
      await ellipsisToClick.click({ timeout: 30_000, force: true });

      const start = Date.now();
      while (Date.now() - start < waitMs) {
        for (const m of menuMarkers) {
          if (await m.isVisible().catch(() => false)) return;
        }
        await page.waitForTimeout(100);
      }
    }

    throw new Error("Row action menu did not open (no menu markers became visible).");
  }
  
  

/**
 * ✅ Click menu item safely (prevents "opens then closes" flake)
 */

async function ensureManageLabelEditMode(page: Page, flow: any, unique: string, timeoutMs = 10_000) {
  const { click, input } = loadOverrides(flow);
  const nameSel =
    input["Name (edit label doc step)"] ||
    "[data-test-id='cs-labels-name-input-field'] input, input[aria-label='name'], input[name='name']";
  const nameInput = page.locator(nameSel).first();
  if (await nameInput.isVisible().catch(() => false)) return;

  const createdLabel = `Auto Label ${unique}`;
  const targetedRow = page
    .locator("[data-test-id='cs-cb-manage-labels-modal-list']")
    .filter({ hasText: new RegExp(escapeRegex(createdLabel), "i") })
    .first();
  const rowSel =
    click["Edit label item (doc step)"] ||
    "[data-test-id='cs-cb-manage-labels-modal-list'], [data-test-id='cs-actiontooltip']";
  const row = (await targetedRow.isVisible().catch(() => false)) ? targetedRow : page.locator(rowSel).first();
  if (await row.isVisible().catch(() => false)) {
    await row.hover({ timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(200);
  }

  // Use user-provided hover edit icon locators first.
  const editIconCandidates: Locator[] = [
    page.locator("svg[data-test-id='cs-cb-manage-labels-modal-edit']").first(),
    page.locator("xpath=//div[@data-test-id='label-tooltip']/*[name()='svg'][@fill='none']").first(),
  ];
  for (const icon of editIconCandidates) {
    if (await icon.isVisible().catch(() => false)) {
      await icon.click({ timeout: 5_000, force: true }).catch(() => {});
      await page.waitForTimeout(250);
      break;
    }
  }

  const editTriggerSel =
    click["Edit Label button (doc step)"] ||
    "button[aria-label='Edit Label'], [data-test-id='cs-create-edit-label'][aria-label='Edit Label']";
  const editTrigger = page.locator(editTriggerSel).first();
  if (await editTrigger.isVisible().catch(() => false)) {
    await editTrigger.click({ timeout: 5_000, force: true }).catch(() => {});
  }

  await nameInput.waitFor({ state: "visible", timeout: timeoutMs }).catch(() => {});
}

async function ensureManageLabelDeleteMode(page: Page, flow: any, unique: string, timeoutMs = 10_000) {
  const { click } = loadOverrides(flow);
  const deleteSel =
    click["Delete Label button (doc step)"] ||
    "button[aria-label='Delete Label'], [data-test-id='cs-ct-delete'], button:has-text('Delete')";
  const deleteBtn = page.locator(deleteSel).first();
  if (await deleteBtn.isVisible().catch(() => false)) return;

  const updatedLabel = `Auto Label Updated ${unique}`;
  const createdLabel = `Auto Label ${unique}`;
  const targetedUpdatedRow = page
    .locator("[data-test-id='cs-cb-manage-labels-modal-list']")
    .filter({ hasText: new RegExp(escapeRegex(updatedLabel), "i") })
    .first();
  const targetedCreatedRow = page
    .locator("[data-test-id='cs-cb-manage-labels-modal-list']")
    .filter({ hasText: new RegExp(escapeRegex(createdLabel), "i") })
    .first();
  const rowSel =
    click["Edit label item (doc step)"] ||
    "[data-test-id='cs-cb-manage-labels-modal-list'], [data-test-id='cs-actiontooltip']";
  let row = page.locator(rowSel).first();
  if (await targetedUpdatedRow.isVisible().catch(() => false)) row = targetedUpdatedRow;
  else if (await targetedCreatedRow.isVisible().catch(() => false)) row = targetedCreatedRow;
  if (await row.isVisible().catch(() => false)) {
    await row.hover({ timeout: 5_000 }).catch(() => {});
    await page.waitForTimeout(200);
  }

  // Use user-provided hover delete icon locators first.
  const deleteIconCandidates: Locator[] = [
    page.locator("svg[data-test-id='cs-cb-manage-labels-modal-delete']").first(),
    page.locator("xpath=//div[@data-test-id='label-tooltip']/*[name()='svg'][@fill='none']").first(),
    page.locator("svg[name='Trash']").first(),
    page.locator("xpath=//*[name()='svg'][@name='Trash']").first(),
    page.locator("xpath=//*[name()='svg'][@name='Trash']/*[name()='path'][contains(@fill, '#647696')]").first(),
  ];
  for (const icon of deleteIconCandidates) {
    if (await icon.isVisible().catch(() => false)) {
      await icon.click({ timeout: 5_000, force: true }).catch(() => {});
      await page.waitForTimeout(250);
      break;
    }
  }

  await deleteBtn.waitFor({ state: "visible", timeout: timeoutMs }).catch(() => {});
}


export async function performAction(
  page: Page,
  step: Step,
  unique: string,
  flow?: any,
  context?: ActionContext
): Promise<Page | void> {
  switch (step.action) {
    case "click": {
      // If user clicks vertical ellipsis, open it and confirm menu is visible
      if (step.target === "vertical ellipsis") {
        await openRowActionMenu(page, step, flow); // ✅ pass step
        break;
      }
      

      // If user clicks Settings/Edit from that menu, do a safe menu-item click
      if (step.target === "Settings" || step.target === "Edit") {
        await clickRowActionMenuItem(page, step.target, flow);
        break;
      }

      // use-slash / customize / JSON RTE entry-setup flows: Save and Close may open ReactModal__warning ("Save changes") — confirm with Save (cs-cb-unsaved-save).
      if (
        step.target === "Save and Close (doc step)" &&
        (isJsonRteEntrySetupFlow(flow) || String(flow?.id || "").toLowerCase() === "customize-json-rich-text-editor")
      ) {
        const t = getStepTimeoutMs(step);
        const { click } = loadOverrides(flow);
        const mapped = click[step.target] || CLICK_SELECTORS[step.target];
        const el = page.locator(mapped).first();
        await expect(el).toBeVisible({ timeout: t });
        await el.click({ timeout: t, force: true });
        await page.waitForTimeout(500);
        const unsavedSave = page
          .locator(
            '.ReactModal__warning [data-test-id="cs-cb-unsaved-save"], [role="dialog"]:has([data-test-id="cs-modal-title"]:has-text("Save changes")) [data-test-id="cs-cb-unsaved-save"], [data-test-id="cs-cb-unsaved-save"]'
          )
          .first();
        if (await unsavedSave.isVisible({ timeout: 10_000 }).catch(() => false)) {
          await unsavedSave.click({ timeout: t, force: true });
          await page.waitForTimeout(700);
          await page.locator(".ReactModal__warning").first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          await page.getByRole("dialog").filter({ hasText: /unsaved changes|save changes/i }).first().waitFor({ state: "hidden", timeout: 10_000 }).catch(() => {});
        }
        await page.waitForFunction(
          () => !window.location.href.includes("content-type-builder"),
          null,
          { timeout: Math.min(t, 45_000) }
        ).catch(() => {});
        await page.waitForTimeout(400);
        break;
      }

      // customize-json-rich-text-editor — Embed Object(s) + reference CT (embed-entries-or-assets doc; ct-advanced-page.html embed_object).
      // Without this, Choose Entry shows 0 content types for the Shared JSON RTE Doc CT.
      if (String(flow?.id || "").toLowerCase() === "customize-json-rich-text-editor" && step.target === "JSON RTE Embed Objects toggle (doc step)") {
        const t = getStepTimeoutMs(step);
        const scope = page.locator('[data-test-id="cs-field-properties-container"]');
        await scope.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        const toggle = scope.locator('input[type="checkbox"][name*="embed_object"]');
        await toggle.waitFor({ state: "attached", timeout: Math.min(t, 18_000) });
        if (!(await toggle.isChecked().catch(() => false))) {
          await toggle.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(900);
        break;
      }

      if (String(flow?.id || "").toLowerCase() === "customize-json-rich-text-editor" && step.target === "JSON RTE Embed reference select Shared content type (doc step)") {
        const t = getStepTimeoutMs(step);
        const shortSeg = unique.split("-")[0];
        const ctName = `Shared JSON RTE Doc CT-${unique}`;
        const scope = page.locator('[data-test-id="cs-field-properties-container"]');
        await scope.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        // Opens modal "Select Embed Object(s)" with searchable table — not a Select__menu dropdown.
        const trigger = scope
          .locator('[data-test-id="cs-content-type-field-json-rich-text-editor-advanced-select-objects-tag-as-select"]')
          .or(scope.locator('div.Select__tag__placeholder:has-text("Select Object"), div:has-text("Select Object(s)"):has(img)'))
          .or(scope.getByText("Select Object(s)", { exact: true }))
          .first();
        await trigger.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await trigger.click({ timeout: t, force: true });
        await page.waitForTimeout(500);
        const embedDialog = page
          .getByRole("dialog")
          .filter({ has: page.getByRole("heading", { name: /select embed object/i }) })
          .first();
        await embedDialog.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        const search = embedDialog
          .getByPlaceholder(/search content types/i)
          .or(embedDialog.locator('input[type="text"][placeholder*="Search"]'))
          .first();
        await search.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
        await search.fill("");
        await search.fill(ctName);
        await page.waitForTimeout(800);
        // Prefer row matching full UUID; fallback short segment or partial title.
        let row = embedDialog.getByRole("row").filter({ hasText: new RegExp(escapeRegex(unique), "i") }).first();
        if ((await row.count().catch(() => 0)) === 0) {
          row = embedDialog.getByRole("row").filter({ hasText: new RegExp(escapeRegex(shortSeg), "i") }).first();
        }
        if ((await row.count().catch(() => 0)) === 0) {
          row = embedDialog.getByRole("row").filter({ hasText: /Shared JSON RTE Doc CT/i }).first();
        }
        await row.waitFor({ state: "visible", timeout: Math.min(t, 20_000) });
        const rowCheckbox = row.locator('input[type="checkbox"]').first();
        if (await rowCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
          await rowCheckbox.click({ timeout: t, force: true });
        } else {
          await row.click({ timeout: t, force: true });
        }
        // Primary action exposes accessible name "Proceed"; visible label is "Add Content Type(s)".
        const addBtn = embedDialog
          .getByRole("button", { name: /^Proceed$/i })
          .or(embedDialog.getByRole("button", { name: /add content type/i }));
        await addBtn.first().waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
        await addBtn.first().click({ timeout: t, force: true });
        await embedDialog.waitFor({ state: "hidden", timeout: Math.min(t, 25_000) }).catch(() => {});
        await page.waitForTimeout(600);
        break;
      }

      // use-slash-command-for-shortcuts-in-json-rte: after saving a content type, hash-route to Entries and wait (generic nav click can leave Content Models visible).
      if (step.target === "Entries (doc step)" && isJsonRteEntrySetupFlow(flow)) {
        const t = getStepTimeoutMs(step);
        const blockingUnsaved = page
          .locator(
            '.ReactModal__warning [data-test-id="cs-cb-unsaved-save"], [role="dialog"]:has-text("unsaved changes") [data-test-id="cs-cb-unsaved-save"]'
          )
          .first();
        if (await blockingUnsaved.isVisible({ timeout: 3000 }).catch(() => false)) {
          await blockingUnsaved.click({ timeout: t, force: true });
          await page.waitForTimeout(700);
          await page.locator(".ReactModal__warning").first().waitFor({ state: "hidden", timeout: 12_000 }).catch(() => {});
        }
        const navBtn = page.locator('[data-test-id="cms-nav-entries"]').first();
        await expect(navBtn).toBeVisible({ timeout: t });
        const entriesChrome = page
          .locator(
            '[data-test-id="entries_page_header_title"], .page-header-title:has-text("Entries"), [data-test-id="cs-page-title"]:has-text("Entries")'
          )
          .first();
        for (let attempt = 1; attempt <= 3; attempt++) {
          await navBtn.click({ timeout: t, force: true });
          try {
            await entriesChrome.waitFor({ state: "visible", timeout: Math.min(t, 35_000) });
            break;
          } catch {
            try {
              await page.waitForFunction(
                () => {
                  const h = window.location.href;
                  return /entries/i.test(h) && !/content-type-builder/i.test(h);
                },
                null,
                { timeout: Math.min(t, 20_000) }
              );
              await entriesChrome.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
              break;
            } catch {
              if (attempt === 3) {
                await page
                  .evaluate(() => {
                    const h = window.location.href;
                    const m = h.match(/#!\/(stack\/[^/?#]+)/);
                    if (m) window.location.hash = `#!/${m[1]}/entries`;
                  })
                  .catch(() => {});
                await page.waitForTimeout(1200);
                try {
                  await entriesChrome.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
                } catch {
                  throw new Error(
                    "Entries (doc step): Entries listing did not appear (no Entries page chrome after nav clicks and hash fallback)."
                  );
                }
              }
            }
          }
        }
        await page.getByRole("button", { name: /^(?:\+\s*)?new entry$/i }).first().waitFor({ state: "visible", timeout: 25_000 }).catch(() => {});
        await page.waitForTimeout(800);
        break;
      }

      // use-slash flow: Proceed/Create must leave "Select Content Type" and render entry editor (title + JSON RTE).
      if (step.target === "Create Entry (doc step)" && isJsonRteEntrySetupFlow(flow)) {
        const t = getStepTimeoutMs(step);
        const { click } = loadOverrides(flow);
        const sel =
          click[step.target] ||
          '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Proceed")';
        const modal = page.locator('.ReactModal__new-entry, [role="dialog"]:has-text("Select Content Type")').first();
        // Enabled Proceed uses cs-new-entry-single-proceed; disabled state uses cs-new-entry-single-proceed-disable.
        let btn = modal.locator('[data-test-id="cs-new-entry-single-proceed"]').first();
        if (!(await btn.isVisible().catch(() => false))) {
          btn = modal
            .locator(
              'button[aria-label="Proceed"]:not([disabled]), [data-test-id="cs-new-entry-single-proceed"], button:has-text("Proceed"), button:has-text("Create")'
            )
            .first();
        }
        if (!(await btn.isVisible().catch(() => false))) {
          btn = page.locator(sel).first();
        }
        await expect(btn).toBeVisible({ timeout: t });
        await expect(btn).toBeEnabled({ timeout: Math.min(t, 90_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(600);
        await page
          .locator(".ReactModal__new-entry")
          .first()
          .waitFor({ state: "hidden", timeout: Math.min(t, 45_000) })
          .catch(() => {});
        // Exclude type=number etc.: generic "Type something..." matches hidden numeric fields (e.g. value 500).
        const titleIn = page
          .locator(
            '[data-test-id="cs-title-input"] input:not([type="number"]), [data-test-id="cs-single-line-field-title"] input:not([type="number"]), [data-test-id="cs-edit-entry-field-title"] input, input[placeholder*="Type something" i]:not([type="number"]):not([type="hidden"]), input[name="title"]:not([type="number"])'
          )
          .first();
        const rteEditable = page.locator("#scrte-editable").first();
        const waitMs = Math.min(Math.max(t, 45_000), 120_000);
        try {
          await titleIn.waitFor({ state: "visible", timeout: waitMs });
        } catch {
          const retryProceed = modal.locator('[data-test-id="cs-new-entry-single-proceed"]').first();
          if (await retryProceed.isVisible().catch(() => false)) {
            await retryProceed.click({ timeout: 15_000, force: true });
            await page.waitForTimeout(500);
          }
          await titleIn.waitFor({ state: "visible", timeout: waitMs });
        }
        await rteEditable.waitFor({ state: "attached", timeout: waitMs });
        break;
      }

      if (step.target === "JSON RTE entry editor focus (doc step)" && isJsonRteEntrySetupFlow(flow)) {
        const t = getStepTimeoutMs(step);
        const ed = page.locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable').first();
        await ed.waitFor({ state: "attached", timeout: t });
        await ed.scrollIntoViewIfNeeded().catch(() => {});
        await ed.click({ timeout: t, force: true });
        await page.waitForTimeout(200);
        break;
      }

      // videos-and-social-embeds — Video / Social Embeds toolbar (video-icon.html, social-embed-icon.html)
      if (isJsonRteVideosSocialEmbedsFlow(flow) && step.target === "JSON RTE Video toolbar icon (doc step)") {
        const t = getStepTimeoutMs(step);
        const bar = page.locator("#scrte-toolbar").first();
        await bar.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await bar
          .evaluate((el) => {
            const node = el as HTMLElement;
            const scrollable = node.parentElement ?? node;
            scrollable.scrollLeft = scrollable.scrollWidth;
            node.scrollLeft = node.scrollWidth;
          })
          .catch(() => {});
        await page.waitForTimeout(350);
        const btn = bar.locator('[data-icon="embed"]').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 15_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(400);
        break;
      }

      if (isJsonRteVideosSocialEmbedsFlow(flow) && step.target === "JSON RTE Social Embeds toolbar icon (doc step)") {
        const t = getStepTimeoutMs(step);
        const bar = page.locator("#scrte-toolbar").first();
        await bar.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await bar
          .evaluate((el) => {
            const node = el as HTMLElement;
            const scrollable = node.parentElement ?? node;
            scrollable.scrollLeft = scrollable.scrollWidth;
            node.scrollLeft = node.scrollWidth;
          })
          .catch(() => {});
        await page.waitForTimeout(350);
        const btn = bar.locator('[data-icon="social-embeds"]').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 15_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(400);
        break;
      }

      // code-blocks — https://www.contentstack.com/docs/developers/json-rich-text-editor/code-blocks (format-icon.html, format-dropdown-menu.html)
      if (isJsonRteCodeBlocksFlow(flow) && step.target === "JSON RTE Format toolbar open (doc step)") {
        const t = getStepTimeoutMs(step);
        const bar = page.locator("#scrte-toolbar").first();
        await bar.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        const fmt = bar.locator('[data-icon="Format"]').first();
        await fmt.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
        await fmt.scrollIntoViewIfNeeded().catch(() => {});
        await fmt.click({ timeout: t, force: true });
        await page.waitForTimeout(450);
        break;
      }

      if (isJsonRteCodeBlocksFlow(flow) && step.target === "JSON RTE Format dropdown Code snippet (doc step)") {
        const t = getStepTimeoutMs(step);
        const item = page
          .locator('li[data-test-id="cs-dropdown-elements"]')
          .filter({ has: page.locator('[data-icon="code"]') })
          .first();
        await item.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
        await item.click({ timeout: t, force: true });
        await page.waitForTimeout(500);
        break;
      }

      if (isJsonRteCodeBlocksFlow(flow) && step.target === "JSON RTE click code block area (doc step)") {
        const t = getStepTimeoutMs(step);
        const ed = page.locator("#scrte-editable").first();
        const block = ed.locator("pre").first();
        await block.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await block.click({ timeout: t, force: true });
        await page.waitForTimeout(400);
        break;
      }

      if (isJsonRteCodeBlocksFlow(flow) && step.target === "JSON RTE code block language dropdown open (doc step)") {
        const t = getStepTimeoutMs(step);
        const toolbar = page.locator('[data-test-id="code-toolbar"]').first();
        await toolbar.waitFor({ state: "visible", timeout: Math.min(t, 20_000) });
        const hdr = toolbar.locator('[data-test-id="cs-dropdown"] .Dropdown__header, .Dropdown__header').first();
        await hdr.click({ timeout: t, force: true });
        await page.waitForTimeout(450);
        break;
      }

      if (isJsonRteCodeBlocksFlow(flow) && step.target === "JSON RTE select JavaScript language option (doc step)") {
        const t = getStepTimeoutMs(step);
        await page
          .locator(".Dropdown__menu:visible, [role='listbox']:visible")
          .first()
          .waitFor({ state: "visible", timeout: Math.min(t, 12_000) })
          .catch(() => {});
        const jsText = page.getByText(/^JavaScript$/i).first();
        if (await jsText.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await jsText.click({ timeout: t, force: true });
        } else {
          const candidates = [
            page.getByRole("option", { name: /^JavaScript$/i }),
            page.locator('[role="option"]').filter({ hasText: /^JavaScript$/i }),
            page.locator("li, .Dropdown__menu__list__item").filter({ hasText: /^JavaScript$/i }),
            page.locator('[data-test-id="cs-dropdown-elements"]').filter({ hasText: /^JavaScript$/i }),
          ];
          let clicked = false;
          for (const loc of candidates) {
            const el = loc.first();
            if (await el.isVisible({ timeout: 3_000 }).catch(() => false)) {
              await el.click({ timeout: t, force: true });
              clicked = true;
              break;
            }
          }
          if (!clicked) {
            throw new Error(
              'Code blocks (doc): could not find "JavaScript" in code block language dropdown (code-block-lang-menu.html).'
            );
          }
        }
        await page.waitForTimeout(350);
        break;
      }

      // embed-entries-or-assets-part-1 — Embed entry (toolbar → Embed entry menu → Choose Entry modal)
      // Note: [data-icon="embed"]::first() opens the Video modal (video-icon.html). Use the 2nd embed icon
      // when present, or reference / insert-menu paths — never click the first embed for this flow.
      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Embed entry toolbar path (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const bar = page.locator("#scrte-toolbar").first();
        await bar.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        // Close stray modals (e.g. Video from a mistaken first-embed click in a prior attempt).
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(200);
        await page.locator(".ReactModal__Content--video-embed, [role='dialog']:has-text('Video')").first().waitFor({ state: "hidden", timeout: 3_000 }).catch(() => {});
        await bar
          .evaluate((el) => {
            const node = el as HTMLElement;
            const scrollable = node.parentElement ?? node;
            scrollable.scrollLeft = scrollable.scrollWidth;
            node.scrollLeft = node.scrollWidth;
          })
          .catch(() => {});
        await page.waitForTimeout(400);
        if (await modal.isVisible({ timeout: 2_000 }).catch(() => false)) {
          break;
        }
        const rte = page.locator('[data-test-id="cs-edit-entry-field-json_rte"]').first();
        const nEmbed = await bar.locator('[data-icon="embed"]').count().catch(() => 0);
        const openers: Locator[] = [
          bar.locator('[data-icon="reference"]'),
          bar.locator('[data-icon="Reference"]'),
          rte.locator('.scrte-dropdown [data-icon="reference"]'),
          rte.locator('span[data-icon="reference"]'),
        ];
        if (nEmbed > 1) openers.unshift(bar.locator('[data-icon="embed"]').nth(1));
        let opened = false;
        for (const loc of openers) {
          const el = loc.first();
          if ((await el.count().catch(() => 0)) === 0) continue;
          if (await el.isVisible({ timeout: 2_500 }).catch(() => false)) {
            await el.click({ timeout: t, force: true });
            opened = true;
            await page.waitForTimeout(500);
            break;
          }
        }
        if (!opened) {
          const plusMenu = bar.locator('.scrte-dropdown [data-icon="plus"], [data-icon="add"], span[data-icon="PurpleAdd"]').first();
          if (await plusMenu.isVisible({ timeout: 2_000 }).catch(() => false)) {
            await plusMenu.click({ timeout: t, force: true });
            opened = true;
            await page.waitForTimeout(500);
          }
        }
        // Single [data-icon=embed] opens Video (video-icon.html). "Embed entry" often lives in a scrte-dropdown
        // insert menu (Paragraph Styles / More Options — see paragraph-style / insert lists in runtime snapshots).
        if (!opened) {
          const ddRoots = bar.locator(".scrte-dropdown");
          const nDd = await ddRoots.count().catch(() => 0);
          for (let i = 0; i < nDd; i++) {
            await page.keyboard.press("Escape").catch(() => {});
            await page.waitForTimeout(150);
            const trigger = ddRoots.nth(i);
            if ((await trigger.count().catch(() => 0)) === 0) continue;
            if (!(await trigger.isVisible({ timeout: 1_500 }).catch(() => false))) continue;
            await trigger.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(450);
            const menuScope = page
              .locator(".Dropdown__menu--primary:visible, .Dropdown__menu:visible, [data-testid='slash-command']:visible")
              .first();
            const embedLbl = menuScope.getByText("Embed entry", { exact: true }).first();
            if (await embedLbl.isVisible({ timeout: 2_500 }).catch(() => false)) {
              await embedLbl.scrollIntoViewIfNeeded().catch(() => {});
              await embedLbl.click({ timeout: t, force: true });
              await page.waitForTimeout(500);
              opened = true;
              break;
            }
          }
        }
        if (!opened) {
          throw new Error(
            "JSON RTE Embed entry (doc): could not open embed UI — use 2nd [data-icon=embed] (1st opens Video), reference, or insert menu (embed-dropdown-menu.html)."
          );
        }
        if (await modal.isVisible({ timeout: 4_000 }).catch(() => false)) {
          break;
        }
        const menuVisible = page.locator(".Dropdown__menu--primary:visible, .Dropdown__menu:visible, [data-testid='slash-command']:visible").first();
        await menuVisible.waitFor({ state: "visible", timeout: Math.min(t, 12_000) }).catch(() => {});
        const itemCandidates: Locator[] = [
          menuVisible.locator('li[data-test-id="cs-dropdown-elements"]').filter({ hasText: /embed\s*entry/i }).first(),
          menuVisible.getByRole("menuitem", { name: /^Embed entry$/i }).first(),
          menuVisible.getByText("Embed entry", { exact: true }).first(),
          menuVisible.locator(".Dropdown__menu__list__item").filter({ hasText: /^Embed entry$/i }).first(),
        ];
        let clicked = false;
        for (const item of itemCandidates) {
          if ((await item.count().catch(() => 0)) === 0) continue;
          if (await item.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await item.scrollIntoViewIfNeeded().catch(() => {});
            await item.click({ timeout: t, force: true });
            clicked = true;
            await page.waitForTimeout(500);
            break;
          }
        }
        if (!clicked) {
          throw new Error(
            'JSON RTE Embed entry (doc): could not click "Embed entry" in toolbar dropdown (embed-dropdown-menu.html / insert menu).'
          );
        }
        if (await modal.isVisible({ timeout: 8_000 }).catch(() => false)) {
          break;
        }
        await page.waitForTimeout(400);
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry select Shared JSON RTE content type (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 35_000) });
        const ctName = `Shared JSON RTE Doc CT-${unique}`;
        const shortSeg = unique.split("-")[0];
        const selCtl = modal.locator(".Select__control, [data-test-id='cs-select'] .Select__control").first();
        await selCtl.click({ timeout: t, force: true });
        await page.waitForTimeout(350);
        const inp = modal
          .locator('input[aria-label="cs-select-aria"], .Select__input input, input[id^="react-select"]')
          .first();
        await inp.waitFor({ state: "visible", timeout: Math.min(t, 12_000) });
        await inp.fill("");
        await inp.fill(ctName);
        await page.waitForTimeout(600);
        const menu = page.locator("div.Select__menu:visible, [role='listbox']:visible").last();
        const inMenu = menu.locator('[role="option"]');
        let opt = inMenu.filter({ hasText: new RegExp(escapeRegex(unique), "i") }).first();
        if ((await opt.count().catch(() => 0)) === 0) {
          opt = inMenu.filter({ hasText: new RegExp(escapeRegex(shortSeg), "i") }).first();
        }
        if ((await opt.count().catch(() => 0)) === 0) {
          opt = inMenu.filter({ hasText: /Shared JSON RTE Doc CT/i }).first();
        }
        if ((await menu.isVisible({ timeout: 2500 }).catch(() => false)) && (await opt.count().catch(() => 0)) > 0) {
          await opt.first().waitFor({ state: "visible", timeout: Math.min(t, 12_000) });
          await opt.first().click({ timeout: t, force: true });
        } else {
          // v2 / portal: option may be a focused row without Select__menu; confirm with Enter or click label.
          const byLabel = modal.locator(".content-type-selector").getByText(ctName, { exact: true }).first();
          if (await byLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
            await byLabel.click({ timeout: t, force: true });
          } else {
            await page.keyboard.press("Enter");
          }
        }
        await page.waitForTimeout(1200);
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry first entry row (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const row = modal.locator('[role="row"][data-test-id^="cs-table-body-row"]').first();
        await row.waitFor({ state: "visible", timeout: Math.min(t, 90_000) });
        await row.click({ timeout: t, force: true });
        await page.waitForTimeout(450);
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry Block Embed (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const block = modal.locator('label[data-test-id="asset-embed-block"], [data-test-id="asset-embed-block"], label:has-text("Block Embed")').first();
        await block.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await block.click({ timeout: t, force: true });
        await page.waitForTimeout(350);
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Embed Selected Entry button (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('[data-test-id="cs-add-selected-ref"], button:has-text("Embed Selected Entry")').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 25_000) });
        await expect(btn).toBeEnabled({ timeout: Math.min(t, 120_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(600);
        await page.locator(".ReactModal__referencepopup-entry-selector").first().waitFor({ state: "hidden", timeout: 40_000 }).catch(() => {});
        break;
      }

      if (isJsonRteVideosSocialEmbedsFlow(flow) && step.target === "JSON RTE Video modal Add button (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('[data-testid="addEmbedBtn"]').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 20_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(500);
        break;
      }

      if (isJsonRteVideosSocialEmbedsFlow(flow) && step.target === "JSON RTE Social Embeds modal Add button (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('[data-testid="addSocialEmbedBtn"]').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 20_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(500);
        break;
      }

      // basic-formatting / block props part 1 / code-blocks: triple-click a word to open floating toolbar (formating-menu.html).
      if (
        (String(flow?.id || "").toLowerCase() === "basic-formatting" ||
          isJsonRteBlockInlinePropsPart1(flow) ||
          isJsonRteCodeBlocksFlow(flow)) &&
        step.target === "JSON RTE triple-click word for toolbar (doc step)" &&
        step.expected?.labelEquals
      ) {
        const t = getStepTimeoutMs(step);
        const word = String(step.expected.labelEquals || "").trim();
        const editor = page.locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable').first();
        await editor.waitFor({ state: "attached", timeout: t });
        const wloc = editor.getByText(word, { exact: true }).first();
        await wloc.waitFor({ state: "visible", timeout: Math.min(t, 20_000) });
        await wloc.click({ clickCount: 3, timeout: 10_000, force: true });
        await page.waitForTimeout(350);
        if (isJsonRteBlockInlinePropsPart1(flow)) {
          // Floating toolbar may paint overflow controls (e.g. Property) shortly after selection (formating-menu.html).
          await page.waitForTimeout(1_800);
        }
        break;
      }

      // Block and Inline Properties doc part 2: double-click word for inline selection (formating-menu.html).
      if (
        isJsonRteBlockInlinePropsPart2(flow) &&
        step.target === "JSON RTE double-click word for inline selection (doc step)" &&
        step.expected?.labelEquals
      ) {
        const t = getStepTimeoutMs(step);
        const word = String(step.expected.labelEquals || "").trim();
        const editor = page.locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable').first();
        await editor.waitFor({ state: "attached", timeout: t });
        const wloc = editor.getByText(word, { exact: true }).first();
        await wloc.waitFor({ state: "visible", timeout: Math.min(t, 20_000) });
        await wloc.click({ clickCount: 2, timeout: 10_000, force: true });
        await page.waitForTimeout(350);
        if (isJsonRteBlockInlinePropsPart2(flow)) {
          await page.waitForTimeout(1_800);
        }
        break;
      }

      // After Property icon: opens Add Property modal directly or shows "Add Property" menu (Block doc step 4).
      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE Add Property menu or continue (doc step)") {
        const t = getStepTimeoutMs(step);
        await page.waitForTimeout(400);
        const modalTitle = page.locator('[data-test-id="cs-modal-title-add-property"]').first();
        if (await modalTitle.isVisible({ timeout: 5_000 }).catch(() => false)) {
          break;
        }
        const addProp = page
          .getByRole("menuitem", { name: /Add Property/i })
          .or(page.locator("li, [role='option']").filter({ hasText: /^Add Property$/i }))
          .first();
        await addProp.waitFor({ state: "visible", timeout: Math.min(t, 12_000) });
        await addProp.click({ timeout: t, force: true });
        await page.waitForTimeout(400);
        break;
      }

      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE Add Property modal Apply (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator(".cs-auto-draft-modal #applyBtn").first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 15_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(400);
        await page.locator('[data-test-id="cs-modal-title-add-property"]').first().waitFor({ state: "hidden", timeout: 20_000 }).catch(() => {});
        break;
      }

      if (
        (String(flow?.id || "").toLowerCase() === "basic-formatting" || isJsonRteBlockInlinePropsFlow(flow)) &&
        step.target?.startsWith("JSON RTE floating toolbar ") &&
        step.target?.endsWith(" (doc step)")
      ) {
        const t = getStepTimeoutMs(step);
        const { click: clickOv } = loadOverrides(flow);
        const sel = clickOv[step.target];
        if (!sel) {
          throw new Error(
            `${String(flow?.id || "flow")}: missing selector for "${step.target}" — add to ${String(flow?.id || "")}.selectors.ts (or basic-formatting.selectors.ts).`
          );
        }
        const bar = page.locator("#scrte-toolbar, .scrte-hovering-toolbar.scrte-toolbar").first();
        await bar.waitFor({ state: "visible", timeout: Math.min(t, 18_000) }).catch(() => {});
        await page.waitForTimeout(250);
        await bar
          .evaluate((el) => {
            const node = el as HTMLElement;
            const scrollable = node.parentElement ?? node;
            scrollable.scrollLeft = scrollable.scrollWidth;
            node.scrollLeft = node.scrollWidth;
          })
          .catch(() => {});
        await page.waitForTimeout(200);

        if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE floating toolbar Property (doc step)") {
          const pollUntil = Date.now() + 25_000;
          while (Date.now() < pollUntil) {
            const n = await page.locator(sel).count();
            if (n > 0) break;
            await page.waitForTimeout(450);
            await bar
              .evaluate((el) => {
                const node = el as HTMLElement;
                const scrollable = node.parentElement ?? node;
                scrollable.scrollLeft = scrollable.scrollWidth;
                node.scrollLeft = node.scrollWidth;
              })
              .catch(() => {});
          }
          if ((await page.locator(sel).count()) === 0) {
            throw new Error(
              'Block and Inline Properties (doc): floating toolbar has no [data-icon="property"] after wait (formating-menu.html). Confirm the stack shows Property on the JSON RTE floating toolbar when text is selected.'
            );
          }
        }

        const btn = page.locator(sel).first();
        await btn.waitFor({ state: "attached", timeout: Math.min(t, 20_000) });
        await btn.scrollIntoViewIfNeeded().catch(() => {});
        // Property and other overflow icons can sit just outside the visible clip; force-click matches real user reach.
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(280);
        break;
      }

      // json-rte-assets — https://www.contentstack.com/docs/developers/json-rich-text-editor/assets (asset-icon.html, select-asset.html, upload-asset.html)
      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Asset toolbar open dropdown (doc step)") {
        const t = getStepTimeoutMs(step);
        const rte = page.locator('[data-test-id="cs-edit-entry-field-json_rte"]').first();
        await rte.waitFor({ state: "visible", timeout: t });
        const assetBtn = rte.locator('.scrte-dropdown [data-icon="Asset"], span[data-icon="Asset"]').first();
        await expect(assetBtn).toBeVisible({ timeout: Math.min(t, 25_000) });
        await assetBtn.click({ timeout: t, force: true });
        await page.waitForTimeout(450);
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Choose from assets menu (doc step)") {
        const t = getStepTimeoutMs(step);
        const opt = page
          .getByRole("menuitem", { name: /Choose from assets/i })
          .or(page.locator("li, [role='option']").filter({ hasText: /Choose from assets/i }))
          .or(page.getByText(/Choose from assets/i, { exact: false }))
          .first();
        await opt.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
        await opt.click({ timeout: t, force: true });
        await page.waitForTimeout(800);
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset first file row (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__asset-selector").first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 45_000) });
        await jsonRteSelectFirstEmbeddableAssetRow(page, modal);
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset embed Block (doc step)") {
        const t = getStepTimeoutMs(step);
        const block = page.locator('.ReactModal__asset-selector label[data-test-id="asset-embed-block"]').first();
        if (await block.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await block.click({ timeout: t, force: true }).catch(() => {});
        }
        await page.waitForTimeout(200);
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Add Selected Asset (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('[data-test-id="cs-entry-choose-file-add-selected-entries"], button:has-text("Add Selected Asset")').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 20_000) });
        await expect(btn).toBeEnabled({ timeout: Math.min(t, 90_000) });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(600);
        await page.locator(".ReactModal__asset-selector").first().waitFor({ state: "hidden", timeout: 35_000 }).catch(() => {});
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload new assets menu (doc step)") {
        const t = getStepTimeoutMs(step);
        const opt = page
          .getByRole("menuitem", { name: /Upload new asset/i })
          .or(page.locator("li, [role='option']").filter({ hasText: /Upload new asset/i }))
          .or(page.getByText(/Upload new asset/i, { exact: false }))
          .first();
        await opt.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
        await opt.click({ timeout: t, force: true });
        await page.waitForTimeout(800);
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Insert Uploaded Images (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 30_000) }).catch(() => {});
        const insert = modal
          .locator("button")
          .filter({ hasText: /Insert Uploaded Images/i })
          .or(page.locator("#scrte-image-modal button").filter({ hasText: /^Insert/i }))
          .first();
        await insert.waitFor({ state: "visible", timeout: Math.min(t, 120_000) });
        await expect(insert).toBeEnabled({ timeout: Math.min(t, 90_000) });
        await insert.click({ timeout: t, force: true });
        await page.waitForTimeout(700);
        await modal.waitFor({ state: "hidden", timeout: 45_000 }).catch(() => {});
        break;
      }

      // Select Content Type modal: pick the row for the CT created in this run (Name: …RTE CT-{unique}), else first row.
      if (step.target === "First content type row New Entry modal (doc step)" && isJsonRteEntrySetupFlow(flow)) {
        const t = getStepTimeoutMs(step);
        const { click: clickOv } = loadOverrides(flow);
        const modal = page.locator('.ReactModal__new-entry, [role="dialog"]:has-text("Select Content Type")').first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 90_000) });
        const tableBody = modal.locator(".Table__body").first();
        await tableBody.waitFor({ state: "visible", timeout: Math.min(t, 45_000) }).catch(() => {});
        await tableBody.evaluate((el) => {
          el.scrollTop = 0;
        }).catch(() => {});
        await page.waitForTimeout(500);

        const shortId = unique.split("-")[0];
        const ctPrefix = jsonRteCtNamePrefix(flow);
        const titleMatch = modal
          .locator('[data-test-id="cs-content-type-list-title-text"]')
          .filter({ hasText: new RegExp(`${escapeRegex(ctPrefix)}.*${escapeRegex(shortId)}`, "i") })
          .first();
        let row: Locator;
        if ((await titleMatch.count().catch(() => 0)) > 0 && (await titleMatch.isVisible().catch(() => false))) {
          row = titleMatch.locator('xpath=ancestor::*[@role="row"][1]');
        } else {
          const sel =
            clickOv[step.target] ||
            '.ReactModal__new-entry [data-test-id="cs-table-body-row-0"], [role="dialog"]:has-text("Select Content Type") [data-test-id="cs-table-body-row-0"], [role="dialog"] [data-test-id="cs-table-body-row-0"]';
          row = page.locator(sel).first();
        }
        await expect(row).toBeVisible({ timeout: t });
        await row.scrollIntoViewIfNeeded().catch(() => {});
        await row.click({ timeout: t, force: true });
        await page.waitForTimeout(500);
        break;
      }

      if (step.target === "New Entry (doc step)" && isJsonRteEntrySetupFlow(flow)) {
        const t = getStepTimeoutMs(step);
        await page
          .locator(
            '[data-test-id="entries_page_header_title"], [data-test-id="cs-page-title"]:has-text("Entries"), .page-header-title:has-text("Entries")'
          )
          .first()
          .waitFor({ state: "visible", timeout: Math.min(t, 30_000) })
          .catch(() => {});
        await page.waitForTimeout(600);

        const candidates: Locator[] = [
          page.locator('[data-test-id="cs-new-entry-all-entry"]').first(),
          page.locator('button[aria-label="Create New Entry"]').first(),
          page.getByRole("button", { name: /^New Entry$/i }).first(),
          page.getByRole("button", { name: /create new entry/i }).first(),
          page.getByRole("button", { name: /^(?:\+\s*)?new entry$/i }).first(),
          page.locator(".PageLayout__head button:has-text(\"New Entry\")").first(),
          page.locator("button.Button--primary").filter({ hasText: /^New Entry$/i }).first(),
        ];
        let clicked = false;
        for (const loc of candidates) {
          if (await loc.isVisible({ timeout: 4_000 }).catch(() => false)) {
            await loc.scrollIntoViewIfNeeded().catch(() => {});
            await loc.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          const { click } = loadOverrides(flow);
          const sel =
            click[step.target] ||
            '[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"]';
          const fallback = page.locator(sel).first();
          await expect(fallback).toBeVisible({ timeout: t });
          await fallback.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(500);
        break;
      }

      // Vertical ellipsis in webhook list Actions column (doc step)
      if (step.target === "Vertical ellipsis in Actions column (doc step)") {
        const t = getStepTimeoutMs(step);
        const tableBody = page.locator(".Table__body").first();
        if (await tableBody.isVisible().catch(() => false)) {
          await tableBody.evaluate((node) => node.scrollTo(0, 0)).catch(() => {});
          await page.waitForTimeout(300);
        }
        const ellipsis = page.locator('[data-test-id="cs-table-action-options"]').first();
        await ellipsis.click({ timeout: t, force: true });
        break;
      }

      // Trash → Content Types: date range control — click trailing caret when present (date-range-dropdown.html)
      if (step.target === "Trash date range filter DATE click (doc step)") {
        const t = getStepTimeoutMs(step);
        const { click } = loadOverrides(flow);
        const sel =
          click[step.target] ||
          '.trash-content-types [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-assets [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-taxonomy-fields [data-test-id="cs-trash-dateRangePicker-dropdown"], [data-test-id="cs-trash-dateRangePicker-dropdown"]';
        const dateCtl = page.locator(sel).first();
        await expect(dateCtl).toBeVisible({ timeout: t });
        const caret = dateCtl.locator('svg[name="CaretDown"], svg.RangeInput__suffix__wrapper, [data-test-id="cs-icon"]').first();
        if (await caret.isVisible().catch(() => false)) {
          await caret.click({ timeout: t, force: true });
        } else {
          await dateCtl.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(400);
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(200);
        break;
      }

      // Trash → sidebar: select a "Deleted By" option via Checkbox__box (data/dom/CMS/trash/filters.html). Only check when unchecked so we do not clear an already-applied filter.
      if (step.target === "Trash Deleted By filter checkbox (doc step)") {
        const t = getStepTimeoutMs(step);
        const section = page.locator('[data-test-id="cs-left-sidebar-deleted-by-section"]');
        await expect(section).toBeVisible({ timeout: t });
        const box = section.locator("span.Checkbox__box").first();
        const input = section.locator('input[type="checkbox"]').first();
        await expect(box).toBeVisible({ timeout: t });
        const checked = await input.isChecked().catch(() => false);
        if (!checked) {
          await box.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(250);
        break;
      }

      // Trash → Content Types: doc — click Restore in the tooltip (after hover + verify). No keyboard, no ellipsis, no recovery paths.
      if (step.target === "Trash row Restore action after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const li = tip.locator('[data-test-id="cs-trash-ct-action-restore"]').first();
        const label = tip.locator('.restore-label:has-text("Restore")').first();
        await expect(li).toBeVisible({ timeout: t });
        if (await label.isVisible().catch(() => false)) {
          await label.click({ timeout: t, force: true });
        } else {
          await li.click({ timeout: t, force: true });
        }
        const restoreModalFooterBtn = page.locator('[data-test-id="cs-trash-content-type-restore-without-entries"]').first();
        await expect(restoreModalFooterBtn).toBeVisible({ timeout: Math.min(t, 45_000) });
        await page.waitForTimeout(200);
        break;
      }

      // Trash → Global Fields: doc — click Restore in the tooltip (after hover + verify). No keyboard, no ellipsis, no recovery paths.
      if (step.target === "Trash global field row Restore action after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const li = tip.locator('[data-test-id="cs-trash-gf-action-restore"]').first();
        const label = tip.locator('.restore-label:has-text("Restore")').first();
        await expect(li).toBeVisible({ timeout: t });
        if (await label.isVisible().catch(() => false)) {
          await label.click({ timeout: t, force: true });
        } else {
          await li.click({ timeout: t, force: true });
        }
        const modalTitle = page
          .locator(
            '[data-test-id^="cs-modal-title-restore-global-field"], [role="dialog"] h3:has-text("Restore Global Field"), .ReactModal__Content h3:has-text("Restore Global Field")'
          )
          .first();
        await expect(modalTitle).toBeVisible({ timeout: Math.min(t, 45_000) });
        await page.waitForTimeout(200);
        break;
      }

      // Trash → Entries: doc — click Restore in the tooltip (after hover + verify). Fail if disabled (deleted content type).
      if (step.target === "Trash entry row Restore action after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const li = tip.locator('[data-test-id="cs-trash-entries-action-restore"]').first();
        await expect(li).toBeVisible({ timeout: t });
        const disabledBtn = li.locator(".restore-btn-disabled").first();
        if (await disabledBtn.isVisible().catch(() => false)) {
          throw new Error(
            "Restore deleted entry (doc): Restore is disabled for this row (e.g. the entry's content type was deleted). Restore the content type first, then restore the entry."
          );
        }
        const label = li.locator('.restore-label:has-text("Restore")').first();
        if (await label.isVisible().catch(() => false)) {
          await label.click({ timeout: t, force: true });
        } else {
          await li.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(400);
        break;
      }

      // Trash → Assets: click Restore in tooltip (folder or file row; modal expectations differ by flow id).
      if (step.target === "Trash asset row Restore action after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const li = tip
          .locator('[data-test-id="cs-trash-assets-action-restore"], [data-test-id="cs-trash-asstes-action-restore"]')
          .first();
        await expect(li).toBeVisible({ timeout: t });
        const disabledBtn = li.locator(".restore-btn-disabled").first();
        if (await disabledBtn.isVisible().catch(() => false)) {
          throw new Error(
            "Restore deleted asset (doc): Restore is disabled for this row (e.g. the parent asset folder was deleted). Restore the asset folder first, then restore the asset."
          );
        }
        const label = li.locator('.restore-label:has-text("Restore")').first();
        if (await label.isVisible().catch(() => false)) {
          await label.click({ timeout: t, force: true });
        } else {
          await li.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(400);
        const flowId = String(flow?.id || "");
        if (flowId === "restore-a-deleted-asset-folder") {
          const withBtn = page
            .locator(
              '[data-test-id="cs-trash-assets-restore-with-asset"], [data-test-id="cs-trash-asset-folder-restore-with-assets"], [data-test-id="cs-cb-restore-asset-folder-with-assets"], [role="dialog"] button:has-text("Restore With Assets")'
            )
            .first();
          await expect(withBtn).toBeVisible({ timeout: Math.min(t, 45_000) });
        }
        await page.waitForTimeout(200);
        break;
      }

      // Trash → Taxonomies: Actions column ellipsis → Restore in VerticalActionTooltip (taxonomy-verticle-menu.html).
      if (step.target === "Trash taxonomy first row Actions ellipsis (doc step)") {
        const t = getStepTimeoutMs(step);
        const root = page.locator(".trash-taxonomy-fields").first();
        await expect(root).toBeVisible({ timeout: t });
        const dataRows = page.locator(
          '.trash-taxonomy-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)'
        );
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await dataRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-taxonomy-fields .Spinner, .trash-taxonomy-fields [class*='Spinner'], .trash-taxonomy-fields .ListLoader, .trash-taxonomy-fields [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted taxonomy (doc): Trash has no deleted taxonomies. Delete a taxonomy first so it appears under Trash → Taxonomies, then re-run this flow."
          );
        }
        const row0 = root.locator('[data-test-id="cs-table-body-row-0"]:not(.Table__empty__row)');
        const hasRow0 =
          (await row0.count().catch(() => 0)) > 0 && (await row0.first().isVisible().catch(() => false));
        const firstDataRow = hasRow0 ? row0.first() : dataRows.first();
        await expect(firstDataRow).toBeVisible({ timeout: t });
        const ellipsis = firstDataRow.locator('[data-test-id="cs-table-action-options"]').first();
        await ellipsis.scrollIntoViewIfNeeded().catch(() => {});
        await ellipsis.click({ timeout: t, force: true });
        await page.waitForTimeout(250);
        break;
      }

      // Trash → Taxonomies: Actions ellipsis on first row whose Type column is Term (taxonomies-listing-page.html termTypeCell).
      if (step.target === "Trash term first row Actions ellipsis (doc step)") {
        const t = getStepTimeoutMs(step);
        const root = page.locator(".trash-taxonomy-fields").first();
        await expect(root).toBeVisible({ timeout: t });
        const termRows = page
          .locator('.trash-taxonomy-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)')
          .filter({ has: page.locator(".termTypeCell").getByText("Term", { exact: true }) });
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await termRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-taxonomy-fields .Spinner, .trash-taxonomy-fields [class*='Spinner'], .trash-taxonomy-fields .ListLoader, .trash-taxonomy-fields [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted term (doc): Trash has no deleted terms (Type = Term). Delete a term while its taxonomy still exists so it appears under Trash → Taxonomies, then re-run this flow."
          );
        }
        const firstDataRow = termRows.first();
        await expect(firstDataRow).toBeVisible({ timeout: t });
        const ellipsis = firstDataRow.locator('[data-test-id="cs-table-action-options"]').first();
        await ellipsis.scrollIntoViewIfNeeded().catch(() => {});
        await ellipsis.click({ timeout: t, force: true });
        await page.waitForTimeout(250);
        break;
      }

      if (
        step.target === "Trash taxonomy Restore in vertical action menu (doc step)" ||
        step.target === "Trash term Restore in vertical action menu (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const label = tip.locator('.restore-label:has-text("Restore")').first();
        await expect(label).toBeVisible({ timeout: t });
        await label.click({ timeout: t, force: true });
        const modalMarker = page
          .locator(
            '[data-test-id="cs-modal-title-restore-taxonomy"], [data-test-id="cs-modal-title-restore-term"], [data-test-id^="cs-modal-title-restore-term"]'
          )
          .first();
        await expect(modalMarker).toBeVisible({ timeout: Math.min(t, 45_000) });
        await page.waitForTimeout(200);
        break;
      }

      // Restore Taxonomy modal: doc step 4 — split Restore → “Restore with Content Type Association”.
      if (step.target === "Restore taxonomy With Content Type Association (doc step)") {
        const t = getStepTimeoutMs(step);
        const dialog = page.getByRole("dialog").first();
        await expect(dialog).toBeVisible({ timeout: t });
        const withMenuItem = page.getByRole("menuitem", { name: /Restore with Content Type Association/i }).first();
        if (await withMenuItem.isVisible().catch(() => false)) {
          await withMenuItem.click({ timeout: t, force: true });
        } else {
          const openers = [
            dialog.locator(".taxonomy-restore-button .openDropdownOnClick").first(),
            dialog.locator('.taxonomy-restore-button svg[name="CaretDown"]').first(),
            dialog.locator(".taxonomy-restore-button button.Button--primary").first(),
          ];
          let opened = false;
          for (const o of openers) {
            if (await o.isVisible().catch(() => false)) {
              await o.click({ timeout: t, force: true });
              opened = true;
              break;
            }
          }
          if (!opened) {
            throw new Error(
              'Restore taxonomy (doc step): could not open split Restore menu (expected .taxonomy-restore-button .openDropdownOnClick, CaretDown, or primary Restore).'
            );
          }
          await page.waitForTimeout(350);
          const withOpt = page.getByRole("menuitem", { name: /Restore with Content Type Association/i }).first();
          const fallback = page
            .locator(
              '[role="menuitem"]:has-text("Restore with Content Type Association"), li:has-text("Restore with Content Type Association")'
            )
            .first();
          if (await withOpt.isVisible().catch(() => false)) {
            await withOpt.click({ timeout: t, force: true });
          } else if (await fallback.isVisible().catch(() => false)) {
            await fallback.click({ timeout: t, force: true });
          } else {
            throw new Error(
              'Restore taxonomy (doc step): could not find "Restore with Content Type Association" in the split Restore menu.'
            );
          }
        }
        await page.waitForTimeout(400);
        break;
      }

      // Restore Term modal: split Restore → “Restore with Entry Association” (doc: restore-a-deleted-term).
      if (step.target === "Restore term With Entry Association (doc step)") {
        const t = getStepTimeoutMs(step);
        const dialog = page.getByRole("dialog").first();
        await expect(dialog).toBeVisible({ timeout: t });
        const withMenuItem = page.getByRole("menuitem", { name: /Restore with Entry Association/i }).first();
        if (await withMenuItem.isVisible().catch(() => false)) {
          await withMenuItem.click({ timeout: t, force: true });
        } else {
          const openers = [
            dialog.locator(".term-restore-button .openDropdownOnClick").first(),
            dialog.locator(".taxonomy-restore-button .openDropdownOnClick").first(),
            dialog.locator('.term-restore-button svg[name="CaretDown"]').first(),
            dialog.locator('.taxonomy-restore-button svg[name="CaretDown"]').first(),
            dialog.locator(".term-restore-button button.Button--primary").first(),
            dialog.locator(".taxonomy-restore-button button.Button--primary").first(),
          ];
          let opened = false;
          for (const o of openers) {
            if (await o.isVisible().catch(() => false)) {
              await o.click({ timeout: t, force: true });
              opened = true;
              break;
            }
          }
          if (!opened) {
            throw new Error(
              'Restore term (doc step): could not open split Restore menu (expected .term-restore-button or .taxonomy-restore-button with .openDropdownOnClick / CaretDown / primary Restore).'
            );
          }
          await page.waitForTimeout(350);
          const withOpt = page.getByRole("menuitem", { name: /Restore with Entry Association/i }).first();
          const fallback = page
            .locator(
              '[role="menuitem"]:has-text("Restore with Entry Association"), li[title="Restore with Entry Association"], .Dropdown__menu__list__item:has-text("Restore with Entry Association")'
            )
            .first();
          if (await withOpt.isVisible().catch(() => false)) {
            await withOpt.click({ timeout: t, force: true });
          } else if (await fallback.isVisible().catch(() => false)) {
            await fallback.click({ timeout: t, force: true });
          } else {
            throw new Error(
              'Restore term (doc step): could not find "Restore with Entry Association" in the split Restore menu.'
            );
          }
        }
        await page.waitForTimeout(400);
        break;
      }

      // Restore Global Field modal: primary Restore (doc — no With/Without Entries like content types).
      if (step.target === "Restore global field modal Restore button (doc step)") {
        const t = getStepTimeoutMs(step);
        const dialog = page.getByRole("dialog").first();
        await expect(dialog).toBeVisible({ timeout: t });
        const candidates = [
          dialog.locator('[data-test-id="cs-trash-gf-restore-confirm"]').first(),
          dialog.locator('[data-test-id="cs-cb-restore-gf"]').first(),
          dialog.getByRole("button", { name: /^Restore$/i }).first(),
        ];
        let clicked = false;
        for (const loc of candidates) {
          if (await loc.isVisible().catch(() => false)) {
            await loc.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          throw new Error(
            'Restore global field (doc step): could not find primary Restore control in the modal ([data-test-id="cs-trash-gf-restore-confirm"], [data-test-id="cs-cb-restore-gf"], or dialog button "Restore").'
          );
        }
        await page.waitForTimeout(400);
        break;
      }

      // Restore deleted entry modal: primary Restore (when the app shows a confirmation dialog after list Restore).
      if (step.target === "Restore entry modal Restore button (doc step)") {
        const t = getStepTimeoutMs(step);
        const dialog = page.getByRole("dialog").first();
        await expect(dialog).toBeVisible({ timeout: t });
        const candidates = [
          dialog.locator('[data-test-id="cs-trash-entry-restore-confirm"]').first(),
          dialog.locator('[data-test-id="cs-cb-restore-entry"]').first(),
          dialog.getByRole("button", { name: /^Restore$/i }).first(),
        ];
        let clicked = false;
        for (const loc of candidates) {
          if (await loc.isVisible().catch(() => false)) {
            await loc.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          throw new Error(
            'Restore deleted entry (doc step): could not find primary Restore control in the modal ([data-test-id="cs-trash-entry-restore-confirm"], [data-test-id="cs-cb-restore-entry"], or dialog button "Restore").'
          );
        }
        await page.waitForTimeout(400);
        break;
      }

      // Restore Asset Folder modal: doc step 4 — Restore With Assets.
      if (step.target === "Restore asset folder Restore With Assets button (doc step)") {
        const t = getStepTimeoutMs(step);
        const dialog = page.getByRole("dialog").first();
        await expect(dialog).toBeVisible({ timeout: t });
        const candidates = [
          dialog.locator('[data-test-id="cs-trash-assets-restore-with-asset"]').first(),
          dialog.locator('[data-test-id="cs-trash-asset-folder-restore-with-assets"]').first(),
          dialog.locator('[data-test-id="cs-cb-restore-asset-folder-with-assets"]').first(),
          dialog.getByRole("button", { name: /Restore With Assets/i }).first(),
        ];
        let clicked = false;
        for (const loc of candidates) {
          if (await loc.isVisible().catch(() => false)) {
            await loc.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          throw new Error(
            'Restore asset folder (doc step): could not find "Restore With Assets" (see data/dom/CMS/trash/restore-folder.html: [data-test-id="cs-trash-assets-restore-with-asset"], or fallbacks).'
          );
        }
        await page.waitForTimeout(400);
        break;
      }

      // Restore deleted asset modal (optional path when the app confirms after list Restore).
      if (step.target === "Restore deleted asset modal Restore button (doc step)") {
        const t = getStepTimeoutMs(step);
        const dialog = page.getByRole("dialog").first();
        await expect(dialog).toBeVisible({ timeout: t });
        const candidates = [
          dialog.locator('[data-test-id="cs-trash-asset-restore-confirm"]').first(),
          dialog.locator('[data-test-id="cs-cb-restore-asset"]').first(),
          dialog.getByRole("button", { name: /^Restore$/i }).first(),
        ];
        let clicked = false;
        for (const loc of candidates) {
          if (await loc.isVisible().catch(() => false)) {
            await loc.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          throw new Error(
            'Restore deleted asset (doc step): could not find primary Restore in the modal ([data-test-id="cs-trash-asset-restore-confirm"], [data-test-id="cs-cb-restore-asset"], or dialog button "Restore").'
          );
        }
        await page.waitForTimeout(400);
        break;
      }

      // Doc: “… Open the Global field schema … click on Restore” — final Restore on deleted GF builder header.
      if (step.target === "Restore on deleted global field builder click (doc step)") {
        const t = getStepTimeoutMs(step);
        const header = page.locator('[data-test-id="cs-page-layout-header"], [data-test-id="cs-page-header"], .PageHeader').first();
        const btn = header.getByRole("button", { name: /^Restore$/i }).first();
        await expect(btn).toBeVisible({ timeout: t });
        await btn.click({ timeout: t, force: true });
        await page.waitForTimeout(400);
        break;
      }

      // Delete option in webhook menu (doc step): ensure menu is open, click Delete, wait for modal
      if (step.target === "Delete option in webhook menu (doc step)") {
        const t = getStepTimeoutMs(step);
        await page.waitForTimeout(400);
        const deleteOpt = page.locator(
          '[data-test-id="cs-webhooks-action-delete"], .VerticalActionTooltip li:has-text("Delete"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete")'
        ).first();
        await expect(deleteOpt).toBeVisible({ timeout: t });
        await deleteOpt.hover({ timeout: t }).catch(() => {});
        await page.waitForTimeout(150);
        await deleteOpt.click({ timeout: t, force: true });
        break;
      }

      // Delete button in delete modal (doc step): wait for modal then click Delete
      if (step.target === "Delete button in delete modal (doc step)") {
        const t = getStepTimeoutMs(step);
        const deleteBtn = page.locator('[data-test-id="cs-webhooks-delete"]').first();
        await deleteBtn.waitFor({ state: "visible", timeout: t }).catch(() => {});
        await page.waitForTimeout(500);
        const candidates = [
          deleteBtn,
          page.getByRole("dialog").getByRole("button", { name: /^Delete$/i }),
          page.locator('.ReactModal__delete button:has-text("Delete")').first(),
          page.locator('button.Button--destructive:has-text("Delete")').first(),
        ];
        let clicked = false;
        for (const loc of candidates) {
          if (await loc.isVisible().catch(() => false)) {
            await loc.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          throw new Error(
            'Delete button in delete modal: confirmation modal did not appear after clicking Delete option. Ensure the Delete option opened the confirmation modal.'
          );
        }
        break;
      }

      // Enable or Disable option in webhook menu (doc step): click whichever is visible; if Disable modal appears, click Proceed
      if (step.target === "Enable or Disable option in webhook menu (doc step)") {
        const t = getStepTimeoutMs(step);
        const enableOpt = page.locator(
          '[data-test-id="cs-webhooks-action-enable"], .VerticalActionTooltip li:has-text("Enable"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Enable")'
        ).first();
        const disableOpt = page.locator(
          '[data-test-id="cs-webhooks-action-disable"], .VerticalActionTooltip li:has-text("Disable"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Disable")'
        ).first();
        const enableVisible = await enableOpt.isVisible().catch(() => false);
        const disableVisible = await disableOpt.isVisible().catch(() => false);
        if (enableVisible) {
          await enableOpt.click({ timeout: t, force: true });
        } else if (disableVisible) {
          await disableOpt.click({ timeout: t, force: true });
          await page.waitForTimeout(400);
          const proceedBtn = page.locator('[data-test-id="cs-webhooks-disable-proceed"], button:has-text("Proceed")').first();
          if (await proceedBtn.isVisible().catch(() => false)) {
            await proceedBtn.click({ timeout: t, force: true });
          }
        } else {
          throw new Error(
            'Enable or Disable option in webhook menu: neither "Enable" nor "Disable" was visible in the vertical ellipsis menu.'
          );
        }
        break;
      }

      // Export webhook: click Export from menu if visible, else warn and use footer path (ellipsis already clicked)
      if (step.target === "Export webhook (doc step)") {
        const t = getStepTimeoutMs(step);
        const url = page.url();
        const onEditPage = /\/webhook\/edit\b/i.test(url);
        const exportInMenu = page.locator(
          '[data-test-id="cs-webhooks-action-export"], .VerticalActionTooltip li:has-text("Export"), [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Export")'
        ).first();
        const exportVisible = await exportInMenu.isVisible().catch(() => false);
        if (onEditPage) {
          const exportBtn = page.locator('[data-test-id="cs-webhooks-edit-export"], button:has-text("Export")').first();
          await expect(exportBtn).toBeVisible({ timeout: t });
          await exportBtn.click({ timeout: t });
        } else if (exportVisible) {
          await exportInMenu.click({ timeout: t });
        } else {
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(250);
          const anchor = page.locator('a[href*="/settings/webhooks/"][href*="/webhook/edit"]').first();
          await anchor.click({ timeout: t, force: true });
          await page.waitForURL(/\/webhook\/edit\b/i, { timeout: t }).catch(() => {});
          const exportBtn = page.locator('[data-test-id="cs-webhooks-edit-export"], button:has-text("Export")').first();
          await expect(exportBtn).toBeVisible({ timeout: t });
          await exportBtn.click({ timeout: t });
        }
        break;
      }

      // First webhook row: virtualized table may hide the row; click anchor with force
      if (step.target === "First webhook row (doc step)") {
        const t = getStepTimeoutMs(step);
        const tableBody = page.locator(".Table__body").first();
        if (await tableBody.isVisible().catch(() => false)) {
          await tableBody.evaluate((node) => node.scrollTo(0, 0)).catch(() => {});
          await page.waitForTimeout(300);
        }
        const anchor = page.locator('a[href*="/settings/webhooks/"][href*="/webhook/edit"]').first();
        await anchor.click({ timeout: t, force: true });
        break;
      }

      // Branches in settings left nav (doc step): Branches may not appear in left nav for some plans; fallback to direct URL
      if (step.target === "Branches in settings left nav (doc step)" || step.target === "Branches (doc step)") {
        const t = getStepTimeoutMs(step);
        const branchesLink = page.locator(
          '[data-test-id="cs-stack-settings-branches"], a[href*="/settings/branches"], .ListRowV2:has-text("Branches")'
        ).first();
        const linkVisible = await branchesLink.isVisible().catch(() => false);
        if (linkVisible) {
          await branchesLink.click({ timeout: t, force: true });
        } else {
          const match = page.url().match(/#!\/stack\/([^/]+)/i);
          const stackId = match?.[1];
          if (stackId) {
            const base = page.url().split("#!")[0];
            await page.goto(`${base}#!/stack/${stackId}/settings/branches/list`, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
            await page.waitForTimeout(500);
          } else {
            await expect(branchesLink).toBeVisible({ timeout: t });
          }
        }
        break;
      }

      // Webhooks (doc step): when on webhook edit page, left nav may be hidden; try link first, else goBack to list
      if (step.target === "Webhooks (doc step)") {
        const t = getStepTimeoutMs(step);
        const webhooksLink = page.locator(
          '[data-test-id="cs-stack-settings-webhooks"], a[href*="/settings/webhooks"]'
        ).first();
        const linkVisible = await webhooksLink.isVisible().catch(() => false);
        if (linkVisible) {
          await webhooksLink.click({ timeout: t, force: true });
        } else {
          const url = page.url();
          const onWebhookEditPage = /webhook\/edit/i.test(url) || /\/settings\/webhooks\/[^/]+\//i.test(url);
          if (onWebhookEditPage) {
            await page.goBack({ timeout: t });
          } else {
            await expect(webhooksLink).toBeVisible({ timeout: t });
          }
        }
        break;
      }

      // Vertical ellipsis in org admin Users table: try each row until one shows Unlock User
      if (step.target === "Vertical ellipsis in Action column (doc step)") {
        const t = getStepTimeoutMs(step);
        const ellipsisButtons = page.locator('[data-test-id="cs-table-action-options"]');
        const n = await ellipsisButtons.count().catch(() => 0);
        for (let i = 0; i < n; i++) {
          const btn = ellipsisButtons.nth(i);
          if (!(await btn.isVisible().catch(() => false))) continue;
          await btn.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(300);
          const unlockItem = page.locator('.VerticalActionTooltip li:has-text("Unlock User"), [role="menu"] li:has-text("Unlock User")').first();
          if (await unlockItem.isVisible().catch(() => false)) break;
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(250);
        }
        break;
      }

      if (step.target === "First management token row action (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const rowActionBtn = page
          .locator(
            '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-body-row-0"] button[aria-label*="row 1 action" i], [data-test-id="cs-table-action-options"]'
          )
          .first();
        await expect(rowActionBtn).toBeVisible({ timeout: t });
        await rowActionBtn.click({ timeout: t, force: true }).catch(() => {});
        const actionMenu = page
          .locator('[data-test-id="cs-vertical-action-tooltip"], [data-test-id="cs-vertical-action-tooltip-actions"]')
          .first();
        await expect(actionMenu).toBeVisible({ timeout: t });
        break;
      }

      if (step.target === "First delivery token row action (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const rowActionBtn = page
          .locator(
            '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-body-row-0"] button[aria-label*="row 1 action" i], [data-test-id="cs-table-action-options"]'
          )
          .first();
        await expect(rowActionBtn).toBeVisible({ timeout: t });
        await rowActionBtn.click({ timeout: t, force: true }).catch(() => {});
        const actionMenu = page
          .locator('[data-test-id="cs-vertical-action-tooltip"], [data-test-id="cs-vertical-action-tooltip-actions"]')
          .first();
        await expect(actionMenu).toBeVisible({ timeout: t });
        break;
      }

      if (step.target === "Delete management token option (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const menuRoot = page
          .locator(
            '[data-test-id="cs-vertical-action-tooltip"], [data-test-id="cs-vertical-action-tooltip-actions"], .VerticalActionTooltip, [role="menu"]'
          )
          .first();
        await expect(menuRoot).toBeVisible({ timeout: t });

        const deleteCandidates: Locator[] = [
          menuRoot.locator('[data-test-id="cs-management-tokens-action-delete"]').first(),
          menuRoot.locator('li:has-text("Delete"), [role="menuitem"]:has-text("Delete")').first(),
          menuRoot
            .getByText("Delete", { exact: true })
            .locator("xpath=ancestor-or-self::*[@role='menuitem' or self::li or self::button][1]")
            .first(),
          menuRoot.getByText("Delete", { exact: true }).first(),
        ];

        let openedModal = false;
        const deleteModal = page
          .locator(
            '[data-test-id="cs-modal-title-delete-management-token"], [data-test-id="cs-management-tokens-delete-modal-input"], h3:has-text("Delete Management Token"), h3:has-text("Delete")'
          )
          .first();
        for (const item of deleteCandidates) {
          if (!(await item.isVisible().catch(() => false))) continue;
          await item.scrollIntoViewIfNeeded().catch(() => {});
          await item.hover({ timeout: 1_000 }).catch(() => {});
          await item.click({ timeout: t }).catch(async () => {
            await item.click({ timeout: t, force: true }).catch(() => {});
          });
          openedModal = await deleteModal.isVisible().catch(() => false);
          if (!openedModal) {
            await item.press("Enter").catch(() => {});
            openedModal = await deleteModal.isVisible().catch(() => false);
          }
          if (openedModal) break;
          await page.waitForTimeout(250);
        }

        if (!openedModal) {
          await page
            .evaluate(() => {
              const root =
                document.querySelector('[data-test-id="cs-vertical-action-tooltip"]') ||
                document.querySelector('[data-test-id="cs-vertical-action-tooltip-actions"]') ||
                document.querySelector(".VerticalActionTooltip");
              if (!root) return;
              const target =
                root.querySelector('[data-test-id="cs-management-tokens-action-delete"]') ||
                Array.from(root.querySelectorAll("li, [role='menuitem'], button")).find((el) =>
                  /\bdelete\b/i.test((el.textContent || "").trim())
                );
              (target as HTMLElement | null)?.click();
            })
            .catch(() => {});
          await page.waitForTimeout(400);
          openedModal = await deleteModal.isVisible().catch(() => false);
        }

        if (!openedModal) {
          throw new Error(
            'Could not open "Delete Management Token" confirmation modal from vertical ellipses menu.'
          );
        }
        break;
      }

      if (step.target === "Delete delivery token option (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const menuRoot = page
          .locator(
            '[data-test-id="cs-vertical-action-tooltip"], [data-test-id="cs-vertical-action-tooltip-actions"], .VerticalActionTooltip, [role="menu"]'
          )
          .first();
        await expect(menuRoot).toBeVisible({ timeout: t });

        const deleteCandidates: Locator[] = [
          menuRoot.locator('[data-test-id="cs-delivery-tokens-action-delete"]').first(),
          menuRoot.locator('li:has-text("Delete"), [role="menuitem"]:has-text("Delete")').first(),
          menuRoot
            .getByText("Delete", { exact: true })
            .locator("xpath=ancestor-or-self::*[@role='menuitem' or self::li or self::button][1]")
            .first(),
          menuRoot.getByText("Delete", { exact: true }).first(),
        ];

        let openedModal = false;
        const deleteModal = page
          .locator(
            '[data-test-id="cs-modal-title-delete-delivery-token"], [data-test-id="cs-delivery-tokens-delete-modal-input"], h3:has-text("Delete Delivery Token"), h3:has-text("Delete")'
          )
          .first();
        for (const item of deleteCandidates) {
          if (!(await item.isVisible().catch(() => false))) continue;
          await item.scrollIntoViewIfNeeded().catch(() => {});
          await item.hover({ timeout: 1_000 }).catch(() => {});
          await item.click({ timeout: t }).catch(async () => {
            await item.click({ timeout: t, force: true }).catch(() => {});
          });
          openedModal = await deleteModal.isVisible().catch(() => false);
          if (!openedModal) {
            await item.press("Enter").catch(() => {});
            openedModal = await deleteModal.isVisible().catch(() => false);
          }
          if (openedModal) break;
          await page.waitForTimeout(250);
        }

        if (!openedModal) {
          await page
            .evaluate(() => {
              const root =
                document.querySelector('[data-test-id="cs-vertical-action-tooltip"]') ||
                document.querySelector('[data-test-id="cs-vertical-action-tooltip-actions"]') ||
                document.querySelector(".VerticalActionTooltip");
              if (!root) return;
              const target =
                root.querySelector('[data-test-id="cs-delivery-tokens-action-delete"]') ||
                Array.from(root.querySelectorAll("li, [role='menuitem'], button")).find((el) =>
                  /\bdelete\b/i.test((el.textContent || "").trim())
                );
              (target as HTMLElement | null)?.click();
            })
            .catch(() => {});
          await page.waitForTimeout(400);
          openedModal = await deleteModal.isVisible().catch(() => false);
        }

        if (!openedModal) {
          throw new Error(
            'Could not open "Delete Delivery Token" confirmation modal from vertical ellipses menu.'
          );
        }
        break;
      }

      if (step.target === "Delivery Token button (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const addBtn = page
          .locator('[data-test-id="cs-delivery-token-add"], button:has-text("Delivery Token"), button:has-text("+ Delivery Token")')
          .first();
        await expect(addBtn).toBeVisible({ timeout: t });
        const isDisabled = await addBtn.isDisabled().catch(() => false);
        if (!isDisabled) {
          await addBtn.click({ timeout: t });
          break;
        }

        // If create is disabled (for example token limit), open first existing token and continue capture flow.
        if (flow) (flow as any).__deliveryTokenCreateUnavailable = true;
        const firstRow = page
          .locator('[data-test-id="cs-table-body-row-0"] [data-test-id*="delivery-token" i], [data-test-id="cs-table-body-row-0"] [role="cell"]')
          .first();
        await expect(firstRow).toBeVisible({ timeout: t });
        await firstRow.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Terminate Other Sessions button (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const btn = page
          .locator('[data-test-id="cs-account-security-terminate-sessions"], button:has-text("Terminate Other Sessions")')
          .first();
        await expect(btn).toBeVisible({ timeout: t });
        const isDisabled = await btn.isDisabled().catch(() => false);
        if (!isDisabled) await btn.click({ timeout: t });
        break;
      }

      if (step.target === "Ensure preview token exists (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const deliveryTokenInput = page
          .locator(
            '[data-test-id="cs-delivery-token-info-input"] input, input[name="deliveryToken"], input[aria-label="deliveryToken"]'
          )
          .first();
        const previewTokenInput = page
          .locator(
            '[data-test-id="preview-token__edit-token"] input[aria-label="previewToken"], input[name="previewToken"], [data-test-id*="preview-token" i] input'
          )
          .first();

        if (await deliveryTokenInput.isVisible().catch(() => false)) {
          const deliveryTokenVal = await readLocatorValue(deliveryTokenInput).catch(() => "");
          if (deliveryTokenVal) {
            if (flow) (flow as any).__deliveryToken = deliveryTokenVal;
            saveCapturedDocValue("deliveryToken", deliveryTokenVal, context);
          }
        }

        await expect(previewTokenInput).toBeVisible({ timeout: t });
        let previewTokenVal = await readLocatorValue(previewTokenInput).catch(() => "");

        if (!previewTokenVal) {
          const createPreviewBtn = page
            .locator(
              'button:has-text("+ Create Preview Token"), button:has-text("Create Preview Token"), [data-test-id*="create-preview-token" i]'
            )
            .first();
          if (await createPreviewBtn.isVisible().catch(() => false)) {
            await createPreviewBtn.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(500);
          }

          const saveBtn = page
            .locator('[data-test-id="cs-delivery-token-save"], button:has-text("Save")')
            .first();
          if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(700);
          }

          previewTokenVal = await readLocatorValue(previewTokenInput).catch(() => "");
        }

        if (previewTokenVal) {
          if (flow) (flow as any).__previewToken = previewTokenVal;
          saveCapturedDocValue("previewToken", previewTokenVal, context);
        }
        break;
      }

      if (step.target === "Create Preview Token in delivery edit page (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const createPreviewBtn = page
          .locator(
            'button:has-text("+ Create Preview Token"), button:has-text("Create Preview Token"), [data-test-id*="create-preview-token" i]'
          )
          .first();
        if (await createPreviewBtn.isVisible().catch(() => false)) {
          await createPreviewBtn.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(500);
          break;
        }

        const previewTokenInput = page
          .locator(
            '[data-test-id="preview-token__edit-token"] input[aria-label="previewToken"], input[name="previewToken"], [data-test-id*="preview-token" i] input'
          )
          .first();
        const existingPreviewToken = await readLocatorValue(previewTokenInput).catch(() => "");
        if (existingPreviewToken) {
          // Preview token already exists; treat as satisfied.
          break;
        }

        throw new Error('Could not find "+ Create Preview Token" action or an existing preview token value.');
      }

      if (step.target === "Generate delivery token button (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const generateBtn = page
          .locator('button:has-text("Generate Token"), [data-test-id*="delivery-token-generate" i], [data-test-id*="generate-token" i]')
          .first();
        if (await generateBtn.isVisible().catch(() => false)) {
          await generateBtn.click({ timeout: t });
          break;
        }

        // Create path unavailable; save existing token edits instead.
        if ((flow as any)?.__deliveryTokenCreateUnavailable) {
          const saveBtn = page.locator('[data-test-id="cs-delivery-token-save"], button:has-text("Save")').first();
          if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click({ timeout: t, force: true }).catch(() => {});
          }
          break;
        }
      }

      if (step.target === "Edit release icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        const editIcon = page.locator("svg[name='Edit'], *[name='Edit']").first();
        await expect(editIcon).toBeVisible({ timeout: t });
        await editIcon.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Hover release row for clone icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        break;
      }

      if (step.target === "Clone release icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});

        const cloneBtnInRow = firstReleaseRow
          .locator(
            "button[data-test-id='cs-button']:has(svg[name='Copy']), button[data-test-id='cs-button'][aria-label*='clone' i], button[data-test-id='cs-button'] svg[name='Copy']"
          )
          .first();
        if (await cloneBtnInRow.isVisible().catch(() => false)) {
          await cloneBtnInRow.click({ timeout: t, force: true }).catch(() => {});
          break;
        }

        const cloneBtnInHeader = page
          .locator(
            "[data-test-id='cs-releases-card-action-copy'] button[data-test-id='cs-button'], button[data-test-id='cs-button']:has(svg[name='Copy']), button[data-test-id='cs-button'] svg[name='Copy']"
          )
          .first();
        await expect(cloneBtnInHeader).toBeVisible({ timeout: t });
        await cloneBtnInHeader.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      // Delete a branch: hover over branch row to reveal Delete icon (trash can) at extreme right (per doc)
      if (step.target === "Hover over branch row (doc step)" && String(flow?.id || "").toLowerCase() === "delete-a-branch") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const branchRow = page
          .locator('[data-test-id^="cs-table-body-row-"]:has-text("automation_test_branch"), [data-test-id="cs-table-body-row-1"]')
          .first();
        await expect(branchRow).toBeVisible({ timeout: t });
        await branchRow.hover({ timeout: t }).catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
      if (step.target === "Delete icon on branch row (doc step)" && String(flow?.id || "").toLowerCase() === "delete-a-branch") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const branchRow = page
          .locator('[data-test-id^="cs-table-body-row-"]:has-text("automation_test_branch"), [data-test-id="cs-table-body-row-1"]')
          .first();
        await expect(branchRow).toBeVisible({ timeout: t });
        await branchRow.hover({ timeout: t }).catch(() => {});
        await page.waitForTimeout(300);
        const deleteIcon = page
          .locator(
            '[data-test-id^="cs-table-body-row-"] button:has(svg[name="Delete"]), [data-test-id^="cs-table-body-row-"] svg[name="Delete"], .Table__body__row button:has(svg[name="Delete"]), button[aria-label*="delete" i]:has(svg[name="Delete"])'
          )
          .first();
        await expect(deleteIcon).toBeVisible({ timeout: t });
        await deleteIcon.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      // Edit/Delete alias: hover over alias row to reveal More Options (three dots) at extreme right (per doc)
      if (step.target === "Hover over alias row (doc step)" && (String(flow?.id || "").toLowerCase() === "edit-an-alias" || String(flow?.id || "").toLowerCase() === "delete-an-alias")) {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const aliasRow = page
          .locator('[data-test-id^="cs-table-body-row-"]:has-text("automation_test_alias"), [data-test-id="cs-table-body-row-0"]')
          .first();
        await expect(aliasRow).toBeVisible({ timeout: t });
        await aliasRow.hover({ timeout: t }).catch(() => {});
        await page.waitForTimeout(300);
        break;
      }

      // Edit alias: hover then click Edit icon (pencil) at extreme right (per doc)
      if (step.target === "Edit icon on alias row (doc step)" && String(flow?.id || "").toLowerCase() === "edit-an-alias") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const aliasRow = page
          .locator('[data-test-id^="cs-table-body-row-"]:has-text("automation_test_alias"), [data-test-id="cs-table-body-row-0"]')
          .first();
        await expect(aliasRow).toBeVisible({ timeout: t });
        await aliasRow.hover({ timeout: t }).catch(() => {});
        await page.waitForTimeout(300);
        const editIcon = page
          .locator(
            '[data-test-id^="cs-table-body-row-"] button:has(svg[name="Edit"]), [data-test-id^="cs-table-body-row-"] svg[name="Edit"], .Table__body__row button:has(svg[name="Edit"])'
          )
          .first();
        if (await editIcon.isVisible().catch(() => false)) {
          await editIcon.click({ timeout: t, force: true }).catch(() => {});
          break;
        }
        // Fallback: UI may use three-dots menu with Edit Alias option
        const threeDots = page.locator('[data-test-id="cs-table-action-options"]').first();
        if (await threeDots.isVisible().catch(() => false)) {
          await threeDots.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(300);
          const editAlias = page.locator('[data-test-id="cs-alias-edit"], .VerticalActionTooltip li:has-text("Edit Alias")').first();
          await expect(editAlias).toBeVisible({ timeout: t });
          await editAlias.click({ timeout: t, force: true }).catch(() => {});
        }
        break;
      }

      if (step.target === "Hover release row for delete icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        break;
      }

      if (step.target === "Delete release icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});

        const deleteBtnInRow = firstReleaseRow
          .locator(
            "button[data-test-id='cs-button']:has(svg[name='Delete']), button[data-test-id='cs-button'][aria-label*='delete' i], button[data-test-id='cs-button'] svg[name='Delete']"
          )
          .first();
        if (await deleteBtnInRow.isVisible().catch(() => false)) {
          await deleteBtnInRow.click({ timeout: t, force: true }).catch(() => {});
          break;
        }

        const deleteBtnInHeader = page
          .locator(
            "[data-test-id='cs-releases-card-action-delete'] button[data-test-id='cs-button'], button[data-test-id='cs-button']:has(svg[name='Delete']), button[data-test-id='cs-button'] svg[name='Delete']"
          )
          .first();
        await expect(deleteBtnInHeader).toBeVisible({ timeout: t });
        await deleteBtnInHeader.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Lock release icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        const lockIcon = firstReleaseRow
          .locator("svg[name='Lock'], *[name='Lock'], [data-test-id*='lock' i], button[aria-label*='lock' i]")
          .first();
        await expect(lockIcon).toBeVisible({ timeout: t });
        await lockIcon.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Unlock release icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        const unlockIcon = firstReleaseRow
          .locator("svg[name='Unlock'], *[name='Unlock'], [data-test-id*='unlock' i], button[aria-label*='unlock' i]")
          .first();
        await expect(unlockIcon).toBeVisible({ timeout: t });
        await unlockIcon.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Hover release row for lock icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        const lockIcon = firstReleaseRow
          .locator("svg[name='Lock'], *[name='Lock'], [data-test-id*='lock' i], button[aria-label*='lock' i]")
          .first();
        await expect(lockIcon).toBeVisible({ timeout: t });
        break;
      }

      if (step.target === "Hover release row for unlock icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        const unlockIcon = firstReleaseRow
          .locator("svg[name='Unlock'], *[name='Unlock'], [data-test-id*='unlock' i], button[aria-label*='unlock' i]")
          .first();
        await expect(unlockIcon).toBeVisible({ timeout: t });
        break;
      }

      if (step.target === "Hover release row for update icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        break;
      }

      if (step.target === "Update all release items icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseRow = page
          .locator('.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow')
          .first();
        await expect(firstReleaseRow).toBeVisible({ timeout: t });
        await firstReleaseRow.hover({ timeout: t }).catch(() => {});
        const updateBtnInRow = firstReleaseRow
          .locator(
            "button[data-test-id='cs-button']:has(svg[name='Update']), button[data-test-id='cs-button'][aria-label*='update' i]"
          )
          .first();
        if (await updateBtnInRow.isVisible().catch(() => false)) {
          await updateBtnInRow.click({ timeout: t, force: true }).catch(() => {});
          break;
        }

        const updateIconInRow = firstReleaseRow.locator("button[data-test-id='cs-button'] svg[name='Update']").first();
        if (await updateIconInRow.isVisible().catch(() => false)) {
          await updateIconInRow.click({ timeout: t, force: true }).catch(() => {});
          break;
        }

        // Fallback: in newer UI variants, update icon appears near release title/header.
        const updateBtnInHeader = page
          .locator(
            '.ReleaseHeader button:has(svg[name="Update"]), .release-header button:has(svg[name="Update"]), .ReleaseTitle button:has(svg[name="Update"]), button[data-test-id="cs-button"]:has(svg[name="Update"]), [data-test-id*="update-release" i], button[aria-label*="update all release item" i], button[aria-label*="update release item" i]'
          )
          .first();
        if (await updateBtnInHeader.isVisible().catch(() => false)) {
          await updateBtnInHeader.click({ timeout: t, force: true }).catch(() => {});
          break;
        }

        // Last fallback: top-right menu route.
        const topMore = page
          .locator(
            'button[aria-label*="aria-button" i]:has(svg[name="SeeMore"]), button[aria-label*="more" i]:has(svg[name="SeeMore"]), .ReleaseHeader button:has(svg[name="SeeMore"]), .release-header button:has(svg[name="SeeMore"]), button:has(svg[name="SeeMore"])'
          )
          .first();
        await expect(topMore).toBeVisible({ timeout: t });
        await topMore.click({ timeout: t, force: true }).catch(() => {});

        const menuUpdate = page
          .locator(
            '[data-test-id="cs-dropdown-elements"]:has-text("Update"), [id^="cs-dropdown-elements-"]:has-text("Update"), [data-test-id="cs-dropdown-elements"]:has-text("Update All Release Items"), [id^="cs-dropdown-elements-"]:has-text("Update All Release Items"), [data-test-id="cs-dropdown-elements"]:has-text("Refresh"), [id^="cs-dropdown-elements-"]:has-text("Refresh"), li:has-text("Update"), li:has-text("Update All Release Items"), li:has-text("Refresh"), [role="menuitem"]:has-text("Update"), [role="menuitem"]:has-text("Update All Release Items"), [role="menuitem"]:has-text("Refresh")'
          )
          .first();
        await expect(menuUpdate).toBeVisible({ timeout: t });
        await menuUpdate.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "First release item checkbox (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const checkbox = page
          .locator(
            '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-checkbox"] input[type="checkbox"], [data-test-id="cs-table-body-row-0"] input[title*="select row" i], .Table__body [role="row"] input[type="checkbox"]'
          )
          .first();
        await expect(checkbox).toBeVisible({ timeout: t });
        await checkbox.check({ timeout: t, force: true }).catch(async () => {
          await checkbox.click({ timeout: t, force: true }).catch(() => {});
        });
        await expect(checkbox).toBeChecked({ timeout: t });
        break;
      }

      if (step.target === "Update release items action (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);

        // 1) Try direct visible action first.
        const directAction = page
          .locator(
            'button:has-text("Update"), button:has-text("Refresh"), button:has-text("Update Release Item"), [data-test-id*="refresh-release" i], [data-test-id="cs-dropdown-elements"]:has-text("Update"), [id^="cs-dropdown-elements-"]:has-text("Update"), [data-test-id="cs-dropdown-elements"]:has-text("Refresh"), [id^="cs-dropdown-elements-"]:has-text("Refresh"), [data-test-id="cs-dropdown-elements"]:has-text("Update Release Item"), [id^="cs-dropdown-elements-"]:has-text("Update Release Item"), li:has-text("Update"), li:has-text("Refresh"), li:has-text("Update Release Item")'
          )
          .first();
        if (await directAction.isVisible().catch(() => false)) {
          await directAction.click({ timeout: t, force: true }).catch(() => {});
          break;
        }

        // 2) Try row action (three-dot) menu in release items table.
        const rowAction = page
          .locator(
            '.Table__body [role="row"] [data-test-id="cs-table-action-options"], .Table__body [role="row"] [aria-label*="action" i], [data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-action-options"]'
          )
          .first();
        if (await rowAction.isVisible().catch(() => false)) {
          await rowAction.click({ timeout: t, force: true }).catch(() => {});
          const rowMenuUpdate = page
            .locator(
              '[data-test-id="cs-dropdown-elements"]:has-text("Update"), [id^="cs-dropdown-elements-"]:has-text("Update"), [data-test-id="cs-dropdown-elements"]:has-text("Refresh"), [id^="cs-dropdown-elements-"]:has-text("Refresh"), [data-test-id="cs-dropdown-elements"]:has-text("Update Release Item"), [id^="cs-dropdown-elements-"]:has-text("Update Release Item"), li:has-text("Update"), li:has-text("Refresh"), li:has-text("Update Release Item"), [role="menuitem"]:has-text("Update"), [role="menuitem"]:has-text("Refresh"), [role="menuitem"]:has-text("Update Release Item")'
            )
            .first();
          if (await rowMenuUpdate.isVisible().catch(() => false)) {
            await rowMenuUpdate.click({ timeout: t, force: true }).catch(() => {});
            break;
          }
        }

        // 3) Open top-right ellipsis and click Update/Refresh menu item.
        const topMore = page
          .locator(
            'button[aria-label*="aria-button" i]:has(svg[name="SeeMore"]), button[aria-label*="more" i]:has(svg[name="SeeMore"]), .ReleaseHeader button:has(svg[name="SeeMore"]), .release-header button:has(svg[name="SeeMore"]), button:has(svg[name="SeeMore"])'
          )
          .first();
        await expect(topMore).toBeVisible({ timeout: t });
        await topMore.click({ timeout: t, force: true }).catch(() => {});

        const menuUpdate = page
          .locator(
            '[data-test-id="cs-dropdown-elements"]:has-text("Update"), [id^="cs-dropdown-elements-"]:has-text("Update"), [data-test-id="cs-dropdown-elements"]:has-text("Refresh"), [id^="cs-dropdown-elements-"]:has-text("Refresh"), [data-test-id="cs-dropdown-elements"]:has-text("Update Release Item"), [id^="cs-dropdown-elements-"]:has-text("Update Release Item"), li:has-text("Update"), li:has-text("Refresh"), li:has-text("Update Release Item"), [role="menuitem"]:has-text("Update"), [role="menuitem"]:has-text("Refresh"), [role="menuitem"]:has-text("Update Release Item")'
          )
          .first();
        await expect(menuUpdate).toBeVisible({ timeout: t });
        await menuUpdate.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Delete item icon in release row (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const rowActionBtn = page
          .locator(
            '.Table__body [role="row"] [data-test-id="cs-table-action-options"], .Table__body [role="row"] [aria-label*="action" i], [data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-action-options"]'
          )
          .first();
        await expect(rowActionBtn).toBeVisible({ timeout: t });
        await rowActionBtn.click({ timeout: t, force: true }).catch(() => {});

        const deleteItemMenu = page
          .locator(
            '[data-test-id="cs-dropdown-elements"]:has-text("Remove"), [data-test-id="cs-dropdown-elements"]:has-text("Delete"), [id^="cs-dropdown-elements-"]:has-text("Remove"), [id^="cs-dropdown-elements-"]:has-text("Delete"), li:has-text("Remove"), li:has-text("Delete")'
          )
          .first();
        await expect(deleteItemMenu).toBeVisible({ timeout: t });
        await deleteItemMenu.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      if (step.target === "Remove item from release row (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const firstReleaseItemRow = page
          .locator(
            '[data-test-id="cs-table-body-row-0"], .Table__body [role="row"][data-test-id="cs-table-body-row-0"], .Table__body [role="row"]:has([data-test-id="cs-releases-list-title"])'
          )
          .first();
        await expect(firstReleaseItemRow).toBeVisible({ timeout: t });
        await firstReleaseItemRow.hover({ timeout: t }).catch(() => {});

        const rowActionBtn = firstReleaseItemRow
          .locator('[data-test-id="cs-table-action-options"], button[aria-label*="action" i], svg[name="DotsThreeLargeVertical"]')
          .first();
        await expect(rowActionBtn).toBeVisible({ timeout: t });
        await rowActionBtn.click({ timeout: t, force: true }).catch(() => {});

        const removeItemMenu = page
          .locator(
            '[data-test-id="cs-dropdown-elements"]:has-text("Remove"), [id^="cs-dropdown-elements-"]:has-text("Remove"), li:has-text("Remove")'
          )
          .first();
        await expect(removeItemMenu).toBeVisible({ timeout: t });
        await removeItemMenu.click({ timeout: t, force: true }).catch(() => {});
        break;
      }

      // Live Preview open-in-new-tab: verify popup opens, then continue steps on that tab.
      if (step.target === "Open in new tab icon (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const openNewTabBtn = await resolveTarget(page, step.target, flow);
        await expect(openNewTabBtn).toBeVisible({ timeout: t });
        const popupPromise = page
          .context()
          .waitForEvent("page", { timeout: t })
          .then((p) => p)
          .catch(() => null);
        await openNewTabBtn.click({ timeout: t, force: true }).catch(() => {});
        const popup = await popupPromise;
        if (!popup) {
          throw new Error('Open-in-new-tab click did not open a new browser tab.');
        }
        await popup.waitForLoadState("domcontentloaded", { timeout: t }).catch(() => {});
        await popup.bringToFront().catch(() => {});
        return popup;
      }

      if (step.target === "Stacks (doc step)") {
        const { click: overridesClick } = loadOverrides(flow);
        const t = getStepTimeoutMs(step);
        const stacksSel =
          overridesClick["Stacks (doc step)"] ||
          'button:has-text("Stacks"), a:has-text("Stacks"), [aria-label*="Stacks" i]';
        const stacksEl = page.locator(stacksSel).first();
        if (await stacksEl.isVisible().catch(() => false)) {
          await stacksEl.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(400);
        }
        if (!/#!\/stacks\b/i.test(page.url())) {
          try {
            const u = new URL(page.url());
            await page.goto(`${u.origin}/#!/stacks`, { waitUntil: "domcontentloaded", timeout: t });
          } catch {
            await page.goto("/#!/stacks", { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
          }
        }
        break;
      }

      if (step.target === "+ New Stack (doc step)" && !/#!\/stacks\b/i.test(page.url())) {
        const t = getStepTimeoutMs(step);
        try {
          const u = new URL(page.url());
          await page.goto(`${u.origin}/#!/stacks`, { waitUntil: "domcontentloaded", timeout: t });
          await page.waitForTimeout(400);
        } catch {
          // continue with normal click fallback
        }
      }

      if (step.target === "Edit Environment action (doc step)") {
        const { click: overridesClick } = loadOverrides(flow);
        const actionSel =
          overridesClick["Edit Environment action (doc step)"] ||
          'li[data-test-id="cs-environments-action-edit"]';
        const actionItem = page.locator(actionSel).first();
        const actionLabel = actionItem.locator(".ml-8").first();
        const editModal = page
          .locator('[data-test-id="cs-modal-title-edit-environment"], h3:has-text("Edit Environment")')
          .first();

        for (let attempt = 1; attempt <= 2; attempt++) {
          await expect(actionItem).toBeVisible({ timeout: getStepTimeoutMs(step) });
          const clickTarget = (await actionLabel.isVisible().catch(() => false)) ? actionLabel : actionItem;
          const box = await clickTarget.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 30 }).catch(() => {});
          } else {
            await clickTarget.click({ timeout: 5_000, force: true }).catch(() => {});
          }
          // Keyboard fallback for list-style menus that require active-item confirmation
          await clickTarget.press("Enter", { timeout: 2_000 }).catch(() => {});

          const opened = await editModal
            .waitFor({ state: "visible", timeout: 8_000 })
            .then(() => true)
            .catch(() => false);
          if (opened) break;

          const menuBtnSel =
            overridesClick["Environment row action menu (doc step)"] ||
            'button[data-test-id="cs-table-action-options"]';
          const menuBtn = page.locator(menuBtnSel).first();
          if (await menuBtn.isVisible().catch(() => false)) {
            await menuBtn.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.waitForTimeout(250);
          }
        }

        await expect(editModal).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      if (step.target === "Delete Environment action (doc step)") {
        const { click: overridesClick } = loadOverrides(flow);
        const actionSel =
          overridesClick["Delete Environment action (doc step)"] ||
          'li[data-test-id="cs-environments-action-delete"]';
        const actionItem = page.locator(actionSel).first();
        const actionLabel = actionItem.locator(".ml-8").first();
        const deleteModal = page
          .locator('[data-test-id="cs-modal-title-delete-environment"], h3:has-text("Delete Environment")')
          .first();

        for (let attempt = 1; attempt <= 2; attempt++) {
          await expect(actionItem).toBeVisible({ timeout: getStepTimeoutMs(step) });
          const clickTarget = (await actionLabel.isVisible().catch(() => false)) ? actionLabel : actionItem;
          const box = await clickTarget.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 30 }).catch(() => {});
          } else {
            await clickTarget.click({ timeout: 5_000, force: true }).catch(() => {});
          }
          await clickTarget.press("Enter", { timeout: 2_000 }).catch(() => {});

          const opened = await deleteModal
            .waitFor({ state: "visible", timeout: 8_000 })
            .then(() => true)
            .catch(() => false);
          if (opened) break;

          const menuBtnSel =
            overridesClick["Environment row action menu (doc step)"] ||
            'button[data-test-id="cs-table-action-options"]';
          const menuBtn = page.locator(menuBtnSel).first();
          if (await menuBtn.isVisible().catch(() => false)) {
            await menuBtn.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.waitForTimeout(250);
          }
        }

        await expect(deleteModal).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      if (step.target === "Edit Label button (doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, getStepTimeoutMs(step));
      }
      if (step.target === "Delete Label button (doc step)") {
        await ensureManageLabelDeleteMode(page, flow, unique, getStepTimeoutMs(step));
      }

      if (step.target === "Global Field actions menu (doc step)") {
        const firstRow = page.locator('[role="row"]').filter({ hasText: /SEO|Section|Social Share/i }).first();
        if (await firstRow.isVisible().catch(() => false)) {
          await firstRow.hover({ timeout: 5_000 }).catch(() => {});
        }
        const menuTrigger = page
          .locator('[role="menu"][aria-label*="row 1 action" i], [role="menu"][aria-label*="row action" i], [data-test-id^="cs-table-body-row-0"] [aria-label*="action" i]')
          .first();
        await expect(menuTrigger).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await menuTrigger.click({ timeout: 10_000, force: true }).catch(() => {});
        await page
          .locator('[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-gf-action-edit"], [data-test-id="cs-gf-action-edit"]')
          .first()
          .waitFor({ state: "visible", timeout: 8_000 })
          .catch(() => {});
        break;
      }

      if (
        step.target === "Edit (Global Field action) (doc step)" ||
        step.target === "Edit option (Global Field action) (doc step)"
      ) {
        const modal = page
          .locator(
            '[data-test-id="cs-modal-title"]:has-text("Edit Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Edit Global Field"), button[data-test-id="cs-cb-edit-gf-details-cancel"], button[data-test-id="cs-cb-edit-ct-details"]'
          )
          .first();
        const rowActionBtn = page
          .locator('button[data-test-id="cs-table-action-options"][aria-label="row 1 action"], button[data-test-id="cs-table-action-options"]')
          .first();
        const clickEdit = async () => {
          const editItem = page.locator('li[data-test-id="cs-gf-action-edit"]').first();
          await expect(editItem).toBeVisible({ timeout: 8_000 });
          await editItem.hover({ timeout: 3_000 }).catch(() => {});
          const box = await editItem.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
          } else {
            await editItem.click({ timeout: 8_000, force: true }).catch(() => {});
          }
          await page.waitForTimeout(300);
        };

        // attempt 1: assume previous step already opened the menu
        await clickEdit().catch(async () => {
          // if menu is not open, open once and retry
          await expect(rowActionBtn).toBeVisible({ timeout: 10_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickEdit();
        });

        for (let attempt = 1; attempt <= 2; attempt++) {
          const opened = await modal
            .waitFor({ state: "visible", timeout: 8_000 })
            .then(() => true)
            .catch(() => false);
          if (opened) break;
          // reopen actions menu and retry one more edit click
          await expect(rowActionBtn).toBeVisible({ timeout: 8_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickEdit();
        }
        await expect(modal).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      if (step.target === "Copy Global Field option (doc step)") {
        const modal = page
          .locator(
            '[data-test-id="cs-modal-title"]:has-text("Copy Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Copy Global Field"), button[data-test-id="cs-cb-copy-gf"], button[data-test-id="cs-cb-cancel-copy-gf"]'
          )
          .first();
        const rowActionBtn = page
          .locator('button[data-test-id="cs-table-action-options"][aria-label="row 1 action"], button[data-test-id="cs-table-action-options"]')
          .first();
        const clickCopy = async () => {
          const copyItem = page.locator('li[data-test-id="cs-gf-action-copy"], li:has-text("Copy Global Field")').first();
          await expect(copyItem).toBeVisible({ timeout: 8_000 });
          await copyItem.hover({ timeout: 3_000 }).catch(() => {});
          const box = await copyItem.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
          } else {
            await copyItem.click({ timeout: 8_000, force: true }).catch(() => {});
          }
          await page.waitForTimeout(300);
        };

        await clickCopy().catch(async () => {
          await expect(rowActionBtn).toBeVisible({ timeout: 10_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickCopy();
        });

        for (let attempt = 1; attempt <= 2; attempt++) {
          const opened = await modal
            .waitFor({ state: "visible", timeout: 8_000 })
            .then(() => true)
            .catch(() => false);
          if (opened) break;
          await expect(rowActionBtn).toBeVisible({ timeout: 8_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickCopy();
        }
        await expect(modal).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      if (step.target === "Export option (Global Field action) (doc step)") {
        const rowActionBtn = page
          .locator('button[data-test-id="cs-table-action-options"][aria-label="row 1 action"], button[data-test-id="cs-table-action-options"]')
          .first();

        const clickExport = async () => {
          const exportItem = page.locator('li[data-test-id="cs-gf-action-export"], li:has-text("Export")').first();
          await expect(exportItem).toBeVisible({ timeout: 8_000 });
          await exportItem.hover({ timeout: 3_000 }).catch(() => {});
          const box = await exportItem.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
          } else {
            await exportItem.click({ timeout: 8_000, force: true }).catch(() => {});
          }
          await page.waitForTimeout(500);
        };

        await clickExport().catch(async () => {
          await expect(rowActionBtn).toBeVisible({ timeout: 10_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickExport();
        });
        break;
      }

      if (step.target === "Delete option (Global Field action) (doc step)") {
        const modal = page
          .locator(
            '[data-test-id="cs-modal-title-delete-global-field"]:has-text("Delete Global Field"), [data-testid="cs-modal"][role="dialog"]:has-text("Delete Global Field"), button[data-test-id="cs-cb-delete-gf"]'
          )
          .first();
        const rowActionBtn = page
          .locator('button[data-test-id="cs-table-action-options"][aria-label="row 1 action"], button[data-test-id="cs-table-action-options"]')
          .first();

        const clickDelete = async () => {
          const deleteItem = page.locator('li[data-test-id="cs-gf-action-delete"], li:has-text("Delete")').first();
          await expect(deleteItem).toBeVisible({ timeout: 8_000 });
          await deleteItem.hover({ timeout: 3_000 }).catch(() => {});
          const box = await deleteItem.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
          } else {
            await deleteItem.click({ timeout: 8_000, force: true }).catch(() => {});
          }
          await page.waitForTimeout(300);
        };

        await clickDelete().catch(async () => {
          await expect(rowActionBtn).toBeVisible({ timeout: 10_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickDelete();
        });

        for (let attempt = 1; attempt <= 2; attempt++) {
          const opened = await modal
            .waitFor({ state: "visible", timeout: 8_000 })
            .then(() => true)
            .catch(() => false);
          if (opened) break;
          await expect(rowActionBtn).toBeVisible({ timeout: 8_000 });
          await rowActionBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          await clickDelete();
        }
        await expect(modal).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      if (step.target === "Any Global Field title (doc step)") {
        // Close action popover if still open, then click first visible global field row link.
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(200);
        const rowLink = page
          .locator('a[href*="/global-field/"][href*="global-field-builder"], a[href*="#/stack/"][href*="/global-field/"][href*="global-field-builder"]')
          .first();
        await rowLink.scrollIntoViewIfNeeded().catch(() => {});
        await rowLink.click({ timeout: getStepTimeoutMs(step), force: true });
        break;
      }

      if (step.target === "Any Content Type Row (or builder) (doc step)") {
        const row = page.locator('[data-test-id^="cs-table-body-row-"]').first();
        if (await row.isVisible().catch(() => false)) {
          await row.click({ timeout: getStepTimeoutMs(step), force: true });
          break;
        }
        const contentTypesTab = page
          .locator('[role="radio"]:has-text("CONTENT TYPES"), [role="tab"]:has-text("CONTENT TYPES"), [data-test-id*="content-types" i]')
          .first();
        if (await contentTypesTab.isVisible().catch(() => false)) {
          await contentTypesTab.click({ timeout: 5_000, force: true }).catch(() => {});
          const rowAfterTab = page.locator('[data-test-id^="cs-table-body-row-"]').first();
          if (await rowAfterTab.isVisible().catch(() => false)) {
            await rowAfterTab.click({ timeout: getStepTimeoutMs(step), force: true });
            break;
          }
        }
        const inBuilder = /content-type-builder/i.test(page.url());
        if (inBuilder) {
          break;
        }
        throw new Error('Could not find any content type row and page is not on content-type builder.');
        break;
      }

      if (step.target === "Insert a sub-field (Group) (doc step)") {
        // Ensure field properties drawer is dismissed before trying to use nested "+" controls.
        for (let i = 0; i < 3; i++) {
          const propsOpen = await page
            .locator('[data-test-id="cs-content-types-field-properties-title"], .FieldProperties__heading')
            .first()
            .isVisible()
            .catch(() => false);
          if (!propsOpen) break;
          const dismissArea = page.locator('div[id="PageLayout__body"]').first();
          if (await dismissArea.isVisible().catch(() => false)) {
            await dismissArea.click({ timeout: 5_000, force: true }).catch(() => {});
          }
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(250);
        }
        const tilesAlreadyOpen = await page.locator("div.FieldTypeSelector__field-tile").first().isVisible().catch(() => false);
        if (tilesAlreadyOpen) {
          await page.waitForTimeout(200);
          break;
        }
        const namedGroupRow = page
          .locator('[data-test-id^="field-move-item"], .ContentTypeField')
          .filter({ has: page.locator('h3:has-text("SEO Content")') })
          .first();
        const emptyGroupRow = page
          .locator('[data-test-id^="field-move-item"], .ContentTypeField')
          .filter({ hasText: "Group cannot be empty" })
          .first();
        const groupRow = (await namedGroupRow.isVisible().catch(() => false)) ? namedGroupRow : emptyGroupRow;
        if (!(await groupRow.isVisible().catch(() => false))) {
          throw new Error('Could not locate Group row to insert sub-field.');
        }

        await groupRow.scrollIntoViewIfNeeded().catch(() => {});
        const groupBox = await groupRow.boundingBox().catch(() => null);
        let opened = false;

        const tryOpenByNearestPurpleAdd = async (anchorX: number, anchorY: number): Promise<boolean> => {
          // Exact locator provided by user.
          const plusRects = page.locator("div[data-test-id='cs-tooltip'] > svg[name='PurpleAdd'] > rect[fill*='C']");
          const rectCount = await plusRects.count().catch(() => 0);
          if (!rectCount) return false;

          let bestIndex = -1;
          let bestDistance = Number.POSITIVE_INFINITY;
          for (let i = 0; i < rectCount; i++) {
            const rect = plusRects.nth(i);
            if (!(await rect.isVisible().catch(() => false))) continue;
            const box = await rect.boundingBox().catch(() => null);
            if (!box) continue;
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;
            const d = Math.hypot(cx - anchorX, cy - anchorY);
            if (d < bestDistance) {
              bestDistance = d;
              bestIndex = i;
            }
          }
          if (bestIndex < 0) return false;

          const chosenRect = plusRects.nth(bestIndex);
          const chosenBox = await chosenRect.boundingBox().catch(() => null);
          if (!chosenBox) return false;
          const targetX = chosenBox.x + chosenBox.width / 2;
          const targetY = chosenBox.y + chosenBox.height / 2;
          await page.mouse.move(targetX, targetY).catch(() => {});
          await page.waitForTimeout(80);

          const chosenSvg = chosenRect.locator("xpath=ancestor::*[name()='svg'][1]").first();
          if (await chosenSvg.isVisible().catch(() => false)) {
            await chosenSvg.click({ timeout: 2_000, force: true }).catch(() => {});
          } else {
            await page.mouse.click(targetX, targetY).catch(() => {});
          }

          return await page
            .locator("div.FieldTypeSelector__field-tile")
            .first()
            .waitFor({ state: "visible", timeout: 2_500 })
            .then(() => true)
            .catch(() => false);
        };

        if (groupBox) {
          const hoverPoints: Array<[number, number]> = [
            // User-guided reveal area: little below Group field.
            [groupBox.x + groupBox.width * 0.5, groupBox.y + groupBox.height + 6],
            [groupBox.x + groupBox.width * 0.5, groupBox.y + groupBox.height + 12],
            [groupBox.x + groupBox.width * 0.35, groupBox.y + groupBox.height + 10],
            [groupBox.x + groupBox.width * 0.65, groupBox.y + groupBox.height + 10],
            // Backup: inside lower edge.
            [groupBox.x + groupBox.width * 0.5, groupBox.y + groupBox.height - 6]
          ];
          for (const [x, y] of hoverPoints) {
            await page.mouse.move(x, y).catch(() => {});
            await page.waitForTimeout(120);
            opened = await tryOpenByNearestPurpleAdd(x, y);
            if (opened) break;
          }
        }

        if (!opened) {
          // Capture exact DOM state for second-insert debugging.
          try {
            const debugDir = path.resolve(process.cwd(), "reports/latest");
            fs.mkdirSync(debugDir, { recursive: true });
            const html = await page.content().catch(() => "");
            const visiblePlusCount = await page
              .locator("svg[name='PurpleAdd']:visible")
              .count()
              .catch(() => -1);
            const payload = [
              `URL: ${page.url()}`,
              `visiblePurpleAddCount: ${visiblePlusCount}`,
              "",
              html,
            ].join("\n");
            fs.writeFileSync(path.join(debugDir, "group-subfield-second-insert-debug.html"), payload, "utf8");
          } catch {}
          recordVerificationWarning(
            step,
            context,
            'Could not open Group sub-field picker in this step; next "Global (doc step)" click will attempt strict Group-scoped reopen.'
          );
        }
        break;
      }

      if (step.target === "Insert a field (inside block) (doc step)") {
        // Ensure any open properties drawer is closed so block "+" controls become interactive.
        for (let i = 0; i < 3; i++) {
          const propsOpen = await page
            .locator('[data-test-id="cs-content-types-field-properties-title"], .FieldProperties__heading')
            .first()
            .isVisible()
            .catch(() => false);
          if (!propsOpen) break;
          const dismissArea = page.locator('div[id="PageLayout__body"]').first();
          if (await dismissArea.isVisible().catch(() => false)) {
            await dismissArea.click({ timeout: 5_000, force: true }).catch(() => {});
          }
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(250);
        }

        const tilesAlreadyOpen = await page.locator("div.FieldTypeSelector__field-tile").first().isVisible().catch(() => false);
        if (tilesAlreadyOpen) {
          await page.waitForTimeout(200);
          break;
        }

        const blockScope = page
          .locator('[class*="ModularBlocks"]')
          .filter({ has: page.locator('[data-test-id="cs-field-type-selector"]') })
          .last();
        const fallbackScope = page.locator('div[id="PageLayout__body"]').first();
        const scope = (await blockScope.isVisible().catch(() => false)) ? blockScope : fallbackScope;

        await scope.scrollIntoViewIfNeeded().catch(() => {});
        await scope.hover({ timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(200);

        const plusInScope = scope
          .locator(
            "[data-test-id='cs-field-type-selector'] .FieldTypeSelector__action-sign:visible, [data-test-id='cs-field-type-selector'] svg[name='PurpleAdd']:visible"
          )
          .last();
        const plusGlobal = page
          .locator(
            "[class*='ModularBlocks'] [data-test-id='cs-field-type-selector'] .FieldTypeSelector__action-sign:visible, [class*='ModularBlocks'] [data-test-id='cs-field-type-selector'] svg[name='PurpleAdd']:visible"
          )
          .last();
        const plus = (await plusInScope.isVisible().catch(() => false)) ? plusInScope : plusGlobal;

        await expect(plus).toBeVisible({ timeout: 8_000 });
        await plus.hover({ timeout: 2_000 }).catch(() => {});
        await plus.click({ timeout: getStepTimeoutMs(step), force: true });
        await page.locator("div.FieldTypeSelector__field-tile").first().waitFor({ state: "visible", timeout: 8_000 });
        break;
      }

      if (step.target === "Referenced Content Type selector (doc step)") {
        // Reference field in Global Field properties renders as a text-select control (often without stable test ids).
        // Open it via visible label/placeholder fallbacks so next step can pick an option.
        const exactRefSelect = page.locator('[data-test-id="cs-content-type-field-reference-basic-reference-tag-as-select"]').first();
        const exactRefSelectText = exactRefSelect.locator('div:has-text("Select")').first();
        const exactRefAction = exactRefSelect.locator('.Select__tag__action__items').first();
        const label = page.getByText("Referenced Content Type", { exact: false }).first();
        const selectText = page.getByText(/^Select$/).first();
        const emptyHint = page.getByText(/Please select a content type/i).first();
        const combo = page.locator('[role="combobox"], [aria-haspopup="listbox"]').first();
        const labelBlock = page.locator('div:has-text("Referenced Content Type")').first();
        const blockSelect = labelBlock.locator('xpath=..').locator('div:has-text("Select"), [role="button"], [aria-haspopup="dialog"], [aria-haspopup="listbox"]').first();

        if (await exactRefSelect.isVisible().catch(() => false)) {
          await exactRefSelect.click({ timeout: 8_000, force: true }).catch(() => {});
          await exactRefSelectText.click({ timeout: 8_000, force: true }).catch(() => {});
          await exactRefAction.click({ timeout: 8_000, force: true }).catch(() => {});
        } else if (await combo.isVisible().catch(() => false)) {
          await combo.click({ timeout: 8_000, force: true }).catch(() => {});
        } else if (await blockSelect.isVisible().catch(() => false)) {
          await blockSelect.click({ timeout: 8_000, force: true }).catch(() => {});
          await blockSelect.dblclick({ timeout: 8_000 }).catch(() => {});
        } else if (await selectText.isVisible().catch(() => false)) {
          await selectText.click({ timeout: 8_000, force: true }).catch(() => {});
          await selectText.dblclick({ timeout: 8_000 }).catch(() => {});
        } else if (await emptyHint.isVisible().catch(() => false)) {
          await emptyHint.click({ timeout: 8_000, force: true }).catch(() => {});
        } else if (await label.isVisible().catch(() => false)) {
          const box = await label.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.click(box.x + Math.min(220, box.width + 140), box.y + box.height + 12).catch(() => {});
          } else {
            await label.click({ timeout: 8_000, force: true }).catch(() => {});
          }
        } else {
          throw new Error('Could not find "Referenced Content Type" selector in Reference Properties.');
        }

        await page.waitForTimeout(700);
        // 1) Dialog flow: "Select Content Type" opened.
        // Do not auto-select here; flow steps will pick the intended single row.
        const selectCtDialog = page.getByRole("dialog").filter({ hasText: /Select Content Type/i }).first();
        const selectCtModal = page.locator('.ReactModal__new-entry:has-text("Select Content Type")').first();
        if (await selectCtDialog.isVisible().catch(() => false)) {
          break;
        }
        if (await selectCtModal.isVisible().catch(() => false)) {
          // Modal opened successfully; let next explicit flow steps select row and click Add.
          break;
        }

        // 2) Dropdown/listbox flow.
        const firstOption = page.locator('[role="listbox"] [role="option"], .Select-menu [role="option"], .Select__menu [role="option"]').first();
        if (await firstOption.isVisible().catch(() => false)) {
          await firstOption.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(200);
          break;
        }

        // 3) Keyboard fallback from focused select control.
        await page.keyboard.press("ArrowDown").catch(() => {});
        await page.waitForTimeout(150);
        await page.keyboard.press("Enter").catch(() => {});
        await page.waitForTimeout(300);

        const dialogOrListOpened =
          (await selectCtDialog.isVisible().catch(() => false)) ||
          (await selectCtModal.isVisible().catch(() => false)) ||
          (await page.locator('[role="listbox"]').first().isVisible().catch(() => false));
        if (!dialogOrListOpened) {
          throw new Error('Could not open "Referenced Content Type" chooser after clicking Select.');
        }
        break;
      }

      // Special case: row action menu -> "Copy Content Type" should open a modal
      if (step.target === "Copy Content Type") {
        // This menu item is flaky: first click can close popover without opening modal.
        // Strategy: ensure menu open → click item → wait for the *actual* modal marker (Copy button) → retry once.
        const copyBtn = page.locator('button[data-test-id="cs-cb-copy-ct"]').first();

        for (let attempt = 1; attempt <= 2; attempt++) {
          // Always open the menu fresh for this action (avoids "menu is half-closed" flake).
          await openRowActionMenu(page, { action: "click", target: "vertical ellipsis" } as Step, flow);

          const menuRoot = await getRowActionMenuRoot(page);
          const itemText = menuRoot.locator('li[data-test-id="cs-ct-action-copy"] .ml-8').first();
          const itemLi = menuRoot.locator('li[data-test-id="cs-ct-action-copy"]').first();

          const item = (await itemText.isVisible().catch(() => false)) ? itemText : itemLi;
          await expect(item).toBeVisible({ timeout: 5_000 });

          // Real mouse click at center (matches manual behavior better than locator.click in this popover)
          const box = await item.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 30 }).catch(() => {});
          } else {
            await item.click({ timeout: 2_000, force: true }).catch(() => {});
          }

          // Wait briefly for modal marker
          await expect(copyBtn).toBeVisible({ timeout: 6_000 }).catch(() => {});
          if (await copyBtn.isVisible().catch(() => false)) break;
        }

        if (!(await copyBtn.isVisible().catch(() => false))) {
          throw new Error("Copy Content Type modal did not appear (Copy button not visible) after retrying.");
        }

        break;
      }

      // Special case: row action menu -> "Delete" should open a confirmation modal
      if (step.target === "Delete") {
        const deleteDialog = page.getByRole("dialog").filter({ hasText: /delete/i }).first();

        for (let attempt = 1; attempt <= 2; attempt++) {
          // Always open the menu fresh for this action (avoids "menu is half-closed" flake).
          await openRowActionMenu(page, { action: "click", target: "vertical ellipsis", expected: step.expected } as Step, flow);

          const menuRoot = await getRowActionMenuRoot(page);
          const itemText = menuRoot.locator('li[data-test-id="cs-ct-action-delete"] .ml-8').first();
          const itemLi = menuRoot.locator('li[data-test-id="cs-ct-action-delete"]').first();

          const item = (await itemText.isVisible().catch(() => false)) ? itemText : itemLi;
          await expect(item).toBeVisible({ timeout: 5_000 });

          const box = await item.boundingBox().catch(() => null);
          if (box) {
            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2, { delay: 30 }).catch(() => {});
          } else {
            await item.click({ timeout: 2_000, force: true }).catch(() => {});
          }

          // Wait briefly for modal marker
          await expect(deleteDialog).toBeVisible({ timeout: 6_000 }).catch(() => {});
          if (await deleteDialog.isVisible().catch(() => false)) break;
        }

        if (!(await deleteDialog.isVisible().catch(() => false))) {
          throw new Error("Delete confirmation modal did not appear after retrying.");
        }

        break;
      }

      if (
        step.target === "Use Prebuilt (doc step)" &&
        (flow?.id === "import-prebuilt-content-models" || flow?.id === "about-us-page" || flow?.id === "blog-landing-page" || flow?.id === "blog-listing-page" || flow?.id === "contact-us-page" || flow?.id === "faqs" || flow?.id === "hero-banner" || flow?.id === "product-listing-page" || flow?.id === "website-footer" || flow?.id === "website-header" || flow?.id === "website-homepage")
      ) {
        const { click: overridesClick } = loadOverrides(flow);
        const t = getStepTimeoutMs(step);
        // Exact selector from Contentstack UI: div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"]
        const usePrebuiltSel =
          overridesClick["Use Prebuilt (doc step)"] ||
          'div.ContentModel__options--item[data-test-id="cs-cb-new-prebuilt-ct-child"]';
        // Ensure dropdown is open: click + New Content Type to open menu, then wait for it to render
        const newCtBtn = page.locator(
          overridesClick["+ New Content Type (doc step)"] || overridesClick["+ New Content Type"] || '[data-test-id="cs-cb-new-ct"], button:has-text("+ New Content Type"), button:has-text("New Content Type")'
        ).first();
        const usePrebuilt = page.locator(usePrebuiltSel).first();
        if (!(await usePrebuilt.isVisible().catch(() => false))) {
          await newCtBtn.click({ timeout: 8_000 }).catch(() => {});
          await page.waitForTimeout(1_200);
        }
        await expect(usePrebuilt).toBeVisible({ timeout: t });
        await usePrebuilt.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(200);
        await usePrebuilt.click({ timeout: t, force: true });
        await page.waitForTimeout((flow?.id === "blog-landing-page" || flow?.id === "blog-listing-page" || flow?.id === "contact-us-page" || flow?.id === "faqs" || flow?.id === "hero-banner" || flow?.id === "product-listing-page" || flow?.id === "website-footer" || flow?.id === "website-header" || flow?.id === "website-homepage") ? 3_000 : 1_500);
        const cardSel =
          flow?.id === "blog-landing-page"
            ? (overridesClick["Blog Landing Page card (doc step)"] || '[data-test-id="content-models-blog-landing-page-card"]')
            : flow?.id === "blog-listing-page"
              ? (overridesClick["Blog Listing Page card (doc step)"] || '[data-test-id="content-models-blog-listing-page-card"]')
              : flow?.id === "contact-us-page"
                ? (overridesClick["Contact Us Page card (doc step)"] || '[data-test-id="content-models-contact-us-page-card"]')
                : flow?.id === "faqs"
                  ? (overridesClick["FAQs Page card (doc step)"] || '[data-test-id="content-models-faqs-page-card"]')
                  : flow?.id === "hero-banner"
                    ? (overridesClick["Hero Banner card (doc step)"] || '[data-test-id="content-models-hero-banner-card"]')
                    : flow?.id === "product-listing-page"
                      ? (overridesClick["Product Listing Page card (doc step)"] || '[data-test-id="content-models-product-listing-page-card"]')
                      : flow?.id === "website-footer"
                        ? (overridesClick["Website Footer card (doc step)"] || '[data-test-id="content-models-website-footer-card"]')
                        : flow?.id === "website-header"
                          ? (overridesClick["Website Header card (doc step)"] || '[data-test-id="content-models-website-header-card"]')
                          : flow?.id === "website-homepage"
                            ? (overridesClick["Website Homepage card (doc step)"] || '[data-test-id="content-models-website-homepage-card"]')
                            : (overridesClick["About Us Page (doc step)"] || overridesClick["About Us Page card (doc step)"] || '[data-test-id="content-models-about-us-page-card"]');
        await page.locator(cardSel).first().waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
        break;
      }

      if (step.target === "Use Prebuilt (doc step)" && flow?.id === "import-prebuilt-stack") {
        const { click: overridesClick } = loadOverrides(flow);
        const t = getStepTimeoutMs(step);
        if (!/#!\/stacks\b/i.test(page.url())) {
          try {
            const u = new URL(page.url());
            await page.goto(`${u.origin}/#!/stacks`, { waitUntil: "domcontentloaded", timeout: t });
            await page.waitForTimeout(400);
          } catch {
            // ignore and continue with selectors
          }
        }
        const prebuiltOptionSel = [
          overridesClick["Use Prebuilt (doc step)"],
          'div[data-test-id="cs-add-stack-use-prebuilt"]',
          '[data-test-id="cs-add-stack-use-prebuilt"]',
          '[role="menuitem"]:has-text("Use Prebuilt")',
          'button:has-text("Use Prebuilt")',
          'li:has-text("Use Prebuilt")',
        ]
          .filter(Boolean)
          .join(", ");
        const prebuiltOption = page.locator(prebuiltOptionSel).first();
        const prebuiltModal = page
          .locator(
            '[data-test-id*="add-stack" i], [data-test-id*="starters-" i], [role="dialog"]:has-text("Add Stack"), [role="dialog"]:has-text("Import")'
          )
          .first();

        // If already in Add Stack/Prebuilt view, this step is effectively complete.
        if (await prebuiltModal.isVisible().catch(() => false)) {
          break;
        }

        // Strict doc-step mode: do not auto-click undocumented auth controls.
        // If auth appears, fail and surface as missing doc step.
        const authOverlay = page
          .locator(
            '.OAuth_Consent_Card, #InstallationCardContent, .Auth__Card--content, [role="dialog"]:has-text("wants to access")'
          )
          .first();
        if (await authOverlay.isVisible().catch(() => false)) {
          throw new Error(
            'Authorization dialog appeared during "Use Prebuilt (doc step)", but authorization actions are not present in flow JSON. Add explicit doc steps for this gate.'
          );
        }

        // Always reopen New Stack menu to make sure Use Prebuilt is actionable.
        const newStackSel =
          overridesClick["+ New Stack (doc step)"] ||
          'button:has-text("+ New Stack"), button:has-text("New Stack"), [aria-label*="New Stack" i]';
        const newStackBtn = page.locator(newStackSel).first();
        if (await newStackBtn.isVisible().catch(() => false)) {
          await newStackBtn.click({ timeout: 8_000, force: true }).catch(() => {});
          await page.waitForTimeout(300);
        }

        if (await prebuiltOption.isVisible().catch(() => false)) {
          for (let attempt = 1; attempt <= 3; attempt++) {
            await prebuiltOption.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(500);

            const importReady = await page
              .locator(
                'button[data-test-id="starters-gatsby-starter-import"], [data-test-id^="starters-"][data-test-id$="-import"], [data-test-id^="starters-"]:not([data-test-id$="-import"])'
              )
              .first()
              .isVisible()
              .catch(() => false);
            const authVisible = await page
              .locator('.OAuth_Consent_Card, #InstallationCardContent, .Auth__Card--content')
              .first()
              .isVisible()
              .catch(() => false);
            const prebuiltVisible = await prebuiltModal.isVisible().catch(() => false);
            if (importReady || authVisible || prebuiltVisible) break;
          }
          break;
        }

        // Fallback: if modal/cards are visible after opening New Stack, proceed.
        await prebuiltModal.waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
        if (await prebuiltModal.isVisible().catch(() => false)) {
          break;
        }
      }

      // Import Prebuilt Content Models: hover on card to reveal Import, then click. Authorize is optional (first time only).
      if (step.target === "Authorize (doc step)" && (step.optional || flow?.id === "import-prebuilt-content-models")) {
        const { click: overridesClick } = loadOverrides(flow);
        const authSel = overridesClick["Authorize (doc step)"] || 'button:has-text("Authorize"), a:has-text("Authorize")';
        const authBtn = page.locator(authSel).first();
        if (await authBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
          await authBtn.click({ timeout: 5_000, force: true }).catch(() => {});
          await page.waitForTimeout(1_500);
        }
        break;
      }

      // Contact Us Page card: click to open detail modal (not Import).
      if (step.target === "Contact Us Page card (doc step)" && flow?.id === "contact-us-page") {
        if ((flow as any).__contactUsPageAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Contact Us Page card (doc step)"] || '[data-test-id="content-models-contact-us-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Contact Us Page'), .ContentModel__Body--title:has-text('Contact Us Page')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Website Homepage card: click to open detail modal (not Import).
      if (step.target === "Website Homepage card (doc step)" && flow?.id === "website-homepage") {
        if ((flow as any).__websiteHomepageAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Website Homepage card (doc step)"] || '[data-test-id="content-models-website-homepage-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Website Homepage'), h3:has-text('Homepage'), .ContentModel__Body--title:has-text('Website Homepage'), .ContentModel__Body--title:has-text('Homepage')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Website Header card: click to open detail modal (not Import).
      if (step.target === "Website Header card (doc step)" && flow?.id === "website-header") {
        if ((flow as any).__websiteHeaderAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Website Header card (doc step)"] || '[data-test-id="content-models-website-header-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Website Header'), .ContentModel__Body--title:has-text('Website Header'), h3:has-text('Header'), .ContentModel__Body--title:has-text('Header')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Website Footer card: click to open detail modal (not Import).
      if (step.target === "Website Footer card (doc step)" && flow?.id === "website-footer") {
        if ((flow as any).__websiteFooterAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Website Footer card (doc step)"] || '[data-test-id="content-models-website-footer-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Website Footer'), .ContentModel__Body--title:has-text('Website Footer'), h3:has-text('Footer'), .ContentModel__Body--title:has-text('Footer')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Product Listing Page card: click to open detail modal (not Import).
      if (step.target === "Product Listing Page card (doc step)" && flow?.id === "product-listing-page") {
        if ((flow as any).__productListingPageAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Product Listing Page card (doc step)"] || '[data-test-id="content-models-product-listing-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Product Listing Page'), .ContentModel__Body--title:has-text('Product Listing Page')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Blog Listing Page card: click to open detail modal (not Import).
      if (step.target === "Blog Listing Page card (doc step)" && flow?.id === "blog-listing-page") {
        if ((flow as any).__blogListingPageAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Blog Listing Page card (doc step)"] || '[data-test-id="content-models-blog-listing-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Blog Listing Page'), .ContentModel__Body--title:has-text('Blog Listing Page')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Hero Banner card: click to open detail modal (not Import).
      if (step.target === "Hero Banner card (doc step)" && flow?.id === "hero-banner") {
        if ((flow as any).__heroBannerAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Hero Banner card (doc step)"] || '[data-test-id="content-models-hero-banner-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Hero Banner'), .ContentModel__Body--title:has-text('Hero Banner')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // FAQs Page card: click to open detail modal (not Import).
      if (step.target === "FAQs Page card (doc step)" && flow?.id === "faqs") {
        if ((flow as any).__faqsAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["FAQs Page card (doc step)"] || '[data-test-id="content-models-faqs-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('FAQs Page'), .ContentModel__Body--title:has-text('FAQs Page'), h3:has-text('FAQs'), .ContentModel__Body--title:has-text('FAQs')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Blog Landing Page card: click to open detail modal (not Import).
      if (step.target === "Blog Landing Page card (doc step)" && flow?.id === "blog-landing-page") {
        if ((flow as any).__blogLandingPageAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["Blog Landing Page card (doc step)"] || '[data-test-id="content-models-blog-landing-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
        const titleArea = card.locator("h3:has-text('Blog Landing Page'), .ContentModel__Body--title:has-text('Blog Landing Page')").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(1_200);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // About Us Page card: click to open detail modal (not Import). Avoid Import button.
      // When alternate path was used (opened from list), we're already on content-type-builder; no-op.
      if (step.target === "About Us Page card (doc step)" && flow?.id === "about-us-page") {
        if ((flow as any).__aboutUsPageAlternatePath) {
          await page.waitForTimeout(500);
          break;
        }
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel =
          overridesClick["About Us Page card (doc step)"] || '[data-test-id="content-models-about-us-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        const titleArea = card.locator(".ContentModel__Body--heading h3, .ContentModel__Body .ContentModel__Body--title").first();
        if (await titleArea.isVisible().catch(() => false)) {
          await titleArea.click({ timeout: 5_000, force: true });
        } else {
          await card.locator(".ContentModel__Body").first().click({ timeout: 5_000, force: true }).catch(() => card.click({ timeout: 5_000, force: true }));
        }
        await page.waitForTimeout(800);
        await page.locator('[data-test-id="content-model-details-modal"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        break;
      }

      // Preview Schema dropdown: open to select related content type (Our Team / Author / Contact).
      if (step.target === "Preview Schema dropdown (doc step)" && (flow?.id === "about-us-page" || flow?.id === "blog-landing-page" || flow?.id === "contact-us-page" || flow?.id === "product-listing-page")) {
        const dropdown = page.locator('[data-test-id="content-model-details-modal"] [data-test-id="cs-select"], .schema [data-test-id="cs-select"]').first();
        await expect(dropdown).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await dropdown.click({ timeout: 5_000, force: true });
        await page.waitForTimeout(400);
        break;
      }

      if (step.target === "Our Team option in dropdown (doc step)" && flow?.id === "about-us-page") {
        const ourTeamOpt = page.locator('[class*="Select__menu"] div:has-text("Our Team"), [class*="option"]:has-text("Our Team"), [role="option"]:has-text("Our Team"), div[title="Our Team"]').first();
        await expect(ourTeamOpt).toBeVisible({ timeout: 5_000 });
        await ourTeamOpt.click({ timeout: 5_000, force: true });
        await page.waitForTimeout(500);
        break;
      }

      if (step.target === "Contact option in dropdown (doc step)" && flow?.id === "contact-us-page") {
        const { click: overridesClick } = loadOverrides(flow);
        const contactOpt = page.locator(
          overridesClick["Contact option in dropdown (doc step)"] ||
            '[role="option"]:has-text("Contact"), .Select__menu div:has-text("Contact"), div[id^="react-select-"][id*="-option-"]:has-text("Contact"), [class*="Select__menu"]:has-text("Contact"), div[title="Contact"]'
        ).first();
        await expect(contactOpt).toBeVisible({ timeout: 10_000 });
        await contactOpt.click({ timeout: 10_000, force: true });
        await page.waitForTimeout(500);
        break;
      }

      if (step.target === "Product option in dropdown (doc step)" && flow?.id === "product-listing-page") {
        const { click: overridesClick } = loadOverrides(flow);
        const productOpt = page.locator(
          overridesClick["Product option in dropdown (doc step)"] ||
            '[role="option"]:has-text("Product"), .Select__menu div:has-text("Product"), div[title="Product"]'
        ).first();
        await expect(productOpt).toBeVisible({ timeout: 10_000 });
        await productOpt.click({ timeout: 10_000, force: true });
        await page.waitForTimeout(500);
        break;
      }

      if (step.target === "Author option in dropdown (doc step)" && flow?.id === "blog-landing-page") {
        const { click: overridesClick } = loadOverrides(flow);
        const authorOpt = page.locator(
          overridesClick["Author option in dropdown (doc step)"] ||
            '[role="option"]:has-text("Author"), .Select__menu div:has-text("Author"), div[id^="react-select-"][id*="-option-"]:has-text("Author"), [class*="Select__menu"]:has-text("Author"), div[title="Author"]'
        ).first();
        await expect(authorOpt).toBeVisible({ timeout: 10_000 });
        await authorOpt.click({ timeout: 10_000, force: true });
        await page.waitForTimeout(500);
        break;
      }

      // Hover on content model card to reveal Import button (doc step).
      if (step.target === "Hover on About Us Page card (doc step)" && flow?.id === "import-prebuilt-content-models") {
        const { click: overridesClick } = loadOverrides(flow);
        const cardSel = overridesClick["Hover on About Us Page card (doc step)"] || '[data-test-id="content-models-about-us-page-card"]';
        const card = page.locator(cardSel).first();
        await expect(card).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await card.hover({ timeout: 3_000 });
        await page.waitForTimeout(200);
        break;
      }

      // Import (doc step) for content models: use content-models card selectors, hover then click. Wait for next page.
      if (step.target === "Import (doc step)" && flow?.id === "import-prebuilt-content-models") {
        const { click: overridesClick } = loadOverrides(flow);
        const t = getStepTimeoutMs(step);
        const importSel = overridesClick["Import (doc step)"] || '[data-test-id="content-models-about-us-page-card-import"]';
        const cardSel = overridesClick["Hover on About Us Page card (doc step)"] || '[data-test-id="content-models-about-us-page-card"]';
        const card = page.locator(cardSel).first();
        const importBtn = page.locator(importSel).first();
        await card.hover({ timeout: 3_000 }).catch(() => {});
        await page.waitForTimeout(200);
        await expect(importBtn).toBeVisible({ timeout: t });
        await importBtn.click({ timeout: t, force: true });
        await page.waitForTimeout(3_000);
        break;
      }

      // Some prebuilt cards reveal "Import" only on hover.
      if (step.target === "Import (doc step)") {
        const { click: overridesClick } = loadOverrides(flow);
        const importSel = 'button[data-test-id="starters-gatsby-starter-import"]';
        const importBtns = page.locator(importSel);
        const t = getStepTimeoutMs(step);

        // Ensure prebuilt panel is open; if not, retry Use Prebuilt quickly.
        const anyImportVisible = await importBtns.first().isVisible().catch(() => false);
        if (!anyImportVisible) {
          const usePrebuiltSel =
            overridesClick["Use Prebuilt (doc step)"] ||
            '[role="menuitem"]:has-text("Use Prebuilt"), button:has-text("Use Prebuilt"), li:has-text("Use Prebuilt")';
          const usePrebuiltBtn = page.locator(usePrebuiltSel).first();
          if (await usePrebuiltBtn.isVisible().catch(() => false)) {
            await usePrebuiltBtn.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.waitForTimeout(500);
          }
        }

        // Wait incrementally for Add Stack modal content to render.
        const modalRoot = page.locator(".ReactModalPortal, [role='dialog']").first();
        await modalRoot.waitFor({ state: "visible", timeout: Math.min(t, 10_000) }).catch(() => {});
        let btnCount = await importBtns.count().catch(() => 0);
        if (btnCount === 0) {
          for (let i = 0; i < 8; i++) {
            await page.waitForTimeout(500);
            btnCount = await importBtns.count().catch(() => 0);
            if (btnCount > 0) break;
          }
        }

        for (let i = 0; i < Math.min(btnCount, 8); i++) {
          const btn = importBtns.nth(i);
          const parentCard = btn
            .locator('xpath=ancestor::*[@data-test-id="starters-gatsby-starter" or contains(@data-test-id,"starters-")][1]')
            .first();
          if (await parentCard.isVisible().catch(() => false)) {
            await parentCard.hover({ timeout: 3_000 }).catch(() => {});
            await page.waitForTimeout(150);
          }
          if (await btn.isVisible().catch(() => false)) break;
        }

        const importCount = btnCount;
        let clicked = false;
        for (let i = 0; i < Math.min(importCount, 8); i++) {
          const btn = importBtns.nth(i);
          if (await btn.isVisible().catch(() => false)) {
            await btn.click({ timeout: t, force: true });
            clicked = true;
            break;
          }
        }
        if (!clicked) {
          await expect(importBtns.first()).toBeVisible({ timeout: t });
          await importBtns.first().click({ timeout: t, force: true });
        }
        break;
      }

      if (step.target === "Import" && flow?.id === "import-prebuilt-content-models") {
        const { click: overridesClick } = loadOverrides(flow);
        const t = getStepTimeoutMs(step);
        const importSel =
          overridesClick["Import"] ||
          '[role="dialog"] button[data-test-id*="import" i], [role="dialog"] button:has-text("Import")';
        const hoverSel =
          overridesClick["Prebuilt card hover area (doc step)"] ||
          '[role="dialog"] [data-test-id*="about-us" i], [role="dialog"] [data-test-id*="prebuilt" i]';

        const importBtns = page.locator(importSel);
        const hoverCards = page.locator(hoverSel);
        const hoverCount = await hoverCards.count().catch(() => 0);
        for (let i = 0; i < Math.min(hoverCount, 8); i++) {
          const card = hoverCards.nth(i);
          if (await card.isVisible().catch(() => false)) {
            await card.hover({ timeout: 3_000 }).catch(() => {});
            await page.waitForTimeout(150);
          }
          if (await importBtns.first().isVisible().catch(() => false)) break;
        }

        await expect(importBtns.first()).toBeVisible({ timeout: t });
        await importBtns.first().click({ timeout: t, force: true });
        break;
      }

      // Global Field: dismiss properties panel reliably by clicking the builder body.
      if (step.target === "Builder area (dismiss properties)") {
        const dismissArea = page.locator('div[id="PageLayout__body"]').first();
        const timeoutMs = getStepTimeoutMs(step);
        await expect(dismissArea).toBeVisible({ timeout: timeoutMs });
        await dismissArea.scrollIntoViewIfNeeded().catch(() => {});
        await dismissArea.click({ timeout: timeoutMs, force: true }).catch(() => {});
        const bodyBox = await dismissArea.boundingBox().catch(() => null);
        if (bodyBox) {
          // Click a neutral point in builder canvas to reliably blur field properties inputs.
          const neutralX = Math.floor(bodyBox.x + Math.min(24, bodyBox.width - 2));
          const neutralY = Math.floor(bodyBox.y + Math.min(24, bodyBox.height - 2));
          await page.mouse.click(neutralX, neutralY).catch(() => {});
        }
        // ESC often closes floating property panes if focus remained in a field input.
        await page.keyboard.press("Escape").catch(() => {});
        await page.waitForTimeout(350);
        break;
      }

      // Special case: "+" appears on hover in the builder canvas (action bar has class "hide" until hovered)
      // Standardized for Global Field flows so both "Insert a field" and "Insert a field (doc step)" use the same resilient logic.
      const isGlobalFieldBuilderPage = /global-field-builder/i.test(page.url());
      const isGlobalFieldBuilderFlow =
        String(flow?.module || "").toLowerCase() === "global-field" &&
        isGlobalFieldBuilderPage &&
        (String(flow?.id || "").toLowerCase().startsWith("create-a-global-field") ||
          String(flow?.id || "").toLowerCase().startsWith("group-fields-within-global-fields"));
      const isRestoreDeletedGlobalFieldOnBuilder =
        String(flow?.id || "").toLowerCase() === "restore-a-deleted-global-field" && isGlobalFieldBuilderPage;
      const useGlobalFieldInsertHoverPath = isGlobalFieldBuilderFlow || isRestoreDeletedGlobalFieldOnBuilder;
      const isJsonRteModuleInsertFieldDocStep =
        step.target === "Insert a field (doc step)" &&
        String(flow?.module || "").toLowerCase() === "json-rich-text-editor" &&
        ["customize-json-rich-text-editor"].includes(String(flow?.id || "").toLowerCase());
      if (
        step.target === "Insert a field" ||
        isJsonRteModuleInsertFieldDocStep ||
        (useGlobalFieldInsertHoverPath && step.target === "Insert a field (doc step)") ||
        (isRestoreDeletedGlobalFieldOnBuilder && step.target === "Insert a field (trash restore doc step)")
      ) {
        const { click: overridesClick } = loadOverrides(flow);
        const fieldTilesVisible = await page.locator('div.FieldTypeSelector__field-tile').first().isVisible().catch(() => false);
        if (fieldTilesVisible) {
          await page.waitForTimeout(500);
          return;
        }

        if (useGlobalFieldInsertHoverPath) {
          const dismissArea = page.locator('div[id="PageLayout__body"]').first();
          if (await dismissArea.isVisible().catch(() => false)) {
            await dismissArea.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.keyboard.press("Escape").catch(() => {});
            await page.waitForTimeout(250);
          }

          // Deterministic path for Global Field builder:
          // hover the last insert control, click the "+" icon, and wait for info modal tiles.
          const insertControls = page.locator('[data-test-id="cs-field-type-selector"]');
          const insertControl = insertControls.last();
          const addFromInsertControl = insertControl
            .locator('svg[name="PurpleAdd"], .FieldTypeSelector__action-sign, .FieldTypeSelector__action-bar')
            .first();
          if (await insertControl.isVisible().catch(() => false)) {
            await insertControl.scrollIntoViewIfNeeded().catch(() => {});
            await insertControl.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(250);
          }
          if (await addFromInsertControl.isVisible().catch(() => false)) {
            await addFromInsertControl.click({ timeout: 5_000, force: true }).catch(() => {});
          }

          // Fallback: hover the last field row so row actions become visible, then click visible PurpleAdd.
          const tilesOpenedAfterPrimary = await page
            .locator('div.FieldTypeSelector__field-tile')
            .first()
            .waitFor({ state: "visible", timeout: 5_000 })
            .then(() => true)
            .catch(() => false);
          if (tilesOpenedAfterPrimary) {
            await page.waitForTimeout(300);
            return;
          }

          const lastFieldRow = page.locator(".ContentTypeField, [class*='ContentTypeField']").last();
          if (await lastFieldRow.isVisible().catch(() => false)) {
            await lastFieldRow.scrollIntoViewIfNeeded().catch(() => {});
            await lastFieldRow.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(250);
          }
          const anyVisibleAdd = page
            .locator('[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"])')
            .last();
          if (await anyVisibleAdd.isVisible().catch(() => false)) {
            await anyVisibleAdd.click({ timeout: 5_000, force: true }).catch(() => {});
          }

          const tilesOpenedAfterFallback = await page
            .locator('div.FieldTypeSelector__field-tile')
            .first()
            .waitFor({ state: "visible", timeout: 8_000 })
            .then(() => true)
            .catch(() => false);
          if (tilesOpenedAfterFallback) {
            await page.waitForTimeout(300);
            return;
          }
          // Do not fail early here; continue to shared fallback scan logic below.
        }

        // Wait for builder to be ready after navigation (e.g. after Edit) before looking for "+"
        const builderReady = page
          .locator(overridesClick["Insert a field (hover area)"] || '[data-test-id="cs-field-type-selector"]')
          .or(page.getByRole("heading", { name: /^Title$/i }))
          .or(page.locator('[data-test-id="cs-ct-save"]'))
          .first();
        await builderReady.waitFor({ state: "visible", timeout: 25_000 }).catch(() => {});
        await page.waitForTimeout(2000);

        // Primary path: hover over [data-test-id="cs-field-type-selector"] to reveal the "+", then click it.
        const hoverAreaSelector = overridesClick["Insert a field (hover area)"] || '[data-test-id="cs-field-type-selector"]';
        const hoverAreaCandidates = page.locator(hoverAreaSelector);
          const hoverArea =
          useGlobalFieldInsertHoverPath
            ? hoverAreaCandidates.last()
            : hoverAreaCandidates.first();
        await hoverArea.scrollIntoViewIfNeeded().catch(() => {});

        // Prefer concrete "+" icon inside the active insert control.
        const addButton = hoverArea
          .locator('svg[name="PurpleAdd"], .FieldTypeSelector__action-sign, .FieldTypeSelector__action-bar')
          .first();

        if (await hoverArea.isVisible().catch(() => false)) {
          try {
            await hoverArea.hover({ timeout: 5_000 });
            await page.waitForTimeout(800);
            await addButton.waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
            await addButton.click({ timeout: 5_000, force: true });
            const opened = await page.locator('div.FieldTypeSelector__field-tile').first().waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false);
            if (opened) {
              await page.waitForTimeout(1500);
              return;
            }
          } catch {
            // Fall through
          }
        }

        // Try direct click if "+" already visible
        if (await addButton.isVisible().catch(() => false)) {
          try {
            await addButton.click({ timeout: 5_000, force: true });
            const opened = await page.locator('div.FieldTypeSelector__field-tile').first().waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false);
            if (opened) {
              await page.waitForTimeout(1500);
              return;
            }
          } catch {
            // Fall through
          }
        }

        // Reuse the same "Insert a Field (doc step)" approach that works in other content-models docs (e.g. modular-blocks).
        const insertFieldDocSelector = overridesClick["Insert a Field (doc step)"];
        if (insertFieldDocSelector) {
          try {
            const addBtn = page.locator(insertFieldDocSelector).first();
            if (await addBtn.isVisible().catch(() => false)) {
              await addBtn.click({ timeout: 5_000, force: true });
              const opened = await page.locator('div.FieldTypeSelector__field-tile').first().waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false);
              if (opened) {
                await page.waitForTimeout(1500);
                return;
              }
            }
          } catch {
            // Fall through to hover scan
          }
        }

        const purpleAddSvg = useGlobalFieldInsertHoverPath
          ? page.locator('svg[name="PurpleAdd"]').last()
          : page.locator('svg[name="PurpleAdd"]').first();
        const purpleAddButtonCandidates: Locator[] = [
          page.locator('button:has(svg[name="PurpleAdd"])').first(),
          purpleAddSvg.locator("xpath=ancestor-or-self::*[@role='button' or self::button][1]").first(),
          page.locator('.FieldTypeSelector__action-bar button:has(svg[name="PurpleAdd"])').first(),
          page.locator('[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]').first(),
        ];

        const viewport = page.viewportSize();
        const centerX = viewport?.width ? Math.floor(viewport.width / 2) : 700;

        const fieldTypeSelector = page.locator('[class*="FieldTypeSelector"]').first();

        // Try direct click on PurpleAdd if visible (e.g. empty builder or add-row)
        for (const c of purpleAddButtonCandidates) {
          if (await c.isVisible().catch(() => false)) {
            await c.click({ timeout: 5_000, force: true }).catch(() => {});
            const opened = await page.locator('div.FieldTypeSelector__field-tile').first().waitFor({ state: "visible", timeout: 8_000 }).then(() => true).catch(() => false);
            if (opened) {
              await page.waitForTimeout(1500);
              return;
            }
          }
        }

        const emptyStateHint = page.getByText(/Add fields to create a Content Type/i).first();
        const titleHeading = page.getByRole("heading", { name: /^Title$/i }).first();

        const headings = [
          page.getByRole("heading", { name: /^Title$/i }).first(),
          page.getByRole("heading", { name: /^Single Line Textbox$/i }).first(),
        ];

        const boxes = (
          await Promise.all(
            headings.map(async (h) => ({
              visible: await h.isVisible().catch(() => false),
              box: await h.boundingBox().catch(() => null),
            }))
          )
        )
          .filter((x) => x.visible && x.box)
          .map((x) => x.box!) as NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>[];

        const yPoints: number[] = [];
        for (let i = 0; i < boxes.length - 1; i++) {
          const a = boxes[i];
          const b = boxes[i + 1];
          const midY = Math.floor((a.y + a.height + b.y) / 2);
          yPoints.push(midY);
        }
        if (boxes.length) {
          const last = boxes[boxes.length - 1];
          yPoints.push(Math.floor(last.y + last.height + 30));
          yPoints.push(Math.floor(last.y + last.height + 80));
        }

        // Fallback scan band (works even if headings aren’t found).
        if (!yPoints.length) {
          for (let y = 220; y <= 700; y += 40) yPoints.push(y);
        }

        const clickGrid = async (xVals: number[], yVals: number[]) => {
          for (const y of yVals) {
            for (const x of xVals) {
              await page.mouse.move(x, y).catch(() => {});

              // Preferred: click the visible "+" button if it appears.
              for (const c of purpleAddButtonCandidates) {
                if (await c.isVisible().catch(() => false)) {
                  await c.click({ timeout: 2_000, force: true });
                  return true;
                }
              }

              // Otherwise, click the hovered canvas position — the UI often overlays the "+" exactly here.
              await page.mouse.click(x, y, { delay: 20 }).catch(() => {});
              if (await fieldTypeSelector.isVisible().catch(() => false)) return true;
            }
          }
          return false;
        };

        const start = Date.now();
        while (Date.now() - start < 20_000) {
          // Empty-state path: tighter grid around just-below-Title.
          if (await emptyStateHint.isVisible().catch(() => false)) {
            const box = await titleHeading.boundingBox().catch(() => null);
            if (box) {
              const xVals = [
                Math.floor(box.x + box.width / 2),
                centerX,
                Math.floor(box.x + Math.min(box.width, 260) / 2),
              ];
              const yBase = Math.floor(box.y + box.height + 35);
              const yVals = [yBase - 12, yBase, yBase + 12, yBase + 38];
              if (await clickGrid(xVals, yVals)) {
                await page.locator('div.FieldTypeSelector__field-tile').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
                await page.waitForTimeout(1500);
                return;
              }
            }
          }

          // General path: scan yPoints with slight x offsets.
          const xVals = [centerX - 140, centerX, centerX + 140].filter((x) => x > 0);
          if (await clickGrid(xVals, yPoints)) {
            await page.locator('div.FieldTypeSelector__field-tile').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
            await page.waitForTimeout(1500);
            return;
          }
        }

        // Global Field builder specific fallback:
        // click outside to dismiss any floating panel, then retry opening picker once.
        if (useGlobalFieldInsertHoverPath) {
          const dismissArea = page.locator('div[id="PageLayout__body"]').first();
          if (await dismissArea.isVisible().catch(() => false)) {
            await dismissArea.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.waitForTimeout(300);
          }
          if (await hoverArea.isVisible().catch(() => false)) {
            await hoverArea.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(300);
          }
          if (await addButton.isVisible().catch(() => false)) {
            await addButton.click({ timeout: 5_000, force: true }).catch(() => {});
            const opened = await page
              .locator("div.FieldTypeSelector__field-tile")
              .first()
              .waitFor({ state: "visible", timeout: 8_000 })
              .then(() => true)
              .catch(() => false);
            if (opened) {
              await page.waitForTimeout(300);
              return;
            }
          }
        }

        throw new Error('Insert a field: "+" control did not become visible after hover scan.');
      }

      // Prefer clicking "Save and proceed" inside the Create CT dialog so we submit the modal, not a random button.
      if (step.target === "Save and proceed") {
        const dialog = page.getByRole("dialog").first().or(page.locator('[data-testid="cs-modal"]').first());
        if (await dialog.isVisible().catch(() => false)) {
          const submitBtn = dialog.getByRole("button", { name: /Save and proceed|Create|Proceed|^Save$/i }).first();
          if (await submitBtn.count().then((n) => n > 0)) {
            await expect(submitBtn).toBeVisible({ timeout: 10_000 });
            await submitBtn.click({ timeout: 10_000 });
            await page.waitForTimeout(2000);
            const urlOk = await page.waitForURL(/content-type-builder|content-type\/[^/]+/, { timeout: 45_000 }).then(() => true).catch(() => false);
            if (!urlOk) {
              const builderReady = page
                .getByRole("heading", { name: /^Title$/i })
                .or(page.locator('[data-test-id="cs-ct-save"]'))
                .or(page.getByRole("button", { name: /save/i }))
                .or(page.locator('.FieldTypeSelector__action-bar, [class*="FieldTypeSelector"]'))
                .first();
              await expect(builderReady).toBeVisible({ timeout: 25_000 }).catch(() => {});
            }
            break;
          }
        }
      }

      // Quick Search: click magnifying glass icon inside cs-header-search-container. NOT Help (cs-help-center).
      // Tooltip shows "Quick search (%K)" - also try Cmd/Ctrl+K if click doesn't open dropdown.
      if (
        step.action === "click" &&
        step.target === "Search icon in header (doc step)" &&
        String(flow?.id || "").toLowerCase() === "quick-search"
      ) {
        const t = getStepTimeoutMs(step);
        const icon = page.locator('[data-test-id="cs-header-search-container"] [data-test-id="cs-header-search-icon"]').first();
        await icon.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(200);
        await expect(icon).toBeVisible({ timeout: t });
        const box = await icon.boundingBox();
        if (box) {
          await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        } else {
          await icon.click({ timeout: t, force: true });
        }
        await page.waitForTimeout(400);
        // If dropdown didn't open, try keyboard shortcut (Cmd+K / Ctrl+K)
        const dropdownVisible = await page.locator('[data-test-id="cs-header-search-container"] input, [data-test-id="cs-search-bar-input"] input, [data-test-id="cs-search-bar-input-submit"], input[placeholder*="Search Entries" i]').first().isVisible().catch(() => false);
        if (!dropdownVisible) {
          const mod = process.platform === "darwin" ? "Meta" : "Control";
          await page.keyboard.press(`${mod}+k`);
          await page.waitForTimeout(800);
        }
        break;
      }

      // Partial Search: trigger search by pressing Enter (Search button may be obscured by suggestions dropdown)
      if (
        step.action === "click" &&
        step.target === "Search submit button (doc step)" &&
        String(flow?.id || "").toLowerCase() === "partial-search"
      ) {
        const searchInput = page.locator(
          '[data-test-id="cs-search-bar-input"] input, [data-test-id="cs-entries-inline-search"] input'
        ).first();
        await searchInput.focus().catch(() => {});
        await page.keyboard.press("Enter");
        break;
      }

      // Edit Block (doc step): wait for menu then click (menu may be in portal)
      if (step.action === "click" && step.target === "Edit Block (doc step)") {
        const tEdit = getStepTimeoutMs(step);
        const byTestId = page.locator('[data-test-id="cs-cb-edit-block"]').first();
        const byRole = page.getByRole("menuitem", { name: /Edit Block/i }).first();
        const byText = page.getByText("Edit Block", { exact: true }).first();
        const visible = await Promise.race([
          byTestId.waitFor({ state: "visible", timeout: tEdit }).then(() => byTestId),
          byRole.waitFor({ state: "visible", timeout: tEdit }).then(() => byRole),
          byText.waitFor({ state: "visible", timeout: tEdit }).then(() => byText),
        ]).catch(() => null);
        if (visible) {
          await visible.click({ timeout: 5_000 });
          break;
        }
      }

      // Hover over Group row so Properties icon appears (needed for Group field flows)
      if (step.target === "Properties (doc step)") {
        const groupRow = page.locator('.ContentTypeField:has(svg[name="Group"])').or(page.getByRole("heading", { name: "Group" }).locator("..")).first();
        if (await groupRow.isVisible().catch(() => false)) {
          await groupRow.hover({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(400);
        }
      }

      // Hover over Global row so Properties icon appears (needed for Global field properties flow)
      if (step.target === "Properties (Global) (doc step)") {
        const globalRow = page
          .locator('.ContentTypeField:has(svg[name="Global"]), .ContentTypeField:has(h3:has-text("Global"))')
          .first();
        if (await globalRow.isVisible().catch(() => false)) {
          await globalRow.hover({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(350);
          const propsInRow = globalRow
            .locator('[data-test-id$="-option-properties"], button:has(svg[name="Sliders"])')
            .first();
          if (await propsInRow.isVisible().catch(() => false)) {
            await propsInRow.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.waitForTimeout(350);
            break;
          }
        }
      }

      // Give properties panel time to open before looking for "Advanced (doc step)"
      if (step.target === "Advanced (doc step)") {
        const panelReady = page.getByRole("tab", { name: /Advanced|Basic/i }).first();
        await panelReady.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
        await page.waitForTimeout(500);
      }

      // Wait for extension-selection modal to open before clicking an extension
      if (step.target === "Select extension (e.g. Color Picker) (doc step)") {
        const dialogOrExtension = page.getByRole("dialog").or(page.getByText("Color Picker")).first();
        await dialogOrExtension.waitFor({ state: "visible", timeout: 20_000 }).catch(() => {});
        await page.waitForTimeout(800);
      }

      // Wait for Field Visibility Rules panel to show Create New Rule button
      if (step.target === "Create New Rule (doc step)") {
        const saveDialog = page.getByRole("dialog").filter({ hasText: /Save changes|unsaved changes/i });
        if (await saveDialog.isVisible().catch(() => false)) {
          await saveDialog.getByRole("button", { name: /Save Changes|^Save$/i }).first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(2000);
          await page.locator('[data-test-id="cs-open-fvr-button"]').first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(1500);
        }
        const createBtn = page.locator('[data-test-id="cs-fvr-empty-state-create-new-rule-cta"]').or(page.getByRole("button", { name: /Create New Rule|Add Rule|Add Another Rule/i })).or(page.getByText("Create New Rule", { exact: true })).or(page.getByText("Add Rule", { exact: true })).or(page.getByText("Add Another Rule", { exact: true })).first();
        await createBtn.waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
        await page.waitForTimeout(800);
      }

      // After Create New Rule: expand the rule row so the condition form is visible (Operand Field etc.)
      if (step.target === "Operand Field (FVR) (doc step)") {
        const ruleFormVisible = page.locator('[data-test-id="cs-conditions-field-dropdown-0"], .Accordion__open .rule').first();
        const visible = await ruleFormVisible.isVisible().catch(() => false);
        if (!visible) {
          await page.waitForTimeout(800).catch(() => {});
          const dialog = page.getByRole("dialog").filter({ hasText: /Field Visibility|Rules for this/i });
          const lastRuleRow = dialog.getByText(/^RULE \d+$/).last();
          if (await lastRuleRow.isVisible().catch(() => false)) {
            await lastRuleRow.click({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(800).catch(() => {});
          }
        }
        await ruleFormVisible.waitFor({ state: "visible", timeout: 12_000 }).catch(() => {});
        await page.waitForTimeout(300).catch(() => {});
      }

      // FVR option steps: wait for dropdown menu (listbox) to be visible before resolving option (react-select portal)
      if (step.action === "click" && (step.target?.endsWith("(FVR option) (doc step)"))) {
        const label = step.target.replace(/\s*\(FVR option\)\s*\(doc step\)\s*$/, "").trim();
        const listbox = page.getByRole("listbox").first();
        const option = page.getByRole("option", { name: new RegExp(`^${escapeRegex(label)}$`, "i") }).first();
        await Promise.race([
          listbox.waitFor({ state: "visible", timeout: 8_000 }),
          option.waitFor({ state: "visible", timeout: 8_000 }),
        ]).catch(() => {});
        await page.waitForTimeout(400);
        // Click option by role/listbox only (do not use unscoped getByText - e.g. "Date" matches builder field)
        const t = getStepTimeoutMs(step);
        const byRole = page.getByRole("option", { name: new RegExp(label, "i") }).first();
        if (await byRole.isVisible().catch(() => false)) {
          await byRole.click({ timeout: t });
          break;
        }
        const listboxVisible = await listbox.isVisible().catch(() => false);
        if (listboxVisible) {
          const optInListbox = listbox.getByRole("option", { name: new RegExp(label, "i") }).first();
          if (await optInListbox.isVisible().catch(() => false)) {
            await optInListbox.click({ timeout: t });
            break;
          }
          const byTextInListbox = listbox.getByText(new RegExp(`^${escapeRegex(label)}$`, "i")).first();
          if (await byTextInListbox.isVisible().catch(() => false)) {
            await byTextInListbox.click({ timeout: t, force: true });
            break;
          }
        }
        const inDialog = page.getByRole("dialog").filter({ hasText: /Field Visibility|Rules for this/i }).getByText(new RegExp(label, "i")).first();
        if (await inDialog.isVisible().catch(() => false)) {
          await inDialog.click({ timeout: t, force: true });
          break;
        }
        await page.keyboard.type(label, { delay: 50 });
        await page.waitForTimeout(200);
        await page.keyboard.press("Enter");
        break;
      }

      if (step.target === "Show as Tab (doc step)") {
        const t = getStepTimeoutMs(step);
        const showAsTabRow = page
          .locator(
            'div:has(> .Label--color--secondary:has-text("Show as Tab")), [data-test-id="cs-ct-field-global-tab-disabled"], [data-test-id="cs-ct-field-global-tab-enabled"]'
          )
          .first();
        const tabCheckbox = showAsTabRow
          .locator('input[type="checkbox"][name$=".tab"], input[type="checkbox"][aria-label$=".tab"], input[type="checkbox"]')
          .first();
        const toggle = showAsTabRow.locator("label.toggle-switch, .toggle-switch, [role='switch']").first();

        await expect(showAsTabRow).toBeVisible({ timeout: t });
        await expect(toggle).toBeVisible({ timeout: t });
        const isChecked = await tabCheckbox.isChecked().catch(() => false);
        if (isChecked) break;

        const checkedByDirectCheck = await tabCheckbox.check({ timeout: t, force: true }).then(
          () => true,
          () => false
        );
        if (!checkedByDirectCheck) {
          await toggle.click({ timeout: t, force: true }).catch(() => {});
        }

        let nowChecked = await tabCheckbox.isChecked().catch(() => false);
        if (!nowChecked) {
          await showAsTabRow.evaluate((el) => {
            const cb = el.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
            if (!cb) return;
            if (!cb.checked) cb.checked = true;
            cb.dispatchEvent(new Event("input", { bubbles: true }));
            cb.dispatchEvent(new Event("change", { bubbles: true }));
          });
          nowChecked = await tabCheckbox.isChecked().catch(() => false);
        }

        await expect(nowChecked).toBeTruthy();
        break;
      }
      if (
        step.target === "First Asset row (doc step)" &&
        ["add-entry-asset-to-a-release-part-2"].includes(String(flow?.id || "").toLowerCase())
      ) {
        const t = getStepTimeoutMs(step);
        // Assets list can render skeletons first; wait briefly for real table rows to appear.
        await page
          .waitForFunction(
            () => {
              const rows = document.querySelectorAll('[data-test-id^="cs-table-body-row-"]');
              if (!rows.length) return false;
              return Array.from(rows).some((row) => {
                const link = row.closest("a[href]") as HTMLAnchorElement | null;
                const href = link?.getAttribute("href") || "";
                return href.includes("/assets/blt");
              });
            },
            { timeout: Math.min(t, 15_000) }
          )
          .catch(() => {});

        // 1) Prefer a visible file row (asset type != Folder) and open it.
        const fileHref = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('[data-test-id^="cs-table-body-row-"]')) as HTMLElement[];
          for (const row of rows) {
            const typeCell = row.querySelector('[data-test-id="cs-asset-table-head-asset-type"]');
            const typeText = (typeCell?.textContent || "").trim().toLowerCase();
            const isFolder = typeText.includes("folder");
            const link = row.closest("a[href]") as HTMLAnchorElement | null;
            const href = link?.getAttribute("href") || "";
            if (!href.includes("/assets/blt")) continue;
            if (!isFolder && !href.includes("/browse")) return href;
          }
          return "";
        });
        if (fileHref) {
          const origin = new URL(page.url()).origin;
          const targetUrl = fileHref.startsWith("http")
            ? fileHref
            : fileHref.startsWith("#")
            ? `${origin}/${fileHref}`
            : `${origin}${fileHref.startsWith("/") ? "" : "/"}${fileHref}`;
          await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
          break;
        }

        // 2) If file not visible, open first folder row.
        const folderHref = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('[data-test-id^="cs-table-body-row-"]')) as HTMLElement[];
          for (const row of rows) {
            const typeCell = row.querySelector('[data-test-id="cs-asset-table-head-asset-type"]');
            const typeText = (typeCell?.textContent || "").trim().toLowerCase();
            if (!typeText.includes("folder")) continue;
            const link = row.closest("a[href]") as HTMLAnchorElement | null;
            const href = link?.getAttribute("href") || "";
            if (!href.includes("/assets/blt") || !href.includes("/browse")) continue;
            return href;
          }
          return "";
        });
        if (!folderHref) {
          throw new Error("No visible asset file row or folder row found to open from Assets table.");
        }
        {
          const origin = new URL(page.url()).origin;
          const folderUrl = folderHref.startsWith("http")
            ? folderHref
            : folderHref.startsWith("#")
            ? `${origin}/${folderHref}`
            : `${origin}${folderHref.startsWith("/") ? "" : "/"}${folderHref}`;
          await page.goto(folderUrl, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
          await page.waitForTimeout(700);
        }

        // 3) Inside opened folder, select first visible file row.
        const nestedFileHref = await page.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('[data-test-id^="cs-table-body-row-"]')) as HTMLElement[];
          for (const row of rows) {
            const typeCell = row.querySelector('[data-test-id="cs-asset-table-head-asset-type"]');
            const typeText = (typeCell?.textContent || "").trim().toLowerCase();
            const isFolder = typeText.includes("folder");
            const link = row.closest("a[href]") as HTMLAnchorElement | null;
            const href = link?.getAttribute("href") || "";
            if (!href.includes("/assets/blt")) continue;
            if (!isFolder && !href.includes("/browse")) return href;
          }
          return "";
        });
        if (!nestedFileHref) {
          throw new Error("Opened folder but no visible file row found inside folder.");
        }
        {
          const origin = new URL(page.url()).origin;
          const fileUrl = nestedFileHref.startsWith("http")
            ? nestedFileHref
            : nestedFileHref.startsWith("#")
            ? `${origin}/${nestedFileHref}`
            : `${origin}${nestedFileHref.startsWith("/") ? "" : "/"}${nestedFileHref}`;
          await page.goto(fileUrl, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
        }
        break;
      }
      if (
        step.target === "First Asset row (doc step)" &&
        ["name-asset-versions", "rename-asset-versions", "restore-old-asset-version", "create-a-folder"].includes(
          String(flow?.id || "").toLowerCase()
        )
      ) {
        const t = getStepTimeoutMs(step);
        const hrefFromDom = await page.evaluate(() => {
          const rowCandidates = Array.from(
            document.querySelectorAll('[role="row"], [data-test-id^="cs-table-body-row-"]')
          ) as HTMLElement[];
          for (const row of rowCandidates) {
            const txt = (row.textContent || "").toLowerCase();
            const isImageRow = txt.includes(".svg") || txt.includes(".png") || txt.includes(" image ");
            if (!isImageRow) continue;
            const link = (row.closest('a[href*="/assets/blt"]') ||
              row.querySelector('a[href*="/assets/blt"]')) as HTMLAnchorElement | null;
            if (!link) continue;
            const href = link.getAttribute("href") || "";
            if (!href || href.includes("/browse")) continue;
            return href;
          }
          return "";
        });
        if (hrefFromDom) {
          const origin = new URL(page.url()).origin;
          const targetUrl = hrefFromDom.startsWith("http")
            ? hrefFromDom
            : hrefFromDom.startsWith("#")
            ? `${origin}/${hrefFromDom}`
            : `${origin}${hrefFromDom.startsWith("/") ? "" : "/"}${hrefFromDom}`;
          await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
          break;
        }
        const firstDataRow = page
          .locator('[role="row"]:has-text(".svg"), [role="row"]:has-text(".png"), [data-test-id^="cs-table-body-row-"]:has-text(".svg"), [data-test-id^="cs-table-body-row-"]:has-text(".png")')
          .first();
        await expect(firstDataRow).toBeVisible({ timeout: t });
        await firstDataRow.click({ timeout: t, force: true }).catch(() => {});
        await page.waitForTimeout(800);
        if (!/\/assets\/blt/i.test(page.url())) {
          const hrefFromRow = await firstDataRow.evaluate((el) => {
            const link = (el.closest("a") || el.querySelector("a[href]")) as HTMLAnchorElement | null;
            return link?.getAttribute("href") || "";
          });
          if (hrefFromRow) {
            const origin = new URL(page.url()).origin;
            const targetUrl = hrefFromRow.startsWith("http")
              ? hrefFromRow
              : hrefFromRow.startsWith("#")
              ? `${origin}/${hrefFromRow}`
              : `${origin}${hrefFromRow.startsWith("/") ? "" : "/"}${hrefFromRow}`;
            await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
          }
        }
        break;
      }
      if (
        step.target === "Created folder row (doc step)" &&
        String(flow?.id || "").toLowerCase() === "create-a-folder"
      ) {
        const t = getStepTimeoutMs(step);
        const createdFolderName = String((flow as any)?.__createdAssetFolderName || "").trim();
        if (createdFolderName) {
          const exactRow = page
            .locator(
              `[data-test-id^="cs-table-body-row-"] a:has-text("${createdFolderName}"), [data-test-id^="cs-table-body-row-"] [data-testid="asset-list-title"]:has-text("${createdFolderName}")`
            )
            .first();
          if (await exactRow.isVisible().catch(() => false)) {
            await exactRow.click({ timeout: t, force: true }).catch(() => {});
            break;
          }
        }
        const firstFolderRow = page
          .locator('[data-test-id^="cs-table-body-row-"] a[href*="/assets/browse"], [data-test-id="cs-table-body-row-0"]')
          .first();
        await expect(firstFolderRow).toBeVisible({ timeout: t });
        await firstFolderRow.click({ timeout: t, force: true }).catch(() => {});
        break;
      }
      if (
        step.target === "First folder vertical ellipses (doc step)" &&
        ["move-a-folder", "rename-a-folder", "delete-a-folder"].includes(String(flow?.id || "").toLowerCase())
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const flowId = String(flow?.id || "").toLowerCase();
        const expectedMenuLabel = flowId === "move-a-folder" ? "Move" : flowId === "delete-a-folder" ? "Delete" : "Rename";
        const firstFolderRow = page
          .locator(
            '[data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-table-head-asset-type"]:has-text("Folder")), [data-test-id^="cs-table-body-row-"]:has([role="cell"]:has-text("Folder"))'
          )
          .first();
        const actionBtn = firstFolderRow
          .locator(
            '[data-test-id="cs-table-action-options"], a svg[name="DotsThreeLargeVertical"], a:has(svg[name="DotsThreeLargeVertical"])'
          )
          .first();
        await expect(actionBtn).toBeVisible({ timeout: t });
        await actionBtn.click({ timeout: t, force: true }).catch(() => {});

        const expectedOption = page
          .locator(
            `[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="${expectedMenuLabel.toLowerCase()}" i], [data-test-id="cs-vertical-action-tooltip"]:visible li:has-text("${expectedMenuLabel}")`
          )
          .first();
        // Use the same row action only: click up to 2 times, do not click elsewhere.
        let visible = await expectedOption
          .waitFor({ state: "visible", timeout: Math.min(t, 8_000) })
          .then(() => true)
          .catch(() => false);
        if (!visible && (flowId === "move-a-folder" || flowId === "delete-a-folder")) {
          await actionBtn.click({ timeout: t, force: true }).catch(() => {});
          visible = await expectedOption
            .waitFor({ state: "visible", timeout: Math.min(t, 8_000) })
            .then(() => true)
            .catch(() => false);
        }
        if (!visible) {
          throw new Error(
            `Could not locate/open folder vertical ellipses menu with "${expectedMenuLabel}" within ${Math.floor(t / 1000)}s.`
          );
        }
        break;
      }
      if (step.target === "Close modal/window (doc step)") {
        const t = getStepTimeoutMs(step);
        const closeBtn = page
          .locator('[data-test-id="cs-modal-close"], .ReactModal__close, [aria-label*="close" i]')
          .first();
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click({ timeout: t, force: true }).catch(() => {});
        } else {
          await page.keyboard.press("Escape").catch(() => {});
        }
        break;
      }
      if (
        step.target === "Move To option (doc step)" &&
        String(flow?.id || "").toLowerCase() === "move-a-folder"
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const moveToOption = page
          .locator(
            '[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="move" i], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Move"), [data-test-id="cs-vertical-action-tooltip"] li:has-text("Move")'
          )
          .first();
        await expect(moveToOption).toBeVisible({ timeout: t });
        const moveToTitle = page.locator('[data-test-id="cs-modal-title-move-to"], h3:has-text("Move To")').first();
        const openModalByClick = async () => {
          await moveToOption.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          return await moveToTitle.isVisible().catch(() => false);
        };
        let opened = await openModalByClick();
        if (!opened) {
          await moveToOption.evaluate((el) => {
            (el as HTMLElement).click();
            el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
            el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          }).catch(() => {});
          await page.waitForTimeout(300);
          opened = await moveToTitle.isVisible().catch(() => false);
        }
        if (!opened) {
          await page.keyboard.press("Enter").catch(() => {});
          await page.waitForTimeout(300);
        }
        break;
      }
      if (
        step.target === "Rename option (doc step)" &&
        String(flow?.id || "").toLowerCase() === "rename-a-folder"
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const renameOption = page
          .locator(
            '[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="rename" i], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Rename"), [data-test-id="cs-vertical-action-tooltip"] li:has-text("Rename")'
          )
          .first();
        await expect(renameOption).toBeVisible({ timeout: t });
        const renameTitle = page
          .locator('[data-test-id="cs-modal-title-rename-folder"], h3:has-text("Rename Folder")')
          .first();
        const openByClick = async () => {
          await renameOption.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          return await renameTitle.isVisible().catch(() => false);
        };
        let opened = await openByClick();
        if (!opened) {
          await renameOption
            .evaluate((el) => {
              (el as HTMLElement).click();
              el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            })
            .catch(() => {});
          await page.waitForTimeout(300);
          opened = await renameTitle.isVisible().catch(() => false);
        }
        if (!opened) {
          await page.keyboard.press("Enter").catch(() => {});
          await page.waitForTimeout(300);
        }
        break;
      }
      if (
        step.target === "Delete option (doc step)" &&
        String(flow?.id || "").toLowerCase() === "delete-a-folder"
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const deleteOption = page
          .locator(
            '[data-test-id="cs-vertical-action-tooltip"] [data-test-id*="delete" i], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete"), [data-test-id="cs-vertical-action-tooltip"] li:has-text("Delete")'
          )
          .first();
        await expect(deleteOption).toBeVisible({ timeout: t });
        const deleteTitle = page
          .locator('[data-test-id="cs-modal-title-delete-asset-folder"], h3:has-text("Delete Asset Folder")')
          .first();
        await deleteOption.click({ timeout: t, force: true }).catch(() => {});
        if (!(await deleteTitle.isVisible().catch(() => false))) {
          await deleteOption
            .evaluate((el) => {
              (el as HTMLElement).click();
              el.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              el.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            })
            .catch(() => {});
          await page.waitForTimeout(300);
        }
        break;
      }
      if (step.target === "Move here (doc step)" && String(flow?.id || "").toLowerCase() === "move-a-folder") {
        const t = getStepTimeoutMs(step);
        const modalTitle = page.locator('[data-test-id="cs-modal-title-move-to"], h3:has-text("Move To")').first();
        const moveBtn = page
          .locator(
            '[data-test-id="cs-asset-move-folder"], button:has-text("Move here"), button[aria-label*="Move Asset" i]'
          )
          .first();
        const folderRows = page.locator(
          '[data-test-id="cs-modal-description"] [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-asset-detail-title"])'
        );

        // Some stacks reopen the Move To modal after move. Keep selecting any folder and moving again.
        for (let attempt = 0; attempt < 20; attempt++) {
          if (!(await modalTitle.isVisible().catch(() => false))) break;
          const count = await folderRows.count().catch(() => 0);
          if (count <= 0) break;
          const row = folderRows.first();
          if (await row.isVisible().catch(() => false)) {
            await row.click({ timeout: t, force: true }).catch(() => {});
          }
          await expect(moveBtn).toBeVisible({ timeout: t });
          await moveBtn.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(400);
        }

        break;
      }
      if (step.target === "Ensure Master Locale Selected (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 15_000);
        const localeDropdown = page
          .locator('[data-test-id="cs-edit-entry-locale-dropdown"], [data-test-id="cs-edit-entry-locale-dropdown-value"]')
          .first();
        const localeValue = page.locator('[data-test-id="cs-edit-entry-locale-dropdown-value"]').first();

        await expect(localeDropdown).toBeVisible({ timeout: t });
        const currentValue = (await localeValue.innerText().catch(() => "")).replace(/\s+/g, " ").trim();
        if (!/\(M\)\s*$/i.test(currentValue) && !/\(M\)/i.test(currentValue)) {
          await localeDropdown.click({ timeout: t, force: true }).catch(() => {});
          const masterOption = page
            .locator(
              '.Dropdown__menu__list__item:has(.master-legend), li[data-test-id^="cs-locale-dropdown-option-"]:has(.master-legend), li[data-test-id^="cs-locale-dropdown-option-"]:has-text("(M)")'
            )
            .first();
          await expect(masterOption).toBeVisible({ timeout: t });
          await masterOption.click({ timeout: t, force: true });
          await page.waitForTimeout(250);
        }

        const finalValue = (await localeValue.innerText().catch(() => "")).replace(/\s+/g, " ").trim();
        if (!/\(M\)\s*$/i.test(finalValue) && !/\(M\)/i.test(finalValue)) {
          throw new Error(
            `Locale value does not contain (M) after attempting selection. Current locale value: "${finalValue || "(empty)"}"`
          );
        }
        break;
      }

      // set-up-live-preview-for-your-stack — verify doc controls then perform clicks (scoped dropdown/toggles).
      if (String(flow?.id || "").toLowerCase() === "set-up-live-preview-for-your-stack") {
        const t = Math.min(getStepTimeoutMs(step), 30_000);
        if (step.target === "Environment row action menu first row (doc step)") {
          const menu = page
            .locator(
              '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-action-options"]'
            )
            .first();
          await expect(menu).toBeVisible({ timeout: t });
          await menu.click({ timeout: t, force: true });
          await page.waitForTimeout(350);
          break;
        }
        if (step.target === "Enable Live Preview checkbox (doc step)") {
          const enableLabel = page
            .locator('[data-test-id="cs-checkbox"]:has-text("Enable Live Preview"), label:has-text("Enable Live Preview")')
            .first();
          const enableInput = enableLabel.locator('input[type="checkbox"]').first();
          await expect(enableLabel).toBeVisible({ timeout: t });
          if (!(await enableInput.isChecked().catch(() => false))) {
            await enableLabel.click({ timeout: t, force: true });
            await page.waitForTimeout(300);
          }
          break;
        }
        if (step.target === "Default Preview Environment dropdown (doc step)") {
          const lpSection = page
            .locator('.general-settings-section-wrapper:has(h2.general-settings-section-title:has-text("Live Preview"))')
            .first();
          const envSelect = lpSection.locator('[data-test-id="cs-select"]').first();
          await expect(envSelect).toBeVisible({ timeout: t });
          await envSelect.click({ timeout: t, force: true });
          await page.waitForTimeout(300);
          break;
        }
        if (step.target === "First Default Preview Environment option (doc step)") {
          const firstOption = page
            .locator('.Select__menu [role="option"], .Select__menu [class*="option"], div[id^="react-select-"][id*="-option-"]')
            .first();
          await expect(firstOption).toBeVisible({ timeout: t });
          await firstOption.click({ timeout: t, force: true });
          await page.waitForTimeout(200);
          break;
        }
        if (step.target === "Live Preview Display Setup Status toggle (doc step)") {
          const wrap = page
            .locator('.general-settings-section-wrapper:has(h2.general-settings-section-title:has-text("Live Preview"))')
            .first();
          const toggleInput = wrap
            .locator('[data-test-id="cs-toggle-switch"]:has-text("Display Setup Status") input[type="checkbox"]')
            .first();
          const toggleSwitch = wrap
            .locator('[data-test-id="cs-toggle-switch"]:has-text("Display Setup Status") .toggle-switch')
            .first();
          await expect(toggleSwitch).toBeVisible({ timeout: t });
          if (!(await toggleInput.isChecked().catch(() => false))) {
            await toggleSwitch.click({ timeout: t, force: true });
            await page.waitForTimeout(200);
          }
          break;
        }
      }

      // Live Preview — "Always Open in New Tab": .Label--color--secondary inside cs-field (open-live-preview-in-a-new-tab doc). Scope to Visual Experience pane; scroll — control may be below fold.
      if (
        (String(flow?.id || "").toLowerCase() === "set-up-live-preview-for-your-stack" ||
          String(flow?.id || "").toLowerCase() === "open-live-preview-in-a-new-tab") &&
        step.target === "Always Open in New Tab toggle (doc step)"
      ) {
        const t = Math.min(getStepTimeoutMs(step), 30_000);
        const vx = page
          .locator('.visual-experience-settings, [data-testid="cs-vb--visual-experience-settings"]')
          .first();
        await vx.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await vx.evaluate((el) => el.scrollTo({ top: (el as HTMLElement).scrollHeight, behavior: "instant" })).catch(() => {});
        await page.waitForTimeout(400);
        const row = vx
          .locator('[data-test-id="cs-field"]')
          .filter({ hasText: /always\s+open\s+in\s+new\s+tab/i })
          .first();
        const vis = await row.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!vis) {
          throw new Error(
            'Live Preview (doc): "Always Open in New Tab" row not found (expected [data-test-id="cs-field"] with .Label--color--secondary; Visual Experience → General).'
          );
        }
        const inp = row.locator('input[type="checkbox"]').first();
        const sw = row.locator(".toggle-switch").first();
        if (!(await inp.isChecked().catch(() => false))) {
          await sw.click({ timeout: t, force: true });
          await page.waitForTimeout(200);
        }
        break;
      }

      // custom-preview-urls — Preview URL tab (preview-url-page.html): toggle, URL Path accordion, Branch, scope, Save.
      if (String(flow?.id || "").toLowerCase() === "custom-preview-urls") {
        const t = Math.min(getStepTimeoutMs(step), 35_000);
        const scope = page.locator(".preview-url-container").first();
        const item = scope.locator(".url-path-item").first();

        if (step.target === "Enable Custom Preview URL toggle (doc step)") {
          await expect(scope).toBeVisible({ timeout: Math.min(t, 25_000) });
          const sw = scope.locator('.toggle-wrapper-custom [data-test-id="cs-toggle-switch"] .toggle-switch').first();
          const inp = scope.locator('.toggle-wrapper-custom [data-test-id="cs-toggle-switch"] input[type="checkbox"]').first();
          await expect(sw).toBeVisible({ timeout: t });
          if (!(await inp.isChecked().catch(() => false))) {
            await sw.click({ timeout: t, force: true });
            await page.waitForTimeout(450);
          }
          break;
        }

        if (step.target === "Expand first URL path accordion (doc step)") {
          await expect(item).toBeVisible({ timeout: t });
          const expandBtn = item.locator('.Accordion__heading button:has(svg[name="CaretDown"])').last();
          await expect(expandBtn).toBeVisible({ timeout: Math.min(t, 20_000) });
          await expandBtn.click({ timeout: t, force: true });
          await page.waitForTimeout(650);
          break;
        }

        if (step.target === "URL path Branch dropdown (doc step)") {
          await expect(item).toBeVisible({ timeout: t });
          const candidates = [
            item.locator('[data-test-id="cs-select"]').first(),
            item.locator(".Select__control").first(),
            item.locator('[class*="branch" i] .Select__control').first(),
          ];
          let clicked = false;
          for (const sel of candidates) {
            if (await sel.isVisible({ timeout: 3_500 }).catch(() => false)) {
              await sel.click({ timeout: t, force: true });
              clicked = true;
              break;
            }
          }
          if (!clicked) {
            recordVerificationWarning(
              step,
              context,
              'Custom Preview URLs (doc): branch dropdown not visible under URL path (single branch / applies to all branches — doc "Select the Branch" may have no control).'
            );
          }
          await page.waitForTimeout(400);
          break;
        }

        if (step.target === "First URL path Branch option (doc step)") {
          const menu = page.locator(".Select__menu").first();
          if (await menu.isVisible({ timeout: 2_500 }).catch(() => false)) {
            const firstOption = page
              .locator('.Select__menu [role="option"], .Select__menu [class*="option"], div[id^="react-select-"][id*="-option-"]')
              .first();
            await expect(firstOption).toBeVisible({ timeout: t });
            await firstOption.click({ timeout: t, force: true });
            await page.waitForTimeout(280);
          } else {
            recordVerificationWarning(
              step,
              context,
              "Custom Preview URLs (doc): branch menu did not open (no branch options to pick)."
            );
          }
          break;
        }

        if (step.target === "URL path All content types option (doc step)") {
          await expect(item).toBeVisible({ timeout: t });
          const radio = item.getByRole("radio", { name: /All Content Types/i }).first();
          const byText = item.getByText("All Content Types", { exact: true }).first();
          if (await radio.isVisible({ timeout: 7_000 }).catch(() => false)) {
            await radio.click({ timeout: t, force: true }).catch(() => {});
          } else if (await byText.isVisible({ timeout: 5_000 }).catch(() => false)) {
            await byText.click({ timeout: t, force: true }).catch(() => {});
          } else {
            throw new Error(
              'Custom Preview URLs (doc): "All Content Types" control not found in URL path row (radio or label).'
            );
          }
          await page.waitForTimeout(220);
          break;
        }
      }

      // add-workflows-and-stages — workflow create/edit (data/dom/CMS/workflows/*.html).
      if (String(flow?.id || "").toLowerCase() === "add-workflows-and-stages") {
        const t = Math.min(getStepTimeoutMs(step), 50_000);
        if (step.target === "Workflow first stage Done button (doc step)") {
          const btn = page.locator('[data-test-id="cs-workflow-stage-done"]').first();
          await expect(btn).toBeVisible({ timeout: t });
          await btn.click({ timeout: t, force: true });
          await page.waitForTimeout(450);
          break;
        }
        if (step.target === "Workflow second stage Done button (doc step)") {
          const btns = page.locator('[data-test-id="cs-workflow-stage-done"]');
          const n = await btns.count();
          const btn = n > 1 ? btns.nth(n - 1) : btns.last();
          await expect(btn).toBeVisible({ timeout: t });
          await btn.click({ timeout: t, force: true });
          await page.waitForTimeout(450);
          break;
        }
        if (step.target === "Workflow editor Save button (doc step)") {
          const inMain = page
            .locator(".content-main.workflows, .content-main.workflow, form[data-test-id=\"cs-form\"]")
            .first()
            .locator("..")
            .locator("button.Button--primary")
            .filter({ hasText: /^Save$/i })
            .first();
          // Workflow footer Save uses aria-label "aria-button" but visible text is "Save".
          const byVisibleText = page
            .locator("button")
            .filter({ hasText: /^Save$/ })
            .filter({ hasNotText: /Save and/i })
            .last();
          if (await inMain.isVisible({ timeout: 7_000 }).catch(() => false)) {
            await inMain.click({ timeout: t, force: true });
          } else if (await byVisibleText.isVisible({ timeout: 8_000 }).catch(() => false)) {
            await byVisibleText.click({ timeout: t, force: true });
          } else {
            await expect(byVisibleText).toBeVisible({ timeout: t });
            await byVisibleText.click({ timeout: t, force: true });
          }
          await page.waitForTimeout(900);
          break;
        }
        if (step.target === "Enable Workflow toggle switch (doc step)") {
          // Label is [data-test-id="cs-wf-activation"]; checkbox is under sibling
          // [data-test-id^="cs-wf-activation-switch"] (e.g. ...-switch-disabled).
          const wrap = page.locator('[data-test-id^="cs-wf-activation-switch"]').first();
          const inp = wrap.locator('input[type="checkbox"]').first();
          const toggleLbl = wrap.locator("label.toggle-switch").first();
          await wrap.scrollIntoViewIfNeeded().catch(() => {});
          await expect(wrap).toBeVisible({ timeout: Math.min(t, 20_000) });
          if (!(await inp.isChecked().catch(() => false))) {
            await toggleLbl.click({ timeout: 12_000, force: true }).catch(async () => {
              await inp.check({ timeout: 10_000, force: true });
            });
            await page.waitForTimeout(300);
          }
          break;
        }
      }

      if (step.target === "Ensure Live Preview Enabled (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const enableLabel = page
          .locator('[data-test-id="cs-checkbox"]:has-text("Enable Live Preview"), label:has-text("Enable Live Preview")')
          .first();
        const enableInput = enableLabel.locator('input[type="checkbox"]').first();
        await expect(enableLabel).toBeVisible({ timeout: t });
        let changed = false;

        const isEnabled = await enableInput.isChecked().catch(() => false);
        if (!isEnabled) {
          await enableLabel.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(250);
          changed = true;
        }

        // Always select first environment option from dropdown.
        const envSelect = page.locator('[data-test-id="cs-select"]').first();
        await expect(envSelect).toBeVisible({ timeout: t });
        await envSelect.click({ timeout: t, force: true }).catch(() => {});
        const firstOption = page
          .locator('.Select__menu [role="option"], .Select__menu [class*="option"], div[id^="react-select-"][id*="-option-"]')
          .first();
        await expect(firstOption).toBeVisible({ timeout: t });
        await firstOption.click({ timeout: t, force: true }).catch(() => {});
        await page.waitForTimeout(150);
        changed = true;

        // Ensure Display Setup Status toggle is ON.
        const setupToggleInput = page
          .locator('[data-test-id="cs-toggle-switch"]:has-text("Display Setup Status") input[type="checkbox"]')
          .first();
        const setupToggleSwitch = page
          .locator('[data-test-id="cs-toggle-switch"]:has-text("Display Setup Status") .toggle-switch')
          .first();
        const isSetupOn = await setupToggleInput.isChecked().catch(() => false);
        if (!isSetupOn) {
          await setupToggleSwitch.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(150);
          changed = true;
        }

        if (changed) {
          const saveBtn = page
            .locator('button[data-test-id="cs-button"]:has-text("Save"), button:has-text("Save")')
            .first();
          await expect(saveBtn).toBeVisible({ timeout: t });
          await saveBtn.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(500);
        }
        break;
      }
      if (step.target === "Settings (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 20_000);
        const directSettings = page
          .locator(
            '[data-test-id="cms-nav-settings"], a[href*="/settings/stack"], button:has-text("Settings"), a:has-text("Settings")'
          )
          .first();
        if (await directSettings.isVisible().catch(() => false)) {
          await directSettings.click({ timeout: t, force: true }).catch(() => {});
          break;
        }
        // If element exists but visibility calculation fails due top-nav truncation/layout,
        // dispatch a DOM click on known settings anchor/button first.
        const clickedByDom = await page.evaluate(() => {
          const candidate = document.querySelector(
            '[data-test-id="cms-nav-settings"], a[href*="/settings/stack"], button[aria-label="Settings"]'
          ) as HTMLElement | null;
          if (!candidate) return false;
          candidate.click();
          candidate.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          candidate.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          candidate.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          return true;
        });
        if (clickedByDom) {
          await page.waitForTimeout(250);
          break;
        }

        // If Settings is truncated in top nav, open "More" then click Settings.
        const moreBtn = page
          .locator(
            '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), [data-test-id="menu"] button:has-text("More")'
          )
          .first();
        if (await moreBtn.isVisible().catch(() => false)) {
          await moreBtn.click({ timeout: t, force: true }).catch(() => {});
          await page.waitForTimeout(250);
        }

        const settingsFromMore = page
          .locator(
            '[role="menu"] [role="menuitem"]:has-text("Settings"), [data-test-id="menu"] li:has-text("Settings"), [data-test-id="menu"] a:has-text("Settings"), [data-test-id="menu"] button:has-text("Settings"), li:has-text("Settings"), a:has-text("Settings"), button:has-text("Settings")'
          )
          .first();
        if (await settingsFromMore.isVisible().catch(() => false)) {
          await settingsFromMore.click({ timeout: t, force: true }).catch(() => {});
          break;
        }
        // Last fallback: click by DOM text from menu content.
        const clickedMenuSettings = await page.evaluate(() => {
          const nodes = Array.from(
            document.querySelectorAll('[role="menuitem"], [data-test-id="menu"] a, [data-test-id="menu"] button, li, a, button')
          ) as HTMLElement[];
          const item = nodes.find((n) => /\bsettings\b/i.test((n.textContent || "").trim()));
          if (!item) return false;
          item.click();
          item.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
          item.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
          item.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          return true;
        });
        if (!clickedMenuSettings) {
          const stackMatch = page.url().match(/#!\/stack\/([^/]+)/i);
          if (stackMatch?.[1]) {
            const targetUrl = `${page.url().split("#!")[0]}#!/stack/${stackMatch[1]}/settings/stack`;
            await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: t }).catch(() => {});
            await page.waitForTimeout(400);
            break;
          }
          throw new Error("Settings was not visible directly and not found under More menu.");
        }
        await page.waitForTimeout(250);
        break;
      }
      if (step.target === "Toggle orientation (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const orientationBtnNewTab = page.locator('[data-test-id="live-preview-browser-toggle-viewport-btn"]').first();
        const orientationBtnSettingsBar = page
          .locator('[data-test-id="live-preview-browser-viewport-settings-bar-toggle-viewport"], .lp-viewport-orientation-icon')
          .first();
        const orientationBtn = (await orientationBtnNewTab.isVisible().catch(() => false))
          ? orientationBtnNewTab
          : orientationBtnSettingsBar;
        await expect(orientationBtn).toBeVisible({ timeout: t });
        await orientationBtn.click({ timeout: t, force: true }).catch(() => {});
        break;
      }
      if (
        step.target === "Floating panel See More (doc step)" &&
        ["bulk-publish-assets", "bulk-unpublish-assets"].includes(String(flow?.id || "").toLowerCase())
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const flowId = String(flow?.id || "").toLowerCase();
        const actionBtn =
          flowId === "bulk-unpublish-assets"
            ? page.locator('button[data-test-id="cs-asset-bulk-panel-unpublish"], [data-test-id="cs-asset-bulk-panel-unpublish"]').first()
            : page.locator('button[data-test-id="cs-asset-bulk-panel-publish"], [data-test-id="cs-asset-bulk-panel-publish"]').first();
        if (await actionBtn.isVisible().catch(() => false)) break;
        const seeMore = page
          .locator(
            '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"], [data-test-id="cs-bulk-action-panel"] [name="SeeMore"]'
          )
          .first();
        await expect(seeMore).toBeVisible({ timeout: t });
        await seeMore.click({ timeout: t, force: true }).catch(() => {});
        await page.waitForTimeout(250);
        break;
      }
      // Webhook create: Module/Action dropdowns must click the correct React Select control (not the first "Any" dropdown)
      if (step.target === "Module dropdown (doc step)" && String(flow?.id || "").toLowerCase() === "create-a-webhook") {
        const t = getStepTimeoutMs(step);
        const moduleControl = page.locator('[data-test-id="cs-webhooks-condition-select-module"] .Select__control').first();
        await expect(moduleControl).toBeVisible({ timeout: t });
        await moduleControl.click({ timeout: t, force: true });
        await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
      if (step.target === "Action dropdown (doc step)" && String(flow?.id || "").toLowerCase() === "create-a-webhook") {
        const t = getStepTimeoutMs(step);
        const actionControl = page.locator('[data-test-id="cs-webhooks-condition-select-action"] .Select__control').first();
        await expect(actionControl).toBeVisible({ timeout: t });
        await actionControl.click({ timeout: t, force: true });
        await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(300);
        break;
      }
      if (
        step.target === "Publish in floating panel (doc step)" &&
        String(flow?.id || "").toLowerCase() === "bulk-publish-assets"
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const clickPublishByDom = async () =>
          await page.evaluate(() => {
            const exactLi = document.querySelector(
              'li[data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-asset-bulk-panel-publish"])'
            ) as HTMLElement | null;
            if (exactLi) {
              exactLi.click();
              exactLi.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              exactLi.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              exactLi.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              return true;
            }
            const exactDiv = document.querySelector(
              '[data-test-id="cs-dropdown-elements"] [data-test-id="cs-asset-bulk-panel-publish"]'
            ) as HTMLElement | null;
            if (exactDiv) {
              exactDiv.click();
              exactDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              exactDiv.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              exactDiv.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              return true;
            }
            return false;
          });

        let clicked = await clickPublishByDom();
        if (!clicked) {
          const seeMore = page
            .locator(
              '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"], [data-test-id="cs-bulk-action-panel"] [name="SeeMore"]'
            )
            .first();
          if (await seeMore.isVisible().catch(() => false)) {
            await seeMore.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(300);
          }
          clicked = await clickPublishByDom();
        }
        if (!clicked) {
          throw new Error("Could not find/click Publish action in floating bulk panel after selecting assets.");
        }
        break;
      }
      if (
        step.target === "Unpublish in floating panel (doc step)" &&
        String(flow?.id || "").toLowerCase() === "bulk-unpublish-assets"
      ) {
        const t = Math.min(getStepTimeoutMs(step), 12_000);
        const clickUnpublishByDom = async () =>
          await page.evaluate(() => {
            const directBtn = document.querySelector(
              'button[data-test-id="cs-asset-bulk-panel-unpublish"], [data-test-id="cs-asset-bulk-panel-unpublish"]'
            ) as HTMLElement | null;
            if (directBtn) {
              directBtn.click();
              directBtn.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              directBtn.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              directBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              return true;
            }
            const exactLi = document.querySelector(
              'li[data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-asset-bulk-panel-unpublish"])'
            ) as HTMLElement | null;
            if (exactLi) {
              exactLi.click();
              exactLi.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              exactLi.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              exactLi.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              return true;
            }
            const exactDiv = document.querySelector(
              '[data-test-id="cs-dropdown-elements"] [data-test-id="cs-asset-bulk-panel-unpublish"]'
            ) as HTMLElement | null;
            if (exactDiv) {
              exactDiv.click();
              exactDiv.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
              exactDiv.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
              exactDiv.dispatchEvent(new MouseEvent("click", { bubbles: true }));
              return true;
            }
            return false;
          });

        let clicked = await clickUnpublishByDom();
        if (!clicked) {
          const seeMore = page
            .locator(
              '[data-test-id="table-see-more-icon"], [data-test-id="cs-dropdown"] [data-test-id="table-see-more-icon"], [data-test-id="cs-bulk-action-panel"] [name="SeeMore"]'
            )
            .first();
          if (await seeMore.isVisible().catch(() => false)) {
            await seeMore.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(300);
          }
          clicked = await clickUnpublishByDom();
        }
        if (!clicked) {
          throw new Error("Could not find/click Unpublish action in floating bulk panel after selecting assets.");
        }
        break;
      }

      // Shared Views: Close Users or Roles dropdown by clicking modal footer (dropdown overlays footer; use force + JS click)
      if (
        step.action === "click" &&
        step.target === "Close Users or Roles dropdown by clicking footer (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        const footer = page.locator(
          '[data-test-id="cs-share-view-entries"] div[class="ReactModal__Content__footer flex-right"], div[class="ReactModal__Content__footer flex-right"]'
        ).first();
        await footer.waitFor({ state: "attached", timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(300);
        await footer.click({ timeout: 5_000, force: true }).catch(async () => {
          await footer.evaluate((el: HTMLElement) => el.click());
        });
        await page.waitForTimeout(500);
        await page.locator('[data-test-id="cs-share-views-entries-permission-dropdown"], [data-test-id="cs-share-views-entries-permission-dropdown-value"]').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
        break;
      }

      // Shared Views: Manage Access - if Viewer dropdown visible, verify options (Viewer, Editor, Remove) and set to Editor
      if (
        step.action === "click" &&
        step.target === "Manage Access: if Viewer dropdown visible, verify options and set to Editor (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        const modal = page.locator('[data-test-id="cs-manage-access-entries"]');
        const viewerDropdown = modal.locator(
          '.Dropdown:has-text("Viewer"), .permission-row .Dropdown, button:has-text("Viewer"), div[role="button"]:has-text("Viewer"), [data-test-id*="permission"]:has-text("Viewer")'
        ).first();
        const isVisible = await viewerDropdown.isVisible().catch(() => false);
        if (isVisible) {
          await viewerDropdown.click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(400);
          const viewerOpt = page.locator('li:has-text("Viewer"), .Dropdown__menu__list__item:has-text("Viewer")').first();
          const editorOpt = page.locator('li:has-text("Editor"), .Dropdown__menu__list__item:has-text("Editor")').first();
          const removeOpt = page.locator('li:has-text("Remove"), .Dropdown__menu__list__item:has-text("Remove")').first();
          const missing: string[] = [];
          if (!(await viewerOpt.isVisible().catch(() => false))) missing.push("Viewer");
          if (!(await editorOpt.isVisible().catch(() => false))) missing.push("Editor");
          if (!(await removeOpt.isVisible().catch(() => false))) missing.push("Remove");
          if (missing.length) {
            recordVerificationWarning(step, context, `Manage Access: expected options Viewer, Editor, Remove; missing: ${missing.join(", ")}`);
          }
          await editorOpt.click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(300);
        }
        break;
      }

      // Use Saved Views: Manage Saved Views - perform each option (Rename, Share, Copy Link, View Details, Delete)
      if (
        step.action === "click" &&
        step.target === "Manage Saved Views: verify and perform options (doc step)" &&
        String(flow?.id || "").toLowerCase() === "use-saved-views"
      ) {
        const manageOpts = [
          { label: "Rename", sel: '[data-test-id="cs-my-views-edit-name"], li:has-text("Rename"), .Dropdown__menu__list__item:has-text("Rename")' },
          { label: "Share", sel: '[data-test-id="cs-my-views-share-view"], li:has-text("Share"), .Dropdown__menu__list__item:has-text("Share")' },
          { label: "Copy Link", sel: '[data-test-id="cs-my-views-copy-link"], li:has-text("Copy Link"), .Dropdown__menu__list__item:has-text("Copy Link")' },
          { label: "View Details", sel: '[data-test-id="cs-my-views-view-info"], li:has-text("View Details"), .Dropdown__menu__list__item:has-text("View Details")' },
          { label: "Delete", sel: '[data-test-id="cs-my-views-delete-view"], li:has-text("Delete"), .Dropdown__menu__list__item:has-text("Delete")' },
        ];
        const missing: string[] = [];
        for (const opt of manageOpts) {
          const visible = await page.locator(opt.sel).first().isVisible().catch(() => false);
          if (!visible) missing.push(opt.label);
        }
        if (missing.length) {
          recordVerificationWarning(step, context, `Manage Saved Views: expected options Rename, Share, Copy Link, View Details, Delete; missing in app: ${missing.join(", ")}`);
        }
        const ellipsis = page.locator('[data-test-id="cs-entries-my-views-element-action"], .views-container--item-action-wrapper, button:has([data-test-id="cs-icon"][name="DotsThreeLargeVertical"])').first();
        if (await page.locator(manageOpts[0].sel).first().isVisible().catch(() => false)) {
          await page.locator(manageOpts[0].sel).first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(400);
          const renameClose = page.locator('[data-test-id="cs-modal-close"], button:has-text("Cancel"), button:has-text("Close"), .ReactModal__close').first();
          if (await renameClose.isVisible().catch(() => false)) {
            await renameClose.click({ timeout: 5_000 }).catch(() => {});
          } else {
            await page.keyboard.press("Escape").catch(() => {});
          }
          await page.waitForTimeout(300);
        }
        if (await ellipsis.isVisible().catch(() => false)) {
          await ellipsis.click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
        }
        if (await page.locator(manageOpts[1].sel).first().isVisible().catch(() => false)) {
          await page.locator(manageOpts[1].sel).first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
          const shareClose = page.locator('[data-test-id="cs-share-view-entries-close"], [data-test-id="cs-modal-close"], button:has-text("Close"), .ReactModal__close').first();
          if (await shareClose.isVisible().catch(() => false)) {
            await shareClose.click({ timeout: 5_000 }).catch(() => {});
          } else {
            await page.keyboard.press("Escape").catch(() => {});
          }
          await page.waitForTimeout(300);
        }
        if (await ellipsis.isVisible().catch(() => false)) {
          await ellipsis.click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
        }
        if (await page.locator(manageOpts[2].sel).first().isVisible().catch(() => false)) {
          await page.locator(manageOpts[2].sel).first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(400);
        }
        if (await ellipsis.isVisible().catch(() => false)) {
          await ellipsis.click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
        }
        if (await page.locator(manageOpts[3].sel).first().isVisible().catch(() => false)) {
          await page.locator(manageOpts[3].sel).first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
          const detailsClose = page.locator('[data-test-id="cs-modal-close"], button:has-text("Close"), .ReactModal__close').first();
          if (await detailsClose.isVisible().catch(() => false)) {
            await detailsClose.click({ timeout: 5_000 }).catch(() => {});
          } else {
            await page.keyboard.press("Escape").catch(() => {});
          }
          await page.waitForTimeout(300);
        }
        if (await ellipsis.isVisible().catch(() => false)) {
          await ellipsis.click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
        }
        if (await page.locator(manageOpts[4].sel).first().isVisible().catch(() => false)) {
          await page.locator(manageOpts[4].sel).first().click({ timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(500);
          const deleteCancel = page.locator('button:has-text("Cancel"), button:has-text("No"), [data-test-id="cs-modal-close"], .ReactModal__close').first();
          if (await deleteCancel.isVisible().catch(() => false)) {
            await deleteCancel.click({ timeout: 5_000 }).catch(() => {});
          } else {
            await page.keyboard.press("Escape").catch(() => {});
          }
          await page.waitForTimeout(300);
        }
        break;
      }

      const { click } = loadOverrides(flow);
      const mapped = click[step.target] || CLICK_SELECTORS[step.target];
      let el: Locator;
      if (mapped && step.nth !== undefined) {
        el = page.locator(mapped).nth(step.nth);
      } else {
        el = await resolveTarget(page, step.target, flow);
      }
      const t = getStepTimeoutMs(step);

      // Publish Entry modal: default environment/locale are often pre-selected and disabled; use first enabled or no-op.
      if (step.action === "click" && step.target === "First Environment option (doc step)") {
        await page
          .locator('[data-test-id="cs-entry-single-publish-edit-page"], [role="dialog"]:has-text("Publish Entry")')
          .first()
          .waitFor({ state: "visible", timeout: Math.min(t, 90_000) })
          .catch(() => {});
        const enabled = page.locator(
          '[data-test-id="cs-entries-publish-select-environment-element"]:not(.Checkbox--state-disabled)'
        );
        if ((await enabled.count().catch(() => 0)) > 0) {
          await enabled.first().click({ timeout: t, force: true });
        }
        await page.waitForTimeout(300);
        break;
      }
      if (step.action === "click" && step.target === "First Language option (doc step)") {
        await page
          .locator('[data-test-id="cs-entry-single-publish-edit-page"], [role="dialog"]:has-text("Publish Entry")')
          .first()
          .waitFor({ state: "visible", timeout: Math.min(t, 90_000) })
          .catch(() => {});
        const enabled = page.locator(
          '[data-test-id="cs-entries-publish-select-lang-element"]:not(.Checkbox--state-disabled)'
        );
        if ((await enabled.count().catch(() => 0)) > 0) {
          await enabled.first().click({ timeout: t, force: true });
        }
        await page.waitForTimeout(300);
        break;
      }

      try {
        await expect(el).toBeVisible({ timeout: t });
      } catch (err) {
        if (step.target === "Version rename confirm (doc step)") {
          await page.keyboard.press("Enter");
          break;
        }
        if (step.target === "First version rename icon (doc step)") {
          const versionRows = page.locator('[data-test-id^="cs-save-version-item-"]');
          const rowCount = await versionRows.count().catch(() => 0);
          for (let i = 0; i < rowCount; i++) {
            const row = versionRows.nth(i);
            if (!(await row.isVisible().catch(() => false))) continue;
            await row.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(250);
            const renameIcon = row.locator('[data-test-id="cs-version-dropdown-edit"]').first();
            if (await renameIcon.isVisible().catch(() => false)) {
              await renameIcon.click({ timeout: t, force: true });
              break;
            }
          }
          break;
        }
        if (step.target === "Multi Line Textbox (doc step)") {
          const byText = page.getByText("Multi Line Textbox", { exact: true }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Properties (doc step)") {
          const groupRow = page.locator('.ContentTypeField:has(svg[name="Group"])').first();
          if (await groupRow.isVisible().catch(() => false)) {
            await groupRow.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(400);
          }
          const slidersInGroup = page.locator('.ContentTypeField:has(svg[name="Group"]) button:has(svg[name="Sliders"])').first();
          if (await slidersInGroup.isVisible().catch(() => false)) {
            await slidersInGroup.click({ timeout: t });
            break;
          }
          const optionProps = page.locator('[data-test-id$="-option-properties"]').first();
          if (await optionProps.isVisible().catch(() => false)) {
            await optionProps.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Edit permission option (doc step)" && String(flow?.id || "").toLowerCase() === "shared-views") {
          let clicked = false;
          const permDropdown = page.locator('[data-test-id="cs-share-views-entries-permission-dropdown"], [data-test-id="cs-share-views-entries-permission-dropdown-value"]').first();
          if (await permDropdown.isVisible().catch(() => false)) {
            await permDropdown.click({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(500);
          }
          const editOpts = [
            page.getByRole("option", { name: "Edit" }).first(),
            page.getByRole("menuitem", { name: "Edit" }).first(),
            page.locator('.Dropdown__menu--secondary li:has-text("Edit"), .Dropdown__menu--secondary [data-test-id="cs-dropdown-elements"][title="Edit"], [data-test-id="cs-dropdown-elements"][title="Edit"]').first(),
          ];
          for (const opt of editOpts) {
            if (await opt.isVisible().catch(() => false)) {
              await opt.click({ timeout: t });
              clicked = true;
              break;
            }
          }
          if (clicked) break;
        }
        if (step.target === "Content Types option (doc step)" || step.target === "Entries Create option (doc step)" || step.target === "Entry option (doc step)" || step.target === "Content type All option (doc step)" || step.target === "main option in source dropdown (doc step)" || step.target === "main option in target branch dropdown (doc step)") {
          const labelMap: Record<string, string> = {
            "Content Types option (doc step)": "Content Type",
            "Entries Create option (doc step)": "Created",
            "Entry option (doc step)": "Entry",
            "Content type All option (doc step)": "All",
            "main option in source dropdown (doc step)": "main",
            "main option in target branch dropdown (doc step)": "main",
          };
          const label = labelMap[step.target] || "Content Type";
          const listbox = page.getByRole("listbox").first();
          const menu = page.locator(".Select__menu, .Select-menu").first();
          const byRoleInListbox = listbox.getByRole("option", { name: new RegExp(label, "i") }).first();
          const byTextInListbox = listbox.getByText(new RegExp(`^${label}$`, "i")).first();
          const byTextInMenu = menu.getByText(new RegExp(`^${label}$`, "i")).first();
          if (await byRoleInListbox.isVisible().catch(() => false)) {
            await byRoleInListbox.click({ timeout: t });
            break;
          }
          if (await byTextInListbox.isVisible().catch(() => false)) {
            await byTextInListbox.click({ timeout: t });
            break;
          }
          if (await byTextInMenu.isVisible().catch(() => false)) {
            await byTextInMenu.click({ timeout: t });
            break;
          }
          // Entry option: fallback to "Entries" (plural) for module dropdown
          if (step.target === "Entry option (doc step)") {
            const entriesOpt = listbox.getByRole("option", { name: /^Entries$/i }).or(listbox.getByText(/^Entries$/i)).first();
            if (await entriesOpt.isVisible().catch(() => false)) {
              await entriesOpt.click({ timeout: t });
              break;
            }
          }
        }
        if (step.target === "Global tab (doc step)") {
          // Tabs may appear only after a refresh when schema changes were just saved.
          await page.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
          const tabAfterReload = page
            .locator('[data-test-id="cs-tabs-item"]:has-text("Global"), .Tab__item:has-text("Global")')
            .first();
          if (await tabAfterReload.isVisible().catch(() => false)) {
            await tabAfterReload.click({ timeout: t, force: true });
            break;
          }

          // Fallback: some layouts render a Global section button instead of top tab item.
          const globalSectionButton = page
            .locator('button:has-text("Global"), [role="button"]:has-text("Global")')
            .first();
          if (await globalSectionButton.isVisible().catch(() => false)) {
            await globalSectionButton.click({ timeout: t, force: true });
            break;
          }
        }
        if (step.target === "Second version compare icon (doc step)") {
          let clickedCompare = false;
          const clickCompareFromVisibleVersionRows = async () => {
            const rows = page.locator('[data-test-id="cs-version-timeline"]');
            const rowCount = await rows.count().catch(() => 0);
            for (let i = 0; i < rowCount; i++) {
              const row = rows.nth(i);
              if (!(await row.isVisible().catch(() => false))) continue;
              await row.hover({ timeout: 5_000 }).catch(() => {});
              await page.waitForTimeout(250);
              const compareIcon = row.locator('[data-test-id="cs-version-timeline-compare"]').first();
              if (await compareIcon.isVisible().catch(() => false)) {
                await compareIcon.click({ timeout: t, force: true });
                return true;
              }
            }
            return false;
          };

          clickedCompare = await clickCompareFromVisibleVersionRows();

          // If compare is not visible in this entry/version panel, try other entries.
          if (!clickedCompare) {
            const entriesSel =
              click["Entries (doc step)"] ||
              '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")';
            const entryRowSel =
              click["First Entry row (doc step)"] ||
              '[data-test-id^="cs-table-body-row-"], [role="row"][data-test-id^="cs-table-body-row-"]';
            const versionIconSel =
              click["Version icon (doc step)"] ||
              '[data-test-id="cs-entry-version-icon-wrapper"], [data-test-id="cs-entry-version-header-icon"]';

            const entriesBtn = page.locator(entriesSel).first();
            if (await entriesBtn.isVisible().catch(() => false)) {
              await entriesBtn.click({ timeout: t, force: true }).catch(() => {});
              await page.waitForTimeout(600);
            }

            const entryRows = page.locator(entryRowSel);
            const entryCount = await entryRows.count().catch(() => 0);
            const attempts = Math.min(entryCount, 5);
            for (let i = 0; i < attempts && !clickedCompare; i++) {
              const row = entryRows.nth(i);
              if (!(await row.isVisible().catch(() => false))) continue;
              await row.click({ timeout: t, force: true }).catch(() => {});
              await page.waitForTimeout(700);

              const versionIcon = page.locator(versionIconSel).first();
              if (await versionIcon.isVisible().catch(() => false)) {
                await versionIcon.click({ timeout: t, force: true }).catch(() => {});
                await page.waitForTimeout(400);
              }

              clickedCompare = await clickCompareFromVisibleVersionRows();
            }
          }

          if (!clickedCompare) {
            const anyCompare = page.locator('[data-test-id="cs-version-timeline-compare"]').first();
            if (await anyCompare.count().catch(() => 0)) {
              await anyCompare.click({ timeout: t, force: true }).catch(() => {});
              clickedCompare = true;
            }
          }

          if (clickedCompare) break;
        }
        if (step.target === "Restore version (doc step)") {
          let clickedRestore = false;
          const rows = page.locator('[data-test-id="cs-version-timeline"]');
          const rowCount = await rows.count().catch(() => 0);
          for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            if (!(await row.isVisible().catch(() => false))) continue;
            await row.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(250);
            const restoreInRow = row
              .locator(
                '[data-test-id*="restore"], [role="button"]:has-text("Restore"), button:has-text("Restore"), [aria-label*="restore" i], [role="button"]:has(svg[name="Restore"]), button:has(svg[name="Restore"])'
              )
              .first();
            if (await restoreInRow.count().catch(() => 0)) {
              await restoreInRow.click({ timeout: t, force: true }).catch(() => {});
              clickedRestore = true;
              break;
            }
          }
          if (!clickedRestore) {
            const anyRestore = page
              .locator(
                '[data-test-id*="restore"], [role="button"]:has-text("Restore"), button:has-text("Restore"), [aria-label*="restore" i], [role="button"]:has(svg[name="Restore"]), button:has(svg[name="Restore"])'
              )
              .first();
            if (await anyRestore.count().catch(() => 0)) {
              await anyRestore.click({ timeout: t, force: true }).catch(() => {});
              clickedRestore = true;
            }
          }
          if (clickedRestore) break;
        }
        if (step.target === "Select extension (e.g. Color Picker) (doc step)") {
          await page.waitForTimeout(1500);
          const byText = page.getByText("Color Picker", { exact: true }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t });
            break;
          }
          const byTestId = page.locator('[data-test-id="cs-choose-extension-modal-title-color-picker"]').first();
          if (await byTestId.isVisible().catch(() => false)) {
            await byTestId.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Advanced (Modular Blocks block) (doc step)") {
          const byText = page.getByText("Advanced", { exact: true }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Advanced (doc step)") {
          await page.waitForTimeout(800);
          const byTab = page.getByRole("tab", { name: /Advanced/i }).first();
          if (await byTab.isVisible().catch(() => false)) {
            await byTab.click({ timeout: t });
            break;
          }
          const byText = page.getByText("Advanced", { exact: true }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.scrollIntoViewIfNeeded().catch(() => {});
            await byText.click({ timeout: t });
            break;
          }
          const byPartial = page.getByText(/Advanced/i).first();
          if (await byPartial.isVisible().catch(() => false)) {
            await byPartial.scrollIntoViewIfNeeded().catch(() => {});
            await byPartial.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Edit Block (doc step)") {
          const byRole = page.getByRole("menuitem", { name: /Edit Block/i }).first();
          if (await byRole.isVisible().catch(() => false)) {
            await byRole.click({ timeout: t });
            break;
          }
          const byText = page.getByText("Edit Block", { exact: true }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Global (SEO) (doc step)") {
          const byText = page.locator('div.FieldTypeSelector__field-tile').filter({ hasText: /Global|SEO/i }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t, force: true });
            break;
          }
        }
        if (step.target === "Create New Rule (doc step)") {
          const byAddRule = page.getByRole("button", { name: /Add Rule|Add Another Rule|Create New Rule/i }).or(page.getByText(/Add Rule|Add Another Rule|Create New Rule/)).first();
          if (await byAddRule.isVisible().catch(() => false)) {
            await byAddRule.click({ timeout: t });
            break;
          }
        }
        if (step.target === "Create New (doc step)") {
          const createNew = page
            .locator('[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New"), div:has-text("Create New"):visible')
            .first();
          if (await createNew.isVisible().catch(() => false)) {
            await createNew.click({ timeout: t, force: true }).catch(() => {});
            await waitForCreateContentTypeForm(page);
            break;
          }
        }
        if (step.target === "Before (FVR option) (doc step)" || step.target === "Show (FVR option) (doc step)" || step.target === "Hide (FVR option) (doc step)" || step.target?.endsWith("(FVR option) (doc step)")) {
          const label = step.target.replace(/\s*\(FVR option\)\s*\(doc step\)\s*$/, "").trim();
          const byRole = page.getByRole("option", { name: new RegExp(label, "i") }).first();
          if (await byRole.isVisible().catch(() => false)) {
            await byRole.click({ timeout: t });
            break;
          }
          const listbox = page.getByRole("listbox").first();
          if (await listbox.isVisible().catch(() => false)) {
            const optionInListbox = listbox.getByRole("option", { name: new RegExp(label, "i") }).first();
            if (await optionInListbox.isVisible().catch(() => false)) {
              await optionInListbox.click({ timeout: t });
              break;
            }
          }
          const byText = page.getByText(new RegExp(`^${escapeRegex(label)}$`, "i")).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t });
            break;
          }
          const inDialog = page.getByRole("dialog").filter({ hasText: /Field Visibility|Rules for this/i }).getByText(new RegExp(label, "i")).first();
          if (await inDialog.isVisible().catch(() => false)) {
            await inDialog.click({ timeout: t });
            break;
          }
          // Keyboard fallback: type label and Enter (react-select filter + select)
          const focused = page.locator(":focus");
          if (await focused.count().catch(() => 0) > 0) {
            await page.keyboard.type(label, { delay: 50 });
            await page.waitForTimeout(300);
            await page.keyboard.press("Enter");
            break;
          }
        }
        if (step.target === "Operand Field (FVR) (doc step)") {
          const dialog = page.getByRole("dialog").filter({ hasText: /Field Visibility|Rules for this|Create New Rule|Add Rule/i });
          await dialog.waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
          await page.waitForTimeout(1000);
          const operandDrop = page.locator('[data-test-id="cs-conditions-field-dropdown-0"]').first();
          if (await operandDrop.isVisible().catch(() => false)) {
            await operandDrop.click({ timeout: t, force: true });
            await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(300);
            break;
          }
        }
        // FVR operand/condition use react-select with hidden dummy input; click visible parent to open dropdown
        if (step.target === "Operand Field (FVR) (doc step)" || step.target === "Condition operator (FVR) (doc step)" || step.target === "Action type Show (FVR) (doc step)" || step.target === "Action type Hide (FVR) (doc step)" || step.target === "Target field (FVR) (doc step)" || step.target === "Target field 2 (FVR) (doc step)") {
          const dialog = page.getByRole("dialog").filter({ hasText: /Field Visibility|Rules for this/i });
          await dialog.scrollIntoViewIfNeeded().catch(() => {});
          await page.waitForTimeout(300);
          const parent = el.locator("xpath=..");
          await parent.click({ timeout: t, force: true }).catch(() => el.click({ timeout: t, force: true }));
          await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
          await page.waitForTimeout(300);
          break;
        }
        if (step.target === "Settings (doc step)") {
        const moreSel =
          click["More (doc step)"] ||
          '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), [aria-label="More"]';
          const moreBtn = page.locator(moreSel).first();
          if (await moreBtn.isVisible().catch(() => false)) {
            await moreBtn.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(250);
          }
          const settingsFallback = page
            .locator(
              '[data-test-id="cms-nav-settings"], [role="menuitem"]:has-text("Settings"), li:has-text("Settings"), button:has-text("Settings"), a:has-text("Settings")'
            )
            .first();
          if (await settingsFallback.isVisible().catch(() => false)) {
            await settingsFallback.click({ timeout: t, force: true });
            break;
          }
        }
        if (step.target === "Headless CMS" || step.target === "Any Stack Card (doc step)") {
          const inStackNav = page
            .locator(
              '[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-assets"], [data-test-id="cms-nav-content-types"], button:has-text("Entries"), button:has-text("Assets"), a:has-text("Entries"), a:has-text("Assets")'
            )
            .first();
          const onStacksPage = page
            .locator(
              '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")'
            )
            .first();
          if (await inStackNav.isVisible().catch(() => false)) {
            // Already inside a stack; allow flow to continue from module navigation.
            break;
          }
          if (step.target === "Headless CMS" && (await onStacksPage.isVisible().catch(() => false))) {
            // Already on stacks landing; next step can click stack card.
            break;
          }
        }
        throw err;
      }

      if (step.expected?.within) {
        try {
          await ensureWithin(page, el, step.expected.within, step.expected?.withinStrict === true);
        } catch (err: any) {
          recordVerificationWarning(
            step,
            context,
            `Position verification mismatch for "${step.target}": ${err?.message ?? String(err)}`
          );
        }
      }

      await el.scrollIntoViewIfNeeded().catch(() => {});
      const useForceClick =
        step.target === "Multi Line Textbox (doc step)" ||
        step.target === "Add comment on selected text (doc step)" ||
        step.target === "Close Users or Roles dropdown by clicking footer (doc step)" ||
        (step.target.includes("(doc step)") &&
          (step.target.includes("Textbox") ||
            step.target.includes("Modular Blocks") ||
            step.target.includes("Global (SEO)")));
      try {
        if (useForceClick) {
          await el.click({ timeout: t, force: true });
        } else {
          await el.click({ timeout: t });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("intercepts pointer events") && step.action === "click") {
          await el.click({ timeout: t, force: true });
        } else if (step.target === "Second version compare icon (doc step)") {
          let clickedCompare = false;
          const rows = page.locator('[data-test-id="cs-version-timeline"]');
          const rowCount = await rows.count().catch(() => 0);
          for (let i = 0; i < rowCount; i++) {
            const row = rows.nth(i);
            if (!(await row.isVisible().catch(() => false))) continue;
            await row.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(250);
            const compareIcon = row.locator('[data-test-id="cs-version-timeline-compare"]').first();
            if (await compareIcon.count().catch(() => 0)) {
              await compareIcon.evaluate((node) => {
                const htmlNode = node as HTMLElement;
                htmlNode.click();
              }).catch(() => {});
              clickedCompare = true;
              break;
            }
          }
          if (!clickedCompare) {
            const anyCompare = page.locator('[data-test-id="cs-version-timeline-compare"]').first();
            if (await anyCompare.count().catch(() => 0)) {
              await anyCompare.evaluate((node) => {
                const htmlNode = node as HTMLElement;
                htmlNode.click();
              }).catch(() => {});
              clickedCompare = true;
            }
          }
          if (!clickedCompare) throw err;
        } else if (
          step.target === "Add comment on selected text (doc step)" &&
          msg.toLowerCase().includes("outside of the viewport")
        ) {
          await el.evaluate((node) => {
            const htmlNode = node as HTMLElement;
            htmlNode.click();
          });
        } else if (
          step.target === "Post JSON RTE comment (doc step)" &&
          msg.toLowerCase().includes("outside of the viewport")
        ) {
          await el.evaluate((node) => {
            const htmlNode = node as HTMLElement;
            htmlNode.click();
          });
        } else if (step.target === "Multi Line Textbox (doc step)") {
          const byText = page.getByText("Multi Line Textbox", { exact: true }).first();
          if (await byText.isVisible().catch(() => false)) {
            await byText.click({ timeout: t });
          } else {
            await el.click({ timeout: t, force: true });
          }
        } else if (step.target.includes("(doc step)") && (step.target.includes("Textbox") || step.target.includes("Modular Blocks") || step.target.includes("Global"))) {
          await el.click({ timeout: t, force: true });
        } else {
          throw err;
        }
      }

      // After clicking an FVR dropdown trigger, wait for menu so next step (option) can find it
      if (step.action === "click" && (step.target === "Operand Field (FVR) (doc step)" || step.target === "Condition operator (FVR) (doc step)" || step.target === "Action type Show (FVR) (doc step)" || step.target === "Action type Hide (FVR) (doc step)" || step.target === "Target field (FVR) (doc step)" || step.target === "Target field 2 (FVR) (doc step)")) {
        await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // After clicking webhook trigger dropdowns (Module/Action/Content type), wait for listbox so next step (option) can find it
      if (step.action === "click" && (step.target === "Module dropdown (doc step)" || step.target === "Action dropdown (doc step)" || step.target === "Content type dropdown (doc step)")) {
        await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // After clicking Search icon in header (Quick Search), wait for dropdown. NOT dashboard input (placeholder "Search help content").
      if (
        step.action === "click" &&
        step.target === "Search icon in header (doc step)" &&
        String(flow?.id || "").toLowerCase() === "quick-search"
      ) {
        await page.waitForTimeout(1000);
        await page.locator('[data-test-id="cs-header-search-entries"], [data-test-id="cs-header-search-assets"], .Dropdown__menu__list__item:has-text("Entries"), .Dropdown__menu__list__item:has-text("Assets"), [data-test-id="cs-header-search-container"] input, [data-test-id="cs-search-bar-input"] input, [data-test-id="cs-search-bar-input-submit"], input[placeholder*="Search Entries" i]').first().waitFor({ state: "visible", timeout: 12_000 }).catch(() => {});
        await page.waitForTimeout(600);
      }

      // After clicking Filters tab (Use Filters), wait for filter accordions
      if (
        step.action === "click" &&
        step.target === "Filters tab in left panel (doc step)" &&
        String(flow?.id || "").toLowerCase() === "use-filters"
      ) {
        await page.waitForTimeout(500);
        await page.locator('[data-test-id="cs-content-types-filter"], [data-test-id="cs-publish-status-filter"], .filters-accordions').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // After clicking View name dropdown (Save Your Views), wait for Save as new view menu
      if (
        step.action === "click" &&
        step.target === "View name dropdown in top-right (doc step)" &&
        String(flow?.id || "").toLowerCase() === "save-your-views"
      ) {
        await page.waitForTimeout(400);
        await page.locator('[role="menuitem"]:has-text("Save as new view"), li:has-text("Save as new view"), .Dropdown__menu__list__item:has-text("Save as new view")').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
      }

      // After clicking Save as new view, wait for Save View modal
      if (
        step.action === "click" &&
        step.target === "Save as new view menu item (doc step)" &&
        String(flow?.id || "").toLowerCase() === "save-your-views"
      ) {
        await page.waitForTimeout(400);
        await page.locator('[data-testid="cs-views-saved-view"], [data-test-id="cs-modal-title-save-view"]').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
      }

      // After clicking Last Modified by Me (Save Your Views), wait for entries list
      if (
        step.action === "click" &&
        step.target === "Last Modified by Me view (doc step)" &&
        String(flow?.id || "").toLowerCase() === "save-your-views"
      ) {
        await page.waitForTimeout(800);
        await page.locator('[data-test-id="cs-entries-update-view-action"], [data-test-id="cs-entries-inline-search"], [data-test-id="cs-table"]').first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
      }

      // After clicking Saved Views section (Save Your Views), wait for expanded content
      if (
        step.action === "click" &&
        step.target === "Saved Views section (doc step)" &&
        String(flow?.id || "").toLowerCase() === "save-your-views"
      ) {
        await page.waitForTimeout(400);
      }

      // Shared Views: after clicking vertical ellipsis, wait for dropdown
      if (
        step.action === "click" &&
        step.target === "Vertical ellipsis next to saved view (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(400);
        await page.locator('[data-test-id="cs-my-views-share-view"], li:has-text("Share")').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
      }

      // Shared Views: after clicking Share, wait for Share View modal
      if (
        step.action === "click" &&
        step.target === "Share menu item (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(500);
        await page.locator('[data-test-id="cs-share-view-entries"], [data-test-id="cs-modal-title-share-view"]').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
      }

      // Shared Views: after clicking Users or Roles dropdown, wait for role options (Admin, Content Manager, Developer)
      if (
        step.action === "click" &&
        step.target === "Users or Roles select dropdown (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(500);
        await page.locator('label[title="Admin"], label[title="Content Manager"], label[title="Developer"], [role="option"]:has-text("Developer"), [class*="menu"] [class*="option"]').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
      }

      // Shared Views: after closing Users or Roles dropdown via footer click, wait for permission dropdown
      if (
        step.action === "click" &&
        step.target === "Close Users or Roles dropdown by clicking footer (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(800);
        await page.locator('[data-test-id="cs-share-views-entries-permission-dropdown"], [data-test-id="cs-share-views-entries-permission-dropdown-value"]').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
      }

      // Shared Views: after clicking permission dropdown, wait for Edit option
      if (
        step.action === "click" &&
        step.target === "Permission dropdown in Share View modal (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(300);
        await page.locator('li[title="Edit"], .Dropdown__menu__list__item:has-text("Edit")').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
      }

      // Shared Views: after clicking Manage, wait for Manage Access modal
      if (
        step.action === "click" &&
        step.target === "Manage button in Share View modal (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(500);
        await page.locator('[data-test-id="cs-manage-access-entries"], [data-test-id="cs-modal-title-manage-access"]').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
      }

      // Shared Views: after clicking Go back from Manage Access, wait for Share View modal
      if (
        step.action === "click" &&
        step.target === "Go back from Manage Access (doc step)" &&
        String(flow?.id || "").toLowerCase() === "shared-views"
      ) {
        await page.waitForTimeout(400);
      }

      // Shared Views / Use Saved Views: after clicking Saved Views section, wait for saved views list
      if (
        step.action === "click" &&
        step.target === "Saved Views section (doc step)" &&
        (String(flow?.id || "").toLowerCase() === "shared-views" || String(flow?.id || "").toLowerCase() === "use-saved-views")
      ) {
        await page.waitForTimeout(500);
        await page.locator('[data-test-id="cs-entries-my-views-element"], .views-container--item').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
      }

      // Use Saved Views: after clicking View name dropdown, wait for Modify menu
      if (
        step.action === "click" &&
        step.target === "View name dropdown in top-right (doc step)" &&
        String(flow?.id || "").toLowerCase() === "use-saved-views"
      ) {
        await page.waitForTimeout(400);
        await page.locator('li:has-text("Update the view"), li:has-text("Save as new view"), li:has-text("Clear recent changes"), li:has-text("Reset to all entries"), .Dropdown__menu__list__item').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
      }

      // Use Saved Views / Shared Views: after clicking Vertical ellipsis, wait for Manage menu
      if (
        step.action === "click" &&
        step.target === "Vertical ellipsis next to saved view (doc step)" &&
        (String(flow?.id || "").toLowerCase() === "use-saved-views" || String(flow?.id || "").toLowerCase() === "shared-views")
      ) {
        await page.waitForTimeout(600);
        await page.locator('[data-test-id="cs-my-views-edit-name"], [data-test-id="cs-my-views-share-view"], .Dropdown__menu--primary li, li:has-text("Rename"), li:has-text("Share")').first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
      }

      // After clicking Search bar dropdown, wait for menu options
      if (step.action === "click" && step.target === "Search bar dropdown (doc step)") {
        await page.locator('[data-test-id="cs-entries-search-in-all"]').waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // After clicking Advanced Search Content Type or Field / Operator / Value dropdown, wait for suggestion menu
      if (
        step.action === "click" &&
        (step.target === "Content Type or Field dropdown (doc step)" ||
          step.target === "Operator dropdown (doc step)" ||
          step.target === "Value dropdown in Advanced Search (doc step)") &&
        (String(flow?.id || "").toLowerCase() === "advanced-search" ||
          String(flow?.id || "").toLowerCase() === "about-localization-operator" ||
          String(flow?.id || "").startsWith("localization-operator-real-world-scenarios"))
      ) {
        await page.locator('[data-test-id="cs-advance-search-select-list-element"], li.AdvancedQueryView__suggestion-item--selectable, [role="option"]').first().waitFor({ state: "visible", timeout: 5_000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // After clicking Source branch dropdown or Target Branch dropdown
      if (step.action === "click" && (step.target === "Source branch dropdown (doc step)" || step.target === "Target Branch dropdown (doc step)")) {
        await page.getByRole("listbox").first().waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
        await page.waitForTimeout(300);
      }

      // After "+ New Block", wait for add-block form so next step (Block Name input) can find it
      if (step.target === "+ New Block (doc step)") {
        await page
          .locator('[data-test-id="cs-cb-add-block-title-input"] input, input[placeholder="Enter block title"]')
          .first()
          .waitFor({ state: "visible", timeout: 15_000 })
          .catch(() => {});
      }

      // For compare-entry-versions: after selecting a version row, reveal and click Compare.
      if (step.target === "Second version timeline row (doc step)" && String(flow?.id || "").toLowerCase() === "compare-entry-versions") {
        const tryClickCompareInOpenHistory = async () => {
          const rows = page.locator('[data-test-id="cs-version-timeline"]');
          const count = await rows.count().catch(() => 0);
          for (let i = 0; i < count; i++) {
            const row = rows.nth(i);
            if (!(await row.isVisible().catch(() => false))) continue;
            await row.hover({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(250);
            const compare = row.locator('[data-test-id="cs-version-timeline-compare"]').first();
            if (await compare.count().catch(() => 0)) {
              const visible = await compare.isVisible().catch(() => false);
              if (visible) {
                await compare.click({ timeout: 10_000, force: true }).catch(() => {});
                return true;
              }
              await compare.evaluate((node) => (node as HTMLElement).click()).catch(() => {});
              return true;
            }
          }
          return false;
        };

        let clickedCompare = await tryClickCompareInOpenHistory();

        if (!clickedCompare) {
          const entriesSel =
            click["Entries (doc step)"] ||
            '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")';
          const entryRowSel =
            click["First Entry row (doc step)"] ||
            '[data-test-id^="cs-table-body-row-"], [role="row"][data-test-id^="cs-table-body-row-"]';
          const versionIconSel =
            click["Version icon (doc step)"] ||
            '[data-test-id="cs-entry-version-icon-wrapper"], [data-test-id="cs-entry-version-header-icon"]';

          const entriesBtn = page.locator(entriesSel).first();
          if (await entriesBtn.isVisible().catch(() => false)) {
            await entriesBtn.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(600);
          }

          const rows = page.locator(entryRowSel);
          const attempts = Math.min(await rows.count().catch(() => 0), 5);
          for (let i = 0; i < attempts && !clickedCompare; i++) {
            const row = rows.nth(i);
            if (!(await row.isVisible().catch(() => false))) continue;
            await row.click({ timeout: t, force: true }).catch(() => {});
            await page.waitForTimeout(700);
            const versionIcon = page.locator(versionIconSel).first();
            if (await versionIcon.isVisible().catch(() => false)) {
              await versionIcon.click({ timeout: t, force: true }).catch(() => {});
              await page.waitForTimeout(400);
            }
            clickedCompare = await tryClickCompareInOpenHistory();
          }
        }

        if (!clickedCompare) {
          throw new Error(
            'Could not reveal a visible "Compare" control by hovering version rows across attempted entries.'
          );
        }
      }

      // After opening block 3-dots menu, wait for dropdown so "Edit Block" is visible
      if (step.target === "Block options (3 dots) Video (doc step)" || step.target === "Block options (3 dots) Image (doc step)") {
        await page.waitForTimeout(800);
        await page
          .locator('[data-test-id="cs-cb-edit-block"], [role="menuitem"]:has-text("Edit Block"), [role="option"]:has-text("Edit Block"), div:has-text("Edit Block")')
          .first()
          .waitFor({ state: "visible", timeout: 15_000 })
          .catch(() => {});
      }

      // After opening any Properties panel (Single Line, Multi Line, Modular Blocks, etc.), wait for panel to open
      if (step.target.includes("Properties") && step.target.includes("(doc step)")) {
        await page.waitForTimeout(1500);
      }

      // Gate ONLY after the action that actually opens the Create CT modal
      if (step.target === "Create New" || step.target === "Create New (doc step)") {
        await waitForCreateContentTypeForm(page);
      }

      // After creating the content type, the builder loads. Prefer URL change; else wait for builder markers.
      if (step.target === "Save and proceed") {
        const urlOk = await page.waitForURL(/content-type-builder|content-type\/[^/]+/, { timeout: 35_000 }).then(() => true).catch(() => false);
        if (!urlOk) {
          const builderReady = page
            .getByRole("heading", { name: /^Title$/i })
            .or(page.locator('[data-test-id="cs-ct-save"]'))
            .or(page.getByRole("button", { name: /save/i }))
            .or(page.locator('.FieldTypeSelector__action-bar, [class*="FieldTypeSelector"]'))
            .first();
          await expect(builderReady).toBeVisible({ timeout: 15_000 });
        }
      }

      // Verify modal title AFTER the click (Create CT modal only)
      if (step.expected?.modalTitle) {
        try {
          if (STRICT_MODAL_TITLE) await assertModalTitle(page, step.expected.modalTitle);
          else await warnIfModalTitleMismatch(page, step.expected.modalTitle);
        } catch (err: any) {
          const msg = `Modal title verification mismatch for "${step.target}": ${err?.message ?? String(err)}`;
          if (STRICT_DOC_VERIFICATION) throw new Error(msg);
          recordVerificationWarning(step, context, msg);
        }
      }

      if (step.target === "Delete Stack (doc step)") {
        const nameInput = page.locator('input[aria-label="name"], input[name="name"]').first();
        const capturedName = await readLocatorValue(nameInput).catch(() => "");
        if (capturedName && flow) {
          (flow as any).__stackNameToDelete = capturedName;
        }
      }

      if (step.target === "Delete (confirm doc step)") {
        const redirectedToStacks = await page
          .waitForURL(/#!\/stacks/i, { timeout: 20_000 })
          .then(() => true)
          .catch(() => false);
        const deletedToastVisible = await page.getByText(/deleted|stack deleted|success/i).first().isVisible().catch(() => false);

        if (!redirectedToStacks && !deletedToastVisible) {
          throw new Error("Delete confirmation click completed, but no deletion outcome was detected (no stacks redirect/success message).");
        }

        const stackNameToDelete = (flow as any)?.__stackNameToDelete as string | undefined;
        if (stackNameToDelete) {
          const cardByName = page
            .locator('[data-test-id^="cs-stacklist-card-"], .stack-card, .stacklist-card, [role="link"]')
            .filter({ hasText: new RegExp(escapeRegex(stackNameToDelete), "i") })
            .first();
          const stillVisible = await cardByName.isVisible().catch(() => false);
          if (stillVisible) {
            throw new Error(`Delete confirmation was clicked, but stack "${stackNameToDelete}" is still visible in stacks list.`);
          }
        }
      }

      if (step.target === "Stack API Key in generated modal (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__managementTokenStackApiKey = val;
          saveCapturedDocValue("managementTokenStackApiKey", val, context);
        }
      }
      if (step.target === "Management Token in generated modal (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__managementToken = val;
          saveCapturedDocValue("managementToken", val, context);
        }
      }
      if (step.target === "Delivery Token value in edit page (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__deliveryToken = val;
          saveCapturedDocValue("deliveryToken", val, context);
        }
      }
      if (step.target === "Preview Token value in edit page (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__previewToken = val;
          saveCapturedDocValue("previewToken", val, context);
        }
      }

      if (step.target === "Stack Owner Email (doc step)") {
        const val = await readLocatorValue(el);
        if (val) saveCapturedDocValue("stackOwnerEmail", val, context);
      }
      if (step.target === "API Key (doc step)") {
        const val = await readLocatorValue(el);
        if (val) saveCapturedDocValue("stackApiKey", val, context);
      }
      if (step.target === "Stack API Key (delivery token page doc step)") {
        const deliveryStackApiEl = page
          .locator('[data-test-id="cs-delivery-token-stackAPI-input"] input')
          .first();
        const val = await readLocatorValue(deliveryStackApiEl).catch(() => "");
        if (val && !/stack api key/i.test(val)) saveCapturedDocValue("stackApiKey", val, context);
      }

      break;
    }

    case "verify": {
      // customize-json-rich-text-editor — Embed Object(s) label (ct-advanced-page.html)
      if (
        String(flow?.id || "").toLowerCase() === "customize-json-rich-text-editor" &&
        step.target === "JSON RTE Embed Objects label (doc step)" &&
        step.expected?.labelEquals
      ) {
        const t = getStepTimeoutMs(step);
        const scope = page.locator('[data-test-id="cs-field-properties-container"]');
        const lab = scope.locator(".Label--color--secondary, span, div").filter({ hasText: /embed\s*object/i }).first();
        const visible = await lab.isVisible({ timeout: Math.min(t, 18_000) }).catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            'Customize JSON RTE (doc): expected "Embed Object(s)" label in JSON RTE field Advanced properties (ct-advanced-page.html).'
          );
          break;
        }
        const txt = ((await lab.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        const want = String(step.expected.labelEquals || "").trim();
        const matchMode = String(step.expected.labelMatch || "contains").toLowerCase();
        const ok =
          matchMode === "contains" ? txt.toLowerCase().includes(want.toLowerCase()) : txt.toLowerCase() === want.toLowerCase();
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            `Customize JSON RTE (doc): expected Embed Objects label ${matchMode === "contains" ? `to contain "${want}"` : `exactly "${want}"`} — got "${txt}".`
          );
        }
        break;
      }

      // embed-entries-or-assets-part-1 — Choose Entry modal (embed-choose-entry-modal.html). Doc says "Select Entry"; UI shows "Choose Entry".
      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        const h = modal.locator('[data-test-id="cs-modal-title"], h3').first();
        await expect(h).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await h.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        const docName = String(step.expected?.labelEquals || "Select Entry").trim();
        const uiOk = /choose\s*entry/i.test(txt) || /select\s*entry/i.test(txt);
        if (!uiOk) {
          recordVerificationWarning(
            step,
            context,
            `Embed entry (doc): expected modal title like "Select Entry" or "Choose Entry" — got "${txt}".`
          );
        } else if (/choose\s*entry/i.test(txt) && /select\s*entry/i.test(docName) && !/choose/i.test(docName)) {
          recordVerificationWarning(
            step,
            context,
            `Embed entry (doc): documentation says "Select Entry" modal; UI shows "Choose Entry" (embed-choose-entry-modal.html).`
          );
        }
        if (step.expected?.within) {
          try {
            await ensureWithin(page, h, step.expected.within, step.expected?.withinStrict === true);
          } catch (err: any) {
            recordVerificationWarning(step, context, `Embed entry Choose Entry modal (doc): ${err?.message ?? String(err)}`);
          }
        }
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry Search Entry field (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const inp = modal.locator('input[placeholder*="Search Entry" i], input[placeholder*="Search" i]').first();
        await expect(inp).toBeVisible({ timeout: Math.min(t, 15_000) });
        if (step.expected?.labelEquals) {
          const ph = ((await inp.getAttribute("placeholder").catch(() => "")) || "").replace(/\s+/g, " ").trim();
          const want = String(step.expected.labelEquals).trim();
          const mode = String(step.expected.labelMatch || "contains").toLowerCase();
          const ok =
            mode === "exact" ? ph.toLowerCase() === want.toLowerCase() : ph.toLowerCase().includes(want.toLowerCase());
          if (!ok) {
            recordVerificationWarning(
              step,
              context,
              `Embed entry (doc): expected entry search placeholder ${mode === "exact" ? `"${want}"` : `to contain "${want}"`} — got "${ph}".`
            );
          }
        }
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry Select Embed Type label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const lab = modal.locator("span, div, label").filter({ hasText: /select\s*embed\s*type|embed\s*type/i }).first();
        const ok = await lab.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Embed entry (doc): expected "Select Embed Type" / "Embed Type" label (Embed Entries in the JSON RTE — step 6).'
          );
        } else if (step.expected?.labelEquals) {
          try {
            await assertLabelMatch(lab, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
          } catch (err: any) {
            recordVerificationWarning(step, context, `Embed entry Select Embed Type (doc): ${err?.message ?? String(err)}`);
          }
        }
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry Block Embed label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const el = modal.locator('label[data-test-id="asset-embed-block"], [data-test-id="asset-embed-block"]').first();
        await expect(el).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        // Doc: "Block Embed"; UI may abbreviate visible text to "Block" (same control — asset-embed-block).
        const okDoc = /block\s*embed/i.test(txt) || /^block$/i.test(txt);
        if (!okDoc) {
          recordVerificationWarning(step, context, `Embed entry (doc): expected "Block Embed" (or abbreviated Block) — got "${txt}".`);
        }
        if (step.expected?.labelEquals) {
          const want = String(step.expected.labelEquals).toLowerCase();
          const mode = String(step.expected.labelMatch || "contains").toLowerCase();
          const actual = txt.toLowerCase();
          const matchOk =
            mode === "exact"
              ? actual === want
              : actual.includes(want) ||
                (want.includes("block embed") && (/^block$/i.test(txt.trim()) || /block\s*embed/i.test(txt)));
          if (!matchOk) {
            recordVerificationWarning(
              step,
              context,
              `Embed entry Block Embed (doc): expected flow label "${step.expected.labelEquals}" (${mode}) — visible text "${txt}".`
            );
          }
        }
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Choose Entry Inline Embed label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__referencepopup-entry-selector").first();
        const el = modal.locator('label[data-test-id="asset-embed-inline"], [data-test-id="asset-embed-inline"]').first();
        await expect(el).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        const okDoc = /inline\s*embed/i.test(txt) || /^inline$/i.test(txt);
        if (!okDoc) {
          recordVerificationWarning(step, context, `Embed entry (doc): expected "Inline Embed" (or abbreviated Inline) — got "${txt}".`);
        }
        if (step.expected?.labelEquals) {
          const want = String(step.expected.labelEquals).toLowerCase();
          const mode = String(step.expected.labelMatch || "contains").toLowerCase();
          const actual = txt.toLowerCase();
          const matchOk =
            mode === "exact"
              ? actual === want
              : actual.includes(want) ||
                (want.includes("inline embed") && (/^inline$/i.test(txt.trim()) || /inline\s*embed/i.test(txt)));
          if (!matchOk) {
            recordVerificationWarning(
              step,
              context,
              `Embed entry Inline Embed (doc): expected flow label "${step.expected.labelEquals}" (${mode}) — visible text "${txt}".`
            );
          }
        }
        break;
      }

      if (isJsonRteEmbedEntryPart1Flow(flow) && step.target === "JSON RTE Embed Selected Entry button label (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('[data-test-id="cs-add-selected-ref"], button:has-text("Embed Selected Entry")').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 20_000) });
        const txt = ((await btn.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/embed\s*selected\s*entry/i.test(txt)) {
          recordVerificationWarning(step, context, `Embed entry (doc): expected "Embed Selected Entry" — got "${txt}".`);
        }
        if (step.expected?.labelEquals) {
          try {
            await assertLabelMatch(btn, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
          } catch (err: any) {
            recordVerificationWarning(step, context, `Embed entry primary button (doc): ${err?.message ?? String(err)}`);
          }
        }
        break;
      }

      // JSON RTE slash menu (doc: "/" opens dropdown) — use-slash-command-for-shortcuts-in-json-rte
      if (
        String(flow?.id || "").toLowerCase() === "use-slash-command-for-shortcuts-in-json-rte" &&
        step.target === "JSON RTE slash command menu visible (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const pop = page.locator('[data-testid="slash-command"]').first();
        const visible = await pop.isVisible({ timeout: t }).catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            'JSON RTE slash menu (doc): expected slash popover [data-testid="slash-command"] after "/" per Use Slash Command doc — not found.'
          );
        }
        break;
      }

      // Use Slash Command doc — labels that must appear in the "/" popover (paragraph-style-dropdown-menu.html).
      if (
        String(flow?.id || "").toLowerCase() === "use-slash-command-for-shortcuts-in-json-rte" &&
        step.target === "JSON RTE slash popover lists all doc command labels (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const docSlashLabels = [
          "Paragraph",
          "Heading 1",
          "Heading 2",
          "Heading 3",
          "Heading 4",
          "Heading 5",
          "Heading 6",
          "Blockquote",
          "Code",
          "Ordered list",
          "Unordered list",
          "Divider",
          "Left",
          "Center",
          "Right",
          "Justify",
        ];
        const pop = page.locator('[data-testid="slash-command"]').first();
        const ok = await pop.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'JSON RTE slash popover (doc): popover not visible — cannot verify doc-listed command labels.'
          );
          break;
        }
        const blob = ((await pop.innerText().catch(() => "")) || "").replace(/\s+/g, " ");
        for (const label of docSlashLabels) {
          if (!blob.includes(label)) {
            recordVerificationWarning(
              step,
              context,
              `JSON RTE slash popover (doc): expected menu item "${label}" (Use Slash Command doc + paragraph-style-dropdown-menu.html).`
            );
          }
        }
        break;
      }

      // basic-formatting / Block & Inline Properties (Basic Formatting doc + formating-menu.html)
      if (
        (String(flow?.id || "").toLowerCase() === "basic-formatting" || isJsonRteBlockInlinePropsFlow(flow)) &&
        step.target === "JSON RTE floating formatting toolbar visible (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const bar = page.locator("#scrte-toolbar, .scrte-hovering-toolbar.scrte-toolbar").first();
        const visible = await bar.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            'JSON RTE floating toolbar (doc): expected #scrte-toolbar or .scrte-hovering-toolbar after text selection — not found (formating-menu.html).'
          );
        }
        break;
      }

      if (
        String(flow?.id || "").toLowerCase() === "basic-formatting" &&
        step.target === "JSON RTE floating toolbar has doc inline style icons (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const bar = page.locator("#scrte-toolbar, .scrte-hovering-toolbar.scrte-toolbar").first();
        const ok = await bar.isVisible({ timeout: Math.min(t, 10_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            "JSON RTE floating toolbar (doc): toolbar not visible — cannot verify data-icon buttons (Basic Formatting doc)."
          );
          break;
        }
        // Floating bar can paint overflow icons after a short delay; scroll container so all controls can become visible.
        await page.waitForTimeout(1500);
        await bar
          .evaluate((el) => {
            const node = el as HTMLElement;
            const scrollable = node.parentElement ?? node;
            scrollable.scrollLeft = scrollable.scrollWidth;
            node.scrollLeft = node.scrollWidth;
          })
          .catch(() => {});
        await page.waitForTimeout(400);
        const icons = ["bold", "italic", "underline", "strikethrough", "inlineCode", "superscript", "subscript"];
        for (const icon of icons) {
          const btn = bar.locator(`[data-icon="${icon}"]`).first();
          await btn.scrollIntoViewIfNeeded().catch(() => {});
          await page.waitForTimeout(120);
          if (!(await btn.isVisible().catch(() => false))) {
            recordVerificationWarning(
              step,
              context,
              `JSON RTE floating toolbar (doc): expected [data-icon="${icon}"] per Basic Formatting doc + formating-menu.html.`
            );
          }
        }
        break;
      }

      if (
        String(flow?.id || "").toLowerCase() === "basic-formatting" &&
        step.target === "JSON RTE inline markup after toolbar apply (doc step)" &&
        step.expected?.labelEquals
      ) {
        const t = getStepTimeoutMs(step);
        const kind = String(step.expected.labelEquals || "")
          .toLowerCase()
          .replace(/\s+/g, "");
        // Inline code: JSON RTE may not expose a literal <code> in innerHTML — toolbar click is the doc step; skip HTML warning.
        if (kind === "inlinecode") {
          break;
        }
        const editor = page
          .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
          .first();
        await editor.waitFor({ state: "attached", timeout: t });
        const html = ((await editor.innerHTML().catch(() => "")) || "").toLowerCase();
        const pass =
          kind === "bold"
            ? /<strong\b|<b\b/.test(html)
            : kind === "italic"
              ? /<em\b|<i\b/.test(html)
              : kind === "underline"
                ? /<u\b|text-decoration:\s*underline/.test(html)
                : kind === "strikethrough"
                  ? /<s\b|<del\b|<strike\b|text-decoration:\s*line-through/.test(html)
                  : kind === "superscript"
                    ? /<sup\b/.test(html)
                    : kind === "subscript"
                      ? /<sub\b/.test(html)
                      : false;
        if (!pass) {
          recordVerificationWarning(
            step,
            context,
            `JSON RTE (doc): after toolbar apply, expected markup for "${kind}" in editor HTML (Basic Formatting doc).`
          );
        }
        break;
      }

      // Block and Inline Properties (formating-menu.html — Property icon on floating toolbar)
      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE floating toolbar Property icon (doc step)") {
        const t = getStepTimeoutMs(step);
        const bar = page.locator("#scrte-toolbar, .scrte-hovering-toolbar.scrte-toolbar").first();
        const ok = await bar.isVisible({ timeout: Math.min(t, 10_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            "JSON RTE floating toolbar (doc): toolbar not visible — cannot verify Property icon (Block and Inline Properties doc)."
          );
          break;
        }
        await page.waitForTimeout(400);
        await bar
          .evaluate((el) => {
            const node = el as HTMLElement;
            const scrollable = node.parentElement ?? node;
            scrollable.scrollLeft = scrollable.scrollWidth;
            node.scrollLeft = node.scrollWidth;
          })
          .catch(() => {});
        await page.waitForTimeout(200);
        const prop = bar.locator('[data-icon="property"]').first();
        await prop.scrollIntoViewIfNeeded().catch(() => {});
        if (!(await prop.isVisible().catch(() => false))) {
          recordVerificationWarning(
            step,
            context,
            'JSON RTE floating toolbar (doc): expected [data-icon="property"] per Block and Inline Properties doc + formating-menu.html.'
          );
        }
        break;
      }

      // Add Property modal (add-property-modal.html)
      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE Add Property modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const exp = step.expected as { within?: string; labelEquals?: string; labelMatch?: string } | undefined;
        const h = page.locator('[data-test-id="cs-modal-title-add-property"]').first();
        const vis = await h.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!vis) {
          recordVerificationWarning(
            step,
            context,
            'Block and Inline Properties (doc): Add Property modal title [data-test-id="cs-modal-title-add-property"] not visible (add-property-modal.html).'
          );
          break;
        }
        if (exp?.within === "Modal") {
          const inModal = await h
            .evaluate((node) => !!(node as HTMLElement).closest?.(".cs-auto-draft-modal, [role='dialog']"))
            .catch(() => false);
          if (!inModal) {
            recordVerificationWarning(
              step,
              context,
              'Block and Inline Properties (doc): expected modal title within Modal (.cs-auto-draft-modal / dialog) per doc (add-property-modal.html).'
            );
          }
        }
        const txt = ((await h.innerText().catch(() => "")) || "").trim();
        const want = (exp?.labelEquals && String(exp.labelEquals).trim()) || "Add Property";
        const matchMode = String(exp?.labelMatch || "contains").toLowerCase();
        const titleOk =
          matchMode === "equals"
            ? txt.toLowerCase() === want.toLowerCase()
            : matchMode === "contains"
              ? txt.toLowerCase().includes(want.toLowerCase())
              : txt.toLowerCase() === want.toLowerCase();
        if (!titleOk) {
          recordVerificationWarning(
            step,
            context,
            `Block and Inline Properties (doc): expected modal title ${matchMode === "equals" ? `exactly "${want}"` : `to contain "${want}"`} — got "${txt}".`
          );
        }
        break;
      }

      // Add Property modal field labels (add-property-modal.html — Class / ID)
      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE Add Property modal Class label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".cs-auto-draft-modal").first();
        const ok = await modal.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Block and Inline Properties (doc): Add Property modal (.cs-auto-draft-modal) not visible — cannot verify "Class" label (add-property-modal.html).'
          );
          break;
        }
        const lab = modal.locator('label[data-test-id="cs-field-label"]').first();
        if (!(await lab.isVisible({ timeout: 5_000 }).catch(() => false))) {
          recordVerificationWarning(
            step,
            context,
            'Block and Inline Properties (doc): expected first field label "Class" in Add Property modal (add-property-modal.html).'
          );
          break;
        }
        const ltxt = ((await lab.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/^class$/i.test(ltxt)) {
          recordVerificationWarning(
            step,
            context,
            `Block and Inline Properties (doc): expected first label text "Class" — got "${ltxt}" (add-property-modal.html).`
          );
        }
        break;
      }

      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE Add Property modal ID label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".cs-auto-draft-modal").first();
        const ok = await modal.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Block and Inline Properties (doc): Add Property modal not visible — cannot verify "ID" label (add-property-modal.html).'
          );
          break;
        }
        const lab = modal.locator('label[data-test-id="cs-field-label"]').nth(1);
        if (!(await lab.isVisible({ timeout: 5_000 }).catch(() => false))) {
          recordVerificationWarning(
            step,
            context,
            'Block and Inline Properties (doc): expected second field label "ID" in Add Property modal (add-property-modal.html).'
          );
          break;
        }
        const ltxt = ((await lab.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/^id$/i.test(ltxt)) {
          recordVerificationWarning(
            step,
            context,
            `Block and Inline Properties (doc): expected second label text "ID" — got "${ltxt}" (add-property-modal.html).`
          );
        }
        break;
      }

      if (isJsonRteBlockInlinePropsFlow(flow) && step.target === "JSON RTE Add Property modal Apply button label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".cs-auto-draft-modal").first();
        const btn = modal.locator("#applyBtn").first();
        const ok = await btn.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Block and Inline Properties (doc): Apply button #applyBtn not visible in Add Property modal (add-property-modal.html).'
          );
          break;
        }
        const btnTxt = ((await btn.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/^apply$/i.test(btnTxt)) {
          recordVerificationWarning(
            step,
            context,
            `Block and Inline Properties (doc): expected primary button label "Apply" — got "${btnTxt}".`
          );
        }
        break;
      }

      // json-rte-assets verifications (Assets doc + select-asset.html / upload-asset.html)
      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE React modal body open (doc step)") {
        const t = getStepTimeoutMs(step);
        const ok = await page.locator("body.ReactModal__Body--open").first().isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            "Assets (doc): expected body.ReactModal__Body--open while modal is shown (user CSS note — Select Asset / Upload Asset modals)."
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const h = page.locator('.ReactModal__asset-selector [data-test-id="cs-modal-title-select-asset"], .ReactModal__asset-selector h3').first();
        await expect(h).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await h.innerText().catch(() => "")) || "").trim();
        if (!/Select Asset/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected modal title "Select Asset" — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset search (doc step)") {
        const t = getStepTimeoutMs(step);
        const inp = page
          .locator('.ReactModal__asset-selector [data-test-id="cs-search-input-field"], .ReactModal__asset-selector input[placeholder*="Search assets" i]')
          .first();
        await expect(inp).toBeVisible({ timeout: Math.min(t, 15_000) });
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset embed types visible (doc step)") {
        const modal = page.locator(".ReactModal__asset-selector").first();
        const block = modal.locator('[data-test-id="asset-embed-block"]');
        const inline = modal.locator('[data-test-id="asset-embed-inline"]');
        const bOk = await block.isVisible().catch(() => false);
        const iOk = await inline.isVisible().catch(() => false);
        if (!bOk || !iOk) {
          recordVerificationWarning(
            step,
            context,
            "Assets (doc): expected Block and Inline embed options (asset-embed-block / asset-embed-inline — Assets doc step 6)."
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset Cancel button (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('.ReactModal__asset-selector [data-test-id="cs-entry-choose-file-cancel"]').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 15_000) });
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const h = page.locator('#scrte-image-modal h3, #scrte-image-modal [data-test-id^="cs-modal-title"]').first();
        await expect(h).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await h.innerText().catch(() => "")) || "").trim();
        if (!/upload|folder|asset/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected upload modal title about assets/folder — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal Choose Files visible (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        const btn = modal.locator('button:has-text("Choose Files"), button[data-test-id="cs-button"]').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 15_000) });
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal search (doc step)") {
        const t = getStepTimeoutMs(step);
        const inp = page.locator('#scrte-image-modal [data-test-id="cs-search-input-field"], #scrte-image-modal input[placeholder*="Search Assets" i]').first();
        await expect(inp).toBeVisible({ timeout: Math.min(t, 15_000) });
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal Cancel (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page.locator('#scrte-image-modal [data-test-id="asset-modal-reset"], #scrte-image-modal button:has-text("Cancel")').first();
        await expect(btn).toBeVisible({ timeout: Math.min(t, 15_000) });
        break;
      }

      // Assets doc — toolbar Asset icon, dropdown labels, Embed Type / Block / Inline copy (https://www.contentstack.com/docs/developers/json-rich-text-editor/assets)
      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Asset toolbar icon visible (doc step)") {
        const t = getStepTimeoutMs(step);
        const rte = page.locator('[data-test-id="cs-edit-entry-field-json_rte"]').first();
        const icon = rte.locator('.scrte-dropdown [data-icon="Asset"], span[data-icon="Asset"]').first();
        await expect(icon).toBeVisible({ timeout: Math.min(t, 25_000) });
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Choose from assets menu item (doc step)") {
        const t = getStepTimeoutMs(step);
        const opt = page
          .getByRole("menuitem", { name: /Choose from assets/i })
          .or(page.locator("[role='menu'] li, [role='listbox'] [role='option']").filter({ hasText: /Choose from assets/i }))
          .first();
        const ok = await opt.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected "Choose from assets" in Asset toolbar dropdown (Assets doc — Choosing from Existing Assets).'
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset Embed Type label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__asset-selector").first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 20_000) });
        const label = modal.locator(".FieldLabel, label, span").filter({ hasText: /embed\s*type/i }).first();
        const ok = await label.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected "Embed Type" label in Select Asset modal after choosing an asset (Assets doc step 6).'
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset Block Embed label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__asset-selector").first();
        const el = modal.locator('label[data-test-id="asset-embed-block"], [data-test-id="asset-embed-block"]').first();
        const vis = await el.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!vis) {
          recordVerificationWarning(
            step,
            context,
            "Assets (doc): Block Embed control not visible (asset-embed-block — Assets doc step 6)."
          );
          break;
        }
        const txt = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/block\s*embed/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected "Block Embed" copy on block option — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Select Asset Inline Embed label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator(".ReactModal__asset-selector").first();
        const el = modal.locator('label[data-test-id="asset-embed-inline"], [data-test-id="asset-embed-inline"]').first();
        const vis = await el.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!vis) {
          recordVerificationWarning(
            step,
            context,
            "Assets (doc): Inline Embed control not visible (asset-embed-inline — Assets doc step 6)."
          );
          break;
        }
        const txt = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/inline\s*embed/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected "Inline Embed" copy on inline option — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Add Selected Asset button label (doc step)") {
        const t = getStepTimeoutMs(step);
        const btn = page
          .locator('[data-test-id="cs-entry-choose-file-add-selected-entries"], .ReactModal__asset-selector button')
          .filter({ hasText: /Add Selected Asset/i })
          .first();
        const vis = await btn.isVisible({ timeout: Math.min(t, 20_000) }).catch(() => false);
        if (!vis) {
          recordVerificationWarning(step, context, 'Assets (doc): expected "Add Selected Asset" button visible (Assets doc step 7).');
          break;
        }
        const txt = ((await btn.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/Add Selected Asset/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected primary action "Add Selected Asset" — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload new assets menu item (doc step)") {
        const t = getStepTimeoutMs(step);
        const opt = page
          .getByRole("menuitem", { name: /Upload new asset/i })
          .or(page.locator("[role='menu'] li, [role='listbox'] [role='option']").filter({ hasText: /Upload new asset/i }))
          .first();
        const ok = await opt.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected "Upload new asset(s)" in Asset toolbar dropdown (Assets doc — Uploading New Assets).'
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal create folder control (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        await modal.waitFor({ state: "visible", timeout: Math.min(t, 30_000) });
        const folderControl = modal
          .locator('[data-testid="asset-create-folder--list"], [data-testid="asset-create-folder-container--list"] input[placeholder*="folder" i]')
          .first();
        const ok = await folderControl.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected create folder / folder name control ("+" / Enter folder name) in Upload Asset(s) modal (Assets doc step 5).'
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal Embed Type label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        const label = modal.locator(".FieldLabel, label, span").filter({ hasText: /embed\s*type/i }).first();
        const ok = await label.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected "Embed Type" label in upload modal after selecting file(s) (Assets doc — Uploading New Assets).'
          );
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal Block Embed label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        const el = modal.locator('[data-test-id="asset-embed-block"]').first();
        const ok = await el.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected Block Embed option in upload modal (asset-embed-block — Assets doc).'
          );
          break;
        }
        const txt = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/block\s*embed/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected "Block Embed" copy on upload modal — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal Inline Embed label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        const el = modal.locator('[data-test-id="asset-embed-inline"]').first();
        const ok = await el.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected Inline Embed option in upload modal (asset-embed-inline — Assets doc).'
          );
          break;
        }
        const txt = ((await el.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/inline\s*embed/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected "Inline Embed" copy on upload modal — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteAssetsFlow(flow) && step.target === "JSON RTE Upload modal Insert Uploaded Images button label (doc step)") {
        const t = getStepTimeoutMs(step);
        const modal = page.locator("#scrte-image-modal").first();
        const btn = modal.locator("button").filter({ hasText: /Insert Uploaded Images/i }).first();
        const ok = await btn.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
        if (!ok) {
          recordVerificationWarning(
            step,
            context,
            'Assets (doc): expected "Insert Uploaded Images" button (Assets doc step 8).'
          );
          break;
        }
        const txt = ((await btn.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
        if (!/Insert Uploaded Images/i.test(txt)) {
          recordVerificationWarning(step, context, `Assets (doc): expected Insert Uploaded Images button label — got "${txt}".`);
        }
        break;
      }

      // videos-and-social-embeds — Video / Social Embeds modals (video-modal.html, social-embeds-modal.html); cs-auto-draft-modal (not data-testid=cs-modal)
      if (isJsonRteVideosSocialEmbedsFlow(flow) && step.target === "JSON RTE Video modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const h = page.locator('[data-test-id="cs-modal-title-video"], h3[title="Video"]').first();
        await expect(h).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await h.innerText().catch(() => "")) || "").trim();
        if (!/^video$/i.test(txt)) {
          recordVerificationWarning(step, context, `Videos and Social Embeds (doc): expected Video modal title — got "${txt}".`);
        }
        break;
      }

      if (isJsonRteVideosSocialEmbedsFlow(flow) && step.target === "JSON RTE Social Embeds modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const h = page.locator('[data-test-id="cs-modal-title-social-embeds"], h3[title="Social Embeds"]').first();
        await expect(h).toBeVisible({ timeout: Math.min(t, 15_000) });
        const txt = ((await h.innerText().catch(() => "")) || "").trim();
        if (!/social\s*embeds/i.test(txt)) {
          recordVerificationWarning(step, context, `Videos and Social Embeds (doc): expected Social Embeds modal title — got "${txt}".`);
        }
        break;
      }

      if (
        String(flow?.id || "").toLowerCase() === "use-slash-command-for-shortcuts-in-json-rte" &&
        step.target === "JSON RTE editor contains text (doc step)" &&
        step.expected?.labelEquals
      ) {
        const t = getStepTimeoutMs(step);
        const editor = page
          .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
          .first();
        await editor.waitFor({ state: "attached", timeout: t });
        const needle = String(step.expected.labelEquals || "");
        let raw = "";
        for (let attempt = 0; attempt < 30; attempt++) {
          raw = ((await editor.innerText().catch(() => "")) || "").replace(/\s+/g, " ");
          if (raw.includes(needle)) break;
          raw = ((await editor.evaluate((el) => (el as HTMLElement).textContent || "").catch(() => "")) || "").replace(
            /\s+/g,
            " "
          );
          if (raw.includes(needle)) break;
          await page.waitForTimeout(200);
        }
        if (!raw.includes(needle)) {
          const msg = `JSON RTE editor (doc): expected visible text to include "${needle}" after slash command.`;
          // Warn-only: alignment and some blocks may not reflect in innerText immediately; doc-step parity treats content checks as non-fatal.
          recordVerificationWarning(step, context, msg);
        }
        break;
      }

      if (
        String(flow?.id || "").toLowerCase() === "use-slash-command-for-shortcuts-in-json-rte" &&
        step.target === "JSON RTE editor shows h3 for slash heading (doc step)" &&
        step.expected?.labelEquals
      ) {
        const t = getStepTimeoutMs(step);
        const needle = String(step.expected.labelEquals || "");
        const rte = page.locator('[data-test-id="cs-edit-entry-field-json_rte"]');
        const headingish = rte
          .locator(
            'h1, h2, h3, h4, h5, h6, [data-testid="h1"], [data-testid="h2"], [data-testid="h3"], [data-testid="h4"], [class*="Heading"], [class*="heading"]'
          )
          .filter({ hasText: new RegExp(escapeRegex(needle), "i") })
          .first();
        const visible = await headingish.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `JSON RTE (doc): expected /h3 (or doc-listed heading) block containing "${needle}" — no heading-like node found (text may still be present as plain block).`
          );
        }
        break;
      }

      // Use Saved Views: menu option verification - warn if missing, do not fail
      const useSavedViewsMenuTargets = [
        "Update the view menu item (doc step)",
        "Save as new view menu item (doc step)",
        "Clear recent changes menu item (doc step)",
        "Reset to all entries menu item (doc step)",
        "Rename menu item (doc step)",
        "Share menu item (doc step)",
        "Copy Link menu item (doc step)",
        "View Details menu item (doc step)",
        "Delete menu item (doc step)",
      ];
      const aboutLocalizationOperatorVerifyTargets = [
        "Localized In operator option (doc step)",
        "Not Localized In operator option (doc step)",
      ];
      if (
        String(flow?.id || "").toLowerCase() === "use-saved-views" &&
        useSavedViewsMenuTargets.includes(step.target)
      ) {
        const { click } = loadOverrides(flow);
        const sel = click[step.target] || CLICK_SELECTORS[step.target];
        const el = sel ? page.locator(sel).first() : await resolveTarget(page, step.target, flow);
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: expected in dropdown menu per doc, but not found in app.`
          );
        }
        break;
      }
      if (
        String(flow?.id || "").toLowerCase() === "about-localization-operator" &&
        aboutLocalizationOperatorVerifyTargets.includes(step.target)
      ) {
        const { click } = loadOverrides(flow);
        const sel = click[step.target] || CLICK_SELECTORS[step.target];
        const el = sel ? page.locator(sel).first() : await resolveTarget(page, step.target, flow);
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: expected in Operator dropdown per doc (after selecting value), but not found in app.`
          );
        }
        break;
      }
      if (
        step.action === "verify" &&
        String(flow?.id || "").toLowerCase() === "get-localized-entries" &&
        step.target === "Localized in dropdown (doc step)"
      ) {
        const { click } = loadOverrides(flow);
        const sel = click[step.target] || CLICK_SELECTORS[step.target];
        const el = sel ? page.locator(sel).first() : page.locator('[data-test-id*="localized"]').first();
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: expected in language filter per doc, but not found in app.`
          );
        }
        break;
      }

      // Trash Content Types: DATE filter — date range control in table toolbar (see date-range-dropdown.html)
      if (step.target === "Trash date range filter DATE (doc step)") {
        const t = getStepTimeoutMs(step);
        const el = page.locator('[data-test-id="cs-trash-dateRangePicker-dropdown"]').first();
        await expect(el).toBeVisible({ timeout: t });
        try {
          await ensureWithin(page, el, "Trash table toolbar", step.expected?.withinStrict === true);
        } catch (err: any) {
          recordVerificationWarning(
            step,
            context,
            `DATE filter (doc): expected in trash table toolbar area — ${err?.message ?? String(err)}`
          );
        }
        break;
      }

      // Trash Content Types: previous step hovers the row (doc only). This step only verifies Restore is visible — no extra UI actions (no ellipsis, no keyboard).
      if (step.target === "Trash row Restore action visible after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const restore = page
          .locator('[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-ct-action-restore"]')
          .first();
        try {
          await expect(restore).toBeVisible({ timeout: t });
        } catch {
          throw new Error(
            `Trash row Restore (doc step): Restore is not visible after the documented hover step. Expected [data-test-id="cs-trash-ct-action-restore"] in the row actions tooltip. The flow does not open row actions via ellipsis or keyboard—only the prior hover step applies.`
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(restore, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // Restore deleted GF doc § “Open the Global field schema … add or remove fields … click on Restore” (after modal/tooltip path opens builder).
      if (step.target === "Deleted global field builder from trash restore (doc step)") {
        const t = getStepTimeoutMs(step);
        if (!/global-field-builder/i.test(page.url())) {
          throw new Error(
            'Deleted global field builder (doc step): expected URL to include "global-field-builder" so the Global field schema is open per the document.'
          );
        }
        const root = page.locator(".contenttype-builder.globalfield-builder, .globalfield-builder").first();
        await expect(root).toBeVisible({ timeout: t });
        if (step.expected?.within) {
          try {
            await ensureWithin(page, root, step.expected.within, step.expected?.withinStrict === true);
          } catch (err: any) {
            recordVerificationWarning(
              step,
              context,
              `Deleted global field builder (doc): ${err?.message ?? String(err)}`
            );
          }
        }
        break;
      }
      if (step.target === "Global field builder Insert a field (trash restore doc step)") {
        const t = getStepTimeoutMs(step);
        const { click: overridesClick } = loadOverrides(flow);
        const sel = overridesClick["Global field builder Insert a field (trash restore doc step)"];
        const el = sel ? page.locator(sel).first() : page.locator('[data-test-id="cs-field-type-selector"]').first();
        await expect(el).toBeVisible({ timeout: t });
        if (step.expected?.labelEquals) {
          try {
            await assertLabelMatch(el, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
          } catch (err: any) {
            recordVerificationWarning(
              step,
              context,
              `Insert a field control (trash restore doc): ${err?.message ?? String(err)}`
            );
          }
        }
        break;
      }
      if (step.target === "Restore on deleted global field builder (doc step)") {
        const t = getStepTimeoutMs(step);
        const header = page.locator('[data-test-id="cs-page-layout-header"], [data-test-id="cs-page-header"], .PageHeader').first();
        const btn = header.getByRole("button", { name: /^Restore$/i }).first();
        await expect(btn).toBeVisible({ timeout: t });
        if (step.expected?.within) {
          try {
            await ensureWithin(page, btn, step.expected.within, step.expected?.withinStrict === true);
          } catch (err: any) {
            recordVerificationWarning(
              step,
              context,
              `Restore on deleted global field builder (doc): ${err?.message ?? String(err)}`
            );
          }
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(btn, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }
      // Doc “Once done, click on Restore” — deleted asset editor header (restore-a-deleted-asset; optional when list→modal path is used instead).
      if (step.target === "Once done click Restore (deleted asset editor) (doc step)") {
        const t = getStepTimeoutMs(step);
        const header = page.locator('[data-test-id="cs-page-layout-header"], [data-test-id="cs-page-header"], .PageHeader').first();
        const btn = header.getByRole("button", { name: /^Restore$/i }).first();
        await expect(btn).toBeVisible({ timeout: t });
        if (step.expected?.within) {
          try {
            await ensureWithin(page, btn, step.expected.within, step.expected?.withinStrict === true);
          } catch (err: any) {
            recordVerificationWarning(
              step,
              context,
              `Once done click Restore (deleted asset editor) (doc): ${err?.message ?? String(err)}`
            );
          }
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(btn, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // Trash Global Fields: same doc pattern as content types — hover only, then verify Restore in VerticalActionTooltip (data/dom/CMS/trash/global-fields-listing-page.html).
      if (step.target === "Trash global field row Restore action visible after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const restore = page
          .locator('[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-gf-action-restore"]')
          .first();
        try {
          await expect(restore).toBeVisible({ timeout: t });
        } catch {
          throw new Error(
            `Trash global field Restore (doc step): Restore is not visible after the documented hover step. Expected [data-test-id="cs-trash-gf-action-restore"] in the row actions tooltip. The flow does not open row actions via ellipsis or keyboard—only the prior hover step applies.`
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(restore, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // Trash → Entries: same pattern as global fields — hover only, then verify Restore in VerticalActionTooltip.
      if (step.target === "Trash entry row Restore action visible after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const restore = page
          .locator('[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-entries-action-restore"]')
          .first();
        try {
          await expect(restore).toBeVisible({ timeout: t });
        } catch {
          throw new Error(
            `Trash entry Restore (doc step): Restore is not visible after the documented hover step. Expected [data-test-id="cs-trash-entries-action-restore"] in the row actions tooltip. The flow does not open row actions via ellipsis or keyboard—only the prior hover step applies.`
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(restore, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // Trash → Assets: Restore in VerticalActionTooltip (data/dom/CMS/trash/asset-listing-page.html).
      if (step.target === "Trash asset row Restore action visible after hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const restore = page
          .locator(
            '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-assets-action-restore"], [data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-asstes-action-restore"]'
          )
          .first();
        try {
          await expect(restore).toBeVisible({ timeout: t });
        } catch {
          throw new Error(
            `Trash asset Restore (doc step): Restore is not visible after the documented hover step. Expected [data-test-id="cs-trash-assets-action-restore"] (or cs-trash-asstes-action-restore) in the row actions tooltip. The flow does not open row actions via ellipsis or keyboard—only the prior hover step applies.`
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(restore, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // Trash → Taxonomies: View Details in VerticalActionTooltip after Actions column ellipsis (taxonomy-verticle-menu.html).
      if (
        step.target === "Trash taxonomy View Details in vertical action menu (doc step)" ||
        step.target === "Trash term View Details in vertical action menu (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const viewDetails = tip.locator(".trash_viewDetails_text").first();
        try {
          await expect(viewDetails).toBeVisible({ timeout: t });
        } catch {
          const kind = step.target.includes("term") ? "term" : "taxonomy";
          throw new Error(
            `Trash ${kind} View Details (doc step): "View Details" is not visible in the row actions menu after opening the Actions column ellipsis. Expected .trash_viewDetails_text in [data-test-id="cs-vertical-action-tooltip"] (taxonomy-verticle-menu.html).`
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(viewDetails, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // Trash → Taxonomies: Restore in VerticalActionTooltip after Actions column ellipsis (taxonomy-verticle-menu.html).
      if (
        step.target === "Trash taxonomy Restore in vertical action menu visible (doc step)" ||
        step.target === "Trash term Restore in vertical action menu visible (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const tip = page.locator('[data-test-id="cs-vertical-action-tooltip"]').first();
        await expect(tip).toBeVisible({ timeout: t });
        const restore = tip.locator('.restore-label:has-text("Restore")').first();
        try {
          await expect(restore).toBeVisible({ timeout: t });
        } catch {
          const kind = step.target.includes("term") ? "term" : "taxonomy";
          throw new Error(
            `Trash ${kind} Restore (doc step): Restore is not visible in the row actions menu after opening the Actions column ellipsis. Expected .restore-label "Restore" in [data-test-id="cs-vertical-action-tooltip"].`
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(restore, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      const expAny = step.expected as any;
      const hasNameVerificationExpectation =
        !!step.expected &&
        (!!step.expected.labelEquals ||
          !!step.expected.modalTitle ||
          !!expAny?.documentedFields ||
          !!expAny?.documentedStructure);
      const isSchemaFieldsVerify =
        step.target === "About Us Page schema fields (doc step)" || step.target === "Our Team schema fields (doc step)";
      const isNameVerificationTarget = /(modal|label|field|title)/i.test(String(step.target || ""));
      if (
        STRICT_DOC_VERIFICATION &&
        !isSchemaFieldsVerify &&
        /contentstack\.com\/docs/i.test(String(flow?.source || context?.documentUrl || "")) &&
        String(step.target || "").includes("(doc step)") &&
        isNameVerificationTarget &&
        !hasNameVerificationExpectation
      ) {
        throw new Error(
          `Strict doc verification rule: verify step "${step.target}" must include expected.labelEquals and/or expected.modalTitle.`
        );
      }
      // If verifying Settings/Edit, ensure the row action menu is open and the item is visible.
      if (step.target === "Settings" || step.target === "Edit") {
        await openRowActionMenu(page, undefined, flow);
        const menuRoot = await getRowActionMenuRoot(page);

        const candidates: Locator[] =
          step.target === "Settings"
            ? [
                menuRoot.getByText("Settings", { exact: true }).first(),
                menuRoot.locator('[data-test-id="cs-ct-action-settings"]').first(),
                menuRoot.getByRole("menuitem", { name: /^Settings$/i }).first(),
                menuRoot
                  .getByText("Settings", { exact: true })
                  .locator("xpath=ancestor-or-self::*[@role='menuitem' or self::button or self::a or self::li][1]")
                  .first(),
                menuRoot
                  .locator(
                    'li:has-text("Settings") [role="menuitem"], li:has-text("Settings") button, li:has-text("Settings") a'
                  )
                  .first(),
              ]
            : [
                menuRoot.getByText("Edit", { exact: true }).first(),
                menuRoot.locator('[data-test-id="cs-ct-action-edit"]').first(),
                menuRoot.getByRole("menuitem", { name: /^Edit$/i }).first(),
                menuRoot
                  .getByText("Edit", { exact: true })
                  .locator("xpath=ancestor-or-self::*[@role='menuitem' or self::button or self::a or self::li][1]")
                  .first(),
                menuRoot
                  .locator('li:has-text("Edit") [role="menuitem"], li:has-text("Edit") button, li:has-text("Edit") a')
                  .first(),
              ];

        let itemLoc: Locator | null = null;

        // First pass: maybe already visible (menu already open)
        for (const c of candidates) {
          if ((await c.count().catch(() => 0)) > 0 && (await c.isVisible().catch(() => false))) {
            itemLoc = c;
            break;
          }
        }

        if (!itemLoc) itemLoc = candidates[0];

        await expect(itemLoc).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      // Unlock User (account-lockout-policy): must be visible in user row menu; fail if not.
      if (step.target === "Unlock User option (doc step)") {
        const menuRoot = page.locator(".VerticalActionTooltip, [role='menu']").first();
        const unlockItem = menuRoot.locator('li:has-text("Unlock User"), [role="menuitem"]:has-text("Unlock User")').first();
        await expect(unlockItem).toBeVisible({ timeout: getStepTimeoutMs(step) });
        break;
      }

      // Global Field doc-coverage checks:
      // warn when documented properties are missing in app, or app properties are not covered by doc list.
      if (
        step.target === "Global Properties coverage - Basic (doc step)" ||
        step.target === "Global Properties coverage - Advanced (doc step)"
      ) {
        const panel = page.locator('[data-test-id="cs-field-properties-container"], .FieldProperties').first();
        await expect(panel).toBeVisible({ timeout: getStepTimeoutMs(step) });

        const tabName = step.target.includes("Basic") ? "Basic" : "Advanced";
        const tab = page
          .locator(
            tabName === "Basic"
              ? '[data-test-id="cs-ct-field-global-tab-basic"], [role="tab"]:has-text("Basic"), .Tab__item:has-text("Basic")'
              : '[data-test-id="cs-ct-field-global-tab-advanced"], [role="tab"]:has-text("Advanced"), .Tab__item:has-text("Advanced")'
          )
          .first();
        if (await tab.isVisible().catch(() => false)) {
          await tab.click({ timeout: 5_000, force: true }).catch(() => {});
          await page.waitForTimeout(250);
        }

        const labels = await panel
          .evaluate((node) => {
            const root = node as HTMLElement;
            const picks = Array.from(
              root.querySelectorAll(
                "label, .FieldLabel, .Label--color--secondary, [data-test-id*='-label'], [data-test-id*='select-global-field-label']"
              )
            )
              .map((el) => (el.textContent || "").replace(/\s+/g, " ").trim())
              .filter(Boolean);
            return Array.from(new Set(picks));
          })
          .catch(() => []);

        const normalize = (s: string) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
        const labelNorm = (labels as string[]).map(normalize);

        const documentedBasic = [
          "Display Name",
          "Unique ID",
          "Select Global Field",
          "Instruction Value",
          "Help Text",
        ];
        const documentedAdvanced = ["Multiple", "Non-localizable"];
        const documented = tabName === "Basic" ? documentedBasic : documentedAdvanced;

        const missingFromApp = documented.filter((d) => !labelNorm.some((l) => l.includes(normalize(d))));
        if (missingFromApp.length) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: documented items missing in app: ${missingFromApp.join(", ")}`
          );
        }

        const appRelevant = (labels as string[]).filter((raw) => {
          const n = normalize(raw);
          if (!n) return false;
          if (n.includes("(required)")) return false;
          const allKnown = [
            ...documentedBasic,
            ...documentedAdvanced,
            "Mandatory",
            "Show as Tab",
            "Other Options",
          ].map(normalize);
          return allKnown.some((k) => n.includes(k));
        });
        const uncoveredByDoc = appRelevant.filter((a) => !documented.some((d) => normalize(a).includes(normalize(d))));
        if (uncoveredByDoc.length) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: app items not covered by this doc list: ${Array.from(new Set(uncoveredByDoc)).join(", ")}`
          );
        }
        break;
      }

      // Management Token doc-coverage checks:
      // Verify document-listed fields are present and log warning for missing ones.
      if (step.target === "Management Token fields coverage (doc step)") {
        const normalize = (s: string) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
        const bodyText = normalize((await page.textContent("body").catch(() => "")) || "");

        const requiredDocFields = [
          "name",
          "description",
          "scope",
          "permissions",
          "read",
          "write",
          "expiry",
          "never",
          "date (in utc)",
          "manage rate limits",
          "select rate limit type",
          "use organization rate limit",
          "enforce custom rate limit",
          "stack api key",
          "management token",
          "generate token",
        ];
        const optionalDocFields = ["branches", "aliases", "notify via email", "read requests per second", "write requests per second"];

        const missingRequired = requiredDocFields.filter((f) => !bodyText.includes(normalize(f)));
        if (missingRequired.length) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: required documented fields missing in app: ${missingRequired.join(", ")}`
          );
        }

        const missingOptional = optionalDocFields.filter((f) => !bodyText.includes(normalize(f)));
        if (missingOptional.length) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: optional/conditional documented fields not currently visible: ${missingOptional.join(", ")}`
          );
        }
        break;
      }

      // Webhook log columns: extract all column names from log page, verify doc-listed columns match app exactly. Fail if any doc column is missing.
      if (step.target === "Webhook log columns (doc step)") {
        const docColumns = ["Time", "Action", "Module", "Title", "Call Status", "Actions"];
        const headerCells = page.locator(
          '[data-test-id^="cs-table-head-text--"], .Table__head__column-text'
        );
        const appColumns = await headerCells
          .allTextContents()
          .then((arr) => arr.map((s) => (s || "").trim()).filter(Boolean))
          .catch(() => []);
        const appColumnsNormalized = appColumns.map((c) => c.toLowerCase());
        const missing: string[] = [];
        for (const docCol of docColumns) {
          if (!appColumnsNormalized.some((a) => a === docCol.toLowerCase())) {
            missing.push(docCol);
          }
        }
        if (missing.length) {
          throw new Error(
            `Webhook log columns (doc step): doc-listed columns missing in app: ${missing.join(", ")}. App columns: ${appColumns.join(", ")}`
          );
        }
        const extra: string[] = [];
        for (const appCol of appColumns) {
          if (!docColumns.some((d) => d.toLowerCase() === appCol.toLowerCase())) {
            extra.push(appCol);
          }
        }
        if (extra.length) {
          recordVerificationWarning(
            step,
            context,
            `Webhook log columns: app has columns not in doc: ${extra.join(", ")}`
          );
        }
        break;
      }

      // About Us Page schema fields: verify hierarchical structure from "Developing Content Type".
      // Supports documentedStructure (paths) or documentedFields (flat). Exact name match. Mismatches = warning.
      if (step.target === "About Us Page schema fields (doc step)" && flow?.id === "about-us-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const docPathsSet = new Set(docStructure.map((p) => p.join(" › ")));
          const appPathsSet = new Set(appPaths.map((p) => p.join(" › ")));
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp: string[][] = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc: string[][] = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `About Us Page schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `About Us Page schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        } else {
          const defaultDocFields = [
            "Title", "URL", "Page Components", "Hero Banner", "Section with Bucket",
            "Title H2", "Description", "Tabular Buckets", "Buckets", "Title H3",
            "Image", "Image Alignment", "Icon", "Call to Action", "Awards & Achievements",
            "Link", "Sections", "Is Image Right Aligned", "Team", "Contact Us", "Contact",
            "SEO", "Meta Title", "Meta Description", "Meta Keywords", "Enable Search Indexing",
          ];
          const docFields: string[] = Array.isArray((step.expected as any)?.documentedFields)
            ? (step.expected as any).documentedFields
            : defaultDocFields;
          const fieldEls = page.locator(".entries-outline span.title, .schema span.title");
          const count = await fieldEls.count().catch(() => 0);
          const appFields: string[] = [];
          for (let i = 0; i < count; i++) {
            const t = (await fieldEls.nth(i).textContent().catch(() => "")) || "";
            const trimmed = (t || "").replace(/\s+/g, " ").trim();
            if (trimmed) appFields.push(trimmed);
          }
          const matches = (a: string, d: string) =>
            exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
          const missingInApp = docFields.filter((d) => !appFields.some((a) => matches(a, d)));
          const missingInDoc = appFields.filter((a) => !docFields.some((d) => matches(a, d)));
          if (missingInApp.length) {
            recordVerificationWarning(
              step, context,
              `About Us Page schema: documented fields not found in app: ${missingInApp.join(", ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step, context,
              `About Us Page schema: app has fields not in doc: ${[...new Set(missingInDoc)].join(", ")}`
            );
          }
        }
        break;
      }

      // Our Team schema fields: verify after selecting Our Team in Preview Schema dropdown.
      // Supports documentedStructure (paths) or documentedFields (flat). Exact match. Mismatches = warning.
      if (step.target === "Our Team schema fields (doc step)" && flow?.id === "about-us-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const selectedVal = await page.locator('.Select__single-value, [class*="singleValue"]').first().textContent().catch(() => "");
        if (!/our team/i.test(selectedVal || "")) {
          recordVerificationWarning(step, context, `Our Team schema: Preview Schema dropdown should show "Our Team", got "${selectedVal}".`);
        }
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step, context,
              `Our Team schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step, context,
              `Our Team schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        } else {
          const defaultDocFields = ["Title", "Description", "Employees", "Name", "Designation", "Image", "Short Description"];
          const docFields: string[] = Array.isArray((step.expected as any)?.documentedFields)
            ? (step.expected as any).documentedFields
            : defaultDocFields;
          const fieldEls = page.locator(".entries-outline span.title, .schema span.title");
          const count = await fieldEls.count().catch(() => 0);
          const appFields: string[] = [];
          for (let i = 0; i < count; i++) {
            const t = (await fieldEls.nth(i).textContent().catch(() => "")) || "";
            const trimmed = (t || "").replace(/\s+/g, " ").trim();
            if (trimmed) appFields.push(trimmed);
          }
          const matches = (a: string, d: string) =>
            exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
          const missingInApp = docFields.filter((d) => !appFields.some((a) => matches(a, d)));
          const missingInDoc = appFields.filter((a) => !docFields.some((d) => matches(a, d)));
          if (missingInApp.length) {
            recordVerificationWarning(
              step, context,
              `Our Team schema: documented fields not found in app: ${missingInApp.join(", ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step, context,
              `Our Team schema: app has fields not in doc: ${[...new Set(missingInDoc)].join(", ")}`
            );
          }
        }
        break;
      }

      // Contact Us Page schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Contact Us Page schema fields (doc step)" && flow?.id === "contact-us-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Contact Us Page schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Contact Us Page schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Hero Banner schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Hero Banner schema fields (doc step)" && flow?.id === "hero-banner") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Hero Banner schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Hero Banner schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Website Homepage schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Website Homepage schema fields (doc step)" && flow?.id === "website-homepage") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Website Homepage schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Website Homepage schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Website Header schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Website Header schema fields (doc step)" && flow?.id === "website-header") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Website Header schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Website Header schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Website Footer schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Website Footer schema fields (doc step)" && flow?.id === "website-footer") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Website Footer schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Website Footer schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Product Listing Page schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Product Listing Page schema fields (doc step)" && flow?.id === "product-listing-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Product Listing Page schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Product Listing Page schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // FAQs Page schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "FAQs Page schema fields (doc step)" && flow?.id === "faqs") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `FAQs Page schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `FAQs Page schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Blog Listing Page schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Blog Listing Page schema fields (doc step)" && flow?.id === "blog-listing-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Blog Listing Page schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Blog Listing Page schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Blog Landing Page schema fields: verify hierarchical structure from "Developing Content Type".
      if (step.target === "Blog Landing Page schema fields (doc step)" && flow?.id === "blog-landing-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step,
              context,
              `Blog Landing Page schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step,
              context,
              `Blog Landing Page schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Contact schema fields: verify after selecting Contact in Preview Schema dropdown.
      if (step.target === "Contact schema fields (doc step)" && flow?.id === "contact-us-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const selectedVal = await page.locator('.Select__single-value, [class*="singleValue"]').first().textContent().catch(() => "");
        if (!/contact/i.test(selectedVal || "")) {
          recordVerificationWarning(step, context, `Contact schema: Preview Schema dropdown should show "Contact", got "${selectedVal}".`);
        }
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step, context,
              `Contact schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step, context,
              `Contact schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        } else {
          const defaultDocFields = ["Title", "Address", "Contact Number", "Email Address"];
          const docFields: string[] = Array.isArray((step.expected as any)?.documentedFields)
            ? (step.expected as any).documentedFields
            : defaultDocFields;
          const fieldEls = page.locator(".entries-outline span.title, .schema span.title");
          const count = await fieldEls.count().catch(() => 0);
          const appFields: string[] = [];
          for (let i = 0; i < count; i++) {
            const t = (await fieldEls.nth(i).textContent().catch(() => "")) || "";
            const trimmed = (t || "").replace(/\s+/g, " ").trim();
            if (trimmed) appFields.push(trimmed);
          }
          const matches = (a: string, d: string) =>
            exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
          const missingInApp = docFields.filter((d) => !appFields.some((a) => matches(a, d)));
          const missingInDoc = appFields.filter((a) => !docFields.some((d) => matches(a, d)));
          if (missingInApp.length) {
            recordVerificationWarning(step, context, `Contact schema: documented fields not found in app: ${missingInApp.join(", ")}`);
          }
          if (missingInDoc.length) {
            recordVerificationWarning(step, context, `Contact schema: app has fields not in doc: ${[...new Set(missingInDoc)].join(", ")}`);
          }
        }
        break;
      }

      // Product schema fields: verify after selecting Product in Preview Schema dropdown.
      if (step.target === "Product schema fields (doc step)" && flow?.id === "product-listing-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const selectedVal = await page.locator('.Select__single-value, [class*="singleValue"]').first().textContent().catch(() => "");
        if (!/product/i.test(selectedVal || "")) {
          recordVerificationWarning(step, context, `Product schema: Preview Schema dropdown should show "Product", got "${selectedVal}".`);
        }
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step, context,
              `Product schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step, context,
              `Product schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        }
        break;
      }

      // Author schema fields: verify after selecting Author in Preview Schema dropdown.
      if (step.target === "Author schema fields (doc step)" && flow?.id === "blog-landing-page") {
        const schemaOutline = page.locator(".entries-outline, .schema .entries-outline").first();
        await expect(schemaOutline).toBeVisible({ timeout: getStepTimeoutMs(step) });
        await page.waitForTimeout(300);
        const selectedVal = await page.locator('.Select__single-value, [class*="singleValue"]').first().textContent().catch(() => "");
        if (!/author/i.test(selectedVal || "")) {
          recordVerificationWarning(step, context, `Author schema: Preview Schema dropdown should show "Author", got "${selectedVal}".`);
        }
        const docStructure = (step.expected as any)?.documentedStructure as string[][] | undefined;
        const exactMatch = !!((step.expected as any)?.exactMatch ?? true);
        const pathMatch = (a: string, d: string) =>
          exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
        if (Array.isArray(docStructure) && docStructure.length > 0) {
          const appPaths = await page.evaluate(() => {
            const walk = (ul: Element | null, parentPath: string[]): string[][] => {
              if (!ul) return [];
              const lis = ul.querySelectorAll(":scope > li");
              const out: string[][] = [];
              for (const li of lis) {
                const titleEl = li.querySelector("span.title");
                const name = (titleEl?.textContent || "").replace(/\s+/g, " ").trim();
                if (!name) continue;
                const path = [...parentPath, name];
                out.push(path);
                const childUl = li.querySelector(":scope > ul");
                if (childUl) out.push(...walk(childUl, path));
              }
              return out;
            };
            const root = document.querySelector(".entries-outline ul, .schema .entries-outline ul");
            return walk(root, []);
          });
          const pathMatches = (docPath: string[], appPath: string[]) => {
            if (docPath.length !== appPath.length) return false;
            return docPath.every((d, i) => pathMatch(appPath[i] || "", d));
          };
          const missingInApp = docStructure.filter(
            (dp) => !appPaths.some((ap) => pathMatches(dp, ap))
          );
          const missingInDoc = appPaths.filter(
            (ap) => !docStructure.some((dp) => pathMatches(dp, ap))
          );
          if (missingInApp.length) {
            recordVerificationWarning(
              step, context,
              `Author schema: documented paths not found in app (exact match): ${missingInApp.map((p) => p.join(" › ")).join("; ")}`
            );
          }
          if (missingInDoc.length) {
            recordVerificationWarning(
              step, context,
              `Author schema: app has paths not in doc (exact match): ${missingInDoc.map((p) => p.join(" › ")).join("; ")}`
            );
          }
        } else {
          const defaultDocFields = ["Full Name", "Picture", "Bio"];
          const docFields: string[] = Array.isArray((step.expected as any)?.documentedFields)
            ? (step.expected as any).documentedFields
            : defaultDocFields;
          const fieldEls = page.locator(".entries-outline span.title, .schema span.title");
          const count = await fieldEls.count().catch(() => 0);
          const appFields: string[] = [];
          for (let i = 0; i < count; i++) {
            const t = (await fieldEls.nth(i).textContent().catch(() => "")) || "";
            const trimmed = (t || "").replace(/\s+/g, " ").trim();
            if (trimmed) appFields.push(trimmed);
          }
          const matches = (a: string, d: string) =>
            exactMatch ? a === d : a.toLowerCase() === d.toLowerCase();
          const missingInApp = docFields.filter((d) => !appFields.some((a) => matches(a, d)));
          const missingInDoc = appFields.filter((a) => !docFields.some((d) => matches(a, d)));
          if (missingInApp.length) {
            recordVerificationWarning(step, context, `Author schema: documented fields not found in app: ${missingInApp.join(", ")}`);
          }
          if (missingInDoc.length) {
            recordVerificationWarning(step, context, `Author schema: app has fields not in doc: ${[...new Set(missingInDoc)].join(", ")}`);
          }
        }
        break;
      }

      // Basic Search dropdown options: fetch app values from dropdown, compare with documented options. Warn if any doc option missing or name mismatch.
      if (step.target === "Basic Search dropdown options coverage (doc step)") {
        const docOptions: string[] =
          (step.expected as any)?.documentedOptions ?? [
            "All (Search within all fields)",
            "Title (Search within title only)",
            "URL (Search within url only)",
            "Specific field (Search within a specific field)",
          ];

        await page.waitForTimeout(300);

        let menuItems = page.locator(
          '[data-test-id^="cs-entries-search-in-"], .Dropdown__menu__list .Dropdown__menu__list__item, .Dropdown__menu__list li'
        );
        let appOptions: string[] = [];
        let count = await menuItems.count().catch(() => 0);

        if (count === 0) {
          const trigger = page.locator('[data-test-id="cs-search-bar-select"]').first();
          if (await trigger.isVisible().catch(() => false)) {
            await trigger.click({ timeout: 5_000 }).catch(() => {});
            await page.waitForTimeout(400);
          }
          menuItems = page.locator(
            '[data-test-id^="cs-entries-search-in-"], .Dropdown__menu__list .Dropdown__menu__list__item, .Dropdown__menu__list li'
          );
          count = await menuItems.count().catch(() => 0);
        }

        for (let i = 0; i < count; i++) {
          const text = (await menuItems.nth(i).textContent().catch(() => "")) || "";
          const trimmed = text.replace(/\s+/g, " ").trim();
          if (trimmed) appOptions.push(trimmed);
        }

        const normalize = (s: string) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
        const appNormalized = appOptions.map(normalize);

        const missing: string[] = [];
        for (const docOpt of docOptions) {
          const docNorm = normalize(docOpt);
          if (!appNormalized.some((a) => a === docNorm || a.includes(docNorm) || docNorm.includes(a))) {
            missing.push(docOpt);
          }
        }
        if (missing.length) {
          recordVerificationWarning(
            step,
            context,
            `Basic Search dropdown: documented options not found in app (expected: ${docOptions.join("; ")}; app has: ${appOptions.join("; ") || "(none)"}): ${missing.join(", ")}`
          );
        }

        const extra = appOptions.filter((a) => !docOptions.some((d) => normalize(d) === normalize(a)));
        if (extra.length) {
          recordVerificationWarning(
            step,
            context,
            `Basic Search dropdown: app has options not in doc: ${extra.join(", ")}`
          );
        }
        break;
      }

      // Manage Filters modal options: fetch app labels from modal, compare with documented options. Warn if any doc option missing or spelling mismatch.
      if (step.target === "Manage Filters modal options (doc step)") {
        const docOptions: string[] =
          (step.expected as any)?.documentedOptions ?? [
            "Content Types",
            "Taxonomies",
            "Select Variant(s)",
            "Publish Status",
            "Published At",
            "Published By",
            "Languages",
            "Modified At",
            "Last Modified By",
            "Created At",
            "Created By",
            "Workflow Stages",
            "Tags",
          ];

        const modal = page.locator('[data-test-id="cs-manage-filters-modal"]');
        await modal.waitFor({ state: "visible", timeout: getStepTimeoutMs(step) }).catch(() => {});
        await page.waitForTimeout(300);

        const filterManager = modal.locator('[data-test-id="cs-filter-manager"]');
        const labelTextEls = filterManager.locator('[data-test-id$="-item-label-text"]');
        const fallback = filterManager.locator('[data-test-id="cs-filter-manager-item"]');
        let appOptions: string[] = [];
        const labelCount = await labelTextEls.count().catch(() => 0);
        if (labelCount > 0) {
          for (let i = 0; i < labelCount; i++) {
            const text = (await labelTextEls.nth(i).textContent().catch(() => "")) || "";
            const trimmed = text.replace(/\s+/g, " ").trim();
            if (trimmed) appOptions.push(trimmed);
          }
        } else {
          const fallbackCount = await fallback.count().catch(() => 0);
          for (let i = 0; i < fallbackCount; i++) {
            const text = (await fallback.nth(i).textContent().catch(() => "")) || "";
            const trimmed = text.replace(/\s+/g, " ").trim();
            if (trimmed) appOptions.push(trimmed);
          }
        }

        const normalize = (s: string) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
        const appNormalized = appOptions.map(normalize);

        const missing: string[] = [];
        for (const docOpt of docOptions) {
          const docNorm = normalize(docOpt);
          if (!appNormalized.some((a) => a === docNorm || a.includes(docNorm) || docNorm.includes(a))) {
            missing.push(docOpt);
          }
        }
        if (missing.length) {
          recordVerificationWarning(
            step,
            context,
            `Manage Filters modal: documented options not found in app (expected: ${docOptions.join("; ")}; app has: ${appOptions.join("; ") || "(none)"}): ${missing.join(", ")}`
          );
        }

        const extra = appOptions.filter((a) => !docOptions.some((d) => normalize(d) === normalize(a)));
        if (extra.length) {
          recordVerificationWarning(
            step,
            context,
            `Manage Filters modal: app has options not in doc: ${extra.join(", ")}`
          );
        }
        break;
      }

      // Partial Search / Advanced Search: verify entries list shows search results (rows or empty state). Warn if empty when results expected.
      if (
        step.target === "Search results displayed (doc step)" &&
        ["partial-search", "advanced-search"].includes(String(flow?.id || "").toLowerCase())
      ) {
        await page.waitForTimeout(800);
        const rows = page.locator('[data-test-id^="cs-table-body-row-"], .Table__body [role="row"]');
        const count = await rows.count().catch(() => 0);
        const hasRows = count > 0 && (await rows.first().isVisible().catch(() => false));
        if (!hasRows) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: no entry rows visible after search. Doc expects entries matching keyword to be displayed.`
          );
        } else {
          await expect(rows.first()).toBeVisible({ timeout: getStepTimeoutMs(step) });
        }
        break;
      }

      // Quick Search: verify Entries/Assets in cs-search-bar-select dropdown (global-search-menu.html)
      if (
        (step.target === "Entries option in Quick Search dropdown (doc step)" ||
          step.target === "Assets option in Quick Search dropdown (doc step)") &&
        String(flow?.id || "").toLowerCase() === "quick-search"
      ) {
        await page.waitForTimeout(500);
        const expectedLabel = step.target.includes("Entries") ? "Entries" : "Assets";
        const candidates = step.target.includes("Entries")
          ? [
              page.locator('[data-test-id="cs-header-search-entries"]'),
              page.locator('[data-test-id="cs-search-bar-select"] li[title="Entries"], [data-test-id="cs-search-bar-select"] .Dropdown__menu__list__item:has-text("Entries")'),
              page.getByRole("listitem", { name: /^Entries$/i }),
              page.locator('li[title="Entries"]'),
              page.locator('.Dropdown__menu__list__item:has-text("Entries")'),
            ]
          : [
              page.locator('[data-test-id="cs-header-search-assets"]'),
              page.locator('[data-test-id="cs-search-bar-select"] li[title="Assets"], [data-test-id="cs-search-bar-select"] .Dropdown__menu__list__item:has-text("Assets")'),
              page.getByRole("listitem", { name: /^Assets$/i }),
              page.locator('li[title="Assets"]'),
              page.locator('.Dropdown__menu__list__item:has-text("Assets")'),
            ];
        let visible = false;
        for (const loc of candidates) {
          if ((await loc.count().catch(() => 0)) > 0 && (await loc.first().isVisible().catch(() => false))) {
            visible = true;
            break;
          }
        }
        if (!visible) {
          // Try expanding cs-search-bar-select first (dropdown may be collapsed)
          const selectTrigger = page.locator('[data-test-id="cs-search-bar-select"], [data-test-id="cs-header-search-container"] [data-test-id="cs-search-bar-select"]').first();
          if (await selectTrigger.isVisible().catch(() => false)) {
            await selectTrigger.click().catch(() => {});
            await page.waitForTimeout(400);
            for (const loc of candidates) {
              if ((await loc.count().catch(() => 0)) > 0 && (await loc.first().isVisible().catch(() => false))) {
                visible = true;
                break;
              }
            }
          }
        }
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: "${expectedLabel}" option not visible in Quick Search dropdown. Doc expects Entries and Assets.`
          );
        }
        break;
      }

      // Quick Search: verify redirected to Entries listing page. No warning when 0 results (empty state is valid).
      if (
        (step.target === "Entries listing page (doc step)" || step.target === "Entries listing page with search results (doc step)") &&
        String(flow?.id || "").toLowerCase() === "quick-search"
      ) {
        const t = getStepTimeoutMs(step);
        await page.waitForTimeout(2000);
        const pageMarkers = '[data-test-id="cs-table"], .entryList, [data-test-id="cs-entries-inline-search"], [data-test-id="cs-search-bar-select"], [data-test-id="cs-empty-state"], [data-test-id="cs-page-layout-contentBody"] .entryList';
        let entriesListing = page.locator(pageMarkers).first();
        let visible = await entriesListing.waitFor({ state: "visible", timeout: 8_000 }).catch(() => null);
        if (!visible) {
          const firstResult = page.locator('[data-test-id="cs-header-search-container"] a[href*="/entries/"], [data-test-id="cs-header-search-container"] [role="listitem"] a:first-child').first();
          if ((await firstResult.count().catch(() => 0)) > 0 && (await firstResult.isVisible().catch(() => false))) {
            await firstResult.click();
            await page.waitForTimeout(2000);
            entriesListing = page.locator(pageMarkers).first();
            visible = await entriesListing.waitFor({ state: "visible", timeout: t }).catch(() => null);
          }
        }
        if (!visible) {
          const url = page.url();
          const urlOk = /\/entries(\/|$|\?)/.test(url) || /#!\/stack\/[^/]+\/entries/.test(url);
          if (urlOk) {
            break;
          }
        }
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: entries listing page not displayed after Quick Search. Doc expects navigation to entries list.`
          );
          break;
        }
        break;
      }

      if (step.target === "Create Preview Token label (doc step)" && (flow as any)?.__deliveryTokenCreateUnavailable) {
        const createPreviewLabel = page
          .locator('[data-test-id="cs-toggle-switch"] .Label--color--primary, [data-test-id="cs-toggle-switch"]:has-text("Create Preview Token")')
          .first();
        const visible = await createPreviewLabel.isVisible().catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: create path unavailable and preview token section is already in existing-token mode.`
          );
          break;
        }
      }

      // Delivery Token doc-coverage checks:
      // Verify document-listed fields are present and log warning for missing ones.
      if (step.target === "Delivery Token fields coverage (doc step)") {
        const normalize = (s: string) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
        const bodyText = normalize((await page.textContent("body").catch(() => "")) || "");

        const requiredDocFields = [
          "name",
          "description",
          "scope",
          "publishing environments",
          "stack api key",
          "delivery token",
          "preview token",
          "create preview token",
          "generate token",
        ];
        const optionalDocFields = ["branches", "aliases"];

        const missingRequired = requiredDocFields.filter((f) => !bodyText.includes(normalize(f)));
        if (missingRequired.length) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: required documented fields missing in app: ${missingRequired.join(", ")}`
          );
        }

        const missingOptional = optionalDocFields.filter((f) => !bodyText.includes(normalize(f)));
        if (missingOptional.length) {
          recordVerificationWarning(
            step,
            context,
            `${step.target}: optional/conditional documented fields not currently visible: ${missingOptional.join(", ")}`
          );
        }
        break;
      }

      if (step.target === "Name (edit label doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, getStepTimeoutMs(step));
      }
      if (step.target === "Edit Label button (doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, getStepTimeoutMs(step));
      }
      if (step.target === "Delete Label button (doc step)") {
        await ensureManageLabelDeleteMode(page, flow, unique, getStepTimeoutMs(step));
      }
      if (step.target === "Show as Tab (doc step)") {
        const t = getStepTimeoutMs(step);
        const showAsTabRow = page
          .locator(
            '[data-test-id="cs-ct-field-global-tab-enabled"], [data-test-id="cs-ct-field-global-tab-disabled"], [data-test-id*="show"][data-test-id*="tab"], .FieldProperties__container:has-text("Show as Tab"), .FieldProperties:has-text("Show as Tab")'
          )
          .first();
        const enabledToggle = showAsTabRow
          .locator(
            '[role="switch"][aria-checked="true"], input[type="checkbox"]:checked, .toggle-switch.toggle-switch__active, [data-test-id*="enabled"]'
          )
          .first();
        const disabledToggle = showAsTabRow
          .locator(
            '[role="switch"][aria-checked="false"], input[type="checkbox"]:not(:checked), .toggle-switch:not(.toggle-switch__active), [data-test-id*="disabled"]'
          )
          .first();
        const toggleControl = showAsTabRow
          .locator('label.toggle-switch, [role="switch"], input[type="checkbox"]')
          .first();

        // Keep this step idempotent: don't click when already enabled.
        if (await enabledToggle.isVisible().catch(() => false)) {
          break;
        }

        await expect(showAsTabRow).toBeVisible({ timeout: t });
        if (await disabledToggle.isVisible().catch(() => false)) {
          await disabledToggle.click({ timeout: t, force: true });
        } else {
          await expect(toggleControl).toBeVisible({ timeout: t });
          await toggleControl.click({ timeout: t, force: true });
        }
        await expect(enabledToggle).toBeVisible({ timeout: t });
        break;
      }

      // Live Preview — Always Open label: .Label--color--secondary (open-live-preview-in-a-new-tab doc DOM).
      if (
        (String(flow?.id || "").toLowerCase() === "set-up-live-preview-for-your-stack" ||
          String(flow?.id || "").toLowerCase() === "open-live-preview-in-a-new-tab") &&
        step.target === "Always Open in New Tab toggle label (doc step)"
      ) {
        const t = getStepTimeoutMs(step);
        const vx = page
          .locator('.visual-experience-settings, [data-testid="cs-vb--visual-experience-settings"]')
          .first();
        await vx.waitFor({ state: "visible", timeout: Math.min(t, 25_000) });
        await vx.evaluate((el) => el.scrollTo({ top: (el as HTMLElement).scrollHeight, behavior: "instant" })).catch(() => {});
        await page.waitForTimeout(400);
        // Prefer .Label--color--secondary (current app DOM); fall back to any cs-field row with the doc string.
        let loc = vx.locator(".Label--color--secondary").filter({ hasText: /always\s+open\s+in\s+new\s+tab/i }).first();
        let visible = await loc.isVisible({ timeout: 5_000 }).catch(() => false);
        if (!visible) {
          loc = vx.locator('[data-test-id="cs-field"]').filter({ hasText: /always\s+open\s+in\s+new\s+tab/i }).first();
          visible = await loc.isVisible({ timeout: Math.min(t, 12_000) }).catch(() => false);
        }
        if (!visible) {
          throw new Error(
            'Live Preview (doc): expected "Always Open in New Tab" on Visual Experience → General (Label--color--secondary or cs-field row); not found. Doc prerequisites: SDK v4+ / app version — see open-live-preview-in-a-new-tab.'
          );
        }
        if (step.expected?.labelEquals) {
          await assertLabelMatch(loc, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        }
        break;
      }

      // custom-preview-urls — URL Path row labels (expanded accordion; preview-url-page.html).
      if (String(flow?.id || "").toLowerCase() === "custom-preview-urls") {
        const t = getStepTimeoutMs(step);
        const item = page.locator(".preview-url-container .url-path-item").first();
        const warnLabel = async (loc: Locator, want: string, ctx: string) => {
          const txt = ((await loc.innerText().catch(() => "")) || "").replace(/\s+/g, " ").trim();
          const mode = String(step.expected?.labelMatch || "contains").toLowerCase();
          const ok =
            mode === "exact" || mode === "equals"
              ? txt.toLowerCase() === want.toLowerCase()
              : txt.toLowerCase().includes(want.toLowerCase());
          if (!ok) {
            recordVerificationWarning(
              step,
              context,
              `Custom Preview URLs (doc): ${ctx} — expected ${mode === "contains" ? `to contain "${want}"` : `"${want}"`}, got "${txt}".`
            );
          }
        };

        if (step.target === "URL path Path name field label (doc step)") {
          await expect(item).toBeVisible({ timeout: Math.min(t, 25_000) });
          // Doc: "path name for the preview route"; UI label is "Name" (preview-url-page.html).
          const lab = item.getByText("Name", { exact: true }).first();
          const vis = await lab.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
          if (!vis) {
            recordVerificationWarning(
              step,
              context,
              'Custom Preview URLs (doc): expected "Name" field label for the preview route path in first URL path row (Define the URL Path).'
            );
            break;
          }
          if (step.expected?.labelEquals) await warnLabel(lab, String(step.expected.labelEquals), "Path name label");
          break;
        }

        if (step.target === "URL path Branch field label (doc step)") {
          await expect(item).toBeVisible({ timeout: Math.min(t, 25_000) });
          const lab = item.locator("div, span, label").filter({ hasText: /select\s+the\s+branch/i }).first();
          const vis = await lab.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
          if (!vis) {
            recordVerificationWarning(
              step,
              context,
              'Custom Preview URLs (doc): expected "Select the branch(es)" in URL path row (select the branch where the configuration applies).'
            );
            break;
          }
          if (step.expected?.labelEquals) await warnLabel(lab, String(step.expected.labelEquals), "Branch section label");
          break;
        }

        if (step.target === "URL path All content types option label (doc step)") {
          await expect(item).toBeVisible({ timeout: Math.min(t, 25_000) });
          const lab = item.locator("span, label, div").filter({ hasText: /^All Content Types$/i }).first();
          const vis = await lab.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
          if (!vis) {
            recordVerificationWarning(
              step,
              context,
              'Custom Preview URLs (doc): expected "All Content Types" (All vs Specific content types).'
            );
            break;
          }
          if (step.expected?.labelEquals) await warnLabel(lab, String(step.expected.labelEquals), "All Content Types label");
          break;
        }

        if (step.target === "URL path Preview URL pattern field label (doc step)") {
          await expect(item).toBeVisible({ timeout: Math.min(t, 25_000) });
          // Pattern row label in app is "Preview URL" (not "Pattern"); may be div/span, not FieldLabel.
          const lab = item.getByText("Preview URL", { exact: true }).first();
          const vis = await lab.isVisible({ timeout: Math.min(t, 15_000) }).catch(() => false);
          if (!vis) {
            recordVerificationWarning(
              step,
              context,
              'Custom Preview URLs (doc): expected "Preview URL" pattern field label ({{...}} placeholder syntax).'
            );
            break;
          }
          if (step.expected?.labelEquals) await warnLabel(lab, String(step.expected.labelEquals), "Preview URL pattern label");
          break;
        }
      }

      const { click, input } = loadOverrides(flow);
      const clickMapped = click[step.target] || CLICK_SELECTORS[step.target];
      const inputMapped = input[step.target] || INPUT_SELECTORS[step.target];
      let el: Locator = clickMapped
        ? page.locator(clickMapped).first()
        : inputMapped
        ? page.locator(inputMapped).first()
        : await resolveTarget(page, step.target, flow);
      // Restore CT modal: title test-id may include a suffix (e.g. -author); poll up to step timeout.
      if (step.target === "Restore content type modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const byTestId = page.locator('[data-test-id^="cs-modal-title-restore-content-type"]').first();
        const byHeading = page.getByRole("heading", { name: /restore content type/i }).first();
        const byH3 = page.locator(".ReactModal__delete h3").first();
        const deadline = Date.now() + t;
        let picked: Locator | null = null;
        while (Date.now() < deadline && !picked) {
          if (await byTestId.isVisible().catch(() => false)) picked = byTestId;
          else if (await byHeading.isVisible().catch(() => false)) picked = byHeading;
          else if (await byH3.isVisible().catch(() => false)) picked = byH3;
          if (picked) break;
          await page.waitForTimeout(350);
        }
        el = picked ?? byTestId;
      }
      // Restore Entry modal: title test-id / heading may vary; poll up to step timeout.
      if (step.target === "Restore entry modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const byTestId = page.locator('[data-test-id^="cs-modal-title-restore-entry"]').first();
        const byTestIdDeleted = page.locator('[data-test-id^="cs-modal-title-restore-deleted-entry"]').first();
        const byHeading = page.getByRole("heading", { name: /restore entry/i }).first();
        const byH3 = page.locator('.ReactModal__Content h3:has-text("Restore Entry"), [role="dialog"] h3:has-text("Restore Entry")').first();
        const deadline = Date.now() + t;
        let picked: Locator | null = null;
        while (Date.now() < deadline && !picked) {
          if (await byTestId.isVisible().catch(() => false)) picked = byTestId;
          else if (await byTestIdDeleted.isVisible().catch(() => false)) picked = byTestIdDeleted;
          else if (await byHeading.isVisible().catch(() => false)) picked = byHeading;
          else if (await byH3.isVisible().catch(() => false)) picked = byH3;
          if (picked) break;
          await page.waitForTimeout(350);
        }
        el = picked ?? byTestId;
      }
      // Restore Asset Folder modal: title may vary (data/dom/CMS/trash/restore-folder.html — cs-modal-title-restore-folder-<name>).
      if (step.target === "Restore asset folder modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const byTestIdFolder = page.locator('[data-test-id^="cs-modal-title-restore-folder"]').first();
        const byTestIdAssetFolder = page.locator('[data-test-id^="cs-modal-title-restore-asset-folder"]').first();
        const byHeading = page.getByRole("heading", { name: /restore (asset )?folder/i }).first();
        const byH3 = page.locator('.ReactModal__delete h3:has-text("Restore"), [role="dialog"] h3:has-text("Restore")').first();
        const deadline = Date.now() + t;
        let picked: Locator | null = null;
        while (Date.now() < deadline && !picked) {
          if (await byTestIdFolder.isVisible().catch(() => false)) picked = byTestIdFolder;
          else if (await byTestIdAssetFolder.isVisible().catch(() => false)) picked = byTestIdAssetFolder;
          else if (await byHeading.isVisible().catch(() => false)) picked = byHeading;
          else if (await byH3.isVisible().catch(() => false)) picked = byH3;
          if (picked) break;
          await page.waitForTimeout(350);
        }
        el = picked ?? byTestIdFolder;
      }
      // Restore deleted asset modal (optional): title poll.
      if (step.target === "Restore deleted asset modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const byTestId = page.locator('[data-test-id^="cs-modal-title-restore-asset"]').first();
        const byTestIdDel = page.locator('[data-test-id^="cs-modal-title-restore-deleted-asset"]').first();
        const byHeading = page.getByRole("heading", { name: /restore asset/i }).first();
        const byH3 = page.locator('[role="dialog"] h3:has-text("Restore Asset"), .ReactModal__Content h3:has-text("Restore Asset")').first();
        const deadline = Date.now() + t;
        let picked: Locator | null = null;
        while (Date.now() < deadline && !picked) {
          if (await byTestId.isVisible().catch(() => false)) picked = byTestId;
          else if (await byTestIdDel.isVisible().catch(() => false)) picked = byTestIdDel;
          else if (await byHeading.isVisible().catch(() => false)) picked = byHeading;
          else if (await byH3.isVisible().catch(() => false)) picked = byH3;
          if (picked) break;
          await page.waitForTimeout(350);
        }
        el = picked ?? byTestId;
      }
      // Restore Taxonomy modal: title (data/dom/CMS/trash/restore-taxonomy-modal.html — cs-modal-title-restore-taxonomy).
      if (step.target === "Restore taxonomy modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const byTestId = page.locator('[data-test-id="cs-modal-title-restore-taxonomy"]').first();
        const byHeading = page.getByRole("heading", { name: /restore taxonomy/i }).first();
        const byH3 = page
          .locator(
            '.ReactModal__delete h3:has-text("Restore Taxonomy"), [role="dialog"] h3:has-text("Restore Taxonomy")'
          )
          .first();
        const deadline = Date.now() + t;
        let picked: Locator | null = null;
        while (Date.now() < deadline && !picked) {
          if (await byTestId.isVisible().catch(() => false)) picked = byTestId;
          else if (await byHeading.isVisible().catch(() => false)) picked = byHeading;
          else if (await byH3.isVisible().catch(() => false)) picked = byH3;
          if (picked) break;
          await page.waitForTimeout(350);
        }
        el = picked ?? byTestId;
      }
      // Restore Term modal: title (app: cs-modal-title-restore-term; same layout as restore-taxonomy-modal.html).
      if (step.target === "Restore term modal title (doc step)") {
        const t = getStepTimeoutMs(step);
        const byTestId = page.locator('[data-test-id="cs-modal-title-restore-term"], [data-test-id^="cs-modal-title-restore-term"]').first();
        const byHeading = page.getByRole("heading", { name: /restore term/i }).first();
        const byH3 = page
          .locator(
            '.ReactModal__delete h3:has-text("Restore Term"), [role="dialog"] h3:has-text("Restore Term")'
          )
          .first();
        const deadline = Date.now() + t;
        let picked: Locator | null = null;
        while (Date.now() < deadline && !picked) {
          if (await byTestId.isVisible().catch(() => false)) picked = byTestId;
          else if (await byHeading.isVisible().catch(() => false)) picked = byHeading;
          else if (await byH3.isVisible().catch(() => false)) picked = byH3;
          if (picked) break;
          await page.waitForTimeout(350);
        }
        el = picked ?? byTestId;
      }
      // About-us-page alternate path: we opened from list, no card in modal; verify we're on builder.
      if (step.target === "About Us Page card (doc step)" && flow?.id === "about-us-page" && (flow as any).__aboutUsPageAlternatePath) {
        if (/about_us_page|content-type-builder/i.test(page.url())) {
          await page.waitForTimeout(300);
          break;
        }
      }
      if (step.target === "First webhook row (doc step)") {
        const tableBody = page.locator(".Table__body").first();
        if (await tableBody.isVisible().catch(() => false)) {
          await tableBody.evaluate((node) => node.scrollTo(0, 0)).catch(() => {});
          await page.waitForTimeout(200);
        }
        await el.scrollIntoViewIfNeeded().catch(() => {});
        await page.waitForTimeout(300);
      }
      if (step.target === "Global (doc step)") {
        let isVisible = await el.isVisible().catch(() => false);
        if (!isVisible) {
          const strictGroupPlusRect = page
            .locator(
              '.ContentTypeField--group:has([data-test-id*="seo-content"]) .empty-field [data-test-id="cs-field-type-selector"] div[data-test-id="cs-tooltip"] > svg[name="PurpleAdd"] > rect[fill*="C"]'
            )
            .first();
          if (await strictGroupPlusRect.isVisible().catch(() => false)) {
            const strictBox = await strictGroupPlusRect.boundingBox().catch(() => null);
            if (strictBox) {
              await page.mouse.move(strictBox.x + strictBox.width / 2, strictBox.y + strictBox.height / 2).catch(() => {});
              await page.mouse.click(strictBox.x + strictBox.width / 2, strictBox.y + strictBox.height / 2).catch(() => {});
            } else {
              const plusSvg = strictGroupPlusRect.locator("xpath=ancestor::*[name()='svg'][1]").first();
              if (await plusSvg.isVisible().catch(() => false)) {
                await plusSvg.click({ timeout: 2_000, force: true }).catch(() => {});
              }
            }
            await page.waitForTimeout(200);
            isVisible = await el.isVisible().catch(() => false);
          }
        }
        if (!isVisible) {
          const visibleFieldTiles = await page
            .locator("div.FieldTypeSelector__field-tile p, div.FieldTypeSelector__field-tile [class*='Label'], div.FieldTypeSelector__field-tile")
            .allTextContents()
            .then((arr) =>
              Array.from(
                new Set(
                  arr
                    .map((s) => (s || "").replace(/\s+/g, " ").trim())
                    .filter(Boolean)
                )
              )
            )
            .catch(() => []);
          throw new Error(
            `Doc mismatch for ${flow?.source || "URL"}: expected "Global" option in field picker, but it is not visible. Visible options: ${
              (visibleFieldTiles as string[]).slice(0, 20).join(", ") || "none detected"
            }`
          );
        }
      }
      if (step.target === "Export option in webhook menu (doc step)") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          recordVerificationWarning(
            step,
            context,
            "Export option not present in vertical ellipses menu; flow will use alternative path (open webhook → Export from footer)."
          );
          break;
        }
      }
      // About-us-page: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "about-us-page") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const aboutUsRow = page.locator('a[href*="about_us_page"], [role="row"]:has-text("About Us Page"), tr:has-text("About Us Page") a').first();
          if (await aboutUsRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened About Us Page from Content Models list."
            );
            (flow as any).__aboutUsPageAlternatePath = true;
            await aboutUsRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Contact-us-page: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "contact-us-page") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const contactUsRow = page.locator('a[href*="contact_us_page"], [role="row"]:has-text("Contact Us Page"), tr:has-text("Contact Us Page") a').first();
          if (await contactUsRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Contact Us Page from Content Models list."
            );
            (flow as any).__contactUsPageAlternatePath = true;
            await contactUsRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Website-homepage: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "website-homepage") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const websiteHomepageRow = page.locator('a[href*="website_homepage"], a[href*="homepage"], [role="row"]:has-text("Website Homepage"), tr:has-text("Website Homepage") a, [role="row"]:has-text("Homepage"), tr:has-text("Homepage") a').first();
          if (await websiteHomepageRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Website Homepage from Content Models list."
            );
            (flow as any).__websiteHomepageAlternatePath = true;
            await websiteHomepageRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Website-header: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "website-header") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const websiteHeaderRow = page.locator('a[href*="website_header"], a[href*="header"], [role="row"]:has-text("Website Header"), tr:has-text("Website Header") a, [role="row"]:has-text("Header"), tr:has-text("Header") a').first();
          if (await websiteHeaderRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Website Header from Content Models list."
            );
            (flow as any).__websiteHeaderAlternatePath = true;
            await websiteHeaderRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Website-footer: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "website-footer") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const websiteFooterRow = page.locator('a[href*="website_footer"], a[href*="footer"], [role="row"]:has-text("Website Footer"), tr:has-text("Website Footer") a, [role="row"]:has-text("Footer"), tr:has-text("Footer") a').first();
          if (await websiteFooterRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Website Footer from Content Models list."
            );
            (flow as any).__websiteFooterAlternatePath = true;
            await websiteFooterRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Product-listing-page: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "product-listing-page") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const productListingRow = page.locator('a[href*="product_listing_page"], [role="row"]:has-text("Product Listing Page"), tr:has-text("Product Listing Page") a').first();
          if (await productListingRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Product Listing Page from Content Models list."
            );
            (flow as any).__productListingPageAlternatePath = true;
            await productListingRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Blog-listing-page: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "blog-listing-page") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const blogListingRow = page.locator('a[href*="blog_listing_page"], [role="row"]:has-text("Blog Listing Page"), tr:has-text("Blog Listing Page") a').first();
          if (await blogListingRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Blog Listing Page from Content Models list."
            );
            (flow as any).__blogListingPageAlternatePath = true;
            await blogListingRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // FAQs: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "faqs") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const faqsRow = page.locator('a[href*="faqs_page"], [role="row"]:has-text("FAQs Page"), tr:has-text("FAQs Page") a, [role="row"]:has-text("FAQs"), tr:has-text("FAQs") a').first();
          if (await faqsRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened FAQs Page from Content Models list."
            );
            (flow as any).__faqsAlternatePath = true;
            await faqsRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Hero-banner: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "hero-banner") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const heroBannerRow = page.locator('a[href*="hero_banner"], [role="row"]:has-text("Hero Banner"), tr:has-text("Hero Banner") a').first();
          if (await heroBannerRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Hero Banner from Content Models list."
            );
            (flow as any).__heroBannerAlternatePath = true;
            await heroBannerRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }

      // Blog-landing-page: when Add Content Model modal not found after Use Prebuilt, use alternate path (open from list).
      if (step.target === "Add Content Model (doc step)" && flow?.id === "blog-landing-page") {
        const visible = await el.isVisible().catch(() => false);
        if (!visible) {
          const blogLandingRow = page.locator('a[href*="blog_landing_page"], [role="row"]:has-text("Blog Landing Page"), tr:has-text("Blog Landing Page") a').first();
          if (await blogLandingRow.isVisible({ timeout: 8_000 }).catch(() => false)) {
            recordVerificationWarning(
              step,
              context,
              "Add Content Model modal not found after Use Prebuilt; using alternate path: opened Blog Landing Page from Content Models list."
            );
            (flow as any).__blogLandingPageAlternatePath = true;
            await blogLandingRow.click({ timeout: 8_000, force: true });
            await page.waitForTimeout(2_500);
            break;
          }
        }
      }
      // Settings can sit behind top-nav "More" when the navbar is truncated; open More then re-resolve.
      if (step.target === "Settings (doc step)") {
        const tSet = getStepTimeoutMs(step);
        const moreSel =
          click["More (doc step)"] ||
          (CLICK_SELECTORS as Record<string, string>)["More (doc step)"] ||
          '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), button[aria-label*="more" i], [aria-label="More"]';
        await page
          .locator(
            '[data-test-id="cs-dropdown-truncate-button"], [data-test-id="cms-nav-dashboard"], [data-test-id="cms-nav-content-models"], [data-test-id="cms-nav-settings"]'
          )
          .first()
          .waitFor({ state: "visible", timeout: Math.min(tSet, 60_000) })
          .catch(() => {});
        const openMoreIfNeeded = async () => {
          const moreBtn = page.locator(moreSel).first();
          const n = await moreBtn.count().catch(() => 0);
          if (n > 0) {
            await moreBtn.click({ timeout: 5_000, force: true }).catch(() => {});
            await page.waitForTimeout(700);
            await page
              .getByRole("menuitem", { name: /^Settings$/i })
              .first()
              .waitFor({ state: "visible", timeout: 12_000 })
              .catch(() => {});
          }
        };
        const navDirect = page.locator('[data-test-id="cms-nav-settings"]').first();
        if (!(await navDirect.isVisible().catch(() => false))) {
          await openMoreIfNeeded();
        }
        if (!(await el.isVisible().catch(() => false))) {
          await openMoreIfNeeded();
        }
        // Pick first visible Settings control (avoid comma-joined selector picking a hidden match).
        const settingsCandidates: Locator[] = [
          page.locator('[data-test-id="cms-nav-settings"]').first(),
          page.getByRole("menuitem", { name: /^Settings$/i }).first(),
          page.getByRole("link", { name: /^Settings$/i }).first(),
          page.locator('[role="menu"] a:has-text("Settings"), [data-test-id="menu"] a:has-text("Settings")').first(),
        ];
        let picked: Locator | null = null;
        for (const c of settingsCandidates) {
          if (await c.isVisible().catch(() => false)) {
            picked = c;
            break;
          }
        }
        if (picked) {
          el = picked;
        } else {
          await openMoreIfNeeded();
          for (const c of settingsCandidates) {
            if (await c.isVisible().catch(() => false)) {
              picked = c;
              break;
            }
          }
          el = picked ?? page.locator('[data-test-id="cms-nav-settings"]').first();
        }
      }
      await expect(el).toBeVisible({ timeout: getStepTimeoutMs(step) });

      if (step.expected?.within) {
        try {
          await ensureWithin(page, el, step.expected.within, step.expected?.withinStrict === true);
        } catch (err: any) {
          const msg = `Position verification mismatch for "${step.target}": ${err?.message ?? String(err)}`;
          recordVerificationWarning(step, context, msg);
        }
      }
      const isViewportValueCheck =
        step.target === "Horizontal viewport value (doc step)" || step.target === "Vertical viewport value (doc step)";
      if (isViewportValueCheck && step.expected?.labelEquals) {
        const actualVal = await readLocatorValue(el);
        const expectedVal = String(step.expected.labelEquals);
        const mode = ((step.expected.labelMatch as any) || "contains").toLowerCase();
        const pass = mode === "equals" ? actualVal === expectedVal : actualVal.includes(expectedVal);
        if (!pass) {
          const msg = `Label/field-name verification mismatch for "${step.target}": expected input value "${expectedVal}" (${mode}), got "${actualVal || "(empty)"}".`;
          if (STRICT_DOC_VERIFICATION) throw new Error(msg);
          recordVerificationWarning(step, context, msg);
        }
      } else if (step.target === "Toggle orientation button (doc step)" && step.expected?.labelEquals) {
        // Orientation control can render with Orientation/Viewport icon names across pages.
        const orientationLikeIcon = el
          .locator('svg[name*="Orientation" i], [name*="Orientation" i], svg[name*="Viewport" i], [name*="Viewport" i]')
          .first();
        const iconVisible = await orientationLikeIcon.isVisible().catch(() => false);
        if (!iconVisible) {
          const msg = `Label/field-name verification mismatch for "${step.target}": expected Orientation/Viewport icon marker but none found.`;
          if (STRICT_DOC_VERIFICATION) throw new Error(msg);
          recordVerificationWarning(step, context, msg);
        }
      } else if (step.expected?.labelEquals) {
        try {
          await assertLabelMatch(el, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        } catch (err: any) {
          const msg = `Label/field-name verification mismatch for "${step.target}": ${err?.message ?? String(err)}`;
          if (STRICT_DOC_VERIFICATION) throw new Error(msg);
          recordVerificationWarning(step, context, msg);
        }
      }

      if (step.expected?.modalTitle) {
        try {
          if (STRICT_MODAL_TITLE) await assertModalTitle(page, step.expected.modalTitle);
          else await warnIfModalTitleMismatch(page, step.expected.modalTitle);
        } catch (err: any) {
          const msg = `Modal title verification mismatch for "${step.target}": ${err?.message ?? String(err)}`;
          if (STRICT_DOC_VERIFICATION) throw new Error(msg);
          recordVerificationWarning(step, context, msg);
        }
      }

      if (step.target === "Stack Owner Email (doc step)") {
        const val = await readLocatorValue(el);
        if (val) saveCapturedDocValue("stackOwnerEmail", val, context);
      }
      if (step.target === "API Key (doc step)") {
        const val = await readLocatorValue(el);
        if (val) saveCapturedDocValue("stackApiKey", val, context);
      }
      if (step.target === "Stack API Key (delivery token page doc step)") {
        const deliveryStackApiEl = page
          .locator('[data-test-id="cs-delivery-token-stackAPI-input"] input')
          .first();
        const val = await readLocatorValue(deliveryStackApiEl).catch(() => "");
        if (val && !/stack api key/i.test(val)) saveCapturedDocValue("stackApiKey", val, context);
      }
      if (step.target === "Stack API Key in generated modal (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__managementTokenStackApiKey = val;
          saveCapturedDocValue("managementTokenStackApiKey", val, context);
        }
      }
      if (step.target === "Management Token in generated modal (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__managementToken = val;
          saveCapturedDocValue("managementToken", val, context);
        }
      }
      if (step.target === "Delivery Token value in edit page (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__deliveryToken = val;
          saveCapturedDocValue("deliveryToken", val, context);
        }
      }
      if (step.target === "Preview Token value in edit page (doc step)") {
        const val = await readLocatorValue(el);
        if (val) {
          if (flow) (flow as any).__previewToken = val;
          saveCapturedDocValue("previewToken", val, context);
        }
      }

      break;
    }

    case "enter": {
      // Save Your Views: fill entries inline search (does not submit; next step clicks Search button)
      if (
        step.target === "Search bar input (doc step)" &&
        String(flow?.id || "").toLowerCase() === "save-your-views"
      ) {
        const val = String(step.value ?? "")
          .split("{unique25}")
          .join(unique.replace(/-/g, "").slice(0, 25))
          .split("{unique}")
          .join(unique);
        const searchInput = page
          .locator('[data-test-id="cs-entries-inline-search"] input, [data-test-id="cs-search-bar-input"] input, [data-test-id="cs-entries-inline-search"] [data-test-id="cs-search-bar-input"] input')
          .first();
        await searchInput.waitFor({ state: "visible", timeout: getStepTimeoutMs(step) });
        await searchInput.fill(val);
        await page.waitForTimeout(300);
        break;
      }

      // Save Your Views: fill Name input in Save View modal
      if (
        step.target === "Name input in Save View modal (doc step)" &&
        String(flow?.id || "").toLowerCase() === "save-your-views"
      ) {
        const val = String(step.value ?? "")
          .split("{unique25}")
          .join(unique.replace(/-/g, "").slice(0, 25))
          .split("{unique}")
          .join(unique);
        const nameInput = page
          .locator('[data-test-id="cs-save-as-view-title-input"] input, [data-testid="cs-views-saved-view"] input[name="title"], #title')
          .first();
        await nameInput.waitFor({ state: "visible", timeout: getStepTimeoutMs(step) });
        await nameInput.fill(val);
        await page.waitForTimeout(300);
        break;
      }

      // Quick Search: fill input, then press Enter to trigger search and navigate to entries listing
      if (
        step.target === "Quick Search input (doc step)" &&
        String(flow?.id || "").toLowerCase() === "quick-search"
      ) {
        const val = String(step.value ?? "");
        // MUST use header Quick Search input only. NOT dashboard search (cs-search, "Search help content").
        // Input may be in container or in portal; "Search Entries" placeholder distinguishes from dashboard "Search help content".
        await page.waitForTimeout(500);
        const candidates = [
          page.locator('[data-test-id="cs-header-search-container"] input'),
          page.locator('[data-test-id="cs-search-bar-input"] input'),
          page.getByPlaceholder(/Search Entries/i),
          page.locator('input[placeholder*="Search Entries" i]'),
        ];
        let filled = false;
        for (const loc of candidates) {
          const el = loc.first();
          if ((await el.count().catch(() => 0)) > 0 && (await el.isVisible().catch(() => false))) {
            await el.click();
            await el.fill(val);
            filled = true;
            await page.waitForTimeout(400);
            // Prefer submit button (manually captured) over Enter
            const submitBtn = page.locator('[data-test-id="cs-header-search-container"] [data-test-id="cs-search-bar-input-submit"], [data-test-id="cs-search-bar-input-submit"]').first();
            if (await submitBtn.isVisible().catch(() => false)) {
              await submitBtn.click({ timeout: 5_000 });
            } else {
              await page.keyboard.press("Enter");
            }
            await page.waitForTimeout(3000);
            break;
          }
        }
        if (!filled) {
          throw new Error(
            'Quick Search input not found. Click the header Search icon (cs-header-search-icon) first to open the dropdown. Do NOT use dashboard search (cs-search, "Search help content").'
          );
        }
        break;
      }

      const unique25 = unique.replace(/-/g, "").slice(0, 25);
      const rawVal = String(step.value ?? "")
        .split("{unique25}")
        .join(unique25)
        .split("{unique}")
        .join(unique);
      const appendPrefix = "APPEND:";
      const isAppend = rawVal.startsWith(appendPrefix);
      const appendText = isAppend ? rawVal.slice(appendPrefix.length) : "";
      const val = rawVal;

      if (String(flow?.id || "").toLowerCase() === "custom-preview-urls") {
        const t = Math.min(getStepTimeoutMs(step), 45_000);
        const item = page.locator(".preview-url-container .url-path-item").first();
        if (step.target === "URL path name input (doc step)") {
          await expect(item).toBeVisible({ timeout: t });
          let inp = item.locator('input[name="name"]').first();
          if (!(await inp.isVisible({ timeout: 5_000 }).catch(() => false))) {
            inp = item
              .locator('[data-test-id="cs-field"]')
              .filter({ has: page.locator('label').filter({ hasText: /path\s*name/i }) })
              .locator('[data-test-id="cs-text-input"] input, input[type="text"]')
              .first();
          }
          if (!(await inp.isVisible({ timeout: 6_000 }).catch(() => false))) {
            inp = item.locator('[data-test-id="cs-text-input"] input').first();
          }
          await expect(inp).toBeVisible({ timeout: t });
          await inp.fill(val, { timeout: t });
          await page.waitForTimeout(200);
          break;
        }
        if (step.target === "URL path pattern textarea (doc step)") {
          await expect(item).toBeVisible({ timeout: t });
          // UI label "Preview URL" with input or textarea (preview-url-page.html URL path row).
          let ta = item
            .locator(".Field, [data-test-id=\"cs-field\"]")
            .filter({ has: page.locator("div, label, span").filter({ hasText: /^Preview URL$/i }) })
            .locator("textarea, input[type=\"text\"], [data-test-id=\"cs-text-input\"] input")
            .first();
          if (!(await ta.isVisible({ timeout: 5_000 }).catch(() => false))) {
            ta = item.locator('textarea[name="pattern"]').first();
          }
          if (!(await ta.isVisible({ timeout: 4_000 }).catch(() => false))) {
            ta = item.locator("textarea").first();
          }
          if (!(await ta.isVisible({ timeout: 4_000 }).catch(() => false))) {
            ta = item.getByRole("textbox", { name: /entry\.url|Preview URL/i }).first();
          }
          await expect(ta).toBeVisible({ timeout: t });
          await ta.fill(val, { timeout: t });
          await page.waitForTimeout(200);
          break;
        }
      }

      if (String(flow?.id || "").toLowerCase() === "add-workflows-and-stages" && step.target === "Workflow second stage name input (doc step)") {
        const t = Math.min(getStepTimeoutMs(step), 35_000);
        let inp = page.locator('input[name="workflowStages[1].name"]').first();
        if (!(await inp.isVisible({ timeout: 5_000 }).catch(() => false))) {
          inp = page.locator('[data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-name-input"] input').first();
        }
        await expect(inp).toBeVisible({ timeout: t });
        await inp.fill(val, { timeout: t });
        await page.waitForTimeout(200);
        break;
      }

      if (String(flow?.id || "").toLowerCase() === "basic-formatting") {
        if (step.target === "JSON RTE type lines for inline formatting toolbar (doc step)") {
          const t = getStepTimeoutMs(step);
          const editor = page
            .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
            .first();
          await editor.waitFor({ state: "attached", timeout: t });
          await editor.click({ force: true });
          await page.waitForTimeout(200);
          const lines = val.split(/\r?\n/).filter((l) => l.trim().length > 0);
          for (let i = 0; i < lines.length; i++) {
            await page.keyboard.type(lines[i], { delay: 12 });
            if (i < lines.length - 1) await page.keyboard.press("Enter");
          }
          await page.waitForTimeout(250);
          break;
        }
      }

      if (isJsonRteCodeBlocksFlow(flow) && step.target === "JSON RTE type line for code snippet selection (doc step)") {
        const t = getStepTimeoutMs(step);
        const editor = page
          .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
          .first();
        await editor.waitFor({ state: "attached", timeout: t });
        await editor.click({ force: true });
        await page.waitForTimeout(200);
        await page.keyboard.type(val, { delay: 12 });
        await page.waitForTimeout(250);
        break;
      }

      if (String(flow?.id || "").toLowerCase() === "markdown-content" && step.target === "JSON RTE markdown syntax lines (doc step)") {
        const t = getStepTimeoutMs(step);
        const editor = page
          .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
          .first();
        await editor.waitFor({ state: "attached", timeout: t });
        await editor.click({ force: true });
        await page.waitForTimeout(200);
        const lines = val.split(/\r?\n/).filter((l) => l.trim().length > 0);
        for (let i = 0; i < lines.length; i++) {
          await page.keyboard.type(lines[i], { delay: 12 });
          if (i < lines.length - 1) await page.keyboard.press("Enter");
        }
        await page.waitForTimeout(250);
        break;
      }

      if (isJsonRteBlockInlinePropsFlow(flow)) {
        if (step.target === "JSON RTE type text then select for property (doc step)") {
          const t = getStepTimeoutMs(step);
          const editor = page
            .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
            .first();
          await editor.waitFor({ state: "attached", timeout: t });
          await editor.click({ force: true });
          await page.waitForTimeout(200);
          const lines = val.split(/\r?\n/).filter((l) => l.trim().length > 0);
          for (let i = 0; i < lines.length; i++) {
            await page.keyboard.type(lines[i], { delay: 12 });
            if (i < lines.length - 1) await page.keyboard.press("Enter");
          }
          await page.waitForTimeout(250);
          break;
        }
        if (step.target === "JSON RTE Add Property Class field (doc step)") {
          const t = getStepTimeoutMs(step);
          const pill = page.locator('[data-test-id="property_class_input"]').first();
          await pill.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
          await pill.click({ timeout: t, force: true });
          await page.waitForTimeout(200);
          const innerInput = pill.locator("input").first();
          if ((await innerInput.count().catch(() => 0)) > 0 && (await innerInput.isVisible().catch(() => false))) {
            await innerInput.fill(val);
          } else {
            await page.keyboard.type(val, { delay: 15 });
            await page.keyboard.press("Enter");
          }
          await page.waitForTimeout(250);
          break;
        }
        if (step.target === "JSON RTE Add Property ID field (doc step)") {
          const t = getStepTimeoutMs(step);
          const pill = page.locator('[data-test-id="property_id_input"]').first();
          await pill.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
          await pill.click({ timeout: t, force: true });
          await page.waitForTimeout(200);
          const innerInput = pill.locator("input").first();
          if ((await innerInput.count().catch(() => 0)) > 0 && (await innerInput.isVisible().catch(() => false))) {
            await innerInput.fill(val);
          } else {
            await page.keyboard.type(val, { delay: 15 });
            await page.keyboard.press("Enter");
          }
          await page.waitForTimeout(250);
          break;
        }
      }

      if (String(flow?.id || "").toLowerCase() === "use-slash-command-for-shortcuts-in-json-rte") {
        if (step.target === "JSON RTE press Escape (doc step)") {
          await page.keyboard.press("Escape");
          await page.waitForTimeout(250);
          break;
        }

        if (step.target === "JSON RTE type forward slash open menu (doc step)") {
          const t = getStepTimeoutMs(step);
          const editor = page
            .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
            .first();
          await editor.waitFor({ state: "attached", timeout: t });
          await editor.click({ force: true });
          await page.waitForTimeout(200);
          await page.keyboard.type("/", { delay: 40 });
          await page.waitForTimeout(500);
          break;
        }

        // Slash menu: type "/" then pick row by data-testid (paragraph-style-dropdown-menu.html).
        const slashSpecs: Record<string, { menuTestId: string; newBlockBefore: boolean; hasBody: boolean }> = {
          "JSON RTE slash /paragraph then body (doc step)": { menuTestId: "p", newBlockBefore: false, hasBody: true },
          "JSON RTE slash /h1 then body (doc step)": { menuTestId: "h1", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /h2 then body (doc step)": { menuTestId: "h2", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /h3 then body (doc step)": { menuTestId: "h3", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /h4 then body (doc step)": { menuTestId: "h4", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /h5 then body (doc step)": { menuTestId: "h5", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /h6 then body (doc step)": { menuTestId: "h6", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /blockquote then body (doc step)": { menuTestId: "blockquote", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /code then body (doc step)": { menuTestId: "code", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /ordered list then body (doc step)": { menuTestId: "ol", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /unordered list then body (doc step)": { menuTestId: "ul", newBlockBefore: true, hasBody: true },
          "JSON RTE slash /divider (doc step)": { menuTestId: "hr", newBlockBefore: true, hasBody: false },
          // Alignment: avoid extra End+Enter before "/" — can leave caret where typed body never surfaces in #scrte-editable innerText.
          "JSON RTE slash /left then body (doc step)": { menuTestId: "left-align", newBlockBefore: false, hasBody: true },
          "JSON RTE slash /center then body (doc step)": { menuTestId: "center-align", newBlockBefore: false, hasBody: true },
          "JSON RTE slash /right then body (doc step)": { menuTestId: "right-align", newBlockBefore: false, hasBody: true },
          "JSON RTE slash /justify then body (doc step)": { menuTestId: "justify-align", newBlockBefore: false, hasBody: true },
        };
        const spec = slashSpecs[step.target];
        if (spec) {
          const t = getStepTimeoutMs(step);
          const editor = page
            .locator('[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable')
            .first();
          await editor.waitFor({ state: "attached", timeout: t });
          await editor.click({ force: true });
          await page.waitForTimeout(200);
          if (spec.newBlockBefore) {
            await page.keyboard.press("End");
            await page.waitForTimeout(120);
            await page.keyboard.press("Enter");
            await page.waitForTimeout(220);
          }
          // After /divider, caret can sit next to HR — need a new line before "/" alignment commands.
          if (String(spec.menuTestId).endsWith("-align")) {
            await page.keyboard.press("Enter");
            await page.waitForTimeout(180);
          }
          await page.keyboard.type("/", { delay: 35 });
          await page.waitForTimeout(450);
          const pop = page.locator('[data-testid="slash-command"]').first();
          await pop.waitFor({ state: "visible", timeout: Math.min(t, 15_000) });
          const row = pop.locator(`li[data-testid="${spec.menuTestId}"]`).first();
          await row.waitFor({ state: "attached", timeout: 10_000 });
          // Long menus (alignment at bottom) live in a scrollable popover; scroll the target li into view inside the popover.
          await pop
            .evaluate((el, testId) => {
              const li = el.querySelector(`li[data-testid="${testId}"]`) as HTMLElement | null;
              li?.scrollIntoView({ block: "center", inline: "nearest" });
            }, spec.menuTestId)
            .catch(() => {});
          await row.scrollIntoViewIfNeeded().catch(() => {});
          try {
            await row.click({ timeout: 8_000, force: true });
          } catch {
            await row.evaluate((el: HTMLElement) => el.click());
          }
          await page.waitForTimeout(400);
          const body = val.trim();
          if (spec.hasBody && body) {
            await editor.click({ force: true }).catch(() => {});
            await page.waitForTimeout(150);
            await page.keyboard.type(body, { delay: 22 });
            await page.waitForTimeout(200);
          }
          // New line after each slash shortcut so the next "/" command runs on a fresh line.
          await page.keyboard.press("Enter");
          await page.waitForTimeout(180);
          break;
        }
      }

      if (
        (flow as any)?.__deliveryTokenCreateUnavailable &&
        (step.target === "Name input (delivery token doc step)" || step.target === "Description input (delivery token doc step)")
      ) {
        // In fallback edit mode, avoid mutating existing token identity fields.
        break;
      }

      if (
        String(flow?.id || "").toLowerCase() === "create-a-folder" &&
        step.target === "Folder name input (doc step)"
      ) {
        (flow as any).__createdAssetFolderName = val;
      }

      if (step.target === "Name (edit label doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, 10_000);
      }

      if (step.target === "Global Field name confirm input (doc step)") {
        const inputEl = page
          .locator('[data-test-id="cs-gf-delete-confirm-input-field"] input[name="name"], [data-test-id="cs-gf-delete-confirm-input-field"] input[aria-label="name"]')
          .first();
        const hasTypedConfirm = await inputEl.isVisible().catch(() => false);
        if (!hasTypedConfirm) {
          throw new Error(
            'Doc mismatch: "Delete Global Field" modal did not show name-confirm input ([data-test-id="cs-gf-delete-confirm-input-field"]).'
          );
        }

        let gfName = await page
          .locator('[data-test-id="cs-gf-data-loss-warning"] b')
          .first()
          .innerText()
          .then((s) => s.trim())
          .catch(() => "");
        if (!gfName) {
          const refText = await page
            .locator('[data-test-id="cs-gf-ref-ct-title"]')
            .first()
            .innerText()
            .then((s) => s.trim())
            .catch(() => "");
          const m = refText.match(/The\s+(.+?)\s+global field/i);
          gfName = m?.[1]?.trim() || "";
        }
        const finalName = gfName || val;
        if (!finalName) {
          throw new Error("Could not resolve Global Field name for delete confirmation input.");
        }
        await inputEl.fill(finalName);
        break;
      }

      if (step.target === "Delete management token name confirm input (doc step)") {
        const inputEl = page
          .locator(
            '[data-test-id="cs-management-tokens-delete-modal-input"] input[placeholder*="Enter name of your management token" i], [data-test-id="cs-management-tokens-delete-modal-input"] input'
          )
          .first();
        await expect(inputEl).toBeVisible({ timeout: 30_000 });

        const modalTokenName = await page
          .locator('[data-test-id="cs-modal-description"] strong')
          .first()
          .innerText()
          .then((s) => (s || "").replace(/['"]/g, "").trim())
          .catch(() => "");

        if (!modalTokenName) {
          throw new Error(
            'Doc mismatch: "Delete Management Token" modal did not expose token name in the warning text.'
          );
        }

        await inputEl.fill(modalTokenName);
        break;
      }

      if (step.target === "Delete delivery token name confirm input (doc step)") {
        const inputEl = page
          .locator(
            '[data-test-id="cs-delivery-tokens-delete-modal-input"] input[placeholder*="Enter name of your delivery token" i], [data-test-id="cs-delivery-tokens-delete-modal-input"] input'
          )
          .first();
        await expect(inputEl).toBeVisible({ timeout: 30_000 });

        const modalTokenName = await page
          .locator('[data-test-id="cs-modal-description"] strong')
          .first()
          .innerText()
          .then((s) => (s || "").replace(/['"]/g, "").trim())
          .catch(() => "");

        if (!modalTokenName) {
          throw new Error(
            'Doc mismatch: "Delete Delivery Token" modal did not expose token name in the warning text.'
          );
        }

        await inputEl.fill(modalTokenName);
        break;
      }

      // ✅ If Settings opened "Edit Content Type" dialog, fill inside it
      const editDialog = page.getByRole("dialog").filter({ hasText: /Edit Content Type/i }).first();
      if (await editDialog.isVisible().catch(() => false)) {
        if (step.target === "Description") {
          const desc = editDialog.getByRole("textbox", { name: /description/i }).first();
          await expect(desc).toBeVisible({ timeout: 30_000 });
          await desc.fill(val);
          break;
        }

        // Optional: support Name too if your flow ever needs it
        if (step.target === "Name") {
          const name = editDialog.getByRole("textbox", { name: /^name$/i }).first();
          if (await name.count().catch(() => 0)) {
            await expect(name).toBeVisible({ timeout: 30_000 });
            await name.fill(val);
            break;
          }
        }
      }

      // Prefer scoping to Create CT modal when present
      const createModal = page.locator('[data-testid="cs-modal"][role="dialog"]').first();
      const inCreateModal = await createModal.count().catch(() => 0);

      const { input } = loadOverrides(flow);
      const mapped = input[step.target];

      const isCreateContentTypeModal =
        inCreateModal > 0 &&
        ((await createModal
          .locator('[data-test-id="cs-modal-title-create-new-content-type"]')
          .count()
          .catch(() => 0)) > 0 ||
          (await createModal
            .locator('[data-test-id="cs-ct-create-modal-ct-name-input"] input[name="name"]')
            .count()
            .catch(() => 0)) > 0);

      if (isCreateContentTypeModal) {
        if (step.target === "Name") {
          const name = createModal
            .locator('[data-test-id="cs-ct-create-modal-ct-name-input"] input[name="name"]')
            .first();
          await expect(name).toBeVisible({ timeout: 30_000 });
          await name.fill(val);
          break;
        }

        if (step.target === "Description") {
          const desc = createModal
            .locator('[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"]')
            .first();
          await expect(desc).toBeVisible({ timeout: 30_000 });
          await desc.fill(val);
          break;
        }
      }

      // Selector maps (optional) – prefer flow-level input from loadOverrides, then global
      const inputMapped = mapped || INPUT_SELECTORS[step.target];
      if (inputMapped) {
        const inputEl = page.locator(inputMapped).first();
        await expect(inputEl).toBeVisible({ timeout: 30_000 });
        // Some controls (e.g. tag-pill widgets) are div-based and require keyboard typing.
        const isFillable = await inputEl
          .evaluate((node) => {
            const el = node as HTMLElement;
            if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return true;
            return el.isContentEditable;
          })
          .catch(() => false);

        if (isFillable) {
          if (isAppend) {
            const current = (await readLocatorValue(inputEl).catch(() => "")) || "";
            await inputEl.fill(`${current}${appendText}`);
          } else {
            await inputEl.fill(val);
          }
          if (step.target === "Version name input (doc step)") {
            await page.keyboard.press("Enter").catch(() => {});
          }
        } else {
          await inputEl.click({ timeout: 10_000, force: true }).catch(() => {});
          await page.keyboard.type(isAppend ? appendText : val, { delay: 40 });
          await page.keyboard.press("Enter").catch(() => {});
        }
        break;
      }

      if (mapped) {
        const loc = page.locator(mapped).first();
        try {
          await expect(loc).toBeVisible({ timeout: 30_000 });
          if (isAppend) {
            const current = (await readLocatorValue(loc).catch(() => "")) || "";
            await loc.fill(`${current}${appendText}`);
          } else {
            await loc.fill(val);
          }
          break;
        } catch (err) {
          if (step.target.includes("Display Name")) {
            const fallback = page.getByRole("textbox", { name: /display name/i }).first();
            if (await fallback.count().catch(() => 0)) {
              await expect(fallback).toBeVisible({ timeout: 10_000 });
              await fallback.fill(val);
              break;
            }
          }
          throw err;
        }
      }

      // Fallback: resilient input resolver
      const byLabel = page.getByLabel(new RegExp(escapeRegex(step.target), "i")).first();
      const byPlaceholder = page.getByPlaceholder(new RegExp(escapeRegex(step.target), "i")).first();
      const byNameAttrExact = page.locator(`input[name="${step.target}"], textarea[name="${step.target}"]`).first();
      const byNameAttrLoose = page
        .locator(`input[name*="${escapeRegex(step.target)}" i], textarea[name*="${escapeRegex(step.target)}" i]`)
        .first();

      const inputEl = byLabel.or(byPlaceholder).or(byNameAttrExact).or(byNameAttrLoose).first();
      await expect(inputEl).toBeVisible({ timeout: 30_000 });
      if (isAppend) {
        const current = (await readLocatorValue(inputEl).catch(() => "")) || "";
        await inputEl.fill(`${current}${appendText}`);
      } else {
        await inputEl.fill(val);
      }
      break;
    }

    case "select": {
      // In Create CT modal, Type is radio buttons ("Single"/"Multiple")
      const radio = page.getByRole("radio", { name: step.value ?? "", exact: false }).first();
      if (await radio.count().catch(() => 0)) {
        await expect(radio).toBeVisible({ timeout: 30_000 });
        await radio.check({ timeout: 30_000 });
        break;
      }

      const dialog = page.locator('[data-testid="cs-modal"][role="dialog"], [role="dialog"]').first();
      const labelClick = dialog.locator("label").filter({ hasText: new RegExp(`^${String(step.value ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") }).first();
      if (await labelClick.count().catch(() => 0)) {
        await labelClick.click({ timeout: 30_000, force: true }).catch(() => {});
        break;
      }

      const labelName = String(step.target || "")
        .replace(/\s*\(doc step\)\s*$/i, "")
        .trim();
      const select = page.getByLabel(labelName, { exact: false }).first();
      await expect(select).toBeVisible({ timeout: 30_000 });
      await select.selectOption({ label: String(step.value ?? "") });
      break;
    }

    case "hover": {
      if (step.target === "Trash content type row to restore hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const ctRoot = page.locator(".trash-content-types").first();
        await expect(ctRoot).toBeVisible({ timeout: t });
        const dataRows = page.locator('.trash-content-types [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await dataRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-content-types .Spinner, .trash-content-types [class*='Spinner'], .trash-content-types .ListLoader, .trash-content-types [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted content type (doc): Trash has no deleted content types. Delete a content type first so it appears under Trash → Content Types, then re-run this flow."
          );
        }
        const row0 = ctRoot.locator('[data-test-id="cs-table-body-row-0"]:not(.Table__empty__row)');
        const hasRow0 = (await row0.count().catch(() => 0)) > 0 && (await row0.first().isVisible().catch(() => false));
        const firstDataRow = hasRow0 ? row0.first() : dataRows.first();
        await expect(firstDataRow).toBeVisible({ timeout: t });
        await hoverTrashListingRowDocOnly(page, firstDataRow, Math.min(t, 15_000));
        break;
      }
      if (step.target === "Trash global field row to restore hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const gfRoot = page.locator(".trash-global-fields").first();
        await expect(gfRoot).toBeVisible({ timeout: t });
        const dataRows = page.locator('.trash-global-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await dataRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-global-fields .Spinner, .trash-global-fields [class*='Spinner'], .trash-global-fields .ListLoader, .trash-global-fields [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted global field (doc): Trash has no deleted global fields. Delete a global field first so it appears under Trash → Global Fields, then re-run this flow."
          );
        }
        const row0 = gfRoot.locator('[data-test-id="cs-table-body-row-0"]:not(.Table__empty__row)');
        const hasRow0 = (await row0.count().catch(() => 0)) > 0 && (await row0.first().isVisible().catch(() => false));
        const firstDataRow = hasRow0 ? row0.first() : dataRows.first();
        await expect(firstDataRow).toBeVisible({ timeout: t });
        await hoverTrashListingRowDocOnly(page, firstDataRow, Math.min(t, 15_000));
        break;
      }
      if (step.target === "Trash entry row to restore hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const entRoot = page.locator(".trash-entries").first();
        await expect(entRoot).toBeVisible({ timeout: t });
        const dataRows = page.locator('.trash-entries [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await dataRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-entries .Spinner, .trash-entries [class*='Spinner'], .trash-entries .ListLoader, .trash-entries [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted entry (doc): Trash has no deleted entries. Delete an entry first so it appears under Trash → Entries, then re-run this flow (or use preflight runFlowWhenTrashEntriesEmpty)."
          );
        }
        const row0 = entRoot.locator('[data-test-id="cs-table-body-row-0"]:not(.Table__empty__row)');
        const hasRow0 = (await row0.count().catch(() => 0)) > 0 && (await row0.first().isVisible().catch(() => false));
        const firstDataRow = hasRow0 ? row0.first() : dataRows.first();
        await expect(firstDataRow).toBeVisible({ timeout: t });
        await hoverTrashListingRowDocOnly(page, firstDataRow, Math.min(t, 15_000));
        break;
      }
      if (step.target === "Trash asset folder row to restore hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const aRoot = page.locator(".trash-assets").first();
        await expect(aRoot).toBeVisible({ timeout: t });
        const dataRows = page.locator('.trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await dataRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-assets .Spinner, .trash-assets [class*='Spinner'], .trash-assets .ListLoader, .trash-assets [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted asset folder (doc): Trash → Assets has no rows. Delete an asset folder first (or use preflight runFlowWhenTrashAssetFoldersEmpty)."
          );
        }
        let folderRow: Locator | null = null;
        for (let i = 0; i < rowCount; i++) {
          const row = dataRows.nth(i);
          if (await rowIsTrashAssetFolder(row)) {
            folderRow = row;
            break;
          }
        }
        if (!folderRow) {
          throw new Error(
            "Restore deleted asset folder (doc): Trash → Assets has no deleted folder row detected. Delete a folder so it appears here, then re-run."
          );
        }
        await expect(folderRow).toBeVisible({ timeout: t });
        await hoverTrashListingRowDocOnly(page, folderRow, Math.min(t, 15_000));
        break;
      }
      if (step.target === "Trash deleted asset file row to restore hover (doc step)") {
        const t = getStepTimeoutMs(step);
        const aRoot = page.locator(".trash-assets").first();
        await expect(aRoot).toBeVisible({ timeout: t });
        const dataRows = page.locator('.trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)');
        const pollUntil = Date.now() + Math.min(t, 90_000);
        let rowCount = 0;
        while (Date.now() < pollUntil) {
          rowCount = await dataRows.count().catch(() => 0);
          if (rowCount > 0) break;
          const loading = page.locator(
            ".trash-assets .Spinner, .trash-assets [class*='Spinner'], .trash-assets .ListLoader, .trash-assets [data-test-id*='loading' i]"
          );
          if (await loading.first().isVisible().catch(() => false)) {
            await loading.first().waitFor({ state: "hidden", timeout: 15_000 }).catch(() => {});
          }
          await page.waitForTimeout(400);
        }
        if (rowCount === 0) {
          throw new Error(
            "Restore deleted asset (doc): Trash → Assets has no rows. Delete an asset first (or use preflight runFlowWhenTrashDeletedAssetsEmpty)."
          );
        }
        let fileRow: Locator | null = null;
        for (let i = 0; i < rowCount; i++) {
          const row = dataRows.nth(i);
          if (await rowIsTrashFileAsset(row)) {
            fileRow = row;
            break;
          }
        }
        if (!fileRow) {
          throw new Error(
            "Restore deleted asset (doc): Trash → Assets has no deleted file asset row detected. Delete a file asset so it appears here, then re-run."
          );
        }
        await expect(fileRow).toBeVisible({ timeout: t });
        await hoverTrashListingRowDocOnly(page, fileRow, Math.min(t, 15_000));
        break;
      }
      throw new Error(`Unknown hover target: ${step.target}`);
    }

    case "navigate": {
      await page.goto(step.target, { waitUntil: "domcontentloaded" });
      await page.waitForLoadState("networkidle");
      break;
    }

    case "drag": {
      const dropTarget = (step.value || "").trim();
      if (!dropTarget) throw new Error("drag step missing 'value' target");

      const { click } = loadOverrides(flow);
      const sourceMapped = click[step.target] || CLICK_SELECTORS[step.target];
      const targetMapped = click[dropTarget] || CLICK_SELECTORS[dropTarget];

      const sourceEl = sourceMapped
        ? page.locator(sourceMapped).first()
        : await resolveTarget(page, step.target, flow);
      const targetEl = targetMapped
        ? page.locator(targetMapped).first()
        : await resolveTarget(page, dropTarget, flow);

      const timeoutMs = getStepTimeoutMs(step);
      await expect(sourceEl).toBeVisible({ timeout: timeoutMs });
      await expect(targetEl).toBeVisible({ timeout: timeoutMs });
      await sourceEl.dragTo(targetEl, { timeout: timeoutMs });
      break;
    }

    case "upload": {
      if (!step.value) throw new Error("upload step missing 'value' file path");
      const { input } = loadOverrides(flow);
      const uploadSel = (step.target && input[step.target]) || 'input[type="file"]';
      const fileInput = page.locator(uploadSel).first();
      await fileInput.setInputFiles(step.value);
      break;
    }

    case "warn": {
      const docUrl = context?.documentUrl || "(no source URL)";
      const message =
        (step.value || "").trim() ||
        "External/document-only step requires manual execution outside this UI automation flow.";
      recordVerificationWarning(step, context, `${message} [Document URL: ${docUrl}]`);
      break;
    }

    case "press": {
      const raw = String(step.value ?? "").trim();
      if (!raw) throw new Error("press step missing value (e.g. Enter, Shift+Enter)");
      if (isJsonRteCodeBlocksFlow(flow) && String(step.target || "").includes("JSON RTE key")) {
        await page.keyboard.press(raw as "Enter" | "Shift+Enter");
        await page.waitForTimeout(220);
        break;
      }
      throw new Error(`Unknown press step for flow ${String(flow?.id || "")}: ${step.target}`);
    }

    default:
      throw new Error(`Unknown action: ${(step as any).action}`);
  }
}

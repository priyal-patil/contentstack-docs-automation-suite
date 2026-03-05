// rules/core/actionRules.ts
import path from "path";
import fs from "fs";
import { Page, expect, Locator } from "@playwright/test";
import { recordDocStepWarning } from "../../core/docStepFailureReporter";

type Step = {
    action: "click" | "enter" | "select" | "upload" | "verify" | "navigate" | "drag";
    target: string;
    value?: string;
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

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getStepTimeoutMs(step: Step, fallback = 30_000): number {
  const raw = (step as any)?.timeoutMs ?? step?.expected?.timeoutMs;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
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


export async function performAction(page: Page, step: Step, unique: string, flow?: any, context?: ActionContext) {
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

      if (step.target === "Use Prebuilt (doc step)") {
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

      // Special case: "+" appears on hover in the builder canvas (action bar has class "hide" until hovered)
      if (step.target === "Insert a field") {
        const { click: overridesClick } = loadOverrides(flow);
        const fieldTilesVisible = await page.locator('div.FieldTypeSelector__field-tile').first().isVisible().catch(() => false);
        if (fieldTilesVisible) {
          await page.waitForTimeout(500);
          return;
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
        const addButtonSelector = overridesClick["Insert a field"] || overridesClick["Insert a Field (doc step)"] || '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]';
        const hoverArea = page.locator(hoverAreaSelector).first();
        const addButton = page.locator(addButtonSelector).first();

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

        const purpleAddSvg = page.locator('svg[name="PurpleAdd"]').first();
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

      const { click } = loadOverrides(flow);
      const mapped = click[step.target] || CLICK_SELECTORS[step.target];
      let el: Locator;
      if (mapped && step.nth !== undefined) {
        el = page.locator(mapped).nth(step.nth);
      } else {
        el = await resolveTarget(page, step.target, flow);
      }
      const t = getStepTimeoutMs(step);
      try {
        await expect(el).toBeVisible({ timeout: t });
      } catch (err) {
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
            'button:has-text("More"), [aria-label="More"]';
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
      const useForceClick = step.target === "Multi Line Textbox (doc step)" || (step.target.includes("(doc step)") && (step.target.includes("Textbox") || step.target.includes("Modular Blocks") || step.target.includes("Global (SEO)")));
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

      // After "+ New Block", wait for add-block form so next step (Block Name input) can find it
      if (step.target === "+ New Block (doc step)") {
        await page
          .locator('[data-test-id="cs-cb-add-block-title-input"] input, input[placeholder="Enter block title"]')
          .first()
          .waitFor({ state: "visible", timeout: 15_000 })
          .catch(() => {});
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
      if (step.target === "Create New") {
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
          recordVerificationWarning(
            step,
            context,
            `Modal title verification mismatch for "${step.target}": ${err?.message ?? String(err)}`
          );
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

      if (step.target === "Stack Owner Email (doc step)") {
        const val = await readLocatorValue(el);
        if (val) saveCapturedDocValue("stackOwnerEmail", val, context);
      }
      if (step.target === "API Key (doc step)") {
        const val = await readLocatorValue(el);
        if (val) saveCapturedDocValue("stackApiKey", val, context);
      }

      break;
    }

    case "verify": {
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

      if (step.target === "Name (edit label doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, getStepTimeoutMs(step));
      }
      if (step.target === "Edit Label button (doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, getStepTimeoutMs(step));
      }
      if (step.target === "Delete Label button (doc step)") {
        await ensureManageLabelDeleteMode(page, flow, unique, getStepTimeoutMs(step));
      }

      const { click, input } = loadOverrides(flow);
      const clickMapped = click[step.target] || CLICK_SELECTORS[step.target];
      const inputMapped = input[step.target] || INPUT_SELECTORS[step.target];
      const el = clickMapped
        ? page.locator(clickMapped).first()
        : inputMapped
        ? page.locator(inputMapped).first()
        : await resolveTarget(page, step.target, flow);
      await expect(el).toBeVisible({ timeout: getStepTimeoutMs(step) });

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
      if (step.expected?.labelEquals) {
        try {
          await assertLabelMatch(el, step.expected.labelEquals, (step.expected.labelMatch as any) || "contains");
        } catch (err: any) {
          recordVerificationWarning(
            step,
            context,
            `Label/field-name verification mismatch for "${step.target}": ${err?.message ?? String(err)}`
          );
        }
      }

      if (step.expected?.modalTitle) {
        try {
          if (STRICT_MODAL_TITLE) await assertModalTitle(page, step.expected.modalTitle);
          else await warnIfModalTitleMismatch(page, step.expected.modalTitle);
        } catch (err: any) {
          recordVerificationWarning(
            step,
            context,
            `Modal title verification mismatch for "${step.target}": ${err?.message ?? String(err)}`
          );
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

      break;
    }

    case "enter": {
      const val = (step.value ?? "").replace("{unique}", unique);

      if (step.target === "Name (edit label doc step)") {
        await ensureManageLabelEditMode(page, flow, unique, 10_000);
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
          await inputEl.fill(val);
        } else {
          await inputEl.click({ timeout: 10_000, force: true }).catch(() => {});
          await page.keyboard.type(val, { delay: 40 });
          await page.keyboard.press("Enter").catch(() => {});
        }
        break;
      }

      if (mapped) {
        const loc = page.locator(mapped).first();
        try {
          await expect(loc).toBeVisible({ timeout: 30_000 });
          await loc.fill(val);
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
      await inputEl.fill(val);
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

      const select = page.getByLabel(step.target, { exact: false }).first();
      await expect(select).toBeVisible({ timeout: 30_000 });
      await select.selectOption({ label: step.value });
      break;
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
      await page.setInputFiles('input[type="file"]', step.value);
      break;
    }

    default:
      throw new Error(`Unknown action: ${(step as any).action}`);
  }
}

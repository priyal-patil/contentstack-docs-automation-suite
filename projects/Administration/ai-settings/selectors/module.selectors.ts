/**
 * Administration — ai-settings module selectors.
 * Covers: ai-settings, ai-credits flows.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── shared navigation (App Switcher → Administration) ────────────────────────

  /** App Switcher button in the top navigation bar (doc step). DOM: data-test-id="app-switcher" */
  "App Switcher button (doc step)":
    '[data-test-id="app-switcher"]',

  /** "Administration" option inside the App Switcher modal (doc step).
   * No DOM sample captured for the open modal itself — generic fallback only. */
  "Administration option in App Switcher (doc step)":
    '[data-test-id="app-switcher-orgadmin"], button:has-text("Administration"), [role="button"]:has-text("Administration"), [aria-label="Administration"]',

  // ── ai-settings ──────────────────────────────────────────────────────────────

  /** "AI Settings" tab in the Administration top navigation bar (doc step). DOM: data-test-id="orgadmin-nav-ai-settings" (real <button>). */
  "AI Settings tab in Administration navigation (doc step)":
    '[data-test-id="orgadmin-nav-ai-settings"]',

  /** "AI Configuration" page heading — landing page after clicking AI Settings (doc step).
   * DOM: <div class="PageTitle" data-test-id="cs-page-title">AI Configuration</div>. */
  "AI Configuration page heading (doc step)":
    '[data-test-id="cs-page-title"]:has-text("AI Configuration")',

  /** "Global AI Settings" section heading on the AI Configuration page (doc step).
   * DOM: <h2 data-test-id="cs-heading-tag">Global AI Settings</h2> — id is generic/reused across headings, scope by tag + text. */
  "Global AI Settings tab (doc step)":
    'h2[data-test-id="cs-heading-tag"]:has-text("Global AI Settings")',

  /** "AI Product Controls" section label on the Global AI Settings tab (doc step).
   * DOM: <label data-test-id="cs-field-label"><span>AI Product Controls</span></label> — id is generic/reused, scope by tag + text. */
  "AI Product Controls section (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("AI Product Controls")',

  /** "Enable All" link on the Global AI Settings tab (doc step). DOM: data-test-id="ai-config-toggle-all". */
  "Enable All link (doc step)":
    '[data-test-id="ai-config-toggle-all"]',

  // ── ai-credits ───────────────────────────────────────────────────────────────

  /** "AI Credits" item in the left navigation of the AI Settings section (doc step).
   * DOM: <div role="button" data-test-id="cs-connected-apps-ai-credits">. */
  "AI Credits left navigation item (doc step)":
    '[data-test-id="cs-connected-apps-ai-credits"]',

  /** "Dashboard" tab on the AI Credits page (doc step).
   * DOM: <div data-test-id="cs-tabs-item"><div class="tab--name">Dashboard</div></div> — id is generic/reused across tabs, scope by text. */
  "Credits Dashboard tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Dashboard")',

  /** "Monthly Credit Allocation" section heading on the Credits Dashboard (doc step).
   * DOM: <h3 data-test-id="cs-heading-tag">Monthly Credit Allocation</h3> — id is generic/reused, scope by tag + text. */
  "Monthly Credit Allocation section (doc step)":
    'h3[data-test-id="cs-heading-tag"]:has-text("Monthly Credit Allocation")',

  /** "Organization Credit Usage Percentage" — doc's "Percentage" is rendered as the "%" symbol in the app, label text is "Organization Credit Usage" (doc step).
   * DOM: <span class="ai-credits__percentage-label">Organization Credit Usage</span>. */
  "Organization Credit Usage Percentage (doc step)":
    '.ai-credits__percentage-label',

  /** "Credit Allocation" — live app label (doc text says "Base Allocation"; app currently renders "Credit Allocation:") (doc step).
   * DOM: <span class="ai-credits__allocation-label">Credit Allocation:</span>. */
  "Credit Allocation label (doc step)":
    '.ai-credits__allocation-label:has-text("Credit Allocation")',

  /** "Base Allocation" — doc's exact wording for the credit-allocation label (doc step).
   * DOM: same element as above; app currently shows "Credit Allocation:" instead, so this intentionally will not match. */
  "Base Allocation label (doc step)":
    '.ai-credits__allocation-label:has-text("Base Allocation")',

  /** "Consumption" — credits utilized beyond base allocation (doc step).
   * DOM: <span class="ai-credits__allocation-label">Consumption:</span> (same class as Base/Credit Allocation, different row). */
  "Consumption label (doc step)":
    '.ai-credits__allocation-label:has-text("Consumption")',

  /** "Days Until Reset" section on the Credits Dashboard (doc step).
   * DOM: <label data-test-id="cs-field-label"><span>Days Until Reset </span></label> — id is generic/reused, scope by tag + text. */
  "Days Until Reset section (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Days Until Reset")',

  /** "Monthly Credit Usage" section — lower dashboard section with usage graph (doc step).
   * DOM: <h3 data-test-id="cs-heading-tag">Monthly Credit Usage</h3> — id is generic/reused, scope by tag + text. */
  "Monthly Credit Usage section (doc step)":
    'h3[data-test-id="cs-heading-tag"]:has-text("Monthly Credit Usage")',

  /** "Management" tab on the AI Credits page (doc step).
   * DOM: <div data-test-id="cs-tabs-item"><div class="tab--name">Management</div></div> — id is generic/reused across tabs, scope by text. */
  "Management tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Management")',

  /** "Block Excess Usage" — default management option, blocks AI ops at 100% allocation (doc step).
   * No DOM sample captured yet (Management tab content not in saved snapshots) — generic fallback only. */
  "Block Excess Usage option (doc step)":
    'label:has-text("Block Excess Usage"), [role="radio"]:has-text("Block Excess Usage"), *:has-text("Block Excess Usage")',

  /** "Allow Excess Usage" — alternate management option, permits usage beyond credit limit (doc step).
   * No DOM sample captured yet (Management tab content not in saved snapshots) — generic fallback only. */
  "Allow Excess Usage option (doc step)":
    'label:has-text("Allow Excess Usage"), [role="radio"]:has-text("Allow Excess Usage"), *:has-text("Allow Excess Usage")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

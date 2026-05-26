/**
 * Administration — ai-settings module selectors.
 * Covers: ai-settings, ai-credits flows.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // ── shared navigation (App Switcher → Administration) ────────────────────────

  /** App Switcher button in the top navigation bar (doc step). DOM: data-test-id="app-switcher" */
  "App Switcher button (doc step)":
    '[data-test-id="app-switcher"], .app__switcher__v2',

  /** "Administration" option inside the App Switcher modal (doc step). */
  "Administration option in App Switcher (doc step)":
    '[data-test-id="app-switcher-orgadmin"], button:has-text("Administration"), [role="button"]:has-text("Administration"), [aria-label="Administration"]',

  // ── ai-settings ──────────────────────────────────────────────────────────────

  /** "AI Settings" tab in the Administration top navigation bar (doc step). */
  "AI Settings tab in Administration navigation (doc step)":
    '[data-test-id="orgadmin-nav-ai-settings"], a:has-text("AI Settings"), button:has-text("AI Settings"), [role="button"]:has-text("AI Settings")',

  /** "AI Configuration" page heading — landing page after clicking AI Settings (doc step).
   * DOM: nav item is a custom component with role="button" (NOT an HTML <button> tag).
   * CSS `button:has-text()` only matches HTML <button>; use [role="button"] for custom elements. */
  "AI Configuration page heading (doc step)":
    '[data-test-id="cs-ai-configuration-heading"], [role="button"]:has-text("AI Configuration"), button:has-text("AI Configuration"), h1:has-text("AI Configuration"), h2:has-text("AI Configuration"), .ai-configuration__heading, [role="tab"]:has-text("AI Configuration")',

  /** "Global AI Settings" section heading on the AI Configuration page (doc step).
   * DOM: rendered as role=heading level=2 (may be <h2> or <div role="heading" aria-level="2">). */
  "Global AI Settings tab (doc step)":
    '[data-test-id="cs-global-ai-settings-tab"], [role="heading"]:has-text("Global AI Settings"), h2:has-text("Global AI Settings"), h3:has-text("Global AI Settings"), [role="tab"]:has-text("Global AI Settings"), [role="button"]:has-text("Global AI Settings"), button:has-text("Global AI Settings"), a:has-text("Global AI Settings")',

  /** "AI Product Controls" section label on the Global AI Settings tab (doc step). */
  "AI Product Controls section (doc step)":
    '[data-test-id="cs-ai-product-controls"], label:has-text("AI Product Controls"), h3:has-text("AI Product Controls"), *:has-text("AI Product Controls")',

  /** "Enable All" link on the Global AI Settings tab (doc step). */
  "Enable All link (doc step)":
    '[data-test-id="cs-ai-enable-all"], a:has-text("Enable All"), [role="button"]:has-text("Enable All"), button:has-text("Enable All"), span:has-text("Enable All")',

  // ── ai-credits ───────────────────────────────────────────────────────────────

  /** "AI Credits" item in the left navigation of the AI Settings section (doc step).
   * DOM: same custom nav component as "AI Configuration" — use [role="button"] not bare button. */
  "AI Credits left navigation item (doc step)":
    '[data-test-id="cs-ai-credits-nav"], [role="button"]:has-text("AI Credits"), a:has-text("AI Credits"), button:has-text("AI Credits"), [role="menuitem"]:has-text("AI Credits")',

  /** "Dashboard" tab on the AI Credits page (doc step).
   * DOM: plain <div> with no role — use :text-is() for exact-text match on the smallest element. */
  "Credits Dashboard tab (doc step)":
    '[data-test-id="cs-ai-credits-dashboard-tab"], :text-is("Dashboard"), [role="tab"]:has-text("Dashboard"), [role="button"]:has-text("Dashboard"), button:has-text("Dashboard"), a:has-text("Dashboard")',

  /** "Monthly Credit Allocation" section heading on the Credits Dashboard (doc step). */
  "Monthly Credit Allocation section (doc step)":
    '[data-test-id="cs-monthly-credit-allocation"], h3:has-text("Monthly Credit Allocation"), label:has-text("Monthly Credit Allocation"), *:has-text("Monthly Credit Allocation")',

  /** "Organization Credit Usage Percentage" — percentage of base credits consumed (doc step). */
  "Organization Credit Usage Percentage (doc step)":
    '[data-test-id="cs-ai-credits-org-usage-pct"], *:has-text("Organization Credit Usage Percentage")',

  /** "Base Allocation" — total credits allocated per month (doc step). */
  "Base Allocation label (doc step)":
    '[data-test-id="cs-ai-credits-base-allocation"], *:has-text("Base Allocation")',

  /** "Consumption" — credits utilized beyond base allocation (doc step). */
  "Consumption label (doc step)":
    '[data-test-id="cs-ai-credits-consumption"], *:has-text("Consumption")',

  /** "Days Until Reset" section on the Credits Dashboard (doc step). */
  "Days Until Reset section (doc step)":
    '[data-test-id="cs-days-until-reset"], *:has-text("Days Until Reset")',

  /** "Monthly Credit Usage" section — lower dashboard section with usage graph (doc step). */
  "Monthly Credit Usage section (doc step)":
    '[data-test-id="cs-monthly-credit-usage"], h3:has-text("Monthly Credit Usage"), *:has-text("Monthly Credit Usage")',

  /** "Day-over-Day Monthly Usage Graph" — daily credit utilization chart (doc step). */
  "Day-over-Day Monthly Usage Graph (doc step)":
    '[data-test-id="cs-ai-credits-usage-graph"], canvas, *:has-text("Day-over-Day")',

  /** "Credits Consumed per Product" — color-coded graph legend by AI product (doc step). */
  "Credits Consumed per Product (doc step)":
    '[data-test-id="cs-ai-credits-per-product"], *:has-text("Credits Consumed per Product"), *:has-text("Credits Consumed")',

  /** "Interactive Hover Details" — hover tooltip on graph data points (doc step).
   * Verifies the chart container that enables hover interaction is present. */
  "Interactive Hover Details (doc step)":
    '[data-test-id="cs-ai-credits-hover-details"], *:has-text("Interactive Hover Details"), *:has-text("Interactive Hover")',

  /** "Management" tab on the AI Credits page (doc step).
   * DOM: plain <div> with no role — use :text-is() for exact-text match on the smallest element. */
  "Management tab (doc step)":
    '[data-test-id="cs-ai-credits-management-tab"], :text-is("Management"), [role="tab"]:has-text("Management"), [role="button"]:has-text("Management"), button:has-text("Management"), a:has-text("Management")',

  /** "Hard Limit" option on the Management tab (doc step). */
  "Hard Limit option (doc step)":
    '[data-test-id="cs-ai-credits-hard-limit"], label:has-text("Hard Limit"), *:has-text("Hard Limit")',

  /** "Soft Limit" option on the Management tab (doc step). */
  "Soft Limit option (doc step)":
    '[data-test-id="cs-ai-credits-soft-limit"], label:has-text("Soft Limit"), *:has-text("Soft Limit")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

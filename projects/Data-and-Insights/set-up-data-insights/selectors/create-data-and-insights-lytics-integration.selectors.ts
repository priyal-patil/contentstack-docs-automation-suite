/**
 * Flow: create-data-and-insights-lytics-integration
 * DOM refs: data/dom/Data-and-Insights/set-up-data-insights/*.html, data/dom/header/app-switcher*.html
 *
 * Dedicated click/enter paths live in rules/core/actionRules.ts.
 * `CLICK_SELECTORS` entries below back generic `verify` steps (see actionRules verify branch ~22269).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // --- Doc-named verifies (step.target must match flow JSON) ---
  "DAL Lytics doc: verify Administration product label (doc step)": 'a[data-test-id="app-switcher-orgadmin"]',

  "DAL Lytics doc: verify Data Activation Layer administration nav label (doc step)":
    '[data-test-id="orgadmin-nav-data-activation-layer"]',

  "DAL Lytics doc: verify Data Activation Layer page title (doc step)": '[data-test-id="cs-page-title"]',

  "DAL Lytics doc: verify Data Activation Layer listing Actions column header (doc step)":
    '[data-test-id="cs-table-row-action-column-text--9"]',

  "DAL Lytics doc: verify Add New DAL Configuration button label (doc step)":
    '[data-test-id="cs-org-add-lytics-tag-modal-cta"]',

  "DAL Lytics doc: Proceed button label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .lytics-consent-modal button.Button--primary',

  "DAL Lytics doc: verify New DAL setup modal Title field label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .input-field:has([data-test-id="cs-org-lytics-tag-name"]) label[data-test-id="cs-field-label"]',

  "DAL Lytics doc: verify New DAL setup modal Domain field label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .input-field:has([data-test-id="cs-org-lytics-tag-domain"]) label[data-test-id="cs-field-label"]',

  "DAL Lytics doc: verify New DAL setup modal CMS Stacks field label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .input-field:has([data-test-id="cs-org-lytics-tag-cms-stacks"]) label[data-test-id="cs-field-label"]',

  "DAL Lytics doc: verify New DAL setup modal Launch Projects field label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .input-field:has([data-test-id="cs-org-lytics-tag-launch-projects"]) label[data-test-id="cs-field-label"]',

  "DAL Lytics doc: verify New DAL setup modal Personalize Projects field label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .input-field:has([data-test-id="cs-org-lytics-tag-personalize-projects"]) label[data-test-id="cs-field-label"]',

  "DAL Lytics doc: verify New DAL setup modal Lytics Account field label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] .input-field:has([data-test-id="cs-org-lytics-tag-lytics-account"]) label[data-test-id="cs-field-label"]',

  "DAL Lytics doc: verify Add additional DAL Managers section label (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] label[data-test-id="cs-field-label"].add-users-section-title',

  "DAL Lytics doc: verify Add Users open modal button label (doc step)": '[data-test-id="cs-org-add-lytics-users-cta"]',

  "DAL Lytics doc: verify Select Users modal heading (doc step)":
    '[data-test-id="add-user-modal"] .AddUserModal__header p',

  "DAL Lytics doc: verify Select Users modal footer Add Users button label (doc step)":
    '[data-test-id="cs-add-user-add"]',

  "DAL Lytics doc: verify Test Connection button label (doc step)": '[data-test-id="cs-org-test-lytics-connection-cta"]',

  "DAL Lytics doc: verify Save DAL configuration button label (doc step)": '[data-test-id="cs-org-create-lytics-tag"]',

  "DAL Lytics doc: verify Edit DAL modal title (doc step)":
    '[data-test-id="cs-modal-title-edit-data-activation-layer-(dal)"]',

  "DAL Lytics doc: verify Added Users section label under edit DAL modal (doc step)":
    '[data-testid="cs-org-add-lytics-tag-modal"] label[data-test-id="cs-field-label"]:has-text("Added Users")',

  "DAL Lytics doc: verify Update DAL configuration button label (doc step)": '[data-test-id="cs-org-update-lytics-tag"]',

  "DAL Lytics doc: verify App Switcher Data and Insights product label (doc step)":
    '[data-test-id="app-switcher-lytics"]',

  "DAL Lytics doc: verify Select An Account modal title (doc step)":
    '[data-test-id="cs-modal-title-select-an-account"]',

  "DAL Lytics doc: verify Select account row Select button label (doc step)":
    '.lytics-account-select-cta button[data-test-id="cs-button"]',

  "DAL Lytics doc: OAuth Authorize button label (doc step)": '[data-testid="modal-form-install-authorize"]',

  // --- Clicks (fallback if generic resolver needed) ---
  "DAL Lytics doc: OAuth Authorize button (doc step)": '[data-testid="modal-form-install-authorize"]',
};

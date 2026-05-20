/**
 * [Delete an Experience](https://www.contentstack.com/docs/personalize/delete-experience) — Experiences listing
 * (`data/dom/Personalize/experiences.html`): row **⋮** `button[data-test-id="cs-table-action-options"]` →
 * **`[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"]`** → modal **Delete Experience** → **Delete**.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  /** Same top bar tab as **edit-experience** (`experiences.html`). */
  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',

  "Delete Experience doc: Experiences page title (doc step)": '[data-test-id="cs-page-title"]',

  "Delete Experience doc: verify Experiences table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Delete Experience doc: verify row Actions vertical tooltip Delete menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"]',

  "Delete Experience doc: Experiences row Actions Delete menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"]',

  "Delete Experience doc: verify Delete Experience modal title (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Experience")), [role="dialog"] h3[data-test-id="cs-modal-title"]',

  "Delete Experience doc: verify Delete Experience modal destructive Delete button (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Experience")) [data-test-id="cs-button"]:has-text("Delete"), .ReactModal__Content:has-text("Delete Experience") button:has-text("Delete")',

  "Delete Experience doc: Delete Experience modal confirm Delete button (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Experience")) [data-test-id="cs-button"]:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

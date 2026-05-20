/**
 * [Delete an Event](https://www.contentstack.com/docs/personalize/delete-event) — non-referenced path (Events listing only).
 *
 * Row menu: **`button[data-test-id="cs-table-action-options"]`** (row-scoped) → **`li[data-test-id="cs-ct-action-delete"]`**.
 * Confirmation modal: **Delete Event**; primary **Delete** (`[data-test-id="cs-button"]`).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Events (doc step)": '[data-test-id="personalize-nav-events"]',

  "Delete Event doc: verify Events table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Delete Event doc: verify row Actions vertical tooltip Delete menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"]',

  "Delete Event doc: Events row Actions Delete menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"]',

  "Delete Event doc: verify Delete Event modal title (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Event")), [role="dialog"] h3[data-test-id="cs-modal-title"]',

  "Delete Event doc: verify Delete Event modal destructive Delete button (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Event")) [data-test-id="cs-button"]:has-text("Delete"), .ReactModal__Content:has-text("Delete Event") button:has-text("Delete")',

  "Delete Event doc: Delete Event modal confirm Delete button (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Event")) [data-test-id="cs-button"]:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

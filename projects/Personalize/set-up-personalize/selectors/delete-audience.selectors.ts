/**
 * [Delete an Audience](https://www.contentstack.com/docs/personalize/delete-audience) — **non-referenced** path (Audiences listing only).
 *
 * NOTE the appended `li:has-text("Delete")` fallback. On a real run the menu rendered as
 * `ul[data-test-id="cs-vertical-action-tooltip-actions"]` containing "Edit Delete", but no descendant
 * carried `data-test-id="cs-ct-action-delete"`, so the precise selector found nothing. The healing agent
 * recovered the item by text and confirmed it by replaying the whole flow. The precise selector is kept
 * FIRST so it wins wherever it still applies; the text match is scoped to the menu container so it cannot
 * pick up a "Delete" elsewhere on the page.
 *
 * Row menu matches **edit-audience**: **`button[data-test-id="cs-table-action-options"]`** (row-scoped) → **`[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"]`**.
 * Confirmation modal: heading **Delete Audience**; primary **`Delete`** (`[data-test-id="cs-button"]`).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Audiences (doc step)": '[data-test-id="personalize-nav-audiences"]',

  "Delete Audience doc: verify Audiences table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Delete Audience doc: verify row Actions vertical tooltip Delete menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete")',

  "Delete Audience doc: Audiences row Actions Delete menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-delete"], [data-test-id="cs-vertical-action-tooltip-actions"] li:has-text("Delete")',

  "Delete Audience doc: verify Delete Audience modal title (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Audience")), [role="dialog"] h3[data-test-id="cs-modal-title"]',

  "Delete Audience doc: verify Delete Audience modal destructive Delete button (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Audience")) [data-test-id="cs-button"]:has-text("Delete"), .ReactModal__Content:has-text("Delete Audience") button:has-text("Delete")',

  "Delete Audience doc: Delete Audience modal confirm Delete button (doc step)":
    '[role="dialog"]:has([role="heading"]:has-text("Delete Audience")) [data-test-id="cs-button"]:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

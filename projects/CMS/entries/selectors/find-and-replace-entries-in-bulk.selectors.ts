/**
 * Selectors for the "Find and Replace Entries in Bulk" doc flow.
 * All ids verified against the live app on PriyalDocsStack, 2026-09-03.
 *
 * The bulk-actions bar button is [data-test-id="entries_bulk_action_find_replace"]
 * and renders the label "Find and Replace", exactly as the doc states. It appears
 * only once entries are selected.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // doc step 2 — "Apply the filters you need ... then select the entries to include."
  // The entries list filter is used to reach entries that contain the search term; the
  // replacement values themselves go in the dialog's Find / Replace With fields (steps 4-5).
  "Entries list filter box (doc step 2)": 'input[placeholder="Search entries"]',
  "Entries list filter submit (doc step 2)": '[data-test-id="cs-search-bar-input-submit"]',
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)": '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 1)',
  "Second entry checkbox (doc step)":
    ':nth-match([data-test-id^="cs-table-body-row-"] [data-test-id="cs-table-row-selection"] input[type="checkbox"], 2)',

  // doc step 3
  "Find and Replace in bulk-actions bar (doc step 3)":
    '[data-test-id="entries_bulk_action_find_replace"]',

  // doc step 4 — Match trigger then the Contains option
  "Match trigger (doc step 4)": '[data-test-id="cs-bulk-find-matching-trigger"]',
  "Match type Contains (doc step 4)": '[data-test-id="cs-bulk-find-match-contains"]',

  // doc steps 6, 7, 9, 10
  "Preview Changes button (doc step 6)": '[data-test-id="cs-bulk-find-generate-preview"]',
  "View Updates link (doc step 7)":
    '[data-test-id="cs-bulk-fnr-view-updates"], a:has-text("View Updates"), button:has-text("View Updates")',
  "Apply Selected Changes button (doc step 9)": '[data-test-id="cs-bulk-fnr-apply"]',
  "Replace Text confirm button (doc step 10)": '[data-test-id="cs-bulk-fnr-confirm-apply"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Entries list filter box (doc step 2)": 'input[placeholder="Search entries"]',
  "Bulk actions bar (doc step 3)": '[data-test-id="cs-bulk-action-panel"]',
  "Find and Replace dialog (doc step 3)": '[data-test-id="cs-bulk-find-replace-container"]',
  "Match label (doc step 4)": '[data-test-id="cs-bulk-find-matching-trigger"]',
  "Find field (doc step 4)": '[data-test-id="cs-bulk-find-input"]',
  "Replace With field (doc step 5)": '[data-test-id="cs-bulk-replace-input"]',
  "Clear control (doc step 5)": '[data-test-id="cs-bulk-find-clear"]',

  "Preview Matching Results heading (doc step 7)": '[data-test-id="cs-bulk-fnr-results-table"]',
  /** The column headers render as divs, not <th>, so match the table's text instead. */
  "Preview results table headers (doc step 7)":
    '[data-test-id="cs-bulk-fnr-results-table"]',
  /** At least one match row. Rows are role="row" divs, not <tr>. */
  "Preview result rows (doc step 7)":
    '[data-test-id="cs-bulk-fnr-results-table"] [role="row"]',

  "Replace Text dialog title (doc step 10)": '[data-test-id="cs-modal-title-replace-text"]',
  "Replace Text summary line (doc step 10)": ':text("Replace text in")',
  "Add to a Release section (doc step 10)": ':text("Add to a Release")',
  "Bulk Tasks panel (doc step 11)": '[data-test-id="cs-bulk-tasks-panel"], :text("Bulk Tasks")',
  "Tasks Completed state (doc step 11)":
    '[data-test-id="cs-bulk-tasks-completed"], :text("Tasks Completed")',
};

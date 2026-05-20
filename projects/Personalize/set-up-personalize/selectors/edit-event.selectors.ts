/**
 * Edit an Event — Events listing + **Edit Event** modal (align with **`create-new-event.html`** / **`events-list.html`**; edit title `cs-modal-title-edit-event` when present).
 *
 * Each modal root must be paired with inner targets (comma-separated roots are **not** CSS-parenthesized;
 * appending ` inner` once only binds to the last root). Use **`scopeModalChild`** for all modal-scoped selectors.
 */

const EDIT_EVENT_MODAL_ROOTS = [
  '[role="dialog"]:has([data-test-id="cs-modal-title-edit-event"])',
  '[role="dialog"]:has(h3[data-test-id="cs-modal-title-new-event"]:has-text("Edit Event"))',
  '[role="dialog"]:has(h3[data-test-id="cs-modal-title"]:has-text("Edit Event"))',
  '.ReactModal__Content:has([data-test-id="cs-modal-title-edit-event"])',
  '.ReactModal__Content:has(h3:has-text("Edit Event"))',
] as const;

/** One alternative per root so `.first()` resolves the control inside the Edit Event modal, not a bare dialog node. */
function scopeModalChild(childSelector: string): string {
  return EDIT_EVENT_MODAL_ROOTS.map((r) => `${r} ${childSelector}`).join(", ");
}

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize workspace top navigation Events (doc step)": '[data-test-id="personalize-nav-events"]',

  "Edit Event doc: verify Events table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Edit Event doc: verify row Actions vertical tooltip Edit menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Edit Event doc: Events row Actions Edit menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Edit Event modal title (doc step)":
    '[data-test-id="cs-modal-title-edit-event"], h3[data-test-id="cs-modal-title-new-event"]:has-text("Edit Event"), [role="dialog"] h3[data-test-id="cs-modal-title"]:has-text("Edit Event")',

  "Edit Event Key field label (doc step)": scopeModalChild(
    'label[data-test-id="cs-field-label"]:has-text("Key")'
  ),

  "Edit Event Description field label (doc step)": scopeModalChild(
    'label[data-test-id="cs-field-label"]:has-text("Description")'
  ),

  "Edit Event doc: verify Save button in Edit Event modal (doc step)": [
    ...EDIT_EVENT_MODAL_ROOTS.map((r) => `${r} [data-testid="event-form-submit"]`),
    ...EDIT_EVENT_MODAL_ROOTS.map((r) => `${r} [data-test-id="cs-button"]`),
  ].join(", "),
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize Edit Event modal Key field (doc step)": scopeModalChild('[data-testid="key-input"]'),
  "Personalize Edit Event modal Description field (doc step)": scopeModalChild('[data-testid="description-input"]'),
};

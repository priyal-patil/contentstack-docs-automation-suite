/**
 * Reference-only: stable `data-test-id` and structure from DOM snapshots under
 * `data/dom/CMS/taxonomy/`. Use for taxonomy doc automation maintenance; not loaded as flow overrides.
 *
 * Sources:
 * - term-verticle-menu.html, term-verticle-ellipses.html (term row ⋮ dropdown)
 * - create-sibling-term.html (Create Sibling Term modal)
 * - create-child-term.html (Create Child Term modal + optional New Term CTA)
 */

/** Term row vertical menu — term-verticle-menu.html, term-verticle-ellipses.html */
export const TERM_VERTICAL_MENU = {
  menuItem: '[data-test-id="cs-dropdown-elements"]',
  createSiblingIcon: '[data-test-id="cs-term-create-sibling-icon"]',
  createSiblingLabel: '[data-test-id="cs-term-create-sibling-label"]',
  createChildIcon: '[data-test-id="cs-term-create-child-icon"]',
  createChildLabel: '[data-test-id="cs-term-create-child-label"]',
  deleteIcon: '[data-test-id="cs-term-delete-icon"]',
  deleteLabel: '[data-test-id="cs-term-delete-label"]',
} as const;

/** Create Sibling Term modal — create-sibling-term.html */
export const CREATE_SIBLING_TERM_MODAL = {
  title: '[data-test-id="cs-modal-title-create-sibling-term"]',
  termNameInput: '[data-test-id="term-name-input"]',
  termUidInput: '[data-test-id="term-uid-input"]',
  modalBody: '[data-test-id="cs-modal-description"]',
  close: '[data-test-id="cs-modal-close"]',
  cancel: '[data-test-id="cancel-button"]',
  save: '[data-test-id="save-button"]',
  buttonGroup: '[data-test-id="cs-button-group"]',
} as const;

/** Create Child Term modal — create-child-term.html */
export const CREATE_CHILD_TERM_MODAL = {
  title: '[data-test-id="cs-modal-title-create-child-term"]',
  termNameInput: '[data-test-id="term-name-input"]',
  termUidInput: '[data-test-id="term-uid-input"]',
  modalBody: '[data-test-id="cs-modal-description"]',
  close: '[data-test-id="cs-modal-close"]',
  cancel: '[data-test-id="cancel-button"]',
  save: '[data-test-id="save-button"]',
  buttonGroup: '[data-test-id="cs-button-group"]',
  /** Extra primary “New Term” below modal body when present */
  newTermButton: '[data-test-id="cs-button"]:has-text("New Term")',
} as const;

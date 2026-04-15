/**
 * Taxonomy UI locator strings shared by flow automation (actionRules, custom tests).
 * DOM refs: data/dom/CMS/taxonomy/*.html — term-verticle-menu.html, term-section.html, taxonomy-listing.html.
 */

/** Term rows in the left tree / sortable area (react-aria tree or legacy). */
export const TERM_TREE_ITEMS =
  '.terms-sortable-area [role="treeitem"], [role="tree"] [role="treeitem"]';

/** Wider tree scope when `.taxonomy-edit-content` wraps treeitems. */
export const TERM_TREE_ITEMS_IN_EDIT_PANEL =
  '.terms-sortable-area [role="treeitem"], .taxonomy-edit-content [role="treeitem"], [role="tree"] [role="treeitem"]';

/** Taxonomy listing table body rows (Settings → Taxonomy list). */
export const TAXONOMY_LISTING_DATA_ROWS =
  '[data-test-id^="cs-table-body-row-"][role="row"]:not(.Table__empty__row)';

/**
 * Term Details split CTA — caret next to “Create a Sibling Term”.
 * Opens dropdown that can include “Delete Term” (term-verticle-menu.html).
 */
export const TERM_DETAILS_SPLIT_CTA_CARET =
  ".taxonomy-edit-content .terms-split-cta button.contextual-dropdown-wrapper, .terms-details-section-terms-selected .terms-split-cta button.contextual-dropdown-wrapper, .terms-details-section .terms-split-cta button.contextual-dropdown-wrapper, .terms-edit-section .terms-split-cta button.contextual-dropdown-wrapper, .terms-edit-form .terms-split-cta button.contextual-dropdown-wrapper";

export const TAXONOMY_EDIT_CONTENT_ROOT = ".taxonomy-edit-content";

/** Vertical ellipsis SVGs sometimes used in panel chrome (fallback for menus). */
export const TAXONOMY_PANEL_VERTICAL_DOTS_SVG =
  'svg[name="DotsThreeVertical"], svg[name="DotsThreeLargeVertical"]';

export const DROPDOWN_MENU_LIST = ".Dropdown__menu__list";

/** CSS fragments for “Delete Term” in split / dropdown menus (pair with role-based checks in code). */
export const DELETE_TERM_MENU_CSS = {
  dropdownItemWithTestId:
    'li[data-test-id="cs-dropdown-elements"]:has([data-test-id="cs-term-delete-label"])',
  deleteLabelParagraph: "p[data-test-id='cs-term-delete-label']",
  listItemByText: '.Dropdown__menu__list__item:has-text("Delete Term")',
  actionDeleteInstance: ".Dropdown__menu__list li.action-delete-instance",
} as const;

/**
 * Row-level kebab / more-actions (doc: vertical ellipsis next to term); try after hover.
 * Aligns with “Taxonomy terms list first term vertical ellipsis” automation.
 */
export const TERM_ROW_KEBAB_SELECTOR_LIST: readonly string[] = [
  'button[data-test-id="cs-group-more-actions-icon"]',
  '[data-test-id="cs-group-more-actions-icon"]',
  "button.three-dots-vertical-icon",
  'button:has(svg[name="DotsThreeLargeVertical"])',
  'button:has(svg[name="DotsThreeVertical"])',
  ".term-action-section button.Button--icon",
];

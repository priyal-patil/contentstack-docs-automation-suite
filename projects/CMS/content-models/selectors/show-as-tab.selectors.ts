/**
 * Flow: show-as-tab
 * Source: https://www.contentstack.com/docs/developers/create-content-types/show-as-tab
 * Exported constants are the single source of truth for actionRules special-cases and CLICK_SELECTORS.
 */

/** Basic tab — anchor that Group Field Properties panel is open before Advanced. */
export const SHOW_AS_TAB_GROUP_TAB_BASIC_SELECTOR = '[data-test-id="cs-ct-field-group-tab-basic"]';

export const SHOW_AS_TAB_GROUP_TAB_ADVANCED_TEST_ID = "cs-ct-field-group-tab-advanced";
export const SHOW_AS_TAB_GROUP_TAB_ADVANCED_SELECTOR = `[data-test-id="${SHOW_AS_TAB_GROUP_TAB_ADVANCED_TEST_ID}"]`;

/** Advanced tab scoped to Group properties (avoid matching other modules’ “Advanced”). */
export const SHOW_AS_TAB_GROUP_TAB_ADVANCED_IN_FIELD_PROPERTIES_SELECTOR =
  `.FieldProperties ${SHOW_AS_TAB_GROUP_TAB_ADVANCED_SELECTOR}`;

/** Show as Tab ON (wrapper). */
export const SHOW_AS_TAB_GROUP_TOGGLE_ENABLED_SELECTOR = '[data-test-id="cs-ct-field-group-tab-enabled"]';

/** Show as Tab OFF (wrapper). */
export const SHOW_AS_TAB_GROUP_TOGGLE_DISABLED_SELECTOR = '[data-test-id="cs-ct-field-group-tab-disabled"]';

/** Group field: row locator for opening Properties (hover + Sliders). */
export const SHOW_AS_TAB_GROUP_FIELD_ROW_BY_P_SELECTOR =
  '.ContentTypeField:has(p[data-test-id="cs-ct-select-field-group"])';
export const SHOW_AS_TAB_GROUP_FIELD_ROW_BY_GROUP_SVG_SELECTOR = '.ContentTypeField:has(svg[name="Group"])';

export const SHOW_AS_TAB_GROUP_FIELD_SLIDERS_OR_PROPERTIES_SELECTOR =
  'button:has(svg[name="Sliders"]), [data-test-id$="-option-properties"]';

/**
 * Click target for “Show as Tab” on Group Advanced (enabled | disabled wrapper, or ToggleWrap by text).
 */
export const SHOW_AS_TAB_GROUP_TOGGLE_ROW_SELECTOR = `${SHOW_AS_TAB_GROUP_TOGGLE_ENABLED_SELECTOR}, ${SHOW_AS_TAB_GROUP_TOGGLE_DISABLED_SELECTOR}, .FieldProperties .ToggleWrap:has-text("Show as Tab")`;

/** Global field / other docs: legacy Show as Tab row (not Group cs-ct-field-group-tab-*). */
export const SHOW_AS_TAB_GLOBAL_OR_LEGACY_TOGGLE_ROW_SELECTOR =
  'div:has(> .Label--color--secondary:has-text("Show as Tab")), div:has(> .Label--color--primary:has-text("Show as Tab")), [data-test-id="cs-ct-field-global-tab-disabled"], [data-test-id="cs-ct-field-global-tab-enabled"]';

/** Hidden checkbox inside Group Show as Tab toggle (assert with toBeChecked, not toBeVisible). */
export const SHOW_AS_TAB_GROUP_TOGGLE_CHECKBOX_SELECTOR =
  'input[type="checkbox"][name$=".tab"], input[type="checkbox"]';

/** Show as Tab row: checkbox locators (Group + Global / legacy rows). */
export const SHOW_AS_TAB_ROW_TAB_CHECKBOX_SELECTOR =
  'input[type="checkbox"][name$=".tab"], input[type="checkbox"][aria-label$=".tab"], input[type="checkbox"]';

export const CLICK_SELECTORS: Record<string, string> = {
  // Actions column header (listing page)
  "Actions (doc step)":
    '[data-test-id="cs-table-row-action-column-cell--4"], [role="columnheader"]:has-text("Actions")',

  // Vertical ellipsis on the AUTO- row
  "vertical ellipsis (doc step)": '[data-test-id="cs-table-action-options"]',

  // Edit menu item inside the row action tooltip
  "Edit (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"] .ml-8, [data-test-id="cs-vertical-action-tooltip"] li[data-test-id="cs-ct-action-edit"]',

  "ct field group tab enabled": SHOW_AS_TAB_GROUP_TOGGLE_ENABLED_SELECTOR,

  // Toggle OFF uses ...-disabled; ON uses ...-enabled
  "Show as Tab (doc step)": `${SHOW_AS_TAB_GROUP_TOGGLE_ENABLED_SELECTOR}, ${SHOW_AS_TAB_GROUP_TOGGLE_DISABLED_SELECTOR}`,

  /** Verify the Show as Tab toggle exists (either enabled or disabled state — before clicking it). */
  "Show as Tab toggle on (doc step)": `${SHOW_AS_TAB_GROUP_TOGGLE_ENABLED_SELECTOR}, ${SHOW_AS_TAB_GROUP_TOGGLE_DISABLED_SELECTOR}`,

  // Properties icon on the Group field row (label may be p[data-test-id=cs-ct-select-field-group]; hover reveals Sliders)
  "Properties (doc step)":
    `${SHOW_AS_TAB_GROUP_FIELD_ROW_BY_P_SELECTOR} [data-test-id$="-option-properties"], ${SHOW_AS_TAB_GROUP_FIELD_ROW_BY_P_SELECTOR} button:has(svg[name="Sliders"]), ${SHOW_AS_TAB_GROUP_FIELD_ROW_BY_GROUP_SVG_SELECTOR} [data-test-id$="-option-properties"], ${SHOW_AS_TAB_GROUP_FIELD_ROW_BY_GROUP_SVG_SELECTOR} button:has(svg[name="Sliders"])`,

  // Advanced tab — scope to Field Properties so we don't match unrelated "Advanced" tabs elsewhere
  "Advanced (doc step)": `${SHOW_AS_TAB_GROUP_TAB_ADVANCED_IN_FIELD_PROPERTIES_SELECTOR}, [data-test-id="cs-field-properties-container"] ${SHOW_AS_TAB_GROUP_TAB_ADVANCED_SELECTOR}, ${SHOW_AS_TAB_GROUP_TAB_ADVANCED_SELECTOR}`,

  help: '[data-test-id="cs-help"]',
  tooltip: '[data-test-id="cs-tooltip"]',
  Information: '[data-test-id="cs-icon"]',
  "Information (icon)": '[data-test-id="cs-icon"] svg[name="Information"]',
};

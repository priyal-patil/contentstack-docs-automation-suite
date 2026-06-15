/**
 * Add Taxonomy to a Content Type — CT builder + taxonomy field properties.
 * Doc: https://www.contentstack.com/docs/developers/taxonomy/add-taxonomy-to-a-content-type
 * DOM refs: data/dom/CMS/content-models/content-builder.html,
 * data/dom/CMS/taxonomy/ct-add-taxonomy.html, add-taxonomy-modal.html, taxonomy-proeprties-basic.html.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "+ New Content Type (doc step)":
    '[data-test-id="cs-cb-new-ct"], button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  /** Create New Content Type modal — enable after Name + UID (user modal: cs-cb-edit-ct-details). */
  "Save and proceed":
    '[data-test-id="cs-cb-edit-ct-details"], [data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), button:has-text("Save and proceed")',
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"])',
  "Insert a field (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"], button:has(svg[name="PurpleAdd"])',
  "Insert a field (hover area)": '[data-test-id="cs-field-type-selector"]',
  /** Field picker — doc step 4. */
  "Taxonomy (doc step)":
    'div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-taxonomies"]), div.FieldTypeSelector__field-tile:has-text("Taxonomy"), [data-test-id="cs-ct-select-field-taxonomies"]',
  "Builder area (dismiss properties)": 'role=heading[name="Title"]',
  /** Doc step 5 — properties on the Taxonomy field row (not Title). */
  "Properties (Taxonomy field) (doc step)":
    '.ContentTypeField:has(p[data-test-id="cs-ct-select-field-taxonomies"]), .ContentTypeField:has(svg[name="Taxonomy"]) [data-test-id$="-option-properties"], .ContentTypeField:has([data-test-id="cs-ct-select-field-taxonomies"]) button:has(svg[name="Sliders"])',
  /** Doc step 6 — opens Add Taxonomy modal. Button: data-test-id="cs-cb-new-block" aria-label="Add Taxonomy". */
  "+ Add Taxonomy (doc step)":
    'button[data-test-id="cs-cb-new-block"][aria-label="Add Taxonomy"]',
  /** add-taxonomy-modal.html — open react-select (caret or control). */
  "Select Taxonomy dropdown (doc step)":
    '[data-test-id="cs-ctf-taxonomy-modal-select"] [data-test-id="cs-async-select-caret-down"], [data-test-id="cs-ctf-taxonomy-modal-select"] .Select__control',
  /** First option in the opened taxonomy react-select dropdown. */
  "Select first available taxonomy from dropdown (doc step)":
    '[data-test-id="cs-ctf-taxonomy-modal-select"] .Select__option:first-child, .Select__menu .Select__option:first-child',
  /** Doc step 9 — Apply in Add Taxonomy modal footer (add-taxonomy-modal.html: cs-cb-add-block submit). */
  "Apply taxonomy field properties (doc step)":
    '.AddTaxBlock__buttons button[data-test-id="cs-cb-add-block"], form:has([data-test-id="cs-ctf-taxonomy-modal-select"]) button[data-test-id="cs-cb-add-block"], [data-test-id="cs-field-properties-container"] button:has-text("Apply")',
  /** Verify-only — same primary Apply as doc step 9 (visible label "Apply"). */
  "Apply in Add Taxonomy modal (doc step)":
    '.AddTaxBlock__buttons button[data-test-id="cs-cb-add-block"]:has-text("Apply"), form:has([data-test-id="cs-ctf-taxonomy-modal-select"]) button[data-test-id="cs-cb-add-block"]',
  /** Add Taxonomy modal — "Select Taxonomy" label above the taxonomy dropdown. */
  "Select Taxonomy (doc step)":
    '[data-test-id="cs-ctf-taxonomy-modal-select-label"], label:has-text("Select Taxonomy"), .AddTaxBlock label:has-text("Taxonomy")',
  /** Add Taxonomy modal — "Maximum number of terms" label (cs-ctf-taxonomy-modal-limit-label). */
  "Maximum number of terms (doc step)":
    '[data-test-id="cs-ctf-taxonomy-modal-limit-label"], label:has-text("Maximum number of terms")',
  /** Add Taxonomy modal — Optional Field toggle (cs-ctf-taxonomy-modal-switch-enabled). */
  "Optional Field toggle (doc step)":
    '[data-test-id="cs-ctf-taxonomy-modal-switch-enabled"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "UID (doc step)": '[data-test-id="cs-ct-create-modal-ct-uid-input"] input, [data-testid="cs-modal"] input[name="uid"]',
  "Create New Content Type modal (doc step)":
    '[data-test-id="cs-modal-title-create-new-content-type"], [role="dialog"]:has-text("Create New Content Type")',
  "Content Type Builder (doc step)":
    '.contenttype-builder [data-test-id="cs-ct-title-truncate"], .contenttype-builder .ContentTypeField__display-name:has-text("Title"), .ContentTypeField [data-test-id="cs-ct-title-truncate"]',
  "Taxonomy field tile label (doc step)": '[data-test-id="cs-ct-select-field-taxonomies"]',
  /** add-taxonomy-modal.html — modal label for verify. */
  "Select Taxonomy field label (doc step)": '[data-test-id="cs-ctf-taxonomy-modal-select-label"]',
};

/**
 * Taxonomy for a Basic Blog Website — Settings → Taxonomy, CT builder, entry with Categories.
 * Doc: https://www.contentstack.com/docs/developers/taxonomy/taxonomy-for-a-basic-blog-website
 * Composes taxonomy CT builder targets with add-taxonomy-to-a-content-type + entry picker targets.
 */
import { CLICK_SELECTORS as AddClick, INPUT_SELECTORS as AddInput } from "./add-taxonomy-to-a-content-type.selectors";
import { CLICK_SELECTORS as TaxClick, INPUT_SELECTORS as TaxInput } from "./module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...TaxClick,
  ...AddClick,
  /**
   * After saving the first term, UI shows this primary action (not the term-row ⋮ menu).
   * Doc: “click the Create a Child Term button” — taxonomy-for-a-basic-blog-website
   */
  "Create a Child Term button on taxonomy details (doc step)":
    'button.Button--primary:has-text("Create a Child Term"), button:has-text("Create a Child Term"):visible, .terms-sortable-section button:has-text("Create a Child Term"), [class*="taxonomy-details"] button:has-text("Create a Child Term")',
  /** Doc step 6 — outline of terms in left panel */
  "Taxonomy terms outline left panel (doc step)":
    '.terms-sortable-section, .terms-sortable-area, [class*="terms-sortable"]',
  /** Doc step 11 — Advanced tab before Optional field (taxonomy field properties) */
  "Taxonomy field properties Advanced tab (doc step)": '[data-test-id="cs-ct-field-taxonomy-tab-advanced"]',
  /** Doc step 11 — toggle to make taxonomy field optional (Advanced tab) */
  "Taxonomy field Optional field switch (doc step)":
    '[data-test-id="cs-field-properties-container"] label:has-text("Optional field") ~ div [role="switch"], [data-test-id="cs-field-properties-container"] .ToggleWrap:has-text("Optional") [role="switch"], [data-test-id="cs-field-properties-container"] [role="switch"]',
  /** entries — doc step 14 */
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry")',
  /** New entry modal — row for CT created in this flow (name starts with Blog Posts) */
  "Blog Posts content type row in new entry modal (doc step)":
    '.ReactModal__new-entry [role="row"]:has-text("Blog Posts"), [role="dialog"] [role="row"]:has-text("Blog Posts")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Proceed")',
  /** Doc step 14 — field labeled Categories */
  "Categories field Select Term(s) (doc step)":
    '[class*="FieldSection"]:has-text("Categories") button:has-text("Select Term"), [class*="field"]:has-text("Categories") button:has-text("Select Term"), [class*="FieldSection"]:has-text("Categories") button:has-text("Select Term(s)")',
  "First term in term picker (doc step)":
    '[role="dialog"] [role="option"], [role="dialog"] [role="row"], [role="dialog"] .Checkbox',
  "Apply term selection (doc step)":
    '[role="dialog"] button:has-text("Apply"), button[data-test-id*="apply" i]',
  "Save and Close (doc step)": '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...TaxInput,
  ...AddInput,
  "Taxonomy field Display Name input (doc step)":
    '[data-test-id="cs-ctf-taxonomy-basic-name"] input, .FieldProperties [data-test-id="cs-ctf-taxonomy-basic-name"] input',
};

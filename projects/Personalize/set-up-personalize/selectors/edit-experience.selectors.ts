/**
 * **Edit an Experience** — Experiences listing (`data/dom/Personalize/experiences.html`): row **⋮**
 * `button[data-test-id="cs-table-action-options"]` → wait **`VERTICAL_ELLIPSIS_POST_OPEN_MS`** (default **2000** ms) →
 * **`[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]`** (hover, click; inner `a` when present).
 * Doc names [**Edit**](https://www.contentstack.com/docs/personalize/edit-experience); UI may show **Edit Text** (handled in **`actionRules.ts`**).
 *
 * Editor shell matches **create-segmented-experience** (`segmented-experience-page.html`, `seg-exp-configuration.html`).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',

  /** Doc step 3: **Actions** column on the experiences table (`experiences.html`). */
  "Edit Experience doc: verify Experiences table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Edit Experience doc: verify row Actions vertical tooltip Edit menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Edit Experience doc: Experiences row Actions Edit menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  /** Listing — same as **Create Segmented Experience** experience editor. */
  "Edit Experience doc: Experiences page title (doc step)": '[data-test-id="cs-page-title"]',

  "Edit Experience doc: Overview tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"].ListRowV2--active [data-test-id="cs-truncate"]:text-is("Overview"), main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Overview")',

  "Edit Experience doc: Overview Name field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-name-text-input"]',

  "Edit Experience doc: Overview Description field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-description-text-input"]',

  "Edit Experience doc: verify Save General Details button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  "Edit Experience doc: Configuration tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',

  "Edit Experience doc: experience editor left navigation Configuration tab (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',

  /**
   * Draft layout varies by experience type; product may render **Variants** under `#PageLayout__body` without
   * `segmented-*` / `ab-*` draft wrappers (`data/dom/Personalize/seg-exp-configuration.html` vs live).
   */
  "Edit Experience doc: Configuration Variants section heading (doc step)":
    [
      'main#react-personalize [data-testid="segmented-experience-draft-config-body"] h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize [data-testid="segmented-experience-draft-config-body"] h2[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize [data-testid="ab-testing-experience-draft-config-body"] h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize [data-testid="ab-test-experience-draft-config-body"] h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize [data-testid="ab-testing-experience-draft-config-body"] h2[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize [data-testid="ab-test-experience-draft-config-body"] h2[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize #PageLayout__body h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize #PageLayout__body h2[data-test-id="cs-heading-tag"]:has-text("Variants")',
      '#PageLayout__body h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
      '.experience-page-layout__content h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
      'main#react-personalize h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
    ].join(", "),

  "Edit Experience doc: verify Save Draft button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft")',

  "Edit Experience doc: Overview Save General Details footer button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  "Edit Experience doc: experience Configuration footer Save Draft button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Edit Experience doc: Overview experience Name field (doc step)": '[data-testid="experience-name-text-input"]',
  "Edit Experience doc: Overview experience Description field (doc step)": '[data-testid="experience-description-text-area"]',
};

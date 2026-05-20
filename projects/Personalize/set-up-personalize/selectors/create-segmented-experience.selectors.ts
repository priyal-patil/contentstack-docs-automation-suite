/**
 * Create a Segmented Experience — DOM: `data/dom/Personalize/experiences.html`,
 * `select-experience-type.html`, `segmented-experience-page.html`, `seg-exp-configuration.html`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',

  /** Listing / modals — also used for **`verify`** steps. */
  "Create Segmented Experience doc: Experiences page title (doc step)": '[data-test-id="cs-page-title"]',
  /** Empty Experiences list: **New Experience** may live under `main` without `#react-personalize` (see Playwright error-context snapshot). */
  "Create Segmented Experience doc: verify New Experience button (doc step)":
    'main button:has-text("New Experience"), main#react-personalize button[aria-label="create-experience-button"], main#react-personalize button:has-text("New Experience"), main#react-personalize [data-test-id="cs-page-layout-header"] button:has-text("New Experience")',
  "Create Segmented Experience doc: Select Experience Type modal title (doc step)":
    '[data-test-id="cs-modal-title-select-experience-type"]',
  "Create Segmented Experience doc: Overview tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"].ListRowV2--active [data-test-id="cs-truncate"]:text-is("Overview")',
  "Create Segmented Experience doc: Overview Name field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-name-text-input"]',
  "Create Segmented Experience doc: Overview Description field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-description-text-input"]',
  "Create Segmented Experience doc: verify Save General Details button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',
  "Create Segmented Experience doc: Configuration Variants section heading (doc step)":
    'main#react-personalize [data-testid="segmented-experience-draft-config-body"] h3[data-test-id="cs-heading-tag"]:has-text("Variants")',
  "Create Segmented Experience doc: Configuration Variant Name field label (doc step)":
    'main#react-personalize [data-testid="segmented-experience-draft-config-body"] span.jdF5L0pgnV92S2TcC4UF:has-text("Variant name")',
  /** Variants table column headers (same typography class as Variant name). */
  "Create Segmented Experience doc: Configuration variants table Short UID column header (doc step)":
    'main#react-personalize [data-testid="segmented-experience-draft-config-body"] span.jdF5L0pgnV92S2TcC4UF:has-text("Short UID")',
  "Create Segmented Experience doc: Configuration variants table Condition column header (doc step)":
    'main#react-personalize [data-testid="segmented-experience-draft-config-body"] span.jdF5L0pgnV92S2TcC4UF:has-text("Condition")',
  "Create Segmented Experience doc: Configuration variants table Audiences column header (doc step)":
    'main#react-personalize [data-testid="segmented-experience-draft-config-body"] span.jdF5L0pgnV92S2TcC4UF:has-text("Audiences")',
  "Create Segmented Experience doc: verify Save Draft button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft")',
  /** Doc optional step 8 — footer (after Save Draft). */
  "Create Segmented Experience doc: verify Activate Draft footer button (doc step)":
    'main button[data-testid="experience-footer-activate-draft-button"], main button:has-text("Activate Draft"), main#react-personalize button[data-testid="experience-footer-activate-draft-button"], main#react-personalize button:has-text("Activate Draft")',
  /** Confirmation dialog after **Activate Draft** — primary **Activate** (doc-named). */
  "Create Segmented Experience doc: verify Activate confirmation modal Activate button (doc step)":
    '[role="dialog"] button[data-test-id="cs-button"]:has-text("Activate"), [role="dialog"] button:has-text("Activate")',

  /** Experiences listing — `main` may omit `#react-personalize` on empty-state Experiences. */
  "Create Segmented Experience doc: Experiences page New Experience button (doc step)":
    'main button:has-text("New Experience"), main#react-personalize button[aria-label="create-experience-button"], main#react-personalize button:has-text("New Experience"), main#react-personalize [data-test-id="cs-page-layout-header"] button:has-text("New Experience")',

  /** Modal (`select-experience-type.html`). */
  "Create Segmented Experience doc: Select Experience Type modal Segmented experience type card (doc step)":
    '[data-testid="segmented-experience"], [role="dialog"] [data-testid="segmented-experience"]',
  /** Doc: **Segmented** experience type — title on the card (`h2` in modal). */
  "Create Segmented Experience doc: Select Experience Type modal Segmented experience type heading (doc step)":
    '[role="dialog"] [data-testid="segmented-experience"] h2, [role="dialog"] [data-testid="segmented-experience"] [class*="Heading"]',

  /** Draft experience — left nav (`segmented-experience-page.html`). */
  "Create Segmented Experience doc: experience editor left navigation Overview tab (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Overview")',
  /** Doc step 6: **Configuration** tab (left sidebar). */
  "Create Segmented Experience doc: Configuration tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',
  "Create Segmented Experience doc: experience editor left navigation Configuration tab (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',

  "Create Segmented Experience doc: Overview Save General Details footer button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  /** Variants (`seg-exp-configuration.html`). Doc: **+ Add Variant** — plus may be icon-only in accessible name. */
  "Create Segmented Experience doc: verify + Add Variant button (doc step)":
    'main#react-personalize button[data-testid="add-variant-button"]',
  "Create Segmented Experience doc: Configuration Variants Add Variant button (doc step)":
    'main#react-personalize button[data-testid="add-variant-button"]',

  "Create Segmented Experience doc: Configuration Variants first variant Audiences field open (doc step)":
    'main#react-personalize [data-testid="segmented-experience-draft-config-body"] [data-test-id="cs-tag-as-select"]:has-text("Select audiences"), main#react-personalize [data-testid="segmented-experience-draft-config-body"] [data-test-id="cs-tag-as-select"]',

  "Create Segmented Experience doc: experience Configuration footer Save Draft button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft")',

  "Create Segmented Experience doc: experience footer Activate Draft button (doc step)":
    'main button[data-testid="experience-footer-activate-draft-button"], main button:has-text("Activate Draft"), main#react-personalize button[data-testid="experience-footer-activate-draft-button"], main#react-personalize button:has-text("Activate Draft")',

  "Create Segmented Experience doc: Activate Experience confirmation modal Activate button (doc step)":
    '[role="dialog"] button[data-test-id="cs-button"]:has-text("Activate"), [role="dialog"] button:has-text("Activate")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Create Segmented Experience doc: Overview experience Name field (doc step)": '[data-testid="experience-name-text-input"]',
  "Create Segmented Experience doc: Overview experience Description field (doc step)": '[data-testid="experience-description-text-area"]',
  "Create Segmented Experience doc: Configuration first variant Variant Name field (doc step)": '[data-testid="variant-name-text-input"]',
};

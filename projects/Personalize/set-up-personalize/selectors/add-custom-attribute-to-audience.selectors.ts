/**
 * Add a Custom Attribute to an Audience — DOM: `data/dom/Personalize/audiences.html`, `create-audiences.html`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Audiences (doc step)": '[data-test-id="personalize-nav-audiences"]',

  /**
   * Listing with rows: header `add-new-audience-button`. Empty state: centered primary CTA (same doc label, different DOM).
   */
  "Add Custom Attribute Audience doc: verify Audiences listing New Audience primary button (doc step)":
    'main#react-personalize button[data-testid="add-new-audience-button"], main#react-personalize [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Audience"), main#react-personalize button.Button--primary:has-text("New Audience"), main#react-personalize button:has-text("New Audience")',

  "Add Custom Attribute Audience doc: Audiences listing New Audience primary button (doc step)":
    'main#react-personalize button[data-testid="add-new-audience-button"], main#react-personalize [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Audience"), main#react-personalize button.Button--primary:has-text("New Audience"), main#react-personalize button:has-text("New Audience")',

  "Audience editor Name field label (doc step)": '[data-testid="audience-name-section"] label[data-test-id="cs-field-label"]',

  "Audience editor Description field label (doc step)": '[data-testid="audience-description-section"] label[data-test-id="cs-field-label"]',

  "Add Custom Attribute Audience doc: verify Rules section Add Rule primary button (doc step)":
    '[data-testid="audience-rule-builder-section"] button[aria-label="audience-add-rule-button"], main#react-personalize button[aria-label="audience-add-rule-button"]',

  "Add Custom Attribute Audience doc: Audience editor Rules section Add Rule button (doc step)":
    '[data-testid="audience-rule-builder-section"] button[aria-label="audience-add-rule-button"], main#react-personalize button[aria-label="audience-add-rule-button"]',

  "Audience editor Select Attribute field label (doc step)":
    'main#react-personalize #audience-rule-attribute-select label[data-test-id="cs-field-label"], [data-testid="audience-rule-builder-section"] #audience-rule-attribute-select label[data-test-id="cs-field-label"], main#react-personalize [data-testid="audience-rule"] [data-testid="rule-field"]:first-of-type label[data-test-id="cs-field-label"], main#react-personalize label[data-test-id="cs-field-label"]:has(span:has-text("Attribute"))',

  "Audience editor Select Operator field label (doc step)":
    'main#react-personalize #audience-rule-operator-select label[data-test-id="cs-field-label"], [data-testid="audience-rule-builder-section"] #audience-rule-operator-select label[data-test-id="cs-field-label"], main#react-personalize [data-testid="audience-rule"] [data-testid="rule-field"] + [data-testid="rule-field"] label[data-test-id="cs-field-label"], main#react-personalize label[data-test-id="cs-field-label"]:has(span:has-text("Operator"))',

  /** Shown once attribute + operator are chosen (label may omit “Select” depending on UX). */
  "Audience editor Select Value field label (doc step)":
    '[data-testid="audience-rule"] [data-testid="rule-field"]:has(label span:has-text("Select Value")) label[data-test-id="cs-field-label"], [data-testid="audience-rule"] label[data-test-id="cs-field-label"]:has(span:has-text("Value"))',

  "Add Custom Attribute Audience doc: verify Save button audience editor header (doc step)":
    'main#react-personalize .audience-creation-page button[aria-label="audience-create-button"], main#react-personalize button[aria-label="audience-create-button"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize Audience editor Name field (doc step)": '[data-testid="audience-name-input"]',

  "Personalize Audience editor Description field (doc step)": '[data-testid="audience-description-input"]',
};

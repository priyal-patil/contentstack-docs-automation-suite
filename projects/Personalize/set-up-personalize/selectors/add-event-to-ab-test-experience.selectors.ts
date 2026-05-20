/**
 * Add an Event to an A/B Test Experience — DOM: same as **create-ab-test-experience**
 * (`experiences.html`, `select-experience-type.html`, `ab-testing-experience-draft-config-body`).
 */

const draftConfigA = 'main#react-personalize [data-testid="ab-testing-experience-draft-config-body"]';
const draftConfigB = 'main#react-personalize [data-testid="ab-test-experience-draft-config-body"]';

function abBoth(suffix: string): string {
  return `${draftConfigA}${suffix}, ${draftConfigB}${suffix}`;
}

const mainPersonalize = "main#react-personalize";

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',

  "Add Event to A/B Test Experience doc: Experiences page title (doc step)": '[data-test-id="cs-page-title"]',
  "Add Event to A/B Test Experience doc: verify New Experience button (doc step)":
    'main button:has-text("New Experience"), main#react-personalize button[aria-label="create-experience-button"], main#react-personalize button:has-text("New Experience"), main#react-personalize [data-test-id="cs-page-layout-header"] button:has-text("New Experience")',
  "Add Event to A/B Test Experience doc: Select Experience Type modal title (doc step)":
    '[data-test-id="cs-modal-title-select-experience-type"]',
  "Add Event to A/B Test Experience doc: Select Experience Type modal A/B Test experience type card (doc step)":
    '[data-testid="ab-testing-experience"], [role="dialog"] [data-testid="ab-testing-experience"]',
  "Add Event to A/B Test Experience doc: Select Experience Type modal A/B Test experience type heading (doc step)":
    '[role="dialog"] [data-testid="ab-testing-experience"] h2, [role="dialog"] [data-testid="ab-testing-experience"] [class*="Heading"]',

  "Add Event to A/B Test Experience doc: Overview tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"].ListRowV2--active [data-test-id="cs-truncate"]:text-is("Overview"), main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Overview")',
  "Add Event to A/B Test Experience doc: Overview Name field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-name-text-input"]',
  "Add Event to A/B Test Experience doc: Overview Description field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-description-text-input"]',
  "Add Event to A/B Test Experience doc: verify Save General Details button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details"), main button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  "Add Event to A/B Test Experience doc: Configuration tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',
  "Add Event to A/B Test Experience doc: experience editor left navigation Configuration tab (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',

  "Add Event to A/B Test Experience doc: Configuration Metrics section heading (doc step)": `${abBoth(
    ' h3[data-test-id="cs-heading-tag"]:has-text("Metrics")'
  )}, ${mainPersonalize} h3[data-test-id="cs-heading-tag"]:has-text("Metrics"), #PageLayout__body h3[data-test-id="cs-heading-tag"]:has-text("Metrics")`,
  "Add Event to A/B Test Experience doc: verify Metrics Add Event button (doc step)": `${abBoth(
    ' button:has-text("Add Event")'
  )}, ${abBoth(' [data-testid="add-metric-event-button"]')}, main#react-personalize button:has-text("Add Event")`,
  "Add Event to A/B Test Experience doc: Configuration Metrics Add Event button (doc step)": `${abBoth(
    ' button:has-text("Add Event")'
  )}, ${abBoth(' [data-testid="add-metric-event-button"]')}, main#react-personalize button:has-text("Add Event")`,

  "Add Event to A/B Test Experience doc: verify Configuration footer Save button (doc step)":
    'main button[data-testid="experience-footer-save-button"], main#react-personalize button[data-testid="experience-footer-save-button"]',

  "Add Event to A/B Test Experience doc: Experiences page New Experience button (doc step)":
    'main button:has-text("New Experience"), main#react-personalize button[aria-label="create-experience-button"], main#react-personalize button:has-text("New Experience"), main#react-personalize [data-test-id="cs-page-layout-header"] button:has-text("New Experience")',

  "Add Event to A/B Test Experience doc: Overview Save General Details footer button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details"), main button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  "Add Event to A/B Test Experience doc: Configuration footer Save button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main button[data-testid="experience-footer-save-button"]:has-text("Save"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Add Event to A/B Test Experience doc: Overview experience Name field (doc step)": '[data-testid="experience-name-text-input"]',
  "Add Event to A/B Test Experience doc: Overview experience Description field (doc step)": '[data-testid="experience-description-text-area"]',
};

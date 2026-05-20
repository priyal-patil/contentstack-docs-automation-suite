/**
 * Create an A/B Test Experience — DOM: `data/dom/Personalize/experiences.html`,
 * `select-experience-type.html` (`data-testid="ab-testing-experience"`), A/B draft configuration
 * (expected `data-testid="ab-testing-experience-draft-config-body"`).
 */

const draftConfigA = 'main#react-personalize [data-testid="ab-testing-experience-draft-config-body"]';
const draftConfigB = 'main#react-personalize [data-testid="ab-test-experience-draft-config-body"]';

/**
 * Comma-separated `data-testid` roots must not be concatenated with one descendant — CSS would parse
 * `rootA, rootB h3` as two selectors where the first has no `h3`. Repeat the same suffix after each root.
 */
function abBoth(suffix: string): string {
  return `${draftConfigA}${suffix}, ${draftConfigB}${suffix}`;
}

/** When the draft container `data-testid` differs in prod, still resolve headings/controls under `main#react-personalize`. */
const mainPersonalize = "main#react-personalize";

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',

  "Create A/B Test Experience doc: Experiences page title (doc step)": '[data-test-id="cs-page-title"]',
  "Create A/B Test Experience doc: verify New Experience button (doc step)":
    'main button:has-text("New Experience"), main#react-personalize button[aria-label="create-experience-button"], main#react-personalize button:has-text("New Experience"), main#react-personalize [data-test-id="cs-page-layout-header"] button:has-text("New Experience")',
  "Create A/B Test Experience doc: Select Experience Type modal title (doc step)":
    '[data-test-id="cs-modal-title-select-experience-type"]',
  "Create A/B Test Experience doc: Select Experience Type modal A/B Test experience type card (doc step)":
    '[data-testid="ab-testing-experience"], [role="dialog"] [data-testid="ab-testing-experience"]',
  "Create A/B Test Experience doc: Select Experience Type modal A/B Test experience type heading (doc step)":
    '[role="dialog"] [data-testid="ab-testing-experience"] h2, [role="dialog"] [data-testid="ab-testing-experience"] [class*="Heading"]',

  "Create A/B Test Experience doc: Overview tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"].ListRowV2--active [data-test-id="cs-truncate"]:text-is("Overview"), main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Overview")',
  "Create A/B Test Experience doc: Overview Name field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-name-text-input"]',
  "Create A/B Test Experience doc: Overview Description field label (doc step)":
    'label[data-test-id="cs-field-label"][for="experience-description-text-input"]',
  "Create A/B Test Experience doc: verify Save General Details button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details"), main button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  "Create A/B Test Experience doc: Configuration tab label (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',
  "Create A/B Test Experience doc: experience editor left navigation Configuration tab (doc step)":
    'main#react-personalize [data-test-id="cs-list-row"] [data-test-id="cs-truncate"]:text-is("Configuration")',

  /** Variants (doc §7). */
  "Create A/B Test Experience doc: Configuration Variants section heading (doc step)": `${abBoth(' h3[data-test-id="cs-heading-tag"]:has-text("Variants")')}, ${mainPersonalize} h3[data-test-id="cs-heading-tag"]:has-text("Variants"), #PageLayout__body h3[data-test-id="cs-heading-tag"]:has-text("Variants")`,
  "Create A/B Test Experience doc: Configuration Variant Distribution label (doc step)": `${abBoth(' [data-test-id="cs-heading-tag"]:has-text("Variant Distribution")')}, ${abBoth(' :text-is("Variant Distribution")')}, ${mainPersonalize} [data-test-id="cs-heading-tag"]:has-text("Variant Distribution"), ${mainPersonalize} :text-is("Variant Distribution")`,
  "Create A/B Test Experience doc: Configuration Equally split distribution option label (doc step)":
    `${abBoth(' :text-is("Equally split")')}, ${abBoth(' label:has-text("Equally split")')}, ${abBoth(' [data-test-id="cs-radio-label"]:has-text("Equally split")')}, ${mainPersonalize} :text-is("Equally split"), ${mainPersonalize} label:has-text("Equally split")`,
  "Create A/B Test Experience doc: Configuration Variant Distribution dropdown open (doc step)":
    `${abBoth(' [data-test-id="cs-select"] .Select__control')}, ${abBoth(' [data-test-id="cs-select"] .Portal__control')}, ${mainPersonalize} [data-test-id="cs-select"] .Select__control`,
  "Create A/B Test Experience doc: Configuration Variant Distribution dropdown choose Equally split (doc step)":
    `[role="listbox"] [role="option"]:has-text("Equally split"), .Select__menu [role="option"]:has-text("Equally split")`,
  "Create A/B Test Experience doc: Variant Distribution dropdown option Custom (doc step)":
    `[role="listbox"] [role="option"]:has-text("Custom"), .Select__menu [role="option"]:has-text("Custom")`,
  "Create A/B Test Experience doc: Variant Distribution dropdown option Multi-Armed Bandit (doc step)":
    `[role="listbox"] [role="option"]:has-text(/Multi[-\\s]*Armed[-\\s]*Bandit/i), .Select__menu [role="option"]:has-text(/Multi[-\\s]*Armed[-\\s]*Bandit/i), [role="listbox"] [role="option"]:has-text("(MAB)"), .Select__menu [role="option"]:has-text("(MAB)")`,

  "Create A/B Test Experience doc: verify + Add Variant button (doc step)":
    `${abBoth(' button[data-testid="add-variant-button"]')}, main#react-personalize button[data-testid="add-variant-button"]`,
  "Create A/B Test Experience doc: Configuration Variants Add Variant button (doc step)":
    `${abBoth(' button[data-testid="add-variant-button"]')}, main#react-personalize button[data-testid="add-variant-button"]`,

  "Create A/B Test Experience doc: Configuration variants table Short UID column header (doc step)":
    `${mainPersonalize} [role="columnheader"]:has-text("Short UID"), ${mainPersonalize} th:has-text("Short UID"), ${mainPersonalize} :text-is("Short UID"), #PageLayout__body :text-is("Short UID"), ${abBoth(' span.jdF5L0pgnV92S2TcC4UF:has-text("Short UID")')}, ${abBoth(' :text-is("Short UID")')}, ${mainPersonalize} span.jdF5L0pgnV92S2TcC4UF:has-text("Short UID")`,
  "Create A/B Test Experience doc: Configuration Variant Name field label (doc step)":
    `${mainPersonalize} [role="columnheader"]:has-text("Variant name"), ${mainPersonalize} :text-is("Variant name"), #PageLayout__body :text-is("Variant name"), ${abBoth(' span.jdF5L0pgnV92S2TcC4UF:has-text("Variant name")')}, ${abBoth(' :text-is("Variant name")')}, ${mainPersonalize} span.jdF5L0pgnV92S2TcC4UF:has-text("Variant name")`,
  "Create A/B Test Experience doc: Configuration variants Traffic Distribution column header (doc step)":
    `${mainPersonalize} [role="columnheader"]:has-text("Traffic Distribution"), ${mainPersonalize} :text-is("Traffic Distribution in %"), ${mainPersonalize} :text-is("Traffic Distribution"), #PageLayout__body :text-is("Traffic Distribution"), ${abBoth(' span.jdF5L0pgnV92S2TcC4UF:has-text("Traffic Distribution")')}, ${abBoth(' :text-is("Traffic Distribution in %")')}, ${abBoth(' :text-is("Traffic Distribution")')}, ${mainPersonalize} span.jdF5L0pgnV92S2TcC4UF:has-text("Traffic Distribution")`,

  /** Metrics (doc §8). */
  "Create A/B Test Experience doc: Configuration Metrics section heading (doc step)": `${abBoth(' h3[data-test-id="cs-heading-tag"]:has-text("Metrics")')}, ${mainPersonalize} h3[data-test-id="cs-heading-tag"]:has-text("Metrics"), #PageLayout__body h3[data-test-id="cs-heading-tag"]:has-text("Metrics")`,
  "Create A/B Test Experience doc: verify Metrics Add Event button (doc step)": `${abBoth(' button:has-text("Add Event")')}, ${abBoth(' [data-testid="add-metric-event-button"]')}, main#react-personalize button:has-text("Add Event")`,
  "Create A/B Test Experience doc: Configuration Metrics Add Event button (doc step)": `${abBoth(' button:has-text("Add Event")')}, ${abBoth(' [data-testid="add-metric-event-button"]')}, main#react-personalize button:has-text("Add Event")`,

  /** Target Group — doc §9 (Selective). */
  "Create A/B Test Experience doc: Configuration Target Group section heading (doc step)": `${abBoth(' h3[data-test-id="cs-heading-tag"]:has-text("Target Group")')}, ${abBoth(' :text-is("Target Group")')}, ${mainPersonalize} h3[data-test-id="cs-heading-tag"]:has-text("Target Group")`,
  "Create A/B Test Experience doc: Configuration Target Group Selective option (doc step)": `${abBoth(' label:has-text("Selective")')}, ${abBoth(' :text-is("Selective")')}, ${mainPersonalize} label:has-text("Selective")`,
  "Create A/B Test Experience doc: Configuration Target Group Condition field label (doc step)": `${abBoth(' :text-is("Condition")')}, ${mainPersonalize} :text-is("Condition")`,
  "Create A/B Test Experience doc: Configuration Target Group Match All condition value label (doc step)": `${abBoth(' :text-is("Match All")')}, ${mainPersonalize} :text-is("Match All")`,

  "Create A/B Test Experience doc: Configuration Target Group Audiences field open (doc step)":
    `${abBoth(' [data-test-id="cs-tag-as-select"]:has-text("Select audiences")')}, ${abBoth(' [data-test-id="cs-tag-as-select"]')}, ${mainPersonalize} [data-test-id="cs-tag-as-select"]:has-text("Select audiences")`,

  "Create A/B Test Experience doc: verify Save Draft button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft")',
  "Create A/B Test Experience doc: verify Activate Draft footer button (doc step)":
    'main button[data-testid="experience-footer-activate-draft-button"], main button:has-text("Activate Draft"), main#react-personalize button[data-testid="experience-footer-activate-draft-button"], main#react-personalize button:has-text("Activate Draft")',
  "Create A/B Test Experience doc: verify Activate confirmation modal Activate button (doc step)":
    '[role="dialog"] button[data-test-id="cs-button"]:has-text("Activate"), [role="dialog"] button:has-text("Activate")',

  "Create A/B Test Experience doc: Experiences page New Experience button (doc step)":
    'main button:has-text("New Experience"), main#react-personalize button[aria-label="create-experience-button"], main#react-personalize button:has-text("New Experience"), main#react-personalize [data-test-id="cs-page-layout-header"] button:has-text("New Experience")',

  "Create A/B Test Experience doc: Overview Save General Details footer button (doc step)":
    'main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save General Details"), main button[data-testid="experience-footer-save-button"]:has-text("Save General Details")',

  "Create A/B Test Experience doc: experience Configuration footer Save Draft button (doc step)":
    'main button[data-testid="experience-footer-save-button"]:has-text("Save Draft"), main#react-personalize button[data-testid="experience-footer-save-button"]:has-text("Save Draft")',

  "Create A/B Test Experience doc: experience footer Activate Draft button (doc step)":
    'main button[data-testid="experience-footer-activate-draft-button"], main button:has-text("Activate Draft"), main#react-personalize button[data-testid="experience-footer-activate-draft-button"], main#react-personalize button:has-text("Activate Draft")',

  "Create A/B Test Experience doc: Activate Experience confirmation modal Activate button (doc step)":
    '[role="dialog"] button[data-test-id="cs-button"]:has-text("Activate"), [role="dialog"] button:has-text("Activate")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Create A/B Test Experience doc: Overview experience Name field (doc step)": '[data-testid="experience-name-text-input"]',
  "Create A/B Test Experience doc: Overview experience Description field (doc step)": '[data-testid="experience-description-text-area"]',
  /** First variant row — `.first()` in runner; second row uses a dedicated `enter` branch in actionRules.ts. */
  "Create A/B Test Experience doc: Configuration first variant Variant Name field (doc step)":
    'main#react-personalize [data-testid="variant-name-text-input"], #PageLayout__body [data-testid="variant-name-text-input"], main#react-personalize [data-testid="ab-testing-experience-draft-config-body"] [data-testid="variant-name-text-input"], main#react-personalize [data-testid="ab-test-experience-draft-config-body"] [data-testid="variant-name-text-input"]',
};

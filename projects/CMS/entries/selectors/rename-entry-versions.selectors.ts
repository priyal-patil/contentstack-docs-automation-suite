export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")',
  "Version icon (doc step)":
    '[data-test-id="cs-entry-version-icon-wrapper"], [data-test-id="cs-entry-version-header-icon"]',
  "Second version timeline row (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-version"])[2]',
  "Second version rename icon (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-edit"])[2]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Version name input (doc step)":
    '[data-test-id="cs-version-timeline-version"] input, input[aria-label*="version" i], input[placeholder*="version" i], [data-test-id="cs-version-timeline-version-name"][contenteditable="true"]',
};

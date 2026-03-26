export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Version icon (doc step)":
    '[data-test-id="cs-entry-version-icon-wrapper"], [data-test-id="cs-entry-version-header-icon"]',
  "Second version timeline row (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-version"])[2]',
  "Second version compare icon (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-compare"])[1]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

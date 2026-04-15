export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")',
  "Version icon (doc step)":
    '[data-test-id="cs-entry-version-header-icon"]',
  "Second version timeline row (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-version"])[2]',
  "Restore version (doc step)":
    '[data-test-id*="restore"], button:has-text("Restore"), [role="button"]:has-text("Restore"), [aria-label*="restore" i], [role="button"]:has(svg[name="Restore"]), button:has(svg[name="Restore"])',
  "Confirm restore (doc step)":
    '[role="dialog"] button:has-text("Restore"), [role="dialog"] button:has-text("Confirm"), [role="dialog"] button:has-text("Continue"), [role="dialog"] [data-test-id*="restore"], [role="dialog"] [role="button"]:has(svg[name="Restore"]), [role="dialog"] button:has(svg[name="Restore"])',
};

export const INPUT_SELECTORS: Record<string, string> = {};

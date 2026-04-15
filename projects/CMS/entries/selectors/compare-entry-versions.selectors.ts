/**
 * Compare entry versions — Version History sidebar (hover version row → Compare).
 * @see data/dom/CMS/entries/version-history.html
 */

/** Scroll target so the timeline / Compare controls are in view. */
export const VERSION_HISTORY_SCROLL_INTO_VIEW =
  '#versionScrollableDiv, .SidebarWindow__content__body, [data-test-id="cs-version-timeline"]';

export const VERSION_TIMELINE = '[data-test-id="cs-version-timeline"]';
export const VERSION_TIMELINE_VERSION = '[data-test-id="cs-version-timeline-version"]';
/** Compare control: `role="button"`, optional `aria-label` like "Compare Version 3 with Version 2". */
export const VERSION_TIMELINE_COMPARE = '[data-test-id="cs-version-timeline-compare"]';
/** Non-latest rows only: latest timeline block usually has no Compare. */
export const VERSION_TIMELINE_BLOCK_WITH_COMPARE = `${VERSION_TIMELINE}:has(${VERSION_TIMELINE_COMPARE})`;
export const VERSION_TIMELINE_ACTION_BUTTONS = ".VersionTimeline__action-buttons";

export const CLICK_SELECTORS: Record<string, string> = {
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Version icon (doc step)":
    '[data-test-id="cs-entry-version-header-icon"]',
  "Second version timeline row (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-version"])[2]',
  "Second version compare icon (doc step)": VERSION_TIMELINE_COMPARE,
};

export const INPUT_SELECTORS: Record<string, string> = {};

/**
 * Create an Event — DOM: `data/dom/Personalize/events-list.html`, `create-new-event.html`.
 */

const newEventModalRoot = '[role="dialog"]:has([data-test-id="cs-modal-title-new-event"])';

/**
 * The "New Event" call to action, which moves depending on whether any events exist.
 *
 * With events in the list it sits in the page header. With NONE it is rendered inside the empty state
 * instead, and the header button does not exist at all — which is why step 9 failed on a stack with an
 * empty Events list while the same selector worked elsewhere. From the saved failure DOM:
 *
 *   <button data-test-id="cs-button" class="Button Button--primary … Button--icon-alignment-left"
 *           aria-label="aria-button" data-testid="empty-state-new-audience-button">
 *     <svg name="Plus" …/>New Event
 *   </button>
 *
 * Two things to note. The plus is an `<svg name="Plus">`, not text, so the doc's "+ New Event" can only
 * match once the leading glyph is treated as optional (see `core/labelMatch.ts`). And the empty-state
 * button carries `data-testid="empty-state-new-audience-button"` on a control labelled *New Event* — an
 * app-side copy-paste from the Audiences empty state. That test id is therefore matched only as a
 * fallback AFTER a text-based match on the empty-state container, so a fix on the app side to rename it
 * cannot break this selector.
 */
const newEventCta = [
  '[data-testid="new-event-button"]',
  '[data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Event")',
  '[data-test-id="cs-empty-state-actions"] button:has-text("New Event")',
  '[data-testid="empty-state-new-audience-button"]',
].join(", ");

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize workspace top navigation Events (doc step)": '[data-test-id="personalize-nav-events"]',
  "Create Event doc: verify Events page + New Event primary button (doc step)": newEventCta,
  "Create Event doc: Events page + New Event primary button (doc step)": newEventCta,
  "New Event modal title (doc step)": '[data-test-id="cs-modal-title-new-event"]',
  "New Event Key field label (doc step)": `${newEventModalRoot} label[data-test-id="cs-field-label"]:has-text("Key")`,
  "New Event Description field label (doc step)": `${newEventModalRoot} label[data-test-id="cs-field-label"]:has-text("Description")`,
  "Create Event doc: verify Create button in modal (doc step)": `${newEventModalRoot} [data-testid="event-form-submit"]`,
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize New Event modal Key field (doc step)": `${newEventModalRoot} [data-testid="key-input"]`,
  "Personalize New Event modal Description field (doc step)": `${newEventModalRoot} [data-testid="description-input"]`,
};

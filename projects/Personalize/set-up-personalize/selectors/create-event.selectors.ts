/**
 * Create an Event — DOM: `data/dom/Personalize/events-list.html`, `create-new-event.html`.
 */

const newEventModalRoot = '[role="dialog"]:has([data-test-id="cs-modal-title-new-event"])';

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',
  "Personalize workspace top navigation Events (doc step)": '[data-test-id="personalize-nav-events"]',
  "Create Event doc: verify Events page + New Event primary button (doc step)":
    '[data-testid="new-event-button"], [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Event")',
  "Create Event doc: Events page + New Event primary button (doc step)":
    '[data-testid="new-event-button"], [data-test-id="cs-page-layout-header"] button.Button--primary:has-text("New Event")',
  "New Event modal title (doc step)": '[data-test-id="cs-modal-title-new-event"]',
  "New Event Key field label (doc step)": `${newEventModalRoot} label[data-test-id="cs-field-label"]:has-text("Key")`,
  "New Event Description field label (doc step)": `${newEventModalRoot} label[data-test-id="cs-field-label"]:has-text("Description")`,
  "Create Event doc: verify Create button in modal (doc step)": `${newEventModalRoot} [data-testid="event-form-submit"]`,
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize New Event modal Key field (doc step)": `${newEventModalRoot} [data-testid="key-input"]`,
  "Personalize New Event modal Description field (doc step)": `${newEventModalRoot} [data-testid="description-input"]`,
};

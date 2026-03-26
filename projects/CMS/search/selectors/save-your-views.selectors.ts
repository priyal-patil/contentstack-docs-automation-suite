/**
 * Selectors for Save Your Views flow.
 * DOM reference: data/dom/CMS/entries/left-nav-views.html, data/dom/CMS/search/save-view-modal.html, data/dom/CMS/entries/entries-list.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Views tab in left panel (doc step)":
    '[data-test-id="cs-entries-view-tab"], .Tab__item:has-text("Views"), [data-test-id="cs-entries-list-left-tab"] [data-test-id="cs-entries-view-tab"]',
  "Popular Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-popular_view-open"] .Accordion__heading__title, .Accordion__heading__title:has-text("Popular Views")',
  "Last Modified by Me view (doc step)":
    '[data-test-id="cs-entries-popular-views-item"]:has-text("Last Modified by Me"), .views-container--item:has-text("Last Modified by Me")',
  "Search submit button (doc step)":
    '[data-test-id="cs-search-bar-input-submit"], [data-test-id="cs-entries-inline-search"] button[data-test-id="cs-search-bar-input-submit"]',
  "View name dropdown in top-right (doc step)":
    '[data-test-id="cs-entries-update-view-action"], button:has([data-test-id^="cs-entries-update-view--"]), .updateViewAction button',
  "Save as new view menu item (doc step)":
    '[role="menuitem"]:has-text("Save as new view"), li:has-text("Save as new view"), .Dropdown__menu__list__item:has-text("Save as new view")',
  "Save button in Save View modal (doc step)":
    '[data-test-id="cs-save-as-view-save"], [data-testid="cs-views-saved-view"] button:has-text("Save")',
  "Saved Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-view-close"] .Accordion__heading, [data-test-id="cs-entries-lhs-views-view-close"], .Accordion__heading:has-text("Saved Views")',
  "Saved view listed under Saved Views (doc step)":
    '[data-test-id="cs-entries-lhs-views-view-close"] .views-container--item:has-text("My Saved View"), [data-test-id="cs-entries-lhs-views-view-close"] [data-test-id="cs-entries-saved-views-item"], .views-container--item:has-text("My Saved View")',
  "Save View modal (doc step)":
    '[data-testid="cs-views-saved-view"], [data-test-id="cs-modal-title-save-view"]',
  "Name field in Save View modal (doc step)":
    '[data-test-id="cs-save-as-view-title"], [data-testid="cs-views-saved-view"] label:has-text("Name")',
};

export const VERIFY_SELECTORS: Record<string, string> = {
  "Views tab in left panel (doc step)":
    '[data-test-id="cs-entries-view-tab"], .Tab__item:has-text("Views")',
  "Popular Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-popular_view-open"], .Accordion__heading__title:has-text("Popular Views")',
  "View name dropdown in top-right (doc step)":
    '[data-test-id="cs-entries-update-view-action"], .viewName',
  "Save View modal (doc step)":
    '[data-testid="cs-views-saved-view"], [data-test-id="cs-modal-title-save-view"]',
  "Name field in Save View modal (doc step)":
    '[data-test-id="cs-save-as-view-title"], label:has-text("Name")',
  "Save button in Save View modal (doc step)":
    '[data-test-id="cs-save-as-view-save"], button:has-text("Save")',
  "Saved view listed under Saved Views (doc step)":
    '[data-test-id="cs-entries-lhs-views-view-close"], [data-test-id="cs-entries-lhs-views-view"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Search bar input (doc step)":
    '[data-test-id="cs-entries-inline-search"] input, [data-test-id="cs-search-bar-input"] input, [data-test-id="cs-entries-inline-search"] [data-test-id="cs-search-bar-input"] input',
  "Name input in Save View modal (doc step)":
    '[data-test-id="cs-save-as-view-title-input"] input, [data-test-id="cs-views-saved-view"] input[name="title"], #title',
};

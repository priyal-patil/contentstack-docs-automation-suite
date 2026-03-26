/**
 * Selectors for Use Saved Views flow.
 * DOM reference: data/dom/CMS/search/left-nav-views.html, saved-views-dropdown-menu.html,
 * saved-views-verticle-ellipses.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Views tab in left panel (doc step)":
    '[data-test-id="cs-entries-view-tab"], .Tab__item:has-text("Views"), [data-test-id="cs-entries-list-left-tab"] [data-test-id="cs-entries-view-tab"]',
  "Popular Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-popular_view-open"] .Accordion__heading__title, .Accordion__heading__title:has-text("Popular Views")',
  "Saved Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-view-close"] .Accordion__heading, [data-test-id="cs-entries-lhs-views-view-open"] .Accordion__heading, [data-test-id="cs-entries-lhs-views-view-close"], .Accordion__heading:has-text("Saved Views")',
  "First saved view in list (doc step)":
    '[data-test-id="cs-entries-my-views-element"], .views-container--item .views-container--item-name, [data-test-id="cs-entries-lhs-views-view-open"] .views-container--item:first-child, .myviews .views-container--item:first-child',
  "View name dropdown in top-right (doc step)":
    '[data-test-id="cs-entries-update-view-action"], button:has([data-test-id^="cs-entries-update-view--"]), .updateViewAction button',
  "Update the view menu item (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Update the view"), li:has-text("Update the view"), .Dropdown__menu__list__item:has-text("Update the view"), [role="menuitem"]:has-text("Update the view")',
  "Save as new view menu item (doc step)":
    '[role="menuitem"]:has-text("Save as new view"), li:has-text("Save as new view"), .Dropdown__menu__list__item:has-text("Save as new view"), [data-test-id="cs-dropdown-elements"]:has-text("Save as new view")',
  "Clear recent changes menu item (doc step)":
    'li:has-text("Clear recent changes"), .Dropdown__menu__list__item:has-text("Clear recent changes"), [data-test-id="cs-dropdown-elements"]:has-text("Clear recent changes"), [role="menuitem"]:has-text("Clear recent changes")',
  "Reset to all entries menu item (doc step)":
    'li:has-text("Reset to all entries"), .Dropdown__menu__list__item:has-text("Reset to all entries"), [data-test-id="cs-dropdown-elements"]:has-text("Reset to all entries"), [role="menuitem"]:has-text("Reset to all entries")',
  "Vertical ellipsis next to saved view (doc step)":
    '[data-test-id="cs-entries-my-views-element-action"], .views-container--item-action-wrapper, button:has([data-test-id="cs-icon"][name="DotsThreeLargeVertical"])',
  "Rename menu item (doc step)":
    '[data-test-id="cs-my-views-edit-name"], div:has-text("Rename"), li:has-text("Rename"), .Dropdown__menu__list__item:has-text("Rename"), [data-test-id="cs-dropdown-elements"]:has-text("Rename"), .Dropdown__menu--primary [data-test-id="cs-my-views-edit-name"]',
  "Share menu item (doc step)":
    '[data-test-id="cs-my-views-share-view"], .Dropdown__menu__list__item:has-text("Share"), li:has-text("Share")',
  "Copy Link menu item (doc step)":
    '[data-test-id="cs-my-views-copy-link"], li:has-text("Copy Link"), .Dropdown__menu__list__item:has-text("Copy Link"), [data-test-id="cs-dropdown-elements"]:has-text("Copy Link")',
  "View Details menu item (doc step)":
    '[data-test-id="cs-my-views-view-info"], li:has-text("View Details"), .Dropdown__menu__list__item:has-text("View Details"), [data-test-id="cs-dropdown-elements"]:has-text("View Details")',
  "Delete menu item (doc step)":
    '[data-test-id="cs-my-views-delete-view"], li:has-text("Delete"), .Dropdown__menu__list__item:has-text("Delete"), [data-test-id="cs-dropdown-elements"]:has-text("Delete")',
  "Manage Saved Views: verify and perform options (doc step)":
    '[data-test-id="cs-entries-my-views-element-action"], .views-container--item-action-wrapper',
};

export const VERIFY_SELECTORS: Record<string, string> = {
  "Views tab in left panel (doc step)":
    '[data-test-id="cs-entries-view-tab"], .Tab__item:has-text("Views")',
  "Popular Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-popular_view-open"], .Accordion__heading__title:has-text("Popular Views")',
  "Saved Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-view-close"], [data-test-id="cs-entries-lhs-views-view-open"], .Accordion__heading:has-text("Saved Views")',
  "First saved view in list (doc step)":
    '[data-test-id="cs-entries-my-views-element"], .views-container--item',
  "View name dropdown in top-right (doc step)":
    '[data-test-id="cs-entries-update-view-action"], .updateViewAction',
};

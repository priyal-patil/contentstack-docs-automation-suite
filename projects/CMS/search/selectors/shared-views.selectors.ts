/**
 * Selectors for Shared Views flow.
 * DOM reference: data/dom/CMS/search/saved-views-verticle-ellipses.html, saved-views-dropdown-menu.html,
 * share-view-modal.html, share-view-view-menu.html, manage-access-modal.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Views tab in left panel (doc step)":
    '[data-test-id="cs-entries-view-tab"], .Tab__item:has-text("Views"), [data-test-id="cs-entries-list-left-tab"] [data-test-id="cs-entries-view-tab"]',
  "Saved Views section (doc step)":
    '[data-test-id="cs-entries-lhs-views-view-close"] .Accordion__heading, [data-test-id="cs-entries-lhs-views-view-open"] .Accordion__heading, [data-test-id="cs-entries-lhs-views-view-close"], .Accordion__heading:has-text("Saved Views")',
  "First saved view in list (doc step)":
    '[data-test-id="cs-entries-my-views-element"], .views-container--item .views-container--item-name, .myviews .views-container--item:first-child',
  "Vertical ellipsis next to saved view (doc step)":
    '[data-test-id="cs-entries-my-views-element-action"], .views-container--item-action-wrapper, button:has([data-test-id="cs-icon"][name="DotsThreeLargeVertical"])',
  "Share menu item (doc step)":
    '[data-test-id="cs-my-views-share-view"], .Dropdown__menu__list__item:has-text("Share"), li:has-text("Share")',
  "Share View modal (doc step)":
    '[data-test-id="cs-share-view-entries"], [data-test-id="cs-modal-title-share-view"]',
  "Users or Roles field in Share View modal (doc step)":
    '[data-test-id="cs-field-label"]:has-text("Users or Roles"), [data-test-id="cs-share-view-entries"] label:has-text("Users or Roles")',
  "Users or Roles select dropdown (doc step)":
    '[data-test-id="cs-share-views-entries-select-users-roles"], [data-test-id="cs-share-views-entries-select-users-roles"] .Portal__control, [data-test-id="cs-share-views-entries-select-users-roles"] [data-test-id="cs-select-caret-down"], [data-test-id="cs-share-view-entries"] input[aria-autocomplete="list"]',
  "Admin role option (doc step)":
    'label[title="Admin"], [data-test-id="cs-share-view-entries"] label:has-text("Admin")',
  "Content Manager role option (doc step)":
    'label[title="Content Manager"], [data-test-id="cs-share-view-entries"] label:has-text("Content Manager")',
  "Developer role option (doc step)":
    'label[title="Developer"], [data-test-id="cs-share-view-entries"] label:has-text("Developer"), [role="option"]:has-text("Developer"), .Dropdown__menu__list__item:has-text("Developer"), li:has-text("Developer")',
  "Close Users or Roles dropdown by clicking footer (doc step)":
    '[data-test-id="cs-share-view-entries"] div[class="ReactModal__Content__footer flex-right"], div[class="ReactModal__Content__footer flex-right"], div.ReactModal__Content__footer.flex-right, div[class*="ReactModal__Content__footer"]',
  "Permission dropdown in Share View modal (doc step)":
    '[data-test-id="cs-share-views-entries-permission-dropdown"], [data-test-id="cs-share-views-entries-permission-dropdown-value"]',
  "View permission option (doc step)":
    'li[title="View"], .Dropdown__menu__list__item:has-text("View")',
  "Edit permission option (doc step)":
    '.Dropdown__menu--secondary [data-test-id="cs-dropdown-elements"][title="Edit"], .Dropdown__menu--secondary li[title="Edit"], [data-test-id="cs-dropdown-elements"][title="Edit"], li[title="Edit"], .Dropdown__menu__list__item:has-text("Edit"), li:has-text("Edit")',
  "Manage button in Share View modal (doc step)":
    '[data-test-id="cs-shared-views-entries-manage-btn"], [data-test-id="cs-share-view-entries"] button:has-text("Manage")',
  "Share button in Share View modal (doc step)":
    '[data-test-id="cs-share-view-entries-share-button"], [data-test-id="cs-share-view-entries"] button:has-text("Share")',
  "Close button in Share View modal (doc step)":
    '[data-test-id="cs-share-view-entries-close"], [data-test-id="cs-share-view-entries"] button:has-text("Close")',
  "Manage Access modal (doc step)":
    '[data-test-id="cs-manage-access-entries"], [data-test-id="cs-modal-title-manage-access"]',
  "Viewer dropdown in Manage Access (doc step)":
    '[data-test-id="cs-manage-access-entries"] .Dropdown:has-text("Viewer"), [data-test-id="cs-manage-access-entries"] [data-test-id*="permission"]:has-text("Viewer"), [data-test-id="cs-manage-access-entries"] .permission-row .Dropdown, [data-test-id="cs-manage-access-entries"] button:has-text("Viewer"), [data-test-id="cs-manage-access-entries"] div[role="button"]:has-text("Viewer")',
  "Manage Access: if Viewer dropdown visible, verify options and set to Editor (doc step)":
    '[data-test-id="cs-manage-access-entries"] .Dropdown:has-text("Viewer"), [data-test-id="cs-manage-access-entries"] .permission-row .Dropdown, [data-test-id="cs-manage-access-entries"] button:has-text("Viewer")',
  "Editor option in Manage Access dropdown (doc step)":
    'li:has-text("Editor"), .Dropdown__menu__list__item:has-text("Editor"), [role="option"]:has-text("Editor")',
  "Go back from Manage Access (doc step)":
    '[data-test-id="cs-manage-access-entries-goback"], .manage-permission-modal-goback, [data-test-id="cs-manage-access-entries"] [data-test-id="cs-modal-close"]',
};

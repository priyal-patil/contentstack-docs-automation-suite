export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "More (doc step)":
    '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), [aria-label="More"], button[aria-label*="more" i]',
  // Prefer stack-scoped href + stable test-id; Releases can sit under top-nav "More" when truncated.
  "Releases (doc step)":
    'a[href*="/#!/stack/"][href*="/releases"], [data-test-id="cms-nav-releases"], button[data-test-id="cms-nav-releases"], button:has-text("Releases"), a[href*="/releases/list"], a[href*="/releases"]',
  "New Release button (doc step)":
    '[data-test-id="cs-create-new-release"], [data-test-id="cs-empty-create-new-release"], button:has-text("New Release"), button:has-text("+ New Release")',
  "Create button in release modal (doc step)":
    '[data-test-id="cs-release-create"], button:has-text("Create")',
  "Save button in release modal (doc step)":
    '[data-test-id="cs-release-create"], button:has-text("Save")',
  "First release in left nav (doc step)":
    '.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow',
  "Edit release icon (doc step)":
    "svg[name='Edit'], *[name='Edit']",
  "Clone release icon (doc step)":
    "[data-test-id='cs-releases-card-action-copy'] button[data-test-id='cs-button'], button[data-test-id='cs-button']:has(svg[name='Copy']), button[data-test-id='cs-button'] svg[name='Copy']",
  "Delete release icon (doc step)":
    "[data-test-id='cs-releases-card-action-delete'] button[data-test-id='cs-button'], button[data-test-id='cs-button']:has(svg[name='Delete']), button[data-test-id='cs-button'] svg[name='Delete']",
  "Lock release icon (doc step)":
    '[data-test-id="cs-releases-card-action-lock"] button[data-test-id="cs-button"], [data-test-id="cs-releases-card-action-lock"] svg[name="Lock"], [data-test-id="cs-releases-card-action-lock"]',
  "Unlock release icon (doc step)":
    "svg[name='Unlock'], *[name='Unlock'], [data-test-id*='unlock' i], button[aria-label*='unlock' i]",
  "Hover release row for update icon (doc step)":
    '.ReleaseLeftContent [data-test-id="cs-list-row"], .ReleaseLeftContent .ListRow',
  "Update all release items icon (doc step)":
    "button[data-test-id='cs-button']:has(svg[name='Update']), button[data-test-id='cs-button'] svg[name='Update'], [data-test-id*='update-release' i], button[aria-label*='update' i]",
  "Release top-right horizontal ellipsis (doc step)":
    'button[aria-label*="aria-button" i]:has(svg[name="SeeMore"]), button[aria-label*="more" i]:has(svg[name="SeeMore"]), .ReleaseHeader button:has(svg[name="SeeMore"]), .release-header button:has(svg[name="SeeMore"]), button:has(svg[name="SeeMore"])',
  "Edit from release top-right menu (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Edit"), [id^="cs-dropdown-elements-"]:has-text("Edit"), li:has-text("Edit"), [role="menuitem"]:has-text("Edit")',
  "Update release items action (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Update"), [id^="cs-dropdown-elements-"]:has-text("Update"), [data-test-id="cs-dropdown-elements"]:has-text("Refresh"), [id^="cs-dropdown-elements-"]:has-text("Refresh"), [data-test-id="cs-dropdown-elements"]:has-text("Update Release Item"), [id^="cs-dropdown-elements-"]:has-text("Update Release Item"), li:has-text("Update"), li:has-text("Refresh"), li:has-text("Update Release Item"), button:has-text("Update"), button:has-text("Refresh"), button:has-text("Update Release Item"), [data-test-id*="refresh-release" i]',
  "Save button in edit release modal (doc step)":
    '[data-test-id="cs-release-edit"], button:has-text("Save")',
  "Yes, Proceed button in lock modal (doc step)":
    '[data-test-id="cs-refresh-release"], button:has-text("Yes, Proceed"), button:has-text("Proceed"), [data-test-id*="proceed" i]',
  "Yes, Proceed button in unlock modal (doc step)":
    '[data-test-id="cs-refresh-release"], button:has-text("Yes, Proceed"), button:has-text("Proceed"), [data-test-id*="proceed" i]',
  "Update button in update release modal (doc step)":
    '[data-test-id="cs-refresh-release"], button:has-text("Update")',
  "Clone button in clone release modal (doc step)":
    '[data-test-id="cs-release-clone"], button:has-text("Clone")',
  "Delete button in delete release modal (doc step)":
    '[data-test-id="cs-delete-release"], button:has-text("Delete")',
  "Deploy button (doc step)":
    'button[data-test-id="cs-release-deploy-release"], .actions__deploy button[data-test-id="cs-release-deploy-release"], button:has-text("Deploy")',
  "First deployment environment checkbox (doc step)":
    'label[data-test-id="cs-release-deploy-env"] input[type="checkbox"], label[data-test-id="cs-release-deploy-env"]',
  "Deploy button in deploy release modal (doc step)":
    'button[data-test-id="cs-release-deploy"], button:has-text("Deploy")',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "Assets (doc step)":
    '[data-test-id="cms-nav-assets"], button:has-text("Assets"), a:has-text("Assets")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-"]:not(:has-text("Untitled"))',
  "See more (entry editor) (doc step)":
    '[data-test-id="cs-entry-see-more-dropdown"]',
  "Add to Release from see more (doc step)":
    '[data-test-id="cs-entry-edit-see-more-add-to-release"], [data-test-id="cs-dropdown-elements"]:has-text("Add to Release"), li:has-text("Add to Release")',
  // Opens bulk “Select release” UI (placeholder: “Select release”).
  "Select release dropdown in Add to Release modal (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-search-field"], #releaseSelect, .bulk-release--select[data-test-id="cs-entry-bulk-add-to-release-search-field"]',
  // Bulk list row (dynamic release id in data-test-id); legacy table row kept as fallback.
  "First release row in Add to Release modal (doc step)":
    '.bulk-release__list-container__right--body--list[data-test-id^="cs-entry-bulk-add-to-release-"], [data-test-id="cs-table-body-row-0"]:has([data-test-id="cs-entries-release-title"]), [data-test-id="cs-table-body-row-1"], [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-entries-release-title"])',
  // Nested “Select Release” picker: after choosing a row, confirm with footer primary (returns to Add to Release form).
  "Select Release confirmation in release picker modal (doc step)":
    '[role="dialog"]:has(h3:has-text("Select Release")) .ReactModal__Content__footer button.Button--primary:has-text("Select Release"), [role="dialog"]:has(h3:has-text("Select Release")) .ReactModal__Content__footer button:has-text("Select Release")',
  // Bulk Add to Release (entry): doc “Publish or Unpublish … and click Add” — radios + primary Add (not asset-only “Add for Publishing” buttons).
  "Publish action in Add to Release modal (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-publish"], label[data-test-id="cs-entry-bulk-add-to-release-publish"]',
  "Unpublish action in Add to Release modal (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-unpublish"], label[data-test-id="cs-entry-bulk-add-to-release-unpublish"]',
  "Add button in Add to Release modal (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-add"], .ReactModal__bulk-release [data-test-id="cs-entry-bulk-add-to-release-add"], [role="dialog"] [data-test-id="cs-entry-bulk-add-to-release-add"]',
  "Add for Publishing button in Add to Release modal (doc step)":
    '.ReactModal__Content__footer [data-test-id="cs-releases-publish"], [role="dialog"] [data-test-id="cs-releases-publish"], [data-test-id="cs-releases-publish"], button:has-text("Add for Publishing")',
  "Add for Unpublishing button in Add to Release modal (doc step)":
    '.ReactModal__Content__footer [data-test-id="cs-releases-unpublish"], [role="dialog"] [data-test-id="cs-releases-unpublish"], [data-test-id="cs-releases-unpublish"], button:has-text("Add for Unpublishing")',
  "Create New Release option in Add to Release modal (doc step)":
    '[data-test-id="cs-inline-forms-label"]:has-text("Create New Release"), [data-test-id="cs-inline-form-add-icon"], .InlineForms:has-text("Create New Release")',
  "Create New Release save icon in Add to Release modal (doc step)":
    '[data-test-id="cs-inline-forms-add"], .InlineForms__add-icon[data-test-id="cs-inline-forms-add"], .InlineForms__add-icon svg[name="CheckedCircle"]',
  "First release item row (doc step)":
    '[data-test-id^="cs-table-body-row-"], .Table__body [role="row"][data-test-id^="cs-table-body-row-"]',
  "First release item checkbox (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-checkbox"] input[type="checkbox"], [data-test-id="cs-table-body-row-0"] input[title*="select row" i]',
  "Delete item icon in release row (doc step)":
    'svg[name="Delete"], *[name="Delete"], [data-test-id*="delete" i], button[aria-label*="delete" i]',
  "Remove item from release row (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Remove"), [id^="cs-dropdown-elements-"]:has-text("Remove"), li:has-text("Remove")',
  "Remove button in remove confirmation (doc step)":
    'button:has-text("Remove"), [data-test-id*="remove" i], button[aria-label*="remove" i]',
  "Add With References button (doc step)":
    'button:has-text("Add With References"), [data-test-id*="add-with-references" i]',
  "Add Without References button (doc step)":
    'button:has-text("Add Without References"), [data-test-id*="add-without-references" i]',
  "First Asset row (doc step)":
    'a[href*="/assets/blt"]:not([href*="/browse"]):visible, [data-test-id="cs-table-body-row-0"] [data-test-id="cs-asset-detail-title"]:visible',
  "Horizontal see more (asset details) (doc step)":
    '.asset-see-more [data-test-id="cs-asset-see-more-dropdown"] .Dropdown__header, .asset-see-more [data-test-id="cs-asset-see-more-dropdown"] svg[name="SeeMore"], .asset-see-more [data-test-id="cs-asset-see-more-dropdown"], [data-test-id="cs-asset-see-more-dropdown"] .Dropdown__header svg[name="SeeMore"]',
  "Add to Release from asset more (doc step)":
    '[data-test-id="cs-asset-edit-see-more-add-to-release"], [data-test-id*="add-to-release" i], [data-test-id="cs-dropdown-elements"]:has-text("Add to Release"), [id^="cs-dropdown-elements-"]:has-text("Add to Release"), .Dropdown__menu__list__item:has-text("Add to Release"), [role="menuitem"]:has-text("Add to Release"), li:has-text("Add to Release")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Releases list (doc step)":
    '[data-test-id="cs-release-table"], [data-test-id="cs-empty-state"]',
  "Release items table (doc step)":
    '[data-test-id="cs-table"], .Table__body, [data-test-id^="cs-table-body-row-"]',
  "Create a New Release modal title (doc step)":
    '[data-test-id="cs-modal-title-create-a-new-release"], h3:has-text("Create a New Release")',
  "Release Name label (doc step)":
    '[data-test-id="cs-release-name"]',
  "Release Description label (doc step)":
    '[data-test-id="cs-release-description"]',
  "Release Name input (doc step)":
    '[data-test-id="cs-release-name-input"] input#release_name, input[name="release_name"], input[aria-label="release_name"], .formCustomAdd input[placeholder*="Enter a name" i], input[placeholder*="Enter a name" i]',
  "Release Description input (doc step)":
    '[data-test-id="cs-release-description-input"] textarea#release_description, textarea[name="release_description"], textarea[aria-label="release_description"]',
  "Edit Release modal title (doc step)":
    '[data-test-id="cs-modal-title-edit-release"], h3:has-text("Edit Release")',
  "Lock Release modal title (doc step)":
    '[data-test-id="cs-modal-title-lock-release"], [data-test-id*="modal-title" i]:has-text("Lock Release"), h3:has-text("Lock Release")',
  "Unlock Release modal title (doc step)":
    '[data-test-id="cs-modal-title-unlock-release"], [data-test-id*="modal-title" i]:has-text("Unlock Release"), h3:has-text("Unlock Release")',
  "Update Release Item(s) modal title (doc step)":
    '[data-test-id="cs-modal-title-update-release-item(s)"], h3:has-text("Update Release Item(s)")',
  "Clone Release modal title (doc step)":
    '[data-test-id="cs-modal-title-clone-release"], h3:has-text("Clone Release")',
  "Delete Release modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-release"], h3:has-text("Delete Release")',
  "Deploy Release modal title (doc step)":
    '[data-test-id="cs-modal-title-deploy-release"], h3:has-text("Deploy Release")',
  "Release activity cell (doc step)":
    '[data-test-id="cs-releases-list-activity"] [data-test-id="cs-truncate"], [data-test-id="cs-releases-list-activity"]',
  "Add to Release modal title (doc step)":
    '[data-test-id="cs-modal-title-add-to-release"], [data-test-id="cs-modal-title"]:has-text("Add to Release"), h3:has-text("Add to Release")',
  "Add to Release table Name header (doc step)":
    '[data-test-id="cs-table-head-text--0"]:has-text("Name"), [role="columnheader"]:has-text("Name")',
  "Add to Release table Description header (doc step)":
    '[data-test-id="cs-table-head-text--1"]:has-text("Description"), [role="columnheader"]:has-text("Description")',
  "Add to Release table Items header (doc step)":
    '[data-test-id="cs-table-head-text--2"]:has-text("Items"), [role="columnheader"]:has-text("Items")',
  "Add to Release table Modified At header (doc step)":
    '[data-test-id="cs-table-head-text--3"]:has-text("Modified At"), [role="columnheader"]:has-text("Modified At")',
  "Select Language(s) label in Add to Release modal (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-select-lang"], label[data-test-id="cs-field-label"]:has-text("Select Language"), label:has-text("Select Language(s)")',
};

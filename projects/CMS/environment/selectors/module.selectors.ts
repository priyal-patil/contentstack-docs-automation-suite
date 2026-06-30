export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], [aria-label="Settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  "More (doc step)":
    'button[aria-label="aria-button"]:has-text("More"), [role="button"]:has-text("More"), button:has-text("More")',
  "Environments from left nav (doc step)":
    'a[href*="/settings/environments"], a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-environments"]), [data-test-id="cs-stack-settings-environments"]',
  "Environments (doc step)":
    'a[href*="/settings/environments"], a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-environments"]), [data-test-id="cs-stack-settings-environments"]',
  "New Environment (doc step)":
    '[data-test-id="cs-page-layout-contentBody"] [data-test-id="cs-environment-empty-state-create"], [data-test-id="cs-page-layout-contentBody"] [data-test-id="cs-environment-empty-state-header-new-environment"], [data-test-id="cs-page-layout-contentBody"] button:has-text("New Environment")',
  "Environment row action menu (doc step)":
    'button[data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Edit Environment action (doc step)":
    'li[data-test-id="cs-environments-action-edit"], [data-test-id="cs-environments-action-edit"]',
  "Delete Environment action (doc step)":
    'li[data-test-id="cs-environments-action-delete"], [data-test-id="cs-environments-action-delete"]',
  "Create Environment modal (doc step)":
    '[data-test-id="cs-modal"][role="dialog"]:has([data-test-id="cs-environments-create-title-input"]), [data-testid="cs-modal"][role="dialog"]:has([data-test-id="cs-environments-create-title-input"]), [role="dialog"]:has([data-test-id="cs-environments-create-title-input"]), .ReactModal__Content:has([data-test-id="cs-environments-create-title-input"]), [role="dialog"]:has-text("Create Environment"), [data-test-id="cs-modal-title-create-environment"], h2:has-text("Create Environment"), h3:has-text("Create Environment")',
  "Edit Environment modal (doc step)":
    '[data-test-id="cs-modal-title-edit-environment"], h3:has-text("Edit Environment")',
  "Delete Environment modal (doc step)":
    '[data-test-id="cs-modal-title-delete-environment"], h3:has-text("Delete Environment")',
  "Environments page (doc step)":
    '[data-test-id="cs-page-layout-contentBody"] [data-test-id="cs-page-title"]:has-text("Environments"), [data-test-id="cs-page-layout-contentBody"] .PageTitle:has-text("Environments"), [data-test-id="cs-page-layout-contentBody"] .env-list, [data-test-id="cs-page-layout-contentBody"] [data-test-id="cs-environment-empty-state-header-new-environment"]',
  "Create Environment (doc step)":
    '[data-test-id="cs-environment-create-add"], button:has-text("Create")',
  "Save Environment (doc step)":
    '[data-test-id="cs-environment-edit-update"], button:has-text("Save")',
  "Delete Environment confirm (doc step)":
    '[data-test-id="cs-environment-delete"], button:has-text("Delete")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Environment Name (doc step)":
    '[data-test-id="cs-environments-create-title-input"] input[name="name"], input[aria-label="name"]',
  "Base URL (doc step)":
    '[data-test-id="cs-environments-create-url-input"] input[name="environment_name_0"], input[aria-label="environment_name_0"]',
  "Environment Name (edit doc step)":
    '[data-test-id="cs-environments-edit-title-input"] input[name="name"], input[aria-label="name"]',
  "Base URL (edit doc step)":
    '[data-test-id="cs-environments-edit-url-input"] input[name="environment_name_0"], input[aria-label="environment_name_0"]',
};

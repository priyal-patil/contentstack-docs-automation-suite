export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="Headless CMS" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button[aria-label="Settings"], [data-test-id="cs-dropdown-elements"]:has-text("Settings"), [id^="cs-dropdown-elements-"]:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings"), button:has-text("Settings")',
  "More (doc step)":
    'button:has-text("More"), button[aria-label*="more" i], button[aria-label*="aria-button" i]:has(svg[name="SeeMore"]), [data-test-id="cs-dropdown-truncate-button"]',
  "Tokens in settings left nav (doc step)":
    '[data-test-id="cs-stack-settings-tokens"], a[href*="/settings/tokens/list"], .ListRowV2:has-text("Tokens")',
  "Management Tokens tab (doc step)":
    '[data-test-id="cs-management-tokens-tab"], [role="tab"]:has-text("Management Tokens")',
  "Delivery Tokens tab (doc step)":
    '[role="tab"]:has-text("Delivery Tokens"), .Tab__item:has-text("Delivery Tokens")',
  "Management Token button (doc step)":
    '[data-test-id="cs-management-token-add"], button:has-text("Management Token")',
  "Delivery Token button (doc step)":
    '[data-test-id="cs-delivery-token-add"], button:has-text("Delivery Token"), button:has-text("+ Delivery Token")',
  "First delivery token row (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id*="delivery-token" i], [data-test-id="cs-table-body-row-0"] [role="cell"]',
  "First delivery token row action (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "First management token row (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-management-tokens-name"], [data-test-id="cs-management-tokens-name"]',
  "Save management token button (doc step)":
    '[data-test-id="cs-management-token-save"], button:has-text("Save")',
  "Cancel management token button (doc step)":
    '[data-test-id="cs-management-token-cancel"], button:has-text("Cancel")',
  "First management token row action (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Delete management token option (doc step)":
    '[data-test-id="cs-management-tokens-action-delete"], [data-test-id="cs-vertical-action-tooltip"] li:has-text("Delete")',
  "Delete management token confirm button (doc step)":
    '[data-test-id="cs-management-tokens-delete-modal-delete"], button:has-text("Delete")',
  "Delete delivery token option (doc step)":
    '[data-test-id="cs-delivery-tokens-action-delete"], [data-test-id="cs-vertical-action-tooltip"] li:has-text("Delete")',
  "Delete delivery token confirm button (doc step)":
    '[data-test-id="cs-delivery-tokens-delete-modal-delete"], button:has-text("Delete")',
  "First publishing environment radio (delivery token doc step)":
    '[data-test-id^="cs-delivery-token-env-name-"] input[type="radio"], [data-test-id^="cs-delivery-token-env-name-"]',
  "Create Preview Token toggle (doc step)":
    '[data-test-id="cs-toggle-switch"] input[type="checkbox"], [data-test-id="cs-toggle-switch"] .toggle-switch',
  "Read permission checkbox (doc step)":
    '[data-test-id="cs-management-token-permission-read"], [data-test-id="cs-management-token-permission-read"] input[type="checkbox"]',
  "Write permission checkbox (doc step)":
    '[data-test-id="cs-management-token-permission-write"], [data-test-id="cs-management-token-permission-write"] input[type="checkbox"]',
  "Expiry Never radio (doc step)":
    '[data-test-id="cs-management-token-expiry-never"], [data-test-id="cs-management-token-expiry-never"] input[type="radio"]',
  "Generate Token button (doc step)":
    'button:has-text("Generate Token"), [data-test-id*="management-token-generate" i], [data-test-id*="generate-token" i]',
  "Done button in token generated modal (doc step)":
    '[data-test-id="cs-management-token-generated"], button:has-text("Done")',
  "Generate delivery token button (doc step)":
    'button:has-text("Generate Token"), [data-test-id*="delivery-token-generate" i], [data-test-id*="generate-token" i]',
  "Save delivery token button (doc step)":
    '[data-test-id="cs-delivery-token-save"], button:has-text("Save")',
  "Ensure preview token exists (doc step)":
    '[data-test-id="preview-token__edit-token"] input[aria-label="previewToken"], input[name="previewToken"], [data-test-id*="preview-token" i] input',
  "Create Preview Token in delivery edit page (doc step)":
    'button:has-text("+ Create Preview Token"), button:has-text("Create Preview Token"), [data-test-id*="create-preview-token" i]',
  "Cancel delivery token edit button (doc step)":
    '[data-test-id="cs-delivery-token-edit-cancel"], button:has-text("Cancel")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name input (management token doc step)":
    '[data-test-id="cs-management-token-name-input"] input[aria-label="name"], [data-test-id="cs-management-token-name-input"] input[name="name"], input[placeholder*="Enter token name" i]',
  "Description input (management token doc step)":
    '[data-test-id="cs-management-token-description-input"] textarea[aria-label="description"], textarea[name="description"], textarea[placeholder*="Enter a description" i]',
  "Management token Name label (doc step)":
    '[data-test-id="cs-management-token-name"], label:has-text("Name")',
  "Management token Description label (doc step)":
    '[data-test-id="cs-management-token-description"], label:has-text("Description")',
  "Scope label (doc step)":
    '[data-test-id="cs-management-token-scope"], label:has-text("Scope")',
  "Permissions label (doc step)":
    '[data-test-id="cs-management-token-permission"], label:has-text("Permissions")',
  "Read permission label (doc step)":
    '[data-test-id="cs-management-token-permission-read-label"], [data-test-id="cs-management-token-permission-read"]',
  "Write permission label (doc step)":
    '[data-test-id="cs-management-token-permission-write-label"], [data-test-id="cs-management-token-permission-write"]',
  "Expiry label (doc step)":
    '[data-test-id="cs-management-token-expiry"], label:has-text("Expiry")',
  "Date in UTC radio label (doc step)":
    '[data-test-id="cs-management-token-expiry-date"], [data-test-id="cs-management-token-expiry-date"] input[type="radio"]',
  "Manage Rate Limits label (doc step)":
    '.rate-limit-wrapper [data-test-id="cs-management-token-scope"], .rate-limit-wrapper label:has-text("Manage Rate Limits")',
  "Rate limit type label (doc step)":
    '.rate-limit-type-wrapper label:has-text("Select Rate Limit Type")',
  "Use Organization Rate Limit option (doc step)":
    '[data-test-id="cs-management-token-rate-limit-org"], [data-test-id="cs-management-token-rate-limit-org"] input[type="radio"]',
  "Enforce Custom Rate Limit option (doc step)":
    '[data-test-id="cs-management-token-rate-limit-specific"], [data-test-id="cs-management-token-rate-limit-specific"] input[type="radio"]',
  "Stack API Key (management token page doc step)":
    '[data-test-id="cs-management-token-info-placeholder"] input[aria-label="management-token-info"], [data-test-id="cs-management-token-info-placeholder"] input',
  "Management Token Generated modal title (doc step)":
    '[data-test-id="cs-modal-title-management-token-generated!"], h3:has-text("Management Token Generated!")',
  "Stack API Key in generated modal (doc step)":
    '[data-test-id="cs-modal-management-token-api-key-info"] input[aria-label="management-token-api-key"], [data-test-id="cs-modal-management-token-api-key-info"] input',
  "Management Token in generated modal (doc step)":
    '[data-test-id="cs-modal-management-token-info-input"] input[aria-label="delivery-token"], [data-test-id="cs-modal-management-token-info-input"] input',
  "Management Tokens list page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Tokens"), .PageTitle:has-text("Tokens")',
  "Create management token page marker (doc step)":
    '[data-test-id="cs-management-token-name-input"], [data-test-id="cs-management-token-name"]',
  "Edit Management Token heading (doc step)":
    '[data-test-id="cs-management-tokens-heading"], .token-entry-edit__header:has-text("Edit Management Token")',
  "Management token help text (edit doc step)":
    '[data-test-id="cs-management-token-main-generate"], .add-token__info-management-token-helptext:has-text("already been created")',
  "Delete Management Token modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-management-token"], h3:has-text("Delete Management Token")',
  "Delete management token name confirm input (doc step)":
    '[data-test-id="cs-management-tokens-delete-modal-input"] input[placeholder*="Enter name of your management token" i], [data-test-id="cs-management-tokens-delete-modal-input"] input',
  "Delete Delivery Token modal title (doc step)":
    '[data-test-id="cs-modal-title-delete-delivery-token"], h3:has-text("Delete Delivery Token")',
  "Delete delivery token name confirm input (doc step)":
    '[data-test-id="cs-delivery-tokens-delete-modal-input"] input[placeholder*="Enter name of your delivery token" i], [data-test-id="cs-delivery-tokens-delete-modal-input"] input',
  "Name input (delivery token doc step)":
    '[data-test-id="cs-delivery-token-name-input"] input[aria-label="name"], [data-test-id="cs-delivery-token-name-input"] input[name="name"], input[placeholder*="Enter token name" i]',
  "Description input (delivery token doc step)":
    '[data-test-id="cs-delivery-token-description-input"] textarea[aria-label="description"], [data-test-id="cs-delivery-token-description-input"] textarea[name="description"], textarea[placeholder*="Enter a description" i]',
  "Create delivery token page marker (doc step)":
    '[data-test-id="cs-delivery-token-name-input"], [data-test-id="cs-delivery-token-name"]',
  "Delivery token Name label (doc step)":
    '[data-test-id="cs-delivery-token-name"], label:has-text("Name")',
  "Delivery token Description label (doc step)":
    '[data-test-id="cs-delivery-token-description"], label:has-text("Description")',
  "Delivery token Scope label (doc step)":
    '[data-test-id="cs-delivery-token-scope"], label:has-text("Scope")',
  "Publishing Environments label (doc step)":
    '[data-test-id="cs-delivery-token-env"], label:has-text("Publishing Environments")',
  "Stack API Key (delivery token page doc step)":
    '[data-test-id="cs-delivery-token-stackAPI-input"] input, [data-test-id="cs-delivery-token-stackAPI"]',
  "Delivery Token label (doc step)":
    '[data-test-id="cs-delivery-token-info-empty-label"], label:has-text("Delivery Token")',
  "Preview Token label (doc step)":
    '[data-test-id="cs-delivery-token-preview-token"], label:has-text("Preview Token")',
  "Create Preview Token label (doc step)":
    '[data-test-id="cs-toggle-switch"] .Label--color--primary, [data-test-id="cs-toggle-switch"]:has-text("Create Preview Token")',
  "Delivery Token value in edit page (doc step)":
    '[data-test-id="cs-delivery-token-info-input"] input, input[name="deliveryToken"], input[aria-label="deliveryToken"]',
  "Preview Token value in edit page (doc step)":
    '[data-test-id="preview-token__edit-token"] input[aria-label="previewToken"], input[name="previewToken"], [data-test-id*="preview-token" i] input',
};

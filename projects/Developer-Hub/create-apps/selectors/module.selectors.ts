/**
 * Shared selectors for `projects/Developer-Hub/create-apps/flows/*.flow.json`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Doc: left navigation panel → Marketplace icon (org / global shell — same composite pattern as Brand Kit). */
  "Marketplace left navigation item (managing apps doc step)":
    '[role="navigation"] [aria-label*="Marketplace" i], [role="navigation"] button:has-text("Marketplace"), [role="navigation"] a:has-text("Marketplace"), aside [href*="marketplace" i], [data-test-id*="sidebar" i] a:has-text("Marketplace"), [data-test-id*="sidebar" i] button:has-text("Marketplace")',
  "Organization dashboard Marketplace product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-marketplace"]',
  "Organization dashboard Developer Hub product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-developer-hub"]',
  "Create Standard App modal Create button (doc step)": '[data-test-id="new-app-create-standard-app-cta"]',
  "Create Standard App Organization App type (doc step)": '[data-test-id="new-app-app-type-organization-app"]',
  "Developer Hub app settings Basic Information nav (doc step)": "#info",
  "Developer Hub app settings UI Locations nav (doc step)": "#ui-locations",
  "Developer Hub app settings Hosting nav (doc step)": "#hosting",
  "Developer Hub app settings Webhooks nav (doc step)": "#webhooks",
  "Developer Hub app settings App Manifest nav (doc step)": "#manifest",
  "Developer Hub app settings Version Logs nav (doc step)": "#version-logs",
  "Developer Hub app settings Releases nav (doc step)": "#releases",
  "Hosting tab Hosting with Launch option (doc step)": 'input[type="radio"][value="launch"]',
  "Hosting tab Custom Hosting option (doc step)": 'input[type="radio"][value="external"]',
  "Hosting tab Save button (doc step)": '[data-test-id="hosting-save-cta"]',
  /** Doc §4: select App Events — **Installed** enables manifest **Save** when no events pre-selected. */
  "Developer Hub Webhooks App event Installed checkbox (doc step)": '[data-test-id="webhooks-the-app-is-installed"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Create Standard App modal app name input (doc step)": '[data-test-id="new-app-name"]',
  "Developer Hub Hosting App URL input (doc step)": ".app-url-input-container input",
  "Developer Hub Webhooks URL to Notify input (doc step)": '[data-test-id="webhooks-notify-url"]',
};

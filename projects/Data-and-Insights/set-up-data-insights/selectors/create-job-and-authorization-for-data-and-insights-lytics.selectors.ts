/**
 * Flow: create-job-and-authorization-for-data-and-insights-lytics
 * App: https://app.lytics.com (Data Pipeline → Jobs wizard)
 *
 * Dedicated click/enter/region handlers: rules/core/actionRules.ts
 * DOM refs (partial): data/dom/Data-and-Insights/set-up-data-insights/lytics-joblistpage.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Lytics Job doc: verify Data Pipeline nav label (doc step)":
    'lytics-ui nav .MuiListItemText-primary:has-text("Data Pipeline"), lytics-ui nav p.MuiTypography-body2:has-text("Data Pipeline"), nav .MuiListItemButton-root:has-text("Data Pipeline"), [role="navigation"] .MuiListItemText-primary:has-text("Data Pipeline"), aside .MuiListItemText-primary:has-text("Data Pipeline"), .MuiDrawer-root .MuiListItemText-primary:has-text("Data Pipeline"), nav .MuiListItemText-primary:has-text("Data Pipeline"), nav p:has-text("Data Pipeline")',

  "Lytics Job doc: verify Jobs sidebar nav label (doc step)":
    'lytics-ui nav a[href*="/conductor/pipeline/jobs"] .MuiListItemText-primary:has-text("Jobs"), nav a[href*="/conductor/pipeline/jobs"] .MuiListItemText-primary:has-text("Jobs"), [role="navigation"] a[href*="/conductor/pipeline/jobs"]',

  "Lytics Job doc: verify Jobs page title (doc step)": '[data-testid="header-title"]',

  "Lytics Job doc: verify Pipeline Jobs Create New control label (doc step)":
    'a[href*="/conductor/pipeline/jobs/new"]:has-text("Create New")',

  "Lytics Job doc: verify Import Entries job type card visible (doc step)":
    '[class*="MuiCard-root"]:has-text("Import Entries")',

  "Lytics Job doc: verify Set job details section heading (doc step)":
    'h2:has-text("Set job details"), h3:has-text("Set job details"), h6:has-text("Set job details"), p:has-text("Set job details")',

  "Lytics Job doc: verify Set job details Description label (doc step)":
    'div:has-text("Set job details") label:has-text("Description"), div:has-text("Set job details") [class*="MuiFormLabel"]:has-text("Description")',

  "Lytics Job doc: verify Label field name in Set job details (doc step)":
    'div:has-text("Set job details") label:has-text("Label"), div:has-text("Set job details") [class*="MuiFormLabel"]:has-text("Label")',

  "Lytics Job doc: verify Authorizations section heading (doc step)":
    'h6:has-text("Authorizations"), h5:has-text("Authorizations"), p:has-text("Authorizations")',

  "Lytics Job doc: verify Authorizations New Authorization button label (doc step)":
    'button:has-text("New Authorization")',

  "Lytics Job doc: verify Stack API Key authorization method visible (doc step)":
    '[class*="MuiCard"]:has-text("Stack API Key")',

  "Lytics Job doc: verify Configure Authorization Details section heading (doc step)":
    'h6:has-text("Details"), h5:has-text("Details")',

  "Lytics Job doc: verify Configure Authorization Details Label field visible (doc step)":
    'div:has-text("Details") label:has-text("Label")',

  "Lytics Job doc: verify Configure Authorization Details Description label (doc step)":
    'div:has-text("Details") label:has-text("Description")',

  "Lytics Job doc: verify Configuration section heading (doc step)":
    'h6:has-text("Configuration"), h5:has-text("Configuration")',

  "Lytics Job doc: verify Configuration section Region label (doc step)": 'label:has-text("Region")',

  "Lytics Job doc: verify Configuration Stack API Key field label (doc step)":
    'label:has-text("Stack API Key")',

  "Lytics Job doc: verify Configuration Delivery Token field label (doc step)":
    'label:has-text("Delivery Token")',

  "Lytics Job doc: verify Configuration Management Token field label (doc step)":
    'label:has-text("Management Token")',

  "Lytics Job doc: verify Save and Continue authorization button label (doc step)":
    'button:has-text("Save and Continue")',

  "Lytics Job doc: verify Authorization saved successfully toast (doc step)":
    '.MuiAlert-message:has-text("Authorization saved successfully"), [role="alert"]:has-text("Authorization saved successfully")',
};

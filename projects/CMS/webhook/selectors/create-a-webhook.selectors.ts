export const CLICK_SELECTORS: Record<string, string> = {
  // ── Trigger condition dropdowns (4 in a row: Scope | Module | Action | Status) ──
  "Trigger Condition Scope dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-scope"] .Select__control, [data-test-id="cs-webhooks-condition-select-environment"] .Select__control, [data-test-id="cs-webhooks-condition-select-scope"], [data-test-id="cs-trigger-condition-label"] ~ div .Select__control:first-of-type',
  "Module dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-module"] .Select__control, [data-test-id="cs-webhooks-condition-select-module"]',
  "Action dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-action"] .Select__control, [data-test-id="cs-webhooks-condition-select-action"]',
  "Event Status dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-action-status"] .Select__control, [data-test-id="cs-webhooks-condition-select-action-status"]',

  // ── Trigger condition options ──────────────────────────────────────────────
  "Any option (doc step)":
    '[role="option"]:has-text("Any"), .Select__menu [role="option"]:has-text("Any"), div[id^="react-select-"][id*="-option-"]:has-text("Any")',
  "Branch option (doc step)":
    '[role="option"]:has-text("Branch"), .Select__menu [role="option"]:has-text("Branch"), div[id^="react-select-"][id*="-option-"]:has-text("Branch")',
  "Create option (doc step)":
    '[role="option"]:has-text("Create"), .Select__menu [role="option"]:has-text("Create"), div[id^="react-select-"][id*="-option-"]:has-text("Create")',
  "Initiated option (doc step)":
    '[role="option"]:has-text("Initiated"), .Select__menu [role="option"]:has-text("Initiated"), div[id^="react-select-"][id*="-option-"]:has-text("Initiated")',

  // ── Legacy / other flow options ────────────────────────────────────────────
  "Content type dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-content-type"], [data-test-id="cs-trigger-condition-label"] ~ * .Select:nth-of-type(2) .Select__control',
  "Content Types option (doc step)":
    '[role="option"]:has-text("Content Type"), .Select__menu div:has-text("Content Type"), div[id^="react-select-"][id*="-option-"]:has-text("Content Type")',
  "Entry option (doc step)":
    '[role="option"]:has-text("Entry"), .Select__menu div:has-text("Entry"), div[id^="react-select-"][id*="-option-"]:has-text("Entry")',
  "Content type All option (doc step)":
    '[role="option"]:has-text("All"), .Select__menu div:has-text("All"), div[id^="react-select-"][id*="-option-"]:has-text("All")',
  "Entries Create option (doc step)":
    '[role="option"]:has-text("Created"), .Select__menu [role="option"]:has-text("Created"), div[id^="react-select-"][id*="-option-"]:has-text("Created")',
  "Add trigger condition (doc step)":
    '[data-test-id="cs-webhooks-add-trigger"], [data-test-id*="add-trigger"], [data-test-id*="add-condition"], [data-test-id="cs-trigger-condition-label"] ~ * button:has-text("Add")',

  // ── Save / toggles ─────────────────────────────────────────────────────────
  "Save webhook button (doc step)":
    '[data-test-id="cs-webhook-save"], button[data-test-id="cs-button"]:has-text("Save"), button:has-text("Save")',
  "Send Concise Payload toggle (doc step)":
    '[data-test-id="cs-webhook-send-concise-payload-disable"] input[type="checkbox"], [data-test-id="cs-webhook-send-concise-payload-disable"] .toggle-switch, [data-test-id="cs-webhook-send-concise-payload-disable"] label.toggle-switch',
  "Enable Webhook toggle (doc step)":
    '[data-test-id="cs-webhook-switch-enabled"] input[type="checkbox"], [data-test-id="cs-webhook-switch-enabled"] .toggle-switch, [data-test-id="cs-webhook-switch-enabled"] label.toggle-switch',
};

export const INPUT_SELECTORS: Record<string, string> = {
  // ── Basic form labels ──────────────────────────────────────────────────────
  "Name label (doc step)":
    '[data-test-id="cs-webhook-name-label"], label:has-text("Name")',
  "URL to Notify label (doc step)":
    '[data-test-id="cs-webhook-url-label"], label:has-text("URL to Notify")',
  "Authentication Method label (doc step)":
    '[data-test-id="cs-webhook-auth-method-label"], label:has-text("Authentication Method")',

  // ── Basic Auth fields ──────────────────────────────────────────────────────
  "HTTP Basic Auth Username label (doc step)":
    '[data-test-id="cs-webhook-authusername-label"], label:has-text("HTTP Basic Auth Username")',
  "HTTP Basic Auth Password label (doc step)":
    '[data-test-id="cs-webhook-authpw-label"], label:has-text("HTTP Basic Auth Password")',

  // ── Authentication Method radio options (radio buttons, always visible) ──
  "Bearer Token option label (doc step)":
    'label:has(input[type="radio"]):has-text("Bearer Token"), [data-test-id="cs-webhook-auth-bearer-label"], div:has(input[type="radio"]) >> text=Bearer Token',
  "None option label (doc step)":
    'label:has(input[type="radio"]):has-text("None"), [data-test-id="cs-webhook-auth-none-label"], div:has(input[type="radio"]) >> text=None',

  // ── OAuth 2.0 Client Credential fields (visible only when OAuth 2.0 selected) ──
  "OAuth 2.0 Access Token URL label (doc step)":
    '[data-test-id="cs-webhook-oauth-token-url-label"], label:has-text("Access Token URL")',
  "OAuth 2.0 Client ID label (doc step)":
    '[data-test-id="cs-webhook-oauth-client-id-label"], label:has-text("Client ID")',
  "OAuth 2.0 Client Secret label (doc step)":
    '[data-test-id="cs-webhook-oauth-client-secret-label"], label:has-text("Client Secret")',
  "OAuth 2.0 Request Query Parameters label (doc step)":
    '[data-test-id="cs-webhook-oauth-query-params-label"], label:has-text("Request Query Parameter")',

  // ── Other form labels ──────────────────────────────────────────────────────
  "Custom Headers label (doc step)":
    '[data-test-id="cs-webhook-custom-header-label"], label:has-text("Custom Headers")',
  "Add Custom Header button (doc step)":
    '[data-test-id="cs-webhook-add-header"], button:has-text("Custom Header")',
  "Email Addresses to Notify label (doc step)":
    '[data-test-id="cs-webhook-notify-user"], label:has-text("Email Addresses to Notify")',
  "Stack-level Scope label (doc step)":
    '[data-test-id="cs-webhook-stack-scope-label"], label:has-text("Stack-level Scope")',
  "Branch-level Scope label (doc step)":
    '[data-test-id="cs-webhook-branch-scope-label"], label:has-text("Branch-level Scope")',
  "Trigger Conditions label (doc step)":
    '[data-test-id="cs-trigger-condition-label"], label:has-text("Trigger Conditions")',
  "Conditional View tab (doc step)":
    '[data-test-id="cs-webhooks-conditional-view-tab"], .Tab__item:has-text("Conditional View")',
  "Code View tab (doc step)":
    '[data-test-id="cs-webhooks-code-view-tab"], .Tab__item:has-text("Code View")',
  "Send Concise Payload label (doc step)":
    '[data-test-id="cs-webhook-send-concise-payload-label-disable"], label:has-text("Send Concise Payload")',
  "Enable Webhook label (doc step)":
    '[data-test-id="cs-webhook-label-enabled"], label:has-text("Enable Webhook")',

  // ── Inputs ─────────────────────────────────────────────────────────────────
  "Name input (doc step)":
    '[data-test-id="cs-webhook-name-input"] input, input[name="name"][placeholder*="webhook"]',
  "URL to Notify input (doc step)":
    '[data-test-id="cs-webhook-url-input"] input, input[name="url"]',
  "HTTP Basic Auth Username input (doc step)":
    '[data-test-id="cs-webhook-authusername-input"] input, input[name="authUserName"]',
  "HTTP Basic Auth Password input (doc step)":
    '[data-test-id="cs-webhook-authpw-input"] input, input[name="authPassword"]',
};

export const CLICK_SELECTORS: Record<string, string> = {
  "Module dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-module"] .Select__control, [data-test-id="cs-webhooks-condition-select-module"]',
  "Action dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-action"] .Select__control, [data-test-id="cs-webhooks-condition-select-action"]',
  "Content type dropdown (doc step)":
    '[data-test-id="cs-webhooks-condition-select-content-type"], [data-test-id="cs-trigger-condition-label"] ~ * .Select:nth-of-type(2) .Select__control, [data-test-id="cs-trigger-condition-label"] ~ * .Select__control:nth-of-type(2)',
  "Content Types option (doc step)":
    '[role="listbox"] [role="option"]:has-text("Content Type"), [role="option"]:has-text("Content Type"), .Select__menu div:has-text("Content Type"), div[id^="react-select-"][id*="-option-"]:has-text("Content Type")',
  "Entry option (doc step)":
    '[role="listbox"] [role="option"]:has-text("Entry"), [role="option"]:has-text("Entry"), .Select__menu div:has-text("Entry"), div[id^="react-select-"][id*="-option-"]:has-text("Entry")',
  "Content type All option (doc step)":
    '[role="listbox"] [role="option"]:has-text("All"), [role="option"]:has-text("All"), .Select__menu div:has-text("All"), div[id^="react-select-"][id*="-option-"]:has-text("All")',
  "Entries Create option (doc step)":
    '[role="listbox"] [role="option"]:has-text("Created"), [role="option"]:has-text("Created"), .Select__menu [role="option"]:has-text("Created"), div[id^="react-select-"][id*="-option-"]:has-text("Created")',
  "Add trigger condition (doc step)":
    '[data-test-id="cs-webhooks-add-trigger"], [data-test-id*="add-trigger"], [data-test-id*="add-condition"], [data-test-id="cs-trigger-condition-label"] ~ * button:has-text("Add"), [data-test-id="cs-trigger-condition-label"] ~ * button:has-text("Add Condition")',
  "Save webhook button (doc step)":
    '[data-test-id="cs-webhook-save"], button[data-test-id="cs-button"]:has-text("Save"), button:has-text("Save")',
  "Send Concise Payload toggle (doc step)":
    '[data-test-id="cs-webhook-send-concise-payload-disable"] input[type="checkbox"], [data-test-id="cs-webhook-send-concise-payload-disable"] .toggle-switch, [data-test-id="cs-webhook-send-concise-payload-disable"] label.toggle-switch',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name label (doc step)":
    '[data-test-id="cs-webhook-name-label"], label:has-text("Name")',
  "URL to Notify label (doc step)":
    '[data-test-id="cs-webhook-url-label"], label:has-text("URL")',
  "Name input (doc step)":
    '[data-test-id="cs-webhook-name-input"] input, input[name="name"][placeholder*="webhook"]',
  "URL to Notify input (doc step)":
    '[data-test-id="cs-webhook-url-input"] input, input[name="url"]',
  "HTTP Basic Auth Username input (doc step)":
    '[data-test-id="cs-webhook-authusername-input"] input, input[name="authUserName"]',
  "HTTP Basic Auth Password input (doc step)":
    '[data-test-id="cs-webhook-authpw-input"] input, input[name="authPassword"]',
  "HTTP Basic Auth Username label (doc step)":
    '[data-test-id="cs-webhook-authusername-label"], label:has-text("HTTP Basic Auth Username")',
  "HTTP Basic Auth Password label (doc step)":
    '[data-test-id="cs-webhook-authpw-label"], label:has-text("HTTP Basic Auth Password")',
  "Custom Headers label (doc step)":
    '[data-test-id="cs-webhook-custom-header-label"], label:has-text("Custom Headers")',
  "Add Custom Header button (doc step)":
    '[data-test-id="cs-webhook-add-header"], button:has-text("Custom Header")',
  "Email Addresses to Notify label (doc step)":
    '[data-test-id="cs-webhook-notify-user"], label:has-text("Email Addresses to Notify")',
  "Trigger Conditions label (doc step)":
    '[data-test-id="cs-trigger-condition-label"], label:has-text("Trigger Conditions")',
  "Conditional View tab (doc step)":
    '[data-test-id="cs-webhooks-conditional-view-tab"], .Tab__item:has-text("Conditional View")',
  "Code View tab (doc step)":
    '[data-test-id="cs-webhooks-code-view-tab"], .Tab__item:has-text("Code View")',
  "Send Concise Payload label (doc step)":
    '[data-test-id="cs-webhook-send-concise-payload-label-disable"], label:has-text("Send Concise Payload")',
  "Send Concise Payload toggle (doc step)":
    '[data-test-id="cs-webhook-send-concise-payload-disable"] input[type="checkbox"], [data-test-id="cs-webhook-send-concise-payload-disable"] .toggle-switch',
  "Enable Webhook label (doc step)":
    '[data-test-id="cs-webhook-label-enabled"], label:has-text("Enable Webhook")',
  "Enable Webhook toggle (doc step)":
    '[data-test-id="cs-webhook-switch-enabled"] input[type="checkbox"], [data-test-id="cs-webhook-switch-enabled"] .toggle-switch',
};

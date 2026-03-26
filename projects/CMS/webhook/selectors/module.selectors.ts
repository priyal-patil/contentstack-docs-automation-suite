export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="Headless CMS" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button[aria-label="Settings"], [data-test-id="cs-dropdown-elements"]:has-text("Settings"), [id^="cs-dropdown-elements-"]:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings"), button:has-text("Settings")',
  "More (doc step)":
    'button:has-text("More"), button[aria-label*="more" i], button[aria-label*="aria-button" i]:has(svg[name="SeeMore"]), [data-test-id="cs-dropdown-truncate-button"]',
  "Webhooks in settings left nav (doc step)":
    '[data-test-id="cs-stack-settings-webhooks"], a[href*="/settings/webhooks"], .ListRowV2:has-text("Webhooks")',
  "Webhooks (doc step)":
    '[data-test-id="cs-stack-settings-webhooks"], a[href*="/settings/webhooks"], .ListRowV2:has-text("Webhooks")',
  "+ New Webhook button (doc step)":
    '[data-test-id="cs-webhooks-header-new-webhook"], [data-test-id="cs-webhooks-empty-state-new-webhook"], button:has-text("New Webhook"), button:has-text("+ New Webhook")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

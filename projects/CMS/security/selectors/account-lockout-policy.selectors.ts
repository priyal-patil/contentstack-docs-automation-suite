export const CLICK_SELECTORS: Record<string, string> = {
  "Administration in App Switcher (doc step)":
    '[data-test-id="app-switcher-orgadmin"], [data-test-id="app-switcher-body"] a:has-text("Administration")',
  "Users nav in Administration (doc step)":
    '[data-test-id="orgadmin-nav-users"], button[aria-label="Users"]',
  "Vertical ellipsis in Action column (doc step)":
    '[data-test-id="cs-table-action-options"]',
  "Unlock User option (doc step)":
    '.VerticalActionTooltip li:has-text("Unlock User"), li:has-text("Unlock User")',
  "Continue or Proceed in unlock modal (doc step)":
    'button:has-text("Continue"), button:has-text("Proceed")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Administration in App Switcher (doc step)":
    '[data-test-id="app-switcher-orgadmin"], [data-test-id="app-switcher-body"] a:has-text("Administration"), .app__switcher__body__v2 a:has-text("Administration")',
  "Users nav in Administration (doc step)":
    '[data-test-id="orgadmin-nav-users"], button[aria-label="Users"], .TopNavbar button:has-text("Users")',
  "Vertical ellipsis in Action column (doc step)":
    '[data-test-id="cs-table-action-options"]',
  "Unlock User option (doc step)":
    '.VerticalActionTooltip li:has-text("Unlock User"), [role="menu"] li:has-text("Unlock User"), li:has-text("Unlock User")',
  "Unlock User confirmation modal (doc step)":
    '[data-test-id*="modal-title" i]:has-text("Unlock User"), h3:has-text("Unlock User"), .ReactModal__Content__header:has-text("Unlock User")',
  "Continue or Proceed in unlock modal (doc step)":
    'button:has-text("Continue"), button:has-text("Proceed"), [data-test-id*="modal"] button:has-text("Continue"), [data-test-id*="modal"] button:has-text("Proceed")',
};

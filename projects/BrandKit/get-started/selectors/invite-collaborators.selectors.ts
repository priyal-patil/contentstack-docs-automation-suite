/**
 * Brand Kit — Invite collaborators (doc: invite-collaborators).
 * DOM: data/dom/BrandKit/settings-collaborators.html, invite-collaborator.html
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Brand Kit left navigation item (doc step)":
    '[role="navigation"] [aria-label*="Brand Kit" i], [role="navigation"] button:has-text("Brand Kit"), [role="navigation"] a:has-text("Brand Kit"), aside [href*="brand-kit" i], [data-test-id*="sidebar" i] a:has-text("Brand Kit"), [data-test-id*="sidebar" i] button:has-text("Brand Kit")',

  "Brand Kit dashboard product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-brand-kit"]',

  "Brand Kit Settings navigation item invite collaborators doc (doc step)":
    '[data-test-id="brandkit-nav-settings"], nav.TopNavbar a[href*="settings"] button, nav.TopNavbar button:has-text("Settings")',

  "Invite Collaborators flow: Settings left sidenav title (doc step)":
    '[data-test-id="general-settings-left-sidenav"] [data-test-id="cs-section-header"], [data-test-id="cs-section-header"]:has-text("Settings")',

  "Invite Collaborators flow: Collaborators settings sidenav row (doc step)":
    '[data-test-id="brand-kit-click-menu-settings-collaborators"]',

  "Invite Collaborators flow: Collaborators page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Collaborators")',

  "Invite Collaborators flow: collaborators table Actions column header (doc step)":
    '[data-test-id="cs-table-row-action-column-text--4"], [role="columnheader"]:has-text("Actions")',

  "Invite Collaborators flow: Invite Collaborator primary button label (doc step)":
    '[data-test-id="invite-users-button"]',

  "Invite Collaborators flow: Invite Collaborator modal title (doc step)":
    '[data-test-id="cs-modal-title-invite-collaborator"], [role="dialog"] h3[title="Invite Collaborator"]',

  "Invite Collaborators flow: Invite Collaborator modal Invite button (doc step)":
    '[data-test-id="invite-collaborator-invite-button"]',

  "Invite Collaborators flow: remove collaborator dialog Remove button (doc step)":
    '[role="dialog"] button:has-text("Remove")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Brand Kit Invite Collaborator modal email field (doc step)":
    '[data-test-id="brand-kit-invite-collaborator-email-input-field"] input, [data-test-id="brand-kit-invite-collaborator-email-input-field"]',
  "Brand Kit Invite Collaborator modal optional message field (doc step)":
    '[data-test-id="brand-kit-invite-collaborator-message-input-field"]',
};

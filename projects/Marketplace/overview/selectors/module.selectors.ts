/**
 * Marketplace — overview module selectors.
 * Covers: about-marketplace flow.
 *
 * Doc says: "On the left-hand side primary navigation, you will find a new icon for Marketplace.
 * Click on the icon to go to the Marketplace."
 *
 * NOTE: If the verify step fails, it means the app does not expose a Marketplace icon
 * in the left-hand side primary navigation — this is a doc-app gap to be reported.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Marketplace icon in the left-hand side primary navigation — exact doc description.
   * Doc: "On the left-hand side primary navigation, you will find a new icon for Marketplace."
   * Tries all plausible left-nav selectors; failure = doc-app gap (icon not in left nav). */
  "Marketplace icon in left-hand side primary navigation (doc step)":
    '[data-test-id="cs-left-nav-marketplace"], [data-test-id="cs-nav-marketplace"], aside [aria-label*="Marketplace" i], aside a[href*="marketplace" i], [data-test-id="cs-sidenav"] [aria-label*="Marketplace" i], .left-navigation a:has-text("Marketplace"), .left-nav a:has-text("Marketplace"), nav.primary a:has-text("Marketplace"), [role="navigation"].primary a:has-text("Marketplace")',

  /** Marketplace landing page — confirms navigation succeeded (doc step). */
  "Marketplace landing page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Marketplace"), h1:has-text("Marketplace"), h2:has-text("Marketplace"), [data-test-id="cs-marketplace-heading"], .marketplace__heading, [role="heading"]:has-text("Marketplace")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

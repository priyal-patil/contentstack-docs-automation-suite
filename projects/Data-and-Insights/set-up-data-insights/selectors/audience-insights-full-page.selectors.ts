/**
 * Selectors for Audience Insights full-page doc flow (stack primary nav).
 * @see https://www.contentstack.com/docs/developers/marketplace-apps/audience-insights
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Audience Insights doc: click stack primary nav Audience Insights app (doc step)":
    '[data-test-id="cms-nav-audience-insights"], nav [data-test-id^="cms-nav-"]:has-text("Audience Insights")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

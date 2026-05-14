/**
 * Shared Analytics hub selectors (Organization dashboard tile + product dashboard tabs).
 * Tabs DOM reference: data/dom/Analytics/personalize.html — Automate maps to `analytics-nav-agentos`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Analytics doc: Organization dashboard Analytics product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-analytics"]',
  "Analytics hub Launch dashboard tab (doc step)": '[data-test-id="analytics-nav-launch"]',
  "Analytics hub Automate dashboard tab (doc step)": '[data-test-id="analytics-nav-agentos"]',
  "Analytics hub Personalize dashboard tab (doc step)": '[data-test-id="analytics-nav-personalize"]',
  "Analytics hub Brand Kit dashboard tab (doc step)": '[data-test-id="analytics-nav-brandkit"]',
};

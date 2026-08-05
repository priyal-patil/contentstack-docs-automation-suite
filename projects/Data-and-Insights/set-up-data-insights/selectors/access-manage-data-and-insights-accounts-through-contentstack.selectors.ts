/**
 * Flow: access-manage-data-and-insights-accounts-through-contentstack
 * @see https://www.contentstack.com/docs/data-and-insights/access-manage-data-and-insights-accounts-through-contentstack
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Doc App Switcher product — same marker as create-data-and-insights-lytics-integration. */
  "DAL Lytics doc: verify App Switcher Data and Insights product label (doc step)":
    /**
     * Prefix match: the tile's test id gained an "-mfe" (micro-frontend) suffix.
     *
     *   <a role="button" data-test-id="app-switcher-lytics-mfe" href="#!/lytics">…Lytics CDP</a>
     *
     * An exact `[data-test-id="app-switcher-lytics"]` therefore matched nothing, and all six
     * Data-and-Insights flows died at step 1-3 with "product not found in App Switcher" — which read like
     * the product was not provisioned. It is: the App Switcher screenshot shows the tile.
     *
     * This fix only makes the tile FINDABLE. It does not make the flows pass, and deliberately so: the
     * tile's visible label is "Lytics CDP" while the documents still say "Data & Insights", so the
     * following label check now fails with that comparison stated explicitly instead of a generic
     * not-found timeout. That mismatch is a documentation finding and must stay visible.
     */
    '[data-test-id^="app-switcher-lytics"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

/**
 * Selectors for Audience Insights entry-sidebar doc flow (reuse CMS Entries nav patterns).
 * @see https://www.contentstack.com/docs/developers/marketplace-apps/audience-insights
 */

import { CLICK_SELECTORS as CmsEntriesClick } from "../../../CMS/entries/selectors/module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...CmsEntriesClick,
  "Audience Insights doc: click entry right nav Audience Insights app icon (doc step)":
    '.SidebarWindow [aria-label*="Audience Insights" i], .SidebarWindow__tabs-container button:has-text("Audience Insights"), .SidebarWindow [data-test-id*="audience-insights" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

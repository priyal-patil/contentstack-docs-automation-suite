/**
 * Shared selectors for Data-and-Insights `set-up-data-insights` flows (DAL, Lytics job, Launch Event Tracking crossing).
 */

import {
  CLICK_SELECTORS as LaunchClick,
  INPUT_SELECTORS as LaunchInput,
} from "../../../Launch/projects/selectors/module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...LaunchClick,
  /**
   * Env settings right tab strip: `div[data-test-id="cs-tabs-item"]` wraps `div[data-testid="lytics-tab"].center.flex`
   * (Lytics svg + "Event Tracking" text). Horizontal carets may scroll the strip before the tab is visible.
   */
  "Launch environment settings Event Tracking tab label (doc step)":
    '[data-test-id="cs-tabs-item"]:has([data-testid="lytics-tab"]) [data-testid="lytics-tab"]',
  "Launch environment settings Event Tracking tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has([data-testid="lytics-tab"]) [data-testid="lytics-tab"]',
  "Launch Event Tracking Yes Enable Event Tracking button visible (doc step)":
    '[role="dialog"] button:has-text("Yes, Enable Event Tracking")',
  "Launch Event Tracking Yes Enable Event Tracking button (doc step)":
    '[role="dialog"] button:has-text("Yes, Enable Event Tracking")',
  "Launch Event Tracking Yes Disable Event Tracking button visible (doc step)":
    '[role="dialog"] button:has-text("Yes, Disable Event Tracking")',
  "Launch Event Tracking Yes Disable Event Tracking button (doc step)":
    '[role="dialog"] button:has-text("Yes, Disable Event Tracking")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...LaunchInput,
};

/**
 * Launch → Advanced tools (Event Tracking / Lytics, etc.).
 */
import { CLICK_SELECTORS as LaunchClick, INPUT_SELECTORS as LaunchInput } from "../../projects/selectors/module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...LaunchClick,
  /** env-event-tracking.html — tab strip `data-testid="lytics-tab"` (label text Event Tracking). */
  "Launch environment settings Event Tracking tab label (doc step)": '[data-testid="lytics-tab"]',
  "Launch environment settings Event Tracking tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has([data-testid="lytics-tab"])',
  /** Toggle / field label verifies use actionRules (scoped .Tab__Info). */
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

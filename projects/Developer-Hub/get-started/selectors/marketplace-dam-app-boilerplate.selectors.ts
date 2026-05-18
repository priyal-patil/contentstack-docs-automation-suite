/**
 * Marketplace DAM App Boilerplate — extends Marketplace App Boilerplate maps.
 * JSON RTE row: data-test-id pattern `uilocation-json-rte` (aligns with App Configuration / Custom Field tiles).
 */

import {
  CLICK_SELECTORS as MARKETPLACE_CLICK,
  INPUT_SELECTORS as MARKETPLACE_INPUT,
} from "./marketplace-app-boilerplate.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...MARKETPLACE_CLICK,
  "Developer Hub UI Locations View Hosting Settings link (doc step)":
    MARKETPLACE_CLICK["Developer Hub UI Locations View Hosting link (doc step)"],
  "Developer Hub UI Locations JSON RTE row ellipsis (doc step)":
    '[data-test-id="uilocation-json-rte location-item"] div.action-button-dropdown',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...MARKETPLACE_INPUT,
  /** Basic Information → App icon; `accept=".png, .svg"` (DOM: `basic-information.html`). */
  "Developer Hub Basic Information app icon file input (doc step)":
    'input[type="file"][name="appLogo"]',
  "Developer Hub UI location JSON RTE Name input (doc step)":
    '[data-test-id="uilocation-json-rte-1-name"] input',
  "Developer Hub UI location JSON RTE Path input (doc step)":
    '[data-test-id="uilocation-json-rte-1-path"] input',
};

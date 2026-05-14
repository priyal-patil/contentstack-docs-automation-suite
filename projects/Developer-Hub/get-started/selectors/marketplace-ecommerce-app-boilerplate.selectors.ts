/**
 * Marketplace Ecommerce App Boilerplate — Developer Hub (doc-driven targets).
 * Reuses Marketplace App Boilerplate maps; adds second Custom Field + doc “View Hosting Settings” alias.
 */

import {
  CLICK_SELECTORS as MARKETPLACE_CLICK,
  INPUT_SELECTORS as MARKETPLACE_INPUT,
} from "./marketplace-app-boilerplate.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...MARKETPLACE_CLICK,
  /** Doc: “View Hosting Settings” click target (same banner node as boilerplate hosting link). */
  "Developer Hub UI Locations View Hosting Settings link (doc step)":
    MARKETPLACE_CLICK["Developer Hub UI Locations View Hosting link (doc step)"],
  /** Second Custom Field accordion — Data Type dropdown */
  "Developer Hub UI location Custom Field 2 Data Type dropdown (doc step)":
    '[data-test-id="uilocation-custom-field-2-data-type"] div.Select__control',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...MARKETPLACE_INPUT,
  "Developer Hub UI location Custom Field 2 Name input (doc step)":
    '[data-test-id="uilocation-custom-field-2-name"] input',
  "Developer Hub UI location Custom Field 2 Path input (doc step)":
    '[data-test-id="uilocation-custom-field-2-path"] input',
};

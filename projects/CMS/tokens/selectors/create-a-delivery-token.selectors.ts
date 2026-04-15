/**
 * Flow: create-a-delivery-token
 * Source: https://www.contentstack.com/docs/developers/create-tokens/create-a-delivery-token
 *
 * Runtime merge: applied after `module.selectors.ts` (keys here override the module).
 * Add or override entries here when the delivery-token UI shifts; keep doc-step names stable.
 *
 * Primary UI anchors (`data-test-id` and patterns):
 * - Add CTA: cs-delivery-token-add
 * - Tabs: Delivery Tokens tab (role=tab text)
 * - Create form: cs-delivery-token-name-input, cs-delivery-token-description-input, cs-delivery-token-scope,
 *   cs-delivery-token-env (Publishing Environments), cs-delivery-token-env-name-* (env radios)
 * - Stack API / tokens: cs-delivery-token-stackAPI-input, cs-delivery-token-info-empty-label,
 *   cs-delivery-token-info-input, preview-token__edit-token, cs-toggle-switch (Create Preview Token)
 * - Generate: button "Generate Token" / delivery-token-generate*
 */

import { CLICK_SELECTORS as moduleClick, INPUT_SELECTORS as moduleInput } from "./module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...moduleClick,
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...moduleInput,
  /** After Generate, value may mount under cs-delivery-token-info-input or sibling test-ids. */
  "Delivery Token value in edit page (doc step)":
    '[data-test-id="cs-delivery-token-info-input"] input, [data-test-id*="delivery-token-info" i] input, input[name="deliveryToken"], input[aria-label="deliveryToken"], [data-test-id*="delivery-token" i] input[readonly]',
};

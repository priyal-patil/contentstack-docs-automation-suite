/**
 * Flow: delete-a-stack
 * Source: https://www.contentstack.com/docs/developers/set-up-stack/delete-a-stack
 *
 * Runtime merge: applied after `module.selectors.ts`. Use these to pin locators without editing the shared stack module.
 *
 * Delete Stack modal: confirmation field uses `aria-label="name"` with placeholder text containing DELETE
 * (verify step tolerates this via actionRules + placeholder check).
 */

import { CLICK_SELECTORS as moduleClick, INPUT_SELECTORS as moduleInput } from "./module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...moduleClick,
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...moduleInput,
  /** Prefer modal-scoped match so verify does not resolve the Stack Name field under the overlay. */
  "Delete confirmation (doc step)":
    '[role="dialog"]:has-text("Delete Stack") input[placeholder*="DELETE" i], [role="dialog"]:has-text("permanently delete") input[placeholder*="DELETE" i], input[placeholder*="DELETE" i], input[aria-label*="delete" i], input[name*="delete" i]',
};

/**
 * Personalize → **variants** (Entry Variants in Headless CMS).
 *
 * Merges **`CMS/stack`** + **`CMS/entries`** maps so **`Headless CMS`**, stack card, **`Entries`**,
 * **`First Entry row`**, **`Save`**, and **`Entry Title`** resolve like CMS entry flows.
 * Flow-specific selectors: **`create-an-entry-variant.selectors.ts`**.
 */

import { CLICK_SELECTORS as CMS_STACK_CLICK } from "../../../CMS/stack/selectors/module.selectors";
import { CLICK_SELECTORS as CMS_ENTRIES_CLICK, INPUT_SELECTORS as CMS_ENTRIES_INPUT } from "../../../CMS/entries/selectors/module.selectors";
import { CLICK_SELECTORS as FLOW_CLICK } from "./create-an-entry-variant.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...CMS_STACK_CLICK,
  ...CMS_ENTRIES_CLICK,
  ...FLOW_CLICK,
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...CMS_ENTRIES_INPUT,
};

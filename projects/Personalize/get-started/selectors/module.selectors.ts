/**
 * Personalize → get-started (shared module selectors).
 *
 * Merges **`set-up-personalize`** maps so **`get-started-with-personalize-ab-test-end-to-end-guide.flow.json`** (and other get-started flows) resolve the same locators as create-project / A/B / event / edit.
 * **Create Entry Variants in CMS** merges **`CMS/stack`**, **`CMS/entries`**, and **`create-entry-variants-in-cms.selectors.ts`** (App Switcher → Headless CMS handlers live in **`rules/core/actionRules.ts`**).
 * Add **`.../selectors/<flow-id>.selectors.ts`** only for get-started–specific targets.
 */

import { CLICK_SELECTORS as CLICK_CREATE_PROJECT } from "../../set-up-personalize/selectors/create-personalize-project.selectors";
import { CLICK_SELECTORS as CLICK_AB_TEST, INPUT_SELECTORS as INPUT_AB_TEST } from "../../set-up-personalize/selectors/create-ab-test-experience.selectors";
import { CLICK_SELECTORS as CLICK_EVENT, INPUT_SELECTORS as INPUT_EVENT } from "../../set-up-personalize/selectors/create-event.selectors";
import { CLICK_SELECTORS as CLICK_EDIT_EXP, INPUT_SELECTORS as INPUT_EDIT_EXP } from "../../set-up-personalize/selectors/edit-experience.selectors";
import { CLICK_SELECTORS as CLICK_ADD_METRIC, INPUT_SELECTORS as INPUT_ADD_METRIC } from "../../set-up-personalize/selectors/add-event-to-ab-test-experience.selectors";
import { CLICK_SELECTORS as CMS_STACK_CLICK } from "../../../CMS/stack/selectors/module.selectors";
import { CLICK_SELECTORS as CMS_ENTRIES_CLICK, INPUT_SELECTORS as CMS_ENTRIES_INPUT } from "../../../CMS/entries/selectors/module.selectors";
import { CLICK_SELECTORS as CLICK_ENTRY_VARIANTS_CMS } from "./create-entry-variants-in-cms.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...CLICK_CREATE_PROJECT,
  ...CLICK_AB_TEST,
  ...CLICK_EVENT,
  ...CLICK_EDIT_EXP,
  ...CLICK_ADD_METRIC,
  ...CMS_STACK_CLICK,
  ...CMS_ENTRIES_CLICK,
  ...CLICK_ENTRY_VARIANTS_CMS,
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...INPUT_AB_TEST,
  ...INPUT_EVENT,
  ...INPUT_EDIT_EXP,
  ...INPUT_ADD_METRIC,
  ...CMS_ENTRIES_INPUT,
};

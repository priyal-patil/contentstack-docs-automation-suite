/**
 * Personalize → **creating-personalize-content** (shared module selectors).
 *
 * Merges **CMS stack** + [**Create Entry Variants in CMS**](../../../Personalize/get-started/selectors/create-entry-variants-in-cms.selectors.ts)
 * selectors so **`Settings (doc step)`**, **Variants** sidebar, **Apply** / **Save** resolve on the Headless CMS tab.
 *
 * DOM: **`data/dom/Personalize/exp-rightnav.html`**, **`data/dom/Personalize/experiences.html`**
 */

import { CLICK_SELECTORS as CMS_STACK_CLICK } from "../../../CMS/stack/selectors/module.selectors";
import { CLICK_SELECTORS as CLICK_ENTRY_VARIANTS_CMS } from "../../get-started/selectors/create-entry-variants-in-cms.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...CMS_STACK_CLICK,
  ...CLICK_ENTRY_VARIANTS_CMS,
};

/**
 * Merged selectors for getting-started-with-contentstack-and-ai flow.
 * Reuses stack, content-models, environment, tokens, and entries modules.
 * Restores stack wizard "Create (doc step)" after content-models merge (different CTA).
 */
import { CLICK_SELECTORS as stackClick, INPUT_SELECTORS as stackInput } from "./module.selectors";
import { CLICK_SELECTORS as cmClick, INPUT_SELECTORS as cmInput } from "../../content-models/selectors/module.selectors";
import {
  CLICK_SELECTORS as ctcClick,
  INPUT_SELECTORS as ctcInput,
} from "../../content-models/selectors/create-content-type.selectors";
import { CLICK_SELECTORS as envClick, INPUT_SELECTORS as envInput } from "../../environment/selectors/module.selectors";
import { CLICK_SELECTORS as tokClick, INPUT_SELECTORS as tokInput } from "../../tokens/selectors/module.selectors";
import { CLICK_SELECTORS as entClick, INPUT_SELECTORS as entInput } from "../../entries/selectors/module.selectors";

/**
 * After merging content-models / create-content-type, "Create New (doc step)" and "Use Prebuilt (doc step)"
 * pointed at + New *Content Type* menu (`cs-cb-new-ct-*`), not the add-stack box (`cs-add-stack-*`).
 * Stack picker uses div[role=button] — put stack test-ids first, then CT menu fallbacks for later steps.
 */
const createNewDocStepMerged =
  '[data-test-id="cs-add-stack-create-new"], [data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="button"]:has-text("Create New"), [role="menuitem"]:has-text("Create New")';
const usePrebuiltDocStepMerged =
  '[data-test-id="cs-add-stack-use-prebuilt"], [data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")';

export const CLICK_SELECTORS: Record<string, string> = {
  ...stackClick,
  ...cmClick,
  ...ctcClick,
  ...envClick,
  ...tokClick,
  ...entClick,
  "Create New (doc step)": createNewDocStepMerged,
  "Use Prebuilt (doc step)": usePrebuiltDocStepMerged,
  /** Stack creation modal primary CTA — must win over content-models modular-blocks Create. */
  "Create (doc step)": stackClick["Create (doc step)"],
  /** Settings (gear) → Stack — doc Part 2 Step 4 “Settings → Stack”. */
  "Stack in settings left nav (doc step)":
    'a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings"]), [data-test-id="cs-stack-settings"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...stackInput,
  ...cmInput,
  ...ctcInput,
  ...envInput,
  ...tokInput,
  ...entInput,
  /** Entry editor — Multi Line “Body” field (doc Step 5 body text). */
  "Entry Body Multi Line (doc step)":
    '[data-test-id="cs-edit-entry-field-multi_line"] textarea, textarea[name*="multi_line" i]',
  /** Entry editor — File “Cover Image” field (hidden input; doc Step 5 upload an image). */
  "Entry Cover Image file input (doc step)":
    '[data-test-id="cs-edit-entry-field-file"] input[type="file"], [data-test-id*="edit-entry-field-file" i] input[type="file"]',
};

/**
 * Merged selectors for Quickstart in 5 mins (single end-to-end doc journey).
 * Doc: https://www.contentstack.com/docs/developers/quickstart-in-5-mins
 * Combines stack, content-models (create CT), environment, entries.
 */
import { CLICK_SELECTORS as stackClick, INPUT_SELECTORS as stackInput } from "../../stack/selectors/module.selectors";
import { CLICK_SELECTORS as cmClick, INPUT_SELECTORS as cmInput } from "./module.selectors";
import {
  CLICK_SELECTORS as ctcClick,
  INPUT_SELECTORS as ctcInput,
} from "./create-content-type.selectors";
/** Environment steps use the same locators as `projects/CMS/environment/selectors/module.selectors.ts` (see `data/dom/CMS/environment/*.html`). */
import { CLICK_SELECTORS as envClick, INPUT_SELECTORS as envInput } from "../../environment/selectors/module.selectors";
import { CLICK_SELECTORS as entClick, INPUT_SELECTORS as entInput } from "../../entries/selectors/module.selectors";
import { CLICK_SELECTORS as langClick, INPUT_SELECTORS as langInput } from "../../language/selectors/module.selectors";

const createNewDocStepMerged =
  '[data-test-id="cs-add-stack-create-new"], [data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="button"]:has-text("Create New"), [role="menuitem"]:has-text("Create New")';
const usePrebuiltDocStepMerged =
  '[data-test-id="cs-add-stack-use-prebuilt"], [data-test-id="cs-cb-new-prebuilt-ct-child"], li:has-text("Use Prebuilt"), [role="menuitem"]:has-text("Use Prebuilt")';

export const CLICK_SELECTORS: Record<string, string> = {
  ...stackClick,
  ...cmClick,
  ...ctcClick,
  ...envClick,
  ...entClick,
  ...langClick,
  // langClick narrows Content Models to data-test-id only; quickstart needs link/button fallbacks after stack create.
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], a:has-text("Content Models"), button:has-text("Content Models")',
  "Create New (doc step)": createNewDocStepMerged,
  "Use Prebuilt (doc step)": usePrebuiltDocStepMerged,
  /** Stack Create New Stack modal primary action (avoid global `button:has-text("Create")` matching wrong control). */
  "Create (doc step)":
    '[role="dialog"]:has(h3:has-text("Create New Stack")) button:has-text("Create"), [role="dialog"]:has-text("Create New Stack") button:has-text("Create")',
  /** Create Stack modal — Master Language label (doc step). */
  "Master Language (create stack doc step)":
    'label:has-text("Master Language"), [data-test-id*="stack-create-master-language" i]',
  /** Create Stack modal — open Master Language picker (combobox / trigger). */
  "Master Language dropdown (create stack doc step)":
    '[role="dialog"] [data-test-id^="cs-stack-create-master-language"], [role="dialog"] label:has-text("Master Language") ~ div [role="combobox"], [role="dialog"] label:has-text("Master Language") ~ div [tabindex="0"], [role="dialog"] label:has-text("Master Language") ~ div [role="button"]',
  /** Select Content Type modal — row whose title is About Us (doc step). */
  "About Us content type row (doc step)":
    '.ReactModal__new-entry [data-test-id^="cs-table-body-row-"]:has([data-test-id="cs-content-type-list-title-text"]:has-text("About Us")), [role="dialog"]:has-text("Select Content Type") [role="row"]:has-text("About Us")',
  "Select Content Type modal title (doc step)":
    '[data-test-id="cs-modal-title-select-content-type"], h3[title="Select Content Type"], [role="dialog"]:has-text("Select Content Type") [data-test-id="cs-modal-title"]',
  "Proceed (Select Content Type modal) (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"]:has-text("Select Content Type") button:has-text("Proceed")',
  "Environment Label Color (doc step)": '[data-test-id="cs-environments-create-color"]',
  "Environment color picker (doc step)": '[data-test-id="cs-environments-create-pick-color"]',
  "Language (environment create doc step)": '[data-test-id="cs-environments-create-language"]',
  /** Publish Entry modal — doc: Select Environment(s), Language(s), Publish Now/Later (publish-entry.html). */
  "Publish Entry Select Environment label (doc step)": '[data-test-id="cs-entries-publish-select-environment"]',
  "Publish Entry production environment label (doc step)":
    '[data-test-id="cs-entries-publish-select-environment-element-label"]:has-text("production")',
  "Publish Entry Select Language label (doc step)": '[data-test-id="cs-entries-publish-select-lang"]',
  "Publish Entry English United States language label (doc step)":
    '[data-test-id="cs-entries-publish-select-lang-element-label"]:has-text("English - United States")',
  "Publish Entry Publish schedule label (doc step)": '[data-test-id="cs-entries-publish-select"]',
  "Publish Entry Now option (doc step)": '[data-test-id="cs-entries-publish-select-now"]',
  "Publish Entry Later option (doc step)": '[data-test-id="cs-entries-publish-select-later"]',
  /** Entry editor right sidebar — Information tab (“i”) per Retrieve Your Content doc. */
  "Entry Information sidebar tab (doc step)": '[data-test-id="cs-entry-edit-tab-information"]',
  "Entry UID row in info panel (doc step)":
    '.entry-info-list .InfoRow:has-text("Entry UID"), .SidebarWindow__content .InfoRow:has-text("Entry UID"), [class*="InfoRow"]:has-text("Entry UID")',
  "Content Type UID row in info panel (doc step)":
    '.entry-info-list .InfoRow:has-text("Content Type UID"), .SidebarWindow__content .InfoRow:has-text("Content Type UID"), [class*="InfoRow"]:has-text("Content Type UID")',
  /** Info panel — copy/read-only value cells next to Entry UID / Content Type UID labels. */
  "Entry UID value (doc step)": '.InfoRow:has-text("Entry UID") .InfoRowContent',
  "Content Type UID value (doc step)": '.InfoRow:has-text("Content Type UID") .InfoRowContent',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...stackInput,
  ...cmInput,
  ...ctcInput,
  ...envInput,
  ...entInput,
  ...langInput,
  /** URL field added in Content Type Builder (Single Line, display name URL). */
  "Entry URL (quickstart doc step)":
    '[data-test-id^="cs-edit-entry-field-single_line"] input, [data-test-id="cs-field-label"]:has-text("URL") ~ * input, label:has-text("URL") ~ * input',
};

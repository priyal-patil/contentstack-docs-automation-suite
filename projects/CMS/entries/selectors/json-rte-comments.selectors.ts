export const CLICK_SELECTORS: Record<string, string> = {
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"], button:has-text("Content Models"), a:has-text("Content Models")',
  "+ New Content Type (doc step)":
    'button:has-text("New Content Type"), button[aria-label="Create New Content Type"]',
  "Create New (doc step)":
    '[data-test-id="cs-cb-new-ct-child"], button:has-text("Create New"), [role="menuitem"]:has-text("Create New")',
  "Single (Type) (doc step)":
    '[data-testid="cs-modal"][role="dialog"] label:has-text("Single"), [data-testid="cs-modal"][role="dialog"] [role="radio"]:has-text("Single")',
  "Save and proceed (doc step)":
    '[data-test-id="cs-ct-create-modal-submit"], [data-testid="cs-modal"] button:has-text("Save and proceed"), button:has-text("Save and proceed")',
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  "JSON Rich Text Editor field (doc step)":
    '.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-supercharged_rte"]), [data-test-id="cs-ct-select-field-supercharged_rte"]',
  "Save and Close (doc step)":
    '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  "Entries (doc step)":
    '[data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "New Entry (doc step)":
    'button[data-test-id="cs-new-entry-all-entry"], button[aria-label="Create New Entry"], button:has-text("New Entry")',
  "JSON RTE CT row (doc step)":
    '.ReactModal__new-entry [role="row"]:has-text("JSON RTE CT-"), [role="dialog"] [role="row"]:has-text("JSON RTE CT-"), [role="dialog"] table tr:has-text("JSON RTE CT-")',
  "Create Entry (doc step)":
    '[data-test-id="cs-new-entry-single-proceed"], [role="dialog"] button:has-text("Create"), [role="dialog"] button:has-text("Proceed")',
  "JSON RTE field comment icon (doc step)":
    '[data-test-id="cs-edit-entry-field-json_rte"] button[data-test-id^="cs-new-comment-"], [data-test-id="cs-edit-entry-field-json_rte"] button.click-to-comment',
  "First paragraph add comment icon (doc step)":
    'xpath=(//*[@data-testid="scrte-discussion-icon"])[1]',
  "Add comment on selected text (doc step)":
    '#scrte-toolbar [data-icon="rangeComment"]:visible, #scrte-toolbar [name="AddComment"]:visible',
  "Asset toolbar dropdown (doc step)":
    '#scrte-toolbar [data-icon="Asset"], #scrte-toolbar [data-icon="asset"]',
  "Upload new asset(s) (doc step)":
    '[data-test-id="cs-dropdown-elements"]:has-text("Upload new asset(s)"), li:has-text("Upload new asset(s)")',
  "Choose Files (asset modal) (doc step)":
    'button:has-text("Choose Files"), #scrte-image-modal button[data-test-id="cs-button"]',
  "Asset file input (doc step)":
    '#scrte-image-modal input[data-testid="drop-input"], #scrte-image-modal input[type="file"]',
  "Last block add comment icon (doc step)":
    'xpath=(//*[@data-testid="scrte-discussion-icon"])[last()]',
  "Post JSON RTE comment (doc step)":
    'button[data-test-id="discussion-save-btn"], button:has-text("Post")',
  "Cancel JSON RTE comment (doc step)":
    'button[data-test-id="cs-button"]:has-text("Cancel"), button:has-text("Cancel")',
  "Save (doc step)":
    '[data-test-id="cs-entry-save"], button:has-text("Save")'
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (doc step)":
    '[data-testid="cs-modal"][role="dialog"] input[name="name"], [data-test-id="cs-ct-create-modal-ct-name-input"] input',
  "Description (ct create) (doc step)":
    '[data-test-id="cs-ct-modal-ct-description-input"] textarea[name="description"]',
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], [aria-label*="title" i]',
  "JSON RTE editor (doc step)":
    '[data-test-id="cs-edit-entry-field-json_rte"] #scrte-editable, #scrte-editable',
  "JSON RTE comment textbox (doc step)":
    'textarea.scrte-discussion-body--mention__input:visible, textarea[placeholder*="Enter a comment" i]:visible'
};

export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="Headless CMS" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  "Settings (doc step)":
    'div.TopNavbar__content__items__list__redirect a[href*="/settings/stack"] button[data-test-id="cms-nav-settings"], a[href*="/settings/stack"] [data-test-id="cms-nav-settings"], [data-test-id="cms-nav-settings"], [aria-label="Settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  "More (doc step)":
    'button[aria-label="aria-button"]:has-text("More"), [role="button"]:has-text("More"), button:has-text("More")',
  "Languages from left nav (doc step)":
    '[data-test-id="cs-stack-settings-languages"], #languages, a[href*="/settings/languages"]',
  "Languages (doc step)":
    '[data-test-id="cs-stack-settings-languages"], #languages, a[href*="/settings/languages"]',
  "Languages page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Languages"), .PageTitle:has-text("Languages")',
  "Any non-default language (doc step)":
    '[data-test-id="cs-table-body-row"]:not(:has-text("Default")) [data-test-id="cs-language-main"], [data-test-id="cs-language-main"]',
  "Second language from list (doc step)":
    '[data-test-id="cs-table-body-row-1"] [data-test-id="cs-language-main"], [aria-label="row 2"] [data-test-id="cs-language-main"], [data-test-id="cs-table-body-row"]:not(:has-text("Default")) [data-test-id="cs-language-main"]',
  "Content Models (doc step)":
    '[data-test-id="cms-nav-content-models"]',
  "vertical ellipsis (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  "Edit (doc step)":
    '#tableRowActionNode [data-test-id="cs-ct-action-edit"]',
  "Insert a field (doc step)":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"]',
  "Insert a field":
    '[data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"], [data-test-id="cs-field-type-selector"] .FieldTypeSelector__action-bar svg[name="PurpleAdd"]',
  "Properties (doc step)":
    '.ContentTypeField [data-test-id$="-option-properties"], .ContentTypeField button:has(svg[name="Sliders"]), [data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',
  "Advanced (doc step)":
    '[data-test-id="cs-ct-field-group-tab-advanced"], .Tab__item:has-text("Advanced"), [role="tab"]:has-text("Advanced"), button:has-text("Advanced")',
  "Non-localizable (doc step)":
    '[data-test-id="cs-ct-field-singleline-non-localizable-disabled"], [data-test-id*="non-localizable"], [data-test-id*="nonLocalization"] button, [data-test-id*="nonLocalization"] [role="switch"], label:has-text("Non-localizable") input, .ToggleWrap:has-text("Non-localizable") input, .ToggleWrap:has-text("Non-localizable") [role="switch"]',
  "Save and Close (doc step)":
    '[data-test-id="cs-ct-save-close"], button:has-text("Save and Close")',
  "Language row action menu (doc step)":
    '[role="row"]:has-text("AUTO-") button[data-test-id="cs-table-action-options"], button[data-test-id="cs-table-action-options"]:not([disabled]), button[aria-label*="row" i][role="menu"]:not([disabled])',
  "New Language (doc step)":
    '[data-test-id="cs-languages-header-new-language"], button:has-text("New Language")',
  "Add Language modal (doc step)":
    '.ReactModal__add-lang [data-test-id="cs-modal-title"], [role="dialog"]:has-text("Add Language")',
  "Edit Language modal (doc step)":
    '[data-test-id="cs-modal-title-edit-language"], [role="dialog"]:has-text("Edit Language")',
  "Delete icon (doc step)":
    '[data-test-id="cs-languages-action-delete"], li[data-test-id*="languages-action-delete" i], [role="menuitem"]:has-text("Delete"), li:has-text("Delete")',
  "Delete action (doc step)":
    '[role="menuitem"]:has-text("Delete"), li:has-text("Delete"), [data-test-id="cs-languages-action-delete"]',
  "Remove (doc step)":
    '[role="dialog"] button:has-text("Remove"), [role="dialog"] button:has-text("Delete"), [data-test-id="cs-languages-remove-button"], [data-test-id="cs-languages-action-remove"]',
  "Add Supported Language option (doc step)":
    '[data-test-id="cs-languages-modal-existing-language"], label:has-text("Add Supported Language")',
  "Create Custom Language option (doc step)":
    '[data-test-id="cs-languages-modal-custom-language"], label:has-text("Create Custom Language")',
  "Language Name label (doc step)":
    '[data-test-id="cs-languages-custom-language-create-label"], label[for="password_confirmation"]',
  "Language Code label (doc step)":
    '[data-test-id="cs-languages-custom-language-code-label"], label[for="language-code"]',
  "Select Language label (doc step)":
    '[data-test-id="cs-languages-existing-language-label"], label[for="locale"]',
  "Select Language dropdown (doc step)":
    '[data-test-id="cs-language-create-edit-select-language"]',
  "French - France option (doc step)":
    '[role="option"]:has-text("French - France"):visible, div[id*="-option-"]:has-text("French - France"):visible',
  "First language option (doc step)":
    '[role="option"]:visible, div[id*="-option-"]:visible',
  "Select Fallback Language label (doc step)":
    '[data-test-id="cs-lang-field-custom-fallback-locale"], label[for="fallback_locale"]',
  "Select Fallback Language dropdown (doc step)":
    '[data-test-id="cs-languages-modal-select-fallback-lang"]',
  "English - United States option (doc step)":
    '[role="option"]:has-text("English - United States"):visible, div[id*="-option-"]:has-text("English - United States"):visible',
  "Add Language submit (doc step)":
    '[data-test-id="cs-languages-create"], button:has-text("Add")',
  "Language Name (edit label doc step)":
    '[data-test-id="cs-language-edit-lang-name-label"], label[for="lang_name"]',
  "Select Fallback Language (edit label doc step)":
    '[data-test-id="cs-language-edit-fallback-lang-label"], label[for="locales"]',
  "Save Language (doc step)":
    '[data-test-id="cs-languages-edit-update"], button:has-text("Save")'
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Language Name (doc step)":
    '[data-test-id="cs-languages-custom-language-create-input"] input[name="name"], input[aria-label="name"]',
  "Language Code (doc step)":
    '[data-test-id="cs-languages-custom-language-code-input"] input[name="code"], input[aria-label="code"]',
  "Language Name (edit doc step)":
    '[data-test-id="cs-language-edit-lang-name-text-input"] input, input[name="ar-ae"]',
  "Select Language dropdown (doc step)":
    '[data-test-id="cs-language-create-edit-select-language"] input, [data-test-id="cs-language-create-edit-select-language"] [role="combobox"] input, [data-test-id="cs-language-create-edit-select-language"] [aria-autocomplete="list"]',
  "Select Fallback Language dropdown (doc step)":
    '[data-test-id="cs-languages-modal-select-fallback-lang"] input, [data-test-id="cs-languages-modal-select-fallback-lang"] [role="combobox"] input, [data-test-id="cs-languages-modal-select-fallback-lang"] [aria-autocomplete="list"]',
};

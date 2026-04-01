export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  /** get-started-with-workflows — top nav Entries + list (see entries module; TopNavbar cms-nav-entries). */
  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  "Workflows in settings left nav (doc step)":
    'a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-workflows"]), [data-test-id="cs-stack-settings-workflows"]',
  "Workflow list first row open (doc step)": '[data-test-id="cs-table-body-row-0"]',
  "Workflow list first row Delete in workflow actions menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-workflow-action-delete"]',
  "Delete Workflow modal Proceed button (doc step)":
    '[data-test-id="cs-workflow-quick-action-delete"], button:has-text("Proceed")',
  "Workflow first stage Edit icon summary card (doc step)":
    '#stage_0 [data-test-id="cs-entry-reference-details-action-edit"]',
  "New Workflow header button (doc step)": '[data-test-id="cs-workflow-header-new-workflow"]',
  "Workflow add first stage (doc step)": '[data-test-id="cs-wf-add-new-stage"], [data-test-id="cs-wf-add-new-stage-icon"]',
  "Workflow All Content types scope option (doc step)": '[data-test-id="cs-wf-allContentType"]',
  "Workflow Specific Content types scope option (doc step)": '[data-test-id="cs-wf-specificContentType"]',
  /** Workflows use case 1 — summary-card Edit per stage index (0-based #stage_N). */
  "Workflow stage index 1 Edit icon summary card (doc step)":
    '#stage_1 [data-test-id="cs-entry-reference-details-action-edit"]',
  "Workflow stage index 2 Edit icon summary card (doc step)":
    '#stage_2 [data-test-id="cs-entry-reference-details-action-edit"]',
  "Workflow stage index 3 Edit icon summary card (doc step)":
    '#stage_3 [data-test-id="cs-entry-reference-details-action-edit"]',
  "Workflow stage index 4 Edit icon summary card (doc step)":
    '#stage_4 [data-test-id="cs-entry-reference-details-action-edit"]',
  "Workflow stage index 1 parent accordion expand (doc step)":
    '[data-test-id="cs-wf-edit-stage-1"] .Accordion-v2__heading-parent button, [data-test-id="cs-wf-edit-stage-1"] .Accordion__heading button',
  "Workflow stage index 2 parent accordion expand (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] .Accordion-v2__heading-parent button, [data-test-id="cs-wf-edit-stage-2"] .Accordion__heading button',
  "Workflow stage index 3 parent accordion expand (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] .Accordion-v2__heading-parent button, [data-test-id="cs-wf-edit-stage-3"] .Accordion__heading button',
  "Workflow stage index 4 parent accordion expand (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] .Accordion-v2__heading-parent button, [data-test-id="cs-wf-edit-stage-4"] .Accordion__heading button',
  "Workflow stage index 1 transition accordion toggle (doc step)":
    '[data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-accordion"] .Accordion__heading button',
  "Workflow stage index 2 transition accordion toggle (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-accordion"] .Accordion__heading button',
  "Workflow stage index 3 transition accordion toggle (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-accordion"] .Accordion__heading button',
  "Workflow stage index 4 transition accordion toggle (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-accordion"] .Accordion__heading button',
  /** Click Specific stage(s) radio (same test-id as verify). */
  "Workflow Specific stages option (doc step)": '[data-test-id="cs-wf-stage-specific-stages"]',
  /** Click All stages radio in transition rules. */
  "Workflow stage All stages option (doc step)": '[data-test-id="cs-wf-stage-all-stages"]',
  "Workflow first stage parent accordion expand (doc step)":
    '[data-test-id="cs-wf-edit-stage-0"] .Accordion-v2__heading-parent button, [data-test-id="cs-wf-edit-stage-0"] .Accordion__heading button',
  "Workflow first stage transition accordion toggle (doc step)":
    '#stage_0 [data-test-id="cs-accordion"] .Accordion__heading button, [data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-accordion"] .Accordion__heading button',
  "Workflow first stage Specific stages radio (doc step)":
    '#stage_0 [data-test-id="cs-wf-stage-specific-stages"], [data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-wf-stage-specific-stages"]',
  "Workflow first stage specific next stage first checkbox (doc step)":
    '#stage_0 .next-stage input[type="checkbox"]:first-of-type, #stage_0 [data-test-id="cs-select-element"] input',
  "Workflow stage All users roles move option (doc step)": '[data-test-id="cs-wf-stage-all-users"]',
  "Workflow stage Specific users roles move option (doc step)": '[data-test-id="cs-wf-stage-specific-users"]',
  "Workflow stage All users edit entry option (doc step)": '[data-test-id="cs-wf-edit-stage-by-all"]',
  "Workflow stage No users edit entry option (doc step)": '[data-test-id="cs-wf-edit-stage-by-none"]',
  "Workflow stage Current stage users edit option (doc step)": '[data-test-id="cs-wf-edit-stage-by-current-stage-user"]',
  "Workflow first stage Done button (doc step)": '[data-test-id="cs-workflow-stage-done"]',
  "Workflow add second stage (doc step)": '[data-test-id="cs-wf-add-new-stage"], [data-test-id="cs-wf-add-new-stage-icon"]',
  "Workflow second stage Done button (doc step)": '[data-test-id="cs-workflow-stage-done"]',
  "Workflow third stage Done button (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-workflow-stage-done"]',
  "Workflow fourth stage Done button (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-workflow-stage-done"]',
  "Workflow fifth stage Done button (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-workflow-stage-done"]',
  /** Color picker on stage row — open modal (workflows-use-cases: unique template colors). */
  "Workflow stage index 1 color picker (doc step)":
    '[data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-color-picker"] .ColorPicker, [data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-color-picker"]',
  "Workflow stage index 2 color picker (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-color-picker"] .ColorPicker, [data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-color-picker"]',
  "Workflow stage index 3 color picker (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-color-picker"] .ColorPicker, [data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-color-picker"]',
  "Workflow stage index 4 color picker (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-color-picker"] .ColorPicker, [data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-color-picker"]',
  "Workflow color picker modal Choose button (doc step)":
    '[data-test-id="cms-click-btn-secondary-action-environments-choose-color"]',
  "Workflow color template Orange (doc step)": '.ColorPicker__popover div[title="Orange"]',
  "Workflow color template Yellow (doc step)": '.ColorPicker__popover div[title="Yellow"]',
  "Workflow color template Green (doc step)": '.ColorPicker__popover div[title="Green"]',
  "Workflow color template Purple (doc step)": '.ColorPicker__popover div[title="Purple"]',
  "Enable Workflow toggle switch (doc step)":
    '[data-test-id^="cs-wf-activation-switch"] label.toggle-switch, [data-test-id^="cs-wf-activation-switch"] .toggle-switch',
  "Workflow editor Save button (doc step)":
    '.content-main.workflows button.Button--primary:has-text("Save"), form[data-test-id="cs-form"] ~ footer button:has-text("Save"), button[data-test-id="cs-button"].Button--primary:has-text("Save")',
  "Publish Rules tab Workflow Settings (doc step)": '[data-test-id="cs-settings-publish-rules-tab"]',
  "New Publish Rule header button (doc step)": '[data-test-id="cs-workflow-header-new-publish-rule"]',
  /** Action: Publish / Unpublish / All — label radios on Rule Details (new-rule-details-page.html). */
  "Publish rule All radio (doc step)": '[data-test-id="cs-publish-rule-action-all"]',
  /** Publish Rules list row ⋮ → Edit (publish-rule-verticle.html, publish-rule-verticle-menu.html). */
  "Publish rules list first row Actions ellipsis (doc step)":
    '.content-main.workflows [data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  "Publish rules list Edit in vertical actions menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-publish-rules-action-edit"]',
  /** publish-rule-verticle-menu.html — ul[cs-vertical-action-tooltip-actions] > li[cs-publish-rules-action-delete]. */
  "Publish rules list Delete in vertical actions menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] [data-test-id="cs-publish-rules-action-delete"]',
  /** delete-publish-rule-modal.html — destructive confirm. */
  "Delete publish rule modal Delete button (doc step)": '[data-test-id="cs-publish-rules-quick-action-delete"]',
  /** Rule Details edit footer (edit-rule-details.html) — not cs-publish-rules-create-save. */
  "Publish rule edit Save button (doc step)": '[data-test-id="cs-publish-rules-edit-save"]',
  /** get-started-with-workflows — entry-right-nav.html Status tab. */
  "Entry editor Status tab icon (doc step)": '[data-test-id="cs-entry-edit-tab-status"]',
  /** approve-edit-access-request-for-an-entry — entry-info.html / right-nav Information tab. */
  "Entry editor Information tab icon in right panel (doc step)": '[data-test-id="cs-entry-edit-tab-information"]',
  /** send-an-entry-for-edit-access-approval — footer CTA (doc: bottom of entry page). */
  "Request Edit Access button at entry page bottom (doc step)":
    'button:has-text("Request Edit Access"), [data-test-id*="request-edit-access" i], [data-test-id*="entry-request-edit" i]',
  /** about-workflow-tasks — TopNavbar Tasks next to Help (tasks-icon.html). */
  "Tasks icon beside Help in top bar (doc step)": '[data-test-id="cms-nav-tasks"]',
  /** about-workflow-tasks — Help (?) command bar control (user DOM: command-bar__help--large, cs-help-center). */
  "Help icon question mark beside Tasks in top bar (doc step)":
    'div.command-bar__help--large[aria-label="Help"], [data-test-id="cs-help-center"]',
  /** send-an-entry-for-publish-or-unpublish-approval part 2 — doc: Publish at bottom of entry editor page. */
  "Publish button at bottom of entry editor page (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"]',
  /** Alias — same control as Publish button at bottom (entries footer). */
  "Publish (bottom-right) (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"], button:has-text("Publish")',
  "Publish Entry modal (doc step)":
    '[data-test-id="cs-entry-single-publish-edit-page"], [data-test-id="cs-modal-title-publish-entry"], [role="dialog"]:has-text("Publish Entry")',
  "Send (doc step)":
    'button[data-test-id="cs-single-entry-publish"], [role="dialog"] button:has-text("Send")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Workflow list first row visible (doc step)": '[data-test-id="cs-table-body-row-0"]',
  "Workflow list first row Power icon visible after hover (doc step)":
    '[data-test-id="cs-table-body-row-0"] svg[name="Power"], [data-test-id="cs-table-body-row-0"] button:has(svg[name="Power"])',
  "Workflow first stage Delete icon (doc step)":
    '#stage_0 [data-test-id="cs-entry-reference-details-action-delete"]',
  "Delete Workflow modal title (doc step)": '[data-test-id="cs-modal-title-delete-workflow"]',
  "Workflow Settings page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Workflow Settings"), .page-header-title:has-text("Workflow Settings")',
  "Workflows tab selected Workflow Settings (doc step)":
    '[data-test-id="cs-settings-workflows-tab"].Tab__selected, [data-test-id="cs-settings-workflows-tab"]',
  "Workflow Name label (doc step)": '[data-test-id="cs-wf-title"]',
  "Workflow Description label (doc step)": '[data-test-id="cs-wf-description"]',
  "Workflow Scope label (doc step)": '[data-test-id="cs-wf-scope"]',
  "Workflow All Content types scope option (doc step)": '[data-test-id="cs-wf-allContentType"]',
  "Workflow Specific Content types scope option (doc step)": '[data-test-id="cs-wf-specificContentType"]',
  "Workflow first stage Stage name label (doc step)": '[data-test-id="cs-wf-stage-name"]',
  "Workflow first stage Description label (doc step)": '[data-test-id="cs-wf-stage-description"]',
  "Workflow first stage color picker (doc step)": '[data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-color-picker"]',
  "Workflow second stage Stage name label (doc step)":
    '[data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-name"], #stage_1 [data-test-id="cs-wf-stage-name"]',
  "Workflow second stage Description label (doc step)":
    '[data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-description"]',
  "Next available stages All stages label (doc step)": '[data-test-id="cs-wf-next-stages"]',
  "Workflow stage All stages option (doc step)": '[data-test-id="cs-wf-stage-all-stages"]',
  "Workflow Specific stages option (doc step)": '[data-test-id="cs-wf-stage-specific-stages"]',
  "Users who can move stage All users roles label (doc step)": '[data-test-id="cs-wf-stage-users"]',
  "Workflow stage All users roles move option (doc step)": '[data-test-id="cs-wf-stage-all-users"]',
  "Workflow stage Specific users roles move option (doc step)": '[data-test-id="cs-wf-stage-specific-users"]',
  "Users who can edit entry in stage label (doc step)": '[data-test-id="cs-wf-edit-stage"]',
  "Workflow stage All users edit entry option (doc step)": '[data-test-id="cs-wf-edit-stage-by-all"]',
  "Workflow stage No users edit entry option (doc step)": '[data-test-id="cs-wf-edit-stage-by-none"]',
  "Workflow stage Current stage users edit option (doc step)": '[data-test-id="cs-wf-edit-stage-by-current-stage-user"]',
  "Prevent self-advancement label (doc step)": '[data-test-id="cs-wf-four-eye-principle"]',
  "Workflow superusers field label (doc step)": '[data-test-id="cs-wf-superuser"]',
  "Enable Workflow label (doc step)": '[data-test-id="cs-wf-activation"]',
  "Workflow editor Save button label (doc step)":
    '.content-main.workflows button.Button--primary:has-text("Save"), button.Button--primary:has-text("Save")',
  "Workflow name input (doc step)": '[data-test-id="cs-wf-title-input"] input',
  "Workflow description input (doc step)": '[data-test-id="cs-wf-description-input"] textarea',
  "Workflow first stage name input (doc step)": '[data-test-id="cs-wf-stage-name-input"] input',
  "Workflow first stage description input (doc step)":
    '[data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-wf-stage-description-input"] textarea, [data-test-id="cs-wf-stage-description-input"] textarea',
  "Workflow second stage name input (doc step)":
    'input[name="workflowStages[1].name"], [data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-name-input"] input',
  "Workflow second stage description input (doc step)":
    '[data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-description-input"] textarea',
  "Workflow third stage Stage name label (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-wf-stage-name"], #stage_2 [data-test-id="cs-wf-stage-name"]',
  "Workflow third stage Description label (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-wf-stage-description"], #stage_2 [data-test-id="cs-wf-stage-description"]',
  "Workflow third stage name input (doc step)":
    'input[name="workflowStages[2].name"], [data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-wf-stage-name-input"] input',
  "Workflow third stage description input (doc step)":
    '[data-test-id="cs-wf-edit-stage-2"] [data-test-id="cs-wf-stage-description-input"] textarea',
  "Workflow fourth stage Stage name label (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-wf-stage-name"], #stage_3 [data-test-id="cs-wf-stage-name"]',
  "Workflow fourth stage Description label (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-wf-stage-description"], #stage_3 [data-test-id="cs-wf-stage-description"]',
  "Workflow fourth stage name input (doc step)":
    'input[name="workflowStages[3].name"], [data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-wf-stage-name-input"] input',
  "Workflow fourth stage description input (doc step)":
    '[data-test-id="cs-wf-edit-stage-3"] [data-test-id="cs-wf-stage-description-input"] textarea',
  "Workflow fifth stage Stage name label (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-wf-stage-name"], #stage_4 [data-test-id="cs-wf-stage-name"]',
  "Workflow fifth stage Description label (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-wf-stage-description"], #stage_4 [data-test-id="cs-wf-stage-description"]',
  "Workflow fifth stage name input (doc step)":
    'input[name="workflowStages[4].name"], [data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-wf-stage-name-input"] input',
  "Workflow fifth stage description input (doc step)":
    '[data-test-id="cs-wf-edit-stage-4"] [data-test-id="cs-wf-stage-description-input"] textarea',
  "Publish Rules tab selected Workflow Settings (doc step)":
    '[data-test-id="cs-settings-publish-rules-tab"].Tab__selected',
  "Rule Details page title (doc step)": '.rule-header__title:has-text("Rule Details")',
  "Publish rule Content type label (doc step)": '[data-test-id="cs-publish-rules-ct"]',
  "Publish rule All Content types option (doc step)": '[data-test-id="cs-publish-rules-all-ct"]',
  "Publish rule Specific Content Type(s) option (doc step)": '[data-test-id="cs-publish-rules-specific-ct"]',
  "Publish rule Language label (doc step)": '[data-test-id="cs-publish-rules-languages"]',
  "Publish rule All Languages option (doc step)": '[data-test-id="cs-publish-rules-all-languages"]',
  "Publish rule Specific Language(s) option (doc step)": '[data-test-id="cs-publish-rules-specific-languages"]',
  "Publish rule Environment label (doc step)": '[data-test-id="cs-publish-rules-env"]',
  "Publish rule Environment select control (doc step)": '[data-test-id="cs-publish-rules-select-env"] .Select__control',
  "Publish rule Action label (doc step)": '[data-test-id="cs-publish-rules-action"]',
  "Publish rule Action Publish option (doc step)": '[data-test-id="cs-publish-rule-action-publish"]',
  "Publish rule Action Unpublish option (doc step)": '[data-test-id="cs-publish-rule-action-unpublish"]',
  "Publish rule Action All option (doc step)": '[data-test-id="cs-publish-rule-action-all"]',
  "Publish rule Conditions section (doc step)": '[data-test-id="cs-publish-rules-conditions"]',
  "Publish rule Select approvers section (doc step)": '[data-test-id="cs-publish-rules-approvers"]',
  "Publish rule By User(s) label (doc step)": '[data-test-id="cs-publish-rules-user-approval"]',
  "Publish rule By Role(s) label (doc step)": '[data-test-id="cs-publish-rules-roles-approval"]',
  "Publish rule Prevent self-approval label (doc step)":
    '[data-test-id="cms-click-checkbox-publish-rules-four-eye-principle-disabled"] .Label--color--secondary',
  "Publish rule Workflow Stage section (doc step)": '[data-test-id="cs-publish-rules-workflow-stage"]',
  "Publish rule Workflow stage should be label (doc step)": '[data-test-id="cs-publish-rules-workflow-stage-title"]',
  "Publish rules table Actions column header (doc step)":
    '.content-main.workflows [data-test-id="cs-table"] .Table__head__column-text:has-text("Actions")',
  "Publish rules list first row visible (doc step)":
    '.content-main.workflows [data-test-id="cs-table-body-row-0"]',
  "Delete publish rule modal title (doc step)": '[data-test-id="cs-modal-title-delete-publish-rule"]',
  /** get-started-with-workflows — entry-status-modal.html panel title. */
  "Entry Status panel title (doc step)": '.SidebarWindow__content__title',
};

export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id="cs-stacklist-card-PriyalDocsStack"]',
  /** Open an entry (same targets as entries module - workflows flows do not merge entries selectors). */
  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  /** Entry editor right sidebar - Information tab (data/dom/CMS/entries/right-nav.html - cs-entry-edit-tab-information). */
  "Entry editor Information tab (doc step)": '[data-test-id="cs-entry-edit-tab-information"]',
  /** Entry editor right sidebar - Status tab (data/dom/CMS/entries/right-nav.html - cs-entry-edit-tab-status). */
  "Entry editor Status tab (doc step)": '[data-test-id="cs-entry-edit-tab-status"]',
  /** Beside the current workflow stage name in Workflow Details - prefer right sidebar so Change is not matched elsewhere. */
  "Entry workflow Change link (doc step)":
    '#resizable__panel a:has-text("Change"), .SidebarWindow__sidebar a:has-text("Change"), [data-test-id*="entry-workflow" i] a:has-text("Change"), [data-test-id*="workflow-stage" i] a:has-text("Change"), aside a:has-text("Change")',
  /** Primary action after editing workflow stage / assignee / comment (sidebar or inline panel). */
  "Entry workflow Update button (doc step)":
    '[data-test-id*="entry-workflow" i] button:has-text("Update"), aside .SidebarWindow__sidebar button.Button--primary:has-text("Update"), [class*="entry-workflow"] button:has-text("Update"), [role="dialog"] button:has-text("Update")',
  /** Doc: bottom of entry page - send-an-entry-for-edit-access-approval. */
  "Request Edit Access button (doc step)":
    'button:has-text("Request Edit Access"), [data-test-id*="request-edit-access" i], [data-test-id*="edit-access-request" i], a:has-text("Request Edit Access")',
  "Send Request button in Request Edit Access modal (doc step)":
    '[role="dialog"] button:has-text("Send Request"), .ReactModal__Content__footer button:has-text("Send Request"), [data-test-id*="modal" i] button:has-text("Send Request")',
  /** approve-edit-access-request-for-an-entry - Pending Access Requests dialog. */
  "Pending Access Requests Allow button (doc step)":
    '[role="dialog"] button:has-text("Allow"), .ReactModal__Content__footer button:has-text("Allow"), [data-test-id*="pending" i] button:has-text("Allow"), [data-test-id*="edit-access" i] button:has-text("Allow")',
  "Pending Access Requests Reject button (doc step)":
    '[role="dialog"] button:has-text("Reject"), .ReactModal__Content__footer button:has-text("Reject"), [data-test-id*="pending" i] button:has-text("Reject"), [data-test-id*="edit-access" i] button:has-text("Reject")',
  /** send-an-entry-for-publish-or-unpublish-approval (right-panel + publish modal path). */
  /** delete-a-publish-rule: Publish Rules tab (unselected) on Workflow Settings page. */
  "Publish Rules tab Workflow Settings (doc step)":
    '[data-test-id="cs-settings-publish-rules-tab"]',
  /** ⋮ actions button on first publish rule row. */
  "Publish rules list first row Actions ellipsis (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"]',
  /** Delete option in the ⋮ menu — used for both verify and click steps. */
  "Publish rules list first row Delete in actions menu visible (doc step)":
    '[data-test-id="cs-publish-rules-action-delete"]',
  "Publish rules list Delete in vertical actions menu (doc step)":
    '[data-test-id="cs-publish-rules-action-delete"]',
  /** Delete button inside Delete publish rule confirmation modal. */
  "Delete publish rule modal Delete button (doc step)":
    '[data-test-id="cs-publish-rules-quick-action-delete"]',
  /** After deletion: table or empty state confirms return to publish rules list. */
  "Publish rule delete completed success or modal dismissed (doc step)":
    '.content-main.workflows [data-test-id="cs-table"], .content-main.workflows [data-test-id="cs-empty-state"]',
  "Publish Rules Request Approval button (doc step)":
    '#resizable__panel button:has-text("Request Approval"), #resizable__panel a:has-text("Request Approval"), .SidebarWindow__content button:has-text("Request Approval"), .SidebarWindow__content a:has-text("Request Approval"), [data-test-id*="publish-rule" i] button:has-text("Request Approval"), [data-test-id*="publish-rule" i] a:has-text("Request Approval")',
  "Publish (bottom) button (doc step)":
    'button[data-test-id="cs-entry-publish"], button[aria-label="Publish Entry"], button:has-text("Publish")',
  "Send button in Publish modal (doc step)":
    'button[data-test-id="cs-single-entry-publish"], [role="dialog"] button:has-text("Send")',
  "First Environment option in Publish modal (doc step)":
    '[data-test-id="cs-entries-publish-select-environment-element"]:not(.Checkbox--state-disabled), [data-test-id="cs-entries-publish-select-environment-element"]',
  "First Language option in Publish modal (doc step)":
    '[data-test-id="cs-entries-publish-select-lang-element"]:not(.Checkbox--state-disabled), [data-test-id="cs-entries-publish-select-lang-element"]',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  "Workflows in settings left nav (doc step)":
    'a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-workflows"]), [data-test-id="cs-stack-settings-workflows"]',
  "Workflow listing first workflow row link (doc step)":
    'a[href*="/workflow/"][href$="/edit"]:has([data-test-id="cs-table-body-row-0"]), a[href*="/settings/workflow/"][href$="/edit"]:has([data-test-id="cs-table-body-row-0"])',
  /** Doc: hover workflow row to reveal Delete icon — app uses ⋮ menu instead.
   *  Hover executes; click on Delete icon fails correctly documenting doc/app mismatch. */
  "Workflow listing first workflow row hover for delete icon (doc step)":
    '[data-test-id="cs-table-body-row-0"]',
  "Workflow listing first workflow row Delete icon (doc step)":
    '[data-test-id="cs-table-body-row-0"] button:has(svg[name="Delete"]), [data-test-id="cs-table-body-row-0"] a:has(svg[name="Delete"])',
  "Workflow listing first workflow row Power icon (doc step)":
    '[data-test-id="cs-table-body-row-0"] button:has(svg[name="Power"]), [data-test-id="cs-table-body-row-0"] button:has(svg[name="Lightning"]), [data-test-id="cs-table-body-row-0"] svg[name="Power"]',
  "Workflow delete confirmation Proceed button (doc step)":
    '[role="dialog"] button:has-text("Proceed"), .Modal button:has-text("Proceed"), [data-test-id*="modal"] button:has-text("Proceed")',
  "Workflow stage modal Stage transition accordion toggle (doc step)":
    '[data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-accordion"] .Accordion__heading button:has(svg[name="CaretDown"]), #stage_0 [data-test-id="cs-accordion"] .Accordion__heading button:has(svg[name="CaretDown"])',
  "Workflow edit first stage Edit icon (doc step)":
    '#stage_0 [data-test-id="cs-entry-reference-details-action-edit"], #workflow_stages_0 [data-test-id="cs-entry-reference-details-action-edit"]',
  "Workflow edit first stage Delete icon (doc step)":
    '#stage_0 [data-test-id="cs-entry-reference-details-action-delete"], #workflow_stages_0 [data-test-id="cs-entry-reference-details-action-delete"]',
  "Workflow stage Current stage users edit option (doc step)": '[data-test-id="cs-wf-edit-stage-by-current-stage-user"]',
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
    '[data-test-id="cs-workflow-edit-save"], .content-main.workflows button.Button--primary:has-text("Save"), form[data-test-id="cs-form"] ~ footer button:has-text("Save"), button[data-test-id="cs-button"].Button--primary:has-text("Save")',
  /** revoke-edit-access-for-an-entry — doc step 4 (>4 users with edit access). */
  "Revoke edit access View All link (doc step)":
    '#resizable__panel button:has-text("View All"), #resizable__panel a:has-text("View All"), .SidebarWindow__sidebar button:has-text("View All"), .SidebarWindow__content button:has-text("View All")',
  /** All Other users dialog — Close (doc step 6). */
  "All Other users modal Close button (doc step)":
    '[role="dialog"]:has-text("All Other users") button:has-text("Close"), [role="dialog"]:has-text("All Other users") [data-test-id="cs-modal-close"]',
  /** Doc: “Once done, click on Close.” — same control as All Other users modal Close. */
  "Once done click Close in All Other users modal (doc step)":
    '[role="dialog"]:has-text("All Other users") button:has-text("Close"), [role="dialog"]:has-text("All Other users") [data-test-id="cs-modal-close"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /** Doc: Information icon on right panel (right-nav.html). */
  "Entry editor Information tab Information icon (doc step)": '[data-test-id="cs-entry-edit-tab-information"] svg[name="Information"]',
  /** Doc: Status panel - Status tab uses the Status icon on the right rail (right-nav.html). */
  "Entry editor Status tab Status icon (doc step)": '[data-test-id="cs-entry-edit-tab-status"] svg[name="Status"]',
  /** Status panel -> Workflow Details (change-entry-workflow-stage doc; right rail per doc). */
  "Entry editor Workflow Details heading (doc step)":
    '#resizable__panel div:has-text("Workflow Details"), [class*="SidebarWindow"] div:has-text("Workflow Details"), aside div:has-text("Workflow Details"), [data-test-id*="workflow-details" i], [data-test-id*="entry-workflow" i]:has-text("Workflow Details")',
  "Entry Workflow Settings section title (doc step)":
    '#resizable__panel div:has-text("Entry Workflow Settings"), [class*="SidebarWindow"] div:has-text("Entry Workflow Settings"), aside div:has-text("Entry Workflow Settings"), [data-test-id*="entry-workflow-settings" i], [role="dialog"]:has-text("Entry Workflow Settings")',
  "Set Workflow Stage label (doc step)":
    '[role="dialog"] [data-test-id="cs-field-label"]:has-text("Set Workflow Stage"), #resizable__panel [data-test-id="cs-field-label"]:has-text("Set Workflow Stage"), [data-test-id="cs-field-label"]:has-text("Set Workflow Stage"), label:has-text("Set Workflow Stage"), span.FieldLabel:has-text("Set Workflow Stage")',
  "Set Due Date label (doc step)":
    '[role="dialog"] [data-test-id="cs-field-label"]:has-text("Set Due Date"), #resizable__panel [data-test-id="cs-field-label"]:has-text("Set Due Date"), [data-test-id="cs-field-label"]:has-text("Set Due Date"), label:has-text("Set Due Date"), span.FieldLabel:has-text("Set Due Date")',
  "Assign to label (doc step)":
    '[role="dialog"] [data-test-id="cs-field-label"]:has-text("Assign to"), #resizable__panel [data-test-id="cs-field-label"]:has-text("Assign to"), [data-test-id="cs-field-label"]:has-text("Assign to"), [data-test-id*="entry-workflow" i] label:has-text("Assign to"), aside [data-test-id="cs-field-label"]:has-text("Assign to")',
  "Notify via Email label (doc step)":
    '[role="dialog"] label:has-text("Notify via Email"), #resizable__panel label:has-text("Notify via Email"), label:has-text("Notify via Email"), span:has-text("Notify via Email"), [data-test-id*="notify" i]:has-text("Notify via Email")',
  "Add Comment label (doc step)":
    '[role="dialog"] [data-test-id="cs-field-label"]:has-text("Add Comment"), #resizable__panel [data-test-id="cs-field-label"]:has-text("Add Comment"), [data-test-id="cs-field-label"]:has-text("Add Comment"), label:has-text("Add Comment"), span.FieldLabel:has-text("Add Comment")',
  /** Pending Access Requests modal (approve-edit-access-request-for-an-entry). */
  "Pending Access Requests modal title (doc step)":
    '[data-test-id^="cs-modal-title"]:has-text("Pending Access Requests"), [role="dialog"] h3:has-text("Pending Access Requests"), [role="dialog"]:has-text("Pending Access Requests")',
  /** Request Edit Access modal (send-an-entry-for-edit-access-approval). */
  "Request Edit Access modal title (doc step)":
    '[data-test-id^="cs-modal-title"]:has-text("Request Edit Access"), [role="dialog"] h3:has-text("Request Edit Access"), [role="dialog"] [data-test-id="cs-modal-title"]:has-text("Request Edit Access")',
  /** Doc step 3: Add comments box (label may vary by casing). */
  "Add comments for approver field (doc step)":
    '[role="dialog"] textarea[placeholder*="Add comments" i], [role="dialog"] textarea[placeholder*="comment" i], [role="dialog"] label:has-text("Add comments") ~ textarea, [role="dialog"] [data-test-id*="comment" i] textarea, [role="dialog"] textarea[name*="comment" i]',
  "Publish Rules section heading (doc step)":
    '#resizable__panel div:has-text("Publish Rules"), .SidebarWindow__content div:has-text("Publish Rules"), [data-test-id*="publish-rule" i]:has-text("Publish Rules")',
  "Publish approval request status text (doc step)":
    '#resizable__panel :is(div,span,p):has-text("approval"), .SidebarWindow__content :is(div,span,p):has-text("approval"), [data-test-id*="publish-rule" i] :is(div,span,p):has-text("approval")',
  "Publish Entry modal title (doc step)":
    '[data-test-id="cs-modal-title-publish-entry"], [data-test-id="cs-entry-single-publish-edit-page"] h3:has-text("Publish Entry"), [role="dialog"] h3:has-text("Publish Entry")',
  "Workflow Settings page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Workflow Settings"), .page-header-title:has-text("Workflow Settings")',
  "Workflow page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Workflow"), .page-header-title:has-text("Workflow")',
  "Workflows tab selected Workflow Settings (doc step)":
    '[data-test-id="cs-settings-workflows-tab"].Tab__selected, [data-test-id="cs-settings-workflows-tab"]',
  "Workflows tab selected Workflow (doc step)":
    '[data-test-id="cs-settings-workflows-tab"].Tab__selected, [data-test-id="cs-settings-workflows-tab"]',
  "Workflow listing Name column header (doc step)": '[data-test-id="cs-table-head-text--0"]',
  "Workflow Stages section label (doc step)": '[data-test-id="cs-wf-stage-title"]',
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
  "Prevent self-advancement label (doc step)": '[data-test-id="cs-wf-four-eye-principle"]',
  "Workflow superusers field label (doc step)": '[data-test-id="cs-wf-superuser"]',
  "Enable Workflow label (doc step)": '[data-test-id="cs-wf-activation"]',
  "Workflow editor Save button label (doc step)":
    '[data-test-id="cs-workflow-edit-save"], .content-main.workflows button.Button--primary:has-text("Save"), button.Button--primary:has-text("Save")',
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
  "Workflow stage Stage transition accordion title (doc step)":
    '[data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-accordion"] [data-test-id="cs-truncate"], #stage_0 [data-test-id="cs-accordion"] [data-test-id="cs-truncate"]',
  /** revoke-edit-access-for-an-entry — Status panel Workflow Details rail (doc step 3). */
  "Users to whom edit access is granted section heading (doc step)":
    '#resizable__panel div:has-text("Users to whom edit access is granted"), #resizable__panel div:has-text("edit access is granted"), .SidebarWindow__content div:has-text("edit access is granted"), .SidebarWindow__sidebar div:has-text("edit access is granted")',
  /** Same as CLICK — verify step resolution (doc step 4). */
  "Revoke edit access View All link (doc step)":
    '#resizable__panel button:has-text("View All"), #resizable__panel a:has-text("View All"), .SidebarWindow__sidebar button:has-text("View All"), .SidebarWindow__content button:has-text("View All")',
  /** All Other users modal title (doc step 5). */
  "All Other users modal title (doc step)":
    '[data-test-id^="cs-modal-title"]:has-text("All Other users"), [role="dialog"] h3:has-text("All Other users"), [role="dialog"] [data-test-id^="cs-modal-title"]:has-text("All Other users")',
  /** Same as CLICK — verify Close in modal (doc step 6). */
  "All Other users modal Close button (doc step)":
    '[role="dialog"]:has-text("All Other users") button:has-text("Close"), [role="dialog"]:has-text("All Other users") [data-test-id="cs-modal-close"]',
  /** Doc: “Once done, click on Close.” */
  "Once done click Close in All Other users modal (doc step)":
    '[role="dialog"]:has-text("All Other users") button:has-text("Close"), [role="dialog"]:has-text("All Other users") [data-test-id="cs-modal-close"]',
};

export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
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
  "Workflow first stage transition accordion toggle (doc step)":
    '#stage_0 [data-test-id="cs-accordion"] .Accordion__heading button:has(svg[name="CaretDown"]), [data-test-id="cs-wf-edit-stage-0"] [data-test-id="cs-accordion"] .Accordion__heading button:has(svg[name="CaretDown"])',
  "Workflow first stage Done button (doc step)": '[data-test-id="cs-workflow-stage-done"]',
  "Workflow add second stage (doc step)": '[data-test-id="cs-wf-add-new-stage"], [data-test-id="cs-wf-add-new-stage-icon"]',
  "Workflow second stage Done button (doc step)": '[data-test-id="cs-workflow-stage-done"]',
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
  "Workflow first stage Stage name label (doc step)": '[data-test-id="cs-wf-stage-name"]',
  "Next available stages All stages label (doc step)": '[data-test-id="cs-wf-next-stages"]',
  "Workflow stage All stages option (doc step)": '[data-test-id="cs-wf-stage-all-stages"]',
  "Users who can move stage All users roles label (doc step)": '[data-test-id="cs-wf-stage-users"]',
  "Workflow stage All users roles move option (doc step)": '[data-test-id="cs-wf-stage-all-users"]',
  "Users who can edit entry in stage label (doc step)": '[data-test-id="cs-wf-edit-stage"]',
  "Workflow stage All users edit entry option (doc step)": '[data-test-id="cs-wf-edit-stage-by-all"]',
  "Prevent self-advancement label (doc step)": '[data-test-id="cs-wf-four-eye-principle"]',
  "Workflow superusers field label (doc step)": '[data-test-id="cs-wf-superuser"]',
  "Enable Workflow label (doc step)": '[data-test-id="cs-wf-activation"]',
  "Workflow editor Save button label (doc step)":
    '[data-test-id="cs-workflow-edit-save"], .content-main.workflows button.Button--primary:has-text("Save"), button.Button--primary:has-text("Save")',
  "Workflow name input (doc step)": '[data-test-id="cs-wf-title-input"] input',
  "Workflow description input (doc step)": '[data-test-id="cs-wf-description-input"] textarea',
  "Workflow first stage name input (doc step)": '[data-test-id="cs-wf-stage-name-input"] input',
  "Workflow second stage name input (doc step)":
    'input[name="workflowStages[1].name"], [data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-name-input"] input',
  "Workflow stage Current stage users edit option (doc step)": '[data-test-id="cs-wf-edit-stage-by-current-stage-user"]',
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

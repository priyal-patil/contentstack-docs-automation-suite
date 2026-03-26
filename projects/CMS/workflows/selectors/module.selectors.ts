export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id^="stack-card"], [data-test-id^="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack")',
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button:has-text("Settings"), a:has-text("Settings"), [role="menuitem"]:has-text("Settings"), li:has-text("Settings")',
  "Workflows in settings left nav (doc step)":
    'a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-workflows"]), [data-test-id="cs-stack-settings-workflows"]',
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
    '.content-main.workflows button.Button--primary:has-text("Save"), form[data-test-id="cs-form"] ~ footer button:has-text("Save"), button[data-test-id="cs-button"].Button--primary:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Workflow Settings page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Workflow Settings"), .page-header-title:has-text("Workflow Settings")',
  "Workflows tab selected Workflow Settings (doc step)":
    '[data-test-id="cs-settings-workflows-tab"].Tab__selected, [data-test-id="cs-settings-workflows-tab"]',
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
    '.content-main.workflows button.Button--primary:has-text("Save"), button.Button--primary:has-text("Save")',
  "Workflow name input (doc step)": '[data-test-id="cs-wf-title-input"] input',
  "Workflow description input (doc step)": '[data-test-id="cs-wf-description-input"] textarea',
  "Workflow first stage name input (doc step)": '[data-test-id="cs-wf-stage-name-input"] input',
  "Workflow second stage name input (doc step)":
    'input[name="workflowStages[1].name"], [data-test-id="cs-wf-edit-stage-1"] [data-test-id="cs-wf-stage-name-input"] input',
};

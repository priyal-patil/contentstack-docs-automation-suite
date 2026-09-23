/**
 * AgentOS project-level selectors: the automation-builder controls shared by every AgentOS module.
 *
 * WHY THIS FILE EXISTS. These 14 targets were mapped only in
 * `projects/AgentOS/connectors/selectors/module.selectors.ts`. Overrides merge as
 *
 *   shared -> legacy -> project -> module -> flow
 *
 * so a MODULE-scoped map applies to that module alone. Every flow in
 * `contentstack-management-actions` therefore had no selector for them, and `resolveTarget()` fell back to
 * searching the page for the target string itself:
 *
 *   getByText('App Switcher icon in the top navigation bar', { exact: true })
 *
 * No page contains that sentence, so all 13 flows in that module died on step 1. Promoting the shared subset
 * to project level makes them reachable from every AgentOS module, which is where controls common to the
 * automation builder belong. Same defect as the Personalize and Studio mis-scopings.
 *
 * Values are copied VERBATIM from the connectors module, which exercises them successfully — nothing here is
 * newly invented. The connectors copies are deliberately left in place: they win under the merge order, so
 * that module's behaviour is unchanged.
 *
 * THIS DOES NOT MAKE `contentstack-management-actions` PASS. It removes 614 steps' worth of unmapped
 * targets, but 292 further targets (~1,356 steps, 95% of the module) are defined nowhere at all — including
 * "Contentstack connector in the Choose Connector list" (134 uses), "Contentstack Management option in the
 * connector list" (126) and "Stack Lookup field" (65). That module needs its selectors authored; this file
 * only stops it failing for a reason that was already solved elsewhere.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "App Switcher icon in the top navigation bar":
    '[data-test-id="app-switcher"], [data-test-id="app-switcher-toolbar"], [aria-label="App Switcher"]',
  "Agent OS in App Switcher list":
    '[data-test-id="app-switcher-automate"]',
  "any existing project card on the projects listing page":
    '[data-test-id="cs-stackcard"]:has-text("PriyalDocsAutomation"), [data-test-id="cs-stackcard"]',
  "Automations in top navigation panel":
    '[data-test-id="automate-nav-automations"], button[aria-label="Automations"], a:has-text("Automations")',
  "+ New Automation button on the Automations listing page":
    '[data-test-id="addNewAutomation"], .create-split-cta .openDropdownOnClick, button[data-test-id="newAutomationButtonHeader"], .create-split-cta button, button:has-text("+ New Automation"), button:has-text("New Automation")',
  "Automation Name field in the new automation dialog":
    'label:has-text("Automation Name"), [class*="field-label"]:has-text("Automation Name")',
  "Automation Description field":
    'label:has-text("Description"), [class*="field-label"]:has-text("Description")',
  "Create button in the new automation dialog":
    'button:text-is("Create"), button[data-test-id="createAutomation"]',
  "Choose an Action section":
    'span.stepper-title:has-text("Choose an Action"), .stepper-title:has-text("Choose an Action")',
  "Action Step card at the bottom of the automation":
    '.action-type-selector-box:has-text("Action Step"), .action-type-selector-box:has(.title:text-is("Action Step")), button:has-text("Action Step"), [role="option"]:has-text("Action Step")',
  "Configure Action Step in left navigation panel":
    'h5:has-text("Configure Action Step"), div:text-is("Configure Action Step"), [data-test-id="automate-nav-configure-action"], [data-test-id="automations-nav-configure-action"]',
  "Show Optional Fields toggle button":
    '*:has-text("Show Optional Fields"):has(input[type="checkbox"]), [class*="toggle"]:has-text("Optional Fields"), label:has-text("Show Optional Fields"), [class*="optional"]:has-text("Show Optional Fields")',
  "Test Action button":
    'button:has-text("Test Action"), button[data-test-id*="test-action"]',
  "Save and Exit button":
    'button:has-text("Save and Exit"), button[data-test-id*="save-exit"]',
};

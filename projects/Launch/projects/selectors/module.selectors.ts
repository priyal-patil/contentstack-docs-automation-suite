/**
 * Launch → Projects (Create / import).
 *
 * DOM captures (locator source of truth):
 * - data/dom/Launch/common/dashboard-launch.html — product tile `[data-test-id="cs-global-dashboard-product-tile-launch"]` on `#!/dashboard` (not `#!/stacks`; shared step `orgDashboard` opens this page — do not use Headless CMS tile here)
 * - data/dom/Launch/new-project-b.html — header `button[data-testid="new-project-button-header"]`
 * - data/dom/Launch/create-new-project-m.html — modal step 1, Git import card `[data-testid="project-type-card-GITPROVIDER"]`
 * - data/dom/Launch/create-new-project-m-git.html — GitHub card `div.providerCardWrapper.cardHover[data-testid=provider-card-0][data-test-id=launch-click-btn-primary-action-survey-select-github-project]`
 * - data/dom/Launch/create-new-project-file-upload-modal.html — file upload step: `[data-testid=project-type-card-FILEUPLOAD]`, `[data-testid=file-upload-input]`, `[data-testid=next-button]`
 * - data/dom/Launch/create-new-project-page.html — step 2 form (Repository, Git Branch, Build/Output, Env vars, Deploy)
 * - data/dom/Launch/bitbucket-cloud.html — Bitbucket provider card `data-testid="provider-card-bitbucket-cloud"` + `data-test-id="launch-click-btn-primary-action-survey-select-bitbucket-cloud-project"`
 * - data/launch/import-project-github-step2-ui-fields.json — full step-2 label list vs doc (detect launch-import-step2-ui-fields-vs-doc)
 * - data/launch/fixtures/gatsby-starter-default-master.zip — import-project-using-file-upload fixture
 * - data/dom/Launch/launch-projects-page.html — project cards `[data-testid^="project-settings-"]`
 * - data/dom/Launch/environments-page.html — env table, `[data-test-id="cs-table-body-row-0"]`, Actions `[data-test-id="cs-table-action-options"]`
 * - data/dom/Launch/envrionment-verticle-menu.html — row ⋮ menu → Settings (`[data-test-id="cs-vertical-action-tooltip-actions"]`)
 * - data/dom/Launch/env-settings-leftnav.html — Settings sidebar `ListRowV2#environments`
 * - data/dom/Launch/env-settings.html — tabs `[data-testid="deploy-hooks-tab"]`
 * - data/dom/Launch/env-deployments.html — Settings → Deployments: `[data-testid="deployments-tab"]`, Save `[data-testid="settings-save-button"]` ("Save Deployment Settings")
 * - data/dom/Launch/common/env-env-variable-tab.html — `[data-testid="environment-variables-tab"]`, Add Keys and Values, `[data-testid="env-variables-key"]`, `[data-testid="env-variables-value"]`, `[data-testid="add-variable-button"]`, `[data-testid="envvariables-save-button"]`
 * - data/dom/Launch/env-domain-tab.html — Settings → Domains: `[data-testid="domains-tab"]`, `[data-testid="add-domain-button"]` ("New Domain"), Domains table (`data/dom/Launch/env-settings-bar.html` tab strip)
 * - data/dom/Launch/env-header.html — project top bar Settings `[data-test-id="launch-nav-settings"]` (doc may say “left” primary nav; product uses this control in the project chrome)
 * - data/dom/Launch/settings-general-page.html — project Settings → General: `data-testid="git-provider-connection-section"`, **Git Connection** / **Connection Status**, `data-testid="repository-url"`
 * - data/dom/Launch/env-settings-leftnav.html — Settings sidebar Users `[data-test-id="cs-list-row"]#collaborators`
 * - data/dom/Launch/users-header.html — Users page `Invite User` `[data-testid="invite-users-button"]`
 * - data/dom/Launch/invite-user-m.html — Invite User modal `[data-test-id="cs-modal-title-invite-user"]`, email pill `[data-test-id="cs-pill"]`, Roles `[data-test-id="cs-select"]`, `invite-users-form-submit-button`
 * - data/dom/Launch/env-deployhook-page.html — empty state `[data-testid="empty-state-add-deploy-hook-button"]`, "New Deploy Hook"
 * - data/dom/Launch/common/env-disable-password-protection.html — `h3[title="Disable Password Protection"]`, `[data-test-id="cs-modal-title-disable-password-protection"]`, `[data-testid="disable-password-protection-button"]`
 * - data/dom/Launch/env-create-deployhook.html — modal `[data-test-id="cs-modal-title-create-deploy-hook"]`, `input[data-testid="name-input"]`, `[data-testid="save-deploy-hook-button"]`
 * - data/dom/Launch/environment-header.html — help `a[data-testid="launch-environments-help-button"]`
 * - data/dom/Launch/create-new-env-git-m.html / create-new-env-upload-m.html — Create New Environment modal `[data-testid="create-new-env"]`, Cancel `[data-testid="new-env-cancel"]`
 * - data/dom/Launch/env-general.html — General tab, Environment Name, Save Environment Details (environment settings tab strip matches project Settings → General content layout patterns)
 * Doc: https://www.contentstack.com/docs/developers/launch/repair-github-connection-for-projects — sidebar `#general` → Git Connection (`settings-general-page.html`); pick Launch project card with GitHub octocat in `.Avatar.launch-avatar` (path contains `17.3 25.576`)
 * Doc: https://www.contentstack.com/docs/developers/launch/repair-git-provider-connection-for-projects — Bitbucket / non-GitHub: project card with `.launch-avatar` but not GitHub octocat path (heuristic; needs a git-linked non-GitHub project in the list)
 *
 * Doc: https://www.contentstack.com/docs/developers/launch/import-project-using-github
 * Doc: https://www.contentstack.com/docs/developers/launch/import-a-project-using-bitbucket-cloud
 * Doc: https://www.contentstack.com/docs/developers/launch/import-project-using-file-upload
 * Doc: https://www.contentstack.com/docs/developers/launch/deploy-hooks
 * Doc: https://www.contentstack.com/docs/developers/launch/environments
 * Doc: https://www.contentstack.com/docs/developers/launch/environment-variables
 * Doc: https://www.contentstack.com/docs/developers/launch/auto-populate-environment-variables-from-a-linked-stack (stack integration strip: data/dom/Launch/env-environment-variable.html)
 * Doc: https://www.contentstack.com/docs/developers/launch/custom-domain
 * Doc: https://www.contentstack.com/docs/developers/launch/users
 * Doc: https://www.contentstack.com/docs/developers/launch/password-protection (see projects/Launch/security/)
 * Password Protection form labels: `password-protection-username-label`, `password-protection-password-label` (env-password-protection-tab.html)
 * Doc: https://www.contentstack.com/docs/developers/launch/disable-automatic-redeployment
 * Doc: https://www.contentstack.com/docs/developers/launch/log-targets
 * Log Targets — data/dom/Launch/settings/launch-settings-top.html (`launch-nav-app-settings`), set-up-log-target.html, verify-log-target-connection.html, log-targets-page.html, log-target-list.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  /** Single test id — comma-separated groups with `.first()` matched the wrong node (e.g. another "Launch" link) and blocked navigation. */
  "Launch dashboard entry (doc step)": '[data-test-id="cs-global-dashboard-product-tile-launch"]',
  "+ New Project (doc step)":
    '[data-testid="new-project-button-header"], [data-test-id="cs-button"][data-testid="new-project-button-header"], button:has-text("New Project"), button:has-text("+ New Project"), [aria-label*="New Project" i]',
  "Create New Project modal heading (doc step)":
    '[role="dialog"] [data-test-id="cs-modal-title"]:has-text("Create New Project"), h3[data-test-id="cs-modal-title"]:has-text("Create New Project"), [data-test-id="cs-modal-title"]:has-text("Create New Project")',
  "Import from a Git Repository (doc step)":
    '[data-testid="project-type-card-GITPROVIDER"], [data-test-id="launch-click-btn-primary-action-survey-select-gitprovider-project"], h5:has-text("Import from a Git Repository")',
  /** Create New Project step 1 — file upload path (create-new-project-m.html + file-upload modal). */
  "Upload a file (doc step)":
    '[role="dialog"] [data-testid="project-type-card-FILEUPLOAD"] h5[data-test-id="cs-heading-tag"], [role="dialog"] h5.projectTypeCardTitle:has-text("Upload a file")',
  "Upload a file project type card (doc step)":
    '[role="dialog"] [data-testid="project-type-card-FILEUPLOAD"], [role="dialog"] [data-test-id="launch-click-btn-primary-action-survey-select-fileupload-project"]',
  "Launch file upload browse hint (doc step)":
    '[role="dialog"] span.font-color-link:has-text("browse to upload"), [role="dialog"] label[for="fileUpload"] [data-test-id="cs-paragraph-tag"]',
  "Launch file upload Next (doc step)": '[role="dialog"] [data-testid="next-button"], [role="dialog"] button:has-text("Next")',
  "Connect Account (doc step)":
    'button:has-text("Connect Account"), [role="button"]:has-text("Connect Account")',
  /** GitHub card already linked — see create-new-project-m-git.html `data-testid="provider-connected"` */
  "GitHub Connected badge (doc step)":
    '[data-testid="provider-connected"], .connectedFlag:has-text("Connected"), [data-test-id="launch-click-btn-primary-action-survey-select-github-project"] .connectedFlag, div.providerCardWrapper:has-text("Connected")',
  "GitHub repository access Save (doc step)":
    'button:has-text("Save"), [type="submit"]:has-text("Save")',
  "GitHub Install and Authorize (doc step)":
    'button:has-text("Install & Authorize"), button:has-text("Install and Authorize")',
  /** GitHub provider card — live DOM: `providerCardWrapper cardHover` with both test ids (see create-new-project-m-git.html). */
  "GitHub card on Create New Project (doc step)":
    '[role="dialog"] div.providerCardWrapper.cardHover[data-test-id="launch-click-btn-primary-action-survey-select-github-project"][data-testid="provider-card-0"]',
  /** Create New Project step 1 — Bitbucket Cloud provider (bitbucket-cloud.html). */
  "Bitbucket Cloud repository host option (doc step)":
    '[role="dialog"] [data-testid="provider-card-bitbucket-cloud"] h5[data-test-id="cs-heading-tag"], [role="dialog"] [data-test-id="launch-click-btn-primary-action-survey-select-bitbucket-cloud-project"]',
  "Bitbucket Cloud provider card (doc step)":
    '[role="dialog"] [data-testid="provider-card-bitbucket-cloud"], [role="dialog"] [data-test-id="launch-click-btn-primary-action-survey-select-bitbucket-cloud-project"]',

  /** §8.i Repository (Mandatory) — doc: Select repository dropdown */
  "Repository field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Repository"), label.FieldLabel:has-text("Repository")',
  "Launch repository Select control (doc step)":
    'div[data-test-id="cs-select-async"]:has(label:has-text("Repository")) div.Select__control',
  /** import-project-using-github: first menu row after Repository/Branch/Framework control opens (handled in actionRules). */
  "Launch import Repository menu first option (doc step)": "div.Select__menu .Select__option",
  "Launch import Git Branch menu first option (doc step)": "div.Select__menu .Select__option",
  "Launch import Git Branch select first value from dropdown (doc step)": "div.Select__menu .Select__option",
  "Launch import Framework Preset menu first option (doc step)": "div.Select__menu .Select__option",
  /** §8.ii Git Branch (Mandatory) */
  "Git Branch field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Git Branch"), label.FieldLabel:has-text("Git Branch")',
  /** Label is sibling of cs-select-async inside Field (not inside the async wrapper — differs from Repository). */
  "Launch Git Branch Select control (doc step)":
    'div.Field:has(label:has-text("Git Branch")) div[data-test-id="cs-select-async"] div.Select__control:not(.Select__control--is-disabled), div[data-test-id="cs-field"]:has(label:has-text("Git Branch")) div[data-test-id="cs-select-async"] div.Select__control:not(.Select__control--is-disabled)',
  "Launch select first option (doc step)": '[role="listbox"] [role="option"]:first-child',

  /** §8.v Build and Output Settings (Mandatory) — section heading */
  "Build and Output Settings section (doc step)":
    '[data-test-id="cs-heading-tag"]:has-text("Build and Output Settings")',
  /** §8.v Framework Preset (Mandatory) */
  "Framework Preset field label (doc step)":
    'label[data-test-id="cs-field-label"]:has-text("Framework Preset")',
  "Launch Framework Preset Select control (doc step)":
    'div.Field:has(label:has-text("Framework Preset")) div.Select__control',
  "Build Command field label (doc step)": 'label[data-test-id="cs-field-label"]:has-text("Build Command")',
  "Output Directory field label (doc step)": 'label[data-test-id="cs-field-label"]:has-text("Output Directory")',
  /** Nuxt (and SSR) — Create New Project step 2; doc names Server Command. */
  "Server Command field label (doc step)": 'label[data-test-id="cs-field-label"]:has-text("Server Command")',

  /** §8.vi Environment Variables (Optional) */
  "Environment Variables section (doc step)":
    '[data-test-id="cs-heading-tag"]:has-text("Environment Variables")',
  "Key Value Edit tab (doc step)": '[data-testid="key-value-edit-tab"]',
  "Bulk Edit tab (doc step)": '[data-testid="bulk-edit-tab"]',
  "+ Add Environment Variable (doc step)": '[data-testid="add-variable-button"], button:has-text("Add Environment Variable")',

  "Deploy (doc step)": '[data-testid="deploy-button"], button:has-text("Deploy")',

  /** Deploy hooks — launch-projects-page.html, environments-page.html, env-settings.html, env-create-deployhook.html */
  "Launch Projects page title (doc step)": '[data-testid="launch-projects-title"]',
  /** repair-github: GitHub-linked project card (octocat SVG in `.Avatar.launch-avatar` on list card). */
  "Launch GitHub-backed Launch Projects card visible (doc step)":
    '[data-testid^="project-settings-"]:has(.Avatar.launch-avatar svg path[d*="17.3 25.576"])',
  "Launch GitHub-backed Launch Projects card (doc step)":
    '[data-testid^="project-settings-"]:has(.Avatar.launch-avatar svg path[d*="17.3 25.576"])',
  /**
   * repair-git-provider: non-GitHub git card — `.launch-avatar` present without GitHub octocat path.
   * May match other providers; ensure org has a Bitbucket-linked project and avoid ambiguous file-upload cards if UI differs.
   */
  "Launch non-GitHub git-backed Launch Projects card visible (doc step)":
    '[data-testid^="project-settings-"]:has(.Avatar.launch-avatar):not(:has(svg path[d*="17.3 25.576"]))',
  "Launch non-GitHub git-backed Launch Projects card (doc step)":
    '[data-testid^="project-settings-"]:has(.Avatar.launch-avatar):not(:has(svg path[d*="17.3 25.576"]))',
  /** users doc — project top bar (env-header.html). */
  "Launch project top navigation Settings visible (doc step)": '[data-test-id="launch-nav-settings"]',
  "Launch project top navigation Settings (doc step)": '[data-test-id="launch-nav-settings"]',
  /**
   * repair-github-connection-for-projects doc: “On the left-hand side primary navigation, click the Settings icon.”
   * Locator: project chrome `launch-nav-settings` (env-header.html); placement may differ from doc — verification uses Left Navigation when doc states it.
   */
  "Launch left-hand primary navigation Settings icon visible (doc step)": '[data-test-id="launch-nav-settings"]',
  "Launch left-hand primary navigation Settings icon (doc step)": '[data-test-id="launch-nav-settings"]',
  /** users doc — Settings sidebar Users row (env-settings-leftnav.html). */
  "Launch Settings left navigation Users row visible (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#collaborators, .PageLayout__leftSidebar [data-test-id="cs-list-row"]#collaborators',
  "Launch Settings left navigation Users row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#collaborators, .PageLayout__leftSidebar [data-test-id="cs-list-row"]#collaborators',
  /** repair-github doc — Settings sidebar General row (env-settings-leftnav.html `#general`). */
  "Launch Settings left navigation General row visible (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#general, .PageLayout__leftSidebar [data-test-id="cs-list-row"]#general',
  "Launch Settings left navigation General row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#general, .PageLayout__leftSidebar [data-test-id="cs-list-row"]#general',
  /** Stack Integration — env-settings-leftnav.html `#stackIntegration`. */
  "Launch Settings left navigation Stack Integration row visible (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#stackIntegration, .PageLayout__leftSidebar [data-test-id="cs-list-row"]#stackIntegration',
  "Launch Settings left navigation Stack Integration row (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-list-row"]#stackIntegration, .PageLayout__leftSidebar [data-test-id="cs-list-row"]#stackIntegration',
  "Launch Stack Integration Connect Stack button visible (doc step)":
    'button:has-text("Connect Stack"), [data-test-id="cs-button"]:has-text("Connect Stack")',
  "Launch Stack Integration Connect Stack button (doc step)":
    'button:has-text("Connect Stack"), [data-test-id="cs-button"]:has-text("Connect Stack")',
  "Launch environment settings Sync Stack Variables button visible (doc step)":
    'button:has-text("Sync Stack Variables"), [data-test-id="cs-button"]:has-text("Sync Stack Variables")',
  /** Project Settings → General → Git Connection (settings-general-page.html `git-provider-connection-section`). */
  "Launch project settings Git Connection section heading (doc step)":
    '[data-testid="git-provider-connection-section"], [data-testid="git-provider-connection-section"] label, label.FieldLabel:has-text("Git Connection"), [data-test-id="cs-heading-tag"]:has-text("Git Connection"), h2:has-text("Git Connection"), h3:has-text("Git Connection")',
  /** Doc step 4 — only when Git connection is in error state. */
  "Launch project settings Repair Connection button (doc step)":
    'button:has-text("Repair Connection"), [data-test-id="cs-button"]:has-text("Repair Connection")',
  "Launch project settings Repair Connection button visible (doc step)":
    'button:has-text("Repair Connection"), [data-test-id="cs-button"]:has-text("Repair Connection")',
  /** users doc — Users list header (users-header.html). */
  "Launch Users page title (doc step)": '[data-test-id="cs-page-title"]:has-text("Users")',
  "Launch Users page Invite User button visible (doc step)": '[data-testid="invite-users-button"]',
  "Launch Users page Invite User button (doc step)": '[data-testid="invite-users-button"]',
  /** invite-user-m.html — modal title + primary Invite (disabled until email + role). */
  "Launch Invite User modal title (doc step)": '[data-test-id="cs-modal-title-invite-user"]',
  "Launch Invite User modal Invite button ready (doc step)": '[data-testid="cs-modal"] [data-testid="invite-users-form-submit-button"]',
  "Launch Invite User modal Invite button (doc step)":
    '[data-testid="cs-modal"][role="dialog"] [data-testid="invite-users-form-submit-button"], [role="dialog"] [data-testid="invite-users-form-submit-button"]',
  /** remove-user doc — Settings sidebar header (env-settings-leftnav.html); shown after entering project settings. */
  "Launch Settings left sidebar Settings section header visible (doc step)":
    '[data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-section-header"], [data-test-id="cs-page-layout-leftSidebar"] [data-testid="cs-section-header"]',
  /** users-list.html — Actions column (same table pattern as environments). */
  "Launch Users table Actions column header for remove-user doc (doc step)":
    '[data-test-id="cs-table-head-text--4"]:has-text("Actions"), [data-test-id^="cs-table-row-action-column-text--"]:has-text("Actions")',
  /** remove-user-m.html */
  "Launch Remove User modal title (doc step)":
    '[role="dialog"][data-testid="cs-modal"] h3[title="Remove User"], [data-test-id="cs-modal-title-remove-user"], [role="dialog"] h3:has-text("Remove User")',
  "Launch Remove User modal Yes Remove button (doc step)":
    '[data-testid="cs-modal"][role="dialog"] [data-testid="remove-button"], [role="dialog"] [data-testid="remove-button"]',
  "Launch Environments page title (doc step)": '[data-test-id="cs-page-title"]:has-text("Environments")',
  "Launch Environments table Actions column header (doc step)":
    '[data-test-id^="cs-table-head-text--"]:has-text("Actions"), [data-test-id^="cs-table-row-action-column-text--"]:has-text("Actions")',
  "Launch Deploy Hooks tab label (doc step)": '[data-testid="deploy-hooks-tab"]',
  /** env-deployments.html — Settings → Deployments tab (disable automatic redeployment doc). */
  "Launch environment settings Deployments tab label (doc step)": '[data-testid="deployments-tab"]',
  "Launch environment settings Deployments tab (doc step)": '[data-testid="deployments-tab"]',
  /** env-general.html — Settings → General tab + Environment Name (setup production doc). */
  "Launch environment settings General tab label (doc step)": '[data-testid="general-tab"]',
  "Launch environment settings General tab (doc step)": '[data-testid="general-tab"]',
  "Launch environment settings Environment Name field label (doc step)": 'label[data-testid="name-field"]',
  /** env-env-variable-tab.html — Settings → Environment Variables tab (doc). */
  "Launch environment settings Environment Variables tab label (doc step)": '[data-testid="environment-variables-tab"]',
  /** env-domain-tab.html — Settings → Domains tab (custom-domain doc). */
  "Launch environment settings Domains tab label (doc step)": '[data-testid="domains-tab"]',
  "Launch environment settings Domains tab (doc step)": '[data-testid="domains-tab"]',
  "Launch environment settings New Domain button (doc step)": '[data-testid="add-domain-button"]',
  "Launch environment settings New Domain button visible (doc step)": '[data-testid="add-domain-button"]',
  /** Create Custom Domain modal — title + footer (DOM may use cs-modal-title). */
  "Create Custom Domain modal title (doc step)":
    '[role="dialog"] [data-test-id="cs-modal-title"]:has-text("Custom Domain"), [role="dialog"] h3:has-text("Create Custom Domain"), [role="dialog"] [data-test-id="cs-modal-title"]',
  "Launch Create Custom Domain primary button visible (doc step)":
    '[role="dialog"] button:has-text("Create Custom Domain"), [role="dialog"] [data-testid="create-custom-domain-button"]',
  "Launch Create Custom Domain modal submit (doc step)":
    '[role="dialog"] button:has-text("Create Custom Domain"), [role="dialog"] [data-testid="create-custom-domain-button"]',
  "Launch environment settings Add Keys and Values heading (doc step)":
    '[data-test-id="cs-paragraph-tag"]:has-text("Add Keys and Values"), p.font-weight-semi-bold:has-text("Add Keys and Values")',
  "Launch environment settings Add Environment Variable button visible (doc step)":
    '[data-testid="add-variable-button"]',
  "Launch environment settings Save Environment Variables button visible (doc step)": '[data-testid="envvariables-save-button"]',
  "Create Deploy Hook modal title (doc step)":
    '[data-test-id="cs-modal-title-create-deploy-hook"], [role="dialog"] h3[title="Create Deploy Hook"], [role="dialog"] h3:has-text("Create Deploy Hook")',
  "Launch Create Deploy Hook Name field label (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-deploy-hook"]) label[data-test-id="cs-field-label"]:has-text("Name")',
  /** env-create-deployhook.html — footer primary `data-testid="save-deploy-hook-button"` (label text Create Deploy Hook). */
  "Launch Create Deploy Hook modal Create Deploy Hook button (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title-create-deploy-hook"]) [data-testid="save-deploy-hook-button"]',
  /** environments-page.html / environment-header.html */
  "Launch + New Environment button visible (doc step)": '[data-testid="create-new-env"]',
  /** create-new-env-git-m.html, create-new-env-upload-m.html */
  "Launch Create New Environment modal title (doc step)": '[data-test-id="cs-modal-title-create-new-environment"]',
  /** password-protection doc — Username / Password field labels before enter (env-password-protection-tab.html). */
  "Launch Password Protection Username field label visible (doc step)": '[data-testid="password-protection-username-label"]',
  "Launch Password Protection Password field label visible (doc step)": '[data-testid="password-protection-password-label"]',
  /** env-disable-password-protection.html — disable confirm modal title. */
  "Launch Disable Password Protection modal title (doc step)":
    '[data-test-id="cs-modal-title-disable-password-protection"], [role="dialog"] h3[title="Disable Password Protection"]',

  /** log-targets doc — org Launch projects top bar (launch-settings-top.html). */
  "Launch org app Settings top bar visible (doc step)": '[data-test-id="launch-nav-app-settings"]',
  /** log-targets-page.html empty state primary CTA. */
  "Launch Log Targets Set up Log Target button visible (doc step)": '[data-testid="new-log-target-button"]',
  /** Before Edit (doc): confirm org Log Targets route + list table (log-target-list.html). */
  "Launch Log Targets page visible before Edit row actions (doc step)": '[data-test-id="cs-table"]',
  /** set-up-log-target.html */
  "Launch Set up Log Target modal title (doc step)": '[data-test-id="cs-modal-title-set-up-log-target"], h3[data-test-id="cs-modal-title-set-up-log-target"]',
  /** verify-log-target-connection.html */
  "Launch Verify Log Target Connection modal title (doc step)":
    '[role="dialog"] h3:has-text("Verify Log Target Connection"), [role="dialog"] [data-test-id="cs-modal-title"]:has-text("Verify Log Target Connection")',
  /** log-target-list.html — after save. */
  "Launch Log Targets table Title column header (doc step)":
    '[data-test-id="cs-table-head-text--0"]:has-text("Title"), [data-test-id^="cs-table-head-text--"]:has-text("Title")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /** Create New Environment modal (file-upload project) — create-new-env-upload-m.html */
  "Launch Create New Environment file upload zip input (doc step)":
    '[role="dialog"] input[data-testid="file-upload-input"], [role="dialog"] input#fileUpload[accept=".zip"]',
  "Launch file upload zip input (doc step)": '[data-testid="file-upload-input"], input#fileUpload[accept=".zip"]',
  "Launch Project Name (doc step)": 'input[data-testid="project-name-input"]',
  "Launch Environment Name (doc step)": 'input[data-testid="env-name-input"]',
  "Launch Build Command input (doc step)": 'input[data-testid="build-cmd-input"]',
  "Launch Output Directory input (doc step)": 'input[data-testid="op-dir-input"]',
  /** Create New Project step 2 — same test ids as env settings; scope to Create New Project dialog (importProjectStep2). */
  "Launch Create New Project env variables key input (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title"]:has-text("Create New Project")) [data-testid="env-variables-key"]',
  "Launch Create New Project env variables value input (doc step)":
    '[role="dialog"]:has([data-test-id="cs-modal-title"]:has-text("Create New Project")) [data-testid="env-variables-value"]',
  /** environment-variables doc — key/value row (env-env-variable-tab.html). */
  "Launch environment settings env variables key input (doc step)": '[data-testid="env-variables-key"]',
  "Launch environment settings env variables value input (doc step)": '[data-testid="env-variables-value"]',
  /** custom-domain doc — modal Domain Name field (label + input; test ids vary by build). */
  "Launch Create Custom Domain Domain Name input (doc step)":
    '[role="dialog"] label:has-text("Domain Name") ~ input, [role="dialog"] input[name*="domain" i], [role="dialog"] input[aria-label*="Domain Name" i]',
  /** invite-user-m.html — optional Message field. */
  "Launch Invite User modal Message field (doc step)": '[data-testid="invitation-message-input"]',
  /** set-up-log-target.html — inside Set up Log Target modal. */
  "Launch Log Target Name input (doc step)": '[role="dialog"]:has([data-test-id="cs-modal-title-set-up-log-target"]) [data-testid="name-input"]',
  "Launch Log Target Endpoint URL input (doc step)": '[role="dialog"]:has([data-test-id="cs-modal-title-set-up-log-target"]) [data-testid="endpoint-input"]',
  "Launch Log Target header key input (doc step)": '[role="dialog"]:has([data-test-id="cs-modal-title-set-up-log-target"]) [data-testid="header-key-input-0"]',
  "Launch Log Target header value input (doc step)": '[role="dialog"]:has([data-test-id="cs-modal-title-set-up-log-target"]) [data-testid="header-value-input-0"]',
};

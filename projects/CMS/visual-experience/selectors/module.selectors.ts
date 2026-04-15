/**
 * Visual Experience / Visual Builder — DOM refs under data/dom/CMS/visual-experience/
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Headless CMS":
    '[data-test-id="cs-cms-button"], button:has-text("Headless CMS"), [aria-label*="cms" i]',
  "Any Stack Card (doc step)":
    '[data-test-id*="stack-card" i], [data-test-id*="cs-stack-card"], [role="button"]:has-text("Stack"), [role="link"]:has-text("Stack"), a[href*="/#!/stack/"]',
  "Entries (doc step)":
    'a[href*="/#!/stack/"][href*="/entries"], button[data-test-id="cms-nav-entries"], [data-test-id="cms-nav-entries"], button:has-text("Entries"), a:has-text("Entries")',
  "Entries page (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Entries"), .PageTitle:has-text("Entries")',
  "vertical ellipsis (doc step)":
    '[data-test-id="cs-table-body-row-0"] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Preview (doc step)":
    '[data-test-id="cs-entry-action-preview"], [data-test-id="cs-entries-action-preview"], [role="menu"] [role="menuitem"]:has-text("Preview"), li:has-text("Preview")',
  "Visual Experience top nav (doc step)":
    '[data-test-id="cms-nav-visual-experience"], a[href*="/visual-editor"] [data-test-id="cms-nav-visual-experience"]',
  "Visual Experience page title (doc step)":
    '[data-test-id="cs-page-title"]:has-text("Visual Experience"), .page-header-title:has-text("Visual Experience"), [data-test-id="cs-page-header"] .page-header-title:has-text("Visual Experience")',
  "First Entry row (doc step)":
    '[data-test-id^="cs-table-body-row-0"], [role="row"][data-test-id^="cs-table-body-row-"]',
  "Version icon (doc step)":
    '[data-test-id="cs-entry-version-header-icon"]',
  "Second version timeline row (doc step)":
    'xpath=(//*[@data-test-id="cs-version-timeline-version"])[2]',
  "Live Preview icon (doc step)":
    '[data-test-id="cs-entry-edit-tab-live-preview"], #rhs-live-preview-icon',
  "Live Preview window (doc step)":
    '.lp-browser-container, [data-testid="live-preview-browser-url-input-form"], [data-test-id="live-preview-browser-toggle-viewport-btn"]',
  /** After Preview (entries menu or timeline): Environment/Locale / date / release — see preview-entry doc modal scenarios. */
  "Preview setup dialog after Preview action (doc step)":
    '[role="dialog"]:has-text("Environment"), [role="dialog"]:has-text("Locale"), [role="dialog"]:has-text("Preview"), .ReactModal__Content:has-text("Environment"), [data-testid*="preview-modal" i], [data-testid*="live-preview" i][role="dialog"]',

  // --- preview-content-across-a-timeline (Timeline Visual Experience; capture DOM when available) ---
  "Timeline preview default view (doc step)":
    '[data-testid*="timeline-preview" i], [data-testid*="cs-vb--timeline" i], [class*="timeline-preview"], [class*="visual-timeline"], [data-testid*="publish-timeline" i]',
  "Timeline bar date control (doc step)":
    '[data-testid*="timeline-bar" i] button, [data-testid*="timeline-date" i], [data-testid*="cs-vb--timeline" i] [role="button"], .timeline-bar button, [class*="TimelineBar"] button',
  "Timeline environment selector (doc step)":
    '[data-testid*="preview-environment" i], [data-testid*="timeline" i][data-testid*="environment" i], .visual-timeline button:has-text("Environment"), [aria-label*="Environment" i]',
  "Timeline locale selector (doc step)":
    '[data-testid*="preview-locale" i], [data-testid*="timeline" i][data-testid*="locale" i], [data-testid*="language-select" i], .visual-timeline button:has-text("English"), [aria-label*="Locale" i]',
  "Add Preview button (doc step)":
    'button:has-text("Add Preview"), [data-testid*="add-preview" i], [aria-label*="Add Preview" i]',
  "Timeline add preview dropdown (doc step)":
    '[role="menu"]:has-text("Preview"), [role="listbox"], [data-testid*="add-preview" i] [role="menu"], .timeline-dropdown',
  "Scheduled publish or release menu option (doc step)":
    '[role="menuitem"]:has-text("Publish"), [role="menuitem"]:has-text("Release"), [role="option"]:has-text("scheduled" i), li:has-text("scheduled publish" i)',
  "Select Custom Date option (doc step)":
    '[role="menuitem"]:has-text("Custom Date"), [role="option"]:has-text("Custom Date"), [role="menuitem"]:has-text("Select Custom Date"), button:has-text("Custom Date")',
  "URL Navigation toggle (doc step)":
    '[data-testid*="url-navigation" i] input, [data-test-id="cs-toggle-switch"]:has-text("URL Navigation") input, .Label--color--secondary:has-text("URL Navigation") ~ label input, [data-testid*="url-navigation" i] .toggle-switch',
  "URL Navigation mode description (doc step)":
    '[data-testid*="url-navigation" i], .Label--color--secondary:has-text("URL Navigation"), [class*="url-navigation"]',
  "Timeline date Preview Details icon (doc step)":
    '[data-testid*="preview-details" i], [aria-label*="Preview Details" i], button:has-text("Preview Details")',
  "Publish Timeline left panel (doc step)":
    '[data-testid*="publish-timeline" i], [class*="publish-timeline"], aside:has-text("Publish Timeline"), [data-testid*="cs-vb--publish-timeline" i]',
  "Scheduled publish detail line (doc step)":
    '[data-testid*="scheduled-publish" i], [class*="preview-details"]:has-text("scheduled" i), [data-testid*="timeline-detail" i]',
  "Release items list region (doc step)":
    '[data-testid*="release-items" i], [class*="release-detail"]:has-text("Release"), [data-testid*="preview-details" i]:has-text("Release")',
  "Timeline entries vertical ellipsis (doc step)":
    '[data-testid*="publish-timeline" i] [data-test-id="cs-table-action-options"], [data-test-id="cs-table-action-options"]',
  "Compare Entry menu item (doc step)":
    'li:has-text("Compare Entry"), [role="menuitem"]:has-text("Compare Entry")',
  "Open link in new tab control (doc step)":
    'button:has-text("Open link in new tab"), [aria-label*="Open link in new tab" i], a:has-text("Open link in new tab")',
  "Compare Website icon (doc step)":
    '[data-testid*="compare-website" i], [aria-label*="Compare Website" i], button:has-text("Compare Website")',
  "Highlight Differences option (doc step)":
    'button:has-text("Highlight Differences"), [data-testid*="highlight-differences" i], [aria-label*="Highlight Differences" i], label:has-text("Highlight Differences")',
  "Viewport Responsive button (doc step)":
    'button:has-text("Responsive"), [data-testid*="viewport" i]:has-text("Responsive"), [aria-label*="Responsive" i]',
  "Website orientation toggle (doc step)":
    '[data-testid*="orientation" i], button[aria-label*="Orientation" i], [data-testid*="toggle-orientation" i]',
  "Remove Preview icon (doc step)":
    '[data-testid*="remove-preview" i], [aria-label*="Remove Preview" i], button:has-text("Remove Preview")',
  "Release context Preview button (doc step)":
    '[data-testid*="release-preview" i], [role="dialog"] button:has-text("Preview"), [class*="release"] button:has-text("Preview")',

  // --- audience-preview (editor-audiences-page.html; doc: timeline/audience-preview)
  /** Doc: In the right sidebar, click the Audiences icon. */
  "Audiences icon in right sidebar (doc step)":
    '[data-testid="cs-vb--sidebar-tab-audiences"], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Audiences"], button[aria-label="Audiences"]',
  /** Doc: Select A/B Testing or Segmented Experience (tab headers; UI may show "A/B Test"). */
  "A/B Testing tab (doc step)": '[data-test-id="cs-vb--audience-ab-tab"]',
  "Segmented Experience tab (doc step)": '[data-test-id="cs-vb--audience-segment-tab"]',
  /** Doc: choose your experience — audience conditions (accordion / experience title). */
  "Experience audience conditions block (doc step)":
    '[data-test-id="cs-vb--audiences-accordion-data"], [data-testid^="cs-vb--audience-experience-title" i], h3.experience__title',
  /** Doc: From the Select Audiences dropdown… */
  "Select Audiences dropdown (doc step)":
    '[data-test-id="cs-vb--audience-select"], [data-test-id="cs-vb--audience-select"] .Select__control, [data-test-id="cs-vb--audiences-select-label"]',
  /** Doc: active variant next to experience title (status dot / title row). */
  "Active variant beside experience row (doc step)":
    '[data-testid="cs-vb--audiences-status-dot"], .accordion__title__container:has(.experience__title)',
  /** Legacy aliases */
  "Audiences sidebar control (doc step)":
    '[data-testid="cs-vb--sidebar-tab-audiences"], [data-testid="cs-vb--audiences-sidebar"], button[aria-label="Audiences"]',
  "Audiences sidebar panel (doc step)":
    '[data-testid*="audiences-sidebar" i], .audiences-sidebar, [class*="AudienceSidebar"]',
  "Select audiences trigger (doc step)":
    '[data-test-id="cs-vb--audience-select"] input, [data-test-id="cs-vb--audience-select"] .Select__control, [data-testid*="select-audience" i], [data-testid="cs-vb--select-audiences"]',

  // --- navigating-your-website-in-visual-editor (capsule-tabs.html, editor-page.html, editor-sidebar.html, editor-sidebar-rail.html) ---
  /** Doc: bottom pill menu — click Editor. */
  "Visual editor bottom pill Editor tab (doc step)":
    '[data-test-id="cs-tabs-item"]:has-text("Editor"), .capsule-tabs [data-test-id="cs-tabs-item"]:has-text("Editor"), [data-test-id="cs-tabs"] [data-test-id="cs-tabs-item"]:has-text("Editor")',
  "Visual editor capsule tabs (doc step)":
    '[data-test-id="cs-tabs-item"], .capsule-tabs [data-test-id="cs-tabs-item"], [data-testid*="capsule" i], [class*="CapsuleTab"]',
  /** Doc: URL Bar — web pages list / structure, switch pages. */
  "Visual editor URL bar (doc step)":
    '[data-testid="live-preview-browser-url-input-form"], [data-testid*="browser-url" i], [data-testid*="url-bar" i], [data-testid*="cs-vb--url" i], input[placeholder*="URL" i], [class*="browser-url"]',
  /** Doc: Canvas — main workspace / preview / visual edits. */
  "Visual editor canvas workspace (doc step)":
    '.visual-builder iframe, [data-testid*="visual-builder" i] iframe, [data-testid="cs-vb--editor-frame"], .visual-builder__canvas, [class*="visual-builder"] iframe',
  /** Doc: Toolbar — contextual tools over components (when visible). */
  "Visual editor contextual toolbar (doc step)":
    '[data-testid*="field-toolbar" i], [data-testid*="vb-toolbar" i], [class*="component-toolbar"], [class*="visual-builder"] [class*="toolbar"]',
  /** Doc: Right panel rail — container for Status, Form, Drafts, etc. */
  "Editor sidebar rail container (doc step)":
    '[data-testid="cs-vb--editor-sidebar-rail"], nav[aria-label*="Visual editor panels" i], [data-testid="cs-vb--editor-sidebar-rail"]',
  "Visual editor page frame (doc step)":
    '.visual-builder iframe, [data-testid*="visual-builder" i] iframe, [data-testid="cs-vb--editor-frame"], .editor-page',
  "Visual editor right sidebar (doc step)":
    '[data-testid*="editor-sidebar" i], [data-testid="cs-vb--editor-sidebar"], .editor-sidebar, aside[class*="Sidebar"]:has([data-testid*="vb" i])',
  /** Doc: Publish Panel — entries updated in session, publish controls (header / panel region). */
  "Visual editor publish panel region (doc step)":
    '[data-testid="cs-vb--publish-button-wrapper"], [data-testid*="publish-panel" i], [data-testid="header__publish-button"], .visual-builder__publish-btn',

  // --- create-new-page (create-new-page-modal.html, create-page-contenttype-menu.html, components-*.html, save-changes-modal.html) ---
  "Add new page button (doc step)":
    '[data-testid="add-new-page-button"], button.page__nav--add-new-page-btn, [data-testid="cs-vb--add-new-page-link-icon"]',
  /** Doc: URL bar “+” to add a page (same control as add-new-page in URL bar region). */
  "URL bar add new page plus icon (doc step)":
    '[data-testid="add-new-page-button"], button.page__nav--add-new-page-btn, [data-testid="cs-vb--add-new-page-link-icon"], [data-testid="live-preview-browser-url-input-form"] ~ * [data-testid="add-new-page-button"]',
  "Create new page modal (doc step)":
    '[role="dialog"]:has-text("Create"), [data-testid*="create-new-page" i], .ReactModal__Content:has-text("New Page")',
  /** Doc: Select Content Type — open the content type control in the modal. */
  "Create new page content type select control (doc step)":
    '[role="dialog"] [data-testid*="create-page" i] .Select__control, [role="dialog"] [data-testid*="content-type" i] .Select__control, [role="dialog"] [data-testid*="content-type" i] button, [role="dialog"] label:has-text("Content Type") ~ div .Select__control',
  /** Doc: choose Page (or stack default page CT) from the menu. */
  "Create new page Page content type option (doc step)":
    '[data-testid="cs-vb--create-page-content-type-menu"] [role="menuitem"]:has-text("Page"), [role="menu"]:has-text("Page") [role="menuitem"]:has-text("Page"), [role="menuitem"]:has-text("Page")',
  "Create new page Create button (doc step)":
    '[role="dialog"]:has-text("Create New Page") button:has-text("Create"), [role="dialog"] button.Button--primary:has-text("Create")',
  /** Modal URL input — URL generated from title (doc); alias avoids strict-verify “field” naming. */
  "Create new page URL input visible (doc step)":
    '[role="dialog"]:has-text("Create New Page") input[name*="url" i], [role="dialog"]:has-text("Create") input[name*="url" i], [role="dialog"] input[placeholder*="URL" i]',
  "Create page content type menu (doc step)":
    '[data-testid*="content-type" i][role="menu"], [role="dialog"] [data-testid*="content-type" i], [role="menuitem"]:has-text("Page")',
  "Components button visual builder (doc step)":
    '[data-testid*="components" i]button, button:has-text("Components"), [data-testid="cs-vb--components-button"]',
  "Components menu visual builder (doc step)":
    '[role="menu"]:has-text("Component"), [data-testid*="components-menu" i]',
  "Components side panel visual builder (doc step)":
    '[data-testid*="components-side" i], .components-sidepanel, aside:has-text("Components")',
  /** Doc: e.g. Hero Banner — pick from Components menu. */
  "Components menu Hero Banner component (doc step)":
    '[data-testid="cs-vb--components-menu"] [role="menuitem"]:has-text("Hero Banner"), [role="menu"] [role="menuitem"]:has-text("Hero Banner")',
  "Save changes header button (doc step)":
    '[data-testid="header__save-button"], button.save-btn[aria-label="Save Changes"], [data-testid="cs-vb--header-wrapper-v2-save-icon"]',
  "Save changes modal (doc step)":
    '[role="dialog"]:has-text("Save"), [data-testid*="save-changes" i], .save-changes-modal',
  /** Doc: Save Changes modal — confirm with Save again. */
  "Save changes modal Confirm Save button (doc step)":
    '.save-changes-modal button:has-text("Save"), [role="dialog"]:has-text("Save Changes") button:has-text("Save"), [data-testid*="save-changes" i] button:has-text("Save")',

  // --- edit-page (editor-sidebar.html, form-sidebar-page.html, editor-page.html) ---
  /** Doc: hover a field/component to view field type and content type. */
  "Visual editor canvas field hover target (doc step)":
    '[data-testid*="vb--outline" i], [data-testid*="field-highlight" i], [data-testid*="component-outline" i], [class*="component-outline"], [data-testid*="canvas-block" i]',
  /** Doc: click a component to open the contextual toolbar (inline edit). */
  "Visual editor canvas first component block (doc step)":
    '[data-testid*="canvas-block" i], [data-testid*="vb--block" i], [data-testid*="outline" i] button, .visual-builder [data-testid*="block" i]',
  /** Doc: “+” on the canvas to add a new component instance. */
  "Visual editor canvas add component plus icon (doc step)":
    '[data-testid*="add-component" i], [data-testid*="add-block" i], [data-testid*="canvas-add" i], button[aria-label*="Add component" i], button[aria-label*="Add block" i]',
  /** Doc: pick one of the available components from the list. */
  "Components menu first component option (doc step)":
    '[data-testid="cs-vb--components-menu"] [role="menuitem"]:first-child, [data-testid="cs-vb--components-menu"] li:first-child, [data-testid="cs-vb--components-menu"] button:first-child',
  "Visual editor form sidebar (doc step)":
    '[data-testid*="form-sidebar" i], [data-testid="cs-vb--form-sidebar"], .form-sidebar-page',
  "Entry actions menu in visual editor (doc step)":
    '[data-test-id="cs-dropdown"].Dropdown__ellipses, [data-test-id="cs-dropdown"] .Dropdown__header--ellipses, button:has(svg[name="SeeMore"]), button:has(svg[name="HorizontalEllipsis"]), [data-testid*="horizontal" i][data-testid*="ellipsis" i], [data-testid="cs-vb--page-menu-trigger"]',
  "Import entry menu item in visual editor (doc step)":
    '[data-test-id="cs-dropdown-elements"] .option-item:has(svg[name="Import"]), [data-test-id="cs-dropdown-elements"]:has-text("Import"), [role="menuitem"]:has-text("Import"), li:has-text("Import"), [data-testid*="import" i]',
  "Export entry menu item in visual editor (doc step)":
    '[data-test-id="cs-dropdown-elements"] .option-item:has(svg[name="Export"]), [data-test-id="cs-dropdown-elements"]:has-text("Export"), [role="menuitem"]:has-text("Export"), li:has-text("Export"), [data-testid*="export" i]',
  "Import entry modal in visual editor (doc step)":
    '[data-test-id="cs-modal-title-import-entry"], [data-test-id="cs-import-file-choose"], [role="dialog"]:has-text("Import"), [data-testid*="import" i][role="dialog"], .ReactModal__Content:has-text("Import")',
  "Version dropdown in visual editor (doc step)":
    '[data-testid*="version" i] .Dropdown__header, [aria-label*="Version" i], button:has-text("Version"), [data-test-id*="version" i]',
  "Version option row in visual editor (doc step)":
    '[role="menu"] [role="menuitem"], [role="listbox"] [role="option"], [data-testid*="version" i][role="menuitem"]',
  "Version rename pencil icon in visual editor (doc step)":
    'button[aria-label*="Edit" i], button[aria-label*="Rename" i], [data-testid*="pencil" i], [name*="Edit" i]',
  "Version rename Save button in visual editor (doc step)":
    '[role="dialog"] button:has-text("Save"), [data-testid*="save" i]:has-text("Save"), button:has-text("Save")',

  // --- publish-page (form-sidebar-page.html, publish-entries-env.html, publish-entries-modal.html, publish-menu.html) ---
  "Publish changes header button (doc step)":
    '[data-testid="cs-vb--publish-button-wrapper"] [data-testid="header__publish-button"], [data-testid="header__publish-button"], [data-testid="cs-vb--header-wrapper-v2-publish-icon"]',
  "Publish menu dropdown toggle (doc step)":
    '[data-testid="cs-vb--publish-button-wrapper"] button.contextual-dropdown-wrapper, [data-testid="cs-vb--publish-button-wrapper"] .chevron-toggle-icon',
  "Publish entries environment section (doc step)":
    '[data-testid*="publish" i][data-testid*="environment" i], [data-test-id*="publish-select-environment" i]',
  "Publish entries modal (doc step)":
    '[role="dialog"]:has-text("Publish"), [data-testid*="publish-entries" i]',
  "Publish menu panel (doc step)":
    '[data-testid*="publish-menu" i], [role="menu"]:has-text("Publish")',

  // --- change-workflow (horizontal-ellipses*.html, change-workflow-details.html) ---
  "Visual builder horizontal ellipses (doc step)":
    'button:has(svg[name="HorizontalEllipsis"]), [data-testid*="horizontal" i][data-testid*="ellipsis" i], [data-testid="cs-vb--page-menu-trigger"]',
  "Share menu item in visual builder (doc step)":
    '[role="menuitem"]:has-text("Share"), li:has-text("Share"), [data-testid*="share" i][role="menuitem"]',
  "Share Preview modal (doc step)":
    '[role="dialog"]:has-text("Share Preview"), [data-test-id*="share-preview" i], .ReactModal__Content:has-text("Share Preview")',
  "Share Preview invite users field (doc step)":
    '[role="dialog"] input[placeholder*="Invite" i], [role="dialog"] [data-testid*="invite" i] input, [role="dialog"] input[type="email"]',
  "Share Preview add note field (doc step)":
    '[role="dialog"] textarea[placeholder*="Note" i], [role="dialog"] [data-testid*="note" i] textarea',
  "Share Preview modal Share button (doc step)":
    '[role="dialog"] button:has-text("Share"), [data-testid*="share" i] button:has-text("Share"), .ReactModal__Content__footer button:has-text("Share")',
  "Change workflow menu item (doc step)":
    'li:has-text("Change Workflow"), [role="menuitem"]:has-text("Change Workflow"), [data-testid*="change-workflow" i]',
  "Change workflow details panel (doc step)":
    '[data-testid*="change-workflow" i], [role="dialog"]:has-text("Workflow"), .change-workflow-details',

  // --- add-to-release (add-to-release-modal*.html, select-release-modal.html) ---
  "Add to Release menu item VE (doc step)":
    '[data-test-id="cs-dropdown-elements"] .option-item:has(svg[name="AddToRelease"]), [data-test-id="cs-dropdown-elements"]:has-text("Add to Release"), [data-test-id="cs-entry-edit-see-more-add-to-release"], [data-testid*="add-to-release" i], li:has-text("Add to Release"), [role="menuitem"]:has-text("Add to Release")',
  "Add to Release modal (doc step)":
    '[data-test-id="cs-modal-title-add-to-release"], [role="dialog"]:has-text("Add to Release"), [data-testid*="add-to-release" i][role="dialog"], .add-to-release-modal',
  "Add to Release select release control (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-search-field"], [data-test-id="cs-entry-bulk-release-select-release"], .bulk-release--select',
  "Add to Release locale checkbox (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-select-lang-element"] input[type="checkbox"], [data-test-id="cs-entry-bulk-add-to-release-select-all-lang"]',
  "Add to Release Add button confirm (doc step)":
    '[data-test-id="cs-entry-bulk-add-to-release-add"], button[aria-label="Add"]:has-text("Add"), .ReactModal__Content__footer button:has-text("Add")',
  "Delete entry menu item in visual editor (doc step)":
    '[data-test-id="cs-dropdown-elements"] .option-item:has(svg[name="Delete"]), [data-test-id="cs-dropdown-elements"]:has-text("Delete"), [role="menuitem"]:has-text("Delete"), li:has-text("Delete")',
  "Delete entry modal in visual editor (doc step)":
    '[data-test-id="cs-modal-title-delete-entry"], .delete-confirmation-modal, [role="dialog"]:has-text("Delete Entry")',
  "Delete entry language checkbox in visual editor (doc step)":
    '.delete-confirmation-modal [data-test-id="cs-checkbox"] input[type="checkbox"], .delete-confirmation-modal .language-item input[type="checkbox"]',
  "Delete entry confirm button in visual editor (doc step)":
    '.delete-confirmation-modal button:has(svg[name="Delete"]), .delete-confirmation-modal button:has-text("Delete")',
  "Select release modal (doc step)":
    '[role="dialog"]:has-text("Release"), [data-testid*="select-release" i], .select-release-modal',

  // --- Sidebar rail (editor-sidebar-rail.html) — fall back to aria-label if test ids differ in app ---
  "VE sidebar Status tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-status"], [data-testid*="sidebar-tab-status" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Status"], button[aria-label="Status"]',
  "VE sidebar Form tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-form"], [data-testid*="sidebar-tab-form" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Form"], button[aria-label="Form"]',
  "VE sidebar Drafts tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-drafts"], [data-testid*="sidebar-tab-drafts" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Drafts"], button[aria-label="Drafts"]',
  "VE sidebar Discussions tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-discussions"], [data-testid*="sidebar-tab-discussions" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Discussions"], button[aria-label="Discussions"]',
  "VE sidebar Audiences tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-audiences"], [data-testid*="sidebar-tab-audiences" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Audiences"], button[aria-label="Audiences"]',
  "VE sidebar Widgets tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-widgets"], [data-testid*="sidebar-tab-widgets" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Widgets"], button[aria-label="Widgets"]',
  "VE sidebar Automate tab (doc step)":
    '[data-testid="cs-vb--sidebar-tab-automate"], [data-testid*="sidebar-tab-automate" i], [data-testid="cs-vb--editor-sidebar-rail"] button[aria-label="Automate"], button[aria-label="Automate"]',

  // --- status (status-page.html) ---
  "Status panel back button (doc step)": '[data-testid="cs-vb--individual-status-left-arrow-icon"]',
  "Status panel Basic Information section root (doc step)":
    '[data-testid="cs-vb--status-entry-details-body-section-basic-information"]',
  "Status panel Referenced In section root (doc step)":
    '[data-testid="cs-vb--status-entry-details-body-section-referenced-in"]',
  "Status panel Localization Status section root (doc step)":
    '[data-testid="cs-vb--status-entry-details-body-section-localization-status"]',
  "Status panel Publish Status section root (doc step)":
    '[data-testid="cs-vb--status-entry-details-body-section-publish-status"]',
  "Status panel Release Status section root (doc step)":
    '[data-testid="cs-vb--status-entry-details-body-section-release-status"]',
  "Status panel Entry ID copy control (doc step)": '[data-testid="cs-vb--status-copy-entry-id"]',
  "Status panel Content Type ID copy control (doc step)": '[data-testid="cs-vb--status-copy-content-type-id"]',

  // --- form (form-sidebar-page.html) ---
  "Visual editor Form sidebar root (doc step)": '[data-testid="cs-vb--form-sidebar"], .form-sidebar-page',

  // --- drafts (drafts-page.html) ---
  "Drafts panel empty state (doc step)": '[data-testid="cs-vb--tab-empty-state-draft"]',
  "Drafts panel heading (doc step)":
    '.draft-discussion-panel .SidebarWindow__content__title:has-text("Drafts"), .SidebarWindow__content__title:has-text("Drafts")',
  "Drafts list entry Compare action (doc step)":
    'button:has-text("Compare"), [data-testid*="draft" i] button:has-text("Compare"), [aria-label*="Compare" i]',
  "Drafts side-by-side compare view (doc step)":
    '[data-testid*="compare" i], [class*="compare-view" i], [class*="side-by-side" i], [data-testid*="draft-compare" i]',
  "Drafts revert icon (doc step)":
    'button[aria-label*="Revert" i], [data-testid*="revert" i], [name*="Undo" i], [name*="Revert" i]',

  // --- discussions (discussions-page.html) ---
  "Discussions panel root (doc step)":
    '.comment-discussion-panel, .visual-builder-entry-discussion-title',
  "Discussions panel heading (doc step)": '[data-testid="cs-vb--entry-discussion-title"]',
  "Discussions Hide from Canvas toggle (doc step)": '[data-test-id="cs-vb--entry-discussion-toggle-switch"]',
  "Discussions status dropdown (doc step)": '[data-test-id="cs-entry-comment-discussion-panel-dropdown"]',
  "Discussions refresh icon (doc step)":
    '[data-test-id="cs-vb--entry-discussion-refresh-entry"], svg[name="Refresh"][data-test-id="cs-vb--entry-discussion-refresh-entry"]',
  "Discussions entry list row (doc step)":
    '[data-testid^="cs-vb--discussion-list-row--"], .entry-list-row__container[data-testid^="cs-vb--discussion-list-row--"]',
  "Discussions entry discussion count (doc step)":
    '[data-testid="cs-vb-discussion-count"]',
  "Discussions filter Timeline option (doc step)":
    '[role="menuitem"]:has-text("Timeline"), [role="option"]:has-text("Timeline"), li:has-text("Timeline")',
  "Discussions filter Resolved option (doc step)":
    '[role="menuitem"]:has-text("Resolved"), [role="option"]:has-text("Resolved"), li:has-text("Resolved")',
  "Discussions filter Active option (doc step)":
    '[role="menuitem"]:has-text("Active"), [role="option"]:has-text("Active"), li:has-text("Active")',
  "Discussions icon beside canvas field (doc step)":
    '[data-testid*="discussion" i][data-testid*="field" i], button[aria-label*="Discussion" i], button[aria-label*="Comment" i], [class*="comment-indicator"]',
  "Shared preview section discussion icon (doc step)":
    '[data-testid*="discussion" i][data-testid*="icon" i], button[aria-label*="Discussion" i], button[aria-label*="Comment" i], [class*="comment-indicator"]',
  "Shared preview discussion thread (doc step)":
    '[data-testid*="discussion-list-row" i], [data-testid*="discussion-thread" i], [class*="discussion-thread"]',
  "Discussions tab in preview sharing right panel (doc step)":
    '[aria-label*="Discussions" i], [data-testid*="discussions-tab" i], [data-testid*="sidebar-tab-discussions" i]',
  "Add New Comment modal (doc step)":
    '[role="dialog"]:has-text("Add New Comment"), [role="dialog"]:has-text("Comment"), [data-testid*="add-new-comment" i], [data-testid*="comment-modal" i]',
  "Review comment Post button (doc step)":
    '[role="dialog"] button:has-text("Post"), button:has-text("Post"), [data-testid*="post" i]',
  "Review comment Edit icon (doc step)":
    'button[aria-label*="Edit" i], [data-testid*="edit-comment" i], [name="Edit"]',
  "Review comment Update button (doc step)":
    'button:has-text("Update"), [data-testid*="update" i]',
  "Review comment Delete icon (doc step)":
    'button[aria-label*="Delete" i], [data-testid*="delete-comment" i], [name="Delete"]',
  "Review comment Resolve button (doc step)":
    'button:has-text("Resolve"), [data-testid*="resolve" i]',
  "Review comment Reopen button (doc step)":
    'button:has-text("Reopen"), [data-testid*="reopen" i]',

  // --- audiences (editor-audiences-page.html) ---
  "Audiences Highlight Variant toggle (doc step)": '[data-test-id="cs-vb--audiences-toggle-switch"]',
  "Audiences select control (doc step)": '[data-test-id="cs-vb--audience-select"]',
  "Audiences A/B Test tab (doc step)": '[data-test-id="cs-vb--audience-ab-tab"]',
  "Audiences Segmented Experience tab (doc step)": '[data-test-id="cs-vb--audience-segment-tab"]',
  "Audiences dropdown option item (doc step)":
    '[role="listbox"] [role="option"], [role="menu"] [role="menuitem"], [data-test-id="cs-vb--audience-select"] [role="option"]',
  "Audiences experience Edit icon (doc step)":
    '[data-test-id*="audience" i] button[aria-label*="Edit" i], [data-testid*="audience" i] button[aria-label*="Edit" i], [data-testid*="audiences" i] button[aria-label*="Edit" i], button[aria-label*="Edit variant" i], button:has-text("Edit")',

  // --- widgets (widgets-page.html) ---
  "Widgets panel heading (doc step)": '[data-testid="cs-vb--entry-widgets-title"]',
  "Widgets dropdown trigger (doc step)":
    '[data-testid="cs-vb--entry-widgets-dropdown-header-icon"], [data-testid="cs-vb--entry-widgets-header-dropdown-arrow-icon"]',
  "Widgets dropdown selected app value (doc step)":
    '[data-testid="cs-vb--entry-widgets-header-selected-or-search-value"]',
  "Widgets dropdown first app option (doc step)":
    '[role="menu"] [role="menuitem"], [role="listbox"] [role="option"], .Dropdown [role="menuitem"], .Dropdown [role="option"]',
  "Widgets extension iframe (doc step)":
    'iframe[data-testid="app-extension-frame"][title*="commercetools" i], iframe[data-testid="app-extension-frame"][src*="contentstackmarket" i]',

  // --- automate (automate-page.html) ---
  "Automate back button (doc step)":
    '[data-testid="cs-vb--individual-status-left-arrow-icon"], .sidebar-rail-extension__entry [name="LeftArrow"]',
  "Automate run icon (doc step)":
    'button[aria-label*="Run" i], [role="button"][aria-label*="Run" i], [data-testid*="run" i]',
  "Automate run confirmation modal (doc step)":
    '[role="dialog"]:has(button:has-text("Yes")), .ReactModal__Content:has(button:has-text("Yes"))',
  "Automate confirm Yes button (doc step)":
    '[role="dialog"] button:has-text("Yes"), .ReactModal__Content button:has-text("Yes")',
  "Automate panel extension iframe (doc step)":
    'iframe[data-testid="app-extension-frame"][title*="Automate" i], iframe[data-testid="app-extension-frame"][src*="prod-actions-widget" i]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  /** Create New Page modal — Title (entry title). */
  "Create new page Title field (doc step)":
    '[role="dialog"]:has-text("Create New Page") input[name*="title" i], [role="dialog"]:has-text("Create") input[name="title"], [role="dialog"] [data-testid*="create-new-page" i] input[name*="title" i]',
  /** Create New Page modal — URL (generated from title; optional edit). */
  "Create new page URL field (doc step)":
    '[role="dialog"]:has-text("Create New Page") input[name*="url" i], [role="dialog"]:has-text("Create") input[name*="url" i], [role="dialog"] input[placeholder*="URL" i]',
  /** After selecting a component: first visible text field in Form sidebar (inline edit). */
  "Page component first field input in Form sidebar (doc step)":
    '[data-testid="cs-vb--form-sidebar"] input[type="text"]:visible, [data-testid="cs-vb--form-sidebar"] textarea:visible',
  "Import entry JSON file input in visual editor (doc step)":
    '[data-test-id="cs-import-file-choose"], input#import-input, input[type="file"][accept*="json" i], [role="dialog"] input[type="file"]',
  "Version rename input in visual editor (doc step)":
    '[role="dialog"] input[name*="version" i], [role="dialog"] input[placeholder*="version" i], input[aria-label*="Version name" i]',
  "Share Preview invite users field (doc step)":
    '[role="dialog"] input[placeholder*="Invite" i], [role="dialog"] [data-testid*="invite" i] input, [role="dialog"] input[type="email"]',
  "Share Preview add note field (doc step)":
    '[role="dialog"] textarea[placeholder*="Note" i], [role="dialog"] [data-testid*="note" i] textarea',
  "Review comment input box (doc step)":
    '[role="dialog"] textarea, [data-testid*="comment-input" i], [contenteditable="true"][role="textbox"]',
};

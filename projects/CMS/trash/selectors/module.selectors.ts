/**
 * Trash → Taxonomies table (restore/delete flows): row Actions column opens a vertical menu.
 *
 * Ellipsis control: `button[data-test-id="cs-table-action-options"].three-dots-vertical-icon` (e.g. aria-label "row 1 action", role="menu").
 * Menu root: `[data-test-id="cs-vertical-action-tooltip"]` → list `[data-test-id="cs-vertical-action-tooltip-actions"]`.
 * Items: View Details (`.trash_viewDetails` / `.trash_viewDetails_text`), Restore (`.restore-btn` wraps tippy + icon; `.restore-label` text "Restore").
 * See also: data/dom/CMS/trash/taxonomy-verticle-menu.html
 */
export const CLICK_SELECTORS: Record<string, string> = {
  "Settings (doc step)":
    '[data-test-id="cms-nav-settings"], button[aria-label="Settings"], [role="menu"] [role="menuitem"]:has-text("Settings"), [data-test-id="menu"] li:has-text("Settings"), [data-test-id="menu"] a:has-text("Settings")',
  "More (doc step)":
    '[data-test-id="cs-dropdown-truncate-button"], button:has-text("More"), button[aria-label*="more" i]',
  "Trash in settings left nav (doc step)":
    '[data-test-id="cs-stack-settings-trash"], a[href*="/settings/trash"], .ListRowV2:has-text("Trash")',
  "Trash Entries tab (doc step)": '[data-test-id="cs-trash-entries-tab"]',
  "Trash Assets tab (doc step)": '[data-test-id="cs-trash-asstes-tab"]',
  "Trash Content Types tab (doc step)": '[data-test-id="cs-trash-ct-tab"]',
  "Trash Global Fields tab (doc step)": '[data-test-id="cs-trash-global-fields-tab"]',
  "Trash Taxonomies tab (doc step)": '[data-test-id="cs-trash-taxonomies-tab"]',
  "Trash date range filter DATE (doc step)":
    '.trash-content-types [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-global-fields [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-taxonomy-fields [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-entries [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-assets [data-test-id="cs-trash-dateRangePicker-dropdown"], [data-test-id="cs-trash-dateRangePicker-dropdown"]',
  /** Opens date range popover; caret is the trailing control (see data/dom/CMS/trash/date-range-dropdown.html). */
  "Trash date range filter DATE click (doc step)":
    '.trash-content-types [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-global-fields [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-taxonomy-fields [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-entries [data-test-id="cs-trash-dateRangePicker-dropdown"], .trash-assets [data-test-id="cs-trash-dateRangePicker-dropdown"], [data-test-id="cs-trash-dateRangePicker-dropdown"]',
  "Trash Filters section header (doc step)":
    '.publish-que-filter-wrapper [data-test-id="cs-section-header"]:has-text("Filters"), [data-test-id="cs-page-layout-leftSidebar"] [data-test-id="cs-section-header"]:has-text("Filters"), .publish-que-filter-wrapper .SectionHeader:has-text("Filters")',
  "Trash Deleted By filter section (doc step)":
    '.publish-que-filter-wrapper [data-test-id="cs-left-sidebar-deleted-by-section"], [data-test-id="cs-left-sidebar-deleted-by-section"]',
  /** Deleted By → first option (e.g. Me); visible hit target per data/dom/CMS/trash/filters.html */
  "Trash Deleted By filter checkbox (doc step)":
    '[data-test-id="cs-left-sidebar-deleted-by-section"] span.Checkbox__box',
  /** data/dom/CMS/trash/reset-filter.html */
  "Trash Reset filters button (doc step)":
    '[data-test-id="cs-left-sidebar-reset-filter"], button[aria-label*="reset" i][aria-label*="filter" i]',
  /** ⋮ Actions menu on first non-empty CT/GF/entries/assets trash row (replaces hover-reveal pattern). */
  "Trash content type row Actions menu (doc step)":
    '.trash-content-types [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) [data-test-id="cs-table-action-options"], .trash-content-types [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) button.three-dots-vertical-icon',
  "Trash global field row Actions menu (doc step)":
    '.trash-global-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) [data-test-id="cs-table-action-options"], .trash-global-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) button.three-dots-vertical-icon',
  "Trash entry row Actions menu (doc step)":
    '.trash-entries [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) [data-test-id="cs-table-action-options"], .trash-entries [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) button.three-dots-vertical-icon',
  "Trash asset row Actions menu (doc step)":
    '.trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) [data-test-id="cs-table-action-options"], .trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) button.three-dots-vertical-icon',
  /** Hover first trash CT row (left area); then Restore in VerticalActionTooltip — data/dom/CMS/trash/content-type-verticle-menu.html */
  "Trash content type row to restore hover (doc step)":
    '.trash-content-types [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  /** data/dom/CMS/trash/global-fields-listing-page.html */
  "Trash global field row to restore hover (doc step)":
    '.trash-global-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  /** data/dom/CMS/trash/entries-listing-page.html — hover row; Restore in VerticalActionTooltip (entries-verticle-dp-menu.html). */
  "Trash entry row to restore hover (doc step)":
    '.trash-entries [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  "Trash row Restore action visible after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-ct-action-restore"]',
  "Trash row Restore action after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-ct-action-restore"]',
  "Trash global field row Restore action visible after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-gf-action-restore"]',
  "Trash global field row Restore action after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-gf-action-restore"]',
  "Trash entry row Restore action visible after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-entries-action-restore"]',
  "Trash entry row Restore action after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-entries-action-restore"]',
  /** data/dom/CMS/trash/asset-listing-page.html — hover folder or file row; tooltip Restore (same pattern as entries). */
  "Trash asset folder row to restore hover (doc step)":
    '.trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  "Trash deleted asset file row to restore hover (doc step)":
    '.trash-assets [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row)',
  "Trash asset row Restore action visible after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-assets-action-restore"], [data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-asstes-action-restore"]',
  "Trash asset row Restore action after hover (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-assets-action-restore"], [data-test-id="cs-vertical-action-tooltip"] [data-test-id="cs-trash-asstes-action-restore"]',
  /** Actions column: cs-table-action-options + three-dots-vertical-icon; opens taxonomy-verticle-menu.html */
  "Trash taxonomy first row Actions ellipsis (doc step)":
    '.trash-taxonomy-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) [data-test-id="cs-table-action-options"], .trash-taxonomy-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) button[data-test-id="cs-table-action-options"].three-dots-vertical-icon, .trash-taxonomy-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row) button[data-test-id="cs-table-action-options"][aria-label*="action" i]',
  /** VerticalActionTooltip — View Details row */
  "Trash taxonomy View Details in vertical action menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] .trash_viewDetails_text, [data-test-id="cs-vertical-action-tooltip-actions"] .trash_viewDetails_text',
  "Trash taxonomy Restore in vertical action menu visible (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] .restore-label:has-text("Restore"), [data-test-id="cs-vertical-action-tooltip-actions"] .restore-label:has-text("Restore")',
  /** Prefer clicking `.restore-btn` (full control); label-only is fallback — taxonomy-verticle-menu.html */
  "Trash taxonomy Restore in vertical action menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] .restore-btn, [data-test-id="cs-vertical-action-tooltip-actions"] .restore-btn, [data-test-id="cs-vertical-action-tooltip"] .restore-label:has-text("Restore"), [data-test-id="cs-vertical-action-tooltip-actions"] .restore-label:has-text("Restore")',
  /** data/dom/CMS/trash/restore-taxonomy-modal.html */
  "Restore taxonomy modal title (doc step)": '[data-test-id="cs-modal-title-restore-taxonomy"]',
  "Restore taxonomy modal description (doc step)": '[data-test-id="cs-modal-description"]',
  /** Split primary Restore opens dropdown; doc: Restore with Content Type Association / Restore without Content Type Association */
  "Restore taxonomy split Restore primary button (doc step)":
    '.taxonomy-restore-button button.Button--primary, [data-test-id="cs-button-group"] .taxonomy-restore-button button.Button--primary',
  /** Open split menu (caret) before choosing association option — restore-taxonomy-modal.html */
  "Restore taxonomy split open restore options dropdown (doc step)":
    '.taxonomy-restore-button .openDropdownOnClick, [data-test-id="cs-button-group"] .taxonomy-restore-button .openDropdownOnClick, .taxonomy-restore-button svg[name="CaretDown"]',
  "Restore taxonomy With Content Type Association menu option (doc step)":
    '[role="menuitem"]:has-text("Restore with Content Type Association"), li:has-text("Restore with Content Type Association")',
  "Restore taxonomy Without Content Type Association menu option (doc step)":
    '[role="menuitem"]:has-text("Restore without Content Type Association"), li:has-text("Restore without Content Type Association")',
  /** Doc modal step: split Restore → choose “Restore with Content Type Association” (restore-taxonomy-modal.html). */
  "Restore taxonomy With Content Type Association (doc step)":
    '[role="menuitem"]:has-text("Restore with Content Type Association"), button:has-text("Restore with Content Type Association")',
  /** Trash → Taxonomies: Type column = Term (taxonomies-listing-page.html termTypeCell); ellipsis + menu match taxonomy-verticle-menu.html */
  "Trash term first row Actions ellipsis (doc step)":
    '.trash-taxonomy-fields [data-test-id^="cs-table-body-row-"]:not(.Table__empty__row):has(.termTypeCell :has-text("Term")) [data-test-id="cs-table-action-options"]',
  "Trash term View Details in vertical action menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] .trash_viewDetails_text, [data-test-id="cs-vertical-action-tooltip-actions"] .trash_viewDetails_text',
  "Trash term Restore in vertical action menu visible (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] .restore-label:has-text("Restore"), [data-test-id="cs-vertical-action-tooltip-actions"] .restore-label:has-text("Restore")',
  "Trash term Restore in vertical action menu (doc step)":
    '[data-test-id="cs-vertical-action-tooltip"] .restore-btn, [data-test-id="cs-vertical-action-tooltip-actions"] .restore-btn, [data-test-id="cs-vertical-action-tooltip"] .restore-label:has-text("Restore"), [data-test-id="cs-vertical-action-tooltip-actions"] .restore-label:has-text("Restore")',
  /** Restore deleted term modal — split Restore pattern like restore-taxonomy-modal.html / restore-taxonomy-restore-dropdown.html */
  "Restore term modal title (doc step)":
    '[data-test-id="cs-modal-title-restore-term"], [data-test-id^="cs-modal-title-restore-term"]',
  "Restore term modal description (doc step)": '[data-test-id="cs-modal-description"]',
  "Restore term split Restore primary button (doc step)":
    '.term-restore-button button.Button--primary, .taxonomy-restore-button button.Button--primary, [data-test-id="cs-button-group"] .term-restore-button button.Button--primary, [data-test-id="cs-button-group"] .taxonomy-restore-button button.Button--primary',
  "Restore term split open restore options dropdown (doc step)":
    '.term-restore-button .openDropdownOnClick, .taxonomy-restore-button .openDropdownOnClick, [data-test-id="cs-button-group"] .term-restore-button .openDropdownOnClick, .term-restore-button svg[name="CaretDown"], .taxonomy-restore-button svg[name="CaretDown"]',
  "Restore term With Entry Association menu option (doc step)":
    '[role="menuitem"]:has-text("Restore with Entry Association"), li:has-text("Restore with Entry Association"), li[title="Restore with Entry Association"]',
  "Restore term Without Entry Association menu option (doc step)":
    '[role="menuitem"]:has-text("Restore without Entry Association"), li:has-text("Restore without Entry Association"), li[title="Restore without Entry Association"]',
  "Restore term With Entry Association (doc step)":
    '[role="menuitem"]:has-text("Restore with Entry Association"), li[title="Restore with Entry Association"], button:has-text("Restore with Entry Association")',
  "Restore content type modal title (doc step)":
    '[data-test-id^="cs-modal-title-restore-content-type"], .ReactModal__delete h3:has-text("Restore"), [role="dialog"] h3:has-text("Restore")',
  "Restore content type modal description (doc step)": '[data-test-id="cs-ct-restore-description"]',
  "Restore With Entries button (doc step)": '[data-test-id="cs-trash-content-type-restore-with-entries"]',
  "Restore Without Entries button (doc step)": '[data-test-id="cs-trash-content-type-restore-without-entries"]',
  "Cancel restore content type modal (doc step)": '[data-test-id="cs-trash-content-type-restore-cancel"]',
  "Restore global field modal title (doc step)":
    '[data-test-id^="cs-modal-title-restore-global-field"], [role="dialog"] h3:has-text("Restore Global Field"), .ReactModal__Content h3:has-text("Restore Global Field")',
  "Restore global field modal primary Restore button visible (doc step)":
    '[data-test-id="cs-trash-gf-restore-confirm"], [data-test-id="cs-cb-restore-gf"], [role="dialog"] button.Button--primary:has-text("Restore"), [role="dialog"] button:has-text("Restore")',
  "Restore global field modal Restore button (doc step)":
    '[data-test-id="cs-trash-gf-restore-confirm"], [data-test-id="cs-cb-restore-gf"], [role="dialog"] button.Button--primary:has-text("Restore")',
  "Restore entry modal title (doc step)":
    '[data-test-id^="cs-modal-title-restore-entry"], [data-test-id^="cs-modal-title-restore-deleted-entry"], [role="dialog"] h3:has-text("Restore Entry"), .ReactModal__Content h3:has-text("Restore Entry")',
  "Restore entry modal primary Restore button visible (doc step)":
    '[data-test-id="cs-trash-entry-restore-confirm"], [data-test-id="cs-cb-restore-entry"], [role="dialog"] button.Button--primary:has-text("Restore"), [role="dialog"] button:has-text("Restore")',
  "Restore entry modal Restore button (doc step)":
    '[data-test-id="cs-trash-entry-restore-confirm"], [data-test-id="cs-cb-restore-entry"], [role="dialog"] button.Button--primary:has-text("Restore")',
  /** data/dom/CMS/trash/restore-folder.html — title test id is cs-modal-title-restore-folder-<folderName> (dynamic suffix). */
  "Restore asset folder modal title (doc step)":
    '[data-test-id^="cs-modal-title-restore-folder"], [data-test-id^="cs-modal-title-restore-asset-folder"], [role="dialog"] h3:has-text("Restore"), .ReactModal__delete h3:has-text("Restore")',
  /** restore-folder.html — body copy “Do you also wish to restore the assets…” */
  "Restore asset folder modal description (doc step)": '[data-test-id="cs-modal-description"]',
  /** restore-folder.html — footer buttons (note: With Assets uses cs-trash-assets-restore-with-asset). */
  "Restore asset folder Restore With Assets button (doc step)":
    '[data-test-id="cs-trash-assets-restore-with-asset"], [data-test-id="cs-trash-asset-folder-restore-with-assets"], [data-test-id="cs-cb-restore-asset-folder-with-assets"], [role="dialog"] button:has-text("Restore With Assets")',
  "Restore asset folder Restore Without Assets button (doc step)":
    '[data-test-id="cs-trash-assets-restore-without-assets"], [data-test-id="cs-trash-asset-folder-restore-without-assets"], [data-test-id="cs-cb-restore-asset-folder-without-assets"], [role="dialog"] button:has-text("Restore Without Assets")',
  "Cancel restore asset folder modal (doc step)": '[data-test-id="cs-trash-assets-restore-cancel"]',
  "Restore deleted asset modal title (doc step)":
    '[data-test-id^="cs-modal-title-restore-asset"], [data-test-id^="cs-modal-title-restore-deleted-asset"], [role="dialog"] h3:has-text("Restore Asset"), .ReactModal__Content h3:has-text("Restore Asset")',
  "Restore deleted asset modal primary Restore button visible (doc step)":
    '[data-test-id="cs-trash-asset-restore-confirm"], [data-test-id="cs-cb-restore-asset"], [role="dialog"] button.Button--primary:has-text("Restore"), [role="dialog"] button:has-text("Restore")',
  "Restore deleted asset modal Restore button (doc step)":
    '[data-test-id="cs-trash-asset-restore-confirm"], [data-test-id="cs-cb-restore-asset"], [role="dialog"] button.Button--primary:has-text("Restore"), [role="dialog"] button:has-text("Restore")',
  /** Doc “Once done, click on Restore” — confirmation modal after Trash list Restore (same control as primary Restore). */
  "Once done click Restore (deleted asset modal) (doc step)":
    '[data-test-id="cs-trash-asset-restore-confirm"], [data-test-id="cs-cb-restore-asset"], [role="dialog"] button.Button--primary:has-text("Restore")',
  /** Doc step “Once done, click on Restore” — deleted asset editor header (Restore_a_Deleted_Asset_3_highlighted.png). */
  "Once done click Restore (deleted asset editor) (doc step)":
    '[data-test-id="cs-page-layout-header"] button:has-text("Restore"), [data-test-id="cs-page-header"] button:has-text("Restore"), .PageHeader button:has-text("Restore")',
  /** After modal/tooltip restore: deleted GF builder (gfdeleted) — doc “Open the Global field schema … add or remove fields … click Restore”. */
  "Deleted global field builder from trash restore (doc step)":
    '.contenttype-builder.globalfield-builder, .globalfield-builder, div.contenttype-builder:has(.globalfield-builder)',
  /** Same “+” / Insert control as Content Models global field builder (projects/CMS/global-field/selectors). */
  "Global field builder Insert a field (trash restore doc step)":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  "Insert a field (trash restore doc step)":
    '[data-test-id="cs-field-type-selector"] .FieldTypeSelector:visible, [data-test-id="cs-field-type-selector"] svg[name="PurpleAdd"]:visible',
  /** Header Restore on deleted global field builder (final doc Restore). */
  "Restore on deleted global field builder (doc step)":
    '[data-test-id="cs-page-layout-header"] button:has-text("Restore"), [data-test-id="cs-page-header"] button:has-text("Restore"), .PageHeader button:has-text("Restore")',
  "Restore on deleted global field builder click (doc step)":
    '[data-test-id="cs-page-layout-header"] button:has-text("Restore"), [data-test-id="cs-page-header"] button:has-text("Restore"), .PageHeader button:has-text("Restore")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

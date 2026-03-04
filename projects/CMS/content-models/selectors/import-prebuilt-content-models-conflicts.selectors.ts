export const CLICK_SELECTORS: Record<string, string> = {
  // Reuse same selectors as the non-conflict flow (copied here to keep this flow self-contained)
  "Use Prebuilt": '[data-test-id="cs-cb-new-prebuilt-ct-child"]',
  "Add Content Model": 'role=dialog >> role=heading[name="Add Content Model"]',
  "About Us Page": "role=dialog >> text=About Us Page",
  Import: '[role="dialog"] button:has-text("Import"):visible',

  "Import Content Model to Stack": 'role=heading[name="Import Content Model to Stack"], text=Import Content Model to Stack',
  "Import Content Model":
    'button[data-test-id="cs-button"]:has-text("Import Content Model"), button:has-text("Import Content Model")',
  "View Content Models":
    'button[data-test-id="cs-button"]:has-text("View Content Models"), button:has-text("View Content Models")',

  // Conflict dropdowns (React-Select). Prefer clicking the control container,
  // and pick the currently open menu's first option (option-0).
  "SEO Conflict Dropdown":
    'tr:has(td.table-col-1:has-text("SEO")) .conflict-table-select-dropdown',
  "SEO Conflict First Option": 'div[id^="react-select-"][id$="-option-0"]:visible',

  "Templates Conflict Dropdown":
    'tr:has(td.table-col-1:has-text("Templates")) .conflict-table-select-dropdown',
  "Templates Conflict First Option": 'div[id^="react-select-"][id$="-option-0"]:visible',

  "Components Conflict Dropdown":
    'tr:has(td.table-col-1:has-text("Components")) .conflict-table-select-dropdown',
  "Components Conflict First Option": 'div[id^="react-select-"][id$="-option-0"]:visible',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "SEO Conflict Input":
    'tr:has(td.table-col-1:has-text("SEO")) input[id^="react-select-"][id$="-input"]',
  "Templates Conflict Input":
    'tr:has(td.table-col-1:has-text("Templates")) input[id^="react-select-"][id$="-input"]',
  "Components Conflict Input":
    'tr:has(td.table-col-1:has-text("Components")) input[id^="react-select-"][id$="-input"]',
};


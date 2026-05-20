/**
 * **Edit an Audience** — Audiences listing ⋮ (**Actions**) + **Audience** editor (same shells as **`create-audience`**).
 *
 * ### Canonical row menu (save for reuse)
 * - Row **⋮**: **`button[data-test-id="cs-table-action-options"]`** — always resolve **inside** the matching table row (**`expected.rowContains` / env** — see **`actionRules.ts`**).
 * - After the menu anchors (**`VERTICAL_ELLIPSIS_POST_OPEN_MS`**, default **2000** ms).
 * - **Edit**: **`[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]`** — hover, then click (inner `a` when present). Visible label may be **Edit** or **Edit Text** vs doc [**Edit**](https://www.contentstack.com/docs/personalize/edit-audience).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Audiences (doc step)": '[data-test-id="personalize-nav-audiences"]',

  /** Doc step 4: **Actions** column on the audiences table. */
  "Edit Audience doc: verify Audiences table Actions column heading (doc step)":
    '[data-test-id="cs-table"] [role="columnheader"]:has-text("Actions")',

  "Edit Audience doc: verify row Actions vertical tooltip Edit menu item label (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Edit Audience doc: Audiences row Actions Edit menu item (doc step)":
    '[data-test-id="cs-vertical-action-tooltip-actions"] li[data-test-id="cs-ct-action-edit"]',

  "Audience editor Name field label (doc step)": '[data-testid="audience-name-section"] label[data-test-id="cs-field-label"]',

  "Audience editor Description field label (doc step)": '[data-testid="audience-description-section"] label[data-test-id="cs-field-label"]',

  /** Edit-mode **Save** uses **`aria-label="save-audience-button"`** (create flow uses **`audience-create-button`**). */
  "Edit Audience doc: verify Save button audience editor (doc step)":
    'main#react-personalize button[aria-label="save-audience-button"], main#react-personalize .audience-creation-page button[aria-label="audience-create-button"], main#react-personalize button[aria-label="audience-create-button"]',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Personalize Audience editor Description field (doc step)": '[data-testid="audience-description-input"]',
};

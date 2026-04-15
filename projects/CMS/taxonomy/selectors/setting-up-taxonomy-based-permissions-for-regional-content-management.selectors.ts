/**
 * Setting Up Taxonomy-based Permissions for Regional Content Management
 * Doc: https://www.contentstack.com/docs/developers/taxonomy/setting-up-taxonomy-based-permissions-for-regional-content-management
 * Settings → Users & Roles → Roles → New Role → taxonomy permissions (DOM may vary by stack).
 * DOM ref for nav: data/dom/CMS/settings/settings-left-nav.html (cs-stack-settings-users-roles).
 */
import { CLICK_SELECTORS as TaxClick, INPUT_SELECTORS as TaxInput } from "./module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...TaxClick,
  /** settings-left-nav.html — doc step 1 */
  "Users & Roles from left nav (doc step)":
    'a[href*="/settings/users"]:has([data-test-id="cs-stack-settings-users-roles"]), a.ListRowV2-wrapper:has([data-test-id="cs-stack-settings-users-roles"]), [data-test-id="cs-stack-settings-users-roles"]',
  /** Doc step 2 — Roles tab on Users & Roles area */
  "Roles tab (doc step)":
    '[role="tab"]:has-text("Roles"), button[role="tab"]:has-text("Roles"), [data-test-id*="tab-roles" i], .Tab__item:has-text("Roles")',
  /** Doc step 3 — top right */
  "New Role button (doc step)":
    '[data-test-id="cs-page-layout-contentBody"] button:has-text("New Role"), button:has-text("+ New Role"), button[aria-label*="New Role" i]',
  /**
   * Doc “All Entries of Content Types / Taxonomies” — flow uses actionRules: Scope branch + “Add Rule” for this row (and optional chevron); keep CSS as fallback only.
   */
  "All Entries Content Types Taxonomies section expand (doc step)":
    'button[data-test-id*="add-condition-ct" i], p:has-text("All Entries of Content Types") ~ img, p:has-text("All Entries of Content Types") + img',
  /** Doc step 7 — permission matrix (visible after Entries/Taxonomies row is expanded). */
  "Specific Taxonomies radio (doc step)":
    '[role="radio"][aria-label*="Specific Taxonomies" i], label:has-text("Specific Taxonomies"), span:has-text("Specific Taxonomies"), p:has-text("Specific Taxonomies")',
  /** Doc step 8 — open taxonomy dropdown (react-select) */
  "Taxonomy picker control (doc step)":
    '[role="dialog"] .Select__control, [class*="Permissions"] .Select__control, .Select__control:visible',
  /** Doc step 8 — doc example taxonomy name (“Regions”); stack must include this taxonomy or adjust selector */
  "Regions taxonomy option (doc step)":
    '[role="option"]:has-text("Regions"), .Select__menu [role="option"]:has-text("Regions")',
  /** Doc step 9 */
  "Specific Terms radio (doc step)":
    '[role="radio"][aria-label*="Specific Terms" i], label:has-text("Specific Terms"), span:has-text("Specific Terms"), p:has-text("Specific Terms")',
  "First term checkbox or row (doc step)":
    '[role="treeitem"] input[type="checkbox"], [role="dialog"] [role="checkbox"], label:has(input[type="checkbox"])',
  /** Doc step 11 */
  "Save new role button (doc step)":
    'button:has-text("Save"), [data-test-id="cs-role-save"], .ReactModal__Content__footer button.Button--primary:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...TaxInput,
  /** New Role modal — doc step 4 */
  "Role Name input (doc step)":
    '[role="dialog"] input[name="name"], [data-test-id="cs-modal"] input[name="name"], input[aria-label="name"], input[placeholder*="Name" i]',
  "Role Description textarea (doc step)":
    '[role="dialog"] textarea[name="description"], textarea[aria-label="description"], textarea[placeholder*="Description" i]',
};

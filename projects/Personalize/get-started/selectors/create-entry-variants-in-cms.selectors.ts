/**
 * CMS UI for [Create Entry Variants in CMS](https://www.contentstack.com/docs/personalize/get-started-with-personalize-with-ab-test-end-to-end-guide#create-entry-variants-in-cms)
 * (stack settings Variants, variant group details, Entries).
 */

export const CLICK_SELECTORS: Record<string, string> = {
  /** Stack settings / left rail — doc: select **Variants** after **Settings**. */
  "Create Entry Variants in CMS doc: Settings sidebar Variants (doc step)":
    'a[href*="variant" i], aside a:has-text("Variants"), nav a:has-text("Variants"), [role="treeitem"]:has-text("Variants"), [data-test-id*="settings-variant" i], [data-test-id*="variant-setting" i]',
  /** Variant group details — **Link Content Types** section. */
  "Create Entry Variants in CMS doc: Link Content Types Apply button (doc step)":
    'button:has-text("Apply"):not([disabled]), [role="dialog"] button:has-text("Apply")',
  /** Variant group details footer / primary save on settings-style pages. */
  "Create Entry Variants in CMS doc: Variant Group details Save button (doc step)":
    'button[data-test-id="cs-save-button"], button.Button--primary:has-text("Save"), [data-test-id*="save" i] button:has-text("Save"), button:has-text("Save")',
};

export const INPUT_SELECTORS: Record<string, string> = {};

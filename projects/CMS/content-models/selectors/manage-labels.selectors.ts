/**
 * Flow: manage-labels
 * Source: https://www.contentstack.com/docs/developers/create-content-types/manage-labels
 * Curated selectors for this flow only.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Gear (doc step)":
    "[data-test-id='cs-content-types-label-settings'], [data-test-id='cs-ct-list-label-settings-tooltip'], [data-test-id='cs-ct-list-label-settings']",
  "Manage Labels modal (doc step)":
    "[data-test-id='cs-modal-title-manage-labels'], h3:has-text('Manage Labels')",
  "+ New Label (doc step)":
    "[data-test-id='cs-cb-manage-labels-modal-add'], [data-test-id='cs-save-content-page-add-new-label'], button:has-text('New Label')",
  "Edit label item (doc step)":
    "svg[data-test-id='cs-cb-manage-labels-modal-edit'], [data-test-id='label-tooltip'] svg[data-test-id='cs-cb-manage-labels-modal-edit'], [data-test-id='cs-actiontooltip'], [data-test-id='cs-cb-manage-labels-modal-list']",
  "Edit Label button (doc step)":
    "button[aria-label='Edit Label'], button:has-text('Edit'), [data-test-id='cs-create-edit-label'][aria-label='Edit Label'], [data-test-id='cs-create-edit-label']",
  "Create Label button (doc step)":
    "button[aria-label='Create Label'], button:has-text('Create'), [data-test-id='cs-create-edit-label'][aria-label='Create Label'], [data-test-id='cs-create-edit-label']",
  "Delete label item (doc step)":
    "[data-test-id='cs-cb-manage-labels-modal-list']",
  "Delete Label button (doc step)":
    "button[data-test-id='cs-ct-delete'], button[data-test-id='cs-ct-delete'] div.flex-v-center.Button__mt-regular.Button__visible, button[aria-label='Delete Label'], button:has-text('Delete'), [data-test-id='cs-ct-delete']",
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Name (edit label doc step)":
    "[data-test-id='cs-labels-name-input-field'] input, input[aria-label='name'], input[placeholder*='label name' i], input[name='name']",
  "Name (new label doc step)":
    "[data-test-id='cs-labels-name-input-field'] input, input[aria-label='name'], input[placeholder*='label name' i], input[name='name']",
  "Nest Label Under (edit label doc step)":
    "[aria-label='Nest Label Under'] input, [role='combobox'][aria-label*='Nest Label Under' i] input, input[placeholder*='Nest Label Under' i], [data-test-id='cs-cb-manage-labels-modal-list']",
};

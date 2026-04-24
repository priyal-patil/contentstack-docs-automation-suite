/**
 * Launch → How-to guides (cross-product flows merge Launch + CMS selectors).
 */
import { CLICK_SELECTORS as LaunchClick, INPUT_SELECTORS as LaunchInput } from "../../projects/selectors/module.selectors";
import { CLICK_SELECTORS as CmsWebhookClick, INPUT_SELECTORS as CmsWebhookInput } from "../../../CMS/webhook/selectors/module.selectors";
import { CLICK_SELECTORS as CreateWebhookClick, INPUT_SELECTORS as CreateWebhookInput } from "../../../CMS/webhook/selectors/create-a-webhook.selectors";
import { CLICK_SELECTORS as CmsEntriesClick, INPUT_SELECTORS as CmsEntriesInput } from "../../../CMS/entries/selectors/module.selectors";

export const CLICK_SELECTORS: Record<string, string> = {
  ...LaunchClick,
  ...CmsWebhookClick,
  ...CreateWebhookClick,
  ...CmsEntriesClick,
  /** Org dashboard — same as core/navigation HEADLESS_TILE. */
  "CMS org dashboard Headless CMS product tile (doc step)":
    '[data-test-id="cs-global-dashboard-product-tile-headless-cms"]',
  "Enable Webhook toggle (doc step)":
    '[data-test-id="cs-webhook-switch-enabled"] input[type="checkbox"], [data-test-id="cs-webhook-switch-enabled"] label.toggle-switch',
};

export const INPUT_SELECTORS: Record<string, string> = {
  ...LaunchInput,
  ...CmsWebhookInput,
  ...CreateWebhookInput,
  ...CmsEntriesInput,
  /** Publish Entry modal field labels (data/dom/CMS/entries/publish-entry.html). */
  "Publish Entry modal Environment(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-environment"]',
  "Publish Entry modal Language(s) label (doc step)":
    '[data-test-id="cs-entries-publish-select-lang"]',
};

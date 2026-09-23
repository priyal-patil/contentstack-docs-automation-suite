/**
 * [Get Started with Personalize with A/B Test — End-to-End Guide](https://www.contentstack.com/docs/personalize/get-started-with-personalize-with-ab-test-end-to-end-guide)
 *
 * This end-to-end guide walks the same screens the focused Personalize flows cover — create a project,
 * create an event, create an A/B test experience, create an entry variant — so its `enter` steps reuse
 * the *same* target names those flows use.
 *
 * Those names were already mapped, but in the flow-scoped files of the OTHER flows
 * (`set-up-personalize/selectors/create-personalize-project.selectors.ts` and friends). Overrides merge
 * as shared -> legacy -> project -> module -> flow, so a flow-scoped file applies to that flow ALONE: a
 * key defined for `create-personalize-project` in module `set-up-personalize` is invisible to this flow
 * in module `get-started`. With nothing resolving, `enter` fell back to searching the page for the
 * target string itself — `getByLabel(/Personalize New Project Name field \(doc step\)/i)` — which no
 * page can satisfy, so step 10 failed every run with a 30s timeout that read like app drift.
 *
 * That is why `create-personalize-project` PASSES this identical step while this flow fails it.
 *
 * Every selector below is copied verbatim from the flow-scoped file that already proves it against the
 * live app; none is newly invented. Modal roots are re-declared here because they are module-private
 * constants in those files rather than shared exports.
 */

/** Same root as `set-up-personalize/selectors/create-personalize-project.selectors.ts`. */
const personalizeProjectModalRoot =
  '[role="dialog"]:has([data-test-id="cs-modal-title-new-personalize-project"])';

/** Same root as `set-up-personalize/selectors/create-event.selectors.ts`. */
const newEventModalRoot = '[role="dialog"]:has([data-test-id="cs-modal-title-new-event"])';

export const INPUT_SELECTORS: Record<string, string> = {
  // --- New Personalize Project modal (from create-personalize-project.selectors.ts) ---
  "Personalize New Project Name field (doc step)": `${personalizeProjectModalRoot} [data-testid="name-input"]`,
  "Personalize New Project Description field (doc step)": `${personalizeProjectModalRoot} [data-testid="description-input"]`,

  // --- New Event modal (from create-event.selectors.ts) ---
  "Personalize New Event modal Key field (doc step)": `${newEventModalRoot} [data-testid="key-input"]`,
  "Personalize New Event modal Description field (doc step)": `${newEventModalRoot} [data-testid="description-input"]`,

  // --- A/B test experience editor (from create-ab-test-experience.selectors.ts) ---
  "Create A/B Test Experience doc: Overview experience Name field (doc step)":
    '[data-testid="experience-name-text-input"]',
  "Create A/B Test Experience doc: Overview experience Description field (doc step)":
    '[data-testid="experience-description-text-area"]',
  /** First variant row — `.first()` in the runner; the second row has its own `enter` branch in actionRules.ts. */
  "Create A/B Test Experience doc: Configuration first variant Variant Name field (doc step)":
    'main#react-personalize [data-testid="variant-name-text-input"], #PageLayout__body [data-testid="variant-name-text-input"], main#react-personalize [data-testid="ab-testing-experience-draft-config-body"] [data-testid="variant-name-text-input"], main#react-personalize [data-testid="ab-test-experience-draft-config-body"] [data-testid="variant-name-text-input"]',

  // --- CMS entry editor, reached via the entry-variant leg of this guide ---
  /** From `projects/CMS/entries/selectors/module.selectors.ts` — the CMS module map is not on this flow's chain. */
  "Entry Title (doc step)":
    '[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], input[aria-label*="title" i]',
};

/**
 * Delete a Personalize Project — DOM: `data/dom/Personalize/settings-general.html` (**Delete Project** section, `data-testid="delete-project-button"`).
 * Confirmation modal markup may vary; runner uses `getByRole("dialog")` + **DELETE** field heuristics in `rules/core/actionRules.ts`.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Settings (doc step)": '[data-test-id="personalize-nav-settings"]',
  "Personalize workspace top navigation Settings button (doc step)": '[data-test-id="personalize-nav-settings"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

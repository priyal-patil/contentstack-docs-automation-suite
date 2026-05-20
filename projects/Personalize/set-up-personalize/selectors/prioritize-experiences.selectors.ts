/**
 * [Prioritize Experiences](https://www.contentstack.com/docs/personalize/prioritize-experiences)
 *
 * **Experiences listing:** `data/dom/Personalize/experiences.html` — **`data-testid="experiences-priority-sidebar-trigger"`** (**Prioritize Experiences**).
 * **Sidebar:** `data/dom/Personalize/prioritize-experience-page.html` — sortable **`li[data-testid="drag-experience-priority-row"]`**, footer **Save** **`data-testid="experiences-priority-sidebar-save"`**.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Personalize Projects landing page title (doc step)": '[data-test-id="cs-page-title"]',

  "Personalize workspace top navigation Experiences (doc step)": '[data-test-id="personalize-nav-experiences"]',

  "Prioritize Experiences doc: Experiences page title (doc step)": '[data-test-id="cs-page-title"]',

  "Prioritize Experiences doc: verify Experiences page Prioritize Experiences button (doc step)":
    '[data-testid="experiences-priority-sidebar-trigger"]',

  "Prioritize Experiences doc: click Experiences page Prioritize Experiences button (doc step)":
    '[data-testid="experiences-priority-sidebar-trigger"]',

  /** Header copy inside **`generic-sidebar-header`** (`prioritize-experience-page.html`). */
  "Prioritize Experiences doc: verify Prioritize Experiences sidebar title (doc step)":
    '[data-testid="generic-sidebar-header"]',

  /**
   * Second sortable row (requires ≥2 experiences). `@dnd-kit` / sortable **`role="button"`** rows.
   * Drop target is the first row so the second experience moves to priority 1.
   */
  "Prioritize Experiences doc: drag source second priority experience row (doc step)":
    '[data-testid="experiences-priority-sidebar-body"] li[data-testid="drag-experience-priority-row"]:nth-of-type(2)',

  "Prioritize Experiences doc: drag drop target first priority experience row (doc step)":
    '[data-testid="experiences-priority-sidebar-body"] li[data-testid="drag-experience-priority-row"]:nth-of-type(1)',

  "Prioritize Experiences doc: verify sidebar footer Save button (doc step)":
    '[data-testid="experiences-priority-sidebar-save"]',

  "Prioritize Experiences doc: sidebar footer Save button (doc step)":
    '[data-testid="experiences-priority-sidebar-save"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};

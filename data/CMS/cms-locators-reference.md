# CMS automation — locator reference (maintained index)

**Source of truth:** selector strings live in `projects/CMS/<module>/selectors/module.selectors.ts`. Special flows (More menu, modals, hover-then-click) are in `rules/core/actionRules.ts`. This file is a **quick index** for the same locators so future flows can reuse them without hunting through history.

---

## Top navigation — “More” (truncated nav)

| Role | Locator notes |
|------|----------------|
| More button | `[data-test-id="cs-dropdown-truncate-button"]` (see `SeeMore` icon + “More” label) |
| Fallbacks | `button:has-text("More")`, `[aria-label="More"]` |

**Releases module:** `CLICK_SELECTORS["More (doc step)"]` in `projects/CMS/releases/selectors/module.selectors.ts`.

---

## Releases — left nav item (may be under More)

| Role | Locator notes |
|------|----------------|
| Primary | `a[href*="/#!/stack/"][href*="/releases"]` |
| Test ids | `[data-test-id="cms-nav-releases"]`, `button[data-test-id="cms-nav-releases"]` |
| Fallbacks | `a[href*="/releases/list"]`, `a[href*="/releases"]`, `button:has-text("Releases")` |
| From More menu | After opening More: `getByRole("menuitem", { name: /^Releases$/i })` (see `actionRules` verify/click for `Releases (doc step)`) |

---

## Release detail — card action buttons (header, not inside left list row)

Pattern matches **Copy** / **Delete** / **Lock**: `[data-test-id="cs-releases-card-action-<action>"]`.

| Action | Container | Primary click target |
|--------|-----------|----------------------|
| Lock | `[data-test-id="cs-releases-card-action-lock"]` | `button[data-test-id="cs-button"]` inside that wrapper |
| Copy | `cs-releases-card-action-copy` | `button[data-test-id="cs-button"]` |
| Delete | `cs-releases-card-action-delete` | `button[data-test-id="cs-button"]` |

**Lock SVG:** `svg[name="Lock"][data-test-id="cs-icon"]` inside the button.

**Automation note:** Hover the first release row in `.ReleaseLeftContent`, then target the **page-level** lock control above (card header), not a descendant of the row.

---

## Live Preview — entry editor panel

### Panel visible / “Live Preview (doc step)” verify

Shared constant `LIVE_PREVIEW_PANEL_DOC_STEP` in `projects/CMS/live-preview/selectors/module.selectors.ts` (used for both `"Live Preview (doc step)"` and `"Live Preview window (doc step)"`).

Includes (OR chain):

- `.live-preview-partition--visible`
- `[data-testid="live-preview-initial-url-modal"]`
- `.LPHeaderContainer .LPHeaderTitle:has-text("Live Preview")`
- `#entry__page--resizer`
- `[data-test-id="cs-live-preview-close"]`
- `[data-test-id="lp-header-close-btn"]`
- `[data-test-id="cs-live-preview-show"]`
- `.lp-browser-container`
- `[data-testid="live-preview-browser-url-input-form"]`
- `[data-test-id="live-preview-browser-toggle-viewport-btn"]`

### Initial URL / environment modal (before preview fully loads)

| Control | Locator notes |
|---------|----------------|
| Modal root | `[data-testid="live-preview-initial-url-modal"]` |
| Environment select | `[data-test-id="live-preview-initial-url-modal-env-dropdown"]` → `.Select__control` |
| First env option | `.Select__menu [role="option"]` (after menu open) |
| Show preview | `[data-test-id="cs-live-preview-show"]` — enable only after env chosen; use `actionRules` **Show Live Preview button** handler to poll until `isEnabled()` when modal visible |

### Viewport / orientation (loaded preview)

- Toggle: `[data-test-id="live-preview-browser-toggle-viewport-btn"]`, `[data-test-id="live-preview-browser-viewport-settings-bar-toggle-viewport"]`, `.lp-viewport-orientation-icon`
- Horizontal / vertical inputs: `[data-test-id="live-preview-browser-viewport-settings-bar-horizontal-viewport"] input`, `...-vertical-viewport` input  
  **Note:** `verify` / `enter` may use attached + force fill when UI marks inputs not “visible” (see `actionRules`).

---

## Related files (quick jump)

| Area | Path |
|------|------|
| Live Preview selectors | `projects/CMS/live-preview/selectors/module.selectors.ts` |
| Releases selectors | `projects/CMS/releases/selectors/module.selectors.ts` |
| Releases + More / verify | `rules/core/actionRules.ts` — search `Releases (doc step)` |
| Show Live Preview click | `rules/core/actionRules.ts` — `Show Live Preview button (doc step)` |
| Lock / hover lock steps | `rules/core/actionRules.ts` — `Lock release icon`, `Hover release row for lock icon` |

---

## Add to Release (entry) — bulk “Select release” UI

| Control | Locator notes |
|---------|----------------|
| Select release (opens list) | `[data-test-id="cs-entry-bulk-add-to-release-search-field"]`, `#releaseSelect` |
| First release in bulk list | `.bulk-release__list-container__right--body--list[data-test-id^="cs-entry-bulk-add-to-release-"]` (dynamic id suffix) |
| Modal body | `[data-test-id="cs-modal-description"]`, `.ReactModal__bulk-release` |

Flow: verify modal → **click Select release** → **click first list row** → Add for Publishing / references.

---

*Add new rows here when you stabilize locators for other modules; keep `module.selectors.ts` authoritative.*

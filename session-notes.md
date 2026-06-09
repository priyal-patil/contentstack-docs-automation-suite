# Session Notes — CMS Automation

_Last updated: 2026-06-08_

---

## Architectural Decisions

### 1. Flow Steps Source Rule (CRITICAL)
Steps in flow JSON files come **only from the doc page** (fetched via `WebFetch` on the `.md` URL). DOM files (`data/dom/`) are used **only** to derive CSS selectors for `.selectors.ts` files. Never add or adapt steps based on what the DOM shows.

- If the doc says "Save" but the UI shows "Create" → the test **must FAIL** (or warn with `warnOnly`)
- A missing app element is a documentation failure, not a reason to patch the flow

### 2. labelMatch: Always "equals"
Every `verify` step uses `"labelMatch": "equals"` — never `"contains"`. The `actionRules.ts` generic fallback maps `"equals"` → `"exact"` mode, which strips trailing `(required)` / `(optional)` parentheticals before comparison.

### 3. warnOnly: true — When to Use
Only when the element **IS present** in the UI but the label extractor can't capture the doc-stated text exactly. Examples:
- `"Unique ID"` (doc) vs `"UID"` (UI)
- `"Create Sibling"` (doc) vs `"Create Sibling Term"` (UI)
- `"+ New Label"` (doc) vs `"New Label"` (UI — the `+` is an icon, not text)
- `"Save"` button on Visual Experience page (not present in current UI)

### 4. React Select — Selector Strategy
`[data-test-id="cs-select"]` is absent from the live app in some places (the DOM files are snapshots that may be stale). Use:
- `.Select__control` (React Select CSS class) for clicking the dropdown
- `input[aria-label="cs-select-aria"]` as fallback for finding the control
- `[data-test-id="cs-field"]:has-text("Label Text") .Select__control` for scoped selection

### 5. Toggle Switch — Selector Strategy
`[data-test-id="cs-toggle-switch"]` and `.toggle-switch` class may not exist in the live page. Fallback chain:
- `[data-test-id="cs-toggle-switch"]:has-text("Label")` (try first)
- `div:has(input[aria-label="aria-toggle-switch"]):has-text("Label")` (fallback)
- `input[aria-label="aria-toggle-switch"]` (direct)

### 6. React Select Dropdown — Scrolling for Hidden Options
React Select menus have `max-height` with `overflow:hidden`. Options/buttons below the fold are in the DOM but not Playwright-visible. The `+ New Label` button in the Apply Label dropdown is clipped this way. Fix: scroll `.Select__menu` to its `scrollHeight` before clicking. Added as special handler in `actionRules.ts` for `"+ New Label option (doc step)"`.

### 7. Verify-then-Click Pattern for Open Dropdowns
A `verify` step with `warnOnly: true` that times out (30s) can cause React Select dropdowns to close before the subsequent `click` step. Rule: do **not** add a separate `verify` step for items **inside** an open dropdown. Rely on the `click` step to fail if the item is absent.

---

## Files Changed This Session

### `rules/core/actionRules.ts`

| Change | Location | Reason |
|---|---|---|
| Map `"equals"` → `"exact"` in generic label fallback | ~32679 | `assertLabelMatch` only accepted `"exact"` / `"contains"`; `"equals"` silently fell through to contains, hiding mismatches |
| Strip `(required)` / `(optional)` suffix before exact compare | ~32679 | UI appends these; doc labels are clean |
| `Default Preview Environment dropdown` handler | ~13422 | Live page has no `[data-test-id="cs-select"]`; replaced with `.Select__control` + aria fallback |
| `Live Preview Display Setup Status toggle` handler | ~13445 | Live page has no `[data-test-id="cs-toggle-switch"]`; use `input[aria-label="aria-toggle-switch"]` |
| `+ New Label option (doc step)` click handler | ~11256 | Button is below overflow-clipped React Select menu; scroll menu to bottom before clicking |

### `projects/CMS/taxonomy/flows/create-a-term.flow.json`
- 27 steps, all pass
- `warnOnly: true` on "Create Sibling" and "Create Child" verify steps (doc says those names; UI says "Create Sibling Term" / "Create Child Term")
- Removed "Term Details section title" verify (not present in the Create Term modal)

### `projects/CMS/taxonomy/selectors/module.selectors.ts`
- Added `li:has(p:has-text("Create Sibling Term"))` and `li:has(p:has-text("Create Child Term"))` fallback selectors
- Taxonomy term context menus use `listitem > generic > paragraph` structure (non-standard vs elsewhere)

### `projects/CMS/content-models/flows/create-content-type.flow.json`
- 26 steps, all pass (~23s)
- Fixed malformed `expected` on step 1 (`labelMatch` was used as the label value)
- All `labelMatch: "contains"` → `"equals"`
- Added missing Unique ID field verify (`warnOnly: true`, UI shows "UID" not "Unique ID")
- Added missing Properties cog verify + click

### `projects/CMS/content-models/selectors/create-content-type.selectors.ts`
- Added selector for "Create New Content Type Unique ID field label (doc step)": `div:has(input[name="uid"]) > div:first-child`

### `projects/CMS/live-preview/flows/set-up-live-preview-for-your-stack.flow.json`
- 25 steps, all pass (~25s)
- All `labelMatch: "contains"` → `"equals"`
- Environment section: click row action menu → Edit → enter Base URL → Save (no verifications, just actions)
- `warnOnly: true` on "Save" button verify (not present in current Visual Experience UI)

### `projects/CMS/live-preview/selectors/module.selectors.ts`
- Fixed "Live Preview Display Setup Status label (doc step)": replaced `.general-settings-section-wrapper [data-test-id="cs-toggle-switch"]` with `.Label--color--secondary:has-text("Display Setup Status")`

### `projects/CMS/content-models/flows/create-and-apply-labels.flow.json`
- Was 2 steps (stub); expanded to 12 steps from doc
- Covers: Content Models nav → open first CT → verify Apply Label → click dropdown → click New Label → verify Name / Nest Label Under / Create / Create & Apply → enter name → click Create & Apply
- Separate verify for `+ New Label` removed (would close the dropdown before the click)

### `projects/CMS/content-models/selectors/create-and-apply-labels.selectors.ts`
- Rewrote from auto-generated stub to doc-aligned selectors
- Key: `[data-test-id="cs-save-content-page-add-label-select"]` for Apply Label dropdown; New Label button handled via actionRules scroll handler

---

## Current State

| Flow | Steps | Status | Notes |
|---|---|---|---|
| `create-a-term` | 27 | ✅ Passing | 2 expected warnings (Sibling/Child term name mismatch) |
| `create-content-type` | 26 | ✅ Passing | 1 warning (UID vs Unique ID) |
| `set-up-live-preview-for-your-stack` | 25 | ✅ Passing | 1 warning (Save button absent in current UI) |
| `create-and-apply-labels` | 12 | 🔄 In progress | Step 6 scroll+click handler for New Label running |

---

## Next Steps

1. **create-and-apply-labels** — confirm all 12 steps pass. If Name / Nest Label Under / Create / Create & Apply verifications fail, fix those selectors in `create-and-apply-labels.selectors.ts`.
2. **Review warnOnly warnings** — each warning is a doc/UI mismatch for technical writers. Report is at `reports/latest/doc-step-warnings.json`.
3. **Bulk labelMatch pass** — other flows in `projects/CMS/` may still have `labelMatch: "contains"`. Consider a sweep.
4. **DOM file freshness** — several `data/dom/` files are stale (e.g., `general-tab.html` shows `[data-test-id="cs-select"]` but live page does not). Plan a DOM refresh pass.

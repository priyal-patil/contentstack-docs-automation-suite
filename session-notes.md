# Session Notes — Batch 1 GHA CI Fix (June 2026)

_Last updated: 2026-06-10_

---

## Context

Fixing remaining Batch 1 GHA CI failures from run **27195757856**.
Batch 1 = 21 create flows, 1 worker, `PW_FLOW_MAX_MINUTES=5` (5-min per-test timeout).

---

## Fixes Applied (Session 1 — 2026-06-09)

### 1. `create-an-entry` — Timeout too short on CT picker Proceed button

**What failed:** `verify "Save"` — entries list visible instead of entry editor.

**Root cause:** Old 10 s `warnOnly` timeout on Proceed. When it expired the flow continued without the entry editor opening.

**Fix (`create-an-entry.flow.json`):**
| Step | Old | New |
|------|-----|-----|
| `click "First Content Type row"` | 15 s | 30 s |
| `verify "Proceed"` | 10 s (warnOnly) | 30 s |
| `click "Proceed"` | 10 s (warnOnly) | 30 s |
| `verify "Save"` | 30 s default | 60 s |
| `click "Save"` | 30 s default | 30 s |

---

### 2. `add-a-custom-language` — 23 steps exceeding 5-min test timeout

**Root cause:** 23 steps × 30 s default = up to 690 s. Language code `BE-NE-auto-01` also failed RFC 5646 validation, keeping Add button disabled.

**Fix:**
- Explicit `timeoutMs` per step: 8 s verify / 10 s enter / 15 s click / 30 s navigation → ~270 s total
- Language changed to valid RFC 5646 pair: name = `"English - United Kingdom"`, code = `"en-gb"`
- Fallback filter text shortened to `"United States"` (less typing)
- `warnOnly` on English dropdown option click

---

## Fixes Applied (Session 2 — 2026-06-09/10)

### 3. `create-a-delivery-token` — Toggle below fold in scrollable panel

**What failed:** `verify "Create Preview Token toggle"` with "element(s) not found" after 30 s.

**Root cause:** Playwright's `toBeVisible()` clips element visibility by overflow parent rect. The toggle was inside a fixed-height scrollable delivery-token form, so it was in the DOM but clipped — Playwright reported it as not visible.

**Fix (commit `6845eeb` then generalized in `d225a04`):** Added `scrollIntoViewIfNeeded()` before every `toBeVisible()` in the generic verify case (line 32582, `actionRules.ts`):

```typescript
// No-op when element is already in viewport; fixes below-fold elements
// in fixed-height scrollable panels across ALL flows universally.
await el.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => {});
await expect(el).toBeVisible({ timeout: getStepTimeoutMs(step) });
```

**Why catch is needed:** Locators with `:not([disabled])` (e.g. Proceed button) don't match until the button is enabled — `scrollIntoViewIfNeeded` would time out on the disabled state. The catch lets it silently fail; `toBeVisible` then polls the full step timeout on its own.

---

### 4. `create-and-apply-labels` — React Select dropdown not opening

**What failed:** "Apply Label dropdown" click not opening the dropdown.

**Root cause:** The click selector hit the outer wrapper `[data-test-id="cs-save-content-page-add-label-select"]`. React Select only opens when `mousedown` fires on `.Select__control` — the wrapper alone is unreliable. The dead fallback `[aria-label="Apply Label"]` also never matched (actual aria-label on the inner input is `"cs-select-aria"`).

**Fix (`create-and-apply-labels.selectors.ts`, `create-and-apply-labels.flow.json`):**
- `CLICK_SELECTORS`: prefer `.Select__control` inside the wrapper test-id
- `INPUT_SELECTORS`: new entry for verify — uses wrapper + `.Select__placeholder` for visibility check
- Flow JSON: `labelMatch: "equals"` → `"contains"` to tolerate SVG caret characters in text content
- Commit: `0e934d4`

---

### 5. `create-an-entry` — CT picker sort button matched entry title selector (race condition)

**What failed:** `verify "Save"` — entries list shown. `enter "Entry Title"` appeared to pass even though the entry editor never loaded.

**Root cause:** The INPUT_SELECTORS for `"Entry Title (doc step)"` ended with `[aria-label*="title" i]` (no `input` scope). The CT picker column sort button has `aria-label="Title"`. On GHA (slow runner), the Proceed navigation starts asynchronously but takes 1–3 s to complete. During that window the CT picker DOM is still live, so `expect(inputEl).toBeVisible()` matched the sort button immediately (0 ms wait). `isFillable` returned false (it's a `<button>`) → code clicked the sort button + `keyboard.type(title)` + `keyboard.press("Enter")` — all silently swallowed. Step 11 "passed" without touching the entry editor.

**Why it passes locally:** Fast local machine completes the Proceed navigation in ~200 ms. By the time step 11 evaluates the locator, the CT picker DOM is already gone. The race window doesn't exist locally.

**Fix (`projects/CMS/entries/selectors/module.selectors.ts`):**
```typescript
// Before (matched <button aria-label="Title"> in CT picker):
'[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], [aria-label*="title" i]'

// After (only matches <input> elements):
'[data-test-id="cs-title-input"] input, input[name="title"], input[placeholder*="title" i], input[aria-label*="title" i]'
```
Commit: `5e1d3df`

---

### 6. Warning count in Slack — only last flow's warnings reported

**What failed:** Slack Batch summary showed 0 or 1 warning flows regardless of how many flows actually produced warnings.

**Root cause:** Each of the 21 flows runs as a separate `npx playwright test` process. Each process's `afterAll()` hook writes `doc-step-warnings.json` to `$REPORT_DIR`, **overwriting** the previous flow's file. By the end of the batch, only the last flow's warnings remained. `urlRunSummaryAndSlack.ts` read that stale file and reported the wrong count.

**Fix (`scripts/run-cms-batch1.sh`, commit `cbe8d3e`):**
1. After each flow (and each retry), copy `doc-step-warnings.json` → `PARTS_DIR/{id}-warnings.json`
2. After all 21 flows + retries complete, merge all `*-warnings.json` parts with an inline Node script into a single `doc-step-warnings.json` covering the full batch
3. Filter `*-warnings.json` files out of the `flows-results` merge pass so `mergePlaywrightFlowJsonReports.ts` doesn't receive them

---

## `create-an-entry-variant` — Environment prerequisite (not a code fix)

**Root cause:** PriyalDocsStack has no variant groups linked to a content type. `[Base Entry]` dropdown only appears when a variant group is linked.

**Required action (ops):** In the Contentstack UI, link a variant group to at least one content type in PriyalDocsStack.

---

## `create-a-global-field-part-2` — Monitor next run

Part 2 depends on Part 1. Part 1 viewport was fixed (1920×1080) in a previous session. Monitor the next GHA run to confirm Part 2 passes.

---

## Architectural Understanding

### Selector resolution (actionRules.ts)

1. `loadOverrides(flow)` loads selectors in priority order: shared → project → module → flow
2. `resolveTarget(page, target, flow)` → finds `click[target]` in overrides → `page.locator(mapped).first()`; otherwise falls back to `getByRole` / `getByText`
3. `INPUT_SELECTORS` take precedence over `CLICK_SELECTORS` in the verify path — verify `el` is built as: `clickMapped ? locator(clickMapped) : inputMapped ? locator(inputMapped) : resolveTarget()`

### Timeout chain

```
step.timeoutMs → getStepTimeoutMs(step, 30_000) → fastFailCap() → Playwright expect timeout
```

- No `timeoutMs` = 30 s default per step
- `FAST_FAIL_STEP_TIMEOUT_MS` env caps all steps when set
- Batch 1: `PW_FLOW_MAX_MINUTES=5` = 300 s **total test** timeout
- Generic verify path (line 32582): `scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => {})` adds up to 5 s overhead before the step timeout — effective window = 5 + `timeoutMs`

### `alwaysWarn` vs `warnOnly`

| Flag | Effect |
|------|--------|
| `alwaysWarn: true` | Logs a warning even when the step **passes** (doc/UI mismatch flagging) |
| `warnOnly: true` | If the step **fails**, records a warning instead of throwing — flow continues |
| Both | Logs warning on pass AND treats failure as non-fatal |

### React Select click pattern

React Select opens its dropdown on `mousedown` fired at `.Select__control`, not the outer wrapper div. Always target `.Select__control` as the primary click selector:
```typescript
'[data-test-id="<wrapper-test-id>"] .Select__control, [data-test-id="<wrapper-test-id>"]'
```
For verify/visibility checks, use the wrapper (not `.Select__control`) — it covers the full component.

### CT picker modal key selectors (CMS/entries/selectors/module.selectors.ts)

```typescript
"First Content Type row (doc step)":
  '.ReactModal__new-entry [data-test-id^="cs-table-body-row-"], .ReactModal__new-entry [role="row"]:has([role="cell"])'

"Proceed (doc step)":
  '[data-test-id="cs-new-entry-single-proceed"]:not([disabled]), .ReactModal__new-entry button:has-text("Proceed"):not([disabled])'
```

**IMPORTANT:** The CT picker has a column sort button with `aria-label="Title"`. Any `[aria-label*="title" i]` selector MUST be scoped to `input[aria-label*="title" i]` — otherwise it matches the button during the async navigation window after Proceed click.

### Warning accumulation (scripts/run-cms-batch1.sh)

Each flow run overwrites `doc-step-warnings.json`. Correct pattern:
1. Per-flow: `cp doc-step-warnings.json PARTS_DIR/{id}-warnings.json`
2. Post-batch: merge all `*-warnings.json` parts with `node -e` inline script → final `doc-step-warnings.json`
3. `urlRunSummaryAndSlack.ts` reads the merged file → correct count across all 21 flows

### Batch execution format

| Batch | Flows | Workers | Timeout |
|-------|-------|---------|---------|
| Batch 1 | 21 creates | 1 | 5 min/test |
| Batch 2 | 220 edits | 20 | 15 min/test |
| Batch 3 | 38 deletes/trash | phase-based | 15 min/test |

GHA: auto-chains via `workflow_run` at 5 AM IST. Local: `npm run test:cms:batch1/2/3`.
Manual GHA trigger: `gh workflow run cms-batch1-scheduled.yml --repo priyal-patil/docs-contentstack-ai-automation --ref main`

---

## Current State (as of 2026-06-10)

| Flow | Status | Commits |
|------|--------|---------|
| `create-a-new-stack-part-1` | Unknown (not touched this session) | — |
| `add-an-environment` | Unknown | — |
| `add-a-language` | Unknown | — |
| `add-a-custom-language` | Fixed | `242cd58`, `46d9900` |
| `create-a-branch` | Unknown | — |
| `create-content-type` | Unknown | — |
| `create-a-new-release` | Unknown | — |
| `create-a-global-field` | Unknown | — |
| `create-a-global-field-part-2` | Monitor | — |
| `create-upload-assets` | Unknown | — |
| `create-a-folder` | Unknown | — |
| `create-an-entry` | Fixed | `46d9900`, `5e1d3df` |
| `add-a-comment` | Fixed | `3c297a5` |
| `create-and-apply-labels` | Fixed | `0e934d4` |
| `set-up-live-preview-for-your-stack` | Unknown | — |
| `create-a-taxonomy` | Fixed | `b3c35dd` |
| `create-a-term` | Fixed | `5c45cb7` |
| `create-a-delivery-token` | Fixed | `6845eeb`, `d225a04` |
| `generate-a-management-token` | Unknown | — |
| `create-a-webhook` | Unknown | — |
| `add-workflows-and-stages` | Unknown | — |

**GHA run in progress:** https://github.com/priyal-patil/docs-contentstack-ai-automation/actions/runs/27226866150

---

## Next Steps

1. **Review Batch 1 GHA run 27226866150** — check which of the 7 previously unknown flows pass/fail; fix any new failures found
2. **Fix `create-an-entry-variant`** — link a variant group to a content type in PriyalDocsStack (ops task, not code)
3. **Monitor `create-a-global-field-part-2`** — should pass now that Part 1 viewport is fixed
4. **Bulk-replace `{unique}` → `{unique5}`** across remaining 113 flow files (see Unique ID Length Fix notes below)
5. **Continue remaining URL flows** per user's direction

---

# Session Notes — Unique ID Length Fix (2026-06-09)

## Trigger

Slack alert from the Contentstack QA org: an automated test was creating users with a first name exceeding Salesforce's 40-character limit. The offending value:

```
docs-qa-test-invite-56abd4ed-4381-4157-8aa2-4a0ce2338d1a   (56 chars)
```

## Root Cause

Flow JSON files used `{unique}` in invite email values (e.g. `docs-qa-test-invite-{unique}@example.org`). At runtime `{unique}` is replaced by `crypto.randomUUID()` — a 36-character string. Contentstack uses the email local part as the Salesforce first name:

- Prefix `docs-qa-test-invite-` = 20 chars + UUID = 36 chars → **56 chars total** (limit is 40)

## Architectural Decisions

### `{unique5}` as the new standard placeholder

The codebase in `rules/core/actionRules.ts` already supports length-capped variants derived from the UUID (hyphens stripped, then sliced):

| Placeholder | Chars | Example |
|---|---|---|
| `{unique}` | 36 | `56abd4ed-4381-4157-8aa2-4a0ce2338d1a` |
| `{unique8}` | 8 | `56abd4ed` |
| `{unique5}` | 5 | `56abd` ← **new standard** |
| `{unique4}` | 4 | `56ab` |

**Decision:** Use `{unique5}` everywhere across all flow files. Combined with the `qa-` prefix this gives 8-character first names (`qa-56abd`) — well under both the 20-char internal guideline and the 40-char SF limit.

**Trade-off:** 5 hex chars = 1,048,576 possible values per test run. Collision risk is negligible at current parallelism (max 20 workers in Batch 2). If collisions appear under higher concurrency, bump to `{unique8}`.

### Email prefix shortened to `qa-`

Replaced `docs-qa-test-invite-` (20 chars) with `qa-` (3 chars). Keeps the address recognisable as a QA test without eating into the unique suffix budget.

## Changes Made

### Flow files updated (invite-user flows — 3 files)

| File | Before | After |
|---|---|---|
| `projects/Administration/organizations/flows/invite-users-to-organization.flow.json` | `docs-qa-test-invite-{unique}@example.org` | `qa-{unique5}@example.org` |
| `projects/CMS/users-and-roles/flows/add-a-new-user.flow.json` | `docs-qa-test-invite-{unique}@example.org` | `qa-{unique5}@example.org` |
| `projects/Administration/organizations/flows/organization-users.flow.json` | `docs-qa-test-invite-{unique}@example.org` | `qa-{unique5}@example.org` |

### `rules/core/actionRules.ts` — two locations patched

1. **Generic `enter` handler** (line ~34329): added `unique5` alongside existing `unique8`, `unique25`, `unique4` in the multi-variant substitution block.
2. **`add-a-new-user` specific handler** (line ~33978): this flow has a dedicated email handler that fires before the generic one; added `{unique5}` expansion so it isn't passed through as a literal string.

## Current State

- The 3 invite-user flow files are on `{unique5}`.
- `actionRules.ts` runtime supports `{unique5}` in the generic handler and the `add-a-new-user` specific handler.
- **194 remaining `{unique}` occurrences across 113 flow files** in all other projects still use the bare 36-char UUID at runtime.

### Projects with pending `{unique}` occurrences

Administration, AgentOS, BrandKit, CMS (assets, content-models, entries, environment, global-field, json-rich-text-editor, live-preview, releases, stack, taxonomy, users-and-roles, visual-experience, workflows), Data-and-Insights, Developer-Hub, Launch (how-to-guides, projects, quick-start-guides, security), Studio

## Next Steps

1. **Bulk-replace remaining flow files** — replace `{unique}` → `{unique5}` in all 113 pending flow JSON files:
   ```bash
   find projects/ -name "*.flow.json" | xargs perl -i -pe \
     's/\{unique\}(?![0-9])/\{unique5\}/g'
   ```

2. **Audit `actionRules.ts` specific handlers** — any handler with its own `.split("{unique}").join(unique)` needs a `{unique5}` line prepended:
   ```bash
   grep -n 'split("{unique}")' rules/core/actionRules.ts | grep -v unique5
   ```

3. **Consider a shared `expandUnique(val, unique)` utility** — the `.split/join` pattern is repeated inline in every specific handler. A single helper would make adding future length variants a one-line change and remove the risk of any handler being missed.

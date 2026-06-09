# Session Notes — Batch 1 GHA CI Fix (June 2026)

_Last updated: 2026-06-09_

---

## Context

Fixing remaining Batch 1 GHA CI failures from run **27195757856**.
Batch 1 = 21 create flows, 1 worker, `PW_FLOW_MAX_MINUTES=5` (5-min per-test timeout).

---

## Fixes Applied This Session

### 1. `create-an-entry` — Timeout too short on CT picker Proceed button

**What failed:** `verify "Save"` at actionRules.ts:22240 — the entries list was visible instead of the entry editor. Both attempt 1 and retry show the plain entries list in screenshots at failure time.

**Root cause:** After `+ New Entry` opens the content type picker modal, clicking the first CT row needs time for the Proceed button to become enabled (selector `:not([disabled])`). The old 10 s timeout on `verify/click "Proceed"` (both `warnOnly`) was too short for GHA. When Proceed's warnOnly timer expired, the flow continued without the entry editor ever opening. The title input was never found; somehow the test still reached `verify "Save"` which then failed on the entries list.

The `enter "Entry Title"` action uses `.fill()` only (confirmed actionRules.ts:34953) — no Enter key pressed — so it does NOT cause navigation away from the entry editor.

**Fix applied (`projects/CMS/entries/flows/create-an-entry.flow.json`):**
| Step | Old timeout | New timeout |
|------|-------------|-------------|
| `click "First Content Type row"` | 15 s | 30 s |
| `verify "Proceed"` (warnOnly) | 10 s | 30 s |
| `click "Proceed"` (warnOnly) | 10 s | 30 s |
| `verify "Save"` | none (30 s default) | 60 s |
| `click "Save"` | none (30 s default) | 30 s |

---

### 2. `add-a-custom-language` — 23 steps exceeding 5-min test timeout

**What failed:** Test hard-timed-out at 5 minutes (Batch 1 cap). The fallback language dropdown (click → type "English - United States" → click option) was the slowest block. Also, language code `BE-NE-auto-01` is not a valid RFC 5646 locale — Contentstack real-time validation rejects it, causing the Add button to stay disabled.

**Root cause:** 23 steps × 30 s default timeout = up to 690 s worst case. No explicit `timeoutMs` on any step meant every step used the full 30 s fallback.

**Fix applied (`projects/CMS/language/flows/add-a-custom-language.flow.json`):**
- Added explicit `timeoutMs` per step: 8 s for verify / 10 s for enter / 15 s for click / 30 s for navigation
- Total estimated time: ~270 s (under the 300 s cap)
- Fallback language filter text shortened: `"English - United States"` → `"United States"` (less typing)
- Language data changed to valid RFC 5646 pair: name = `"English - United Kingdom"`, code = `"en-gb"`
- `warnOnly` + `timeoutMs: 10000` on the English dropdown option click

---

## `create-an-entry-variant` — Environment prerequisite issue (not a code fix)

**What failed:**
- Attempt 1: `verify "[Base Entry]"` (step 6, 90 s) — entry editor opened but no `[Base Entry]` variant scope dropdown visible
- Retry: `click "First Entry row"` (step 5, 120 s) — entries list rows not found

**Root cause:** PriyalDocsStack (DEFAULT_STACK from `.env`) does not have any variant groups linked to a content type. The `[Base Entry]` dropdown only appears in the entry editor when variant groups are linked. This is an environment/configuration gap, not a code bug.

**Required action:** In the Contentstack UI, link a variant group to at least one content type in PriyalDocsStack.

---

## `create-a-global-field-part-2` — Monitor next run

Part 2 depends on Part 1. Part 1 was failing due to viewport (1280 px, fixed to 1920×1080 in a previous session). Monitor next GHA run to confirm Part 2 passes.

---

## Architectural Understanding

### Selector resolution (actionRules.ts)

1. `loadOverrides(flow)` loads selectors in priority order: shared → project → module → flow
2. `resolveTarget(page, target, flow)` → finds `click[target]` in overrides → `page.locator(mapped).first()`; otherwise falls back to `getByRole` / `getByText`
3. Generic click handler (lines 18144–18152): if `step.nth` is defined, uses `page.locator(mapped).nth(step.nth)` directly; otherwise calls `resolveTarget`

### Timeout chain

```
step.timeoutMs → getStepTimeoutMs(step, 30_000) → fastFailCap() → Playwright expect timeout
```

- No `timeoutMs` = 30 s default per step
- `FAST_FAIL_STEP_TIMEOUT_MS` env caps all steps when set
- Batch 1: `PW_FLOW_MAX_MINUTES=5` = 300 s **total test** timeout (sum of all steps must fit)

### How `enter` action fills inputs (actionRules.ts:34935–35007)

For a step with an `INPUT_SELECTORS` match:
1. Locates via mapped selector (e.g. `[data-test-id="cs-title-input"] input`)
2. Calls `inputEl.fill(val)` — no Enter key pressed
3. Exception: `"Version name input"` presses Enter after fill; non-fillable (div-based) elements press Enter after `keyboard.type()`

### CT picker modal key selectors (CMS/entries/selectors/module.selectors.ts)

```typescript
"First Content Type row (doc step)":
  '.ReactModal__new-entry [data-test-id^="cs-table-body-row-"], .ReactModal__new-entry [role="row"]:has([role="cell"])'

"Proceed (doc step)":
  '[data-test-id="cs-new-entry-single-proceed"]:not([disabled]), .ReactModal__new-entry button:has-text("Proceed"):not([disabled])'
```

Proceed selector uses `:not([disabled])` — only matches when the CT row has been selected (row click enables it). On slow GHA networking, this can take > 10 s.

### Batch execution format

| Batch | Flows | Workers | Timeout |
|-------|-------|---------|---------|
| Batch 1 | 21 creates | 1 | 5 min/test |
| Batch 2 | 220 edits | 20 | 15 min/test |
| Batch 3 | 38 deletes/trash | phase-based | 15 min/test |

GHA: auto-chains via `workflow_run` at 5 AM IST. Local: `npm run test:cms:batch1/2/3`.

---

## Next Steps

1. **Push and validate** — push current commits, trigger Batch 1 GHA run, confirm `create-an-entry` and `add-a-custom-language` now pass
2. **Fix `create-an-entry-variant`** — link a variant group to a content type in PriyalDocsStack (ops task, not code)
3. **Monitor `create-a-global-field-part-2`** — confirm it passes after Part 1 viewport fix
4. **If `create-an-entry` still fails** — add a `waitForURL` or `waitForSelector` for the entry editor DOM after clicking Proceed, before the title entry step, to guarantee the editor has loaded
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

## Changes Made This Session

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

1. **Bulk-replace remaining flow files** — replace `{unique}` → `{unique5}` in all 113 pending flow JSON files. Safe to do with a `perl` one-liner scoped to the bare `{unique}` pattern (not `{unique8}` / `{unique4}` etc.):
   ```bash
   find projects/ -name "*.flow.json" | xargs perl -i -pe \
     's/\{unique\}(?![0-9])/\{unique5\}/g'
   ```

2. **Audit `actionRules.ts` specific handlers** — any handler with its own `.split("{unique}").join(unique)` that fires for a target in the updated flow files needs a `{unique5}` line prepended. The generic handler already covers targets without a specific handler. Search:
   ```bash
   grep -n 'split("{unique}")' rules/core/actionRules.ts | grep -v unique5
   ```

3. **Consider a shared `expandUnique(val, unique)` utility** — the `.split/join` pattern is repeated inline in every specific handler. A single helper would make adding future length variants a one-line change and remove the risk of any handler being missed.

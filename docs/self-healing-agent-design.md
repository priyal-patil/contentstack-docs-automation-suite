# Self-Healing Docs QA Agent — Design

Deliverable #1 of the self-healing agent spec: Step 0 answers **verified against this repo**, plus the
decisions taken. Written before the implementation so the assumptions are auditable.

## Step 0 — verified answers (not assumptions)

| # | Question | Verified answer |
|---|---|---|
| 1 | Test framework | Playwright `^1.58.2` + TypeScript (`ts-node`). **Not** sharded: one generic spec `tests/flows.spec.ts --project=flows`, filtered with `--grep "Project=BrandKit"`, parallelised by `PW_WORKERS` (3 in CI). |
| 2 | Flow definitions | `projects/<Project>/<module>/flows/<flow-id>.flow.json`. Declarative steps `{action, target, value?, expected?, timeoutMs?}`. Doc→flow mapping is **explicit**: each flow carries `source` = its doc URL. BrandKit = 15 flows over 3 modules (`get-started`, `voice-profiles`, `knowledge-vault`). |
| 3 | Failure report schema | `reports/<dir>/doc-step-failures.json`, typed `DocStepFailure` in `core/docStepFailureReporter.ts`: `documentUrl`, `flowId`, `stepIndex`, `stepNumber`, `action`, `target`, `value?`, `errorMessage` (full Playwright locator log), `missingElementSummary?`, `screenshotRelativePath?`, `step`. Siblings: `flows-results.json`, `unified-report.json`, per-URL HTML. |
| 4 | Slack | `scripts/urlRunSummaryAndSlack.ts` + `core/report/slackDocsQaMessages.ts` post a URL run summary; `brandkit-scheduled.yml` falls back to a plain `chat.postMessage` curl. The message is a **summary** — the artifact is the real data source. |
| 5 | Selector authoring | **Separated already.** `projects/<Project>/<module>/selectors/<flow-id>.selectors.ts` exports `CLICK_SELECTORS` / `INPUT_SELECTORS` as `Record<string,string>`, keyed by the *exact* `target` string from the flow JSON. Values are comma-separated CSS fallback chains. |
| 6 | Git convention | PR-based. `origin/main` + feature branches; history shows Conventional Commits scoped by project/module (`fix(cms-global-field): …`). |

### Two structural facts that shaped the design

**Selector resolution is a last-wins layered merge.** `loadOverrides()` in `rules/core/actionRules.ts`
merges, in order: shared common → legacy common → `project.selectors.ts` → `module.selectors.ts` →
**`<flowId>.selectors.ts`** → special cases. The merged map is then consulted ahead of a large inline
fallback map (`actionRules.ts:1743`: `click[target] || CLICK_SELECTORS[target]`).

Consequence: **the flow-level file is the highest-precedence ordinary layer.** The agent only ever
writes there. It never edits `actionRules.ts` (36,775 lines / 1.9 MB).

**Coverage is total.** All **373** BrandKit step targets resolve to a literal selector key: 233 in
flow-level files, 140 in `actionRules.ts`, **zero** unaddressable. Targets currently served by the
global map are healed by *creating* a flow-level override, which wins without touching the big file.

### Already built — reduces scope

`core/executor.ts:466-497` already, on every step failure: captures a screenshot, dumps
`page.content()` to `reports/<dir>/flow-screenshots/<flow>-step-N.html`, **and** persists a copy to
`data/dom/<Project>/<module>/<flow>-step-N-failure.html` — commented "for cross-run retry lookup".
`core/executor.ts:356` already greps that saved DOM for the target label and logs candidate snippets.
`data/dom/BrandKit/` holds 20+ hand-curated reference snapshots cited in the selectors files' headers.

So the spec's "DOM snapshot must be an artifact that survives process restarts" is **already
satisfied**. What was missing, and is what this agent adds: the *matching* layer, the retry
orchestration, the classification, and the write-back.

`grep -riE "self.?heal|healing|recover.?element|domMemory"` returns nothing — the healing logic itself
is greenfield.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Agent form | Deterministic TS core + optional LLM escalation | Rule-based matching is auditable and free; the LLM is consulted only for steps rules cannot resolve. |
| **Acceptance gate** | **Empirical — replay in a real browser** | No candidate is ever trusted on assertion alone. A heal counts only if the action succeeds *and* the remainder of the flow passes. This is what makes LLM escalation safe: the model proposes, the browser decides. |
| Write-back | PR only; **append** to the fallback chain | Appending cannot break a currently-passing locator — the old selector stays first. A bad heal is inert, not destructive. One commit per doc/flow. |
| Replay state | Classify idempotent vs destructive; cap destructive | Replaying against the live app mutates real data. Destructive flows get 1 attempt and a preflight fixture; idempotent flows get the full budget. |
| Attempt budget | Per `(flowId, stepIndex)` | Healing step 3 then failing at step 5 gives step 5 its own fresh budget. |
| Commit message | `fix(<project>-<module>): auto-heal selector for <doc title>` | Satisfies both the spec's "doc title" intent and the repo's live Conventional Commits convention. |
| Docs | Never modified | The agent's write path is restricted to `projects/**/selectors/*.selectors.ts`; enforced in `selectorLayers.ts`. |

## Architecture

```
reports/<dir>/doc-step-failures.json
  └─ reportParser        → HealTarget[]  (flow, step, doc URL, current selector, snapshot paths)
       └─ flowClassifier → idempotent | destructive  (sets the attempt budget)
            └─ repairLoop  (per target, bounded, stateful, serial per flow)
                 ├─ domExtract      live page + saved snapshot → StructuredElement[]
                 ├─ elementMatcher  5 tiers, cheapest first, confidence-scored
                 ├─ [escalate]      LLM, only if every rule tier misses
                 ├─ EMPIRICAL GATE  perform action → run remaining steps
                 └─ auditLog        every strategy tried + score, per attempt
                      ├─ HEALED          → selectorLayers.appendCandidate() → commit → PR
                      └─ GENUINE_FAILURE → genuineFailure.build() (re-fetch doc) → Slack + GH issue
```

Matching tiers, cheapest to most expensive (`elementMatcher.ts`):

1. Original selector still resolves — `1.0`. Catches transient render flake.
2. Stable attributes from the snapshot: `data-test-id` `0.95`, `aria-label` `0.90`, `name` `0.88`,
   role+exact text `0.85`. Survives class/id churn.
3. Structural similarity: identical DOM path `0.80`; same tag + path similarity ≥ 0.7 + similar
   surrounding text `0.65`.
4. Fuzzy accessible-name match against the doc's expected label (normalised Levenshtein ≥ 0.75).
5. Nothing clears the threshold (default `0.60`) → not-found for this attempt.

The matcher is a **pure function over `StructuredElement[]`**. Snapshots are parsed offline with
`cheerio` (already a dependency), so the whole matcher is unit-testable from HTML fixtures with no
browser — which is why the tests in `tests/healing/` can cover the riskiest component directly.

## The actual goal: find drift in the document

Selector healing is not the product. It exists to stop stale locators from drowning the signal that
*is* the product: **places where the documentation no longer matches the app**, so technical writers
can fix them.

That means every finding has to name which of three sources is wrong (`core/healing/docVerifier.ts`):

| Doc says | Flow JSON says | App has | Verdict | Action |
|---|---|---|---|---|
| X | X | X | agree | pass |
| X | X | **Y** | `doc-confirms-flow` | **the doc is stale** → report to writers |
| **X** | **Y** | X | `doc-matches-app` | **our flow JSON is stale** → fix the flow definition, no doc change |
| X | X | *missing* | `doc-confirms-flow` + missing | step cannot be performed → **failure** |
| — | — | — | `doc-mentions-neither` | needs a human |

### Non-negotiable: the document is the spec for the flow JSON

A flow JSON is a transcription of a document. So when the two disagree, the JSON is corrected **to the
document's wording — never to the app's**. Copying the app's text would quietly retrain the test to
assert whatever the app currently does, destroying the very signal the agent exists to produce.

Enforced structurally, not by convention:

- `exactPhraseFromDoc()` is the only sanctioned source of a written value, and it returns the
  document's own casing and punctuation.
- `isSourcedFromDoc()` gates every proposed edit: the new value must appear verbatim in the document,
  or the edit is discarded and the drift is merely reported.
- If the app shows wording the document has never contained, the verdict is `doc-mentions-neither` and
  **no** flow update is proposed — that is drift for a human, not a licence to edit the test.

This is not a hypothetical distinction. The app reports `"new content type"` where the doc says
`"New Content Type"`; sourcing from the app would have written the app's lower-cased string into the
flow definition. Locked down by tests in `tests/healing/elementMatcher.unit.spec.ts`
("app-only wording is NEVER proposed as a flow update").

**Precedence matters.** Check whether the doc contains the *flow's* expected wording before checking
the app's. The app's wording is often a substring of the doc's — "New Content Type" inside
"+ New Content Type" — so testing the app's first would report the doc as matching the app and
"fix" a flow JSON that was correct.

Severity follows the shape of the difference, not its location:

- a wrong, renamed or misplaced **name** → **warning**; report it and carry on
- the step **cannot be performed at all** → **failure**; a reader following the page gets stuck

The framework logs both as `warnOnly`, so this split is applied in the report rather than inherited.

**Confidence is calibrated to the evidence.** "The doc is out of date" is asserted only when *both*
sides are known — the doc's wording and the app's. For a plain "not found" only one side is known, and
the cause could equally be an app change, a renamed control, or the step running on the wrong screen;
those are reported as `NOT FOUND IN APP — VERIFY`. Overclaiming here would send writers to edit pages
that are correct, which costs more trust than it saves effort.

Worked example, verified against the live doc:

```
Doc:       "click the + New Content Type button"     ← quoted in the report as evidence
Flow JSON: expects "+ New Content Type"              ← agrees with the doc
App:       renders "New Content Type"                ← dropped the "+"
Verdict:   DOC OUT OF DATE — update the doc wording. Flow JSON left untouched.
```

## Report categories

The run report separates findings by what a human has to do about them:

| Category | Source | Meaning |
|---|---|---|
| `healed` | `doc-step-failures.json` | Locator drift. Fixed and verified automatically; no human action. |
| `genuine-failure` | `doc-step-failures.json` | The documented element does not exist anywhere. Doc or app is wrong. |
| **`doc-drift warning`** | **`doc-step-warnings.json`** | The app did not match the doc but the flow tolerated it and continued. Nothing failed, nothing is healable — a writer decides whether the doc or the app is wrong. |
| `environment-failure` | either | Session expired / page never rendered. Infrastructure noise; excluded from drift findings. |
| `skipped` | — | Not safely attemptable (e.g. preflight index misalignment). |

The warnings category exists because **a green run can hide real doc drift**. Flows mark these steps
`alwaysWarn` / `warnOnly` and fall back to an alternative route, so nothing fails and nothing was
reported. `create-a-brand-kit` is the worked example: the doc says Brand Kit appears in the left
navigation, the app only exposes it via the Organization dashboard tile, and the flow warns and takes
the tile. Real examples recovered from `reports/optimizely-run-25`:

```
step 55 — Doc container mismatch: expected within "Left Navigation", but target resolved to "Content Models".
step 57 — Label validation failed: expected "+ New Content Type" (contains), got "new content type".
```

Raw warnings embed a full Playwright failure (ANSI codes, `Call log:`, the whole selector chain), so
`summariseWarning()` condenses each to one line — the audience is a technical writer, not a test
engineer. The report is written even when nothing failed, since warnings are the only output in that
case.

## Genuine-failure criteria

Reported as genuine only when, after the budget is exhausted: no candidate ever cleared the
threshold in any attempt, **and** no plausible structural or textual match exists anywhere on the
page (whole-document search, not just near the old location). Before reporting, the doc source is
re-fetched via the `contentstack-docs` MCP / the repo's source of truth, so the output can state
precisely what the doc claims versus what the app has.

## Backtest: measured on real historical failures

Before any live run, the matcher was run offline against **386 real saved failure DOMs** already in
`data/dom/**/*-step-N-failure.html` — each one the actual page state when that step failed in a past
run. No credentials, no browser, no writes.

| Result | Count |
|---|---|
| Candidate found → would have been auto-healed | **116 (30%)** |
| No candidate found | 270 |

Winning tier for the 116: `stable-attribute` **83**, `fuzzy-text` **33**, `structural` **0**.

Two things worth recording:

- **The cheap, high-precision tiers do all the work.** `structural` never wins on real data now that it
  requires name corroboration — the same guard that fixed the false positive the unit tests caught.
  That safety property holds outside the fixtures, not just in them.
- **A keyword-based triage of the remaining 270 was attempted and discarded as unsound.** These
  snapshots are up to 25 MB because the app inlines its entire JS bundle, so grepping for phrases like
  "something went wrong" matches the bundled i18n string table and React component definitions rather
  than rendered UI. Any offline claim about *why* those 270 failed would be unreliable, so none is made
  here.

What the backtest did establish is that a third category exists beyond "locator drift" and "doc drift":
failures where the session had expired or the page never rendered. Those are detected at heal time in
the live browser — where the URL and a rendered-body measurement *are* trustworthy — and bucketed as
`environment-failure` so they never reach the technical writers' drift report. See
`environmentFailure()` in `repairLoop.ts`.

## Known limitations

- Some of the 140 globally-mapped targets are consumed inside bespoke imperative branches in
  `actionRules.ts` rather than the generic `mapped` lookup. A flow-level override may not intercept
  those code paths. The empirical gate catches this automatically: the replay fails, so the agent
  reports rather than claiming a false heal. Such targets are logged as `override-ineffective`.
- Destructive flows are capped at 1 attempt, so genuine locator drift in a delete flow may still need
  a human. Deliberate: correctness over coverage.
- Replaying an idempotent create flow leaves an orphaned object in the QA org per attempt (names are
  `{unique}`-templated, so replays never collide — they accumulate). A healing run over the full
  BrandKit set can therefore add a handful of AUTO-* rows.
- `enter` steps are applied with simple `{unique5}`/`{unique}` substitution rather than the full
  templating in `actionRules.ts`; steps using richer templating are reported rather than guessed at.

## Infrastructure

`brandkit-scheduled.yml` runs on `ubuntu-latest` in the `mcr.microsoft.com/playwright:v1.58.0-noble`
container — not the self-hosted runner in `~/actions-runner-docs-contentstack`. The healing workflow
uses the same setup, so healing runs do **not** contend with scheduled runs for a single machine.

Automatic triggering after a failed run is wired but gated: `workflow_run` fires only when the
upstream conclusion is `failure` **and** the repository variable `HEALING_AUTO_TRIGGER=1`. Until that
is set, the agent is manual-only via `workflow_dispatch`.

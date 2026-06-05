# Session Notes — CMS Automation

_Last updated: 2026-06-05_

---

## 1. Architecture — 3-Batch CMS Format

### Batch 1 — Create/Setup
- **Script:** `scripts/run-cms-batch1.sh`
- **Workers:** 1 (strict sequential order)
- **Flows:** 21 create/setup flows in fixed order
- **Order:** create-a-new-stack-part-1 → add-an-environment → … → add-workflows-and-stages
- **GHA:** `cms-batch1-scheduled.yml` (timeout 180 min, 5 min/flow)

### Batch 2 — Edit/Update/Export/Import
- **Script:** `scripts/run-cms-batch2.sh`
- **Workers:** 20 shared pool — true idle-browser reuse (when environment's 1 flow finishes, its worker immediately picks up next queued flow)
- **Flows:** 220 across 20 modules (CRUD order, skip Batch 1 + deletes)
- **Modules:** environment(1), language(3), branches(3), stack(7), content-models(41), global-field(9), assets(12), entries(30), json-rich-text-editor(11), releases(8), users-and-roles(5), live-preview(6), content-modeling(11), search(12), security(6), tokens(2), webhook(5), workflows(19), taxonomy(8), visual-experience(21)
- **Skip mechanism:** `--grep-invert` anchored with `$` on test titles. `CMS_SKIP_FLOW_IDS` only works with `CMS_SEQUENTIAL_MODULE_ORDER=1`; with `=0` (individual flows) only `--grep-invert` works.
- **GHA:** `cms-batch2-scheduled.yml` (timeout 360 min, 5 min/flow, 3 min element timeout)

### Batch 3 — Delete + Trash
- **Script:** `scripts/run-cms-batch3.sh`
- **Workers:** Variable per phase (1–7) — phases run sequentially, workers within phase run in parallel
- **Flows:** 38 (30 delete + 8 trash)
- **Phase order (LIFO):** content(5w) → taxonomy(1w, term→taxonomy) → structure(2w) → releases(2w) → services(3w) → branches(1w, alias→branch) → env/lang(2w) → users(2w) → stack(1w, leave→transfer→delete, ALWAYS LAST) → trash(7w, all independent)
- **GHA:** `cms-batch3-scheduled.yml` (timeout 180 min)

---

## 2. Combined Workflow — Single Cron

**`cms-full-scheduled.yml`** — single GHA workflow with 3 jobs:
```
batch1 → batch2 (needs: batch1, if: always()) → batch3 (needs: batch2, if: always())
```
**`cms-full-trigger.yml`** — cron at **3:00 AM IST (21:30 UTC)** daily, fires `repository_dispatch: cms-full-5am-ist`

`if: always()` = batch2/3 run even if previous batch has flow failures (replicates current `workflow_run: completed` behaviour). Individual batch workflows remain for manual re-runs.

---

## 3. CMS Docs Audit

**`cms-docs-audit-scheduled.yml`** — triggers after `cms-full-scheduled.yml` completes.

- Checks **503 CMS URLs** from `data/docs-urls.csv` for broken links, broken images, old logo, table structure
- **Workers:** 10 (network-bound; >20 risks docs server rate limits)

### Critical: Two-Phase Approach (permanent fix for scannedDocs=0)

**Root cause of scannedDocs=0:** With multiple workers + `test.describe.parallel`, Playwright assigns the top-level Summary test to any *idle* worker while other workers are still writing per-doc JSON files. Summary reads 0 files → 0 counts.

**Fix:** Two sequential playwright invocations:
```bash
# Phase 1: all 503 per-doc tests (parallel, 10 workers)
npx playwright test tests/docs-audit.spec.ts --project=docs-audit --grep "Audit:"

# Phase 2: Summary only (1 worker, AFTER all per-doc files written)
PW_WORKERS=1 npx playwright test tests/docs-audit.spec.ts --project=docs-audit --grep "Docs Audit Summary"
```

**Artifacts uploaded:** `cms-broken-links.csv` (source_page, broken_url, anchor_text, http_status, reason) + `cms-broken-images.csv`

**Slack message format:**
```
✅/❌ CMS Docs Audit — success | Duration: Xm Ys
• Total URLs checked   : 503
• Broken links (total) : N across M pages
• Broken images (total): N across M pages
• Old logo detected    : N pages
⬇️ Download: cms-broken-links.csv, cms-broken-images.csv
```

---

## 4. Key Code Fixes

### Create New Stack — actionRules.ts
- **Fix 1 (line ~19870):** `isVisible()` → `waitFor({state:'visible', timeout:10s})` — prevents race condition where `+New Stack` dropdown animation hasn't finished, causing fallthrough to wrong handler
- **Fix 2 (line ~20373):** Generic `Create New` tail guard now checks for content-type modal before calling `waitForCreateContentTypeForm()` — prevents 30s timeout on stack/global-field modals

### Playwright Config
- `viewport: null` + `--start-maximized` added to `default` and `data-insights-chain` projects (was only on `flows`)
- `PW_ACTION_TIMEOUT_MINUTES` → `actionTimeout` on flows project (0 = use test timeout, Batch 1 unaffected)

### Slack Header Fix
- `urlRunSummaryAndSlack.ts`: header now derived from `CMS_BATCH_DURATION_LABEL` or `CMS_SLACK_TITLE` env var. Falls back to `"CMS Batch 1 — URL run summary"` when neither set.

---

## 5. Daily Schedule

```
3:00 AM IST  cms-full-trigger.yml fires
  ├─ Batch 1  ~15 min  (21 flows, 1 worker)
  ├─ Batch 2  ~29 min  (220 flows, 20 workers)
  └─ Batch 3  ~32 min  (38 flows, variable)
~4:20 AM IST  cms-docs-audit-scheduled.yml fires
  └─ Docs Audit  ~45 min  (503 URLs, 10 workers, 2-phase)
~5:05 AM IST  ALL DONE
```

---

## 6. Local Commands

```bash
# Full CMS run (say "Run CMS", "Run complete CMS", "Run CMS headless/headed"):
npm run test:cms:full           # headless — Batch 1 → 2 → 3
npm run test:cms:full:headed    # headed

# Individual batches:
npm run test:cms:batch1         # or :batch1:headed
npm run test:cms:batch2         # or :batch2:headed
npm run test:cms:batch3         # or :batch3:headed

# Docs audit (two-phase, correct counts):
npm run test:docs-audit:cms
```

---

## 7. Known Issues / Next Steps

### Batch 1 Flow Failures
Many Batch 1 flows still fail due to selector/flow issues:

| # | Flow | Issue |
|---|------|-------|
| 1 | `create-a-new-stack-part-1` | actionRules fix applied — needs re-run to verify |
| 5 | `create-a-branch` | Branches nav click scroll/visibility issue |
| 6 | `create-content-type` | Cascade from flow 1 |
| 9 | `create-a-global-field-part-2` | Depends on part 1 state |
| 14 | `create-and-apply-labels` | Only 2 steps — full rewrite needed |
| 12 | `create-an-entry` | Only 8 steps — needs expansion |
| 21 | `add-workflows-and-stages` | Settings → More → Settings fallback |
| 18 | `create-a-delivery-token` | Step 26 scroll + selector fix |
| 15 | `set-up-live-preview` | Default Preview Environment dropdown |
| 16 | `create-a-taxonomy` | Wrong modal names |

### add-a-language Step 15 (French - France)
Step clicks correctly but still shows as failed. Root cause not yet investigated — likely selector timing after typing in search box.

### Separate 3 Cron Jobs
`cms-batch1-trigger.yml` (5 AM IST), `cms-batch2-scheduled.yml`, `cms-batch3-scheduled.yml` still exist alongside `cms-full-trigger.yml` (3 AM IST). Once `cms-full-scheduled.yml` confirmed working → disable the 3 individual workflows.

### Docs Audit Verification
Two-phase fix applied. Local verification run in progress — awaiting results to confirm `scannedDocs=503`.

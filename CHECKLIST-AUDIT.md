# Checklist & Style Guide audit

Runs the **Doc Testing Checklist** (`Checklist` tab of *Doc Testing Checklist and Log*)
and the mechanically-checkable rules of the **Contentstack Technical Documentation
Style Guide v1.0.3** against published doc pages.

This is a *page* audit, not a flow audit. It answers "does this page follow our own
documentation rules", where `flows.spec.ts` answers "do the documented steps work".

Source documents are stored at `~/Desktop/Priyal/docs-style-guide/`.

## Run it

```bash
# one page
REPORT_DIR=reports/checklist-demo \
DOCS_CHECKLIST_URL="https://www.contentstack.com/docs/administration/manage-preferences" \
npx playwright test tests/docs-checklist.spec.ts --project=docs-checklist

# a whole project from data/docs-urls.csv
npm run test:docs-checklist:administration

# build the HTML + JSON report from whatever ran
npm run report:checklist

# both, in one go
npm run checklist:administration
```

| Env | Purpose |
|---|---|
| `DOCS_CHECKLIST_URL` | Audit exactly one URL (skips the CSV filter). |
| `DOCS_CHECKLIST_PROJECT` | Filter `data/docs-urls.csv` by project column (e.g. `Administration`). |
| `DOCS_CHECKLIST_LIMIT` | Cap the number of URLs — useful for a smoke run. |
| `REPORT_DIR` | Where per-doc JSON and the report are written. Default `reports/latest`. |
| `CL_H1_PX` / `CL_H2_PX` / `CL_H3_PX` / `CL_BODY_PX` / `CL_CODE_PX` | Override the checklist's pinned typography values (see the caveat below). |
| `CL_LOAD_BUDGET_MS` | Load-time budget for CL-19.1. Default 4000, from checklist item 19.0. |
| `CL_MAX_LINKS` / `CL_LINK_CONCURRENCY` | Bound the link-status sweep. |

## Layout

```
core/checklist/
  types.ts        status vocabulary + the per-doc result shape
  registry.ts     every rule, including the ones automation cannot judge
  pageFacts.ts    one in-page evaluate() that collects everything static checks need
  domChecks.ts    pure functions: facts -> findings (unit testable, cannot flake)
  proseChecks.ts  style-guide text rules
  runChecklist.ts interactive checks (links, hover, responsive, keyboard, scroll-spy) + assembly
tests/docs-checklist.spec.ts     one test per URL
scripts/generateChecklistReport.ts   HTML + JSON report
```

## Status vocabulary

| Status | Meaning |
|---|---|
| `PASS` | Verified compliant. |
| `WARN` | Verified non-compliant — a finding for the writer. |
| `FAIL` | The page could not be loaded, so nothing could be evaluated. |
| `NA` | The rule does not apply (no code blocks, no tables, no images…). |
| `NOT_CHECKED` | The rule is real but automation cannot judge it. Always reported, never hidden. |

**Findings never fail the run.** Only an unloadable page produces `FAIL`
(DOCS-AUTOMATION-COMMON.md rule 5). A capitalisation nit must not turn a batch red.

## What is deliberately not automated

Reported every run as `NOT_CHECKED` so the report states its own coverage:

| Rule | Why |
|---|---|
| `CL-4.5` | Screenshot matches the live app / is unblurred / masks private data — needs a vision model or a human. |
| `CL-13.1` | Documented steps execute — that is `flows.spec.ts`, not a page audit. |
| `CL-17.2` | Sensitive data *inside* an image — needs OCR. |
| `SG-VOICE-TONE` | Register and tone across a page — a judgement, not a pattern. |

## Caveat: the checklist's px values predate the docs redesign

Checklist item 1.0 pins H1 to 30px bold and body copy to 18px Arial. The current docs
theme renders H1 at 32px weight 400 and body at 16px Inter, so **CL-1.2 and CL-1.4 fire
on every page**. That is reported rather than silently adjusted, per ground rule 1 — the
spec is the checklist, not the app.

Once someone decides which is authoritative: either update checklist item 1.0 in the
sheet, or set `CL_H1_PX=32 CL_BODY_PX=16` (and friends) to match the theme.

## Heuristic rules produce false positives on purpose

Rules tiered `heuristic` in `registry.ts` (passive voice, code tags in prose, bold UI
labels, upscaled images) match patterns, not meaning. They are tuned to over-report
rather than stay silent; the report shows the tier next to every rule so a reviewer
knows how much to trust a row.

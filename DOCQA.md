# One-command docs QA (`runDocQa.ts`)

Give it doc URLs. It performs the documented steps in the browser, audits the page
against the Doc Testing Checklist and the Style Guide, and writes one report per doc.

```bash
npm run docqa -- --url https://www.contentstack.com/docs/administration/manage-preferences
npm run docqa -- --urls data/my-urls.txt
npm run docqa:audit-only -- --urls data/my-urls.txt     # page audit only, no app login
```

`--urls` takes a plain text file (one URL per line, `#` comments allowed) or a
`project,url` CSV.

---

## Where this sits

This is the **URL front door**. It does not reimplement anything:

| Stage | Owned by |
|---|---|
| URL → doc type | `runDocQa.ts` (this script) |
| New doc → flow file | `scripts/bulkIngestFromUrls.ts --analyze-docs` |
| A. perform the steps | `tests/flows.spec.ts` (`--project=flows`) |
| B. checklist + style guide | `tests/docs-checklist.spec.ts` (`--project=docs-checklist`) |
| Per-doc combined report | `scripts/generateCombinedDocReport.ts` |
| Per-doc index | `scripts/generateFullPassIndex.ts` |

`scripts/run-docs-full-pass.sh` does the same A+B pass but is driven by a Playwright
`-g` pattern, so it only reaches flows that **already exist**. Use it when you know the
flow set. Use `runDocQa.ts` when you have URLs — new docs included — and want the doc
type worked out for you.

---

## What happens to each URL

1. **Classified** — `ui-flow` / `cli` / `sdk` / `api` / `kickstart`.
2. **Matched against existing flows.** A doc that already has a curated flow reuses it.
   Auto-generation never overwrites hand-authored work.
3. **Ingested** if it is a `ui-flow` doc with no flow yet. A page with no derivable steps
   becomes informational, and the report says so rather than showing an empty pass.
4. **Steps performed** (half A) — only for `ui-flow`. Other types name the project that
   runs them (`cli-automation`, `sdk-automation`, `api-docs-automation`) instead of
   silently reporting nothing.
5. **Page audited** (half B) — this runs for **every** URL regardless of type, because the
   checklist and style guide apply to any published page.

## Output

```
reports/docqa-<timestamp>/
  full-pass-index.html      per-doc results, both halves   ← start here
  docqa-coverage.html       doc-type routing, what was generated, what was not executed
  docqa-summary.json        machine-readable roll-up
  <flow-id>-combined-report.html
  checklist-per-doc/*.json
  ran-flows.json
```

Findings never fail a run — only a page that cannot be loaded does. Rules automation
cannot judge are always reported as "not checked", so the report states its own coverage.

---

## Dev / staging docs

Three separate things have to point at the right place, and they are not the same thing:

```bash
npm run docqa -- --urls list.txt \
  --docs-user <u> --docs-pass <p> \          # HTTP basic auth on the doc PAGE
  --app-origin https://<stag-app-host> \     # which PRODUCT env the steps run against
  --email <qa-user> --password <pw> \        # login for that product env
  --stack "My Stack"
```

| Flag | Env | Purpose |
|---|---|---|
| `--docs-user` / `--docs-pass` | `STAG_DOCS_USERNAME` / `STAG_DOCS_PASSWORD` | Reaching a gated doc page. Playwright only sends these on a 401, so they are inert against production. |
| `--app-origin` | `CS_APP_ORIGIN` | The product environment half A drives. |
| `--email` / `--password` | `CS_EMAIL` / `CS_PASSWORD` | Login for that environment. |
| `--stack` | `DEFAULT_STACK` | Stack the flows use. |

Supplying `--app-origin` or `--email` forces `FORCE_RELOGIN=true`. This is deliberate:
`auth.json` can be saved empty while the fast path only checks that the file exists, so
without it a prod session silently survives a switch to staging.

The page audit always runs with `SKIP_LOGIN=1`. It reads published pages anonymously, and
without this a locked or rate-limited QA account aborts the whole Playwright run — every
page then reports zero rules checked, which looks like a clean audit.

## The login preflight

Before opening a browser, the run makes **one** `POST /v3/user-session` call. If it fails,
the steps half is skipped and half B runs anyway.

This exists because `global-setup.ts` waits for that endpoint to return **200**, so every
non-200 — wrong password, rate limit, locked account — looks identical: a 90-second
timeout with no cause. Worse, each browser attempt (more with Playwright retries) adds to
the account's failed-login counter, and Contentstack locks a user after **10 rejected
attempts** — which then blocks every other automation sharing that QA account.

If you see `error_code 104` (account locked), unlocking is only half the fix. An account
only reaches that state after 10 *rejected* attempts, so confirm `CS_PASSWORD` is current
first — otherwise the next run re-locks it.

## Other flags

| Flag | Effect |
|---|---|
| `--skip-flows` | Page audit only. No app login, no ingest. |
| `--skip-checklist` | Steps only — for debugging half A. |
| `--headed` | Watch the browser perform the steps. |
| `--report-dir <dir>` | Override the output directory. |

---

## Two things to know before you trust a run

**Ingest writes to the repo.** Generating a flow creates real files under `projects/` and
re-syncs `data/docs-urls.csv` — and that sync is not append-only; it has been observed
removing unrelated URLs from `flows/<Project>/docs.json`. The run prints every file it
created. Review the diff before committing, and prefer running ingest on a branch:

```bash
git checkout -- projects/ data/docs-urls.csv flows/
```

**Auto-generated flows are weaker than hand-authored ones.** `docStepsToFlowActions.ts`
maps a known vocabulary of UI targets. A doc using unfamiliar UI produces steps that
cannot be resolved, and that is a tooling gap, not a doc defect. Check the coverage page
before reporting a generated flow's failure to a writer.

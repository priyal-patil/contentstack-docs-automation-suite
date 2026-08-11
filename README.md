# Contentstack Docs Automation Suite

Automated validation of Contentstack's **UI documentation** — every doc that tells a
reader to click something. Each documented procedure becomes a JSON **flow**, and
Playwright performs it against the real app, one step per documented step.

Covers 11 product areas: CMS, Launch, Personalize, Marketplace, Studio, AgentOS,
Administration, Developer Hub, Analytics, Brand Kit, and Data & Insights.

**Important:** We run **only the steps defined in the flow** (from the document). We do **not** add or infer steps. The goal is to find **missing or wrong steps in the docs**: if the doc says "click New" but the app has no "New" button on that page, the run fails and we report it so technical writers can fix the document.

> Part of a family of three independent docs-automation projects (this one,
> [Developer Resources](https://github.com/priyal-patil/Developer-Resources) for
> executable docs, and [API Docs Automation](https://github.com/priyal-patil/api-docs-automation)
> for the API reference). Shared ground rules, credential sources, and QA-org
> gotchas are in the common guide in this repo:
> [`DOCS-AUTOMATION-COMMON.md`](DOCS-AUTOMATION-COMMON.md).

---

## The contract (read this before changing anything)

- **The doc is the spec, never the app.** A flow's `expected.labelEquals` may only be
  changed to wording that appears in the source document. Copying the app's label
  makes the test green and destroys the finding. If the doc names no label, the
  honest outcome is a warning — not an app-sourced value.
- **Wrong wording warns; an impossible step fails.** A renamed label or minor wording
  mismatch is a warning and the flow continues. A step that cannot be performed fails.
- **Selector healing exists only** so stale locators don't drown the real signal
  (`scripts/healFailedFlows.ts`, `core/healing/*`). It is not licence to heal a finding.
- **Every bug report needs three parts:** what's wrong, why (root cause, confirmed by
  running it), and the specific fix — the doc text that should change.

---

## Getting started

### Prerequisites

| | |
|---|---|
| **Node.js 20+** | CI uses 20 |
| **Playwright browsers** | `npx playwright install` |
| **A Contentstack QA-org account** | with access to the stack you set as `DEFAULT_STACK` |

### Install

```bash
git clone https://github.com/priyal-patil/contentstack-docs-automation-suite.git
cd contentstack-docs-automation-suite
npm install
npx playwright install
cp .env.example .env      # then fill it in
```

### Fill in `.env`

`.env` is gitignored; `.env.example` is the committed key list.

| Key | Value |
|---|---|
| `CS_EMAIL` | QA-org login email **(required)** |
| `CS_PASSWORD` | QA-org login password **(required)** |
| `DEFAULT_STACK` | Stack name the flows run against **(required)** |
| `CS_APP_ORIGIN` | Optional; defaults to `https://app.contentstack.com` |
| `STAG_DOCS_USERNAME` / `STAG_DOCS_PASSWORD` | Optional; basic-auth for staging docs pages |

### Your first run

Do **not** start with a full project sweep — CMS alone runs for hours. Prove your
credentials with a single flow, headed so you can watch it:

```bash
npx playwright test tests/flows.spec.ts -g "Project=CMS Module=content-models" --headed
```

If that drives the app and produces `reports/latest/`, you're set up. Then scale to
a module, then a project.

### Useful run scopes

```bash
npm run test:cms                    # all CMS flows
npm run test:cms:content-models     # one module
npm run test:cms:batch1             # CMS split into batches (batch1/2/3)
npm run test:launch
npm run test:personalize
npm run test:administration
npm run test:agentos
npm run test:data-and-insights
```

`package.json` has ~100 scripts; most are `<project>`, `<project>:<module>`, and
`:headed` variants of the same thing. Anything you can't find a script for, target
directly with `-g`:

```bash
npx playwright test tests/flows.spec.ts -g "Project=CMS"
npx playwright test tests/flows.spec.ts -g "<flow-id>"
```

### Flags that change pass/fail

Two of these default in a way that surprises people:

| Flag | Effect |
|---|---|
| `STRICT_DOC_VERIFICATION` | Defaults to **strict** (in `rules/core/actionRules.ts`), so label mismatches *throw* instead of warning. Set `false` to get the warn-don't-fail policy — and expect it to expose real defects that strict mode was hiding behind a naming complaint. |
| `FORCE_RELOGIN=true` | `auth.json` lives at the **repo root** (not `data/`) and `global-setup.ts` can save it **empty** while the fast path only checks that the file exists — so a stale run can carry an unauthenticated context. Pass this for standalone probes. |

### Debugging a failure

**Diagnose from the saved DOM or screenshot, never from the error message.** In this
repo the error text is actively misleading — "product not found in App Switcher" was
a test id gaining an `-mfe` suffix; "Toggle/checkbox not found" was a `/switch/`
selector matching "App **Switch**er". And a `click` step passing means only that a
click was *dispatched* — a flow whose last step is a click can report success having
done nothing.

See [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) and
[`FRAMEWORK-HANDOFF.md`](FRAMEWORK-HANDOFF.md) for the deeper walkthrough.

---

## Document-step failure report (for technical writers)

When a step fails (e.g. element not found), the run records:

- **Document URL** (source of the flow)
- **Flow id**
- **Step number** and **step text** (action + target)
- **Error message** (e.g. "Element not found", "Timeout")

After all flow tests, see **`reports/latest/doc-step-failures.json`**. Each entry means: *this document URL failed at this step because the element could not be located* — the document may be missing a step or describing the wrong UI. Generic steps (e.g. "Content Models", "New Content Type") are fine when they match the app; document-specific steps must be correct or they will appear in this report.

## Folder structure (project-wise)

```
contentstack-ai-automation/
  projects/
    CMS/
      content-models/
        flows/
          <id>.flow.json
        selectors/
          module.selectors.ts
          <id>.selectors.ts
        index.ts
    Launch/
    Personalize/

  shared/
    steps/
      login.step.ts
      selectStack.step.ts
      registry.ts
    overrides/
      common.selectors.ts

  core/
  rules/
  tests/
```

## How flows run

- `tests/flows.spec.ts` auto-discovers:
  - New flows: `projects/**/flows/*.flow.json`
  - Legacy flows: `flows/**.json` (until you delete legacy folders)
- Each flow can include:
  - `use: ["login", "selectStack"]` → shared steps run before the flow steps.
- Selector overrides are loaded in this order:
  1) `shared/overrides/common.selectors.ts`
  2) `projects/<project>/selectors/project.selectors.ts` (optional)
  3) `projects/<project>/<module>/selectors/module.selectors.ts` (optional)
  4) `projects/<project>/<module>/selectors/<id>.selectors.ts` (optional)
  5) legacy `rules/overrides/**` (backwards compatible)

## Run commands (flow-level)

- **All CMS flows**:

```bash
npx playwright test tests/flows.spec.ts -g "Project=CMS"
```

- **CMS → content-models**:

```bash
npx playwright test tests/flows.spec.ts -g "Project=CMS Module=content-models"
```

Or use package scripts:

```bash
npm run test:cms
npm run test:cms:content-models
```

## Add a new flow manually

1) Create:
- `projects/<Project>/<module>/flows/<id>.flow.json`
- `projects/<Project>/<module>/selectors/<id>.selectors.ts` (optional, but recommended)

2) Run:

```bash
npx playwright test tests/flows.spec.ts -g "<id>"
```

## Bulk import (URL ingestion)

Create an input file as JSON:

```json
[
  { "project": "CMS", "module": "content-models", "id": "edit-content-type", "source": "https://..." }
]
```

Then run:

```bash
npm run ingest:docs -- --input data/ingest.json
```

This generates:
- `projects/<project>/<module>/flows/<id>.flow.json` (skeleton if missing)
- `projects/<project>/<module>/selectors/<id>.selectors.ts` (stub if missing)
- updates `projects/<project>/<module>/index.ts`

## GitHub Actions (CMS scheduled) + Slack reports

Workflow: **`.github/workflows/cms-daily-scheduled.yml`** (writes **`.env`** from secrets before `npm run test:cms:foreground`).

Jobs use **`runs-on: ubuntu-latest`** (GitHub-hosted Linux). **Private** repositories use billable **Actions minutes** per your plan; **public** repos follow GitHub’s hosted allowance.

In the repo → **Settings** → **Secrets and variables** → **Actions**, add repository secrets:

| GitHub Actions secret name | Value (you obtain from Slack / Contentstack login) |
| --- | --- |
| **CS_EMAIL** | Contentstack login email (**required**) |
| **CS_PASSWORD** | Contentstack login password (**required**) |
| **DEFAULT_STACK** | Stack name (**required**) |
| **CS_APP_ORIGIN** | Optional; default `https://app.contentstack.com` if unset |
| **SLACK_BOT_TOKEN** | Slack **Bot User OAuth Token** (`xoxb-...`); scopes must allow posting (e.g. `chat:write`) (**optional**, for summary) |
| **SLACK_CHANNEL_ID** | Slack **channel ID** (e.g. `C0123ABCDE`), not `#channel-name` (**optional**, paired with bot token) |
| **SLACK_INCOMING_WEBHOOK_URL** | Optional Incoming Webhook URL; used only when the **workflow job fails** (short alert, not the full summary) |

Invite the Slack app to the target channel. See **`.env.example`** (Slack section) for local vs Actions usage. Manual runs can set **skip_slack** to `true` to skip the summary post while still uploading report artifacts.

#### Reliable **07:00 IST** enqueue (recommended)

GitHub’s built-in **`schedule`** cron (**UTC-only**) often works around **01:30 UTC (= 07:00 IST)**, but **GitHub does not promise** an exact IST start — runs can queue **minutes to hours later** when Actions is busy. **Nobody can force “without fail only from YAML cron.”**

For a **trusted wall-clock enqueue** every day **07:00 Asia/Kolkata**, use an external scheduler that calls **`repository_dispatch`** (same shortcut flags as **`schedule`**):

1. Create a [**classic PAT**](https://github.com/settings/tokens) with **`repo`** scope (**simplest way** to allow `repository_dispatch`; fine‑grained tokens need permissions that vary by org — use GitHub docs if classic is disallowed). Store it **only** in the scheduler’s vault, **never** in the repo.
2. Every day **07:00** in timezone **`Asia/Kolkata`**, **`POST`**:

```bash
curl -sS -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_CLASSIC_OR_FG_PAT" \
  https://api.github.com/repos/OWNER/REPO/dispatches \
  -d '{"event_type":"cms-daily-7am-ist","client_payload":{"source":"external-cron"}}'
```

Replace **`OWNER/REPO`** (e.g. **`priyal-patil/contentstack-docs-automation-suite`**). **`event_type`** must be exactly **`cms-daily-7am-ist`** (matches **`.github/workflows/cms-daily-scheduled.yml`**).

The workflow still keeps **`schedule: '30 1 * * *'`** as **backup**. If both fire the same calendar minute you may occasionally get **two** short CMS runs — either remove **`schedule`** after the external cron is stable, or keep both and accept duplicates (`concurrency` does **not** cancel in-flight).

Even with **`repository_dispatch`**, the CMS job **starts when a runner is free**; that can add **small delays** vs your HTTP request time — this is unavoidable on GitHub-hosted runners.

#### Daily report email (SMTP, optional)

After each CMS scheduled/manual run (success or failure), the workflow can send a short **plain-text** summary plus a link to the GitHub Actions run (artifacts: Excel, dashboards, logs). Configure SMTP via repository secrets:

| GitHub Actions secret name | Purpose |
| --- | --- |
| **REPORT_EMAIL_TO** | Recipient address(es), comma-separated |
| **REPORT_EMAIL_FROM** | Sender, e.g. `CMS Automation <noreply@yourcompany.com>` |
| **REPORT_EMAIL_SMTP_HOST** | SMTP host (e.g. `smtp.gmail.com`, Office365 SMTP hostname) |
| **REPORT_EMAIL_SMTP_USERNAME** | SMTP username |
| **REPORT_EMAIL_SMTP_PASSWORD** | SMTP password or app password |
| **REPORT_EMAIL_SMTP_PORT** | Optional; default **587** (STARTTLS). Use **465** for implicit TLS (`secure` is set automatically). |

If any required mail secret is missing, the email step is skipped (no failure). Manual dispatch can set **skip_report_email** to `true` to skip sending.

Uses **`dawidd6/action-send-mail@v3`** (nodemailer). Large HTML reports are **not** attached — download **cms-reports-*** from the run instead.

#### Scheduler vs manual: runtime, retry, docs-audit

The workflow **`timeout-minutes`** is **360** (six hours wall clock unless you raise it within your account’s GitHub-hosted limits).

| Trigger | Behaviour |
| --- | --- |
| **`schedule`** (cron backup) | Best-effort **01:30 UTC** daily; same **`SKIP_*`** short path when it fires. Treat as **fallback**, not a strict IST clock—see **Reliable 07:00 IST** above. |
| **`repository_dispatch`** (`cms-daily-7am-ist`) | Same **short** path as **`schedule`** (**`SKIP_RETRY`**, **`SKIP_CMS_DOCS_SPEC`**, **`SKIP_DOCS_AUDIT`**). Intended to be pinged daily **07:00 IST** by **external cron** + PAT. |
| **`workflow_dispatch`** | Full CMS pipeline by default (**background** docs-audit when **`skip_docs_audit`** is false). Set **skip_retry** / **skip_docs_audit** / etc. to shorten runs. |

Artifacts (among others):

- **`cms-reports-<run>-<attempt>`** — main **`REPORT_DIR`** (`reports/gha-cms-…`): flows, dashboards, **`docs-audit-background.log`** (pointer / log).
- **`cms-docs-audit-<run>-<attempt>`** — **`reports/docs-audit-CMS-*`** (actual crawl output from **`run-docs-audit-background.sh`**, when produced).
- **`playwright-html-*`** — Playwright HTML under **`reports/gha-cms-…/html`** when present.

**Manual “Run workflow” inputs** (`cms-daily-scheduled.yml`):

| Input | Effect |
| --- | --- |
| **skip_retry** | **`SKIP_RETRY=1`** — skip retry-before-delete pass |
| **skip_slack** | **`SKIP_SLACK=1`** — skip **`urlRunSummaryAndSlack.ts`** |
| **skip_report_email** | **`SKIP_REPORT_EMAIL=1`** — skip SMTP summary |
| **skip_docs_audit** | **`SKIP_DOCS_AUDIT=1`** + **`DOCS_AUDIT_BACKGROUND=0`** — no docs link crawl (shortest CMS run) |
| **docs_audit_wait_secs** | Override post-CMS PID wait (integer **0–7200** seconds); empty = job default (**1200**) |

Failures or cancellations optionally notify **`SLACK_INCOMING_WEBHOOK_URL`** (Incoming Webhook). Scheduled / backup **`schedule`** **`cms-daily-scheduled.yml`** uses **cron `30 1 * * *`** (≈ **7:00 AM IST**) plus optional **`repository_dispatch`** **`cms-daily-7am-ist`** for a precise IST enqueue — edit the workflow/README to tune. To run **`docs.spec`**, **`docs-audit`**, and all **`flows.spec.ts`** projects locally or in CI, use **`npx playwright test`** / **`npm run test:all-and-report`** (see **`package.json`**) or trigger **CMS — daily doc automation (scheduled)** manually with the inputs you need.


## Contentstack Docs → Playwright Automation

This repo executes **documentation flows** as generic JSON step sequences, with selector overrides layered by **shared → project → module → flow**.

**Important:** We run **only the steps defined in the flow** (from the document). We do **not** add or infer steps. The goal is to find **missing or wrong steps in the docs**: if the doc says "click New" but the app has no "New" button on that page, the run fails and we report it so technical writers can fix the document.

### Document-step failure report (for technical writers)

When a step fails (e.g. element not found), the run records:

- **Document URL** (source of the flow)
- **Flow id**
- **Step number** and **step text** (action + target)
- **Error message** (e.g. "Element not found", "Timeout")

After all flow tests, see **`reports/latest/doc-step-failures.json`**. Each entry means: *this document URL failed at this step because the element could not be located* — the document may be missing a step or describing the wrong UI. Generic steps (e.g. "Content Models", "New Content Type") are fine when they match the app; document-specific steps must be correct or they will appear in this report.

### Folder structure (project-wise)

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

### How flows run

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

### Run commands

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

### Add a new flow manually

1) Create:
- `projects/<Project>/<module>/flows/<id>.flow.json`
- `projects/<Project>/<module>/selectors/<id>.selectors.ts` (optional, but recommended)

2) Run:

```bash
npx playwright test tests/flows.spec.ts -g "<id>"
```

### Bulk import (URL ingestion)

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

### GitHub Actions (CMS scheduled) + Slack reports

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
| **`schedule`** (cron) | Sets **`SKIP_RETRY=1`**, **`SKIP_CMS_DOCS_SPEC=1`**, and **`SKIP_DOCS_AUDIT=1`** (no docs link crawl) to **shorten CI time**. Flow automation, merge, reports, and Slack (if configured) still run. For **link-audit** artifacts, run **`workflow_dispatch`** (default includes background docs-audit). Waits **up to `DOCS_AUDIT_GHA_WAIT_SECS`** for a docs-audit PID only when one was started (manual default). |
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

Failures or cancellations optionally notify **`SLACK_INCOMING_WEBHOOK_URL`** (Incoming Webhook). Scheduled GitHub Actions use **`.github/workflows/cms-daily-scheduled.yml`** (**daily** cron at **01:30 UTC** ≈ **07:00 IST** — edit the workflow to change time). To run **`docs.spec`**, **`docs-audit`**, and all **`flows.spec.ts`** projects locally or in CI, use **`npx playwright test`** / **`npm run test:all-and-report`** (see **`package.json`**) or trigger **CMS — daily doc automation (scheduled)** manually with the inputs you need.


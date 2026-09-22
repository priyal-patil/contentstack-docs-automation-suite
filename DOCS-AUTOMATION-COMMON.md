# Contentstack Docs Automation — Common Guide

> **This file is a synced copy.** The same `DOCS-AUTOMATION-COMMON.md` lives in all
> three docs-automation repos so that cloning any one of them gives you the shared
> context. If you change it, change it in all three.

Three independent automation projects that read the published Contentstack
documentation, **do exactly what the doc tells a reader to do**, and report every
place where the doc and the product disagree.

The output of all three is the same kind of thing: a list of findings a technical
writer can act on. None of them are product regression suites — a red result means
*the doc is wrong or stale*, not necessarily that the product is broken.

> **Start here to pick a project.** Each project has its own README with full
> setup and run instructions; this file only covers what is true for all three.

---

## The three projects

| Project | Repo | What it validates | Method |
|---|---|---|---|
| **Developer Resources Docs Automation** | [`priyal-patil/Developer-Resources`](https://github.com/priyal-patil/Developer-Resources) | Kickstarts, Building Websites, CLI, SDKs | Runs the doc's real commands/code in a throwaway workspace (shell, `csdx`, SDK harnesses in 10+ languages) |
| **Contentstack Docs Automation Suite** | [`priyal-patil/contentstack-docs-automation-suite`](https://github.com/priyal-patil/contentstack-docs-automation-suite) | UI docs — CMS, Launch, Personalize, Marketplace, Studio, AgentOS, Administration, Developer Hub, Analytics, Brand Kit, Data & Insights | Drives the real app with Playwright, one step per documented step |
| **API Docs Automation** | [`priyal-patil/api-docs-automation`](https://github.com/priyal-patil/api-docs-automation) | The API reference — CDA, CMA, GraphQL, Launch, Personalize, Analytics, Automations, Brand Kit, GenAI, Knowledge Vault, Lytics, Image Delivery, Administration, SCIM | Scrapes each doc page, fires the requests live, and three-way compares doc ↔ Try Out ↔ Postman collection |

**Which one do I want?**

- The doc contains **terminal commands or code you copy into a project** → Developer Resources
- The doc contains **"click X, then Y"** → Docs Automation Suite
- The doc is an **API endpoint reference with a Try Out panel** → API Docs Automation

They are deliberately **separate repos with separate schedules**. Do not try to
merge them — the failure modes, credentials, and runtimes have nothing in common.

---

## Ground rules (all three projects)

These are the contract. Changing code in a way that violates them destroys the
value of the tool, even when it makes a run go green.

1. **The doc is the spec, never the app.** If the doc says click "New" and the app
   has no "New" button, that is a finding. Do not update the expectation to match
   the app.
2. **Execute verbatim.** Run the doc's exact commands, in the doc's order, with the
   doc's values. Supplying a required input (a password, an org ID, answering a
   prompt) is performing the step. Substituting *different content* than the doc
   states is not — it hides the bug.
3. **Never self-heal a finding.** Selector healing exists only so stale locators
   don't drown the real signal. A wrong name in the doc must surface as a finding.
4. **Record the gap and keep going.** One run should produce a complete gap report,
   not stop at the first failure.
5. **Wrong wording warns; an impossible step fails.** A renamed label or minor
   wording mismatch is a warning and the flow continues. A step that physically
   cannot be performed is a failure.
6. **Every reported bug needs three parts:** what's wrong, *why* it's wrong (root
   cause, confirmed by running it), and the **specific fix** — the corrected line,
   the right method signature, or the doc text that should change. "Confirmed
   broken" on its own is half a bug report.

---

## Prerequisites

Common to all three:

| | |
|---|---|
| **Node.js** | 20 or newer (CI uses 20 and 22; local dev on 21.7) |
| **npm** | ships with Node |
| **git** | to clone |
| **A Contentstack QA-org account** | Owner/Admin on the QA org — several APIs are org-scoped and need admin |
| **Playwright browsers** | `npx playwright install chromium` — needed by all three |

Project-specific extras (the CLI/SDK work in Developer Resources needs Python,
Java, .NET, PHP, Dart etc.; API Docs needs a Postman API key) are listed in each
project's own README.

### A note on the QA org

All three run against the shared **Contentstack QA org**. Two things about it
that will otherwise waste your afternoon:

- **Stacks churn.** Other automations create and delete stacks in this org
  constantly. Do not assume a stack you used yesterday still exists — the runners
  that need one create it (or reseed it) at the start of the run.
- **Authtokens expire silently.** A user is capped at ~20 valid authtokens and a
  login anywhere else quietly evicts the oldest. Prefer email+password (the
  runners log in fresh via `POST /v3/user-session`) over pasting a static
  `CS_AUTHTOKEN`, which will eventually start 401ing on every request with no
  obvious cause.

---

## Credentials and `.env`

Every project uses the same pattern:

```bash
cp .env.example .env
# fill in the values, then never commit it
```

`.env` is gitignored in all three repos. **Nothing real goes in `.env.example`** —
it is the key list plus comments, and it is committed.

Variable names differ per project (a deliberate consequence of them being
independent), so read the `.env.example` you actually have:

| Project | Prefix | Notable keys |
|---|---|---|
| Developer Resources | `CONTENTSTACK_*` | `CONTENTSTACK_EMAIL`, `CONTENTSTACK_PASSWORD`, `CONTENTSTACK_ORG_ID`, `CONTENTSTACK_REGION` |
| Docs Automation Suite | `CS_*` | `CS_EMAIL`, `CS_PASSWORD`, `DEFAULT_STACK`, `CS_APP_ORIGIN` |
| API Docs Automation | `CS_*` / `POSTMAN_*` | `CS_QA_EMAIL`, `CS_QA_PASSWORD`, `CS_ORG_UID`, `CS_API_KEY`, `CS_DELIVERY_TOKEN`, `CS_MANAGEMENT_TOKEN`, `POSTMAN_API_KEY`, per-API collection IDs |

### Where each credential comes from

| Credential | Where to get it |
|---|---|
| QA email / password | Your own Contentstack QA-org account (Owner or Admin) |
| Org ID / Org UID | App → **Organization Settings → Organization Info** |
| Stack API key | Stack → **Settings → Stack → API Key** |
| Delivery token | Stack → **Settings → Tokens → Delivery Tokens** |
| Management token | Stack → **Settings → Tokens → Management Tokens** (give it wide scope) |
| Region | `AWS-NA` / `us` etc. — match the region your org lives in |
| Postman API key | Postman → **Account Settings → API Keys** |
| Postman collection IDs | The public Contentstack Postman workspace, per API |
| Slack channel email *(optional)* | Slack → channel → **Integrations → Send emails to this channel** |
| Alert mailbox app password *(optional)* | Google Workspace **app password**, not the account password |

---

## The standard first run

Same five steps in every project:

```bash
git clone <repo-url>
cd <project>
npm install
npx playwright install chromium
cp .env.example .env    # then fill it in
```

Then run **one** thing before you run everything — a full sweep can take hours.
Each README names its smallest useful run; use that to prove your credentials
work, then scale up.

---

## Reports

Every project writes to a `reports/` directory (gitignored). Typical contents:

- a **JSON** file — the machine-readable findings, this is the source of truth
- an **HTML** dashboard — open it in a browser, this is what you actually read
- **screenshots** for anything UI-driven, captured at the moment of failure
- an **Excel / `.docx`** export where the audience is a technical writer

In CI nothing is committed back to the source repo — reports are uploaded as
workflow **artifacts** on the run. Normalized summary data is pushed to
[`docs-automation-dashboard-data`](https://github.com/priyal-patil/docs-automation-dashboard-data)
(see its `SCHEMA.md` for the shape every project writes), which feeds the
[`docs-automation-dashboard`](https://github.com/priyal-patil/docs-automation-dashboard)
deployed on Contentstack Launch.

---

## CI / scheduling

All three use **GitHub Actions**, one workflow per doc area, each on its own cron.

- Credentials live in **Settings → Secrets and variables → Actions** as repository
  secrets, named the same as the `.env` keys. Never in the repo.
- GitHub cron is **UTC only**. Every schedule in these repos is written as UTC with
  the intended IST time in a comment (e.g. `30 22 * * *` = 04:00 IST).
- GitHub does **not** guarantee the minute. A `schedule:` cron can queue minutes to
  hours late when Actions is busy. If a run must start at a wall-clock time, drive
  it from an external scheduler hitting `repository_dispatch` and keep the cron as
  a backup — see the Docs Automation Suite README for the exact recipe.
- Every workflow also has `workflow_dispatch`, usually with inputs to skip the slow
  phases. Use it — that's how you test a change without waiting for tomorrow.

---

## Troubleshooting the things that bite everyone

| Symptom | Actual cause |
|---|---|
| Everything 401s after working for days | Static authtoken evicted. Switch to email+password login. |
| "Stack not found" on a stack you just used | QA-org stack churn. Let the runner create/reseed one. |
| A UI step "passes" but nothing happened | A `click` passing means a click was *dispatched*, not that it worked. Assert an outcome after the click. |
| A run goes green after you "fixed" an expectation | You probably copied a label from the app. That is the finding, not the fix. Revert. |
| Confusing failure message | Diagnose from the saved DOM/screenshot, never the error text — in the UI suite the error text is actively misleading. |
| A stale session with 0 cookies | In the Docs Automation Suite, `auth.json` can be saved empty. Pass `FORCE_RELOGIN=true`. |
| CI run never started at the expected time | GitHub cron is best-effort. See CI section above. |

---

## Adding a new automation

Keep it standalone: its own folder, its own `package.json`, its own
`.env.example`, its own workflow and cron. Do not fold it into an existing
project to "share" a login — the coupling costs more than it saves, and a broken
shared runner takes every doc area down with it.

---

## Where to go next

- **Developer Resources Docs Automation** — https://github.com/priyal-patil/Developer-Resources
- **Contentstack Docs Automation Suite** — https://github.com/priyal-patil/contentstack-docs-automation-suite
- **API Docs Automation** — https://github.com/priyal-patil/api-docs-automation

Each repo also carries its own `README.md` with full setup and run instructions for
that project specifically. This file only covers what is true for all three.

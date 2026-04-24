# Contentstack Docs → Playwright Automation — Framework Handoff

**Repository:** `docs-contentstack-ai-automation` (Contentstack AI / docs automation)

Use this document as a single briefing for another assistant (e.g. Claude) or a new contributor. It describes purpose, layout, execution, reporting, and conventions.

---

## 1. What this framework is

- **Goal:** Turn **Contentstack documentation URLs** into **executable Playwright automation** so you can verify that **what the doc says matches what the app does**, and surface **documentation gaps** when steps fail.
- **Philosophy (critical):** Flows should reflect **only what the document explicitly describes**:
  - **Doc-minimal:** Do not add inferred prerequisite steps that are not written in the doc.
  - **Verification** (`verify`): Only for **named** labels, buttons, fields, modal titles, or **explicitly stated placement** (e.g. “Left navigation”). Use **`labelEquals`** with the **exact** doc string—not loose “contains” matching—for those checks.
  - **Verification mismatches** (label, modal, placement vs doc) → **warnings** in reporting; **do not** fail the run for mismatch alone.
  - **Hard fail** when the **executable step** cannot be done (target missing, timeout, impossible action).
- **Not the goal:** Automatically fixing docs in the repo. Reports **inform** writers and QA; they do not auto-fix content.

---

## 2. Stack and tools

| Piece | Role |
|--------|------|
| **Playwright** (`@playwright/test`) | Test runner, browser automation |
| **TypeScript** + **ts-node** | Core logic and one-off scripts |
| **global-setup.ts** | Login; writes **`auth.json`** (storage state) |
| **playwright.config.ts** | Projects: `flows`, `docs-audit`, `crawl`, `default`. Headless when **`PLAYWRIGHT_HEADLESS=1`** or **CI** |

Reporter writes HTML + JSON under **`REPORT_DIR`** (default `reports/latest`; CMS batch uses a timestamped dir).

---

## 3. Repository layout

```
projects/<Project>/<module>/flows/*.flow.json     # Executable flows (primary)
projects/<Project>/<module>/selectors/*.selectors.ts
shared/steps/                                     # login, registry, shared steps
shared/overrides/common.selectors.ts
core/executor.ts                                 # Executes flow JSON
rules/core/actionRules.ts                        # action → Playwright (row menus, etc.)
tests/flows.spec.ts                              # Discovers flows, runs executeFlow
tests/docs-audit.spec.ts                         # docs-urls.csv crawl
tests/docs.spec.ts                               # Additional docs checks (as used)
scripts/run-cms-sequential-modules-dashboard.sh  # Canonical full CMS pipeline
scripts/run-project-batch-background.sh          # Background CMS / Launch / Personalize
scripts/run-cms-headless-background.sh           # CMS via nohup (optional dashboard default)
scripts/run-cms-headless-report.sh               # Delegates to sequential CMS script
scripts/urlRunSummaryAndSlack.ts                 # Slack from REPORT_DIR
data/docs-urls.csv                               # Master list for docs-audit + sync
data/cms-urls.csv                                # CMS URLs (built/synced for CMS runs)
.cursor/rules/*.mdc                              # Mandatory team / agent conventions
```

**Legacy `flows/` tree:** See **`.cursor/rules/legacy-flows-policy.mdc`**—no new executables under **`flows/`**; **`flows/<Project>/docs.json`** stays in use for URL lists; **`tests/flows.spec.ts`** still walks legacy **`flows/**`** JSON (except **`docs.json`**); target state is automation under **`projects/`** only, with duplicate **`id`**s between **`flows/`** and **`projects/`** avoided.

---

## 4. Flow JSON (conceptual)

- **`id`**, **`project`**, **`module`**, **`stage`** (e.g. `main`, or delete/cleanup stages).
- **`source`:** Documentation URL.
- **`type`:** e.g. `executable`.
- **`use`:** e.g. `["login", "selectStack"]` — shared prelude before **`steps`**.
- **`steps`:** `action`, `target`, optional **`verify`**, **`expected`** (e.g. **`rowContains`** for table row ⋯ menus), **`within`**, **`timeoutMs`**, **`value`** (fill/upload), etc.
- **Multi-part docs:** One **`.flow.json` + `.selectors.ts` per part** (e.g. `*-part-1`, `*-part-2`). Do not merge unrelated parts into one flow file.

Full annotated example and authoring notes: **`.cursor/rules/flow-json-authoring-guide.mdc`**. Teaser (shape only, 3 lines):

```json
{ "id": "cms-authoring-example", "project": "CMS", "module": "content-models", "stage": "main",
  "source": "https://www.contentstack.com/docs/...", "type": "executable",
  "use": ["login", "selectStack"] }
```

**Minimal example** (placeholders; shape only—not copy-pasted from a real doc):

```json
{
  "id": "placeholder-flow-id",
  "project": "CMS",
  "module": "placeholder-module",
  "stage": "main",
  "source": "https://www.contentstack.com/docs/path/to/article",
  "type": "executable",
  "use": ["login", "selectStack"],
  "steps": [
    {
      "action": "click",
      "target": "Placeholder control (doc step)",
      "verify": { "labelEquals": "Exact label from doc", "within": "Modal" }
    },
    {
      "action": "click",
      "target": "vertical ellipsis",
      "expected": { "rowContains": "UNIQUE-ROW-TEXT" }
    }
  ]
}
```

- First step: doc-named control plus **`verify`** (exact label + optional **`within`**). Second step: row-scoped action with **`expected.rowContains`** (same token for every later ⋯ menu step on that row—see **`.cursor/rules/flow-row-action-menu-rowcontains.mdc`**).

---

## 5. Selector layering

**`core/executor.ts`** does not merge selectors; it states that maps are built in **`loadOverrides()`** in **`rules/core/actionRules.ts`** (**shallow** spread, **last-wins** per target key, **not** deep merge). **Resolution (implemented in `loadOverrides()`):** `CLICK_SELECTORS` / `INPUT_SELECTORS` are merged in fixed order: **(1)** `shared/overrides/common.selectors.ts` → **(1b)** legacy `rules/overrides/common.selectors.ts` → **(2)** `projects/<project>/selectors/project.selectors.ts` → **(3)** `projects/<project>/<module>/selectors/module.selectors.ts` → **(3b)** legacy `rules/overrides/modules/<module>.selectors.ts` → **(4)** `projects/<project>/<module>/selectors/<flow-id>.selectors.ts` → **(4b)** legacy `rules/overrides/docs/<flow-id>.selectors.ts`. Only top-level keys in those exported maps participate; **`performAction`** may still use inline string fallbacks when a target has no map entry.

**Targets** in JSON are **logical names** mapped to locator strings in those maps.

---

## 6. Test discovery and ordering (`tests/flows.spec.ts`)

- Walks **`projects/**/flows/*.flow.json`** (and legacy `flows/`).
- Test titles include **grep-friendly** strings: **`Project=…`**, **`Module=…`**, **`Stage=…`**, and flow **`id`**.
- **CMS full batch:** **`CMS_SEQUENTIAL_MODULE_ORDER=1`** → modules run in a **fixed order** (see `.cursor/rules/cms-execution-order.mdc`).
- **Within a module:** Sort by **`flowOrder`**, then **CRUD lifecycle** (`crudLifecycleRank`): create/add before edit/update; **delete-like** flows excluded from main runs and run in a **delete batch** later.
- **`CMS_CONTINUE_ON_FAIL=1`:** Typically one test per module with **`test.step` per flow** so **failures do not skip remaining URLs** in that module. It **does not** suppress execution failures: each **hard fail** still fails that **`test.step`**, the **module batch test** fails when the batch finishes, and **original errors are rethrown** (**`AggregateError`** if multiple); only **doc verification** mismatches stay **warning-only** (non-throwing) per **`core/executor.ts`**—see **`.cursor/rules/cms-execution-order.mdc`**.

---

## 7. CMS full pipeline (canonical)

**Script:** `scripts/run-cms-sequential-modules-dashboard.sh`

**Pipeline phases**

**Phases (conceptual):**

1. Main **non-delete** modules in policy order (headless; workers from env).
2. **Serial chains** (e.g. publish rules after workflows; roles after users-and-roles)—exact order in **`cms-execution-order.mdc`**.
3. **Retry** pass for failed / timed-out / interrupted (unless **`SKIP_RETRY=1`**).
4. **Delete** batch (grep of delete-style flow titles).
5. **`Module=trash`**.
6. **Merge** `playwright-parts/*.json` into consolidated results.
7. **Docs-audit:** default **`DOCS_AUDIT_BACKGROUND=1`**; set **`DOCS_AUDIT_BACKGROUND=0`** for inline audit in **`REPORT_DIR`**.
8. **Reports:** Excel, `cms-dashboard.html`, `dashboard.html`, **`report-bundle/`**, unified report generators.
9. **Slack:** `urlRunSummaryAndSlack.ts` unless **`SKIP_SLACK=1`**.
10. **Open** `report-bundle/index.html` when **`OPEN_CMS_DASHBOARD≠0`** and `open` exists; **`SKIP_OPEN_DASHBOARD=1`** suppresses (used by some launchers).

**Run commands**

**CMS-only background run (headless, Slack + open dashboard when done):**

```bash
npm run launch:cms:bg
```

Same as: `bash scripts/run-project-batch-background.sh CMS`

**CMS background, often without auto-opening the bundle:**

```bash
npm run test:cms
```

(Uses `run-cms-headless-background.sh` → `run-cms-headless-report.sh`; check script for default **`OPEN_CMS_DASHBOARD`**.)

**Foreground full CMS pipeline:**

```bash
npm run test:cms:foreground
# or
npm run test:cms:sequential-modules
```

**macOS long runs:** Scripts may wrap work in **`caffeinate -i -m -s`** to defer idle/system sleep. **`SKIP_CAFFEINATE=1`** disables. True sleep/hibernate still stops execution; use AC power, energy settings, or CI for guaranteed completion.

---

## 8. Launch and Personalize batches

```bash
npm run launch:launch:bg
npm run launch:personalize:bg
```

These call **`run-generic-project-headless.sh`** for that project, then dashboards / Slack per project batch script. **Not** the full CMS module sequence.

---

## 9. Docs-audit only (no product UI flows)

```bash
npm run test:docs-audit:cms
```

Runs **`tests/docs-audit.spec.ts`** with **`DOCS_AUDIT_PROJECT=CMS`**. Crawls URLs from **`data/docs-urls.csv`** (and related env). **Results feed reports; they do not auto-fix broken links.**

After adding or changing doc URLs **only** in flow JSON / `flows/*/docs.json`, run:

```bash
npm run sync:docs-urls
```

So **`data/docs-urls.csv`** stays the audit source of truth.

**Deleting a flow and `docs-urls.csv`:** **`npm run sync:docs-urls`** rebuilds rows from **`flows/*/docs.json`** + all **`source`** fields in **`projects/**/flows/*.flow.json`**, then re-adds only CSV rows marked **`project,url,keep`** (see **`.cursor/rules/docs-urls-sync.mdc`**). After removing a flow file, run sync—URLs not listed elsewhere are **dropped** unless pinned with **`keep`** or still present in **`docs.json`**; **`npm run add-doc-url`** defaults to pinned rows unless **`--no-keep`**.

---

## 10. Reporting and Slack

- Each full CMS batch uses a **`REPORT_DIR`** (e.g. `reports/cms-seq-<timestamp>/`).
- **`reports/latest-cms-batch-dir.txt`** stores the last batch directory path when the pipeline updates it.
- **Slack** requires configuration (e.g. **`SLACK_BOT_TOKEN`** or project-specific auth—see `scripts/urlRunSummaryAndSlack.ts` and repo secrets docs).
- **CMS report bundle** layout and dark theme are specified in **`.cursor/rules/cms-report-bundle-dashboard.mdc`**.

---

## 11. Environment variables (common)

| Variable | Effect |
|----------|--------|
| `PLAYWRIGHT_HEADLESS=1` | Headless flows project |
| `PW_WORKERS` | Parallelism |
| `REPORT_DIR` | Output directory for a run |
| `SKIP_SLACK=1` | No Slack post |
| `SKIP_OPEN_DASHBOARD=1` | No `open` of HTML dashboards |
| `SKIP_RETRY=1` | No retry pass before delete batch |
| `SKIP_DOCS_AUDIT=1` | Skip docs-audit phase (when supported by script) |
| `DOCS_AUDIT_BACKGROUND=0` | Inline docs-audit in `REPORT_DIR` |
| `SKIP_CAFFEINATE=1` | No `caffeinate` wrapper on macOS |

Credentials and stack selection: **`.env`** and **`global-setup.ts`** (e.g. `CS_EMAIL`, `CS_PASSWORD`).

---

## 12. Cursor / team rules (must read before editing flows)

Path: **`.cursor/rules/`**

| File | Topic |
|------|--------|
| `cms-execution-order.mdc` | CMS module order, retry, delete, trash, merge, audit |
| `doc-step-parity.mdc` | Exact doc wording, `labelEquals`, placement rules |
| `doc-step-minimal-enforcement.mdc` | Sentence-by-sentence scope, warnings vs hard fail |
| `flow-row-action-menu-rowcontains.mdc` | **`rowContains`** on ⋯ and every follow-on row menu action |
| `docs-urls-sync.mdc` | When and how `docs-urls.csv` updates |
| `run-project-shortcuts.mdc` | “Run CMS / Launch / Personalize” commands |
| `doc-parts-one-file-per-part.mdc` | Part 1 / Part 2 file split |
| `cms-report-bundle-dashboard.mdc` | Bundle HTML spec |

---

## 13. Command quick reference

| Intent | Command |
|--------|---------|
| CMS full batch, background, headless, Slack + open dashboard | `npm run launch:cms:bg` |
| CMS background (check `OPEN_CMS_DASHBOARD` default) | `npm run test:cms` |
| CMS foreground full pipeline | `npm run test:cms:foreground` |
| Launch / Personalize background | `npm run launch:launch:bg` / `npm run launch:personalize:bg` |
| Sync `docs-urls.csv` | `npm run sync:docs-urls` |
| Docs audit CMS only | `npm run test:docs-audit:cms` |
| Single flow (example) | `npx playwright test tests/flows.spec.ts --project=flows -g "<flow-id>"` |

---

## 14. Brief for another assistant (template)

When starting a task, provide:

1. **Repository path** and **branch**.
2. **Project** (`CMS`, `Launch`, `Personalize`, `Studio`, …).
3. **Documentation URL** and the flow **`source`** / **`id`**.
4. **Scope:** Full CMS batch vs single module vs single flow.
5. Instruction to **read the relevant `.cursor/rules/*.mdc` files** before changing flows.
6. If you only changed URLs in JSON, run **`npm run sync:docs-urls`** before assuming docs-audit covers new URLs.

### Handshake

Before changing flows, selectors, or scripts, the assistant must **state which `.cursor/rules/*.mdc` files it read** (by filename) for that change—not only this handoff—and briefly why each applies; if any were skipped, say so explicitly.

---

## 15. Common failures and fixes

- **`auth.json` stale or missing:** Re-run **`global-setup`** by executing a normal Playwright run (see **`global-setup.ts`** / config). Confirm **`.env`** has valid **`CS_EMAIL`**, **`CS_PASSWORD`**, and any stack vars the setup expects.
- **`caffeinate` not preventing sleep (macOS):** Lid-close / deep sleep can still kill the process; plug in **AC**, loosen sleep settings, or run the batch on **CI** or an always-on machine.
- **`REPORT_DIR` collision:** Don’t point two concurrent jobs at the same path; rely on the **timestamped** dirs from CMS scripts or set a **unique `REPORT_DIR` per run**.
- **Timeouts or immediate failures on a fresh run:** Usually **credentials or env**—fix **`.env`**, delete bad **`auth.json`** if needed, and retry so setup can regenerate storage state.

**Related docs:** **`TROUBLESHOOTING.md`** (repo root)—symptom / cause / fix for the above and more.

---

## 16. Related in-repo docs

- **`README.md`** — High-level intro, folder structure, basic run/add-flow steps.

---

*This handoff is a living document: the team maintains it—refresh it whenever pipelines, scripts, rules, or team conventions change materially.*

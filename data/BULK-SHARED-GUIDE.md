# Bulk URLs + DOM: share format and run

Use this when you have a **bulk URLs file** and **DOM file(s)**. The pipeline will:

- **URLs with steps/DOM** → create **flow JSON** + **selectors** under `projects/<project>/<module>/flows/` and `.../selectors/`
- **URLs with no steps** → add to **informational** list (`flows/<Project>/docs.json` + `data/docs-urls.csv`)
- Then you can **execute** all (flows + docs-audit) and see the **dashboard** report

---

## 1. What to share

### A. Bulk URLs file (CSV)

- **Required columns:** `url`, `module`, `id`
- **Optional columns:** `project`, `stage`, `type`, `parts`, `dom_file`, `steps_file`, `selectors_file`

| Column          | Required | Description |
|-----------------|----------|-------------|
| url             | Yes      | Full URL (e.g. docs or app URL). |
| module          | Yes      | e.g. `content-models`. |
| id              | Yes      | Flow id (e.g. `boolean`, `group-part-1`). Must be unique per flow. |
| project         | No       | `CMS`, `Launch`, `Personalize`. Inferred from URL if blank. |
| stage           | No       | `main` or `delete`. Inferred if blank. |
| type            | No       | `executable` or `informational`. If blank: **executable** when `dom_file` or `steps_file` is set; else by URL. |
| parts           | No       | Number (`2`) or list (`part-1,part-2`) to create multiple flows from one row. |
| dom_file        | No       | **Path to HTML file** (relative to the CSV’s folder). Used to generate selectors. |
| steps_file      | No       | Path to JSON file with steps array `[{ "action": "click", "target": "..." }, ...]`. |
| selectors_file  | No       | Path to JSON `{ "click": {...}, "input": {...} }`. |

**Rule used for “steps” vs “informational”:**

- If a row has **`dom_file`** or **`steps_file`** (or `type` = executable) → **executable**: create **flow JSON + selectors**.
- If a row has **none** of those and URL is docs → **informational**: add URL to **informational** list only (no flow file).

### B. DOM file(s)

- Put HTML snippet files in a folder **next to or under the folder that contains the CSV**.
- In the CSV, set **`dom_file`** to the path **relative to the CSV’s folder** (e.g. `dom/page1.html`, `dom/group-part-1.html`).
- The script reads each referenced DOM file and parses `[data-test-id]`, `input[name]`, `svg[name]` into selectors for that row’s flow.

**Example layout:**

- CSV: `data/my-bulk-urls.csv`
- DOM files: `data/dom/page1.html`, `data/dom/page2.html`
- In CSV: `dom_file` = `dom/page1.html` or `dom/page2.html`

---

## 2. Example CSV (save as e.g. `data/my-bulk-urls.csv`)

```csv
url,module,id,project,stage,dom_file
https://www.contentstack.com/docs/developers/create-content-types/boolean,content-models,boolean,CMS,,dom/boolean-snippet.html
https://www.contentstack.com/docs/developers/create-content-types/url,content-models,url-doc,CMS,,
```

- First row: has `dom_file` → **executable** → flow `boolean.flow.json` + `boolean.selectors.ts` created; selectors from `dom/boolean-snippet.html`.
- Second row: no `dom_file` / no steps → **informational** → URL added to `flows/CMS/docs.json` and `data/docs-urls.csv` only.

---

## 3. Commands to run (after you add your files)

**Step 1 – Ingest (create JSON, selectors, informational list):**

```bash
npm run ingest:bulk -- --input data/<your-bulk-urls>.csv
```

Replace `<your-bulk-urls>` with your CSV filename (e.g. `my-bulk-urls`).  
DOM paths in `dom_file` are resolved relative to the CSV’s directory.

**Step 2 – Execute all and open dashboard:**

```bash
npm run test:all-and-report
```

Or docs-only (headless) + dashboard:

```bash
npm run test:docs-audit:dashboard
```

**One-shot: ingest then run all and report:**

```bash
npm run ingest:bulk -- --input data/<your-bulk-urls>.csv && npm run test:all-and-report
```

---

## 4. Where things are written

| Output | Location |
|--------|----------|
| Flow JSON (executable) | `projects/<project>/<module>/flows/<id>.flow.json` |
| Selectors (executable) | `projects/<project>/<module>/selectors/<id>.selectors.ts` |
| Informational URLs | `flows/<Project>/docs.json` and `data/docs-urls.csv` |
| Dashboard report | `reports/latest/dashboard.html` (after run) |

Once you share your **bulk URLs CSV** and **DOM file(s)** (or say where they are), the same steps above can be run to execute all URLs and show the report in the dashboard.

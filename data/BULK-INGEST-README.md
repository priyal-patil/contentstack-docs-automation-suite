# Bulk URL ingest – document + execution files

Use a **JSON file** or a **CSV/Excel** file to create **flow** (execution) and **selectors** (document) files for many URLs at once.

---

## Classification: informational vs executable

The script **automatically classifies** each URL:

- **Executable:** URLs that point to **in-app UI** (e.g. `app.contentstack.com`) → creates a **flow** + **selectors** under `projects/<project>/<module>/`.
- **Informational:** URLs that are **docs/read-only** (e.g. `contentstack.com/docs/...`) → adds the URL to **`flows/<Project>/docs.json`** so `npm run test:docs` can run doc-only checks (HTTP, title, no 404).

You can **override** classification with a `type` column (CSV) or `type` field (JSON): set to `executable` or `informational`.

**Auto-detect executable:** You do **not** need to set `type=executable` for doc URLs that have in-app steps. The script treats a row as **executable** when:
- You set **`type`** to `executable`, or
- You provide **`dom_file`** (the script assumes you are defining UI for that doc), or
- You provide **`steps_file`** (the script assumes you are defining steps for that doc), or
- The URL matches known in-app doc patterns (e.g. `create-content-types/group`, `minimum-and-maximum-limit`, `edit-a-content-type`).

So for URLs like [Minimum and Maximum Limits](https://www.contentstack.com/docs/developers/create-content-types/minimum-and-maximum-limit), adding a **`dom_file`** (or **`steps_file`**) is enough: the script will create the flow + selectors and they will be included when you run bulk execution.

### Auto-detect from document content (--analyze-docs)

You can **analyze the document page itself** to detect executability and parts, without setting `type`, `dom_file`, or `steps_file`:

- Run ingest with **`--analyze-docs`**:  
  `npx ts-node scripts/bulkIngestFromUrls.ts --input data/your-sheet.csv --analyze-docs`
- The script **fetches each docs URL**, parses the HTML, and:
  - **Detects “has steps”**: looks for phrases like “perform the following steps”, “log in to your Contentstack”, and checks for ordered lists (`<ol>`) or numbered steps in the body.
  - **Detects parts**: finds sections (e.g. “Example 1”, “Example 2”) that each have their own step list and creates one flow per part (e.g. `minimum-and-maximum-limit-part-1`, `minimum-and-maximum-limit-part-2`).
  - **Generates flow steps**: maps doc step text to known targets (e.g. “Click Save and Close” → `Save and Close (doc step)`, “Enable the Multiple toggle” → `Multiple (doc step)`) and writes the flow JSON and stub/selector files.

With **`--analyze-docs`**, you can pass a bulk list of doc URLs and the script will treat as executable only those that **actually contain steps** and create the JSON/selector files from the document content. Use the same flag when running the full pipeline:  
`npx ts-node scripts/runBulkFromCsv.ts --input data/your-sheet.csv --analyze-docs [--headed]`.

---

## Multiple parts / sections

If one document has **multiple parts** (e.g. “Part 1”, “Part 2”), you can create **one row per URL** and use **`parts`** to generate multiple flows from that row:

- **CSV:** add a `parts` column. Use either:
  - A number: `2` → creates `{id}-part-1` and `{id}-part-2`.
  - A comma-separated list: `part-1,part-2` → creates `{id}-part-1`, `{id}-part-2`.
- **JSON:** add `"parts": 2` or `"parts": ["part-1", "part-2"]`.

Example: one row with `id: "boolean"` and `parts: 2` produces flows `boolean-part-1` and `boolean-part-2` (same URL, same module).

---

## Option 1: CSV / Excel

**Best for:** pasting many URLs in a sheet and optionally pointing to DOM/steps files.

1. Create a CSV with these columns (header row required):

| Column        | Required | Description |
|---------------|----------|-------------|
| `url`         | Yes      | Document/source URL. |
| `module`      | Yes      | e.g. `content-models`. |
| `id`          | Yes      | Flow id (e.g. `my-flow-id`). |
| `project`     | No       | `CMS`, `Launch`, `Personalize`. Inferred from URL if blank. |
| `stage`       | No       | `main` or `delete`. Inferred if blank. |
| `type`        | No       | `executable` or `informational`. If blank, **auto-detected**: executable when `dom_file` or `steps_file` is set, or URL matches in-app doc patterns; else by URL (app. → executable, docs → informational). |
| `parts`       | No       | Number (e.g. `2`) or comma-separated suffixes (e.g. `part-1,part-2`) to create multiple flows from this row. |
| `dom_file`    | No       | Path to an HTML file (relative to the CSV’s folder). Script reads the file and parses `[data-test-id]`, `svg[name]`, etc. into selectors. |
| `steps_file`  | No       | Path to a JSON file with a **steps array**: `[{ "action": "click", "target": "Content Models" }, ...]`. |
| `selectors_file` | No    | Path to a JSON file with `{ "click": { "Label": "selector" }, "input": { ... } }`. |

2. **From Excel:** build your table, then **File → Save As → CSV (Comma delimited) (.csv)** or **CSV UTF-8**. Save as e.g. `data/bulk-urls.csv`.

3. **Where to put DOM files and how they're used:**
   - **Location:** Put your HTML snippet files in a folder **under the same folder as your CSV**. The `dom_file` value is resolved **relative to the CSV's folder** (the directory the CSV file lives in).
   - **If your CSV is in `data/`** (e.g. `data/Bulk-urls-Sheet1.csv`): create a subfolder like `data/dom/` and put files there (e.g. `data/dom/group-part-1.html`). In the CSV, set `dom_file` to **`dom/group-part-1.html`** (path relative to `data/`).
   - **If your CSV is in `data/sheets/`**: put DOM files in `data/sheets/dom/` and use `dom_file` = `dom/page1.html`, or use `../dom/page1.html` to point to `data/dom/`.
   - **Per row:** For **each row** that has `dom_file` set, the script reads **that** HTML file and uses it **only for that row's flow(s)**. So every document URL that has a `dom_file` gets its selectors from that specific DOM file; other rows are unaffected.

**Example CSV (`data/bulk-urls.csv`):**

```csv
url,module,id,project,stage,dom_file,steps_file,selectors_file
https://www.contentstack.com/docs/developers/create-content-types/boolean,content-models,boolean-doc,CMS,main,dom/boolean-snippet.html,,
https://www.contentstack.com/docs/developers/create-content-types/url,content-models,url-doc,CMS,main,,,
```

**Example DOM file (`data/dom/boolean-snippet.html`):** any HTML snippet; the script will extract `[data-test-id]`, `input[name]`, `svg[name]` and add them to the flow’s selectors.

---

## Option 2: JSON

**Best for:** automation or when you want to embed steps/selectors/DOM inline.

Each item in the array can have:

| Field         | Required | Description |
|----------------|----------|-------------|
| `url`         | Yes      | Document/source URL. |
| `module`      | Yes      | Module name. |
| `id`          | Yes      | Flow id. |
| `project`     | No       | Inferred from URL if omitted. |
| `stage`       | No       | Inferred if omitted. |
| `type`        | No       | `executable` or `informational`; inferred from URL if omitted. |
| `parts`       | No       | Number (e.g. `2`) or array (e.g. `["part-1", "part-2"]`) to create multiple flows. |
| `steps`       | No       | Array of `{ action, target, value?, nth?, expected? }`. |
| `selectors`   | No       | `{ click: { "Label": "selector" }, input: { ... } }`. |
| `dom`         | No       | HTML snippet string; parsed for selectors. |

**Example (`data/bulk-urls.json`):**

```json
[
  {
    "url": "https://www.contentstack.com/docs/developers/create-content-types/boolean",
    "project": "CMS",
    "module": "content-models",
    "id": "boolean-doc",
    "stage": "main",
    "steps": [
      { "action": "click", "target": "Content Models" },
      { "action": "click", "target": "New Content Type" }
    ],
    "selectors": {
      "click": { "Insert a field (doc step)": "[data-test-id=\"cs-field-type-selector\"] svg[name=\"PurpleAdd\"]" }
    },
    "dom": "<div data-test-id=\"cs-field-type-selector\">...</div>"
  }
]
```

---

## Output files

- **Executable URLs:** for each row/item the script creates or updates:
  - **Flow:** `projects/<project>/<module>/flows/<id>.flow.json`
  - **Selectors:** `projects/<project>/<module>/selectors/<id>.selectors.ts`
- **Informational URLs:** the URL is added to **`flows/<Project>/docs.json`** (no flow file). Run `npm run test:docs` to validate these doc URLs.

---

## How to run

```bash
# CSV (e.g. exported from Excel)
npm run ingest:bulk -- --input data/bulk-urls.csv

# JSON
npm run ingest:bulk -- --input data/bulk-urls.json

# Or with ts-node
npx ts-node scripts/bulkIngestFromUrls.ts --input data/bulk-urls.csv
```

Paths in CSV columns (`dom_file`, `steps_file`, `selectors_file`) are resolved **relative to the folder that contains the CSV file**.

---

## Run execution for only the URLs in a sheet

To **ingest from a bulk CSV and then run only those URLs** (docs-audit for doc URLs, flow tests for executable flow ids):

```bash
# Ingest + run only sheet URLs (workers=1)
npx ts-node scripts/runBulkFromCsv.ts --input "data/Bulk-urls - Sheet1.csv"

# With browser visible (headed)
npx ts-node scripts/runBulkFromCsv.ts --input "data/Bulk-urls - Sheet1.csv" --headed

# Or use the npm script (default input: data/Bulk-urls-Sheet1-corrected.csv)
npm run run:bulk -- --input "data/Bulk-urls - Sheet1.csv" --headed
```

This does:

1. **Bulk ingest** from the CSV (creates/updates flow JSON + selectors; adds informational URLs to `flows/<Project>/docs.json` and `data/docs-urls.csv`).
2. **Docs-audit** for only the URLs from that sheet (writes `data/docs-urls-bulk-run.csv` and runs with `DOCS_URLS_CSV` so only those URLs are audited).
3. **Flow tests** for only the flow ids from that sheet (`-g "id1|id2|..."`).

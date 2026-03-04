# Bulk CSV format check – Bulk-urls - Sheet1.csv

## What’s correct

- **Header:** `url,module,id,project,stage,parts,dom_file` – all valid columns.
- **Required columns:** `url`, `module`, `id` are present and filled.
- **Rows 3–6** (date, file, link, reference): Format is correct. Empty `stage` and `parts` are fine.
- **Rows 7–8** (group part-1, group part-2): Using two rows with `parts` = `part-1` and `part-2` will correctly create flows `group-part-1` and `group-part-2`.

## What to fix

### 1. `dom_file` must be a **file path**, not HTML content

The script treats `dom_file` as a **path** to an HTML file (relative to the CSV’s folder). It does **not** accept raw HTML in the cell.

- **Wrong:** Putting the full DOM/HTML snippet in the `dom_file` column.
- **Right:** Save the DOM into files (e.g. under `data/dom/`) and put the **path** in `dom_file`, e.g. `dom/group-part-1.html`, `dom/group-part-2.html`.

So for the two “group” rows:

1. Save the Part 1 DOM into: `data/dom/group-part-1.html`
2. Save the Part 2 DOM into: `data/dom/group-part-2.html`
3. In the CSV, set:
   - Row 7 (group part-1): `dom_file` = `dom/group-part-1.html`
   - Row 8 (group part-2): `dom_file` = `dom/group-part-2.html`

### 2. Optional: remove the empty row

Row 2 is empty (only commas). The script skips rows with no `url`/`module`/`id`, but you can delete that row to keep the CSV clean.

## Corrected example for the group rows

| url | module | id | project | stage | parts | dom_file |
|-----|--------|-----|---------|-------|-------|----------|
| https://www.contentstack.com/docs/.../group | content-models | group | CMS | | part-1 | dom/group-part-1.html |
| https://www.contentstack.com/docs/.../group | content-models | group | CMS | | part-2 | dom/group-part-2.html |

After you create `data/dom/group-part-1.html` and `data/dom/group-part-2.html` and use these paths in `dom_file`, the format is correct for the bulk ingest script.

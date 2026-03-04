# Boolean Part 2 – Run Report (Headed)

**Run:** boolean-part-2 only, headed mode (`headless: false` in config)  
**Command:** `npx playwright test tests/flows.spec.ts -g "boolean-part-2" --reporter=list`

---

## Result: **Failed**

| Item | Value |
|------|--------|
| **Flow** | boolean-part-2 |
| **Steps** | 34 total |
| **Failed at** | **Step 10/34** |
| **Duration** | ~6.7 min |
| **Exit code** | 1 |

---

## Failed step

**Step 10:** `click "Insert a field"`

**Error:**  
`Insert a field: "+" control did not become visible after hover scan.`

**Meaning:** After "Save and proceed" (step 9), the test is on the content type builder (empty, only Title). The automation tries to open the "Add field" picker by hovering and clicking the "+" control. Within the 20s hover scan, the "+" never became visible, so the step failed.

**Location:** `rules/core/actionRules.ts` line 727  
`throw new Error('Insert a field: "+" control did not become visible after hover scan.');`

---

## Steps executed before failure

| Step | Action | Target |
|------|--------|--------|
| 1 | click | Content Models |
| 2 | verify | Content Types |
| 3 | click | New Content Type |
| 4 | verify | Create New |
| 5 | click | Create New (modal) |
| 6 | enter | Name = Boolean-Demo-{unique} |
| 7 | enter | Description = Boolean-Demo-{unique} |
| 8 | click | Single (Type) |
| 9 | click | Save and proceed |
| **10** | **click** | **Insert a field** ❌ |

---

## Report artifacts

- **HTML report:** `reports/latest/html/index.html` (open in browser; may still show a previous run until you re-run)
- **JSON report:** `reports/latest/flows-results.json` (overwritten per run)
- **Screenshot (on failure):** under `test-results/` for the boolean-part-2 run, if the reporter wrote it

---

## Recommendation

The "Insert a field" logic relies on the "+" appearing on hover in the empty builder. If the UI no longer shows the "+" in the same way or needs a different interaction (e.g. click on "Add field" text, or wait longer for the builder to finish loading), the hover scan in `actionRules.ts` may need to be adjusted or given a longer timeout for the empty-state path. Alternatively, add a short wait after "Save and proceed" before step 10 so the builder is fully ready before the hover scan.

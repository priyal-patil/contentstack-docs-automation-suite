# Modular Blocks Part 2 – Blockers and Fixes

## Flow summary
- **Steps:** 38 (create CT "Page-{unique}" → add Intro, Metadata, SEO, Page Components → 3 blocks: Banner, Quote, Sections → Save).
- **Last known state:** Steps 1–10 pass; **step 11** (click "Multi Line Textbox" in field picker) is the main recurring failure.

---

## Blocker 1: Step 11 – Click "Multi Line Textbox (doc step)" (field picker tile)

### What happens
- **Scenario A:** Element not found (timeout on `toBeVisible`).  
  Field picker may not be open yet, or the tile selector does not match the DOM (e.g. only the inner `<p>` has `data-test-id`, not the clickable tile).
- **Scenario B:** Element is visible but **click times out**.  
  The tile is found but the click never completes (overlay, or another element intercepting the click).

### Root causes
1. **Timing:** After "Insert a field" the picker opens asynchronously; step 11 can run before tiles are visible or stable.
2. **Selector:** The clickable target is the tile `div.FieldTypeSelector__field-tile`; the test-id is on the inner `<p>`. We need to click the tile, not only the `<p>`.
3. **Click interception:** Something (overlay, animation, focus) can block the normal click; a force click is needed as fallback.

### Fixes applied
- Selector: use tile div `div.FieldTypeSelector__field-tile:has([data-test-id="cs-ct-select-field-multi_line"])` and fallback `has-text("Multi Line Textbox")`.
- After "Insert a field": wait for `div.FieldTypeSelector__field-tile` and 1.5s so the picker is ready before step 11.
- "Insert a field": only skip when tiles are visible; empty-state path now also waits for field-tile; try direct PurpleAdd click first.
- On click failure for "Multi Line Textbox (doc step)": try `getByText("Multi Line Textbox").click()` or `el.click({ force: true })`.

### What can still fail
- If the picker is in a different DOM tree (e.g. portal/iframe), our selectors might not see it.
- If the first click times out and the catch path does not run (e.g. different error type), we never retry with force.

---

## Blocker 2: Step 10 – "Insert a field" (optional / intermittent)

### What happens
- The "+" to add a field is shown on hover in the builder. If we don’t hover the right spot or the UI is in "empty state", the click can miss and the picker never opens.
- Early return used to trigger when any `[class*="FieldTypeSelector"]` was visible (e.g. the bar), so we sometimes skipped clicking and the picker was never opened.

### Fixes applied
- Only skip when `div.FieldTypeSelector__field-tile` is visible (picker is actually open).
- Try direct PurpleAdd click first; then hover scan.
- Empty-state path now waits for field-tile + delay after click, same as general path.

---

## Blocker 3: Step 9 – "Save and proceed" (resolved)

### What happened
- Modal submit button was not clicked (wrong element or dialog not found).
- After submit, we waited for builder markers that sometimes did not appear in time.

### Fixes applied
- Dialog-scoped click for "Save and proceed" (button inside dialog/modal).
- Soft wait for builder (URL or markers); optional wait so the test can continue.

---

## What you can do next

1. **Run with a longer timeout for step 11**  
   In the flow JSON, add for the "Multi Line Textbox (doc step)" step something like:  
   `"expected": { "timeoutMs": 45000 }`  
   so the visible + click wait has more time.

2. **Confirm field picker DOM**  
   When the picker is open, inspect the Multi Line Textbox tile and confirm:
   - It’s in the main document (not in an iframe).
   - The clickable element is `div.FieldTypeSelector__field-tile` and/or the `<p>` with `data-test-id="cs-ct-select-field-multi_line"`.

3. **Force click first for Multi Line Textbox**  
   We can change the rule so that for "Multi Line Textbox (doc step)" we always use `click({ force: true })` (or try it first) to avoid timeout due to interception.

If you want, the next change can be: **always use force click for the Multi Line Textbox (doc step)** so we remove the click timeout as a blocker.

/**
 * Part 2: Fluid Page Components – Example 1 from Modular Blocks doc.
 * Reuses content-models module.selectors.ts; only part-2–specific Properties targets here.
 */

export const CLICK_SELECTORS: Record<string, string> = {
  // Properties: Intro = first Multi Line Textbox row (part-2)
  "Properties (Multi Line Textbox) (doc step)":
    '.ContentTypeField:has(svg[name="MultiLineText"]) [data-test-id$="-option-properties"]',

  // Properties: Metadata = 3rd field (0=Title, 1=Intro, 2=Metadata); use step.nth: 2 (part-2)
  "Properties (Metadata) (doc step)": '[data-test-id="cs-ct-field"] [data-test-id$="-option-properties"]',

  // Properties: Page Components = Modular Blocks field row (part-2)
  "Properties (Modular Blocks) (doc step)":
    '.ContentTypeField:has(svg[name="ModularBlocks"]) [data-test-id$="-option-properties"]',
};

export const INPUT_SELECTORS: Record<string, string> = {};
/**
 * Min/Max Limit doc – Part 2: Example "OR" logic with Modular Blocks (Video + Image blocks, parent & block-level limits).
 * Source: https://www.contentstack.com/docs/developers/create-content-types/minimum-and-maximum-limit
 */

export const CLICK_SELECTORS: Record<string, string> = {
  "Properties (Modular Blocks) (doc step)":
    '.ContentTypeField:has(svg[name="ModularBlocks"]) [data-test-id$="-option-properties"], .ContentTypeField:has-text("Modular Blocks") [data-test-id$="-option-properties"]',
  "Advanced (Modular Blocks) (doc step)":
    '[data-test-id="cs-ct-field-modular-blocks-tab-advanced"], [data-test-id*="modular"][data-test-id*="advanced"], .Tab__item:has-text("Advanced")',
  "Advanced (doc step)":
    '[data-test-id="cs-ct-field-modular-blocks-tab-advanced"], [data-test-id*="modular"][data-test-id*="advanced"], .Tab__item:has-text("Advanced"), [role="tab"]:has-text("Advanced"), button:has-text("Advanced")',
  "Video block (doc step)":
    '.Block:has-text("Video"), [data-test-id*="block"]:has-text("Video"), div[class*="Block"]:has-text("Video"), button:has-text("Video"), [role="button"]:has-text("Video")',
  "Image block (doc step)":
    '.Block:has-text("Image"), [data-test-id*="block"]:has-text("Image"), div[class*="Block"]:has-text("Image"), button:has-text("Image"), [role="button"]:has-text("Image")',
  "Block options (3 dots) Video (doc step)":
    '[data-test-id="cs-Video-block-options"] .Block__option, [data-test-id="cs-video-block-options"] .Block__option, [data-test-id="cs-Video-block-options"], [data-test-id="cs-video-block-options"], div:has(button:has-text("Video")) + [class*="Block__options"] .Block__option, .Block__option:has(svg[name="DotsThreeVertical"])',
  "Block options (3 dots) Image (doc step)":
    '[data-test-id="cs-Image-block-options"] .Block__option, [data-test-id="cs-image-block-options"] .Block__option, [data-test-id="cs-Image-block-options"], [data-test-id="cs-image-block-options"], div:has(button:has-text("Image")) + [class*="Block__options"] .Block__option, .Block__option:has(svg[name="DotsThreeVertical"])',
  "Edit Block (doc step)":
    '[data-test-id="cs-cb-edit-block"], [role="menuitem"]:has-text("Edit Block"), div[role="menuitem"]:has-text("Edit Block")',
  "Properties (block row) (doc step)":
    'div:has(button:has-text("Add New Block")) div:has(button[active]) button:has(svg[name="Sliders"]), div:has(button:has-text("Add New Block")):has(button:has-text("Video")) button:has(svg[name="Sliders"]), div:has(button:has-text("Add New Block")) [data-test-id$="-option-properties"], .Block button:has(svg[name="Sliders"]), [data-test-id*="block"] [data-test-id$="-option-properties"]',
  "Advanced (Modular Blocks block) (doc step)":
    '[data-test-id*="tab-advanced"], .Tab__item:has-text("Advanced"), [role="tab"]:has-text("Advanced"), button:has-text("Advanced"), [class*="Tab"]:has-text("Advanced"), [class*="tab"]:has-text("Advanced")',
};

export const INPUT_SELECTORS: Record<string, string> = {
  "Set Minimum Limit (doc step)":
    '[data-test-id*="minimum"] input, [data-test-id*="min-limit"] input, input[placeholder*="Minimum"], input[name*="minimum"], label:has-text("Minimum") + input, label:has-text("Set Minimum") ~ input',
  "Set Maximum Limit (doc step)":
    '[data-test-id*="maximum"] input, [data-test-id*="max-limit"] input, input[placeholder*="Maximum"], input[name*="maximum"], label:has-text("Maximum") + input, label:has-text("Set Maximum") ~ input, [aria-label*="maximum"] input',
};

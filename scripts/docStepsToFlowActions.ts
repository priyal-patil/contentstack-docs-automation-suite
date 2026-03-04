/**
 * Map document step text (from analyzeDocUrl) to flow actions { action, target, value? }.
 * Targets must exist in module or flow-specific selectors (e.g. "Content Models", "Save and Close (doc step)").
 */

export type FlowStep = {
  action: "click" | "enter" | "verify";
  target: string;
  value?: string;
  nth?: number;
  expected?: Record<string, unknown>;
};

/** Known field type names in doc text -> flow target */
const FIELD_TARGETS: Record<string, string> = {
  "single line textbox": "Single Line Textbox (doc step)",
  "multi line textbox": "Multi Line Textbox (doc step)",
  "rich text editor": "Rich Text Editor (doc step)",
  "modular blocks": "Modular Blocks (doc step)",
  "group": "Group (doc step)",
  "file": "File (doc step)",
  "link": "Link (doc step)",
  "number": "Number (doc step)",
  "date": "Date (doc step)",
  "boolean": "Boolean (doc step)",
  "reference": "Reference (doc step)",
  "global field": "Global (SEO) (doc step)",
  "json": "JSON (doc step)",
  "markdown": "Markdown (doc step)",
};

/** Phrase patterns (order matters: more specific first) */
const PHRASE_TO_STEP: Array<{ pattern: RegExp; action: FlowStep["action"]; target: string; value?: string }> = [
  { pattern: /save\s+and\s+close|click\s+save\s+and\s+close/i, action: "click", target: "Save and Close (doc step)" },
  { pattern: /click\s+save\s+to\s+update|click\s+save\s+or\s+save\s+and\s+close/i, action: "click", target: "Save and Close (doc step)" },
  { pattern: /save\s+the\s+content\s+type/i, action: "click", target: "Save and Close (doc step)" },
  { pattern: /click\s+save\s*[\.\s]|^save\s+or\s+save\s+and\s+close/i, action: "click", target: "Save (doc step)" },
  // Proceed / Select Extension before "custom field" so "click on Proceed" and "under Select Extension/Apps" win
  { pattern: /click\s+on\s+proceed|click\s+proceed|proceed\s+button|and\s+click\s+on\s+proceed/i, action: "click", target: "Proceed (doc step)" },
  { pattern: /under\s+select\s+extension|select\s+extension\/?apps?|add\s+the\s+extension\/?app\s+you\s+want/i, action: "click", target: "Select Extension/Apps (doc step)" },
  { pattern: /select\s+extension|extension\/?app|choose\s+an\s+extension/i, action: "click", target: "Select Extension/Apps (doc step)" },
  // Content Type Builder / navigation (before "non-localizable" so "mark a non-localizable field" doesn't match)
  { pattern: /open\s+the\s+content\s+type\s+builder|content\s+type\s+builder\s+page/i, action: "click", target: "Content Models" },
  { pattern: /select\s+a\s+field\s+from|select\s+a\s+field\s+from\s+a\s+group|click\s+a\s+field/i, action: "click", target: "Properties (doc step)" },
  { pattern: /field\s+visibility\s+rules|click\s+field\s+visibility\s+rules/i, action: "click", target: "Field Visibility Rules (doc step)" },
  { pattern: /create\s+new\s+rule|click\s+create\s+new\s+rule/i, action: "click", target: "Create New Rule (doc step)" },
  { pattern: /switch\s+to\s+the\s+advanced\s+tab|advanced\s+tab\s+in\s+the\s+field\s+properties/i, action: "click", target: "Advanced (doc step)" },
  { pattern: /show\s+as\s+tab|enable\s+the\s+show\s+as\s+tab|show\s+as\s+tab\s+toggle/i, action: "click", target: "Show as Tab (doc step)" },
  { pattern: /properties\s+icon|click\s+the\s+properties\s+icon|hover\s+over.*properties/i, action: "click", target: "Properties (doc step)" },
  { pattern: /toggle\s+non-?localizable|enable\s+non-?localizable|non-?localizable\s+to\s+enabled/i, action: "click", target: "Non-localizable (doc step)" },
  { pattern: /non-?localizable/i, action: "click", target: "Non-localizable (doc step)" },
  { pattern: /url\s+field|click\s+the\s+url\s+field|add\s+a\s+url\s+field/i, action: "click", target: "URL (doc step)" },
  { pattern: /add\s+the\s+custom\s+field|add\s+the\s+required\s+fields\s+along\s+with\s+the\s+custom\s+field/i, action: "click", target: "Custom (doc step)" },
  { pattern: /custom\s+properties\s+modal|custom\s+field/i, action: "click", target: "Custom (doc step)" },
  { pattern: /go\s+to\s+your\s+stack|click\s+the\s+content\s+models\s+icon/i, action: "click", target: "Content Models" },
  { pattern: /navigate\s+to\s+your\s+stack|open\s+the\s+content\s+type(?!\s+builder)|content\s+models|go\s+to\s+content\s+models/i, action: "click", target: "Content Models" },
  { pattern: /new\s+content\s+type|create\s+a\s+content\s+type|click\s+new\s+content\s+type|\+\s*new\s+content\s+type/i, action: "click", target: "New Content Type" },
  { pattern: /create\s+new\s+content\s+type|create\s+new\s*[\.\s]|modal.*create/i, action: "click", target: "Create New" },
  { pattern: /save\s+and\s+proceed|click\s+create\s*[\.\s]|submit\s+to\s+open\s+builder/i, action: "click", target: "Save and proceed" },
  { pattern: /single\s*[\s(]type|type\s+single/i, action: "click", target: "Single (Type)" },
  { pattern: /insert\s+a\s+field|add\s+a\s+field|click\s+the\s+\+\s*\(|add\s+field/i, action: "click", target: "Insert a field" },
  { pattern: /dismiss\s+properties|click\s+builder\s+area|click\s+outside\s+the\s+panel/i, action: "click", target: "Builder area (dismiss properties)" },
  { pattern: /edit\s+properties\s+panel|properties\s+panel\s+appears|click\s+the\s+field\s+you\s+want/i, action: "click", target: "Properties (doc step)" },
  { pattern: /advanced\s+tab|in\s+the\s+advanced\s+tab|click\s+advanced/i, action: "click", target: "Advanced (doc step)" },
  { pattern: /enable\s+the\s+multiple\s+toggle|multiple\s+toggle|enable\s+multiple/i, action: "click", target: "Multiple (doc step)" },
  { pattern: /set\s+minimum\s+limit|minimum\s+limit|under\s+set\s+minimum/i, action: "enter", target: "Set Minimum Limit (doc step)", value: "1" },
  { pattern: /set\s+maximum\s+limit|maximum\s+limit|under\s+set\s+maximum/i, action: "enter", target: "Set Maximum Limit (doc step)", value: "5" },
  { pattern: /vertical\s+ellipsis|three\s+dots|click\s+the\s+ellipsis/i, action: "click", target: "vertical ellipsis" },
  { pattern: /settings\s+option|click\s+settings/i, action: "click", target: "Settings" },
  { pattern: /edit\s+option|click\s+edit\s+to\s+open|click\s+the\s+title\s+of\s+a\s+content\s+type/i, action: "click", target: "Edit" },
  { pattern: /description\s+field|enter\s+description/i, action: "enter", target: "Description", value: "AUTO-{unique}" },
  { pattern: /name\s+field|content\s+type\s+name|enter\s+name/i, action: "enter", target: "Name", value: "{unique}" },
  { pattern: /display\s+name|enter\s+display\s+name/i, action: "enter", target: "Display Name (doc step)", value: "Field Name" },
  { pattern: /update\s+button|click\s+update/i, action: "click", target: "Update" },
  { pattern: /\+?\s*new\s+block|add\s+block|create\s+block/i, action: "click", target: "+ New Block (doc step)" },
  { pattern: /create\s+block\s+button|click\s+create\s+block/i, action: "click", target: "Create (doc step)" },
];

/**
 * Convert a single doc step sentence to one or more flow steps.
 */
export function stepTextToFlowActions(stepText: string): FlowStep[] {
  const out: FlowStep[] = [];
  const lower = stepText.toLowerCase().trim();
  if (!lower) return out;

  // Only enforce "Left Navigation" when doc explicitly mentions it.
  if (/(content\s+models).*(left\s+navigation)/i.test(stepText) || /(left\s+navigation).*(content\s+models)/i.test(stepText)) {
    out.push({
      action: "verify",
      target: "Content Models",
      expected: { within: "Left Navigation", withinStrict: true, labelEquals: "Content Models", labelMatch: "contains" } as Record<string, unknown>,
    } as FlowStep);
    out.push({ action: "click", target: "Content Models" });
    return out;
  }

  // Multi-step: one sentence that describes both "Advanced tab" and "Show as Tab" (e.g. show-as-tab doc step 3)
  if (/advanced\s+tab/i.test(stepText) && /show\s+as\s+tab/i.test(stepText)) {
    out.push({ action: "click", target: "Advanced (doc step)" });
    out.push({ action: "click", target: "Show as Tab (doc step)" });
    return out;
  }

  // Check phrase patterns first
  for (const { pattern, action, target, value } of PHRASE_TO_STEP) {
    if (pattern.test(stepText)) {
      out.push(value ? { action, target, value } : { action, target });
      return out;
    }
  }

  // Check for "Add the following fields: X, Y, Z" or bullet list style "Single Line Textbox: ..."
  const addFieldsMatch = stepText.match(/add\s+(?:the\s+following\s+)?fields?\s*[:\s]+(.+)/i) ||
    stepText.match(/fields?\s+inside\s+the\s+(?:group|block)[:\s]+(.+)/i);
  if (addFieldsMatch) {
    const list = addFieldsMatch[1].split(/[,;]|\band\b/).map((s) => s.trim()).filter(Boolean);
    for (const item of list) {
      const fieldTarget = Object.entries(FIELD_TARGETS).find(([key]) =>
        item.toLowerCase().includes(key)
      )?.[1];
      if (fieldTarget) {
        out.push({ action: "click", target: "Insert a field" });
        out.push({ action: "click", target: fieldTarget });
        out.push({ action: "click", target: "Builder area (dismiss properties)" });
      }
    }
    if (out.length > 0) return out;
  }

  // Check for field type name alone (e.g. "Single Line Textbox", "File")
  for (const [key, target] of Object.entries(FIELD_TARGETS)) {
    if (lower.includes(key) && (lower.includes("add") || lower.includes("click") || lower.includes("insert") || lower.length < 50)) {
      out.push({ action: "click", target: "Insert a field" });
      out.push({ action: "click", target });
      out.push({ action: "click", target: "Builder area (dismiss properties)" });
      return out;
    }
  }

  return out;
}

/**
 * Convert full list of doc step strings to flow steps (deduplicated where sensible).
 */
export function docStepsToFlowSteps(stepTexts: string[]): FlowStep[] {
  const steps: FlowStep[] = [];
  const seen = new Set<string>();
  for (const text of stepTexts) {
    const converted = stepTextToFlowActions(text);
    for (const s of converted) {
      const key = `${s.action}:${s.target}:${s.value ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      steps.push(s);
    }
  }
  return steps;
}

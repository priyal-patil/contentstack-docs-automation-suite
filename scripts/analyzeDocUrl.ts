/**
 * Document analyzer: fetch a docs URL, parse HTML, and detect:
 * - Whether the page describes in-app steps (executable)
 * - Sections/parts that each have their own steps (e.g. Example 1, Example 2)
 * - Raw step text for conversion to flow steps
 *
 * Used by bulkIngestFromUrls with --analyze-docs to auto-detect executable docs
 * and create flow/selector files without requiring type, dom_file, or steps_file.
 */

import axios from "axios";
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export type DocPart = {
  id: string;
  title: string;
  /** Section anchor/slug if present (e.g. example-1-banner) */
  slug?: string;
  steps: string[];
  /** If this part lists "Add the following fields", field names in order */
  fields?: string[];
};

export type DocAnalysisResult = {
  url: string;
  /** True if the doc contains "perform the following steps" / "log in" + step-like content */
  hasSteps: boolean;
  /** Sections that each have their own steps (e.g. main steps + Example 1, Example 2) */
  parts: DocPart[];
  /** Raw body text for fallback step detection */
  bodySnippet?: string;
  error?: string;
};

const STEP_TRIGGERS = [
  /perform\s+the\s+following\s+steps/i,
  /follow\s+these\s+steps/i,
  /log\s+in\s+to\s+your\s+contentstack/i,
  /log\s+in\s+to\s+your\s+\[?contentstack/i,
  /to\s+set\s+[^,]+,\s*log\s+in/i,
  /navigate\s+to\s+your\s+stack/i,
  /click\s+the\s+field/i,
  /in\s+the\s+advanced\s+tab/i,
  /edit\s+properties\s+panel/i,
];

const NUMERIC_STEP = /^\s*(\d+)\.\s+(.+)$/;
const FIELD_LINE = /^[-*]?\s*(?:add\s+)?(?:the\s+)?(.*?)(?:\s*:\s*|$)/i;

/** Slugify heading text for part id suffix */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

/** Extract text from a cheerio node, stripping extra whitespace */
function getText($: cheerio.CheerioAPI, el: AnyNode): string {
  return $(el).text().replace(/\s+/g, " ").trim();
}

/** Check if block of text suggests in-app steps */
function suggestsSteps(text: string): boolean {
  const lower = text.toLowerCase();
  return STEP_TRIGGERS.some((re) => re.test(text)) || /\b(click|navigate|enter|select|enable|set)\s+/i.test(lower);
}

/** Parse ordered list into step strings (e.g. "1. Navigate to..." -> "Navigate to...") */
function parseOlSteps($: cheerio.CheerioAPI, ol: cheerio.Cheerio<AnyNode>): string[] {
  const steps: string[] = [];
  ol.find("> li").each((_, li) => {
    const t = getText($, li);
    if (t) steps.push(t.replace(/^\d+\.\s*/, "").trim());
  });
  return steps;
}

/** Parse unordered list as "Add the following fields" -> field names */
function parseFieldList($: cheerio.CheerioAPI, ul: cheerio.Cheerio<AnyNode>): string[] {
  const fields: string[] = [];
  ul.find("> li").each((_, li) => {
    const t = getText($, li);
    const match = t.match(FIELD_LINE);
    const name = match ? match[1].trim() : t;
    if (name && !/^https?:\/\//.test(name)) fields.push(name);
  });
  return fields;
}

/** Extract numbered steps from a paragraph (e.g. "1. Navigate... 2. Click...") */
function extractNumberedStepsFromText(text: string): string[] {
  const steps: string[] = [];
  const lines = text.split(/\n/);
  for (const line of lines) {
    const m = line.match(NUMERIC_STEP);
    if (m) steps.push(m[2].trim());
  }
  if (steps.length === 0) {
    const inline = text.match(/(\d+)\.\s*([^0-9]+?)(?=\s*\d+\.|$)/g);
    if (inline) for (const s of inline) steps.push(s.replace(/^\d+\.\s*/, "").trim());
  }
  return steps;
}

/**
 * Fetch doc URL and analyze: detect hasSteps and parts (sections with their own steps).
 */
export async function analyzeDocUrl(url: string): Promise<DocAnalysisResult> {
  const result: DocAnalysisResult = { url, hasSteps: false, parts: [] };

  try {
    const res = await axios.get(url, {
      timeout: 15000,
      headers: { "User-Agent": "Contentstack-Doc-Analyzer/1.0" },
      maxRedirects: 5,
      validateStatus: (s) => s === 200,
    });
    const html = res.data as string;
    const $ = cheerio.load(html);

    // Focus on main content: common doc site containers (Contentstack and similar)
    const main =
      $('article, [role="main"], .documentation, .doc-content, .content-area, .markdown-body, main, [class*="content"], [class*="document"]').first() ||
      $("body");

    const bodyText = main.text().replace(/\s+/g, " ");
    result.bodySnippet = bodyText.slice(0, 3000);

    if (!suggestsSteps(bodyText)) {
      return result;
    }

    // Only treat as executable when we also find structured steps (ol or numbered list)
    const hasOl = main.find("ol").length > 0;
    const hasNumberedSteps = /\d+\.\s+(?:click|navigate|open|enter|select|enable|set|add|create|log\s+in)/i.test(bodyText);
    if (!hasOl && !hasNumberedSteps) {
      return result;
    }
    result.hasSteps = true;

    // Collect h2/h3 and their following content blocks
    const headings = main.find("h1, h2, h3").toArray();
    const parts: DocPart[] = [];
    let partIndex = 0;

    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      const tag = ((h as { tagName?: string }).tagName || "").toLowerCase();
      const title = getText($, h);
      if (!title) continue;

      // Skip generic headings that are unlikely to be scenario sections
      if (/^(overview|introduction|note|related|more\s+articles|see\s+also)$/i.test(title)) continue;

      const slug = slugify(title);
      const nextHeading = headings[i + 1];
      const $next = nextHeading ? $(nextHeading) : null;
      const block: cheerio.Cheerio<AnyNode> = $next?.length
        ? $(h).nextUntil(nextHeading!)
        : $(h).nextAll();

      const steps: string[] = [];
      const fields: string[] = [];

      block.each((_, el: AnyNode) => {
        const $el = $(el);
        const tagName = ((el as { tagName?: string }).tagName || "").toLowerCase();
        if (tagName === "ol") {
          steps.push(...parseOlSteps($, $el));
        } else if (tagName === "ul") {
          const txt = block.text();
          if (/add\s+(the\s+)?following\s+fields|fields?\s+inside\s+the/i.test(txt) || fields.length > 0) {
            fields.push(...parseFieldList($, $el));
          }
        } else if (tagName === "p" || tagName === "div") {
          const t = getText($, el);
          if (t.length > 30 && (/\d+\.\s+\w+/.test(t) || /click|navigate|enter|select|save\s+and\s+close/i.test(t))) {
            steps.push(...extractNumberedStepsFromText(t));
          }
        }
      });

      // If this section has steps or "add the following fields", treat as a part
      const hasStepContent = steps.length > 0 || fields.length > 0 || (tag !== "h1" && suggestsSteps(block.text()));
      if (hasStepContent || (parts.length === 0 && result.hasSteps)) {
        partIndex++;
        const partId = partIndex === 1 && headings.length <= 1 ? "main" : `part-${partIndex}`;
        parts.push({
          id: partId,
          title,
          slug: slug || undefined,
          steps: steps.length ? steps : (fields.length ? ["Add fields: " + fields.join(", ")] : []),
          fields: fields.length ? fields : undefined,
        });
      }
    }

    // If we found no structured parts but body has steps, add one "main" part with steps from first ol
    if (parts.length === 0 && result.hasSteps) {
      const firstOl = main.find("ol").first();
      const steps = firstOl.length ? parseOlSteps($, firstOl) : extractNumberedStepsFromText(bodyText.slice(0, 2000));
      if (steps.length > 0) {
        result.parts = [{ id: "main", title: "Steps", steps }];
      }
    } else {
      result.parts = parts;
    }

    // Fallback: if any part has empty steps but doc hasSteps, extract from first <ol> or numbered text in body
    if (result.hasSteps && result.parts.length > 0) {
      const firstOl = main.find("ol").first();
      const fallbackSteps =
        firstOl.length > 0
          ? parseOlSteps($, firstOl)
          : extractNumberedStepsFromText(bodyText.slice(0, 4000));
      for (const part of result.parts) {
        if (part.steps.length === 0 && fallbackSteps.length > 0) {
          part.steps = [...fallbackSteps];
        }
      }
    }
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
  }
  return result;
}

// core/healing/domExtract.ts
/**
 * Produces `StructuredElement[]` from either a saved HTML snapshot (offline, via cheerio) or a live
 * Playwright page. Both paths emit the same shape so `elementMatcher` stays a pure, browser-free
 * function that can be unit-tested from fixtures.
 *
 * Snapshot files are the ones `core/executor.ts` already writes on failure:
 *   reports/<dir>/flow-screenshots/<flow>-step-N.html
 *   data/dom/<Project>/<module>/<flow>-step-N-failure.html
 */
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import type { Page } from "@playwright/test";
import type { StructuredElement } from "./types";

/** Tags/attributes worth considering as heal candidates. Keeps the candidate set bounded. */
const CANDIDATE_SELECTOR = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  "label",
  "summary",
  "[role]",
  "[data-test-id]",
  "[data-testid]",
  "[aria-label]",
  "[onclick]",
  "[tabindex]",
  "h1",
  "h2",
  "h3",
  "h4",
  "li",
  "td",
  "th",
].join(",");

const collapse = (s: string | undefined | null): string | undefined => {
  if (!s) return undefined;
  const out = String(s).replace(/\s+/g, " ").trim();
  return out.length ? out : undefined;
};

/** Truncate long text so snapshots and audit logs stay readable. */
const clip = (s: string | undefined, max = 160): string | undefined =>
  s && s.length > max ? `${s.slice(0, max)}…` : s;

/**
 * Implicit ARIA role for the common interactive tags. Snapshots have no accessibility tree, so we
 * approximate one — enough for role+text matching, which is all the matcher needs.
 */
function implicitRole(tag: string, type?: string): string | undefined {
  switch (tag) {
    case "button":
      return "button";
    case "a":
      return "link";
    case "select":
      return "combobox";
    case "textarea":
      return "textbox";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
      return "heading";
    case "li":
      return "listitem";
    case "input":
      if (!type) return "textbox";
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      if (type === "button" || type === "submit" || type === "reset") return "button";
      return "textbox";
    default:
      return undefined;
  }
}

/** Extract candidate elements from a saved HTML snapshot. No browser required. */
export function extractFromHtml(html: string): StructuredElement[] {
  const $ = cheerio.load(html);
  const out: StructuredElement[] = [];

  // Precompute a DOM path per node by walking down from the root, so paths are stable and comparable.
  const pathOf = new Map<any, string>();
  const walk = (node: any, prefix: string) => {
    const $node = $(node);
    const kids = $node.children().toArray();
    const seen = new Map<string, number>();
    for (const kid of kids) {
      const tag = String((kid as any).tagName || (kid as any).name || "").toLowerCase();
      if (!tag) continue;
      const n = (seen.get(tag) ?? 0) + 1;
      seen.set(tag, n);
      const p = prefix ? `${prefix}>${tag}:nth-of-type(${n})` : tag;
      pathOf.set(kid, p);
      walk(kid, p);
    }
  };
  const root = $("html").get(0) ?? $.root().get(0);
  if (root) {
    pathOf.set(root, "html");
    walk(root, "html");
  }

  $(CANDIDATE_SELECTOR).each((_i, el) => {
    const $el = $(el);
    const tag = String((el as any).tagName || (el as any).name || "").toLowerCase();
    if (!tag) return;

    const classAttr = $el.attr("class");
    const type = $el.attr("type");
    const domPath = pathOf.get(el) ?? tag;

    // Index among same-tag siblings, mirroring the nth-of-type in domPath.
    const m = /:nth-of-type\((\d+)\)$/.exec(domPath);
    const siblingIndex = m ? Number(m[1]) - 1 : 0;

    out.push({
      tag,
      role: collapse($el.attr("role")) ?? implicitRole(tag, type),
      text: clip(collapse($el.text())),
      id: collapse($el.attr("id")),
      classes: classAttr ? classAttr.split(/\s+/).filter(Boolean) : [],
      testId: collapse($el.attr("data-test-id") ?? $el.attr("data-testid")),
      ariaLabel: collapse($el.attr("aria-label")),
      name: collapse($el.attr("name")),
      title: collapse($el.attr("title")),
      href: collapse($el.attr("href")),
      placeholder: collapse($el.attr("placeholder")),
      type: collapse(type),
      domPath,
      siblingIndex,
      surroundingText: clip(collapse($el.parent().text()), 200),
    });
  });

  return out;
}

/** Read a snapshot file from disk and extract it. Returns `[]` when the file is absent. */
export function extractFromSnapshotFile(absPath: string): StructuredElement[] {
  try {
    if (!fs.existsSync(absPath)) return [];
    return extractFromHtml(fs.readFileSync(absPath, "utf8"));
  } catch {
    return [];
  }
}

/**
 * Extract candidates from a live page. Runs in the browser so it can report real visibility, which
 * a static snapshot cannot.
 */
export async function extractFromPage(page: Page): Promise<StructuredElement[]> {
  return page
    .$$eval(CANDIDATE_SELECTOR, (nodes) => {
      const collapseIn = (s: string | null | undefined): string | undefined => {
        if (!s) return undefined;
        const o = s.replace(/\s+/g, " ").trim();
        return o.length ? o : undefined;
      };
      const clipIn = (s: string | undefined, max = 160): string | undefined =>
        s && s.length > max ? `${s.slice(0, max)}…` : s;

      const roleIn = (tag: string, type?: string): string | undefined => {
        if (tag === "button") return "button";
        if (tag === "a") return "link";
        if (tag === "select") return "combobox";
        if (tag === "textarea") return "textbox";
        if (["h1", "h2", "h3", "h4"].includes(tag)) return "heading";
        if (tag === "li") return "listitem";
        if (tag === "input") {
          if (!type) return "textbox";
          if (type === "checkbox") return "checkbox";
          if (type === "radio") return "radio";
          if (["button", "submit", "reset"].includes(type)) return "button";
          return "textbox";
        }
        return undefined;
      };

      const pathTo = (el: Element): string => {
        const parts: string[] = [];
        let cur: Element | null = el;
        while (cur && cur.nodeType === 1) {
          const tag = cur.tagName.toLowerCase();
          if (tag === "html") {
            parts.unshift("html");
            break;
          }
          const parent: Element | null = cur.parentElement;
          if (!parent) {
            parts.unshift(tag);
            break;
          }
          let n = 0;
          for (const sib of Array.from(parent.children)) {
            if (sib.tagName.toLowerCase() === tag) {
              n += 1;
              if (sib === cur) break;
            }
          }
          parts.unshift(`${tag}:nth-of-type(${n})`);
          cur = parent;
        }
        return parts.join(">");
      };

      return nodes.map((el) => {
        const tag = el.tagName.toLowerCase();
        const type = el.getAttribute("type") ?? undefined;
        const domPath = pathTo(el);
        const m = /:nth-of-type\((\d+)\)$/.exec(domPath);
        const rect = el.getBoundingClientRect();
        return {
          tag,
          role: collapseIn(el.getAttribute("role")) ?? roleIn(tag, type),
          text: clipIn(collapseIn((el as HTMLElement).innerText ?? el.textContent)),
          id: collapseIn(el.getAttribute("id")),
          classes: (el.getAttribute("class") ?? "").split(/\s+/).filter(Boolean),
          testId:
            collapseIn(el.getAttribute("data-test-id")) ??
            collapseIn(el.getAttribute("data-testid")),
          ariaLabel: collapseIn(el.getAttribute("aria-label")),
          name: collapseIn(el.getAttribute("name")),
          title: collapseIn(el.getAttribute("title")),
          href: collapseIn(el.getAttribute("href")),
          placeholder: collapseIn(el.getAttribute("placeholder")),
          type: collapseIn(type),
          domPath,
          siblingIndex: m ? Number(m[1]) - 1 : 0,
          surroundingText: clipIn(
            collapseIn((el.parentElement as HTMLElement | null)?.innerText),
            200
          ),
          visible: rect.width > 0 && rect.height > 0,
        };
      });
    })
    .catch(() => [] as StructuredElement[]);
}

/**
 * Persist the current page DOM for the next attempt. Every failed attempt saves a *fresh* snapshot —
 * the app may have changed again between runs, so the most recent failure state is always the
 * reference for the next attempt.
 *
 * Keyed `{snapshotDir}/healing/{flowId}/{stepIndex}/{attempt}.{html,json}` so it survives process
 * restarts, which is required: "next attempt" may be a separate process.
 */
export async function saveAttemptSnapshot(
  page: Page,
  opts: { snapshotDir: string; flowId: string; stepIndex: number; attempt: number }
): Promise<{ htmlPath: string; jsonPath: string } | undefined> {
  try {
    const dir = path.join(
      opts.snapshotDir,
      "healing",
      opts.flowId.replace(/[^a-zA-Z0-9_.-]/g, "_"),
      String(opts.stepIndex)
    );
    fs.mkdirSync(dir, { recursive: true });

    const htmlPath = path.join(dir, `${opts.attempt}.html`);
    const jsonPath = path.join(dir, `${opts.attempt}.json`);

    const html = await page.content().catch(() => "");
    if (!html) return undefined;
    fs.writeFileSync(htmlPath, html, "utf8");

    // The JSON extract is what the matcher consumes; the raw HTML is kept for human debugging.
    const structured = await extractFromPage(page);
    fs.writeFileSync(jsonPath, JSON.stringify(structured, null, 2), "utf8");

    return { htmlPath, jsonPath };
  } catch {
    return undefined;
  }
}

/** Most recent saved attempt snapshot for a step, or undefined if none exist. */
export function latestAttemptSnapshot(
  snapshotDir: string,
  flowId: string,
  stepIndex: number
): string | undefined {
  try {
    const dir = path.join(
      snapshotDir,
      "healing",
      flowId.replace(/[^a-zA-Z0-9_.-]/g, "_"),
      String(stepIndex)
    );
    if (!fs.existsSync(dir)) return undefined;
    const html = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".html"))
      .map((f) => ({ f, n: Number(f.replace(/\.html$/, "")) }))
      .filter((x) => Number.isFinite(x.n))
      .sort((a, b) => b.n - a.n);
    return html.length ? path.join(dir, html[0].f) : undefined;
  } catch {
    return undefined;
  }
}

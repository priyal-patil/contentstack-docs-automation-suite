/**
 * Render a Contentstack docs page and extract its structure.
 *
 * Why Playwright and not axios+cheerio (as `scripts/analyzeDocUrl.ts` does): the docs site is
 * Next.js RSC-streamed. A plain GET returns HTML whose `body` text length is 0 — no <h1>, no <li>,
 * and none of the step text. Static parsing silently reports "no steps" for every page. The content
 * only exists after JS runs.
 *
 * Two more site facts this encodes:
 *  - `waitUntil: "networkidle"` never settles (analytics keep the connection busy) — wait for <h1>.
 *  - A procedure is usually split across several <ol> elements, broken up by "Click to enlarge"
 *    images. Steps must be concatenated across all article <ol>s in DOM order.
 */

import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { chromium, type Browser } from "@playwright/test";
import type { DocSnapshot } from "./types";

/** The docs article body. Breadcrumbs live in a sibling <nav>, outside this container. */
const ARTICLE_SELECTORS = [".docs-redesign-article", "main.docs-section", "main", "article"];

const SNAPSHOT_DIR = path.join("data", "doc-snapshots");

/** Phrases that make a doc section conditional rather than part of the linear procedure. */
const CONDITIONAL_CUES = [
  /\bonly if\b/i,
  /\bskip (?:ahead|this|to)\b/i,
  /\bwhen you need this\b/i,
  /\bif (?:the|your) \w+ already\b/i,
  /\bfor a fresh\b/i,
  /\boptional\b/i,
];

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Docs bold two very different things: UI element names ("+ New Project", "Content type name")
 * and sentence lead-ins in checklists ("Preview thoroughly.", "Connect it to your Contentstack
 * stack:"). Only the former is a `labelEquals` candidate; treating lead-ins as labels produces
 * false "uncovered doc step" findings.
 */
export function isUiLabelShaped(label: string): boolean {
  const text = label.replace(/:$/, "").trim();
  if (!text || text.length > 60) return false;
  // A trailing period means it is a sentence, not a control.
  if (/[.!?]$/.test(text)) return false;
  // Second person / contractions never appear in a UI label, but dominate prose emphasis.
  if (/\b(it|its|you|your|yours|we|our|they|their|don't|doesn't|isn't|won't|can't)\b/i.test(text)) return false;
  if (text.split(/\s+/).length > 6) return false;
  return true;
}

/** data/doc-snapshots/<Project>/<url-slug>.json */
export function snapshotPath(project: string, url: string): string {
  const slug = url
    .replace(/^https?:\/\/(www\.)?contentstack\.com\/docs\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return path.join(SNAPSHOT_DIR, project, `${slug}.json`);
}

export function readSnapshot(project: string, url: string): DocSnapshot | null {
  const p = snapshotPath(project, url);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as DocSnapshot;
  } catch {
    return null;
  }
}

export function writeSnapshot(project: string, snap: DocSnapshot): void {
  const p = snapshotPath(project, snap.url);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(snap, null, 2)}\n`);
}

/**
 * Extract one page. Caller owns the browser so a batch run reuses it.
 */
export async function extractDocContent(browser: Browser, url: string): Promise<DocSnapshot> {
  const page = await browser.newPage();
  const base: DocSnapshot = {
    url,
    finalUrl: url,
    httpStatus: 0,
    title: "",
    lastUpdated: null,
    headings: [],
    orderedSteps: [],
    bullets: [],
    boldLabels: [],
    namedLabels: [],
    conditionalSections: [],
    labelSections: {},
    codeBlockCount: 0,
    text: "",
    contentHash: "",
    fetchedAt: new Date().toISOString(),
  };

  try {
    const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    base.httpStatus = res?.status() ?? 0;
    await page.waitForSelector("h1", { timeout: 30_000 });
    // The article streams in after the <h1>; give the remaining chunks a beat to land.
    await page.waitForTimeout(1500);
    base.finalUrl = page.url();

    const scraped = await page.evaluate((selectors: string[]) => {
      const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

      let root: Element | null = null;
      for (const sel of selectors) {
        root = document.querySelector(sel);
        if (root) break;
      }
      if (!root) root = document.body;

      /** Breadcrumbs are an <ol> inside a <nav>; the article's own lists are not. */
      const isNavList = (el: Element) => !!el.closest("nav");

      const headings: Array<{ level: number; text: string }> = [];
      const olItems: Array<{ text: string; section: string | null }> = [];
      const bullets: string[] = [];

      // One DOM-order walk so each step can be attributed to the heading above it.
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      let currentSection: string | null = null;
      let node = walker.nextNode() as Element | null;
      while (node) {
        const tag = node.tagName.toLowerCase();
        if ((tag === "h2" || tag === "h3") && !isNavList(node)) {
          const text = clean(node.textContent).replace(/\s*link$/i, "");
          if (text) {
            currentSection = text;
            headings.push({ level: tag === "h2" ? 2 : 3, text });
          }
        } else if (tag === "ol" && !isNavList(node)) {
          for (const li of Array.from(node.children)) {
            const text = clean(li.textContent);
            if (text) olItems.push({ text, section: currentSection });
          }
        } else if (tag === "ul" && !isNavList(node)) {
          for (const li of Array.from(node.children)) {
            const text = clean(li.textContent);
            if (text) bullets.push(text);
          }
        }
        node = walker.nextNode() as Element | null;
      }

      // Bold runs need their section too: a label that only ever appears under a conditional
      // heading must not be asserted unconditionally by a flow.
      const boldWithSection: Array<{ label: string; section: string | null }> = [];
      {
        const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
        let sec: string | null = null;
        let n = w.nextNode() as Element | null;
        while (n) {
          const t = n.tagName.toLowerCase();
          if ((t === "h2" || t === "h3") && !isNavList(n)) {
            sec = clean(n.textContent).replace(/\s*link$/i, "") || sec;
          } else if ((t === "strong" || t === "b") && !isNavList(n)) {
            const label = clean(n.textContent);
            if (label) boldWithSection.push({ label, section: sec });
          }
          n = w.nextNode() as Element | null;
        }
      }
      const boldLabels = boldWithSection.map((b) => b.label);

      const lastUpdatedMatch = (root as HTMLElement).innerText.match(/Last updated[^\n]*/);

      return {
        title: clean(document.querySelector("h1")?.textContent),
        lastUpdated: lastUpdatedMatch ? clean(lastUpdatedMatch[0]) : null,
        headings,
        olItems,
        bullets,
        boldLabels,
        boldWithSection,
        codeBlockCount: root.querySelectorAll("pre, code.block, .code-block").length,
        text: (root as HTMLElement).innerText.replace(/\n{3,}/g, "\n\n").trim(),
      };
    }, ARTICLE_SELECTORS);

    base.title = scraped.title;
    base.lastUpdated = scraped.lastUpdated;
    base.headings = scraped.headings
      .filter((h) => h.level === 2 || h.level === 3)
      .map((h) => ({ level: h.level as 2 | 3, text: h.text }));
    base.bullets = scraped.bullets;
    base.codeBlockCount = scraped.codeBlockCount;
    base.text = scraped.text;
    base.contentHash = sha256(scraped.text);

    // Drop any breadcrumb remnant: an item equal to the page title, "Home", or the section name.
    const noise = new Set(["home", scraped.title.toLowerCase()]);
    base.orderedSteps = scraped.olItems
      .filter((it) => !noise.has(it.text.toLowerCase()) && it.text.length > 3)
      .map((it, i) => ({ index: i + 1, text: it.text, section: it.section }));

    // Bold runs end with a colon in field lists ("Content type name:"); a UI label does not
    // include the colon, so normalize it away rather than keeping both forms.
    base.boldLabels = Array.from(
      new Set(scraped.boldLabels.map((l) => l.replace(/:$/, "").trim()).filter(Boolean))
    );
    base.namedLabels = base.boldLabels.filter(isUiLabelShaped);

    // label -> the sections it appears in, colon-stripped and de-duplicated.
    const labelSections = new Map<string, Set<string>>();
    for (const { label, section } of scraped.boldWithSection) {
      const key = label.replace(/:$/, "").trim();
      if (!key || !isUiLabelShaped(key)) continue;
      if (!labelSections.has(key)) labelSections.set(key, new Set());
      if (section) labelSections.get(key)!.add(section);
    }
    base.labelSections = Object.fromEntries([...labelSections].map(([k, v]) => [k, [...v]]));

    const bodies = sectionBodies(base.text, base.headings.map((h) => h.text));
    base.conditionalSections = base.headings
      .filter((h) => CONDITIONAL_CUES.some((re) => re.test(bodies.get(h.text) ?? "")))
      .map((h) => h.text);
  } catch (e) {
    base.error = e instanceof Error ? e.message.split("\n")[0] : String(e);
  } finally {
    await page.close().catch(() => {});
  }

  return base;
}

/**
 * Split article text into heading -> body, bounded by the next heading. A fixed-size window
 * bleeds into the following section and mislabels it conditional.
 */
function sectionBodies(text: string, headings: string[]): Map<string, string> {
  const out = new Map<string, string>();
  const positions = headings
    .map((h) => ({ h, at: text.indexOf(h) }))
    .filter((p) => p.at !== -1)
    .sort((a, b) => a.at - b.at);
  positions.forEach((p, i) => {
    const end = i + 1 < positions.length ? positions[i + 1].at : text.length;
    out.set(p.h, text.slice(p.at, end));
  });
  return out;
}

/**
 * Fetch many URLs with one browser. Reuses the cached snapshot unless `refresh` is set,
 * so a repeat run over a module costs nothing.
 */
export async function fetchSnapshots(
  project: string,
  urls: string[],
  opts: { refresh?: boolean; onProgress?: (url: string, snap: DocSnapshot, cached: boolean) => void } = {}
): Promise<Map<string, DocSnapshot>> {
  const out = new Map<string, DocSnapshot>();
  const toFetch: string[] = [];

  for (const url of urls) {
    const cached = opts.refresh ? null : readSnapshot(project, url);
    if (cached) {
      out.set(url, cached);
      opts.onProgress?.(url, cached, true);
    } else {
      toFetch.push(url);
    }
  }

  if (toFetch.length === 0) return out;

  const browser = await chromium.launch({ headless: true });
  try {
    for (const url of toFetch) {
      const snap = await extractDocContent(browser, url);
      // Preserve the previous hash so the caller can report "doc changed since last run".
      const prev = readSnapshot(project, url);
      if (prev && prev.contentHash !== snap.contentHash) {
        (snap as DocSnapshot & { previousHash?: string; previousFetchedAt?: string }).previousHash = prev.contentHash;
        (snap as DocSnapshot & { previousHash?: string; previousFetchedAt?: string }).previousFetchedAt = prev.fetchedAt;
      }
      if (!snap.error) writeSnapshot(project, snap);
      out.set(url, snap);
      opts.onProgress?.(url, snap, false);
    }
  } finally {
    await browser.close();
  }

  return out;
}

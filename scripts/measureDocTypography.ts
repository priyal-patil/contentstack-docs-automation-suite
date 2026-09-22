/**
 * Measures the rendered typography of doc pages so checklist item 1.0 (and the other
 * value-bearing rows) can be updated from what the site actually renders.
 *
 *   npx ts-node scripts/measureDocTypography.ts <url> [<url> ...]
 *   npx ts-node scripts/measureDocTypography.ts --csv data/docs-urls.csv --project Administration
 *
 * Writes reports/latest/typography-measurements.json and prints a summary table.
 *
 * Note: the docs site sets class="dark" on <html> for a fresh visitor regardless of
 * prefers-color-scheme, so every colour reported here is the dark-theme value. Sizes,
 * weights and families are theme-independent.
 */

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { parseDocsUrlsCsvFile } from "../core/docsUrlsCsv";

const ARTICLE = "#docs-article-content";

type Measured = {
  px: number;
  rem: number;
  weight: string;
  family: string;
  fullFamily: string;
  align: string;
  lineHeight: string;
  color: string;
  background: string;
  sample?: string;
  extra?: Record<string, string>;
};

type PageMeasurement = {
  url: string;
  finalUrl: string;
  status: number | null;
  title: string;
  rootFontSizePx: number;
  htmlClass: string;
  elements: Record<string, Measured | null>;
  present: Record<string, number>;
};

async function measure(urls: string[]): Promise<PageMeasurement[]> {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const out: PageMeasurement[] = [];

  for (const url of urls) {
    let status: number | null = null;
    try {
      const res = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
      status = res?.status() ?? null;
      await page.waitForSelector(ARTICLE, { timeout: 30_000 }).catch(() => {});
      await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
      await page.waitForTimeout(800);
    } catch {
      // fall through — the evaluate below reports what it can
    }

    const data = await page.evaluate((articleSel) => {
      const art = document.querySelector(articleSel) as HTMLElement | null;
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const hex = (rgb: string) => {
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("") : rgb;
      };
      const read = (el: Element | null, extra?: (s: CSSStyleDeclaration) => Record<string, string>) => {
        if (!el) return null;
        const s = getComputedStyle(el);
        const px = parseFloat(s.fontSize);
        return {
          px,
          rem: Number((px / rootPx).toFixed(4)),
          weight: s.fontWeight,
          family: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
          fullFamily: s.fontFamily,
          align: s.textAlign,
          lineHeight: s.lineHeight,
          color: hex(s.color),
          background: s.backgroundColor === "rgba(0, 0, 0, 0)" ? "transparent" : hex(s.backgroundColor),
          sample: (el.textContent || "").trim().slice(0, 40),
          extra: extra ? extra(s) : undefined,
        };
      };
      const q = (sel: string) => (art ? art.querySelector(sel) : null);
      const inlineCode = art
        ? Array.from(art.querySelectorAll("span.code, code")).find((e) => !e.closest("pre")) || null
        : null;
      const bodyPara = art
        ? Array.from(art.querySelectorAll("p")).find((p) => !p.className && (p.textContent || "").trim().length > 60) || null
        : null;
      const proseLink = art ? art.querySelector("p a, li a") : null;
      const callout = q(".note, .tip, .warning, .add-res");

      return {
        finalUrl: location.href,
        title: document.title,
        rootFontSizePx: rootPx,
        htmlClass: document.documentElement.className,
        elements: {
          h1: read(q("h1")),
          h2: read(q("h2")),
          h3: read(q("h3")),
          h4: read(q("h4")),
          h5: read(q("h5")),
          paragraph: read(bodyPara),
          listItem: read(q("li")),
          unorderedList: read(q("ul"), (s) => ({ listStyleType: s.listStyleType, paddingLeft: s.paddingLeft })),
          orderedList: read(q("ol"), (s) => ({ listStyleType: s.listStyleType, paddingLeft: s.paddingLeft })),
          proseLink: read(proseLink, (s) => ({ textDecoration: s.textDecorationLine })),
          strong: read(q("strong, b")),
          codeBlock: read(q("pre"), (s) => ({ padding: s.padding, borderRadius: s.borderRadius })),
          inlineCode: read(inlineCode, (s) => ({ padding: s.padding, borderRadius: s.borderRadius })),
          tableHeader: read(q("th")),
          tableCell: read(q("td")),
          callout: read(callout, (s) => ({
            borderLeft: `${s.borderLeftWidth} ${s.borderLeftStyle} ${s.borderLeftColor}`,
            padding: s.padding,
            borderRadius: s.borderRadius,
          })),
          calloutLabel: read(callout?.querySelector("strong, b") ?? null),
        } as Record<string, Measured | null>,
        present: {
          h1: art?.querySelectorAll("h1").length ?? 0,
          h2: art?.querySelectorAll("h2").length ?? 0,
          h3: art?.querySelectorAll("h3").length ?? 0,
          h4: art?.querySelectorAll("h4").length ?? 0,
          codeBlocks: art?.querySelectorAll("pre").length ?? 0,
          inlineCode: art?.querySelectorAll("span.code, code").length ?? 0,
          tables: art?.querySelectorAll("table").length ?? 0,
          callouts: art?.querySelectorAll(".note,.tip,.warning,.add-res").length ?? 0,
          images: art?.querySelectorAll("img").length ?? 0,
        },
      };
    }, ARTICLE);

    out.push({ url, status, ...data });
    console.log(`measured ${url} (HTTP ${status})`);
  }

  await browser.close();
  return out;
}

function argUrls(): string[] {
  const args = process.argv.slice(2);
  const csvIdx = args.indexOf("--csv");
  if (csvIdx === -1) return args.filter((a) => /^https?:/i.test(a));
  const csv = args[csvIdx + 1];
  const projIdx = args.indexOf("--project");
  const project = projIdx === -1 ? null : args[projIdx + 1];
  let rows = parseDocsUrlsCsvFile(path.resolve(process.cwd(), csv));
  if (project) rows = rows.filter((r) => r.project.toLowerCase() === project.toLowerCase());
  return [...new Set(rows.map((r) => r.url))];
}

async function main() {
  const urls = argUrls();
  if (!urls.length) {
    console.error("Usage: ts-node scripts/measureDocTypography.ts <url> [...] | --csv <file> [--project <name>]");
    process.exit(1);
  }
  const results = await measure(urls);
  const dir = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "typography-measurements.json");
  fs.writeFileSync(file, JSON.stringify({ measuredAt: new Date().toISOString(), pages: results }, null, 2), "utf-8");
  console.log("\nJSON:", file);

  for (const r of results) {
    console.log(`\n=== ${r.url} (HTTP ${r.status}, root ${r.rootFontSizePx}px, html.class="${r.htmlClass.slice(0, 40)}")`);
    for (const [name, m] of Object.entries(r.elements)) {
      if (!m) continue;
      const extra = m.extra ? " " + JSON.stringify(m.extra) : "";
      console.log(
        `  ${name.padEnd(14)} ${String(m.px).padStart(5)}px = ${String(m.rem).padEnd(6)}rem  w${m.weight.padEnd(4)} ${m.family.padEnd(15)} lh ${m.lineHeight.padEnd(8)} ${m.color} bg ${m.background}${extra}`
      );
    }
    console.log("  present:", JSON.stringify(r.present));
  }
}

main();

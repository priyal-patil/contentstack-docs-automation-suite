import { test } from "@playwright/test";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import {
  parseDocsUrlsCsvFile,
  filterDocRowsByAuditEnv,
  uniqueUrlsFromRows,
} from "../core/docsUrlsCsv";

type BrokenLink = {
  docUrl: string;
  brokenUrl: string;
  anchorText: string;
  status?: number;
  reason?: string;
};

type BrokenImage = {
  docUrl: string;
  imageUrl: string;
  alt: string;
  status?: number;
  reason?: string;
};

/** Result of table verification when a table is detected on a doc page. */
type TableAuditResult = {
  docUrl: string;
  tableDetected: boolean;
  /** 1) Table exists and is visible */
  tableExistsAndVisible: boolean;
  /** 2) Header row exists; min body rows; column count consistent */
  structure: {
    headerRowExists: boolean;
    bodyRowCount: number;
    minBodyRowsMet: boolean;
    columnCountConsistent: boolean;
    columnCount?: number;
  };
  /** 3) Key headers present (header texts we found) */
  headerTexts: string[];
  /** 6) Accessibility: semantic table/ARIA, header scope/roles, optional caption */
  accessibility: {
    semanticOrAria: boolean;
    headersHaveScopeOrRole: boolean;
    hasCaption: boolean;
  };
  /** 7) No broken layout: not empty, no "No data", no error banner near table */
  noBrokenLayout: {
    tableNotEmpty: boolean;
    noEmptyMessage: boolean;
    noErrorBanner: boolean;
  };
  warnings: string[];
};

/** Reported when an image on a doc page matches the reference "old" (orange) logo. */
type OldLogoDetected = {
  docUrl: string;
  imageUrl: string;
  alt: string;
};

const MIN_BODY_ROWS = 1;
const MIN_COLUMNS = 2;

/** Path to reference image of the old (orange) logo. Place your reference at data/reference-old-logo.png. */
const REFERENCE_OLD_LOGO_PATH = path.resolve(__dirname, "../data/reference-old-logo.png");
/** If diff pixels are less than this fraction of total, consider image a match to old logo. */
const OLD_LOGO_MATCH_THRESHOLD = 0.15; // 15% max diff (page logo may differ in size/compression/antialiasing)
/** Minimum pixel area to compare (tiny icons are skipped). */
const OLD_LOGO_MIN_PIXELS = 200;

type RefLogoData = { pixels: Buffer; width: number; height: number };

async function loadReferenceLogo(): Promise<RefLogoData | null> {
  const paths = [
    REFERENCE_OLD_LOGO_PATH,
    path.resolve(process.cwd(), "data", "reference-old-logo.png"),
  ];
  for (const filePath of paths) {
    if (!fs.existsSync(filePath)) continue;
    try {
      const meta = await sharp(filePath).metadata();
      const w = meta.width || 1;
      const h = meta.height || 1;
      const pixels = await sharp(filePath)
        .ensureAlpha()
        .raw()
        .toBuffer();
      return { pixels: pixels as Buffer, width: w, height: h };
    } catch {
      continue;
    }
  }
  return null;
}

/** Compare screenshot buffer (PNG) to reference; returns true if similarity suggests same logo. */
async function imageMatchesReference(
  screenshotPngBuffer: Buffer,
  ref: RefLogoData
): Promise<boolean> {
  try {
    const pixelmatch = (await import("pixelmatch")).default;
    const meta = await sharp(screenshotPngBuffer).metadata();
    const sw = meta.width || 0;
    const sh = meta.height || 0;
    if (sw * sh < OLD_LOGO_MIN_PIXELS) return false;
    // Resize reference to screenshot size so we don't distort the page logo; then compare.
    const refResized = await sharp(ref.pixels as Buffer, {
      raw: { width: ref.width, height: ref.height, channels: 4 },
    })
      .resize(sw, sh)
      .ensureAlpha()
      .raw()
      .toBuffer();
    const screenshotRaw = await sharp(screenshotPngBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer();
    const totalPixels = sw * sh;
    const diffPixels = pixelmatch(
      refResized as Uint8Array,
      screenshotRaw as Uint8Array,
      Buffer.alloc(totalPixels * 4),
      sw,
      sh,
      { threshold: 0.25 }
    );
    return diffPixels <= totalPixels * OLD_LOGO_MATCH_THRESHOLD;
  } catch {
    return false;
  }
}

/** Check visible images on the page for old logo; returns list of matches. */
async function runOldLogoCheck(
  page: import("@playwright/test").Page,
  docUrl: string,
  ref: RefLogoData | null
): Promise<OldLogoDetected[]> {
  if (!ref) return [];
  const found: OldLogoDetected[] = [];
  const imgs = await page.locator("img").all();
  for (const img of imgs) {
    try {
      const isVisible = await img.isVisible();
      if (!isVisible) continue;
      const src = await img.getAttribute("src");
      const alt = (await img.getAttribute("alt")) || "";
      if (!src) continue;
      const screenshot = await img.screenshot();
      if (!screenshot || screenshot.length < 100) continue;
      const match = await imageMatchesReference(screenshot, ref);
      if (match) {
        const imageUrl = normalizeUrl(docUrl, src) || src;
        found.push({ docUrl, imageUrl, alt });
      }
    } catch {
      // skip failed comparisons
    }
  }
  return found;
}

function normalizeUrl(base: string, href: string): string | null {
  const h = (href || "").trim();
  if (!h) return null;
  if (h.startsWith("#")) return null;
  if (/^(mailto:|tel:|javascript:)/i.test(h)) return null;
  try {
    return new URL(h, base).toString();
  } catch {
    return null;
  }
}

/** Human-readable reason for dashboard (warning type and format). */
function formatStatusReason(status: number | undefined, error?: string): string {
  if (status !== undefined) {
    const text: Record<number, string> = {
      400: "400 Bad Request",
      401: "401 Unauthorized",
      403: "403 Forbidden",
      404: "404 Not Found",
      410: "410 Gone",
      500: "500 Server Error",
      502: "502 Bad Gateway",
      503: "503 Service Unavailable",
    };
    return text[status] || `${status} HTTP error`;
  }
  return error && error.length < 80 ? error : "Fetch failed (timeout or error)";
}

/** Use the page's request context (same cookies/storage as the loaded doc) to avoid false 404s/403s from bot blocking. */
async function fetchStatusWithPage(
  page: import("@playwright/test").Page,
  url: string
): Promise<{ status: number | undefined; ok: boolean; reason: string }> {
  let lastErr: string = "";
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await page.request.fetch(url, { method, maxRedirects: 5, timeout: 20_000 });
      const status = res.status();
      const reason = formatStatusReason(status);
      return { status, ok: res.ok(), reason };
    } catch (e) {
      lastErr = String((e as Error)?.message ?? e);
    }
  }
  return { status: undefined, ok: false, reason: formatStatusReason(undefined, lastErr) };
}

/** Consider link/image broken only for 404, 410, or 5xx. 401/403 often false positives when using direct fetch. */
function isBrokenStatus(status: number | undefined): boolean {
  if (status === undefined) return true;
  return status === 404 || status === 410 || (status >= 500 && status < 600);
}

// Simple concurrency limiter (no dependency)
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  let idx = 0;

  async function worker() {
    while (idx < items.length) {
      const current = items[idx++];
      results.push(await fn(current));
    }
  }

  const workers = Array.from({ length: Math.min(limit, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

/** When page has a table, run table verifications (1–4, 6, 7). Uses same page already loaded for link/image audit. */
async function runTableVerification(
  page: import("@playwright/test").Page,
  docUrl: string
): Promise<TableAuditResult | null> {
  const result: TableAuditResult = {
    docUrl,
    tableDetected: false,
    tableExistsAndVisible: false,
    structure: {
      headerRowExists: false,
      bodyRowCount: 0,
      minBodyRowsMet: false,
      columnCountConsistent: false,
    },
    headerTexts: [],
    accessibility: {
      semanticOrAria: false,
      headersHaveScopeOrRole: false,
      hasCaption: false,
    },
    noBrokenLayout: {
      tableNotEmpty: false,
      noEmptyMessage: false,
      noErrorBanner: true,
    },
    warnings: [],
  };

  try {
    // Detect table: <table> or [role="table"]
    const tableLoc = page.locator("table, [role='table']").first();
    const tableCount = await tableLoc.count();
    if (tableCount === 0) return null;

    result.tableDetected = true;

    // 1) Table exists and is visible (not display:none, not collapsed)
    const visible = await tableLoc.isVisible();
    result.tableExistsAndVisible = visible;
    if (!visible) {
      result.warnings.push("Table exists but is not visible (e.g. display:none or collapsed).");
      return result;
    }

    // 2) Row/column structure: header row, body rows, column count
    const structure = await page.evaluate(
      ({ minBodyRows, minCols }) => {
        const table = document.querySelector("table, [role='table']");
        if (!table) return null;
        const thead = table.querySelector("thead");
        const tbody = table.querySelector("tbody");
        const headerCells = table.querySelectorAll("thead th, [role='columnheader'], thead td");
        const allRows = table.querySelectorAll("tr");
        const dataRows = Array.from(allRows).filter((r) => !r.closest("thead"));
        const colCounts = dataRows.map((r) => r.querySelectorAll("td, th").length);
        const firstColCount = colCounts[0] ?? 0;
        const consistent = colCounts.length === 0 || colCounts.every((c) => c >= minCols && (firstColCount === 0 || c === firstColCount));
        return {
          headerRowExists: (thead && thead.querySelector("th, td")) !== null || headerCells.length > 0 || (allRows.length > 0 && allRows[0].querySelectorAll("th").length > 0),
          bodyRowCount: dataRows.length,
          minBodyRowsMet: dataRows.length >= minBodyRows,
          columnCountConsistent: consistent,
          columnCount: firstColCount || undefined,
        };
      },
      { minBodyRows: MIN_BODY_ROWS, minCols: MIN_COLUMNS }
    );
    if (structure) {
      result.structure = { ...result.structure, ...structure };
    }

    // 3) Key headers present (collect header texts for reporting; optional strict check can be added per-URL)
    const headerTexts = await page.evaluate(() => {
      const table = document.querySelector("table, [role='table']");
      if (!table) return [] as string[];
      const ths = table.querySelectorAll("thead th, thead td, [role='columnheader']");
      return Array.from(ths).map((el) => (el.textContent || "").trim().replace(/\s+/g, " ")).filter(Boolean);
    });
    result.headerTexts = headerTexts;

    // 6) Accessibility: semantic <table> or [role="table"]; headers have scope or role; optional caption
    const a11y = await page.evaluate(() => {
      const table = document.querySelector("table, [role='table']");
      if (!table) return null;
      const tag = table.tagName?.toLowerCase();
      const role = table.getAttribute("role");
      const semanticOrAria = tag === "table" || role === "table";
      const headers = table.querySelectorAll("th[scope='col'], th[scope='row'], [role='columnheader'], [role='rowheader']");
      const theadTh = table.querySelectorAll("thead th");
      const headersHaveScopeOrRole =
        headers.length > 0 || (theadTh.length > 0 && Array.from(theadTh).some((th) => th.getAttribute("scope") || th.getAttribute("role")));
      const hasCaption = !!table.querySelector("caption");
      return { semanticOrAria, headersHaveScopeOrRole, hasCaption };
    });
    if (a11y) result.accessibility = a11y;

    // 7) No broken layout: table not empty, no "No data", no error banner near table
    const layout = await page.evaluate(() => {
      const table = document.querySelector("table, [role='table']");
      if (!table) return null;
      const text = (table.textContent || "").toLowerCase();
      const noEmptyMessage = !/no\s*data|no\s*results|empty/.test(text) || text.trim().length > 50;
      const container = table.closest("article, main, [role='main'], .content, .doc-content") || table.parentElement;
      const containerText = container ? (container.textContent || "").toLowerCase() : "";
      const noErrorBanner = !/error|something went wrong|failed to load/.test(containerText.slice(0, 500));
      const bodyRows = table.querySelectorAll("tbody tr, tr");
      const dataRows = Array.from(bodyRows).filter((r) => !r.closest("thead"));
      const tableNotEmpty = dataRows.length > 0;
      return { tableNotEmpty, noEmptyMessage, noErrorBanner };
    });
    if (layout) result.noBrokenLayout = layout;

    return result;
  } catch (e) {
    result.warnings.push(`Table verification error: ${String(e)}`);
    return result;
  }
}

// Allow override so "run only URLs from this bulk sheet" can pass a CSV with just those URLs
const defaultCsv = path.resolve(__dirname, "../data/docs-urls.csv");
const csvPath = process.env.DOCS_URLS_CSV ? path.resolve(process.cwd(), process.env.DOCS_URLS_CSV) : defaultCsv;
const auditRows = filterDocRowsByAuditEnv(parseDocsUrlsCsvFile(csvPath));
const docUrls = uniqueUrlsFromRows(auditRows);
const auditFilter =
  process.env.DOCS_AUDIT_PROJECTS?.trim() || process.env.DOCS_AUDIT_PROJECT?.trim() || "(all projects)";
console.log("[Docs Audit] csvPath =", csvPath);
console.log("[Docs Audit] exists =", fs.existsSync(csvPath));
console.log("[Docs Audit] project filter =", auditFilter);
console.log("[Docs Audit] row count (after filter) =", auditRows.length);
console.log("[Docs Audit] unique doc URLs =", docUrls.length);

let refLogoData: RefLogoData | null = null;

// Store per-doc JSON files here (safe for parallel)
function getOutDir(projectOutputDir: string) {
  return path.resolve(projectOutputDir, "docs-audit");
}
function safeFileNameFromUrl(url: string) {
  return Buffer.from(url).toString("base64").replace(/[/+=]/g, "_");
}

// ✅ Suite: each doc = one test => Playwright can run docs in parallel
test.describe.parallel("Docs Audit", () => {
  // Per-doc work (many link/image checks) can exceed the global 3m default
  test.describe.configure({ timeout: 900_000 });
  test.beforeAll(async () => {
    refLogoData = await loadReferenceLogo();
    if (!refLogoData) console.warn("[Docs Audit] Old logo check skipped: no reference at data/reference-old-logo.png");
  });

  for (const docUrl of docUrls) {
    test(`Audit: ${docUrl}`, async ({ page }, testInfo) => {
      const brokenLinks: BrokenLink[] = [];
      const brokenImages: BrokenImage[] = [];

      // --- NAVIGATE (warnings-only: catch errors and record) ---
      try {
        await page.goto(docUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
      } catch (e) {
        // If the doc itself fails to load, record as warning and continue
        brokenLinks.push({
          docUrl,
          brokenUrl: docUrl,
          anchorText: "(document load)",
          status: undefined,
          reason: `Document failed to load: ${String(e)}`,
        });
      }

      // If page failed to load, still write output and return
      const pageUrl = page.url();
      const isOnDoc = pageUrl && pageUrl !== "about:blank";

      const perDoc: {
        docUrl: string;
        brokenLinks: BrokenLink[];
        brokenImages: BrokenImage[];
        tableAudit?: TableAuditResult;
        oldLogoDetected?: OldLogoDetected[];
      } = { docUrl, brokenLinks, brokenImages };

      if (isOnDoc) {
        // -------- Collect links (href + anchor text) --------
        const anchors = await page.$$eval("a[href]", (as) =>
          as.map((a) => ({
            href: a.getAttribute("href") || "",
            text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 200),
          }))
        );

        const linkMap = new Map<string, string>(); // url -> anchorText
        for (const a of anchors) {
          const u = normalizeUrl(docUrl, a.href);
          if (!u) continue;
          if (!linkMap.has(u)) linkMap.set(u, a.text || "(no text)");
        }

        // -------- Collect images (src + lazy attrs + srcset) --------
        const images = await page.$$eval("img", (imgs) =>
          imgs.map((img) => ({
            src:
              img.getAttribute("src") ||
              img.getAttribute("data-src") ||
              img.getAttribute("data-original") ||
              "",
            srcset: img.getAttribute("srcset") || "",
            alt: (img.getAttribute("alt") || "").trim().slice(0, 200),
          }))
        );

        const imgSet = new Map<string, string>(); // url -> alt
        for (const img of images) {
          const u = normalizeUrl(docUrl, img.src);
          if (u && !imgSet.has(u)) imgSet.set(u, img.alt || "");

          if (img.srcset) {
            const first = img.srcset.split(",")[0]?.trim()?.split(" ")[0];
            const su = first ? normalizeUrl(docUrl, first) : null;
            if (su && !imgSet.has(su)) imgSet.set(su, img.alt || "");
          }
        }

        // Check links using page's request (same cookies as loaded doc) to avoid false 404s/403s
        await mapLimit([...linkMap.entries()], 10, async ([url, anchorText]) => {
          const { status, ok, reason } = await fetchStatusWithPage(page, url);
          if (isBrokenStatus(status)) {
            brokenLinks.push({ docUrl, brokenUrl: url, anchorText, status, reason });
          }
        });

        // Check images with same page context
        await mapLimit([...imgSet.entries()], 10, async ([url, alt]) => {
          const { status, ok, reason } = await fetchStatusWithPage(page, url);
          if (isBrokenStatus(status)) {
            brokenImages.push({ docUrl, imageUrl: url, alt, status, reason });
          }
        });

        // “Rendered broken” images (sometimes 200 but naturalWidth=0)
        const visuallyBroken = await page.$$eval("img", (imgs) =>
          imgs
            .filter((img) => img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0))
            .map((img) => ({
              src: img.getAttribute("src") || img.getAttribute("data-src") || "",
              alt: (img.getAttribute("alt") || "").trim(),
            }))
        );

        for (const vb of visuallyBroken) {
          const u = normalizeUrl(docUrl, vb.src);
          if (!u) continue;
          brokenImages.push({
            docUrl,
            imageUrl: u,
            alt: vb.alt,
            reason: "Rendered broken (naturalWidth=0 or naturalHeight=0)",
          });
        }

        // -------- Table verification: when a table is detected, run checks (1–4, 6, 7) --------
        const tableAudit = await runTableVerification(page, docUrl);
        if (tableAudit) perDoc.tableAudit = tableAudit;

        // -------- Old (orange) logo check: report if any image matches reference --------
        const oldLogo = await runOldLogoCheck(page, docUrl, refLogoData);
        if (oldLogo.length) perDoc.oldLogoDetected = oldLogo;
      }

      // Save per-doc file (used by summary test)
      const outDir = getOutDir(testInfo.project.outputDir);
      fs.mkdirSync(outDir, { recursive: true });
      const outFile = path.join(outDir, `${safeFileNameFromUrl(docUrl)}.json`);
      fs.writeFileSync(outFile, JSON.stringify(perDoc, null, 2), "utf-8");

      // Also write to reports/latest/docs-audit-per-doc so dashboard has data even if summary test runs early
      const reportDir = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
      const perDocDir = path.join(reportDir, "docs-audit-per-doc");
      fs.mkdirSync(perDocDir, { recursive: true });
      fs.writeFileSync(path.join(perDocDir, `${safeFileNameFromUrl(docUrl)}.json`), JSON.stringify(perDoc, null, 2), "utf-8");

      // Attach per-doc JSON to Playwright report
      await testInfo.attach("docs-audit-result.json", {
        body: JSON.stringify(perDoc, null, 2),
        contentType: "application/json",
      });

      // Warnings-only console logs
      if (brokenLinks.length) {
        console.warn(`⚠️ [DOCS AUDIT] ${docUrl} -> broken links: ${brokenLinks.length}`);
      }
      if (brokenImages.length) {
        console.warn(`⚠️ [DOCS AUDIT] ${docUrl} -> broken images: ${brokenImages.length}`);
      }
      if (perDoc.oldLogoDetected?.length) {
        console.warn(`⚠️ [DOCS AUDIT] ${docUrl} -> old (orange) logo detected in ${perDoc.oldLogoDetected.length} image(s)`);
      }
    });
  }
});

// ✅ Final summary test (always passes, attaches grouped result)
test("Docs Audit Summary (warnings only)", async ({}, testInfo) => {
  const outDir = getOutDir(testInfo.project.outputDir);

  const results: Array<{
    docUrl: string;
    brokenLinks: BrokenLink[];
    brokenImages: BrokenImage[];
    tableAudit?: TableAuditResult;
    oldLogoDetected?: OldLogoDetected[];
  }> = [];
  if (fs.existsSync(outDir)) {
    const files = fs
      .readdirSync(outDir)
      .filter((f) => f.endsWith(".json") && f !== "summary.json");

    for (const f of files) {
      const json = JSON.parse(fs.readFileSync(path.join(outDir, f), "utf-8"));
      results.push(json);
    }
  }

  const docsWithBrokenLinks = results.filter((r) => r.brokenLinks?.length);
  const docsWithBrokenImages = results.filter((r) => r.brokenImages?.length);
  const docsWithTables = results.filter((r) => r.tableAudit?.tableDetected);
  const docsWithOldLogo = results.filter((r) => r.oldLogoDetected?.length);

  const summary = {
    scannedDocs: results.length,
    docsWithBrokenLinks: docsWithBrokenLinks.length,
    docsWithBrokenImages: docsWithBrokenImages.length,
    docsWithTables: docsWithTables.length,
    docsWithOldLogo: docsWithOldLogo.length,
    results, // contains docUrl + broken lists + tableAudit + oldLogoDetected when present
  };

  fs.mkdirSync(outDir, { recursive: true });
  const summaryPath = path.join(outDir, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");

  // Also write to reports/latest so dashboard and other tools can find it
  const reportDir = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportSummaryPath = path.join(reportDir, "docs-audit-summary.json");
  fs.writeFileSync(reportSummaryPath, JSON.stringify(summary, null, 2), "utf-8");

  // Attach the final summary to HTML report
  await testInfo.attach("docs-audit-summary.json", {
    path: summaryPath,
    contentType: "application/json",
  });

  // Print final grouped sections to console
  console.log("\n============================");
  console.log(" DOCS AUDIT SUMMARY (WARN)  ");
  console.log("============================");
  console.log(`Docs scanned: ${summary.scannedDocs}`);
  console.log(`Docs with broken links: ${summary.docsWithBrokenLinks}`);
  console.log(`Docs with broken images: ${summary.docsWithBrokenImages}`);
  console.log(`Docs with tables (verified): ${summary.docsWithTables}`);
  console.log(`Docs with OLD (orange) logo detected: ${summary.docsWithOldLogo}`);

  if (docsWithOldLogo.length) {
    console.log("\n--- OLD (ORANGE) LOGO DETECTED (update to purple) ---");
    for (const r of docsWithOldLogo) {
      console.log(`\n  DOC: ${r.docUrl}`);
      for (const o of r.oldLogoDetected!) {
        console.log(`    Image: ${o.imageUrl}`);
        if (o.alt) console.log(`    Alt: ${o.alt}`);
      }
    }
  }

  if (docsWithTables.length) {
    console.log("\n--- TABLE VERIFICATION ---");
    for (const r of docsWithTables) {
      const t = r.tableAudit!;
      const ok =
        t.tableExistsAndVisible &&
        t.structure.headerRowExists &&
        t.structure.minBodyRowsMet &&
        t.structure.columnCountConsistent &&
        t.noBrokenLayout.tableNotEmpty &&
        t.noBrokenLayout.noEmptyMessage &&
        t.noBrokenLayout.noErrorBanner;
      console.log(`\n  ${r.docUrl}`);
      console.log(`    Visible: ${t.tableExistsAndVisible} | Header: ${t.structure.headerRowExists} | Body rows: ${t.structure.bodyRowCount} | Cols consistent: ${t.structure.columnCountConsistent}`);
      console.log(`    A11y: semantic/aria=${t.accessibility.semanticOrAria} | headers scope/role=${t.accessibility.headersHaveScopeOrRole} | caption=${t.accessibility.hasCaption}`);
      console.log(`    Layout: notEmpty=${t.noBrokenLayout.tableNotEmpty} | noEmptyMsg=${t.noBrokenLayout.noEmptyMessage} | noErrorBanner=${t.noBrokenLayout.noErrorBanner}`);
      if (t.headerTexts.length) console.log(`    Headers: ${t.headerTexts.slice(0, 8).join(", ")}${t.headerTexts.length > 8 ? "..." : ""}`);
      if (t.warnings.length) console.log(`    Warnings: ${t.warnings.join("; ")}`);
      console.log(`    ${ok ? "✅ Pass" : "⚠️ Warnings"}`);
    }
  }

  if (docsWithBrokenLinks.length) {
    console.log("\n--- 404/4xx/5xx LINKS ---");
    for (const r of docsWithBrokenLinks) {
      console.log(`\nDOC: ${r.docUrl}`);
      for (const b of r.brokenLinks) {
        console.log(`  ✗ ${b.status ?? "ERR"}  ${b.brokenUrl}`);
        console.log(`    Anchor: ${b.anchorText}`);
        if (b.reason) console.log(`    Reason: ${b.reason}`);
      }
    }
  }

  if (docsWithBrokenImages.length) {
    console.log("\n--- BROKEN IMAGES ---");
    for (const r of docsWithBrokenImages) {
      console.log(`\nDOC: ${r.docUrl}`);
      for (const b of r.brokenImages) {
        console.log(`  ✗ ${b.status ?? "ERR"}  ${b.imageUrl}`);
        if (b.alt) console.log(`    Alt: ${b.alt}`);
        if (b.reason) console.log(`    Reason: ${b.reason}`);
      }
    }
  }

  console.log("\n✅ Completed (warnings only). CI will not fail.");
});

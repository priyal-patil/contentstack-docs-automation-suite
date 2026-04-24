/**
 * Crawl spec: visit each URL from a CSV, collect all links/images/media,
 * check HTTP status (200, 404, redirect, etc.) for each resource, write per-URL report.
 *
 * Env:
 *   CRAWL_URLS_CSV  - path to CSV (default: data/crawl-urls.csv)
 *   CRAWL_LIMIT     - optional limit (e.g. 1 or 2) for initial testing
 *   CRAWL_REPORT_DIR - output dir for reports (default: reports/crawl-reports)
 */

import { test } from "@playwright/test";
import fs from "fs";
import path from "path";

const CSV_DEFAULT = path.resolve(__dirname, "../../data/crawl-urls.csv");
const REPORT_DIR_DEFAULT = path.resolve(process.cwd(), "reports/crawl-reports");

function readUrlsFromCsv(csvPath: string): string[] {
  const raw = fs.readFileSync(csvPath, "utf-8");
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.startsWith("#"));
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

function formatStatusReason(status: number | undefined, error?: string): string {
  if (status !== undefined) {
    const text: Record<number, string> = {
      301: "301 Moved Permanently",
      302: "302 Found",
      303: "303 See Other",
      307: "307 Temporary Redirect",
      308: "308 Permanent Redirect",
      400: "400 Bad Request",
      401: "401 Unauthorized",
      403: "403 Forbidden",
      404: "404 Not Found",
      410: "410 Gone",
      500: "500 Server Error",
      502: "502 Bad Gateway",
      503: "503 Service Unavailable",
    };
    return text[status] || (status >= 300 && status < 400 ? `${status} Redirect` : `${status} HTTP`);
  }
  return error && error.length < 80 ? error : "Fetch failed (timeout or error)";
}

async function fetchStatusWithPage(
  page: import("@playwright/test").Page,
  url: string
): Promise<{ status: number | undefined; ok: boolean; reason: string; redirected: boolean; finalUrl?: string }> {
  let lastErr = "";
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await page.request.fetch(url, { method, maxRedirects: 5, timeout: 20_000 });
      const status = res.status();
      const finalUrl = res.url();
      const redirected = finalUrl !== url;
      return {
        status,
        ok: res.ok(),
        reason: formatStatusReason(status),
        redirected,
        finalUrl: redirected ? finalUrl : undefined,
      };
    } catch (e) {
      lastErr = String((e as Error)?.message ?? e);
    }
  }
  return { status: undefined, ok: false, reason: formatStatusReason(undefined, lastErr), redirected: false };
}

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

function safeFileNameFromUrl(url: string): string {
  const base64 = Buffer.from(url).toString("base64url").replace(/[-_]/g, "x");
  return base64.length > 200 ? base64.slice(0, 200) : base64;
}

// Media extensions / patterns (mp4, mp3, webm, etc.)
const MEDIA_EXT = /\.(mp4|mp3|webm|ogg|wav|m4a|mov)(\?|$)/i;

export type CrawlLinkResult = {
  url: string;
  anchorText: string;
  status: number | undefined;
  reason: string;
  redirected: boolean;
  finalUrl?: string;
};

export type CrawlImageResult = {
  url: string;
  alt: string;
  status: number | undefined;
  reason: string;
  redirected: boolean;
  finalUrl?: string;
};

export type CrawlMediaResult = {
  url: string;
  type: "video" | "audio" | "media";
  status: number | undefined;
  reason: string;
  redirected: boolean;
  finalUrl?: string;
};

export type CrawlUrlReport = {
  initialUrl: string;
  pageUrl: string;
  pageStatus: number | undefined;
  pageRedirected: boolean;
  pageLoadError?: string;
  links: CrawlLinkResult[];
  images: CrawlImageResult[];
  media: CrawlMediaResult[];
  summary: {
    linksTotal: number;
    linksOk: number;
    linksRedirect: number;
    linksBroken: number;
    imagesTotal: number;
    imagesOk: number;
    imagesBroken: number;
    mediaTotal: number;
    mediaOk: number;
    mediaBroken: number;
  };
  crawledAt: string;
};

const csvPath = process.env.CRAWL_URLS_CSV
  ? path.resolve(process.cwd(), process.env.CRAWL_URLS_CSV)
  : CSV_DEFAULT;
const reportDir = process.env.CRAWL_REPORT_DIR
  ? path.resolve(process.cwd(), process.env.CRAWL_REPORT_DIR)
  : REPORT_DIR_DEFAULT;

let allUrls: string[] = [];
try {
  allUrls = readUrlsFromCsv(csvPath);
} catch (e) {
  console.warn("[Crawl] Could not read CSV:", csvPath, e);
}
const limit = process.env.CRAWL_LIMIT ? Math.max(1, parseInt(process.env.CRAWL_LIMIT, 10)) : undefined;
const urlsToCrawl = limit ? allUrls.slice(0, limit) : allUrls;

console.log("[Crawl] CSV:", csvPath, "| URLs to crawl:", urlsToCrawl.length, limit ? `(limit=${limit})` : "");

test.describe("Crawl", () => {
  test.describe.configure({ timeout: 1_800_000 });
  for (const initialUrl of urlsToCrawl) {
    test(`Crawl: ${initialUrl}`, async ({ page }, testInfo) => {
      const report: CrawlUrlReport = {
        initialUrl,
        pageUrl: initialUrl,
        pageStatus: undefined,
        pageRedirected: false,
        links: [],
        images: [],
        media: [],
        summary: {
          linksTotal: 0,
          linksOk: 0,
          linksRedirect: 0,
          linksBroken: 0,
          imagesTotal: 0,
          imagesOk: 0,
          imagesBroken: 0,
          mediaTotal: 0,
          mediaOk: 0,
          mediaBroken: 0,
        },
        crawledAt: new Date().toISOString(),
      };

      try {
        const response = await page.goto(initialUrl, { waitUntil: "domcontentloaded", timeout: 60_000 }).catch(() => null);
        await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => {});
        report.pageUrl = page.url();
        if (response) {
          report.pageStatus = response.status();
          report.pageRedirected = response.url() !== initialUrl;
        }
      } catch (e) {
        report.pageLoadError = String((e as Error)?.message ?? e);
      }

      const baseUrl = report.pageUrl || initialUrl;

      // -------- Links (a[href]) --------
      const anchors = await page.$$eval("a[href]", (as) =>
        as.map((a) => ({
          href: a.getAttribute("href") || "",
          text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 200),
        }))
      );
      const linkMap = new Map<string, string>();
      for (const a of anchors) {
        const u = normalizeUrl(baseUrl, a.href);
        if (!u) continue;
        if (!linkMap.has(u)) linkMap.set(u, a.text || "(no text)");
      }

      await mapLimit([...linkMap.entries()], 10, async ([url, anchorText]) => {
        const { status, reason, redirected, finalUrl } = await fetchStatusWithPage(page, url);
        report.links.push({ url, anchorText, status, reason, redirected, finalUrl });
      });

      // -------- Images --------
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
      const imgSet = new Map<string, string>();
      for (const img of images) {
        const u = normalizeUrl(baseUrl, img.src);
        if (u && !imgSet.has(u)) imgSet.set(u, img.alt || "");
        const firstSrcset = img.srcset.split(",")[0]?.trim()?.split(" ")[0];
        if (firstSrcset) {
          const su = normalizeUrl(baseUrl, firstSrcset);
          if (su && !imgSet.has(su)) imgSet.set(su, img.alt || "");
        }
      }

      await mapLimit([...imgSet.entries()], 10, async ([url, alt]) => {
        const { status, reason, redirected, finalUrl } = await fetchStatusWithPage(page, url);
        report.images.push({ url, alt, status, reason, redirected, finalUrl });
      });

      // -------- Media (video, audio, source with mp4/mp3 etc.) --------
      const mediaEls = await page.$$eval(
        "video source[src], audio source[src], video[src], audio[src]",
        (els) =>
          els.map((el) => ({
            url: (el.getAttribute("src") || "").trim(),
            tag: el.tagName.toLowerCase(),
          }))
      );
      const linkHrefs = await page.$$eval("a[href]", (as) =>
        as.map((a) => (a.getAttribute("href") || "").trim())
      );
      const mediaSet = new Map<string, "video" | "audio" | "media">();
      for (const m of mediaEls) {
        const u = normalizeUrl(baseUrl, m.url);
        if (!u) continue;
        const type = m.tag === "audio" || /\.(mp3|wav|m4a|ogg)(\?|$)/i.test(u) ? "audio" : "video";
        if (!mediaSet.has(u)) mediaSet.set(u, type);
      }
      for (const href of linkHrefs) {
        const u = normalizeUrl(baseUrl, href);
        if (!u || !MEDIA_EXT.test(u)) continue;
        const type = /\.(mp3|wav|m4a|ogg)(\?|$)/i.test(u) ? "audio" : "video";
        if (!mediaSet.has(u)) mediaSet.set(u, type);
      }

      await mapLimit([...mediaSet.entries()], 8, async ([url, type]) => {
        const { status, reason, redirected, finalUrl } = await fetchStatusWithPage(page, url);
        report.media.push({ url, type, status, reason, redirected, finalUrl });
      });

      // Summary counts
      report.summary.linksTotal = report.links.length;
      report.summary.linksOk = report.links.filter((l) => l.status === 200).length;
      report.summary.linksRedirect = report.links.filter((l) => l.status !== undefined && l.status >= 300 && l.status < 400).length;
      report.summary.linksBroken = report.links.filter((l) => l.status === 404 || l.status === 410 || (l.status !== undefined && l.status >= 500)).length;

      report.summary.imagesTotal = report.images.length;
      report.summary.imagesOk = report.images.filter((i) => i.status === 200).length;
      report.summary.imagesBroken = report.images.filter((i) => i.status === 404 || i.status === 410 || (i.status !== undefined && i.status >= 500)).length;

      report.summary.mediaTotal = report.media.length;
      report.summary.mediaOk = report.media.filter((m) => m.status === 200).length;
      report.summary.mediaBroken = report.media.filter((m) => m.status === 404 || m.status === 410 || (m.status !== undefined && m.status >= 500)).length;

      fs.mkdirSync(reportDir, { recursive: true });
      const filePath = path.join(reportDir, `${safeFileNameFromUrl(initialUrl)}.json`);
      fs.writeFileSync(filePath, JSON.stringify(report, null, 2), "utf-8");

      await testInfo.attach("crawl-report.json", {
        body: JSON.stringify(report, null, 2),
        contentType: "application/json",
      });
    });
  }
});

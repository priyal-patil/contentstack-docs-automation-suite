/**
 * Generate summary.json from all per-URL crawl reports in CRAWL_REPORT_DIR.
 * Run after crawl tests complete so the dashboard has correct totals.
 */

import fs from "fs";
import path from "path";

const REPORT_DIR = path.resolve(
  process.cwd(),
  process.env.CRAWL_REPORT_DIR || path.join(process.cwd(), "reports/crawl-reports")
);

type CrawlUrlReport = {
  initialUrl: string;
  pageUrl: string;
  pageStatus?: number;
  pageRedirected?: boolean;
  pageLoadError?: string;
};

function main() {
  const csvPath = process.env.CRAWL_URLS_CSV
    ? path.resolve(process.cwd(), process.env.CRAWL_URLS_CSV)
    : path.resolve(process.cwd(), "data/crawl-urls.csv");
  const files = fs.existsSync(REPORT_DIR)
    ? fs.readdirSync(REPORT_DIR).filter((f) => f.endsWith(".json") && f !== "summary.json")
    : [];
  const reports: CrawlUrlReport[] = [];
  for (const f of files) {
    try {
      const r = JSON.parse(fs.readFileSync(path.join(REPORT_DIR, f), "utf-8")) as CrawlUrlReport;
      if (r.initialUrl) reports.push(r);
    } catch {
      // skip
    }
  }
  const summary = {
    generatedAt: new Date().toISOString(),
    csvPath,
    totalUrls: reports.length,
    urls: reports.map((r) => ({ initialUrl: r.initialUrl, pageUrl: r.pageUrl, pageStatus: r.pageStatus })),
    byStatus: {
      pageOk: reports.filter((r) => r.pageStatus === 200).length,
      pageRedirect: reports.filter((r) => r.pageRedirected).length,
      pageError: reports.filter((r) => r.pageLoadError || (r.pageStatus !== undefined && r.pageStatus >= 400)).length,
    },
  };
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(path.join(REPORT_DIR, "summary.json"), JSON.stringify(summary, null, 2), "utf-8");
  console.log("[Crawl] Summary: " + reports.length + " URL reports → summary.json");
}

main();

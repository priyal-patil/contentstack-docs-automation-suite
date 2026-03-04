/**
 * Run crawl tests with optional --url-file, --limit, --workers.
 * Sets CRAWL_URLS_CSV, CRAWL_LIMIT then runs Playwright with multiple workers.
 * After tests complete, generates summary.json from all per-URL reports.
 *
 * Usage:
 *   npx ts-node scripts/runCrawl.ts
 *   npx ts-node scripts/runCrawl.ts --url-file data/crawl-urls.csv --limit 1
 *   npm run crawl
 *   npm run crawl -- --url-file data/crawl-urls.csv --workers 4
 */

import { spawnSync } from "child_process";
import path from "path";

const args = process.argv.slice(2);
let urlFile = process.env.CRAWL_URLS_CSV;
let limit = process.env.CRAWL_LIMIT;
let workers = process.env.CRAWL_WORKERS || "4";

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--url-file" && args[i + 1]) {
    urlFile = path.resolve(process.cwd(), args[i + 1]);
    i++;
  } else if (args[i] === "--limit" && args[i + 1]) {
    limit = args[i + 1];
    i++;
  } else if (args[i] === "--workers" && args[i + 1]) {
    workers = args[i + 1];
    i++;
  }
}

const cwd = path.resolve(__dirname, "..");
const env = { ...process.env };
if (urlFile) env.CRAWL_URLS_CSV = urlFile;
if (limit) env.CRAWL_LIMIT = limit;
env.CRAWL_REPORT_DIR = path.resolve(cwd, "reports/crawl-reports");

const run = spawnSync(
  "npx",
  ["playwright", "test", "tests/crawl/crawl.spec.ts", "--project=crawl", "--workers=" + workers],
  { stdio: "inherit", cwd, env }
);

if (run.status !== 0) {
  process.exit(run.status ?? 1);
}

// Generate summary after all URL tests complete so dashboard has correct totals
const summaryRun = spawnSync("npx", ["ts-node", "scripts/generateCrawlSummary.ts"], {
  stdio: "inherit",
  cwd,
  env,
});
process.exit(summaryRun.status ?? 0);

import { defineConfig } from "@playwright/test";
import path from "path";

const isCI = !!process.env.CI;
/** Set PLAYWRIGHT_HEADLESS=1 to force headless (e.g. batch CMS runs); default local runs use headed browser. */
const useHeadless = isCI || process.env.PLAYWRIGHT_HEADLESS === "1";
const defaultWorkers = isCI ? 2 : 1;
const workers = Number(process.env.PW_WORKERS || defaultWorkers);
const slowMo = Number(process.env.PW_SLOWMO || 200);
/** Flow URL tests are parallel-safe; other suites may opt out via PW_FULLY_PARALLEL=0. */
const fullyParallel = process.env.PW_FULLY_PARALLEL !== "0";

const MAX_TEST_TIMEOUT_MS = 3_600_000; // 60 min hard cap (typos / absurd values)

/**
 * Per-test timeout (ms). Default **3 minutes** locally so a stuck UI closes the browser soon; CI defaults to 15 minutes
 * unless you set PW_FLOW_MAX_MINUTES / PW_TEST_TIMEOUT_MS.
 *
 * Override examples:
 *   PW_FLOW_MAX_MINUTES=10 PLAYWRIGHT_HEADLESS=0 playwright test tests/flows.spec.ts --project=flows --headed -g "your-flow"
 *   PW_TEST_TIMEOUT_MS=600000
 */
function resolveTestTimeoutMs(): number {
  const msRaw = process.env.PW_TEST_TIMEOUT_MS?.trim();
  if (msRaw) {
    const n = Number(msRaw);
    if (Number.isFinite(n) && n >= 15_000) return Math.min(n, MAX_TEST_TIMEOUT_MS);
  }
  const minsRaw = process.env.PW_FLOW_MAX_MINUTES?.trim();
  if (minsRaw) {
    const n = Number(minsRaw);
    if (Number.isFinite(n) && n > 0) return Math.min(Math.round(n * 60_000), MAX_TEST_TIMEOUT_MS);
  }
  if (isCI) return 900_000; // 15 min — full-project / docs-audit style runs
  return 180_000; // 3 min — local headed debugging
}

const testTimeoutMs = resolveTestTimeoutMs();

export default defineConfig({
  globalSetup: "./global-setup.ts",
  testDir: "./tests",
  fullyParallel,
  workers,
  retries: 0,

  // Some UI flows (e.g., Marketplace imports) can take several minutes. Override with PW_FLOW_MAX_MINUTES / PW_TEST_TIMEOUT_MS.
  timeout: testTimeoutMs,

  // Docs-audit (links, table, logo verification for docs-urls.csv) runs headless by default.
  // Other tests (e.g. flows) keep headless: false unless overridden. Use --headed to show browser for docs-audit.
  projects: [
    {
      name: "docs-audit",
      testMatch: /docs-audit\.spec\.ts/,
      use: {
        headless: true,
        storageState: "auth.json",
        launchOptions: {},
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "crawl",
      testMatch: /crawl\/crawl\.spec\.ts/,
      use: {
        headless: true,
        storageState: "auth.json",
        launchOptions: {},
        screenshot: "only-on-failure",
        video: "retain-on-failure",
      },
    },
    {
      name: "data-insights-chain",
      testMatch: /data-and-insights-lytics-dal-then-job\.spec\.ts/,
      use: {
        storageState: "auth.json",
        headless: useHeadless,
        launchOptions: {
          slowMo,
          args: ["--disable-dev-shm-usage", "--no-sandbox"],
        },
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
      },
    },
    {
      name: "flows",
      testMatch: /flows\.spec\.ts/,
      use: {
        storageState: "auth.json",
        headless: useHeadless,
        launchOptions: {
          slowMo,
          args: ["--disable-dev-shm-usage", "--no-sandbox"],
        },
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
      },
    },
    {
      name: "default",
      testIgnore: [/docs-audit\.spec\.ts/, /crawl\/crawl\.spec\.ts/, /flows\.spec\.ts/, /data-and-insights-lytics-dal-then-job\.spec\.ts/],
      use: {
        storageState: "auth.json",
        headless: useHeadless,
        launchOptions: {
          slowMo,
          args: ["--disable-dev-shm-usage", "--no-sandbox"],
        },
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
      },
    },
  ],

  // Report outputs are written into REPORT_DIR (default: reports/latest).
  // - html: human-readable
  // - json: machine-readable (used by mergeResults.ts)
  reporter: (() => {
    const reportDir = process.env.REPORT_DIR || "reports/latest";
    return [
      ["html", { outputFolder: path.join(reportDir, "html") }],
      ["json", { outputFile: path.join(reportDir, "flows-results.json") }],
    ];
  })(),
});


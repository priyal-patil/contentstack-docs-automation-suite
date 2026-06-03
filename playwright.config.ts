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
 * Per-action/element timeout (ms).
 * Set PW_ACTION_TIMEOUT_MINUTES to cap how long any single element wait or action
 * can block before failing. Used by CMS Batch 2 (PW_ACTION_TIMEOUT_MINUTES=3).
 * 0 (default) means Playwright falls back to the test timeout — preserves Batch 1 behaviour.
 */
function resolveActionTimeoutMs(): number {
  const raw = process.env.PW_ACTION_TIMEOUT_MINUTES?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n > 0) return Math.round(n * 60_000);
  }
  return 0; // 0 = use test timeout (Playwright default, no change to existing runs)
}

const actionTimeoutMs = resolveActionTimeoutMs();

/**
 * Per-test timeout (ms). Default **15 minutes** locally (headed flows often exceed 3m — e.g. Developer Hub wizard);
 * CI defaults to **15 minutes** unless you set PW_FLOW_MAX_MINUTES / PW_TEST_TIMEOUT_MS. Use SHORT_FLOW_LOCAL=1
 * to restore ~3 minute local timeouts when debugging tiny flows.
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
  if (process.env.SHORT_FLOW_LOCAL === "1") return 180_000; // fast-fail local smoke
  return 900_000; // 15 min — long single-flow runs (Dev Hub, etc.) without setting PW_FLOW_MAX_MINUTES
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
        // viewport: null lets the browser use its natural/maximized window size.
        // --start-maximized maximizes the window in headed mode.
        viewport: null,
        launchOptions: {
          slowMo,
          args: ["--disable-dev-shm-usage", "--no-sandbox", "--start-maximized"],
        },
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry",
        // PW_ACTION_TIMEOUT_MINUTES caps per-element waits (used by CMS Batch 2).
        // 0 = fall back to test timeout, preserving Batch 1 / local behaviour.
        ...(actionTimeoutMs > 0 ? { actionTimeout: actionTimeoutMs } : {}),
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


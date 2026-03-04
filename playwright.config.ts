import { defineConfig } from "@playwright/test";
import path from "path";

export default defineConfig({
  globalSetup: "./global-setup.ts",
  testDir: "./tests",
  fullyParallel: true,
  workers: 4,
  retries: 0,

  // Some UI flows (e.g., Marketplace imports) can take several minutes.
  timeout: 420_000,

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
      name: "default",
      testIgnore: [/docs-audit\.spec\.ts/, /crawl\/crawl\.spec\.ts/],
      use: {
        storageState: "auth.json",
        headless: false,
        launchOptions: {
          slowMo: 700,
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


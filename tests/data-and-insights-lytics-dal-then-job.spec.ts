/**
 * Single browser session: run Data & Insights → Lytics DAL integration (full doc flow), then
 * Lytics Import Entries job + authorization steps on the same Playwright page/tabs.
 *
 * The DAL flow runs via `preflight.executeFlowBefore` (see core/executor.ts) after `use: ["login"]`.
 * Set `preflight.continueOnExecuteFlowBeforeFailure: true` so the Lytics job steps still run if the DAL flow hard-fails.
 *
 * Headed: PLAYWRIGHT_HEADLESS=0 (or default local headed in playwright.config).
 * Optional: PW_KEEP_BROWSER_OPEN=1 — `page.pause()` after the chain so the browser stays open until you continue in the Inspector.
 */
import fs from "fs";
import { test } from "@playwright/test";
import { executeFlow, findFlowPathByFlowId } from "../core/executor";

const CHAINED_FLOW_ID = "create-data-and-insights-lytics-dal-then-lytics-import-job";

function loadFlowById(flowId: string): Record<string, unknown> {
  const p = findFlowPathByFlowId(flowId);
  if (!p) {
    throw new Error(`No projects/**/flows/*.flow.json with id "${flowId}"`);
  }
  return JSON.parse(fs.readFileSync(p, "utf-8")) as Record<string, unknown>;
}

test.describe("Data-and-Insights — DAL then Lytics job (one session)", () => {
  test(`${CHAINED_FLOW_ID} (executeFlowBefore create-data-and-insights-lytics-integration)`, async ({ browser }) => {
    const mins = Number(process.env.PW_FLOW_MAX_MINUTES || 60);
    test.setTimeout(Number.isFinite(mins) && mins > 0 ? Math.min(mins * 60_000, 3_600_000) : 3_600_000);

    const dal = loadFlowById("create-data-and-insights-lytics-integration");
    const job = loadFlowById("create-job-and-authorization-for-data-and-insights-lytics");

    const chained = {
      ...job,
      id: CHAINED_FLOW_ID,
      project: "Data-and-Insights",
      module: "set-up-data-insights",
      stage: "main",
      /** Contentstack doc URLs (both); primary report source is the job doc. */
      source: String(job.source || dal.source || ""),
      type: "executable",
      use: ["login"],
      preflight: {
        executeFlowBefore: "create-data-and-insights-lytics-integration",
        continueOnExecuteFlowBeforeFailure: true,
      },
      automationNotes:
        `Chained headed/local run: login → full DAL+Lytics OAuth flow (${dal.id}), then Import Entries job (${job.id}) in the same Playwright context. ` +
        `Handlers: create-data-and-insights-lytics-integration + isCreateJobLyticsAuthorizationFlow in actionRules.`,
    };

    const context = await browser.newContext({ storageState: "auth.json" });
    const page = await context.newPage();

    try {
      await executeFlow(page, chained);
    } finally {
      if (process.env.PW_KEEP_BROWSER_OPEN === "1") {
        // eslint-disable-next-line no-console
        console.log("⏸️  PW_KEEP_BROWSER_OPEN=1 — page.pause(); resume in Inspector to close the test.");
        await page.pause().catch(() => {});
      }
      await context.close().catch(() => {});
    }
  });
});

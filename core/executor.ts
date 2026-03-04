// core/executor.ts
/**
 * Executes only the steps defined in the flow (from the document).
 * We do NOT add or infer steps – each step comes from the document/flow JSON.
 * If a step fails (e.g. element not found), we record it for doc-step-failures
 * reporting so technical writers can fix the document.
 */
import { Page } from "@playwright/test";
import crypto from "crypto";
import { performAction } from "../rules/core/actionRules";
import { runSharedSteps } from "../shared/steps/registry";
import { recordDocStepFailure } from "./docStepFailureReporter";

export async function executeFlow(page: Page, flow: any) {
  const unique = crypto.randomUUID();
  const documentUrl = flow?.source || flow?.documentUrl || "(no source URL)";

  console.log("=================================");
  console.log(`Executing Flow: ${flow.id}`);
  console.log("=================================");

  // Shared steps (project-agnostic). Default: login + selectStack.
  await runSharedSteps(page, flow?.use);

  console.log("🔎 Flow.steps type:", typeof flow.steps);
  console.log("🔎 Flow.steps length:", Array.isArray(flow.steps) ? flow.steps.length : "NOT_ARRAY");
  console.log("🔎 Flow object:", JSON.stringify(flow, null, 2));

  if (!Array.isArray(flow.steps) || flow.steps.length === 0) {
    console.log("⚠️ No steps found in flow.");
    return;
  }

  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    console.log(`STEP ${i + 1}/${flow.steps.length}:`, step);
    try {
      await performAction(page, step, unique, flow, {
        documentUrl,
        flowId: flow.id,
        stepIndex: i,
      });
      // Pause after "Create New Rule" so user can perform FVR steps manually and capture locators (run with PAUSE_AFTER_CREATE_NEW_RULE=true --headed)
      if (process.env.PAUSE_AFTER_CREATE_NEW_RULE === "true" && step.target === "Create New Rule (doc step)") {
        console.log("⏸️  Pausing for manual steps. Use Playwright Inspector to capture locators. When done, press Resume in the Inspector to finish the run (remaining steps will be skipped).");
        await page.pause();
        console.log("▶️  Resumed. Skipping remaining steps so you can add locators from your manual run.");
        return;
      }
    } catch (err: any) {
      const message = err?.message ?? String(err);
      recordDocStepFailure(documentUrl, flow.id, i, step, message);
      console.error(`❌ Document step failed (URL: ${documentUrl}, Step ${i + 1}: ${step?.action} "${step?.target}"): ${message}`);
      throw err;
    }
  }

  console.log(`✅ Flow completed: ${flow.id}`);
}

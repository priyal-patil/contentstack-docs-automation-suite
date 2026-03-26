// core/executor.ts
/**
 * Executes only the steps defined in the flow (from the document).
 * We do NOT add or infer steps – each step comes from the document/flow JSON.
 *
 * Execution policy:
 * - Hard failure (thrown from performAction): record doc-step failure, rethrow immediately.
 *   Remaining steps are NOT executed; the Playwright test fails.
 * - Verification warnings (recorded inside actionRules, no throw): execution continues.
 * - optional: true on a step: on failure, log skip and continue (element not present).
 */
import { Page } from "@playwright/test";
import crypto from "crypto";
import { performAction } from "../rules/core/actionRules";

/** One UUID per Playwright process for all `json-rich-text-editor` flows so customize + entry flows share the same CT name (`Shared JSON RTE Doc CT-{unique}`). */
let jsonRichTextEditorModuleUnique: string | null = null;

function uniqueForFlow(flow: any): string {
  const mod = String(flow?.module || "").toLowerCase();
  if (mod === "json-rich-text-editor") {
    if (!jsonRichTextEditorModuleUnique) jsonRichTextEditorModuleUnique = crypto.randomUUID();
    return jsonRichTextEditorModuleUnique;
  }
  return crypto.randomUUID();
}
import { runSharedSteps } from "../shared/steps/registry";
import { recordDocStepFailure } from "./docStepFailureReporter";
import { ensureTrashHasDeletedGlobalFieldIfNeeded } from "./preflightTrashGlobalField";
import { ensureTrashHasDeletedEntryIfNeeded } from "./preflightTrashEntries";
import { ensureTrashHasDeletedAssetFolderIfNeeded, ensureTrashHasDeletedFileAssetIfNeeded } from "./preflightTrashAssets";

export async function executeFlow(page: Page, flow: any) {
  const unique = uniqueForFlow(flow);
  const documentUrl = flow?.source || flow?.documentUrl || "(no source URL)";
  let currentPage = page;

  console.log("=================================");
  console.log(`Executing Flow: ${flow.id}`);
  console.log("=================================");

  // Shared steps (project-agnostic). Default: login + selectStack.
  await runSharedSteps(page, flow?.use);

  // Optional prerequisite (not document steps): e.g. ensure Trash has a deleted global field before restore-doc steps.
  const preflightId = flow?.preflight?.runFlowWhenTrashGlobalFieldsEmpty;
  if (typeof preflightId === "string" && preflightId.trim()) {
    await ensureTrashHasDeletedGlobalFieldIfNeeded(page, preflightId.trim());
  }

  const preflightEntriesId = flow?.preflight?.runFlowWhenTrashEntriesEmpty;
  if (typeof preflightEntriesId === "string" && preflightEntriesId.trim()) {
    await ensureTrashHasDeletedEntryIfNeeded(page, preflightEntriesId.trim());
  }

  const preflightAssetFoldersId = flow?.preflight?.runFlowWhenTrashAssetFoldersEmpty;
  if (typeof preflightAssetFoldersId === "string" && preflightAssetFoldersId.trim()) {
    await ensureTrashHasDeletedAssetFolderIfNeeded(page, preflightAssetFoldersId.trim());
  }

  const preflightDeletedAssetsId = flow?.preflight?.runFlowWhenTrashDeletedAssetsEmpty;
  if (typeof preflightDeletedAssetsId === "string" && preflightDeletedAssetsId.trim()) {
    await ensureTrashHasDeletedFileAssetIfNeeded(page, preflightDeletedAssetsId.trim());
  }

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
      const maybeNextPage = await performAction(currentPage, step, unique, flow, {
        documentUrl,
        flowId: flow.id,
        stepIndex: i,
      });
      if (maybeNextPage) currentPage = maybeNextPage;
      // Pause after "Create New Rule" so user can perform FVR steps manually and capture locators (run with PAUSE_AFTER_CREATE_NEW_RULE=true --headed)
      if (process.env.PAUSE_AFTER_CREATE_NEW_RULE === "true" && step.target === "Create New Rule (doc step)") {
        console.log("⏸️  Pausing for manual steps. Use Playwright Inspector to capture locators. When done, press Resume in the Inspector to finish the run (remaining steps will be skipped).");
        await currentPage.pause();
        console.log("▶️  Resumed. Skipping remaining steps so you can add locators from your manual run.");
        return;
      }
    } catch (err: any) {
      if (step.optional) {
        console.log(`⏭️  Optional step skipped (not visible): ${step?.action} "${step?.target}"`);
        continue;
      }
      const message = err?.message ?? String(err);
      recordDocStepFailure(documentUrl, flow.id, i, step, message);
      console.error(`❌ Document step failed (URL: ${documentUrl}, Step ${i + 1}: ${step?.action} "${step?.target}"): ${message}`);
      // Do not run subsequent steps; only warnings (non-throwing) allow the flow to continue.
      throw err;
    }
  }

  console.log(`✅ Flow completed: ${flow.id}`);
}

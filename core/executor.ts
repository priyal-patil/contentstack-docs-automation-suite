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
 *
 * Selector maps for step targets (`CLICK_SELECTORS` / `INPUT_SELECTORS`) are **not** resolved here;
 * they are merged in **`loadOverrides()`** in **`rules/core/actionRules.ts`**: fixed layer order, **shallow**
 * object spread per layer—**duplicate keys are last-wins** (not a deep merge).
 */
import fs from "fs";
import path from "path";
import { Page } from "@playwright/test";
import crypto from "crypto";
import { performAction } from "../rules/core/actionRules";
import {
  ensureUsersRolesChainUnique,
  resetUsersRolesChainUnique,
} from "./usersRolesChain";

/** One UUID per Playwright process for all `json-rich-text-editor` flows so customize + entry flows share the same CT name (`Shared JSON RTE Doc CT-{unique}`). */
let jsonRichTextEditorModuleUnique: string | null = null;

function uniqueForFlow(flow: any): string {
  const mod = String(flow?.module || "").toLowerCase();
  if (mod === "json-rich-text-editor") {
    if (!jsonRichTextEditorModuleUnique) jsonRichTextEditorModuleUnique = crypto.randomUUID();
    return jsonRichTextEditorModuleUnique;
  }
  const id = String(flow?.id || "").toLowerCase();
  if (mod === "users-and-roles") {
    if (id === "create-a-role") {
      resetUsersRolesChainUnique();
      return ensureUsersRolesChainUnique();
    }
    if (id === "update-a-role" || id === "delete-a-role") {
      return ensureUsersRolesChainUnique();
    }
  }
  return crypto.randomUUID();
}
import { runSharedSteps } from "../shared/steps/registry";
import { buildMissingElementSummary, recordDocStepFailure, recordDocStepWarning } from "./docStepFailureReporter";
import { ensureTrashHasDeletedGlobalFieldIfNeeded } from "./preflightTrashGlobalField";
import { ensureTrashHasDeletedEntryIfNeeded } from "./preflightTrashEntries";
import { ensureTrashHasDeletedAssetFolderIfNeeded, ensureTrashHasDeletedFileAssetIfNeeded } from "./preflightTrashAssets";

/** Prefer the current page; if it is already closed, try any other open page in the same context. */
async function captureFailureScreenshotBestEffort(page: Page, absShot: string): Promise<boolean> {
  let ctx: import("@playwright/test").BrowserContext | null = null;
  try {
    ctx = page.context();
  } catch {
    ctx = null;
  }
  const openPages = ctx ? ctx.pages().filter((p) => !p.isClosed()) : [];
  const tryOne = async (p: Page) => {
    try {
      await p.screenshot({ path: absShot, fullPage: false, timeout: 20_000 });
      return fs.existsSync(absShot);
    } catch {
      return false;
    }
  };
  if (!page.isClosed() && (await tryOne(page))) return true;
  for (const p of openPages) {
    if (await tryOne(p)) return true;
  }
  return false;
}

/** After a sub-flow (e.g. DAL OAuth), focus a tab on app.lytics.com if one exists. */
async function preferAppLyticsTabPage(currentPage: Page): Promise<Page> {
  try {
    const ctx = currentPage.context();
    const pages = ctx.pages();
    let lastLytics: Page | null = null;
    for (const p of pages) {
      if (p.isClosed()) continue;
      let u = "";
      try {
        u = p.url();
      } catch {
        continue;
      }
      if (/app\.lytics\.com/i.test(u)) lastLytics = p;
    }
    if (lastLytics) {
      await lastLytics.bringToFront().catch(() => {});
      await new Promise((r) => setTimeout(r, 200));
      return lastLytics;
    }
  } catch {
    /* ignore */
  }
  return currentPage;
}

const projectsRootDir = path.resolve(__dirname, "../projects");

/** Resolve projects tree for flows matching JSON id (first .flow.json match). */
export function findFlowPathByFlowId(flowId: string): string | null {
  const want = String(flowId || "").trim();
  if (!want) return null;
  let found: string | null = null;
  const walk = (dir: string) => {
    if (found || !fs.existsSync(dir)) return;
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      let st: fs.Stats;
      try {
        st = fs.statSync(p);
      } catch {
        continue;
      }
      if (st.isDirectory()) walk(p);
      else if (name.endsWith(".flow.json")) {
        try {
          const j = JSON.parse(fs.readFileSync(p, "utf-8")) as { id?: string };
          if (String(j?.id || "") === want) {
            found = p;
            return;
          }
        } catch {
          /* ignore */
        }
      }
    }
  };
  walk(projectsRootDir);
  return found;
}

export type ExecuteFlowOptions = {
  /** When true, skip `runSharedSteps` and `preflight.executeFlowBefore` (used for nested runs). */
  skipSharedSteps?: boolean;
};

export async function executeFlow(page: Page, flow: any, options?: ExecuteFlowOptions) {
  const skipShared = !!options?.skipSharedSteps;
  const unique = uniqueForFlow(flow);
  const documentUrl = flow?.source || flow?.documentUrl || "(no source URL)";
  let currentPage = page;

  console.log("=================================");
  console.log(`Executing Flow: ${flow.id}`);
  console.log("=================================");

  const flowTypeEarly = String(flow?.type || "").toLowerCase();
  const sourceUrlEarly = String(flow?.source || flow?.documentUrl || "").trim();
  const hasNoStepsEarly = !Array.isArray(flow.steps) || flow.steps.length === 0;
  const hasPreflight =
    flow?.preflight &&
    typeof flow.preflight === "object" &&
    Object.keys(flow.preflight).filter((k) => {
      const v = (flow.preflight as Record<string, unknown>)[k];
      return v !== undefined && v !== null && String(v).trim() !== "";
    }).length > 0;

  // Doc-only informational: load public docs URL without app login (skip when preflight needs the app).
  if (
    !skipShared &&
    hasNoStepsEarly &&
    sourceUrlEarly &&
    (flowTypeEarly === "informational" || flowTypeEarly === "doc_only") &&
    !hasPreflight
  ) {
    console.log(`📄 Informational flow: loading ${sourceUrlEarly}`);
    await page.goto(sourceUrlEarly, { waitUntil: "domcontentloaded", timeout: 90_000 });
    const title = (await page.title().catch(() => "")) || "";
    if (!title.trim()) {
      throw new Error(`Informational flow "${flow.id}": empty document title after loading ${sourceUrlEarly}`);
    }
    console.log(`✅ Informational flow completed (doc load): ${flow.id}`);
    return;
  }

  // Maximize browser window for each flow — ensures consistent 1920×1080 layout
  // in headed mode and matches the GHA viewport so nav items never overflow into "More".
  await page.setViewportSize({ width: 1920, height: 1080 }).catch(() => {});

  // Shared steps (project-agnostic). Default: login + selectStack.
  if (!skipShared) {
    await runSharedSteps(page, flow?.use);
  }

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

  // Run another flow on the same page/session (e.g. file upload through Deploy, then validate Deployments doc on the next screen).
  // Optional: run the first N steps of this flow first (e.g. open Launch + confirm Projects page), then run the subflow with
  // `skipFirstStepsInExecuteFlowBefore` to avoid duplicating those steps in the child JSON.
  const preflightObj =
    flow?.preflight && typeof flow.preflight === "object" ? (flow.preflight as Record<string, unknown>) : null;
  const executeBeforeId =
    preflightObj && typeof preflightObj.executeFlowBefore === "string" ? preflightObj.executeFlowBefore.trim() : "";
  let leadingBefore = preflightObj ? Number(preflightObj.leadingStepsBeforeExecuteFlowBefore) : NaN;
  if (!Number.isFinite(leadingBefore) || leadingBefore < 0) leadingBefore = 0;
  leadingBefore = Math.floor(leadingBefore);
  let skipFirstInSub = preflightObj ? Number(preflightObj.skipFirstStepsInExecuteFlowBefore) : NaN;
  if (!Number.isFinite(skipFirstInSub) || skipFirstInSub < 0) skipFirstInSub = 0;
  skipFirstInSub = Math.floor(skipFirstInSub);

  let mainStepStartIndex = 0;

  if (!skipShared && executeBeforeId) {
    const stepsEarly = Array.isArray(flow.steps) ? flow.steps : [];
    if (leadingBefore > 0) {
      if (leadingBefore > stepsEarly.length) {
        throw new Error(
          `Flow "${flow.id}": preflight.leadingStepsBeforeExecuteFlowBefore (${leadingBefore}) exceeds steps length (${stepsEarly.length}).`
        );
      }
      for (let i = 0; i < leadingBefore; i++) {
        const step = stepsEarly[i];
        console.log(`STEP ${i + 1}/${stepsEarly.length} (before preflight):`, step);
        try {
          const maybeNextPage = await performAction(currentPage, step, unique, flow, {
            documentUrl,
            flowId: flow.id,
            stepIndex: i,
          });
          if (maybeNextPage) currentPage = maybeNextPage;
        } catch (err: any) {
          if (step.optional) {
            console.log(`⏭️  Optional step skipped (not visible): ${step?.action} "${step?.target}"`);
            continue;
          }
          const message = err?.message ?? String(err);
          const missingElementSummary = buildMissingElementSummary(step, message);
          let screenshotRelativePath: string | undefined;
          try {
            const reportDir = process.env.REPORT_DIR || path.join(process.cwd(), "reports/latest");
            const shotDir = path.join(reportDir, "flow-screenshots");
            fs.mkdirSync(shotDir, { recursive: true });
            const safeFlow = String(flow.id || "flow").replace(/[^a-zA-Z0-9_.-]/g, "_");
            const fileName = `${safeFlow}-step-${i + 1}.png`;
            const absShot = path.join(shotDir, fileName);
            if (await captureFailureScreenshotBestEffort(currentPage, absShot)) {
              screenshotRelativePath = path.join("flow-screenshots", fileName).split(path.sep).join("/");
            }
          } catch {
            /* best-effort */
          }
          recordDocStepFailure(documentUrl, flow.id, i, step, message, {
            missingElementSummary,
            screenshotRelativePath,
          });
          console.error(`❌ Document step failed (URL: ${documentUrl}, Step ${i + 1}: ${step?.action} "${step?.target}"): ${message}`);
          throw err;
        }
      }
      mainStepStartIndex = leadingBefore;
    }

    const subPath = findFlowPathByFlowId(executeBeforeId);
    if (!subPath) {
      throw new Error(`preflight.executeFlowBefore: no flow found with id "${executeBeforeId}" under projects/`);
    }
    let subFlow: any = JSON.parse(fs.readFileSync(subPath, "utf-8"));
    if (skipFirstInSub > 0) {
      const subSteps = Array.isArray(subFlow.steps) ? subFlow.steps : [];
      if (skipFirstInSub > subSteps.length) {
        throw new Error(
          `Flow "${flow.id}": preflight.skipFirstStepsInExecuteFlowBefore (${skipFirstInSub}) exceeds subflow "${executeBeforeId}" steps (${subSteps.length}).`
        );
      }
      subFlow = { ...subFlow, steps: subSteps.slice(skipFirstInSub) };
    }
    const continueAfterSubFlowFailure =
      preflightObj?.continueOnExecuteFlowBeforeFailure === true ||
      String(preflightObj?.continueOnExecuteFlowBeforeFailure ?? "").toLowerCase() === "true";
    try {
      await executeFlow(currentPage, subFlow, { skipSharedSteps: true });
    } catch (subErr: unknown) {
      if (!continueAfterSubFlowFailure) throw subErr;
      // eslint-disable-next-line no-console
      console.warn(
        `⚠️ preflight.executeFlowBefore("${executeBeforeId}") failed — continuing main flow (preflight.continueOnExecuteFlowBeforeFailure=true):`,
        subErr
      );
    }
    currentPage = await preferAppLyticsTabPage(currentPage);
  }

  console.log("🔎 Flow.steps type:", typeof flow.steps);
  console.log("🔎 Flow.steps length:", Array.isArray(flow.steps) ? flow.steps.length : "NOT_ARRAY");
  console.log("🔎 Flow object:", JSON.stringify(flow, null, 2));

  const hasNoSteps = !Array.isArray(flow.steps) || flow.steps.length === 0;

  if (hasNoSteps) {
    console.log("⚠️ No steps found in flow.");
    return;
  }

  for (let i = mainStepStartIndex; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    console.log(`STEP ${i + 1}/${flow.steps.length}:`, step);
    try {
      const maybeNextPage = await performAction(currentPage, step, unique, flow, {
        documentUrl,
        flowId: flow.id,
        stepIndex: i,
      });
      if (maybeNextPage) currentPage = maybeNextPage;
      // Always emit a warning for steps flagged with alwaysWarn (e.g. UI elements not yet documented).
      if ((step as any).alwaysWarn) {
        const msg = (step as any).warnMessage || `Step "${step?.target}" is not mentioned in the document — update the doc and remove alwaysWarn when ready.`;
        recordDocStepWarning(documentUrl, flow.id, i, step as any, msg);
        console.warn(`⚠️  Always-warn step (passed but flagged): ${step?.action} "${step?.target}" — ${msg}`);
      }
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
      if ((step as any).warnOnly) {
        const warnMsg = err?.message ?? String(err);
        recordDocStepWarning(documentUrl, flow.id, i, step as any, `warnOnly: element not found or not visible — ${warnMsg}`);
        console.warn(`⚠️  Warn-only step (continuing): ${step?.action} "${step?.target}"`);
        continue;
      }
      const message = err?.message ?? String(err);
      const missingElementSummary = buildMissingElementSummary(step, message);
      let screenshotRelativePath: string | undefined;
      try {
        const reportDir = process.env.REPORT_DIR || path.join(process.cwd(), "reports/latest");
        const shotDir = path.join(reportDir, "flow-screenshots");
        fs.mkdirSync(shotDir, { recursive: true });
        const safeFlow = String(flow.id || "flow").replace(/[^a-zA-Z0-9_.-]/g, "_");
        const fileName = `${safeFlow}-step-${i + 1}.png`;
        const absShot = path.join(shotDir, fileName);
        if (await captureFailureScreenshotBestEffort(currentPage, absShot)) {
          screenshotRelativePath = path.join("flow-screenshots", fileName).split(path.sep).join("/");
        }
      } catch {
        // screenshot is best-effort
      }
      recordDocStepFailure(documentUrl, flow.id, i, step, message, {
        missingElementSummary,
        screenshotRelativePath,
      });
      console.error(`❌ Document step failed (URL: ${documentUrl}, Step ${i + 1}: ${step?.action} "${step?.target}"): ${message}`);
      // Do not run subsequent steps; only warnings (non-throwing) allow the flow to continue.
      throw err;
    }
  }

  console.log(`✅ Flow completed: ${flow.id}`);
}

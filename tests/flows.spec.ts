// tests/flows.spec.ts
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { test } from "@playwright/test";
import { executeFlow } from "../core/executor";
import { getDocStepFailures, getDocStepWarnings, clearDocStepFailures } from "../core/docStepFailureReporter";
import { generateFlowReportHtml } from "../core/flowReportGenerator";

/** Flow IDs that ran this execution (for report generation). */
const ranFlowIds = new Set<string>();

// Do NOT use test.describe.configure({ mode: "serial" }) at file scope: Playwright skips
// all remaining tests after the first failure in a serial group (204+ "skipped" in reports).
//
// Inner groups use describe.parallel (not serial): a failure in one URL must NOT skip the rest
// in the same module/stage. Order is still deterministic via flow sort, but tests run independently.

const legacyFlowsDir = path.resolve(__dirname, "../flows");
const projectsDir = path.resolve(__dirname, "../projects");

function loadFlows(): any[] {
  const all: any[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) return;

    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      const stat = fs.statSync(p);

      if (stat.isDirectory()) walk(p);
      else if (
        p.endsWith(".flow.json") ||
        (p.endsWith(".json") &&
          p.includes(`${path.sep}flows${path.sep}`) &&
          // doc-only lists live at flows/<Project>/docs.json; don't treat them as executable flows
          path.basename(p).toLowerCase() !== "docs.json")
      ) {
        const raw = fs.readFileSync(p, "utf-8");
        const flow = JSON.parse(raw);

        // If flow is missing project/module, infer from path: projects/<project>/<module>/flows/<id>.flow.json
        if (!flow.project && p.includes(`${path.sep}projects${path.sep}`)) {
          const rel = path.relative(projectsDir, p);
          const parts = rel.split(path.sep);
          const project = parts[0];
          const moduleName = parts[1];
          flow.project = flow.project || project;
          flow.module = flow.module || moduleName;
        }

        all.push(flow);
      }
    }
  }

  // New architecture
  walk(projectsDir);
  // Legacy support (until you delete old flows folder)
  walk(legacyFlowsDir);
  return all;
}

/**
 * CMS-only tie-breaker when explicit `flowOrder` ties (both 0): create/add → edit/update → export/import/move/bulk → other → delete-like.
 * Non-zero `flowOrder` wins first (dependency chains). See .cursor/rules/cms-execution-order.mdc.
 */
function crudLifecycleRank(f: any): number {
  if (String(f?.project || "") !== "CMS") return 0;
  const id = String(f?.id || "").toLowerCase();
  if (!id) return 50;

  if (
    /^delete-/.test(id) ||
    /^bulk-delete-/.test(id) ||
    id === "edit-or-delete-a-comment" ||
    id === "delete-entries-and-assets-in-bulk"
  ) {
    return 100;
  }

  if (
    /^create-/.test(id) ||
    /^add-/.test(id) ||
    /^new-/.test(id) ||
    /^duplicate-/.test(id) ||
    /^clone-/.test(id) ||
    /^generate-/.test(id) ||
    id.startsWith("set-up-") ||
    id.includes("quickstart") ||
    id.startsWith("get-started")
  ) {
    return 0;
  }

  if (
    /^edit-/.test(id) ||
    /^update-/.test(id) ||
    /^rename-/.test(id) ||
    /^customize-/.test(id) ||
    /^change-/.test(id) ||
    /^modify-/.test(id)
  ) {
    return 10;
  }

  if (
    /^export-/.test(id) ||
    /^import-/.test(id) ||
    /^move-/.test(id) ||
    /^copy-/.test(id) ||
    /^bulk-/.test(id) ||
    /^publish-/.test(id) ||
    /^unpublish-/.test(id) ||
    /^deploy-/.test(id) ||
    /^remove-/.test(id)
  ) {
    return 20;
  }

  return 30;
}

const flows = loadFlows().sort((a, b) => {
  const aStage = (a.stage || "main").toLowerCase();
  const bStage = (b.stage || "main").toLowerCase();

  // Always run delete/cleanup doc URLs last
  const rank = (s: string) => (s === "delete" || s === "cleanup" ? 1 : 0);
  const d = rank(aStage) - rank(bStage);
  if (d !== 0) return d;

  // Explicit dependency ordering for entry lifecycle URLs
  const flowOrder = (f: any) => {
    const id = String(f?.id || "").toLowerCase();
    if (id === "publish-an-entry") return 1;
    if (id === "bulk-publish-localized-entry-versions") return 2;
    if (id === "bulk-delete-localized-entry-versions") return 3;
    if (id === "bulk-publish-entries") return 4;
    if (id === "bulk-unpublish-entries") return 5;
    if (id === "bulk-export-entries") return 6;
    if (id === "bulk-delete-entries") return 7;
    if (id === "unpublish-an-entry") return 8;
    if (id === "unpublish-an-entry-part-2") return 9;
    if (id === "add-a-comment") return 10;
    if (id === "reply-to-a-comment") return 11;
    if (id === "resolve-a-discussion") return 12;
    if (id === "reopen-a-discussion") return 13;
    if (id === "relink-a-discussion") return 14;
    if (id === "name-entry-versions") return 15;
    if (id === "rename-entry-versions") return 16;
    if (id === "remove-entry-version-names") return 17;
    if (id === "compare-entry-versions") return 18;
    if (id === "restore-old-entry-version") return 19;
    if (id === "create-upload-assets") return 20;
    if (id === "create-a-folder") return 21;
    if (id === "rename-a-folder") return 22;
    if (id === "move-a-folder") return 23;
    if (id === "delete-a-folder") return 24;
    if (id === "edit-an-asset") return 25;
    if (id === "bulk-publish-assets") return 26;
    if (id === "bulk-unpublish-assets") return 27;
    if (id === "move-assets-to-folder-in-bulk") return 28;
    if (id === "bulk-delete-assets") return 29;
    if (id === "name-asset-versions") return 30;
    if (id === "rename-asset-versions") return 31;
    if (id === "restore-old-asset-version") return 32;
    if (id === "publish-an-asset") return 33;
    if (id === "unpublish-an-asset") return 34;
    if (id === "generate-a-permanent-asset-url") return 35;
    if (id === "delete-an-asset") return 36;
    if (id === "preview-content-across-multiple-channels") return 37;
    if (id === "track-and-edit-content-in-real-time") return 38;
    if (id === "preview-content-on-different-environments") return 39;
    if (id === "preview-content-across-varied-window-sizes") return 40;
    if (id === "create-a-new-release") return 41;
    if (id === "edit-a-release") return 42;
    if (id === "add-entry-asset-to-a-release") return 43;
    if (id === "add-entry-asset-to-a-release-part-2") return 44;
    if (id === "remove-entry-asset-from-a-release") return 45;
    if (id === "lock-a-release") return 46;
    if (id === "unlock-a-release") return 47;
    if (id === "deploy-a-release") return 48;
    if (id === "clone-a-release") return 49;
    if (id === "delete-a-release") return 50;
    if (id === "update-release-items-to-their-latest-versions") return 51;
    if (id === "generate-a-management-token") return 52;
    if (id === "edit-a-management-token") return 53;
    if (id === "delete-a-management-token") return 54;
    if (id === "create-a-delivery-token") return 55;
    if (id === "edit-a-delivery-token") return 56;
    if (id === "delete-a-delivery-token") return 57;
    if (id === "change-password") return 58;
    if (id === "forgot-reset-password") return 59;
    if (id === "multi-factor-authentication") return 60;
    if (id === "session-management") return 61;
    if (id === "account-lockout-policy") return 62;
    if (id === "change-personal-details") return 63;
    if (id === "create-a-webhook") return 64;
    if (id === "edit-a-webhook") return 65;
    if (id === "export-a-webhook") return 66;
    if (id === "create-a-branch") return 67;
    if (id === "delete-a-branch") return 68;
    if (id === "assign-an-alias-to-a-branch") return 69;
    if (id === "edit-an-alias") return 70;
    if (id === "delete-an-alias") return 71;
    if (id === "use-branches-and-aliases-to-drive-continuous-integration-and-deployment") return 72;
    if (id === "basic-search") return 73;
    if (id === "partial-search") return 74;
    if (id === "advanced-search") return 75;
    if (id === "quick-search") return 76;
    if (id === "save-your-views") return 77;
    if (id === "shared-views") return 78;
    if (id === "use-saved-views") return 79;
    if (id === "about-localization-operator") return 80;
    if (id === "get-localized-entries") return 81;
    if (id === "publish-entries-and-assets-in-bulk") return 82;
    if (id === "unpublish-entries-and-assets-in-bulk") return 83;
    if (id === "delete-entries-and-assets-in-bulk") return 84;
    if (id === "import-prebuilt-content-models") return 85;
    if (id === "about-us-page") return 86;
    if (id === "blog-landing-page") return 87;
    if (id === "blog-listing-page") return 88;
    if (id === "contact-us-page") return 89;
    if (id === "faqs") return 90;
    if (id === "hero-banner") return 91;
    if (id === "product-listing-page") return 92;
    if (id === "website-footer") return 93;
    if (id === "website-header") return 94;
    if (id === "website-homepage") return 95;
    if (id === "about-trash") return 96;
    if (id === "restore-a-deleted-content-type") return 97;
    if (id === "restore-a-deleted-global-field") return 98;
    if (id === "restore-a-deleted-entry") return 99;
    if (id === "restore-a-deleted-asset-folder") return 100;
    if (id === "restore-a-deleted-asset") return 101;
    if (id === "restore-a-deleted-taxonomy") return 102;
    if (id === "restore-a-deleted-term") return 103;
    if (id === "customize-json-rich-text-editor") return 104;
    if (id === "basic-formatting") return 105;
    if (id === "code-blocks") return 106;
    if (id === "markdown-content") return 107;
    if (id === "use-slash-command-for-shortcuts-in-json-rte") return 108;
    if (id === "assets") return 109;
    if (id === "videos-and-social-embeds") return 110;
    if (id === "embed-entries-or-assets-part-1") return 111;
    if (id === "embed-entries-or-assets-part-2") return 112;
    if (id === "block-and-inline-properties-part-1") return 113;
    if (id === "block-and-inline-properties-part-2") return 114;
    if (id === "set-up-live-preview-for-your-stack") return 115;
    if (id === "open-live-preview-in-a-new-tab") return 116;
    if (id === "custom-preview-urls") return 117;
    if (id === "about-workflows") return 118;
    if (id === "about-workflow-stages") return 119;
    if (id === "add-workflows-and-stages") return 120;
    if (id === "update-a-workflow") return 121;
    if (id === "delete-a-workflow") return 122;
    if (id === "enable-or-disable-a-workflow") return 123;
    if (id === "set-edit-access-permissions-for-workflow-stages") return 124;
    if (id === "change-entry-workflow-stage") return 125;
    if (id === "send-an-entry-for-edit-access-approval") return 126;
    if (id === "send-an-entry-for-publish-or-unpublish-approval") return 127;
    if (id === "approve-edit-access-request-for-an-entry") return 128;
    if (id === "revoke-edit-access-for-an-entry") return 129;
    if (id === "create-a-taxonomy") return 130;
    if (id === "edit-a-taxonomy") return 131;
    if (id === "export-a-taxonomy") return 132;
    if (id === "import-a-taxonomy") return 133;
    if (id === "delete-a-taxonomy") return 134;
    if (id === "add-taxonomy-to-a-content-type") return 135;
    return 0;
  };
  const fd = flowOrder(a) - flowOrder(b);
  if (fd !== 0) return fd;

  const cr = crudLifecycleRank(a) - crudLifecycleRank(b);
  if (cr !== 0) return cr;

  // Stable ordering within stage for determinism
  const aKey = `${a.project || ""}::${a.module || ""}::${a.id || ""}`;
  const bKey = `${b.project || ""}::${b.module || ""}::${b.id || ""}`;
  return aKey.localeCompare(bKey);
});

// After all flow tests: write doc-step failures for technical writers (which URL failed at which step, element not found, etc.)
test.afterAll(() => {
  const failures = getDocStepFailures();
  const warnings = getDocStepWarnings();
  const reportDir = process.env.REPORT_DIR || path.resolve(__dirname, "../reports/latest");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, "doc-step-failures.json");
  const warnPath = path.join(reportDir, "doc-step-warnings.json");
  const payload = {
    generatedAt: new Date().toISOString(),
    description:
      "Document steps that could not be executed (e.g. element not found). Use this to update the document: fix or add the missing step for the given URL at the given step.",
    failedFlows: failures.length,
    failures: failures.map((f) => ({
      documentUrl: f.documentUrl,
      flowId: f.flowId,
      stepNumber: f.stepNumber,
      stepIndex: f.stepIndex,
      action: f.action,
      target: f.target,
      value: f.value,
      errorMessage: f.errorMessage,
      missingElementSummary: f.missingElementSummary,
      screenshotRelativePath: f.screenshotRelativePath,
      step: f.step,
    })),
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
  const warningPayload = {
    generatedAt: new Date().toISOString(),
    description:
      "Document verification warnings (position/label/modal/name mismatch). Flow continues to end; use these warnings to improve docs/UI alignment.",
    warningFlows: warnings.length,
    warnings: warnings.map((w) => ({
      documentUrl: w.documentUrl,
      flowId: w.flowId,
      stepNumber: w.stepNumber,
      stepIndex: w.stepIndex,
      action: w.action,
      target: w.target,
      value: w.value,
      warningMessage: w.warningMessage,
      step: w.step,
    })),
  };
  fs.writeFileSync(warnPath, JSON.stringify(warningPayload, null, 2), "utf-8");
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`\n📋 Doc-step failures (for technical writers): ${outPath}`);
  }
  if (warnings.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`\n⚠️ Doc-step warnings (for technical writers): ${warnPath}`);
  }

  // Generate HTML flow report for each flow that ran; print link and open
  const reportPaths: string[] = [];
  for (const flowId of ranFlowIds) {
    const reportPath = generateFlowReportHtml(flowId, reportDir);
    if (reportPath) reportPaths.push(reportPath);
  }
  if (reportPaths.length > 0) {
    const fileUrl = "file://" + (reportPaths[0].startsWith("/") ? reportPaths[0] : path.resolve(reportPaths[0]));
    // eslint-disable-next-line no-console
    console.log(`\n📄 Flow report: ${fileUrl}`);
    for (const p of reportPaths.slice(1)) {
      // eslint-disable-next-line no-console
      console.log(`   ${"file://" + (p.startsWith("/") ? p : path.resolve(p))}`);
    }
    if (process.env.OPEN_FLOW_REPORT !== "false") {
      try {
        execSync(`open "${reportPaths[0]}"`, { stdio: "ignore" });
      } catch {
        // ignore if open fails (e.g. headless/CI)
      }
    }
  }

  clearDocStepFailures();
});

/** Flows in global sort order, grouped by project/module/stage (each group runs in parallel). */
function groupFlowsByProjectModuleStage(flowList: any[]): Map<string, any[]> {
  const m = new Map<string, any[]>();
  for (const flow of flowList) {
    const projectName = flow.project || "UnknownProject";
    const moduleName = flow.module || "unknown-module";
    const stage = flow.stage || "main";
    const key = `${projectName}::${moduleName}::${stage}`;
    if (!m.has(key)) m.set(key, []);
    m.get(key)!.push(flow);
  }
  return m;
}

const flowGroups = groupFlowsByProjectModuleStage(flows);

test.describe.parallel("Flow suite (parallel across modules; all URLs in a module/stage run even if one fails)", () => {
  // Default project timeout is 7m; headed + PW_SLOWMO long JSON RTE flows can exceed 20m wall time.
  test.describe.configure({ timeout: 1_800_000 });
  for (const [, groupFlows] of flowGroups) {
    const first = groupFlows[0];
    const projectName = first.project || "UnknownProject";
    const moduleName = first.module || "unknown-module";
    const stage = first.stage || "main";

    test.describe.parallel(`Project=${projectName} Module=${moduleName} Stage=${stage}`, () => {
      for (const flow of groupFlows) {
        const testName = flow.id || path.basename(flow.source || "unknown-flow");

        test(testName, async ({ browser }) => {
          ranFlowIds.add(flow.id || testName);
          const context = await browser.newContext({ storageState: "auth.json" });
          const page = await context.newPage();

          await executeFlow(page, flow);

          await context.close();
        });
      }
    });
  }
});


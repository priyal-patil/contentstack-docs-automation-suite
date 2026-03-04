// tests/flows.spec.ts
import fs from "fs";
import path from "path";
import { test } from "@playwright/test";
import { executeFlow } from "../core/executor";
import { getDocStepFailures, clearDocStepFailures } from "../core/docStepFailureReporter";

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

const flows = loadFlows().sort((a, b) => {
  const aStage = (a.stage || "main").toLowerCase();
  const bStage = (b.stage || "main").toLowerCase();

  // Always run delete/cleanup doc URLs last
  const rank = (s: string) => (s === "delete" || s === "cleanup" ? 1 : 0);
  const d = rank(aStage) - rank(bStage);
  if (d !== 0) return d;

  // Stable ordering within stage for determinism
  const aKey = `${a.project || ""}::${a.module || ""}::${a.id || ""}`;
  const bKey = `${b.project || ""}::${b.module || ""}::${b.id || ""}`;
  return aKey.localeCompare(bKey);
});

// After all flow tests: write doc-step failures for technical writers (which URL failed at which step, element not found, etc.)
test.afterAll(() => {
  const failures = getDocStepFailures();
  const reportDir = process.env.REPORT_DIR || path.resolve(__dirname, "../reports/latest");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, "doc-step-failures.json");
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
      step: f.step,
    })),
  };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf-8");
  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`\n📋 Doc-step failures (for technical writers): ${outPath}`);
  }
  clearDocStepFailures();
});

for (const flow of flows) {
  const projectName = flow.project || "UnknownProject";
  const moduleName = flow.module || "unknown-module";
  const stage = flow.stage || "main";
  const testName = flow.id || path.basename(flow.source || "unknown-flow");

  test.describe(`Project=${projectName} Module=${moduleName} Stage=${stage}`, () => {
    test(testName, async ({ browser }) => {
      const context = await browser.newContext({ storageState: "auth.json" });
      const page = await context.newPage();

      await executeFlow(page, flow);

      await context.close();
    });
  });
}


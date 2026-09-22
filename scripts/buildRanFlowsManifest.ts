/**
 * Build reports/<dir>/ran-flows.json from the flow files themselves, without running them.
 *
 *   npx ts-node scripts/buildRanFlowsManifest.ts "<pattern>"
 *
 * Used by run-docs-full-pass.sh with SKIP_FLOWS=1 (audit-only pass: half B over the pages
 * a flow set documents, when the app half cannot run — e.g. the QA account is locked).
 *
 * Entries are written with stepsExecuted:false so the combined report says "not run"
 * instead of showing unexecuted steps as passed.
 */

import fs from "fs";
import path from "path";

const pattern = process.argv[2];
if (!pattern) {
  console.error('Usage: ts-node scripts/buildRanFlowsManifest.ts "<pattern>"');
  process.exit(1);
}

const REPORT_DIR = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
const projectsDir = path.join(process.cwd(), "projects");

/** Same shape as the -g strings used against flow test titles: "Project=X Module=y", or a bare flow id. */
const terms = pattern.split(/\s+/).filter(Boolean);
const wantProject = terms.find((t) => /^Project=/i.test(t))?.split("=")[1];
const wantModule = terms.find((t) => /^Module=/i.test(t))?.split("=")[1];
const wantId = terms.filter((t) => !/^(Project|Module|Stage)=/i.test(t)).join(" ").trim();

const flows: any[] = [];
const walk = (d: string) => {
  if (!fs.existsSync(d)) return;
  for (const n of fs.readdirSync(d)) {
    const p = path.join(d, n);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (n.endsWith(".flow.json")) flows.push(JSON.parse(fs.readFileSync(p, "utf-8")));
  }
};
walk(projectsDir);

const matched = flows.filter((f) => {
  if (wantProject && String(f.project || "").toLowerCase() !== wantProject.toLowerCase()) return false;
  if (wantModule && String(f.module || "").toLowerCase() !== wantModule.toLowerCase()) return false;
  if (wantId && !new RegExp(wantId, "i").test(String(f.id || ""))) return false;
  return true;
});

fs.mkdirSync(REPORT_DIR, { recursive: true });
const manifest = {
  generatedAt: new Date().toISOString(),
  description:
    "Flows matched by pattern WITHOUT being executed (SKIP_FLOWS). stepsExecuted:false — the app half of these docs was not run.",
  pattern,
  flows: matched
    .filter((f) => f.source)
    .map((f) => ({
      flowId: String(f.id || ""),
      project: String(f.project || ""),
      module: String(f.module || ""),
      docUrl: String(f.source || ""),
      stepsExecuted: false,
    })),
};
fs.writeFileSync(path.join(REPORT_DIR, "ran-flows.json"), JSON.stringify(manifest, null, 2), "utf-8");
console.log(`Manifest (not executed): ${manifest.flows.length} flow(s) matched "${pattern}"`);
for (const f of manifest.flows) console.log(`  ${f.flowId} -> ${f.docUrl}`);

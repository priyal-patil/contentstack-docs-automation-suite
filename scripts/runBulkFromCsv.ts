/**
 * 1) Run bulk ingest from a CSV (creates/updates flow JSON + selectors; adds informational to docs.json and docs-urls.csv).
 * 2) Execute only the URLs from that sheet: docs-audit for doc URLs, flow tests for executable flow ids.
 *
 * Usage:
 *   npx ts-node scripts/runBulkFromCsv.ts --input "data/Bulk-urls - Sheet1.csv"
 *   npx ts-node scripts/runBulkFromCsv.ts --input "data/Bulk-urls-Sheet1-corrected.csv" --headed
 *   npm run run:bulk -- --input "data/Bulk-urls - Sheet1.csv" --headed
 */

import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";

function getArg(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

async function main() {
  const input = getArg(process.argv, "--input");
  if (!input) {
    // eslint-disable-next-line no-console
    console.error("Usage: npx ts-node scripts/runBulkFromCsv.ts --input <bulk.csv> [--headed] [--analyze-docs]");
    process.exit(1);
  }
  const headed = process.argv.includes("--headed");
  const analyzeDocs = process.argv.includes("--analyze-docs");
  const cwd = process.cwd();
  const inputPath = path.resolve(cwd, input);
  if (!fs.existsSync(inputPath)) {
    // eslint-disable-next-line no-console
    console.error("Input file not found:", inputPath);
    process.exit(1);
  }

  // 1) Run bulk ingest (creates JSON + selectors; adds informational to docs.json and docs-urls.csv)
  // eslint-disable-next-line no-console
  console.log("\n📥 Step 1: Bulk ingest from", input, analyzeDocs ? "(with --analyze-docs)" : "");
  const inputRel = path.relative(cwd, inputPath) || input;
  const inputQuoted = inputRel.includes(" ") ? `"${inputRel}"` : inputRel;
  const ingestArgs = ["ts-node", "scripts/bulkIngestFromUrls.ts", "--input", inputQuoted];
  if (analyzeDocs) ingestArgs.push("--analyze-docs");
  const ingest = spawnSync("npx", ingestArgs, { cwd, stdio: "inherit", shell: true });
  if (ingest.status !== 0) {
    process.exit(ingest.status ?? 1);
  }

  // 2) Get expanded items (url, id, kind) from the CSV so we run only these (optionally with doc analysis)
  // eslint-disable-next-line no-console
  console.log("\n📋 Step 2: Resolving URLs and flow ids from sheet...");
  const { getExpandedItemsFromCsv } = require("./bulkIngestFromUrls");
  const items = (await getExpandedItemsFromCsv(inputPath, { analyzeDocs })) as Array<{
    url: string;
    id: string;
    kind: string;
  }>;
  const urls = [...new Set(items.map((x) => x.url))];
  const executableIds = items.filter((x) => x.kind === "executable").map((x) => x.id);
  const flowIds = [...new Set(executableIds)];

  if (urls.length === 0) {
    // eslint-disable-next-line no-console
    console.log("No URLs in sheet. Skipping execution.");
    return;
  }

  // 3) Write a temporary CSV with only these URLs for docs-audit (run only sheet URLs)
  //    and merge these URLs into the main docs-urls.csv so they are always included for future audits
  const dataDir = path.join(cwd, "data");
  const bulkRunCsv = path.join(dataDir, "docs-urls-bulk-run.csv");
  const mainDocsCsv = path.join(dataDir, "docs-urls.csv");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    bulkRunCsv,
    "# Docs to audit (this run: only URLs from bulk sheet)\n" + urls.sort().join("\n") + "\n",
    "utf-8"
  );
  const docUrls = urls.filter((u) => u.includes("contentstack.com/docs"));
  if (docUrls.length > 0) {
    let commentHeader = "# Docs to audit (one per line)\n";
    const existingSet = new Set<string>();
    if (fs.existsSync(mainDocsCsv)) {
      const raw = fs.readFileSync(mainDocsCsv, "utf-8").split(/\r?\n/);
      const commentLines: string[] = [];
      for (const line of raw) {
        const t = line.trim();
        if (t.startsWith("#")) commentLines.push(line);
        else if (t) existingSet.add(t);
      }
      if (commentLines.length) commentHeader = commentLines.join("\n") + "\n";
    }
    docUrls.forEach((u) => existingSet.add(u));
    fs.writeFileSync(mainDocsCsv, commentHeader + [...existingSet].sort().join("\n") + "\n", "utf-8");
    // eslint-disable-next-line no-console
    console.log("📋 Merged", docUrls.length, "URL(s) into data/docs-urls.csv for future audits.");
  }

  // 4) Run docs-audit for only these URLs
  // eslint-disable-next-line no-console
  console.log("\n🔍 Step 3: Running docs-audit for", urls.length, "URL(s) from sheet...");
  const auditArgs = ["playwright", "test", "tests/docs-audit.spec.ts", "--workers=1"];
  if (headed) auditArgs.push("--headed");
  const audit = spawnSync("npx", auditArgs, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DOCS_URLS_CSV: "data/docs-urls-bulk-run.csv" },
  });
  if (audit.status !== 0) {
    // eslint-disable-next-line no-console
    console.warn("Docs audit exited with", audit.status);
  }

  // 5) Run flow tests for only these flow ids (if any exist)
  if (flowIds.length > 0) {
    // eslint-disable-next-line no-console
    console.log("\n▶️ Step 4: Running flow tests for", flowIds.length, "flow id(s) from sheet:", flowIds.join(", "));
    const grep = flowIds.map((id: string) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    // Quote -g so shell does not interpret | as pipe
    const flowArgs = ["playwright", "test", "tests/flows.spec.ts", "--project=flows", "-g", `"${grep}"`, "--workers=1"];
    if (headed) flowArgs.push("--headed");
    const flowRun = spawnSync("npx", flowArgs, { cwd, stdio: "inherit", shell: true });
    if (flowRun.status !== 0) {
      // eslint-disable-next-line no-console
      console.warn("Flow tests exited with", flowRun.status);
    }
  }

  // eslint-disable-next-line no-console
  console.log("\n✅ Run complete: ingest + execution for sheet URLs only.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

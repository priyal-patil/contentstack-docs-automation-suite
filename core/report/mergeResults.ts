import path from "path";
import fse from "fs-extra";

type CombinedRow = {
  kind: "doc_only" | "flow";
  project: string;
  id: string;
  source: string;
  status: "passed" | "failed" | "skipped" | "timedOut" | "interrupted" | "unknown";
  details?: string;
};

function getArgValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

async function tryReadJson(filePath: string): Promise<any | null> {
  if (!(await fse.pathExists(filePath))) return null;
  return await fse.readJson(filePath);
}

function csvEscape(s: string): string {
  const v = String(s ?? "");
  if (/[,"\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

function inferProjectFromDescribeTitle(title: string): string | null {
  const m = title.match(/Project=([A-Za-z0-9_-]+)/);
  return m?.[1] || null;
}

function mapPwStatus(s: string | undefined): CombinedRow["status"] {
  if (!s) return "unknown";
  // playwright statuses: passed/failed/skipped/timedOut/interrupted
  if (s === "passed" || s === "failed" || s === "skipped" || s === "timedOut" || s === "interrupted") return s;
  return "unknown";
}

function flattenPlaywrightJson(root: any): CombinedRow[] {
  const out: CombinedRow[] = [];

  // Playwright JSON reporter shape:
  // { suites: [ { title, file, suites, specs: [ { title, tests:[{results:[{status,...}]}] } ] } ] }
  function walkSuite(suite: any, inheritedProject: string | null) {
    const suiteTitle = String(suite?.title || "");
    const projectHere = inferProjectFromDescribeTitle(suiteTitle) || inheritedProject;

    for (const spec of suite?.specs || []) {
      const specTitle = String(spec?.title || "");
      for (const t of spec?.tests || []) {
        const finalResult = (t?.results || [])[0] || {};
        const status = mapPwStatus(finalResult?.status || t?.status);
        const file = String(spec?.file || suite?.file || "");

        // Filter out docs.spec.ts (doc-only suite produces its own docs-results.json).
        // The JSON reporter may emit bare filenames ("docs.spec.ts") or full paths.
        if (file.endsWith("docs.spec.ts")) continue;

        out.push({
          kind: "flow",
          project: projectHere || "Unknown",
          id: specTitle || t?.title || "unknown-flow",
          source: file,
          status,
        });
      }
    }

    for (const child of suite?.suites || []) walkSuite(child, projectHere);
  }

  for (const s of root?.suites || []) walkSuite(s, null);
  return out;
}

async function main() {
  const reportDirArg = getArgValue(process.argv, "--reportDir");
  const reportDir = reportDirArg ? path.resolve(process.cwd(), reportDirArg) : path.resolve(process.cwd(), "reports/latest");

  const docsPath = path.join(reportDir, "docs-results.json");
  const flowsPath = path.join(reportDir, "flows-results.json");

  const docs = await tryReadJson(docsPath);
  const pw = await tryReadJson(flowsPath);

  const combined: CombinedRow[] = [];

  if (docs?.results && Array.isArray(docs.results)) {
    for (const r of docs.results) {
      combined.push({
        kind: "doc_only",
        project: String(r.project || "Unknown"),
        id: String(r.url || "unknown-url"),
        source: String(r.url || ""),
        status: mapPwStatus(r.status),
        details: r.error ? String(r.error) : undefined,
      });
    }
  }

  if (pw) {
    combined.push(...flattenPlaywrightJson(pw));
  }

  // Outputs
  await fse.ensureDir(reportDir);
  const combinedJson = path.join(reportDir, "combined.json");
  const combinedCsv = path.join(reportDir, "combined.csv");
  const summaryMd = path.join(reportDir, "summary.md");

  await fse.writeJson(combinedJson, { generatedAt: new Date().toISOString(), rows: combined }, { spaces: 2 });

  const csvLines = ["kind,project,id,source,status,details"];
  for (const r of combined) {
    csvLines.push(
      [
        csvEscape(r.kind),
        csvEscape(r.project),
        csvEscape(r.id),
        csvEscape(r.source),
        csvEscape(r.status),
        csvEscape(r.details || ""),
      ].join(",")
    );
  }
  await fse.writeFile(combinedCsv, csvLines.join("\n"), "utf-8");

  const byProject = new Map<string, CombinedRow[]>();
  for (const r of combined) {
    const key = r.project || "Unknown";
    byProject.set(key, [...(byProject.get(key) || []), r]);
  }

  const lines: string[] = [];
  lines.push("## Summary");
  lines.push("");
  lines.push(`Report dir: \`${reportDir}\``);
  lines.push("");
  for (const [proj, rows] of Array.from(byProject.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const pass = rows.filter((r) => r.status === "passed").length;
    const fail = rows.filter((r) => r.status === "failed" || r.status === "timedOut").length;
    const other = rows.length - pass - fail;
    lines.push(`- **${proj}**: total=${rows.length}, passed=${pass}, failed=${fail}, other=${other}`);
  }
  lines.push("");

  await fse.writeFile(summaryMd, lines.join("\n"), "utf-8");

  // eslint-disable-next-line no-console
  console.log(`✅ Wrote: ${combinedJson}`);
  // eslint-disable-next-line no-console
  console.log(`✅ Wrote: ${combinedCsv}`);
  // eslint-disable-next-line no-console
  console.log(`✅ Wrote: ${summaryMd}`);
  // eslint-disable-next-line no-console
  console.log(`Tip: npx ts-node scripts/generateUnifiedReport.ts --reportDir ${reportDir}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.stack || String(e));
  process.exitCode = 1;
});


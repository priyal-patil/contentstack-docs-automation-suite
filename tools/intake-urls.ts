import fs from "fs";
import path from "path";
import fse from "fs-extra";

type DocsJson = {
  project: string;
  type: "doc_only";
  urls: string[];
};

type IntakeSummary = {
  inputCount: number;
  dedupedCount: number;
  byProject: Record<
    string,
    {
      informational: number;
      executable: number;
    }
  >;
  outputs: {
    docsJsonFiles: string[];
    executableFlowFiles: string[];
    summaryFile: string;
  };
};

function getArgValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name);
  if (i === -1) return undefined;
  return argv[i + 1];
}

function normalizeUrl(u: string): string {
  return u.trim().replace(/\s+/g, "");
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function inferProject(url: string): "CMS" | "Launch" | "Personalize" | "Unknown" {
  const u = url.toLowerCase();
  if (u.includes("launch")) return "Launch";
  if (u.includes("personalize") || u.includes("audience") || u.includes("experience")) return "Personalize";

  if (
    u.includes("content-types") ||
    u.includes("entries") ||
    u.includes("assets") ||
    u.includes("content-models") ||
    u.includes("content-modeling") ||
    u.includes("/cms") ||
    u.includes("/stack")
  ) {
    return "CMS";
  }

  return "Unknown";
}

function slugFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1] || "doc";
    return last
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  } catch {
    return "doc";
  }
}

function classify(url: string): "executable" | "informational" {
  // Simple, deterministic rule:
  // - app.contentstack.com URLs can be executable (in-app UI)
  // - docs/content pages are informational unless you explicitly provide steps elsewhere
  const u = url.toLowerCase();
  if (u.includes("app.contentstack.com")) return "executable";
  return "informational";
}

async function readInput(inputPath: string): Promise<string[]> {
  const raw = await fse.readFile(inputPath, "utf-8");
  const ext = path.extname(inputPath).toLowerCase();

  if (ext === ".txt") {
    return raw
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter(Boolean);
  }

  // json: allow ["url", ...] OR { urls: [...] } OR { items: [...] } (best-effort)
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed.map(String);
  if (parsed?.urls && Array.isArray(parsed.urls)) return parsed.urls.map(String);
  if (parsed?.items && Array.isArray(parsed.items)) return parsed.items.map(String);
  throw new Error(`Unsupported JSON input format in: ${inputPath}`);
}

async function loadOrInitDocsJson(filePath: string, project: string): Promise<DocsJson> {
  if (await fse.pathExists(filePath)) {
    const existing = await fse.readJson(filePath);
    const urls = Array.isArray(existing?.urls) ? existing.urls.map(String) : [];
    return { project: String(existing?.project || project), type: "doc_only", urls };
  }
  return { project, type: "doc_only", urls: [] };
}

async function listDocsJsonFiles(flowsRoot: string): Promise<string[]> {
  if (!(await fse.pathExists(flowsRoot))) return [];
  const items = await fse.readdir(flowsRoot);
  const out: string[] = [];
  for (const name of items) {
    const p = path.join(flowsRoot, name);
    const st = await fse.stat(p).catch(() => null);
    if (!st?.isDirectory()) continue;
    const docsPath = path.join(p, "docs.json");
    if (await fse.pathExists(docsPath)) out.push(docsPath);
  }
  return out;
}

async function removeUrlFromOtherDocsJsons(allDocsFiles: string[], keepFile: string, url: string) {
  await Promise.all(
    allDocsFiles.map(async (p) => {
      if (path.resolve(p) === path.resolve(keepFile)) return;
      const existing = await fse.readJson(p).catch(() => null);
      if (!existing || !Array.isArray(existing.urls)) return;
      const before = existing.urls.length;
      const next = existing.urls.map(String).filter((u: string) => u !== url);
      if (next.length === before) return;
      existing.urls = next;
      await fse.writeJson(p, existing, { spaces: 2 });
    })
  );
}

async function main() {
  const input = getArgValue(process.argv, "--input");
  if (!input) {
    throw new Error('Missing required flag: --input (txt or json)');
  }

  const inputPath = path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
  const urlsRaw = await readInput(inputPath);
  const urls = dedupe(urlsRaw.map(normalizeUrl).filter(Boolean));

  const flowsRoot = path.resolve(process.cwd(), "flows");
  const outDir = path.resolve(process.cwd(), "tools/out");
  await fse.ensureDir(outDir);
  const allDocsFiles = await listDocsJsonFiles(flowsRoot);

  const summary: IntakeSummary = {
    inputCount: urlsRaw.length,
    dedupedCount: urls.length,
    byProject: {},
    outputs: {
      docsJsonFiles: [],
      executableFlowFiles: [],
      summaryFile: path.join(outDir, "intake-summary.json"),
    },
  };

  for (const url of urls) {
    const project = inferProject(url);
    const kind = classify(url);
    summary.byProject[project] = summary.byProject[project] || { informational: 0, executable: 0 };

    if (kind === "informational") {
      summary.byProject[project].informational += 1;

      const docsJsonPath = path.join(flowsRoot, project, "docs.json");
      await fse.ensureDir(path.dirname(docsJsonPath));
      const docs = await loadOrInitDocsJson(docsJsonPath, project);
      docs.urls = dedupe([...docs.urls, url]);
      await fse.writeJson(docsJsonPath, docs, { spaces: 2 });
      if (!allDocsFiles.includes(docsJsonPath)) allDocsFiles.push(docsJsonPath);
      await removeUrlFromOtherDocsJsons(allDocsFiles, docsJsonPath, url);

      if (!summary.outputs.docsJsonFiles.includes(docsJsonPath)) summary.outputs.docsJsonFiles.push(docsJsonPath);
      continue;
    }

    // Executable scaffold (only for in-app URLs). If you later add a real step-extraction pipeline,
    // replace this with extracted steps; if none, fall back to informational.
    summary.byProject[project].executable += 1;

    const flowId = slugFromUrl(url);
    const flowPath = path.join(flowsRoot, project, "executable", `${flowId}.json`);
    await fse.ensureDir(path.dirname(flowPath));

    if (!(await fse.pathExists(flowPath))) {
      await fse.writeJson(
        flowPath,
        {
          id: flowId,
          project,
          module: "unknown",
          source: url,
          type: "executable",
          use: ["login", "selectStack"],
          steps: [{ action: "navigate", target: url }],
        },
        { spaces: 2 }
      );
    }

    summary.outputs.executableFlowFiles.push(flowPath);
  }

  await fse.writeJson(summary.outputs.summaryFile, summary, { spaces: 2 });

  // Append all ingested URLs to data/docs-urls.csv so docs-audit.spec.ts runs for them
  if (urls.length > 0) {
    const docsUrlsCsvPath = path.resolve(process.cwd(), "data", "docs-urls.csv");
    const commentLines: string[] = [];
    const existingUrls = new Set<string>();
    if (await fse.pathExists(docsUrlsCsvPath)) {
      const lines = (await fse.readFile(docsUrlsCsvPath, "utf-8")).split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("#")) {
          commentLines.push(line);
        } else {
          existingUrls.add(trimmed);
        }
      }
    }
    for (const u of urls) existingUrls.add(u);
    const header = commentLines.length ? commentLines.join("\n") + "\n" : "# Docs to audit (one per line)\n";
    const urlLines = [...existingUrls].sort();
    await fse.ensureDir(path.dirname(docsUrlsCsvPath));
    await fse.writeFile(docsUrlsCsvPath, header + urlLines.join("\n") + "\n", "utf-8");
    // eslint-disable-next-line no-console
    console.log(`\n📋 Added ${urls.length} URL(s) to data/docs-urls.csv`);
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.stack || String(e));
  process.exitCode = 1;
});


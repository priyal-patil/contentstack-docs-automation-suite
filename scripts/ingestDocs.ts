import fs from "fs";
import path from "path";

type IngestItem = {
  project: string;
  module: string;
  id: string;
  source: string;
  stage?: string; // e.g. "main" | "delete" (optional; inferred if absent)
};

function isStackModule(moduleName: string): boolean {
  const m = (moduleName || "").trim().toLowerCase();
  return m === "stack" || m === "stck";
}

const STACKS_PAGE_URL = "https://app.contentstack.com/#!/stacks";

function die(msg: string): never {
  // eslint-disable-next-line no-console
  console.error(msg);
  process.exit(1);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) args[key] = true;
      else {
        args[key] = next;
        i++;
      }
    }
  }
  return args;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function readJsonFile(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function parseCsv(p: string): IngestItem[] {
  const raw = fs.readFileSync(p, "utf-8").trim();
  if (!raw) return [];
  const lines = raw.split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(",").map((s) => s.trim());
  const idx = (name: string) => header.findIndex((h) => h.toLowerCase() === name.toLowerCase());
  const iProject = idx("project");
  const iModule = idx("module");
  const iId = idx("id");
  const iSource = idx("source");
  const iStage = idx("stage");
  if ([iProject, iModule, iId, iSource].some((i) => i < 0)) {
    die(`CSV must have headers: project,module,id,source. Got: ${header.join(",")}`);
  }
  const out: IngestItem[] = [];
  for (const line of lines.slice(1)) {
    const cols = line.split(",").map((s) => s.trim());
    out.push({
      project: cols[iProject],
      module: cols[iModule],
      id: cols[iId],
      source: cols[iSource],
      stage: iStage >= 0 ? cols[iStage] : undefined,
    });
  }
  return out;
}

function inferStage(it: Pick<IngestItem, "id" | "source" | "stage">): string {
  const explicit = (it.stage || "").trim();
  if (explicit) return explicit;

  const id = (it.id || "").toLowerCase();
  const src = (it.source || "").toLowerCase();

  // Any "delete" doc URL should run at the very end
  if (id.startsWith("delete-")) return "delete";
  if (src.includes("/delete-") || src.includes("/delete/") || src.includes("delete-a-")) return "delete";

  return "main";
}

function normalizeProject(p: string) {
  // Prefer canonical names used by scripts/tests
  const up = p.trim();
  if (!up) return up;
  if (up.toLowerCase() === "cms") return "CMS";
  if (up.toLowerCase() === "launch") return "Launch";
  if (up.toLowerCase() === "personalize") return "Personalize";
  return up;
}

function updateModuleIndex(moduleDir: string, items: IngestItem[]) {
  const indexPath = path.join(moduleDir, "index.ts");
  const relFlows = items.map((i) => ({
    id: i.id,
    flowPath: `__dirname + "/flows/${i.id}.flow.json"`,
    selectorsPath: `__dirname + "/selectors/${i.id}.selectors.ts"`,
    source: i.source,
    project: i.project,
    module: i.module,
  }));

  const body = `export type FlowMeta = {
  id: string;
  project: string;
  module: string;
  source: string;
  flowPath: string;
  selectorsPath?: string;
};

export const flows: FlowMeta[] = [
${relFlows
  .map(
    (f) => `  {
    id: "${f.id}",
    project: "${f.project}",
    module: "${f.module}",
    source: "${f.source}",
    flowPath: ${f.flowPath},
    selectorsPath: ${f.selectorsPath},
  }`
  )
  .join(",\n")}
];
`;
  fs.writeFileSync(indexPath, body, "utf-8");
}

function main() {
  const args = parseArgs(process.argv);
  const input = args.input;
  if (!input || typeof input !== "string") die("Usage: ts-node scripts/ingestDocs.ts --input <file.json|file.csv>");

  const inputPath = path.resolve(process.cwd(), input);
  if (!fs.existsSync(inputPath)) die(`Input file not found: ${inputPath}`);

  let items: IngestItem[] = [];
  if (inputPath.endsWith(".json")) {
    const raw = readJsonFile(inputPath);
    if (!Array.isArray(raw)) die("JSON input must be an array of {project,module,id,source} objects.");
    items = raw as IngestItem[];
  } else if (inputPath.endsWith(".csv")) {
    items = parseCsv(inputPath);
  } else {
    die("Input must be .json or .csv");
  }

  const byModule = new Map<string, IngestItem[]>();

  for (const it of items) {
    const project = normalizeProject(it.project);
    const moduleName = it.module?.trim();
    const id = it.id?.trim();
    const source = it.source?.trim();
    if (!project || !moduleName || !id || !source) die(`Invalid item: ${JSON.stringify(it)}`);

    const moduleDir = path.resolve(process.cwd(), "projects", project, moduleName);
    const flowsDir = path.join(moduleDir, "flows");
    const selDir = path.join(moduleDir, "selectors");
    ensureDir(flowsDir);
    ensureDir(selDir);

    const flowPath = path.join(flowsDir, `${id}.flow.json`);
    if (!fs.existsSync(flowPath)) {
      const stage = inferStage({ id, source, stage: it.stage });
      const stackModule = isStackModule(moduleName);
      const flow = {
        id,
        project,
        module: moduleName,
        stage,
        source,
        type: "executable",
        use: stackModule ? ["login"] : ["login", "selectStack"],
        steps: stackModule ? [{ action: "navigate", target: STACKS_PAGE_URL }] : [],
      };
      fs.writeFileSync(flowPath, JSON.stringify(flow, null, 2) + "\n", "utf-8");
    }

    const selectorsPath = path.join(selDir, `${id}.selectors.ts`);
    if (!fs.existsSync(selectorsPath)) {
      const stub = `export const CLICK_SELECTORS: Record<string, string> = {\n  // TODO: add stable selectors (prefer data-test-id)\n};\n\nexport const INPUT_SELECTORS: Record<string, string> = {\n  // TODO: add stable selectors (prefer data-test-id)\n};\n`;
      fs.writeFileSync(selectorsPath, stub, "utf-8");
    }

    const key = `${project}::${moduleName}`;
    const list = byModule.get(key) ?? [];
    list.push({ project, module: moduleName, id, source });
    byModule.set(key, list);
  }

  for (const [key, list] of byModule.entries()) {
    const [project, moduleName] = key.split("::");
    const moduleDir = path.resolve(process.cwd(), "projects", project, moduleName);
    updateModuleIndex(moduleDir, list);
  }

  // eslint-disable-next-line no-console
  console.log(`✅ Ingested ${items.length} flows into projects/`);
}

main();


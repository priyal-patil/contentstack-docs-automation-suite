/**
 * Bulk ingest: create flow + selectors from a JSON list or CSV/Excel (export to CSV) of URLs with module, id, and optional DOM/selectors/steps.
 *
 * Supported input formats:
 *   1. JSON file (array of objects) – see BulkItem type below.
 *   2. CSV file – e.g. export from Excel (Save As → CSV UTF-8). Columns: url, module, id, project, stage, dom_file, steps_file, selectors_file.
 *      - dom_file: optional path to HTML file (relative to project root or to the CSV’s directory) for DOM; script parses [data-test-id] etc. into selectors.
 *      - steps_file: optional path to JSON file containing array of steps.
 *      - selectors_file: optional path to JSON file containing { click: {}, input: {} }.
 *
 * Usage:
 *   npx ts-node scripts/bulkIngestFromUrls.ts --input data/bulk-urls.json
 *   npx ts-node scripts/bulkIngestFromUrls.ts --input data/bulk-urls.csv
 *   npm run ingest:bulk -- --input data/bulk-urls.csv
 */

import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";
import { upsertDocsUrlsCsv, normalizeCanonicalDocUrl, type DocUrlRow } from "../core/docsUrlsCsv";
import { analyzeDocUrl } from "./analyzeDocUrl";
import { docStepsToFlowSteps } from "./docStepsToFlowActions";

export type FlowKind = "executable" | "informational";

type BulkItem = {
  url: string;
  module: string;
  id: string;
  project?: string;
  stage?: string;
  /** If set, overrides URL-based classification. */
  type?: FlowKind;
  /** Optional: expand to multiple flows (e.g. ["part-1","part-2"] or 2 -> part-1, part-2). */
  parts?: string[] | number;
  steps?: Array<{ action: string; target: string; value?: string; nth?: number; expected?: Record<string, unknown> }>;
  selectors?: {
    click?: Record<string, string>;
    input?: Record<string, string>;
  };
  dom?: string;
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

function parseArgs(argv: string[]): Record<string, string | boolean> {
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

/** Parse one CSV row; supports quoted fields with commas and newlines. */
function parseCSVRow(line: string): string[] {
  const out: string[] = [];
  let i = 0;
  while (i <= line.length) {
    if (line[i] === '"') {
      let s = "";
      i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') {
          s += '"';
          i += 2;
        } else if (line[i] === '"') {
          i++;
          break;
        } else {
          s += line[i];
          i++;
        }
      }
      out.push(s);
    } else {
      const end = line.indexOf(",", i);
      const slice = end === -1 ? line.slice(i) : line.slice(i, end);
      out.push(slice.trim());
      i = end === -1 ? line.length + 1 : end + 1;
    }
  }
  return out;
}

/** Parse CSV content (handles quoted fields; newlines inside quotes not supported across line array). */
function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  const lines = content.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    let line = lines[i];
    while ((line.match(/"/g) || []).length % 2 !== 0 && i + 1 < lines.length) {
      line += "\n" + lines[++i];
    }
    if (line.trim()) rows.push(parseCSVRow(line));
    i++;
  }
  return rows;
}

/** Load BulkItem[] from CSV. Columns: url, module, id, project?, stage?, type?, parts?, dom_file?, steps_file?, selectors_file?. Paths resolved relative to inputDir. */
function loadBulkFromCSV(csvPath: string, inputDir: string): BulkItem[] {
  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(raw);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => (h || "").trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const iUrl = idx("url");
  const iModule = idx("module");
  const iId = idx("id");
  if (iUrl < 0 || iModule < 0 || iId < 0) {
    die(`CSV must have columns: url, module, id. Found: ${header.join(", ")}`);
  }
  const iProject = idx("project");
  const iStage = idx("stage");
  const iType = idx("type");
  const iParts = idx("parts");
  const iDomFile = idx("dom_file");
  const iStepsFile = idx("steps_file");
  const iSelectorsFile = idx("selectors_file");
  const items: BulkItem[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const url = (row[iUrl] || "").trim();
    const moduleName = (row[iModule] || "").trim();
    const id = (row[iId] || "").trim();
    if (!url || !moduleName || !id) continue;
    const item: BulkItem = { url, module: moduleName, id };
    if (iProject >= 0 && row[iProject]) item.project = row[iProject].trim();
    if (iStage >= 0 && row[iStage]) item.stage = row[iStage].trim();
    if (iType >= 0 && row[iType]) {
      const t = row[iType].trim().toLowerCase();
      if (t === "executable" || t === "informational") item.type = t as FlowKind;
    }
    if (iParts >= 0 && row[iParts]) {
      const partsVal = row[iParts].trim();
      const num = parseInt(partsVal, 10);
      if (!Number.isNaN(num) && num >= 1) item.parts = num;
      else {
        const list = partsVal.split(",").map((s) => s.trim()).filter(Boolean);
        // Normalize "Part 1" -> "part-1", "Part 2" -> "part-2"
        item.parts = list.map((s) => {
          const m = s.match(/^part\s*(\d+)$/i);
          return m ? `part-${m[1]}` : s.replace(/\s+/g, "-").toLowerCase();
        });
      }
    }
    if (iDomFile >= 0 && row[iDomFile]) {
      const domVal = row[iDomFile].trim();
      // Inline HTML: cell contains < and > (e.g. "<div ...>" or "Label- <div ...>")
      if (/<[a-zA-Z][\s\S]*>/.test(domVal)) {
        const htmlStart = domVal.indexOf("<");
        item.dom = htmlStart >= 0 ? domVal.slice(htmlStart) : domVal;
      } else {
        // Support one or multiple file paths in a single cell:
        // - newline-separated (common from Excel multiline cells)
        // - comma/semicolon-separated
        const parts = domVal
          .split(/[\n;,]+/)
          .map((s) => s.trim())
          .filter(Boolean);
        const htmlParts: string[] = [];
        for (const part of parts) {
          const domPath = path.resolve(inputDir, part);
          if (fs.existsSync(domPath)) htmlParts.push(fs.readFileSync(domPath, "utf-8"));
        }
        if (htmlParts.length > 0) item.dom = htmlParts.join("\n");
      }
    }
    if (iStepsFile >= 0 && row[iStepsFile]) {
      const stepsPath = path.resolve(inputDir, row[iStepsFile].trim());
      if (fs.existsSync(stepsPath)) {
        const stepsJson = JSON.parse(fs.readFileSync(stepsPath, "utf-8"));
        if (Array.isArray(stepsJson)) item.steps = stepsJson as BulkItem["steps"];
      }
    }
    if (iSelectorsFile >= 0 && row[iSelectorsFile]) {
      const selPath = path.resolve(inputDir, row[iSelectorsFile].trim());
      if (fs.existsSync(selPath)) {
        const selJson = JSON.parse(fs.readFileSync(selPath, "utf-8"));
        if (selJson && (selJson.click || selJson.input)) item.selectors = selJson;
      }
    }
    items.push(item);
  }
  return items;
}

function inferProject(url: string): string {
  const u = (url || "").toLowerCase();
  if (u.includes("launch")) return "Launch";
  if (u.includes("personalize") || u.includes("audience") || u.includes("experience")) return "Personalize";
  if (
    u.includes("content-types") ||
    u.includes("entries") ||
    u.includes("assets") ||
    u.includes("content-models") ||
    u.includes("content-modeling") ||
    u.includes("/cms") ||
    u.includes("contentstack.com/docs")
  ) {
    return "CMS";
  }
  return "CMS";
}

function normalizeProject(p: string): string {
  const up = (p || "").trim();
  if (!up) return up;
  if (up.toLowerCase() === "cms") return "CMS";
  if (up.toLowerCase() === "launch") return "Launch";
  if (up.toLowerCase() === "personalize") return "Personalize";
  return up;
}

function inferStage(item: Pick<BulkItem, "id" | "url" | "stage">): string {
  const explicit = (item.stage || "").trim();
  if (explicit) return explicit;
  const id = (item.id || "").toLowerCase();
  const url = (item.url || "").toLowerCase();
  if (id.startsWith("delete-")) return "delete";
  if (url.includes("/delete-") || url.includes("/delete/") || url.includes("delete-a-")) return "delete";
  return "main";
}

/** Classify URL as executable (in-app UI) vs informational (docs/read-only). */
function classifyUrl(url: string): FlowKind {
  const u = (url || "").toLowerCase();
  if (u.includes("app.contentstack.com")) return "executable";
  // Docs URLs that describe in-app steps (content type builder, field properties, etc.) are executable
  if (u.includes("/create-content-types/group")) return "executable";
  if (u.includes("/create-content-types/minimum-and-maximum-limit")) return "executable";
  if (u.includes("/edit-a-content-type") || u.includes("/create-a-content-type")) return "executable";
  return "informational";
}

/** Auto-detect executable: if user provided dom_file or steps_file, treat as executable (in-app steps). */
function inferKind(it: BulkItem, url: string): FlowKind {
  if (it.type === "executable" || it.type === "informational") return it.type;
  if (it.dom || (Array.isArray(it.steps) && it.steps.length > 0)) return "executable";
  return classifyUrl(url);
}

/** Expand parts (e.g. ["part-1","part-2"] or 2) into list of part suffixes. */
function normalizeParts(parts: string[] | number | undefined): string[] | undefined {
  if (parts === undefined || parts === null) return undefined;
  if (typeof parts === "number") {
    if (parts < 1) return undefined;
    return Array.from({ length: parts }, (_, i) => `part-${i + 1}`);
  }
  if (Array.isArray(parts) && parts.length > 0) return parts.map(String).filter(Boolean);
  return undefined;
}

/** Expand one BulkItem into one or more (when parts is set). */
function expandItem(item: BulkItem): BulkItem[] {
  const partSuffixes = normalizeParts(item.parts);
  if (!partSuffixes || partSuffixes.length === 0) return [item];
  const { parts: _p, ...rest } = item;
  return partSuffixes.map((suffix) => ({
    ...rest,
    id: `${rest.id}-${suffix}`,
  }));
}

/** When --analyze-docs: fetch doc URL, detect steps/parts, return executable item(s) or original. */
async function analyzeAndExpandDoc(item: BulkItem): Promise<BulkItem[]> {
  const url = (item.url || "").trim();
  if (!url || !url.includes("contentstack.com/docs")) return [item];
  if (item.type === "executable" || item.dom || (Array.isArray(item.steps) && item.steps.length > 0)) return [item];

  const result = await analyzeDocUrl(url);
  if (result.error) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ Doc analysis failed for ${url}: ${result.error}`);
    return [item];
  }
  if (!result.hasSteps || result.parts.length === 0) return [item];

  const baseId = (item.id || "").trim();
  return result.parts.map((part) => {
    const partId = part.id === "main" ? baseId : `${baseId}-${part.id}`;
    const steps = docStepsToFlowSteps(part.steps);
    const { parts: _parts, ...rest } = item;
    return {
      ...rest,
      id: partId,
      type: "executable" as FlowKind,
      steps: steps.length > 0 ? steps : undefined,
    };
  });
}

/**
 * Parse HTML snippet and extract selectors from [data-test-id], [name], and common roles.
 * Returns { click: Record<label, selector>, input: Record<label, selector> }.
 */
function extractSelectorsFromDom(html: string): { click: Record<string, string>; input: Record<string, string> } {
  const click: Record<string, string> = {};
  const input: Record<string, string> = {};
  if (!html || typeof html !== "string") return { click, input };

  try {
    const $ = cheerio.load(html, { xmlMode: false });
    // Elements with data-test-id (buttons, links, icons)
    $("[data-test-id]").each((_, el) => {
      const testId = $(el).attr("data-test-id");
      if (!testId) return;
      const sel = `[data-test-id="${testId}"]`;
      const tag = (el.tagName || "").toLowerCase();
      const name = $(el).attr("name");
      const role = $(el).attr("role");
      const label = name || testId.replace(/^cs-/, "").replace(/-/g, " ");
      if (tag === "input" || tag === "textarea" || role === "textbox") {
        if (!input[label]) input[label] = sel;
      } else {
        if (!click[label]) click[label] = sel;
      }
    });
    // Inputs/textarea by name
    $("input[name], textarea[name]").each((_, el) => {
      const name = $(el).attr("name");
      if (!name) return;
      const testId = $(el).attr("data-test-id");
      const sel = testId ? `[data-test-id="${testId}"] input, [data-test-id="${testId}"] textarea` : `input[name="${name}"], textarea[name="${name}"]`;
      if (!input[name]) input[name] = sel;
    });
    // SVG icons by name (e.g. PurpleAdd)
    $("svg[name]").each((_, el) => {
      const name = $(el).attr("name");
      if (!name) return;
      const parent = $(el).closest("[data-test-id]");
      const testId = parent.length ? parent.attr("data-test-id") : null;
      const sel = testId ? `[data-test-id="${testId}"] svg[name="${name}"]` : `svg[name="${name}"]`;
      const label = `${name} (icon)`;
      if (!click[label]) click[label] = sel;
    });
  } catch {
    // ignore parse errors
  }
  return { click, input };
}

function formatSelectorsFile(click: Record<string, string>, input: Record<string, string>, sourceUrl: string, id: string): string {
  const lines: string[] = [
    `/**`,
    ` * Flow: ${id}`,
    ` * Source: ${sourceUrl}`,
    ` * Generated/updated by bulkIngestFromUrls. Prefer data-test-id selectors.`,
    ` */`,
    ``,
    `export const CLICK_SELECTORS: Record<string, string> = {`,
  ];
  for (const [key, val] of Object.entries(click)) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(val)},`);
  }
  lines.push(`};`, ``, `export const INPUT_SELECTORS: Record<string, string> = {`);
  for (const [key, val] of Object.entries(input)) {
    lines.push(`  ${JSON.stringify(key)}: ${JSON.stringify(val)},`);
  }
  lines.push(`};`, ``);
  return lines.join("\n");
}

async function main() {
  const args = parseArgs(process.argv);
  const input = args.input;
  if (!input || typeof input !== "string") {
    die("Usage: npx ts-node scripts/bulkIngestFromUrls.ts --input <file.json|file.csv> [--analyze-docs]");
  }

  const inputPath = path.resolve(process.cwd(), input);
  if (!fs.existsSync(inputPath)) die(`Input file not found: ${inputPath}`);

  const inputDir = path.dirname(inputPath);
  const ext = path.extname(inputPath).toLowerCase();
  let items: BulkItem[];

  if (ext === ".csv") {
    items = loadBulkFromCSV(inputPath, inputDir);
  } else if (ext === ".json") {
    const raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
    if (!Array.isArray(raw)) die("JSON input must be an array of { url, module, id, ... } objects.");
    items = raw as BulkItem[];
  } else {
    die("Input must be a .json or .csv file.");
  }

  // Optional: analyze doc URLs and auto-detect executable + parts + steps
  const analyzeDocs = !!args["analyze-docs"];
  if (analyzeDocs && items.length > 0) {
    // eslint-disable-next-line no-console
    console.log("🔍 Analyzing document URLs for steps and parts...");
    const analyzed: BulkItem[] = [];
    for (const it of items) {
      const expanded = await analyzeAndExpandDoc(it);
      analyzed.push(...expanded);
      if (expanded.length > 1) {
        // eslint-disable-next-line no-console
        console.log(`   ${it.url} -> ${expanded.length} part(s): ${expanded.map((e) => e.id).join(", ")}`);
      }
    }
    items = analyzed;
  }

  // Expand any item with "parts" into multiple items (e.g. one URL -> boolean-part-1, boolean-part-2)
  let expanded = items.flatMap(expandItem);

  // For executable items with docs URL but no steps: fetch doc and extract steps (by URL, then by part)
  const docStepsCache = new Map<string, Awaited<ReturnType<typeof analyzeDocUrl>>>();
  const executableDocsWithoutSteps = expanded.filter(
    (it) =>
      inferKind(it, (it.url || "").trim()) === "executable" &&
      (it.url || "").includes("contentstack.com/docs") &&
      (!Array.isArray(it.steps) || it.steps.length === 0)
  );
  const urlsToAnalyze = [...new Set(executableDocsWithoutSteps.map((it) => (it.url || "").trim()).filter(Boolean))];
  for (const url of urlsToAnalyze) {
    try {
      const result = await analyzeDocUrl(url);
      if (!result.error && result.parts.length > 0) docStepsCache.set(url, result);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Doc step analysis failed for ${url}:`, e instanceof Error ? e.message : String(e));
    }
  }
  // Assign steps from cache to expanded items by matching part id or part index (part-1 -> first section)
  for (const it of expanded) {
    const url = (it.url || "").trim();
    if (!url || !docStepsCache.has(url)) continue;
    if (Array.isArray(it.steps) && it.steps.length > 0) continue;
    const result = docStepsCache.get(url)!;
    const partNumMatch = it.id.match(/-part-(\d+)$/);
    const partIndex1Based = partNumMatch ? parseInt(partNumMatch[1], 10) : null;
    const part =
      partIndex1Based != null && partIndex1Based >= 1 && result.parts[partIndex1Based - 1]
        ? result.parts[partIndex1Based - 1]
        : result.parts.find((p) => p.id === (partNumMatch ? `part-${partNumMatch[1]}` : "main")) ?? result.parts[0];
    if (part && part.steps.length > 0) {
      it.steps = docStepsToFlowSteps(part.steps) as BulkItem["steps"];
    }
  }

  // Deduplicate by (url, id): same URL in multiple CSV rows (e.g. part-1 and part-2 rows) should produce only one flow per part
  const seenKey = new Set<string>();
  expanded = expanded.filter((it) => {
    const url = (it.url || "").trim();
    const id = (it.id || "").trim();
    const key = `${url}\t${id}`;
    if (seenKey.has(key)) return false;
    seenKey.add(key);
    return true;
  });

  const cwd = process.cwd();
  const projectsDir = path.join(cwd, "projects");
  const legacyFlowsRoot = path.join(cwd, "flows"); // for docs.json (informational URLs)
  const docsUrlsCsvPath = path.join(cwd, "data", "docs-urls.csv"); // used by docs-audit.spec.ts
  let countInformational = 0;
  let countExecutable = 0;
  const bulkUrls = new Set<string>();
  const docRowsToAdd: DocUrlRow[] = [];

  for (const it of expanded) {
    const url = (it.url || "").trim();
    const moduleName = (it.module || "").trim();
    const id = (it.id || "").trim();
    if (!url || !moduleName || !id) {
      // eslint-disable-next-line no-console
      console.warn(`Skipping invalid item (missing url/module/id): ${JSON.stringify(it)}`);
      continue;
    }
    bulkUrls.add(url);

    const project = normalizeProject(it.project || inferProject(url));
    if (url.includes("contentstack.com/docs")) {
      docRowsToAdd.push({ project, url: normalizeCanonicalDocUrl(url) });
    }
    const kind: FlowKind = inferKind(it, url);

    if (kind === "informational") {
      // Add to flows/<Project>/docs.json so docs.spec.ts can run doc-only checks (HTTP, title, etc.)
      const docsDir = path.join(legacyFlowsRoot, project);
      ensureDir(docsDir);
      const docsPath = path.join(docsDir, "docs.json");
      let docs: { project: string; type: "doc_only"; urls: string[] } = { project, type: "doc_only", urls: [] };
      if (fs.existsSync(docsPath)) {
        docs = JSON.parse(fs.readFileSync(docsPath, "utf-8"));
      }
      if (!docs.urls.includes(url)) docs.urls.push(url);
      docs.urls = [...new Set(docs.urls)];
      fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2) + "\n", "utf-8");
      countInformational++;
      // eslint-disable-next-line no-console
      console.log(`📄 [informational] ${url} -> added to flows/${project}/docs.json`);
      continue;
    }

    countExecutable++;
    const stage = inferStage({ id, url, stage: it.stage });
    const stackModule = isStackModule(moduleName);

    const moduleDir = path.join(projectsDir, project, moduleName);
    const flowsDir = path.join(moduleDir, "flows");
    const selDir = path.join(moduleDir, "selectors");
    ensureDir(flowsDir);
    ensureDir(selDir);

    // Flow file: create or update
    const flowPath = path.join(flowsDir, `${id}.flow.json`);
    let flow: {
      id: string;
      project: string;
      module: string;
      stage: string;
      source: string;
      type: string;
      use: string[];
      steps: Array<Record<string, unknown>>;
    };

    if (fs.existsSync(flowPath)) {
      flow = JSON.parse(fs.readFileSync(flowPath, "utf-8"));
      flow.source = url;
      flow.stage = stage;
      if (Array.isArray(it.steps) && it.steps.length > 0) {
        flow.steps = it.steps as Array<Record<string, unknown>>;
      }
    } else {
      flow = {
        id,
        project,
        module: moduleName,
        stage,
        source: url,
        type: "executable",
        use: stackModule ? ["login"] : ["login", "selectStack"],
        steps: Array.isArray(it.steps) && it.steps.length > 0 ? (it.steps as Array<Record<string, unknown>>) : [],
      };
    }

    // Stack module flows must run from stacks page and must not auto-open any specific stack.
    if (stackModule) {
      flow.use = ["login"];
      const first = Array.isArray(flow.steps) && flow.steps.length > 0 ? flow.steps[0] : null;
      const isAlreadyStacksNavigate =
        !!first &&
        (first as any).action === "navigate" &&
        (first as any).target === STACKS_PAGE_URL;
      if (!isAlreadyStacksNavigate) {
        flow.steps = [{ action: "navigate", target: STACKS_PAGE_URL }, ...(flow.steps || [])];
      }
    }

    fs.writeFileSync(flowPath, JSON.stringify(flow, null, 2) + "\n", "utf-8");

    // Selectors file: merge from item.selectors and optionally from parsed item.dom
    let click: Record<string, string> = {};
    let input: Record<string, string> = {};
    if (it.dom) {
      const fromDom = extractSelectorsFromDom(it.dom);
      click = { ...click, ...fromDom.click };
      input = { ...input, ...fromDom.input };
    }
    if (it.selectors) {
      click = { ...click, ...(it.selectors.click || {}) };
      input = { ...input, ...(it.selectors.input || {}) };
    }

    const selectorsPath = path.join(selDir, `${id}.selectors.ts`);
    if (Object.keys(click).length > 0 || Object.keys(input).length > 0) {
      fs.writeFileSync(selectorsPath, formatSelectorsFile(click, input, url, id), "utf-8");
    } else if (!fs.existsSync(selectorsPath)) {
      const stub = `/**\n * Flow: ${id}\n * Source: ${url}\n * Add CLICK_SELECTORS and INPUT_SELECTORS as needed.\n */\n\nexport const CLICK_SELECTORS: Record<string, string> = {};\n\nexport const INPUT_SELECTORS: Record<string, string> = {};\n`;
      fs.writeFileSync(selectorsPath, stub, "utf-8");
    }

    // eslint-disable-next-line no-console
    console.log(`✅ [executable] ${project}/${moduleName}/${id} -> flow + selectors (source: ${url})`);
  }

  if (docRowsToAdd.length > 0) {
    upsertDocsUrlsCsv(docsUrlsCsvPath, docRowsToAdd);
    // eslint-disable-next-line no-console
    console.log(
      `\nMerged ${docRowsToAdd.length} docs URL row(s) into data/docs-urls.csv (project,url).`
    );
  }

  // eslint-disable-next-line no-console
  console.log(`\n✅ Bulk ingest done: ${countExecutable} executable (flows + selectors), ${countInformational} informational (docs.json).`);
  if (bulkUrls.size > 0) {
    // eslint-disable-next-line no-console
    console.log("   Run execution: npm run test:flows (flows) | npm run test:docs (doc URLs from flows/*/docs.json) | npm run test:docs-audit (docs-urls.csv audit, headless) | npm run test:docs-audit:headed (audit with browser).");
  }
}

/** Exported for runBulkFromCsv: get expanded items from a bulk CSV (url, id, kind). When options.analyzeDocs is true, fetches doc URLs and auto-detects executable + parts. */
export async function getExpandedItemsFromCsv(
  csvPath: string,
  options?: { analyzeDocs?: boolean }
): Promise<Array<{ url: string; id: string; kind: FlowKind; project: string }>> {
  const inputDir = path.dirname(path.resolve(process.cwd(), csvPath));
  const resolvedPath = path.resolve(process.cwd(), csvPath);
  let items = loadBulkFromCSV(resolvedPath, inputDir);
  if (options?.analyzeDocs && items.length > 0) {
    const analyzed: BulkItem[] = [];
    for (const it of items) {
      const expanded = await analyzeAndExpandDoc(it);
      analyzed.push(...expanded);
    }
    items = analyzed;
  }
  const expanded = items.flatMap(expandItem);
  return expanded
    .map((it) => ({
      url: (it.url || "").trim(),
      id: (it.id || "").trim(),
      kind: inferKind(it, it.url || ""),
      project: normalizeProject(it.project || inferProject((it.url || "").trim())),
    }))
    .filter((x) => x.url && x.id);
}

if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

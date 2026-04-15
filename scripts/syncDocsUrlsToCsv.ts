/**
 * Sync all contentstack.com/docs URLs into data/docs-urls.csv from:
 * - data/docs-urls.csv (existing rows, project,url or legacy)
 * - flows/<Project>/docs.json url arrays (project = folder name)
 * - projects/<Project>/.../flows/*.flow.json "source" fields
 *
 * Output format: CSV with header project,url (one row per project+URL).
 *
 * Usage:
 *   npx ts-node scripts/syncDocsUrlsToCsv.ts
 *   npm run sync:docs-urls
 */

import fs from "fs";
import path from "path";
import {
  DocUrlRow,
  mergeDocUrlRows,
  normalizeCanonicalDocUrl,
  parseDocsUrlsCsvFile,
  writeDocsUrlsCsv,
  DOCS_HOST_FRAGMENT,
} from "../core/docsUrlsCsv";

const DOCS_CSV = path.resolve(process.cwd(), "data", "docs-urls.csv");
const FLOWS_DIR = path.resolve(process.cwd(), "flows");
const PROJECTS_DIR = path.resolve(process.cwd(), "projects");

function collectFromDocsJson(dir: string): DocUrlRow[] {
  const out: DocUrlRow[] = [];
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const project = e.name;
    const docsPath = path.join(dir, project, "docs.json");
    if (!fs.existsSync(docsPath)) continue;
    try {
      const j = JSON.parse(fs.readFileSync(docsPath, "utf-8")) as { urls?: string[] };
      for (const u of j.urls || []) {
        const s = String(u || "").trim();
        if (s.includes(DOCS_HOST_FRAGMENT)) {
          out.push({ project, url: normalizeCanonicalDocUrl(s) });
        }
      }
    } catch {
      // skip invalid json
    }
  }
  return out;
}

function collectFromFlowSources(dir: string): DocUrlRow[] {
  const out: DocUrlRow[] = [];
  if (!fs.existsSync(dir)) return out;

  function walk(d: string) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".flow.json")) {
        const rel = path.relative(dir, full);
        const top = rel.split(path.sep)[0];
        if (!top) continue;
        const project = top;
        try {
          const j = JSON.parse(fs.readFileSync(full, "utf-8")) as { source?: string };
          const src = j.source;
          if (src && String(src).includes(DOCS_HOST_FRAGMENT)) {
            out.push({ project, url: normalizeCanonicalDocUrl(String(src).trim()) });
          }
        } catch {
          // skip
        }
      }
    }
  }
  walk(dir);
  return out;
}

function main() {
  const fromCsv = parseDocsUrlsCsvFile(DOCS_CSV);
  const fromDocsJson = collectFromDocsJson(FLOWS_DIR);
  const fromFlows = collectFromFlowSources(PROJECTS_DIR);

  const merged = mergeDocUrlRows(mergeDocUrlRows(fromCsv, fromDocsJson), fromFlows);

  fs.mkdirSync(path.dirname(DOCS_CSV), { recursive: true });
  writeDocsUrlsCsv(DOCS_CSV, merged);

  // eslint-disable-next-line no-console
  console.log(`Synced ${merged.length} row(s) to ${DOCS_CSV}`);
  // eslint-disable-next-line no-console
  console.log(
    `   (from CSV: ${fromCsv.length}, docs.json: ${fromDocsJson.length}, flow sources: ${fromFlows.length})`
  );
}

main();

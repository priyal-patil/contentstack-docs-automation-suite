/**
 * Sync all contentstack.com/docs URLs into data/docs-urls.csv from:
 * - data/docs-urls.csv (existing)
 * - flows/<project>/docs.json url arrays
 * - projects/.../flows/*.flow.json "source" fields
 *
 * Run after adding new doc URLs to flows or docs.json so docs-audit (links, table, logo)
 * runs against the full set. Does not remove URLs already only in docs-urls.csv.
 *
 * Usage:
 *   npx ts-node scripts/syncDocsUrlsToCsv.ts
 *   npm run sync:docs-urls
 */

import fs from "fs";
import path from "path";

const DOCS_CSV = path.resolve(process.cwd(), "data", "docs-urls.csv");
const FLOWS_DIR = path.resolve(process.cwd(), "flows");
const PROJECTS_DIR = path.resolve(process.cwd(), "projects");

const DOCS_HOST = "contentstack.com/docs";

function collectFromCsv(): Set<string> {
  const out = new Set<string>();
  if (!fs.existsSync(DOCS_CSV)) return out;
  const lines = fs.readFileSync(DOCS_CSV, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const u = line.trim();
    if (!u || u.startsWith("#")) continue;
    if (u.includes(DOCS_HOST)) out.add(u);
  }
  return out;
}

function collectFromDocsJson(dir: string): Set<string> {
  const out = new Set<string>();
  if (!fs.existsSync(dir)) return out;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      const docsPath = path.join(dir, e.name, "docs.json");
      if (fs.existsSync(docsPath)) {
        try {
          const j = JSON.parse(fs.readFileSync(docsPath, "utf-8"));
          const urls = (j.urls || []) as string[];
          urls.forEach((u) => {
            if (u && String(u).includes(DOCS_HOST)) out.add(String(u).trim());
          });
        } catch {
          // skip invalid json
        }
      }
    }
  }
  return out;
}

function collectFromFlowSources(dir: string): Set<string> {
  const out = new Set<string>();
  if (!fs.existsSync(dir)) return out;

  function walk(d: string) {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".flow.json")) {
        try {
          const j = JSON.parse(fs.readFileSync(full, "utf-8"));
          const src = j.source;
          if (src && String(src).includes(DOCS_HOST)) out.add(String(src).trim());
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
  const fromCsv = collectFromCsv();
  const fromDocsJson = collectFromDocsJson(FLOWS_DIR);
  const fromFlows = collectFromFlowSources(PROJECTS_DIR);

  const all = new Set<string>([...fromCsv, ...fromDocsJson, ...fromFlows]);
  const sorted = [...all].sort();

  const header = "# Docs to audit (one per line). Synced from docs-urls.csv, flows/*/docs.json, and flow source URLs.\n";
  fs.mkdirSync(path.dirname(DOCS_CSV), { recursive: true });
  fs.writeFileSync(DOCS_CSV, header + sorted.join("\n") + "\n", "utf-8");

  // eslint-disable-next-line no-console
  console.log(`✅ Synced ${sorted.length} URL(s) to ${DOCS_CSV}`);
  // eslint-disable-next-line no-console
  console.log(`   (from CSV: ${fromCsv.size}, docs.json: ${fromDocsJson.size}, flow sources: ${fromFlows.size})`);
}

main();

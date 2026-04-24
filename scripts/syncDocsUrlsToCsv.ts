/**
 * Sync all contentstack.com/docs URLs into data/docs-urls.csv from:
 * - flows/<Project>/docs.json url arrays (project = folder name)
 * - projects/<Project>/.../flows/*.flow.json "source" fields
 * - data/docs-urls.csv rows with optional third column `keep` (pinned manual URLs not in repo lists)
 *
 * Rows that are not backed by any current flow `source` or docs.json URL are **removed**, except
 * `project,url,keep` pins (see core/docsUrlsCsv.ts).
 *
 * Output format: CSV with header project,url (optional third field `keep`).
 *
 * Usage:
 *   npx ts-node scripts/syncDocsUrlsToCsv.ts
 *   npm run sync:docs-urls
 */

import fs from "fs";
import path from "path";
import {
  type DocUrlRow,
  mergeDocUrlRows,
  docRowsDedupeKey,
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

  const fromRepo = mergeDocUrlRows(fromDocsJson, fromFlows);
  const repoKeySet = new Set(fromRepo.map((r) => docRowsDedupeKey(r)));
  const pinned = fromCsv.filter((r) => r.keep === true);
  const merged = mergeDocUrlRows(fromRepo, pinned);

  const pruned = fromCsv.filter((r) => {
    const k = docRowsDedupeKey(r);
    return !r.keep && !repoKeySet.has(k);
  }).length;

  fs.mkdirSync(path.dirname(DOCS_CSV), { recursive: true });
  writeDocsUrlsCsv(DOCS_CSV, merged);

  // eslint-disable-next-line no-console
  console.log(`Synced ${merged.length} row(s) to ${DOCS_CSV}`);
  // eslint-disable-next-line no-console
  console.log(
    `   (repo: ${fromRepo.length} from docs.json + flow sources, pinned: ${pinned.length} from CSV, pruned stale CSV rows: ${pruned})`
  );
}

main();

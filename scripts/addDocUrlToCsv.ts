/**
 * Add one or more contentstack.com/docs URLs to data/docs-urls.csv (project,url) so they are
 * included in docs-audit (links, images, table, logo verification).
 *
 * Usage:
 *   npx ts-node scripts/addDocUrlToCsv.ts "https://www.contentstack.com/docs/..."
 *   npx ts-node scripts/addDocUrlToCsv.ts --project Launch --url "https://..."
 *   npx ts-node scripts/addDocUrlToCsv.ts --file data/my-urls.csv
 *   npm run add-doc-url -- "https://www.contentstack.com/docs/..."
 *
 * Options:
 *   --project <Name>   Project column (default CMS). Applies to bare URLs from --file and positional args.
 *   --no-keep          Do not add `,keep`; next `sync:docs-urls` may drop the URL if it is not in a flow/docs.json.
 *   --run-audit        After adding, run docs-audit for only these URLs (headless).
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import {
  parseDocsUrlsCsvFile,
  mergeDocUrlRows,
  writeDocsUrlsCsv,
  normalizeCanonicalDocUrl,
  isDocsHostUrl,
} from "../core/docsUrlsCsv";

const DOCS_CSV = path.resolve(process.cwd(), "data", "docs-urls.csv");

function isDocUrl(u: string): boolean {
  return isDocsHostUrl(u.trim());
}

function parseFileLine(line: string, defaultProject: string): { project: string; url: string } | null {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;
  const comma = trimmed.indexOf(",");
  if (comma > 0) {
    const maybeProject = trimmed.slice(0, comma).trim();
    const rest = trimmed.slice(comma + 1).trim();
    if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(maybeProject) && isDocUrl(rest)) {
      return { project: maybeProject, url: normalizeCanonicalDocUrl(rest) };
    }
  }
  if (isDocUrl(trimmed)) return { project: defaultProject, url: normalizeCanonicalDocUrl(trimmed) };
  return null;
}

function main() {
  const argv = process.argv.slice(2);
  const runAudit = argv.includes("--run-audit");
  const pinRows = !argv.includes("--no-keep");
  let defaultProject = "CMS";
  const projIdx = argv.indexOf("--project");
  if (projIdx >= 0 && argv[projIdx + 1] && !argv[projIdx + 1].startsWith("--")) {
    defaultProject = argv[projIdx + 1].trim();
  }

  const fileIdx = argv.indexOf("--file");
  const urlIdxes = argv
    .map((a, i) => (a === "--url" ? i + 1 : -1))
    .filter((i) => i >= 0 && i < argv.length);

  const toAdd: Array<{ project: string; url: string }> = [];

  if (fileIdx >= 0 && argv[fileIdx + 1]) {
    const filePath = path.resolve(process.cwd(), argv[fileIdx + 1]);
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    for (const line of content.split(/\r?\n/)) {
      const row = parseFileLine(line, defaultProject);
      if (row) toAdd.push(row);
    }
  }

  for (const i of urlIdxes) {
    const u = argv[i];
    if (u && isDocUrl(u)) toAdd.push({ project: defaultProject, url: normalizeCanonicalDocUrl(u) });
  }

  if (toAdd.length === 0) {
    for (const a of argv) {
      if (a.startsWith("--")) continue;
      if (isDocUrl(a)) toAdd.push({ project: defaultProject, url: normalizeCanonicalDocUrl(a) });
    }
  }

  if (toAdd.length === 0) {
    console.error(
      "Usage: addDocUrlToCsv.ts [--project CMS] [--no-keep] <url> [url...] | --url <url> | --file <path.csv> [--run-audit]"
    );
    console.error("  URLs must contain contentstack.com/docs");
    process.exit(1);
  }

  const toMerge = pinRows ? toAdd.map((r) => ({ ...r, keep: true as const })) : toAdd;
  const merged = mergeDocUrlRows(parseDocsUrlsCsvFile(DOCS_CSV), toMerge);
  writeDocsUrlsCsv(DOCS_CSV, merged);

  console.log(`Updated ${DOCS_CSV}: merged ${toAdd.length} input row(s); file now has ${merged.length} row(s).`);

  if (runAudit && toAdd.length > 0) {
    const tempCsv = path.resolve(process.cwd(), "data", "docs-urls-single-run.csv");
    const uniqueRun = mergeDocUrlRows([], toAdd);
    writeDocsUrlsCsv(tempCsv, uniqueRun);
    console.log("Running docs-audit for", uniqueRun.length, "row(s)...");
    const auditEnv: NodeJS.ProcessEnv = { ...process.env, DOCS_URLS_CSV: "data/docs-urls-single-run.csv" };
    delete auditEnv.DOCS_AUDIT_PROJECT;
    delete auditEnv.DOCS_AUDIT_PROJECTS;
    spawnSync("npx", ["playwright", "test", "tests/docs-audit.spec.ts", "--workers=1"], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
      env: auditEnv,
    });
  }
}

main();

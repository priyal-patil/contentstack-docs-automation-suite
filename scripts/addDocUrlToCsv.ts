/**
 * Add one or more contentstack.com/docs URLs to data/docs-urls.csv so they are
 * included in docs-audit (links, table, logo verification). Runs automatically
 * when you pass URLs for testing in bulk (runBulkFromCsv) or here for single URLs.
 *
 * Usage:
 *   npx ts-node scripts/addDocUrlToCsv.ts "https://www.contentstack.com/docs/developers/create-content-types/boolean"
 *   npx ts-node scripts/addDocUrlToCsv.ts --url "https://..." --url "https://..."
 *   npx ts-node scripts/addDocUrlToCsv.ts --file data/my-urls.csv
 *   npm run add-doc-url -- "https://www.contentstack.com/docs/..."
 *   npm run add-doc-url -- --file data/urls.csv
 *
 * Options:
 *   --run-audit   After adding, run docs-audit for only these URLs (headless).
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

const DOCS_CSV = path.resolve(process.cwd(), "data", "docs-urls.csv");
const DOCS_HOST = "contentstack.com/docs";

function isDocUrl(u: string): boolean {
  const t = u.trim();
  return t.length > 0 && t.includes(DOCS_HOST);
}

function readExisting(): { commentLines: string[]; urls: Set<string> } {
  const commentLines: string[] = [];
  const urls = new Set<string>();
  if (!fs.existsSync(DOCS_CSV)) return { commentLines, urls };
  const lines = fs.readFileSync(DOCS_CSV, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) {
      commentLines.push(line);
    } else if (isDocUrl(trimmed)) {
      urls.add(trimmed);
    }
  }
  return { commentLines, urls };
}

function writeCsv(urls: Set<string>, commentLines: string[]) {
  const header = commentLines.length ? commentLines.join("\n") + "\n" : "# Docs to audit (one per line)\n";
  const sorted = [...urls].sort();
  fs.mkdirSync(path.dirname(DOCS_CSV), { recursive: true });
  fs.writeFileSync(DOCS_CSV, header + sorted.join("\n") + "\n", "utf-8");
}

function main() {
  const argv = process.argv.slice(2);
  const runAudit = argv.includes("--run-audit");
  const fileIdx = argv.indexOf("--file");
  const urlIdxes = argv
    .map((a, i) => (a === "--url" ? i + 1 : -1))
    .filter((i) => i >= 0 && i < argv.length);

  const toAdd: string[] = [];

  if (fileIdx >= 0 && argv[fileIdx + 1]) {
    const filePath = path.resolve(process.cwd(), argv[fileIdx + 1]);
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      process.exit(1);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const u = line.startsWith("#") ? "" : line;
      if (u && isDocUrl(u)) toAdd.push(u);
    }
  }

  for (const i of urlIdxes) {
    const u = argv[i];
    if (u && isDocUrl(u)) toAdd.push(u);
  }

  // Positional URLs (no --url or --file)
  if (toAdd.length === 0) {
    for (const a of argv) {
      if (a.startsWith("--")) continue;
      if (isDocUrl(a)) toAdd.push(a);
    }
  }

  if (toAdd.length === 0) {
    console.error("Usage: addDocUrlToCsv.ts <url> [url...] | --url <url> [--url <url>] | --file <path.csv> [--run-audit]");
    console.error("  URLs must contain contentstack.com/docs");
    process.exit(1);
  }

  const { commentLines, urls } = readExisting();
  const before = urls.size;
  toAdd.forEach((u) => urls.add(u));
  const added = urls.size - before;
  writeCsv(urls, commentLines);

  console.log(`✅ Added ${added} URL(s) to ${DOCS_CSV} (total: ${urls.size})`);

  if (runAudit && toAdd.length > 0) {
    const tempCsv = path.resolve(process.cwd(), "data", "docs-urls-single-run.csv");
    const uniqueRun = [...new Set(toAdd)].sort();
    fs.mkdirSync(path.dirname(tempCsv), { recursive: true });
    fs.writeFileSync(tempCsv, "# Single-run audit\n" + uniqueRun.join("\n") + "\n", "utf-8");
    console.log("🔍 Running docs-audit for", uniqueRun.length, "URL(s)...");
    spawnSync("npx", ["playwright", "test", "tests/docs-audit.spec.ts", "--workers=1"], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
      env: { ...process.env, DOCS_URLS_CSV: "data/docs-urls-single-run.csv" },
    });
  }
}

main();

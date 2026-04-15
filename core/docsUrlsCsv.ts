/**
 * Canonical parsing and writing for data/docs-urls.csv.
 * Format: header row `project,url` plus one row per doc URL (contentstack.com/docs).
 * Legacy files with one HTTPS URL per line are still read; those rows use DOCS_URL_LEGACY_PROJECT (default CMS).
 */

import fs from "fs";
import path from "path";

export const DOCS_HOST_FRAGMENT = "contentstack.com/docs";

export type DocUrlRow = { project: string; url: string };

export function normalizeCanonicalDocUrl(u: string): string {
  const raw = String(u || "").trim();
  if (!raw || !raw.includes("contentstack.com/docs")) return raw;
  try {
    const withProto = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(withProto);
    if (!/contentstack\.com$/i.test(url.hostname)) return raw;
    url.protocol = "https:";
    if (url.hostname === "contentstack.com") url.hostname = "www.contentstack.com";
    let p = url.pathname;
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    url.pathname = p;
    return url.toString();
  } catch {
    return raw;
  }
}

export function isDocsHostUrl(s: string): boolean {
  return String(s || "").includes(DOCS_HOST_FRAGMENT);
}

function legacyDefaultProject(): string {
  return (process.env.DOCS_URL_LEGACY_PROJECT || "CMS").trim() || "CMS";
}

/**
 * Parse CSV body: supports `project,url` rows and legacy bare doc URLs.
 */
export function parseDocsUrlsCsvContent(raw: string, legacyProject?: string): DocUrlRow[] {
  const leg = legacyProject ?? legacyDefaultProject();
  const rows: DocUrlRow[] = [];
  for (let line of raw.split(/\r?\n/)) {
    line = line.trim();
    if (!line || line.startsWith("#")) continue;
    if (/^project\s*,\s*url\s*$/i.test(line)) continue;

    const comma = line.indexOf(",");
    if (comma > 0) {
      const maybeProject = line.slice(0, comma).trim();
      const rest = line.slice(comma + 1).trim();
      if (/^[A-Za-z][A-Za-z0-9_-]*$/.test(maybeProject) && isDocsHostUrl(rest)) {
        rows.push({ project: maybeProject, url: normalizeCanonicalDocUrl(rest) });
        continue;
      }
    }
    if (isDocsHostUrl(line)) {
      rows.push({ project: leg, url: normalizeCanonicalDocUrl(line) });
    }
  }
  return rows;
}

export function parseDocsUrlsCsvFile(csvPath: string): DocUrlRow[] {
  if (!fs.existsSync(csvPath)) return [];
  return parseDocsUrlsCsvContent(fs.readFileSync(csvPath, "utf-8"));
}

export function docRowsDedupeKey(r: DocUrlRow): string {
  return `${r.project}\t${normalizeCanonicalDocUrl(r.url)}`;
}

export function mergeDocUrlRows(existing: DocUrlRow[], additions: DocUrlRow[]): DocUrlRow[] {
  const map = new Map<string, DocUrlRow>();
  for (const r of existing) {
    const row = { project: r.project, url: normalizeCanonicalDocUrl(r.url) };
    map.set(docRowsDedupeKey(row), row);
  }
  for (const r of additions) {
    const row = { project: r.project, url: normalizeCanonicalDocUrl(r.url) };
    map.set(docRowsDedupeKey(row), row);
  }
  return [...map.values()].sort((a, b) => a.project.localeCompare(b.project) || a.url.localeCompare(b.url));
}

export function formatDocsUrlsCsv(rows: DocUrlRow[]): string {
  const lines = [
    "# Docs audit URL list: project,url",
    "# Sync: npm run sync:docs-urls | Legacy bare URLs are read as project CMS (override with DOCS_URL_LEGACY_PROJECT).",
    "project,url",
    ...rows.map((r) => `${r.project},${r.url}`),
  ];
  return lines.join("\n") + "\n";
}

export function writeDocsUrlsCsv(csvPath: string, rows: DocUrlRow[]): void {
  fs.mkdirSync(path.dirname(csvPath), { recursive: true });
  fs.writeFileSync(csvPath, formatDocsUrlsCsv(rows), "utf-8");
}

export function upsertDocsUrlsCsv(csvPath: string, additions: DocUrlRow[]): void {
  const existing = parseDocsUrlsCsvFile(csvPath);
  writeDocsUrlsCsv(csvPath, mergeDocUrlRows(existing, additions));
}

/** Filter by DOCS_AUDIT_PROJECT (single) or DOCS_AUDIT_PROJECTS (comma-separated). Empty env = all rows. */
export function filterDocRowsByAuditEnv(rows: DocUrlRow[]): DocUrlRow[] {
  const multi = process.env.DOCS_AUDIT_PROJECTS?.trim();
  const single = process.env.DOCS_AUDIT_PROJECT?.trim();
  let names: string[] | null = null;
  if (multi) names = multi.split(",").map((s) => s.trim()).filter(Boolean);
  else if (single) names = [single];
  if (!names || names.length === 0) return rows;
  const set = new Set(names.map((n) => n.toLowerCase()));
  return rows.filter((r) => set.has(r.project.toLowerCase()));
}

/** Unique URLs in order (for audit tests when the same URL should not run twice in one process). */
export function uniqueUrlsFromRows(rows: DocUrlRow[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const u = r.url;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

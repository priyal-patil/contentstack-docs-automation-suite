import fs from "fs";
import path from "path";
import { writeDocsUrlsCsv, normalizeCanonicalDocUrl, type DocUrlRow } from "../core/docsUrlsCsv";

function walk(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (full.endsWith(".flow.json")) out.push(full);
  }
}

function main() {
  const root = process.cwd();
  const cmsProjectDir = path.join(root, "projects", "CMS");
  const cmsDocsJson = path.join(root, "flows", "CMS", "docs.json");
  const outPath =
    process.argv.includes("--out") && process.argv[process.argv.indexOf("--out") + 1]
      ? path.resolve(root, process.argv[process.argv.indexOf("--out") + 1])
      : path.join(root, "data", "cms-urls.csv");

  const urls = new Set<string>();

  const flowFiles: string[] = [];
  walk(cmsProjectDir, flowFiles);
  for (const f of flowFiles) {
    try {
      const raw = fs.readFileSync(f, "utf-8");
      const json = JSON.parse(raw) as { source?: string };
      const src = normalizeCanonicalDocUrl(json.source || "");
      if (src) urls.add(src);
    } catch {
      // ignore malformed flow files
    }
  }

  if (fs.existsSync(cmsDocsJson)) {
    try {
      const raw = fs.readFileSync(cmsDocsJson, "utf-8");
      const parsed = JSON.parse(raw) as { urls?: string[] };
      for (const u of parsed.urls || []) {
        const n = normalizeCanonicalDocUrl(u);
        if (n) urls.add(n);
      }
    } catch {
      // ignore malformed docs json
    }
  }

  const ordered = Array.from(urls).sort((a, b) => a.localeCompare(b));
  const rows: DocUrlRow[] = ordered.map((u) => ({ project: "CMS", url: u }));
  writeDocsUrlsCsv(outPath, rows);
  // eslint-disable-next-line no-console
  console.log(`Wrote CMS URL CSV: ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`URLs: ${ordered.length}`);
}

main();

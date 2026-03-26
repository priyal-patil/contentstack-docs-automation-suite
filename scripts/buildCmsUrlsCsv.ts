import fs from "fs";
import path from "path";

function walk(dir: string, out: string[]) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (full.endsWith(".flow.json")) out.push(full);
  }
}

/**
 * Single canonical form for Contentstack docs URLs so http/https, www, and trailing slashes
 * do not create duplicate rows in cms-urls.csv (same page, different strings).
 */
function normalizeUrl(u: string): string {
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
      const src = normalizeUrl(json.source || "");
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
        const n = normalizeUrl(u);
        if (n) urls.add(n);
      }
    } catch {
      // ignore malformed docs json
    }
  }

  const ordered = Array.from(urls).sort((a, b) => a.localeCompare(b));
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ordered.join("\n") + "\n", "utf-8");
  // eslint-disable-next-line no-console
  console.log(`✅ Wrote CMS URL CSV: ${outPath}`);
  // eslint-disable-next-line no-console
  console.log(`URLs: ${ordered.length}`);
}

main();


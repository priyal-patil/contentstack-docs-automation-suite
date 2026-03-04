import fs from "fs";
import path from "path";
import fse from "fs-extra";
import { test, expect } from "@playwright/test";

type DocsJson = {
  project: string;
  type: "doc_only";
  urls: string[];
};

type DocResult = {
  kind: "doc_only";
  project: string;
  url: string;
  status: "passed" | "failed";
  httpStatus?: number;
  title?: string;
  error?: string;
  checkedAt: string;
};

const results: DocResult[] = [];

function readAllDocsJson(flowsRoot: string): DocsJson[] {
  if (!fs.existsSync(flowsRoot)) return [];
  const projects = fs
    .readdirSync(flowsRoot)
    .map((p) => path.join(flowsRoot, p))
    .filter((p) => fs.statSync(p).isDirectory());

  const all: DocsJson[] = [];
  for (const projDir of projects) {
    const docsPath = path.join(projDir, "docs.json");
    if (!fs.existsSync(docsPath)) continue;
    const raw = fs.readFileSync(docsPath, "utf-8");
    const parsed = JSON.parse(raw);
    all.push({
      project: String(parsed?.project || path.basename(projDir)),
      type: "doc_only",
      urls: Array.isArray(parsed?.urls) ? parsed.urls.map(String) : [],
    });
  }
  return all;
}

function extractTitle(html: string): string | undefined {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const t = m?.[1]?.replace(/\s+/g, " ").trim();
  return t || undefined;
}

function hasObviousErrorBody(html: string): string | undefined {
  const s = html.toLowerCase();
  // Avoid false positives: many valid pages may contain "404" in unrelated contexts.
  // Only fail on strong signals.
  if (s.includes("page not found")) return "Body looks like a Page Not Found page.";
  if (/\b404\b/.test(s) && (s.includes("not found") || s.includes("error"))) return "Body looks like a 404/Not Found page.";
  // Access-denied pages usually have strong markers (title/body). Don't fail on generic "forbidden" mentions.
  if (s.includes("access denied")) return "Body looks like an Access Denied page.";
  if (s.includes("request blocked") || s.includes("you have been blocked")) return "Body looks like a request-blocked page.";
  // Note: some modern sites embed route metadata keys like "forbidden"/"unauthorized" in JSON;
  // do not treat those as an error signal.
  if (s.includes("cloudflare") && s.includes("attention required")) return "Body looks like a bot/Cloudflare block page.";
  return undefined;
}

test.afterAll(async () => {
  const reportDir = process.env.REPORT_DIR || "reports/latest";
  await fse.ensureDir(reportDir);
  const outFile = path.join(reportDir, "docs-results.json");
  await fse.writeJson(outFile, { generatedAt: new Date().toISOString(), results }, { spaces: 2 });
  // eslint-disable-next-line no-console
  console.log(`📝 Wrote doc-only results: ${outFile}`);
});

const flowsRoot = path.resolve(__dirname, "..", "flows");
const docsJsons = readAllDocsJson(flowsRoot);

for (const docList of docsJsons) {
  const project = docList.project;
  const urls = Array.from(new Set(docList.urls)).filter(Boolean);
  if (!urls.length) continue;

  test.describe(`Docs Project=${project}`, () => {
    for (const url of urls) {
      test(`doc_only: ${url}`, async ({ request }) => {
        const checkedAt = new Date().toISOString();
        try {
          const res = await request.get(url, {
            maxRedirects: 5,
            timeout: 30_000,
            headers: {
              // Some doc sites block "automation" user agents; use a common desktop UA.
              "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "accept-language": "en-US,en;q=0.9",
            },
          });
          const httpStatus = res.status();

          expect(httpStatus, `HTTP status for ${url}`).toBeGreaterThanOrEqual(200);
          expect(httpStatus, `HTTP status for ${url}`).toBeLessThan(400);

          const body = await res.text();
          const title = extractTitle(body);
          expect(title, `Missing <title> for ${url}`).toBeTruthy();

          const bodyErr = hasObviousErrorBody(body);
          expect(bodyErr || "", `Error markers found for ${url}`).toBe("");

          results.push({ kind: "doc_only", project, url, status: "passed", httpStatus, title, checkedAt });
        } catch (e: any) {
          results.push({
            kind: "doc_only",
            project,
            url,
            status: "failed",
            error: e?.message || String(e),
            checkedAt,
          });
          throw e;
        }
      });
    }
  });
}


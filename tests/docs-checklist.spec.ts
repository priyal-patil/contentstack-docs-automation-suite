/**
 * Checklist + Style Guide compliance audit.
 *
 * Runs the "Doc Testing Checklist" sheet and the mechanically-checkable rules of the
 * Contentstack Technical Documentation Style Guide against published doc pages.
 *
 * Warnings only — a finding never fails the run (DOCS-AUTOMATION-COMMON.md rule 5).
 * Only a page that cannot be loaded produces a FAIL row.
 *
 *   DOCS_CHECKLIST_PROJECT=Administration npx playwright test tests/docs-checklist.spec.ts --project=docs-checklist
 *   DOCS_CHECKLIST_URL=<single url>       npx playwright test tests/docs-checklist.spec.ts --project=docs-checklist
 */

import { test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parseDocsUrlsCsvFile } from "../core/docsUrlsCsv";
import { runChecklistForPage } from "../core/checklist/runChecklist";
import { EMPTY_COUNTS, type ChecklistDocResult } from "../core/checklist/types";

const REPORT_DIR = path.resolve(process.cwd(), process.env.REPORT_DIR || "reports/latest");
const PER_DOC_DIR = path.join(REPORT_DIR, "checklist-per-doc");

const csvPath = process.env.DOCS_URLS_CSV
  ? path.resolve(process.cwd(), process.env.DOCS_URLS_CSV)
  : path.resolve(__dirname, "../data/docs-urls.csv");

const projectFilter = (process.env.DOCS_CHECKLIST_PROJECT || process.env.DOCS_AUDIT_PROJECT || "").trim();
const singleUrl = process.env.DOCS_CHECKLIST_URL?.trim();
const limit = Number(process.env.DOCS_CHECKLIST_LIMIT || 0);

type Target = { project: string; url: string };

function resolveTargets(): Target[] {
  if (singleUrl) {
    // Comma-separated so an ad-hoc set of URLs can be audited without touching the CSV.
    const rows = fs.existsSync(csvPath) ? parseDocsUrlsCsvFile(csvPath) : [];
    return singleUrl
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean)
      .map((url) => {
        const match = rows.find((r) => r.url.replace(/\/$/, "") === url.replace(/\/$/, ""));
        return { project: match?.project || projectFilter || "Unknown", url };
      });
  }
  let rows = parseDocsUrlsCsvFile(csvPath);
  if (projectFilter) rows = rows.filter((r) => r.project.toLowerCase() === projectFilter.toLowerCase());
  const seen = new Set<string>();
  const targets: Target[] = [];
  for (const r of rows) {
    const key = r.url.replace(/\/$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    targets.push({ project: r.project, url: r.url });
  }
  return limit > 0 ? targets.slice(0, limit) : targets;
}

const targets = resolveTargets();

console.log("[Checklist] csv        =", csvPath);
console.log("[Checklist] project    =", projectFilter || "(all)");
console.log("[Checklist] target(s)  =", targets.length);

const safeName = (url: string) => Buffer.from(url).toString("base64").replace(/[/+=]/g, "_");

test.describe.parallel("Docs Checklist & Style Guide", () => {
  test.describe.configure({ timeout: 600_000 });

  for (const target of targets) {
    test(`Checklist: ${target.url}`, async ({ page }, testInfo) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${err.message}`));

      let httpStatus: number | undefined;
      let loadMs = 0;
      let result: ChecklistDocResult;

      try {
        const res = await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 60_000 });
        httpStatus = res?.status();
        await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => {});
        loadMs = await page.evaluate(() => {
          const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
          if (!nav) return 0;
          return Math.round(nav.loadEventEnd > 0 ? nav.loadEventEnd : nav.domContentLoadedEventEnd);
        });

        result = await runChecklistForPage(page, target.url, {
          project: target.project,
          consoleErrors,
          loadMs,
          httpStatus,
        });
      } catch (e) {
        // Only a page that cannot be evaluated at all produces FAIL.
        result = {
          docUrl: target.url,
          project: target.project,
          finalUrl: page.url(),
          httpStatus,
          pageTitle: "",
          runStartedAt: new Date().toISOString(),
          durationMs: 0,
          results: [
            {
              id: "CL-0.0",
              status: "FAIL",
              summary: `Page could not be audited: ${String(e).slice(0, 200)}`,
              evidence: [{ where: target.url, expected: "page loads", actual: String(e).slice(0, 200) }],
              issue: "The doc page failed to load, so no rule could be evaluated.",
              rootCause: "Navigation error or timeout — the URL may be stale or the site unreachable from this runner.",
              suggestedFix: "Confirm the URL is still published; if it is, re-run — a load failure here blocks the whole audit for this page.",
            },
          ],
          counts: { ...EMPTY_COUNTS(), FAIL: 1 },
        };
      }

      fs.mkdirSync(PER_DOC_DIR, { recursive: true });
      const outFile = path.join(PER_DOC_DIR, `${safeName(target.url)}.json`);
      fs.writeFileSync(outFile, JSON.stringify(result, null, 2), "utf-8");

      await testInfo.attach("checklist-result.json", {
        body: JSON.stringify(result, null, 2),
        contentType: "application/json",
      });

      const c = result.counts;
      console.log(
        `[Checklist] ${target.url} -> PASS ${c.PASS} | WARN ${c.WARN} | FAIL ${c.FAIL} | NA ${c.NA} | NOT_CHECKED ${c.NOT_CHECKED}`
      );
      for (const r of result.results.filter((r) => r.status === "WARN")) {
        console.warn(`  ⚠️  ${r.id} ${r.summary}`);
      }
    });
  }
});

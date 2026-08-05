/**
 * Playwright flow tests are identified by a single-line title:
 *   Project=<P> Module=<M> Stage=<S> <flowId>
 *
 * In real Playwright JSON output that line is SPLIT ACROSS THE SUITE TREE. `tests/flows.spec.ts`
 * registers `test.describe(`Project=${p} Module=${m} Stage=${s}`, …)` and then `test(flow.id, …)`, so:
 *
 *   suite  "Project=BrandKit Module=get-started Stage=main"
 *     spec   "create-a-brand-kit"
 *
 * The collectors below used to test `spec.title` alone for `Project=`, which never matches — so they
 * returned zero specs and every downstream report came out empty: `unified-report.json` with `rows: []`
 * and `summary {pass:0,warning:0,fail:0}` even though 15–22 flows had actually run, plus a CMS dashboard
 * reporting 0 flows against 218 real runs. That silently broke `generateUnifiedReport.ts`,
 * `generateCmsDashboardHtml.ts` and `buildCmsReportBundle.ts` at once, and left the Slack summary with no
 * per-URL detail. The condition was previously documented as a known bug in
 * `scripts/generateAllFlowReportsHtml.ts`, which works around it privately.
 *
 * Fixed by reconstructing the documented single-line title from the ancestor suites, so the parsing
 * helpers below operate on the format they were written for. Only suite titles carrying `key=value`
 * context are inherited — the file-level and human-prose describe blocks are skipped, which keeps the
 * synthesised title equal to the documented format rather than a long display path.
 */

export function flowIdFromPlaywrightSpecTitle(title: string): string {
  const t = String(title || "").trim();
  const parts = t.split(/\s+/).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : t;
}

export function projectFromPlaywrightSpecTitle(title: string): string | undefined {
  const m = String(title || "").match(/Project=([A-Za-z0-9_-]+)/);
  return m?.[1];
}

type PwSpec = { title?: string; tests?: Array<{ results?: Array<{ status?: string }>; status?: string }> };
export type PwSuite = { title?: string; specs?: PwSpec[]; suites?: PwSuite[] };

const PROJECT_IN_TITLE = /Project=[A-Za-z0-9_-]+\b/;

/** Suite titles worth inheriting: `Key=Value` context blocks, not `flows.spec.ts` or prose describes. */
const CONTEXT_SUITE = /[A-Za-z]+=[A-Za-z0-9_-]+/;

/**
 * Walk the suite tree, rebuilding each spec's full single-line title from the context suites above it.
 *
 * Returns shallow copies with `title` set to the reconstructed line, so every existing helper
 * (`projectFromPlaywrightSpecTitle`, `flowIdFromPlaywrightSpecTitle`, and the CMS variant) keeps working
 * unchanged. A spec whose own title already carries `Project=` — the legacy flat shape — still parses:
 * inherited context is prepended, and `projectFromPlaywrightSpecTitle` takes the first match, which
 * agrees with it.
 */
function collectFlowSpecs(
  pw: { suites?: PwSuite[] } | null | undefined,
  matches: (effectiveTitle: string) => boolean
): PwSpec[] {
  const out: PwSpec[] = [];

  function walk(suite: PwSuite, inherited: string) {
    const own = String(suite.title || "");
    const context = CONTEXT_SUITE.test(own) ? [inherited, own].filter(Boolean).join(" ") : inherited;

    for (const spec of suite.specs || []) {
      const effective = [context, String(spec.title || "")].filter(Boolean).join(" ").trim();
      if (matches(effective)) out.push({ ...spec, title: effective });
    }
    for (const child of suite.suites || []) walk(child, context);
  }

  for (const s of pw?.suites || []) walk(s, "");
  return out;
}

/** Collect CMS flow specs whether nested under Project= suites (legacy) or flat under Flow suite (current). */
export function collectCmsFlowSpecs(pw: { suites?: PwSuite[] } | null | undefined): PwSpec[] {
  return collectFlowSpecs(pw, (t) => /Project=CMS\b/.test(t));
}

/** All executable flow specs (CMS, Launch, Personalize, …). */
export function collectAllFlowSpecs(pw: { suites?: PwSuite[] } | null | undefined): PwSpec[] {
  return collectFlowSpecs(pw, (t) => PROJECT_IN_TITLE.test(t));
}

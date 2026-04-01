/**
 * Playwright flow tests use a single-line title:
 *   Project=<P> Module=<M> Stage=<S> <flowId>
 * (Matches `tests/flows.spec.ts` and `rg "Project=CMS"` filters.)
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

/** Collect CMS flow specs whether nested under Project= suites (legacy) or flat under Flow suite (current). */
export function collectCmsFlowSpecs(pw: { suites?: PwSuite[] } | null | undefined): PwSpec[] {
  const out: PwSpec[] = [];
  function walk(suite: PwSuite) {
    for (const spec of suite.specs || []) {
      const st = String(spec.title || "");
      if (/Project=CMS\b/.test(st)) out.push(spec);
    }
    for (const child of suite.suites || []) walk(child);
  }
  for (const s of pw?.suites || []) walk(s);
  return out;
}

/** All executable flow specs (CMS, Launch, Personalize, …). */
export function collectAllFlowSpecs(pw: { suites?: PwSuite[] } | null | undefined): PwSpec[] {
  const out: PwSpec[] = [];
  function walk(suite: PwSuite) {
    for (const spec of suite.specs || []) {
      const st = String(spec.title || "");
      if (PROJECT_IN_TITLE.test(st)) out.push(spec);
    }
    for (const child of suite.suites || []) walk(child);
  }
  for (const s of pw?.suites || []) walk(s);
  return out;
}

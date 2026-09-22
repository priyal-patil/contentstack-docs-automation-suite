/**
 * Shared types for the docs Checklist + Style Guide compliance audit.
 *
 * Sources of truth (stored copies live outside this repo, see CHECKLIST-AUDIT.md):
 *   - "Doc Testing Checklist and Log" spreadsheet, `Checklist` tab  -> check ids CL-*
 *   - "Contentstack Technical Documentation Style Guide" v1.0.3     -> check ids SG-*
 *
 * Policy (matches DOCS-AUTOMATION-COMMON.md rule 5): everything in here is advisory.
 * A style or checklist finding is a WARNING and never fails the Playwright run —
 * only a doc that cannot be loaded at all produces FAIL.
 */

export type CheckStatus =
  /** Verified and compliant. */
  | "PASS"
  /** Verified and non-compliant — this is a finding for the writer. */
  | "WARN"
  /** The page could not be evaluated at all (load failure). */
  | "FAIL"
  /** Rule does not apply to this page (e.g. no code blocks on a conceptual page). */
  | "NA"
  /** Rule is real but cannot be verified by automation — reported so coverage is honest. */
  | "NOT_CHECKED";

export type CheckSource = "checklist" | "style-guide";

/** How much confidence the check itself carries, independent of the result. */
export type CheckTier =
  /** DOM / HTTP / computed style — objective. */
  | "deterministic"
  /** Text pattern matching — indicative, may produce false positives. */
  | "heuristic"
  /** Needs a human or a vision model. Always reported as NOT_CHECKED. */
  | "manual";

export type CheckDefinition = {
  id: string;
  source: CheckSource;
  /** Item number in the checklist sheet, or section name in the style guide. */
  reference: string;
  title: string;
  tier: CheckTier;
  /** Why a human cares — printed in the report next to the finding. */
  rationale: string;
};

export type Evidence = {
  /** Short label, e.g. "h2[3]" or the offending sentence. */
  where: string;
  expected?: string;
  actual?: string;
};

export type CheckResult = {
  id: string;
  status: CheckStatus;
  /** One line stating the outcome. */
  summary: string;
  evidence: Evidence[];
  /** Populated for WARN/FAIL only — the three-part bug report contract. */
  issue?: string;
  rootCause?: string;
  suggestedFix?: string;
};

export type ChecklistDocResult = {
  docUrl: string;
  project: string;
  finalUrl: string;
  httpStatus?: number;
  pageTitle: string;
  runStartedAt: string;
  durationMs: number;
  results: CheckResult[];
  counts: Record<CheckStatus, number>;
};

export const EMPTY_COUNTS = (): Record<CheckStatus, number> => ({
  PASS: 0,
  WARN: 0,
  FAIL: 0,
  NA: 0,
  NOT_CHECKED: 0,
});

export function tallyCounts(results: CheckResult[]): Record<CheckStatus, number> {
  const counts = EMPTY_COUNTS();
  for (const r of results) counts[r.status] += 1;
  return counts;
}

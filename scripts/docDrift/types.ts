/**
 * Shared types for the doc-drift checker.
 *
 * Purpose: keep flow JSON (`projects/<Project>/<module>/flows/*.flow.json`) in sync with the
 * documentation page named in its `source`. See `.cursor/rules/doc-step-parity.mdc` and
 * `doc-step-minimal-enforcement.mdc` — the doc is the spec, never the app.
 */

/** One ordered step as written in the doc, with the section it sits under. */
export type DocStep = {
  /** 1-based position across the whole article (doc procedures are often split by images). */
  index: number;
  text: string;
  /** Nearest preceding h2/h3 heading text, or null when the step precedes any heading. */
  section: string | null;
};

export type DocHeading = { level: 2 | 3; text: string };

/** Rendered snapshot of a documentation page. Baseline for change detection. */
export type DocSnapshot = {
  url: string;
  /** URL actually served after redirects. */
  finalUrl: string;
  httpStatus: number;
  title: string;
  /** "Last updated July 17, 2026" line as printed on the page, when present. */
  lastUpdated: string | null;
  headings: DocHeading[];
  /** Every `<ol>` item in the article, in DOM order, breadcrumbs excluded. */
  orderedSteps: DocStep[];
  /** Every `<ul>` item in the article (field lists, checklists). */
  bullets: string[];
  /** Every bold/strong run in the article, trailing colon stripped. */
  boldLabels: string[];
  /**
   * The subset of `boldLabels` shaped like a UI element name rather than a bolded sentence
   * lead-in. This is the ground truth for `labelEquals`.
   */
  namedLabels: string[];
  /** Section headings whose body makes the procedure conditional ("only if", "skip ahead"). */
  conditionalSections: string[];
  /** Named label -> the doc sections it appears in. Empty array means "before any heading". */
  labelSections: Record<string, string[]>;
  codeBlockCount: number;
  /** Full article text — input for the semantic (LLM) comparison layer. */
  text: string;
  /** sha256 of `text`; cheap change detection between runs. */
  contentHash: string;
  fetchedAt: string;
  error?: string;
};

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Finding = {
  severity: Severity;
  /** Stable machine code, e.g. "doc-does-not-name-label". */
  code: string;
  message: string;
  /** Flow file path, repo-relative. */
  flow?: string;
  /** Step index within `steps` (0-based), when the finding is step-scoped. */
  stepIndex?: number;
  /** String currently asserted by the flow. */
  actual?: string;
  /** Exact doc wording the flow should assert instead. */
  suggested?: string;
  /** Whether an agent may rewrite the JSON for this finding without human triage. */
  autoFixable: boolean;
};

/** Minimal shape of a flow JSON step — the schema is loose in practice, so index freely. */
export type FlowStep = {
  action?: string;
  target?: string;
  value?: string;
  timeoutMs?: number;
  warnOnly?: boolean;
  optional?: boolean;
  labelEquals?: string;
  labelMatch?: string;
  expected?: Record<string, unknown>;
  [key: string]: unknown;
};

export type Flow = {
  id?: string;
  project?: string;
  module?: string;
  stage?: string;
  source?: string;
  type?: string;
  use?: string[];
  automationNotes?: string;
  steps?: FlowStep[];
  [key: string]: unknown;
};

export type FlowFile = {
  /** Repo-relative path. */
  path: string;
  flow: Flow;
};

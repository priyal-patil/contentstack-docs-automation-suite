// core/healing/types.ts
/**
 * Shared types for the self-healing docs QA agent.
 *
 * Design note: `StructuredElement` is deliberately serialisable and browser-free so the matcher is a
 * pure function. The same shape is produced two ways — from a live Playwright page, and from a saved
 * HTML snapshot via cheerio — which is what makes the matcher unit-testable from fixtures.
 */

/** A single interactive/candidate element, flattened out of a DOM (live or snapshot). */
export type StructuredElement = {
  tag: string;
  role?: string;
  /** Trimmed, whitespace-collapsed innerText. */
  text?: string;
  id?: string;
  classes: string[];
  /** `data-test-id` or `data-testid` — the repo uses both spellings. */
  testId?: string;
  ariaLabel?: string;
  name?: string;
  title?: string;
  href?: string;
  placeholder?: string;
  type?: string;
  /** Structural path from the document root, e.g. `html>body>div:nth-of-type(2)>button:nth-of-type(1)`. */
  domPath: string;
  /** Index among same-tag siblings (0-based). */
  siblingIndex: number;
  /** Text of the nearest meaningful ancestor, for disambiguating repeated labels. */
  surroundingText?: string;
  /** Only known for live pages; snapshots cannot tell us. */
  visible?: boolean;
};

/** Which matching tier produced a candidate. Ordered cheapest → most expensive. */
export type MatchStrategy =
  | "original-selector"
  | "stable-attribute"
  | "structural"
  | "fuzzy-text"
  | "llm-escalation";

/** A proposed replacement element plus why we believe in it. */
export type Candidate = {
  element: StructuredElement;
  strategy: MatchStrategy;
  /** 0..1. Compared against `HealConfig.confidenceThreshold`. */
  confidence: number;
  /** A synthesised Playwright/CSS selector for `element`. */
  selector: string;
  /** Human-readable justification, written to the audit log and the PR body. */
  rationale: string;
};

/** Whether replaying a flow mutates live application state. Sets the attempt budget. */
export type FlowMutability = "idempotent" | "destructive";

/** One failed step to attempt healing on, derived from `doc-step-failures.json`. */
export type HealTarget = {
  flowId: string;
  project: string;
  module: string;
  /** Doc URL the flow was derived from (`flow.source`). */
  documentUrl: string;
  /** Human-facing doc title, used in the commit subject. */
  docTitle: string;
  stepIndex: number;
  stepNumber: number;
  action: string;
  /** The step's `target` — also the key into the selector maps. */
  target: string;
  errorMessage: string;
  /** Selector chain currently in force for `target`, and which layer supplied it. */
  currentSelector?: string;
  currentSelectorLayer?: SelectorLayer;
  screenshotPath?: string;
  /** Saved failure DOM from the run that produced this report, if present. */
  snapshotPath?: string;
  mutability: FlowMutability;
  /** Absolute path to the flow JSON. */
  flowPath: string;
  step: Record<string, unknown>;
};

/** The layered selector sources merged by `loadOverrides()` in rules/core/actionRules.ts. */
export type SelectorLayer =
  | "shared-common"
  | "legacy-common"
  | "project"
  | "module"
  | "flow"
  | "global-actionrules"
  | "none";

/**
 * `environment-failure` is distinct from `genuine-failure` on purpose. A backtest over 386 real saved
 * failure DOMs showed that some failures are neither locator drift nor doc drift — the session had
 * expired or the page never rendered, so the element is absent for reasons that have nothing to do
 * with the documentation. Reporting those as doc/app mismatch would send technical writers chasing
 * infrastructure noise, so they are bucketed separately and never appear in the drift report.
 */
export type HealOutcome =
  | "healed"
  | "genuine-failure"
  | "environment-failure"
  | "skipped"
  | "error";

export type AttemptRecord = {
  attempt: number;
  stepIndex: number;
  /** Every strategy tried this attempt, with scores — healing must be auditable, not a black box. */
  strategiesTried: Array<{ strategy: MatchStrategy; confidence: number; selector?: string; note?: string }>;
  chosen?: Candidate;
  /** Did the action succeed once the candidate was applied? */
  actionSucceeded?: boolean;
  /** Did the remainder of the flow pass? Only then is the heal real. */
  remainderPassed?: boolean;
  snapshotSaved?: string;
  error?: string;
};

export type HealResult = {
  target: HealTarget;
  outcome: HealOutcome;
  attempts: AttemptRecord[];
  /** Set when `outcome === "healed"`. */
  resolvedSelector?: string;
  resolvedBy?: MatchStrategy;
  /** Where the fix was written. Undefined in dry-run, where the write is always reverted. */
  writtenTo?: string;
  /** Full chain now in force: the original selector first, the recovered one appended. */
  newChain?: string;
  /** Set when `outcome === "genuine-failure"`. */
  genuineFailureReason?: string;
  closestCandidates?: Candidate[];
};

export type HealConfig = {
  /** Attempt budget for idempotent flows, scoped per (flowId, stepIndex). */
  maxHealAttempts: number;
  /** Attempt budget for flows that mutate live state. */
  maxHealAttemptsDestructive: number;
  /** Minimum confidence for a candidate to be applied at all. */
  confidenceThreshold: number;
  /** Whole-run wall-clock cap, so one stubborn flow cannot eat the budget. */
  globalTimeoutMs: number;
  /** Per-flow wall-clock cap. */
  perFlowTimeoutMs: number;
  /** Consult an LLM when every rule tier misses. Requires ANTHROPIC_API_KEY. */
  enableLlmEscalation: boolean;
  /** Report only; never touch the working tree. */
  dryRun: boolean;
  reportDir: string;
  snapshotDir: string;
};

export const DEFAULT_HEAL_CONFIG: HealConfig = {
  maxHealAttempts: 5,
  maxHealAttemptsDestructive: 1,
  confidenceThreshold: 0.6,
  globalTimeoutMs: 90 * 60 * 1000,
  perFlowTimeoutMs: 20 * 60 * 1000,
  enableLlmEscalation: false,
  dryRun: false,
  reportDir: "reports/latest",
  snapshotDir: "data/dom",
};

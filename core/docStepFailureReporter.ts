/**
 * Records failures when a document step cannot be executed (e.g. element not found).
 * Used to report to technical writers: which document URL failed, at which step, and why.
 * No steps are added by the framework – only steps from the document (flow) are executed.
 */
import fs from "fs";
import path from "path";

export type DocStepFailure = {
  /** Document/source URL (the doc this flow was derived from). */
  documentUrl: string;
  /** Flow id (e.g. boolean-part-2). */
  flowId: string;
  /** Zero-based step index in flow.steps. */
  stepIndex: number;
  /** One-based step number for display (e.g. "Step 5"). */
  stepNumber: number;
  /** Action from the document step (click, enter, verify, etc.). */
  action: string;
  /** Target from the document step (e.g. "New Content Type", "Insert a field"). */
  target: string;
  /** Value if step had one (e.g. for enter). */
  value?: string;
  /** Error message (e.g. "Element not found", "Timeout"). */
  errorMessage: string;
  /**
   * Short human-readable line for reports: what kind of control was missing (button/field/label/modal)
   * and optional locator snippet from the error.
   */
  missingElementSummary?: string;
  /**
   * Path relative to REPORT_DIR (e.g. `flow-screenshots/my-flow-step-3.png`) for HTML img/link.
   */
  screenshotRelativePath?: string;
  /** Full step object for debugging. */
  step: Record<string, unknown>;
};

const failures: DocStepFailure[] = [];
export type DocStepWarning = {
  documentUrl: string;
  flowId: string;
  stepIndex: number;
  stepNumber: number;
  action: string;
  target: string;
  value?: string;
  warningMessage: string;
  step: Record<string, unknown>;
};

const warnings: DocStepWarning[] = [];

const REPORT_DIR = process.env.REPORT_DIR || path.resolve(process.cwd(), "reports/latest");
const WORKER_DIR = path.join(REPORT_DIR, ".doc-step-workers");
const WORKER_ID = `${process.pid}-${process.env.TEST_WORKER_INDEX || "worker"}`;
const FAILURES_FILE = path.join(WORKER_DIR, `failures-${WORKER_ID}.jsonl`);
const WARNINGS_FILE = path.join(WORKER_DIR, `warnings-${WORKER_ID}.jsonl`);
const FRESHNESS_MS = 2 * 60 * 60 * 1000; // ignore stale worker files from older runs

function ensureWorkerDir(): void {
  if (!fs.existsSync(WORKER_DIR)) fs.mkdirSync(WORKER_DIR, { recursive: true });
}

function appendJsonl(filePath: string, payload: Record<string, unknown>): void {
  ensureWorkerDir();
  fs.appendFileSync(filePath, `${JSON.stringify(payload)}\n`, "utf-8");
}

function readRecentJsonl(prefix: "failures-" | "warnings-"): Record<string, unknown>[] {
  if (!fs.existsSync(WORKER_DIR)) return [];
  const now = Date.now();
  const out: Record<string, unknown>[] = [];
  for (const name of fs.readdirSync(WORKER_DIR)) {
    if (!name.startsWith(prefix) || !name.endsWith(".jsonl")) continue;
    const full = path.join(WORKER_DIR, name);
    const stat = fs.statSync(full);
    if (now - stat.mtimeMs > FRESHNESS_MS) continue;
    const lines = fs
      .readFileSync(full, "utf-8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      try {
        out.push(JSON.parse(line));
      } catch {
        // ignore malformed lines; keep reporter resilient
      }
    }
  }
  return out;
}

/**
 * Builds a one-line description of what was not found on the page (for HTML/JSON reports).
 */
export function buildMissingElementSummary(step: Record<string, unknown>, errorMessage: string): string {
  const action = String(step?.action ?? "").toLowerCase();
  const target = String(step?.target ?? "(unknown target)");
  const msg = errorMessage || "";

  let kind = "UI control";
  if (action === "click") kind = "Button/link/control";
  else if (action === "enter" || action === "type") kind = "Field/input";
  else if (action === "verify") kind = "Element/label/modal to verify";
  else if (action === "upload") kind = "File input/control";

  // These keyword hints refine the report wording only. They must be WORD-bounded: `/switch/` alone also
  // matches "App Switcher", which made every App-Switcher step — the first step of most flows in most
  // projects — report as a "Toggle/checkbox not found". That is actively misleading when reading a failure,
  // and it cost real debugging time chasing a toggle that was never involved.
  const tl = target.toLowerCase();
  const has = (re: RegExp) => /\(doc step\)/i.test(target) && re.test(tl);
  if (has(/\bmodal\b|\bdialog\b/)) kind = "Modal/dialog";
  else if (has(/\btoggle\b|\bcheckbox\b|\bswitch\b/)) kind = "Toggle/checkbox";
  else if (has(/\bdropdown\b|\bselect\b|\bmenu\b/)) kind = "Dropdown/menu";

  let locatorHint = "";
  const locLine = msg.match(/Locator:\s*([^\n]+)/i);
  const waitLine = msg.match(/waiting for\s+([^\n]+)/i);
  const rawLine = (locLine?.[1] || waitLine?.[1] || "").trim();
  if (rawLine) {
    const short = rawLine.length > 240 ? `${rawLine.slice(0, 240)}…` : rawLine;
    locatorHint = ` — ${short}`;
  }

  if (/timeout/i.test(msg) && /attached|visible/i.test(msg) && !locatorHint) {
    locatorHint = " — timed out waiting for element to attach/appear";
  }

  return `${kind} not found or not usable: "${target}"${locatorHint}`;
}

function dedupe<T extends { documentUrl: string; flowId: string; stepIndex: number; target: string; action: string }>(
  rows: T[],
  messageKey: keyof T
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const r of rows) {
    const msg = String(r[messageKey] ?? "");
    const key = [r.documentUrl, r.flowId, r.stepIndex, r.action, r.target, msg].join("::");
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function recordDocStepFailure(
  documentUrl: string,
  flowId: string,
  stepIndex: number,
  step: Record<string, unknown>,
  errorMessage: string,
  extras?: {
    missingElementSummary?: string;
    screenshotRelativePath?: string;
  }
): void {
  const action = String(step?.action ?? "unknown");
  const target = String(step?.target ?? "unknown");
  const value = step?.value != null ? String(step.value) : undefined;
  const row: DocStepFailure = {
    documentUrl,
    flowId,
    stepIndex,
    stepNumber: stepIndex + 1,
    action,
    target,
    value,
    errorMessage,
    step: step as Record<string, unknown>,
  };
  if (extras?.missingElementSummary) row.missingElementSummary = extras.missingElementSummary;
  if (extras?.screenshotRelativePath) row.screenshotRelativePath = extras.screenshotRelativePath;
  failures.push(row);
  appendJsonl(FAILURES_FILE, failures[failures.length - 1] as unknown as Record<string, unknown>);
}

export function getDocStepFailures(): DocStepFailure[] {
  const disk = readRecentJsonl("failures-") as DocStepFailure[];
  return dedupe([...disk, ...failures], "errorMessage");
}

export function recordDocStepWarning(
  documentUrl: string,
  flowId: string,
  stepIndex: number,
  step: Record<string, unknown>,
  warningMessage: string
): void {
  const action = String(step?.action ?? "unknown");
  const target = String(step?.target ?? "unknown");
  const value = step?.value != null ? String(step.value) : undefined;
  warnings.push({
    documentUrl,
    flowId,
    stepIndex,
    stepNumber: stepIndex + 1,
    action,
    target,
    value,
    warningMessage,
    step: step as Record<string, unknown>,
  });
  appendJsonl(WARNINGS_FILE, warnings[warnings.length - 1] as unknown as Record<string, unknown>);
}

export function getDocStepWarnings(): DocStepWarning[] {
  const disk = readRecentJsonl("warnings-") as DocStepWarning[];
  return dedupe([...disk, ...warnings], "warningMessage");
}

export function clearDocStepFailures(): void {
  failures.length = 0;
  warnings.length = 0;
}

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
  errorMessage: string
): void {
  const action = String(step?.action ?? "unknown");
  const target = String(step?.target ?? "unknown");
  const value = step?.value != null ? String(step.value) : undefined;
  failures.push({
    documentUrl,
    flowId,
    stepIndex,
    stepNumber: stepIndex + 1,
    action,
    target,
    value,
    errorMessage,
    step: step as Record<string, unknown>,
  });
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

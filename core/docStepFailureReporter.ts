/**
 * Records failures when a document step cannot be executed (e.g. element not found).
 * Used to report to technical writers: which document URL failed, at which step, and why.
 * No steps are added by the framework – only steps from the document (flow) are executed.
 */

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
}

export function getDocStepFailures(): DocStepFailure[] {
  return [...failures];
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
}

export function getDocStepWarnings(): DocStepWarning[] {
  return [...warnings];
}

export function clearDocStepFailures(): void {
  failures.length = 0;
  warnings.length = 0;
}

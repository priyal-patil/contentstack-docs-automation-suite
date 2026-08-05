// core/healing/auditLog.ts
/**
 * Every healing decision is logged — which strategy matched, at what confidence, and whether the
 * empirical replay accepted it. Healing that cannot be audited is not trustworthy, so this is written
 * unconditionally (including in dry-run) as JSONL.
 */
import fs from "fs";
import path from "path";
import type { AttemptRecord, HealResult } from "./types";

export class AuditLog {
  private readonly file: string;

  constructor(reportDir: string) {
    const dir = path.join(reportDir, "healing");
    fs.mkdirSync(dir, { recursive: true });
    this.file = path.join(dir, "healing-audit.jsonl");
  }

  get path(): string {
    return this.file;
  }

  private write(record: Record<string, unknown>): void {
    try {
      fs.appendFileSync(this.file, `${JSON.stringify({ ts: new Date().toISOString(), ...record })}\n`, "utf8");
    } catch {
      /* logging must never break a run */
    }
  }

  runStarted(meta: Record<string, unknown>): void {
    this.write({ event: "run-started", ...meta });
  }

  targetStarted(flowId: string, stepNumber: number, target: string, budget: number): void {
    this.write({ event: "target-started", flowId, stepNumber, target, budget });
  }

  attempt(flowId: string, record: AttemptRecord): void {
    this.write({ event: "attempt", flowId, ...record });
  }

  targetFinished(result: HealResult): void {
    this.write({
      event: "target-finished",
      flowId: result.target.flowId,
      stepNumber: result.target.stepNumber,
      outcome: result.outcome,
      resolvedSelector: result.resolvedSelector,
      resolvedBy: result.resolvedBy,
      writtenTo: result.writtenTo,
      genuineFailureReason: result.genuineFailureReason,
      attempts: result.attempts.length,
    });
  }

  runFinished(summary: Record<string, unknown>): void {
    this.write({ event: "run-finished", ...summary });
  }
}

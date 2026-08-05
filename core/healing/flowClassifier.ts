// core/healing/flowClassifier.ts
/**
 * Classifies a flow by what replaying it does to live application state, which sets the attempt
 * budget. This is the real constraint on healing — not the matching heuristics.
 *
 * Replaying a flow re-runs every step before the failure point against the live app. So an attempt
 * budget of 5 on `delete-a-brand-kit` means five real deletions, each needing a fresh fixture.
 *
 * Two classes:
 *  - `destructive`  — irreversible or fixture-consuming (delete / remove / revoke / trash / import).
 *                     Capped at `maxHealAttemptsDestructive` (default 1).
 *  - `idempotent`   — verify-only flows, and creates/edits whose names are templated with `{unique…}`
 *                     so a replay makes a *new* object instead of colliding. Full budget.
 *
 * Note on `idempotent`: replays of create flows still leave orphaned objects behind. They do not
 * break the next attempt, which is why they get the full budget, but a healing run does add rows to
 * the QA org — see the cleanup note in docs/self-healing-agent-design.md.
 *
 * Overridable per flow via `data/healing/flow-mutability.json`:
 *   { "delete-a-brand-kit": "destructive", "get-started-with-brand-kit": "idempotent" }
 */
import fs from "fs";
import path from "path";
import type { FlowMutability } from "./types";

const REPO_ROOT = path.resolve(__dirname, "../..");
const OVERRIDE_FILE = path.join(REPO_ROOT, "data/healing/flow-mutability.json");

/** Flow-id / stage tokens that imply irreversible or fixture-consuming work. */
const DESTRUCTIVE_ID = /(^|-)(delete|remove|revoke|trash|purge|destroy|uninstall|cleanup|reset)(-|$)/i;
const DESTRUCTIVE_STAGE = /^(delete|cleanup|teardown)$/i;

/** Step actions that consume or destroy state rather than create it. */
const DESTRUCTIVE_ACTION = /^(delete|remove|revoke)$/i;

/**
 * `import` flows consume a specific fixture row (e.g. AUTO-KV-IMPORT-DUMMY) that a sibling flow
 * created, so replaying them is not free either.
 */
const FIXTURE_CONSUMING_ID = /(^|-)(import|restore)(-|$)/i;

let overrides: Record<string, FlowMutability> | undefined;

function loadOverrides(): Record<string, FlowMutability> {
  if (overrides) return overrides;
  try {
    overrides = fs.existsSync(OVERRIDE_FILE)
      ? (JSON.parse(fs.readFileSync(OVERRIDE_FILE, "utf8")) as Record<string, FlowMutability>)
      : {};
  } catch {
    overrides = {};
  }
  return overrides;
}

export function classifyFlow(flow: {
  id?: string;
  stage?: string;
  steps?: Array<Record<string, unknown>>;
}): FlowMutability {
  const id = String(flow.id ?? "");
  const ov = loadOverrides()[id];
  if (ov === "destructive" || ov === "idempotent") return ov;

  if (DESTRUCTIVE_ID.test(id)) return "destructive";
  if (FIXTURE_CONSUMING_ID.test(id)) return "destructive";
  if (DESTRUCTIVE_STAGE.test(String(flow.stage ?? ""))) return "destructive";

  for (const s of flow.steps ?? []) {
    if (DESTRUCTIVE_ACTION.test(String((s as any)?.action ?? ""))) return "destructive";
  }
  return "idempotent";
}

/** Attempt budget for a flow, given its classification. */
export function attemptBudget(
  mutability: FlowMutability,
  cfg: { maxHealAttempts: number; maxHealAttemptsDestructive: number }
): number {
  return mutability === "destructive" ? cfg.maxHealAttemptsDestructive : cfg.maxHealAttempts;
}

/** True when a step's action mutates state, used to decide whether a replay is safe to repeat. */
export function stepMutates(action: string): boolean {
  return /^(click|enter|select|upload|delete|remove|revoke|submit)$/i.test(action);
}

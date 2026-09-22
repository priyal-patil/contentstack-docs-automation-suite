/**
 * Layer 3 — compare a flow's asserted labels and steps against the live doc snapshot.
 *
 * The doc is the spec. Every `labelEquals` on a doc-derived step must be traceable to wording
 * that appears in the document; when the doc's wording changed, the exact new string is
 * reported as `suggested` so the JSON can be updated to match the doc — never to match the app.
 */

import type { DocSnapshot, Finding, Flow, FlowStep } from "./types";

/** Actions that actually drive the UI, as opposed to asserting something about it. */
const EXECUTING_ACTIONS = new Set([
  "click", "enter", "input", "select", "hover", "upload", "navigate", "press", "drag", "dragBy",
]);

/** Normalize for comparison: case, punctuation, the "+ " affordance prefix, trailing colon. */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/^\+\s*/, "")
    .replace(/[:.]$/, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

type LabelSite = { label: string; stepIndex: number; step: FlowStep };

/**
 * Pull every doc-derived label assertion out of a flow, step-level or inside `expected`.
 * A step often repeats the same string across `labelEquals` and `modalTitle`; report it once.
 */
function collectLabelSites(flow: Flow): LabelSite[] {
  const sites: LabelSite[] = [];
  (flow.steps ?? []).forEach((step, stepIndex) => {
    const expected = (step.expected ?? {}) as Record<string, unknown>;
    const seen = new Set<string>();
    for (const candidate of [step.labelEquals, expected.labelEquals, expected.modalTitle]) {
      if (typeof candidate !== "string" || !candidate.trim()) continue;
      const label = candidate.trim();
      if (seen.has(norm(label))) continue;
      seen.add(norm(label));
      sites.push({ label, stepIndex, step });
    }
  });
  return sites;
}

/** Where in the doc a string appears, strongest evidence first. */
type LabelEvidence =
  | { kind: "named"; exact: string }
  | { kind: "named-different-wording"; exact: string }
  | { kind: "prose-only" }
  | { kind: "absent" };

function findLabelEvidence(label: string, snap: DocSnapshot): LabelEvidence {
  const target = norm(label);
  if (!target) return { kind: "absent" };

  const named = [
    ...(snap.namedLabels ?? snap.boldLabels),
    ...snap.headings.map((h) => h.text),
  ];

  // Exact character-for-character match against a doc-named element.
  const exact = named.find((n) => n === label);
  if (exact) return { kind: "named", exact };

  // Same element, different wording (case, "+ " prefix, trailing colon).
  const loose = named.find((n) => norm(n) === target);
  if (loose) return { kind: "named-different-wording", exact: loose };

  // The doc uses the phrase somewhere, but never as a named UI element.
  const prose = `${snap.text} ${snap.orderedSteps.map((s) => s.text).join(" ")} ${snap.bullets.join(" ")}`;
  if (norm(prose).includes(target)) return { kind: "prose-only" };

  return { kind: "absent" };
}

export function compareFlowToDoc(flowPath: string, flow: Flow, snap: DocSnapshot): Finding[] {
  const findings: Finding[] = [];

  if (snap.error) {
    findings.push({
      severity: "high",
      code: "doc-fetch-failed",
      message: `Could not fetch \`source\`: ${snap.error}`,
      flow: flowPath,
      actual: snap.url,
      autoFixable: false,
    });
    return findings;
  }

  if (snap.httpStatus >= 400) {
    findings.push({
      severity: "critical",
      code: "doc-url-dead",
      message: `\`source\` returned HTTP ${snap.httpStatus}. The documented page is gone or moved.`,
      flow: flowPath,
      actual: snap.url,
      autoFixable: false,
    });
    return findings;
  }

  const steps = flow.steps ?? [];
  const executingSteps = steps.filter((s) => s.action && EXECUTING_ACTIONS.has(s.action));

  // --- The loudest signal: the doc no longer documents a procedure at all. ---
  const orphaned = flow.type === "executable" && snap.orderedSteps.length === 0 && executingSteps.length > 0;
  if (orphaned) {
    findings.push({
      severity: "critical",
      code: "orphaned-procedure",
      message:
        `Doc "${snap.title}" contains no ordered steps, but this flow performs ${executingSteps.length} UI actions ` +
        `and asserts ${collectLabelSites(flow).length} labels. The doc was rewritten as conceptual content — the entire ` +
        `step list has no doc basis, so per-label findings are suppressed as consequences of this one root cause. ` +
        `Needs human triage: delete, downgrade to \`informational\`, or re-point \`source\` at the doc that now carries ` +
        `the procedure.`,
      flow: flowPath,
      autoFixable: false,
    });
  }

  // --- Doc retitled: often means the page was repurposed, not just renamed. ---
  const slug = (flow.source ?? "").split("/").pop() ?? "";
  if (slug && snap.title && norm(snap.title.replace(/\s+/g, "-")) !== norm(slug)) {
    findings.push({
      severity: "info",
      code: "doc-retitled",
      message: `Doc h1 is "${snap.title}" but \`source\` slug is "${slug}". Check whether the page was repurposed and whether a canonical URL now exists.`,
      flow: flowPath,
      actual: slug,
      suggested: snap.title,
      autoFixable: false,
    });
  }

  // --- Label-by-label parity against the doc. ---
  // Skipped when the procedure is orphaned: every label would fail for the same reason, and 36
  // duplicate findings bury the one that matters.
  for (const site of orphaned ? [] : collectLabelSites(flow)) {
    const evidence = findLabelEvidence(site.label, snap);
    const isVerify = site.step.action === "verify";

    if (evidence.kind === "named") continue;

    if (evidence.kind === "named-different-wording") {
      findings.push({
        severity: "medium",
        code: "label-wording-drift",
        message:
          `Step ${site.stepIndex + 1} asserts "${site.label}" but the doc now names this element "${evidence.exact}". ` +
          `Update \`labelEquals\` to the doc's exact string.`,
        flow: flowPath,
        stepIndex: site.stepIndex,
        actual: site.label,
        suggested: evidence.exact,
        autoFixable: true,
      });
    } else if (evidence.kind === "prose-only") {
      findings.push({
        severity: "low",
        code: "label-not-a-named-element",
        message:
          `Step ${site.stepIndex + 1} asserts "${site.label}". The phrase appears in the doc's prose but the doc never ` +
          `names it as a UI element, so the \`labelEquals\` has a weak doc basis. Per doc-step-parity.mdc, perform the ` +
          `action without a \`verify\` when the doc does not name the control.`,
        flow: flowPath,
        stepIndex: site.stepIndex,
        actual: site.label,
        autoFixable: false,
      });
    } else if (isVerify) {
      findings.push({
        severity: "high",
        code: "doc-does-not-name-label",
        message:
          `Step ${site.stepIndex + 1} verifies "${site.label}", which does not appear anywhere in doc "${snap.title}". ` +
          `Either the doc dropped this element or the assertion was sourced from the app. Do not copy the app's label — ` +
          `remove the \`verify\` or report it as a documentation gap.`,
        flow: flowPath,
        stepIndex: site.stepIndex,
        actual: site.label,
        autoFixable: false,
      });
    }
  }

  // --- Elements the doc only documents inside a conditional branch. ---
  // The flow asserting them unconditionally is a real break on the path where the branch is
  // absent — e.g. "Advanced Settings" only exists when the stack already has a Compositions
  // content type, so a fresh stack never renders it.
  if (!orphaned && snap.conditionalSections.length > 0 && snap.labelSections) {
    const conditional = new Set(snap.conditionalSections);
    const byLabel = new Map(Object.entries(snap.labelSections).map(([k, v]) => [norm(k), v]));

    for (const site of collectLabelSites(flow)) {
      const sections = byLabel.get(norm(site.label));
      if (!sections || sections.length === 0) continue;
      const condSections = sections.filter((s) => conditional.has(s));
      if (condSections.length === 0) continue;
      // Every mention conditional → the element genuinely only exists on that branch.
      // Some mentions conditional → often a back-reference to the branch; worth a look, but
      // not confident enough to call a break.
      const allConditional = condSections.length === sections.length;

      const step = site.step;
      const guarded =
        step.optional === true ||
        step.warnOnly === true ||
        step.skipIfFlowFlagTrue !== undefined ||
        step.onlyIfFlowFlagTrue !== undefined;

      findings.push({
        severity: allConditional ? (guarded ? "low" : "high") : "medium",
        code: "conditional-element-unguarded",
        message: allConditional
          ? `Step ${site.stepIndex + 1} asserts "${site.label}", which the doc documents only inside the conditional ` +
            `section ${condSections.map((s) => `"${s}"`).join(" / ")} ("only if…" / "skip ahead…"). ` +
            (guarded
              ? "The step carries a guard — confirm the guard matches the doc's condition."
              : "The step is unguarded, so the flow breaks on the documented path where that section does not appear. " +
                "Guard it (`optional` / `skipIfFlowFlagTrue`) or split the conditional branch into its own flow.")
          : `Step ${site.stepIndex + 1} asserts "${site.label}". The doc introduces it in the conditional section ` +
            `${condSections.map((s) => `"${s}"`).join(" / ")} and mentions it again under ` +
            `${sections.filter((s) => !conditional.has(s)).map((s) => `"${s}"`).join(" / ")}. Read the doc to decide ` +
            `whether the second mention is a back-reference to the conditional branch — if so this step needs a guard.`,
        flow: flowPath,
        stepIndex: site.stepIndex,
        actual: site.label,
        autoFixable: false,
      });
    }
  }

  // --- Doc steps with no counterpart in the flow. ---
  if (snap.orderedSteps.length > 0) {
    const flowBlob = norm(
      steps
        .map((s) => `${s.target ?? ""} ${s.value ?? ""} ${s.labelEquals ?? ""} ${JSON.stringify(s.expected ?? {})}`)
        .join(" ")
    );
    for (const docStep of snap.orderedSteps) {
      // Match on the doc step's named elements; prose paraphrase is not comparable mechanically.
      const namedInStep = (snap.namedLabels ?? snap.boldLabels).filter(
        (l) => norm(docStep.text).includes(norm(l)) && norm(l).length > 3
      );
      if (namedInStep.length === 0) continue;
      const covered = namedInStep.some((l) => flowBlob.includes(norm(l)));
      if (!covered) {
        findings.push({
          severity: "medium",
          code: "uncovered-doc-step",
          message:
            `Doc step ${docStep.index}${docStep.section ? ` (section "${docStep.section}")` : ""} names ` +
            `${namedInStep.map((l) => `"${l}"`).join(", ")} but no flow step references it: "${docStep.text.slice(0, 140)}".`,
          flow: flowPath,
          suggested: docStep.text,
          autoFixable: false,
        });
      }
    }
  }

  // --- Scale mismatch: a signal to re-read the doc, not a defect on its own. ---
  if (snap.orderedSteps.length > 0 && executingSteps.length > snap.orderedSteps.length * 3) {
    findings.push({
      severity: "info",
      code: "flow-over-specified",
      message:
        `Flow performs ${executingSteps.length} UI actions against ${snap.orderedSteps.length} documented steps. ` +
        `Likely carries inferred steps that doc-step-minimal-enforcement.mdc disallows — worth re-reading sentence by sentence.`,
        flow: flowPath,
      autoFixable: false,
    });
  }

  // --- Doc content changed since the last snapshot. ---
  const prevHash = (snap as DocSnapshot & { previousHash?: string }).previousHash;
  if (prevHash && prevHash !== snap.contentHash) {
    findings.push({
      severity: "info",
      code: "doc-changed-since-last-run",
      message: `Doc content hash changed since the previous snapshot (${(snap as DocSnapshot & { previousFetchedAt?: string }).previousFetchedAt ?? "unknown date"}). ${snap.lastUpdated ?? ""}`.trim(),
      flow: flowPath,
      autoFixable: false,
    });
  }

  return findings;
}

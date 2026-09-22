/**
 * Layer 1 — checks that need no network access.
 *
 * Schema soundness, traceability to a doc URL, and conformance to
 * `.cursor/rules/doc-step-parity.mdc` (exact `labelEquals`, no contains-matching for
 * doc-derived verification).
 */

import type { Finding, FlowFile } from "./types";
import { loadDocsInventory, normalizeUrl } from "./loadFlows";

const REQUIRED_KEYS = ["id", "project", "module", "type", "steps"] as const;
const KNOWN_ACTIONS = new Set([
  "click", "verify", "enter", "input", "select", "hover", "upload", "navigate", "press",
  "drag", "dragBy", "capture", "detect", "warn", "noop", "switchTab", "openNewTab",
  "openNewTabAndNavigate",
]);

/** A step is doc-derived when its target is tagged "(doc step)" per the traceability rule. */
const isDocStep = (target?: string): boolean => !!target && /\(doc step\)/i.test(target);

export function staticValidate(project: string, files: FlowFile[]): Finding[] {
  const findings: Finding[] = [];
  const idToPaths = new Map<string, string[]>();
  const inventory = new Set(loadDocsInventory(project).map(normalizeUrl));
  const sources = new Set<string>();

  for (const { path: fp, flow } of files) {
    for (const key of REQUIRED_KEYS) {
      if (flow[key] === undefined) {
        findings.push({
          severity: "high",
          code: "missing-required-key",
          message: `Flow is missing required key \`${key}\`.`,
          flow: fp,
          autoFixable: false,
        });
      }
    }

    if (flow.id) idToPaths.set(flow.id, [...(idToPaths.get(flow.id) ?? []), fp]);

    // Traceability: without `source` the flow can never be validated against a doc.
    if (!flow.source) {
      findings.push({
        severity: "high",
        code: "missing-source",
        message: "No `source` doc URL — this flow can never be drift-checked.",
        flow: fp,
        autoFixable: false,
      });
    } else {
      const norm = normalizeUrl(flow.source);
      sources.add(norm);
      if (inventory.size > 0 && !inventory.has(norm)) {
        findings.push({
          severity: "low",
          code: "source-not-in-docs-json",
          message: `\`source\` is absent from flows/${project}/docs.json, so docs-audit does not crawl it. Run \`npm run sync:docs-urls\`.`,
          flow: fp,
          actual: flow.source,
          autoFixable: false,
        });
      }
    }

    const steps = Array.isArray(flow.steps) ? flow.steps : [];
    if (flow.type === "executable" && steps.length === 0) {
      findings.push({
        severity: "medium",
        code: "executable-without-steps",
        message: "Type is `executable` but `steps` is empty.",
        flow: fp,
        autoFixable: false,
      });
    }

    steps.forEach((step, i) => {
      if (!step.action) {
        findings.push({
          severity: "high",
          code: "step-missing-action",
          message: `Step ${i + 1} has no \`action\`.`,
          flow: fp,
          stepIndex: i,
          autoFixable: false,
        });
      } else if (!KNOWN_ACTIONS.has(step.action)) {
        findings.push({
          severity: "medium",
          code: "unknown-action",
          message: `Step ${i + 1} uses unrecognized action \`${step.action}\`.`,
          flow: fp,
          stepIndex: i,
          actual: step.action,
          autoFixable: false,
        });
      }

      if (!step.target && step.action !== "noop" && step.action !== "warn") {
        findings.push({
          severity: "medium",
          code: "step-missing-target",
          message: `Step ${i + 1} (\`${step.action}\`) has no \`target\`.`,
          flow: fp,
          stepIndex: i,
          autoFixable: false,
        });
      }

      // doc-step-parity: contains-matching hides doc wording changes. This is exactly the
      // mechanism that lets "+ New Project" pass a flow asserting "New Project".
      const expected = (step.expected ?? {}) as Record<string, unknown>;
      // "exact"/"equals" are strict; "exists" is a presence check, not a label comparison.
      // Everything else — "contains", or an arbitrary substring used as the value — is loose.
      const STRICT_MATCH = new Set(["exact", "equals", "exists"]);
      const labelMatchValue =
        typeof step.labelMatch === "string"
          ? step.labelMatch
          : typeof expected.labelMatch === "string"
            ? expected.labelMatch
            : undefined;
      const usesLooseMatch = labelMatchValue !== undefined && !STRICT_MATCH.has(labelMatchValue);
      const hasLabelEquals = typeof step.labelEquals === "string" || typeof expected.labelEquals === "string";

      if (usesLooseMatch && hasLabelEquals && isDocStep(step.target)) {
        findings.push({
          severity: "medium",
          code: "loose-label-match-on-doc-step",
          message: `Step ${i + 1} verifies a doc-derived label with \`labelMatch: "${labelMatchValue}"\`. doc-step-parity.mdc requires exact \`labelEquals\` — loose matching masks doc wording drift.`,
          flow: fp,
          stepIndex: i,
          actual: String(step.labelEquals ?? expected.labelEquals ?? ""),
          autoFixable: false,
        });
      }

      // Placement checks must be doc-stated, never inferred from the app.
      if (typeof expected.within === "string" && !isDocStep(step.target)) {
        findings.push({
          severity: "low",
          code: "placement-check-on-untagged-step",
          message: `Step ${i + 1} asserts placement \`within: "${expected.within}"\` but its target is not tagged "(doc step)", so the doc basis is unclear.`,
          flow: fp,
          stepIndex: i,
          autoFixable: false,
        });
      }
    });
  }

  for (const [id, paths] of idToPaths) {
    if (paths.length > 1) {
      findings.push({
        severity: "high",
        code: "duplicate-flow-id",
        message: `Flow id \`${id}\` is used by ${paths.length} files: ${paths.join(", ")}. Test grep by id becomes ambiguous.`,
        autoFixable: false,
      });
    }
  }

  // Inventory URLs with no flow at all — coverage gaps, not drift.
  for (const url of inventory) {
    if (!sources.has(url)) {
      findings.push({
        severity: "info",
        code: "url-without-flow",
        message: `Listed in flows/${project}/docs.json but no flow automates it.`,
        actual: url,
        autoFixable: false,
      });
    }
  }

  return findings;
}

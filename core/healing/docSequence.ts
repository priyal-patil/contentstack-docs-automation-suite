// core/healing/docSequence.ts
/**
 * Reports documented instructions that the automation never performs.
 *
 * Everything else in this agent compares one label at a time, which cannot see two whole classes of
 * documentation defect:
 *
 *   - a step the doc describes that the flow never performs (the doc gained a step, or the transcription
 *     dropped one)
 *   - steps the doc lists in a different order than the flow runs them
 *
 * This does not show up as a failing selector, so it is invisible to the retry pipeline: a flow can pass
 * completely while the page it claims to validate documents an instruction nobody ever tests.
 *
 * IMPORTANT FRAMING. A finding here is a COVERAGE gap, not proof of a documentation defect. Measured over
 * 16 real flows, the surviving findings were mostly a doc page carrying a SECOND procedure the flow never
 * set out to cover — app-hosting documents disconnecting a Launch project, and that flow only tests
 * connecting. That is worth knowing (nothing verifies those instructions) but it is not drift, and it must
 * not reach a technical writer as "your doc is wrong".
 *
 * Deliberately conservative. Doc prose is not a machine-readable list, so this reports *candidates for a
 * human to read*, never automatic edits. It only considers imperative instructions it can extract with
 * reasonable confidence, and says so when extraction looks unreliable.
 */
import * as cheerio from "cheerio";

export type DocStep = {
  /** 1-based position within the document's procedure. */
  position: number;
  text: string;
  /** Bold/emphasised control labels inside the instruction — what the flow would target. */
  labels: string[];
};

export type SequenceFinding =
  | {
      kind: "not-covered-by-automation";
      docPosition: number;
      docText: string;
      labels: string[];
      recommendation: string;
    }
  | {
      kind: "order-differs";
      docPosition: number;
      flowStepNumber: number;
      label: string;
      recommendation: string;
    };

export type SequenceReport = {
  docUrl: string;
  reliable: boolean;
  docStepCount: number;
  matchedCount: number;
  findings: SequenceFinding[];
  note: string;
};

/** Verbs that begin a UI instruction. Used to tell instructions from surrounding prose. */
const IMPERATIVE =
  /^(click|select|choose|enter|type|navigate|go to|open|expand|toggle|enable|disable|switch|upload|drag|hover|press|scroll|set|add|remove|delete|save|publish|confirm|check|uncheck|fill)\b/i;

/**
 * Extract the documented procedure as an ordered list.
 *
 * Prefers real `<ol><li>` markup, which these pages use for "Steps for Execution". Falls back to
 * imperative sentences only when no ordered list exists, and marks the result unreliable so callers can
 * discount it.
 */
export function extractDocSteps(html: string): { steps: DocStep[]; reliable: boolean } {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, noscript").remove();

  // Choose the PROCEDURE list, not the first <ol> on the page. These docs open with a
  // "You will learn the following" / objectives list whose items ("Create a Brand Kit: Create a
  // centralized repository…") read like instructions but describe outcomes. Picking that list produced
  // false "step not automated" findings on get-started-with-brand-kit. The procedure reliably follows a
  // "Steps for Execution" heading, so anchor on that and fall back to the LAST substantial list, since
  // procedures come after objectives.
  const ols = $("ol").toArray().filter((ol) => $(ol).find("> li").length >= 2);
  const afterStepsHeading = ols.filter((ol) => {
    const before = $(ol).prevAll("h1,h2,h3,h4").first().text() + " " + ($(ol).parent().prevAll("h1,h2,h3,h4").first().text() || "");
    return /steps for execution|steps? given below|perform the following/i.test(before);
  });
  const chosen = afterStepsHeading.length ? [afterStepsHeading[0]] : ols.length ? [ols[ols.length - 1]] : [];

  const fromList: DocStep[] = [];
  chosen.forEach((ol) => {
    const items = $(ol).find("> li");
    if (items.length < 2) return;
    items.each((idx, li) => {
      const text = $(li).clone().children("ol,ul").remove().end().text().replace(/\s+/g, " ").trim();
      if (!text) return;
      const labels: string[] = [];
      $(li)
        .find("b, strong, code")
        .each((_j, b) => {
          const t = $(b).text().replace(/\s+/g, " ").trim();
          if (t && t.length <= 60 && !labels.includes(t)) labels.push(t);
        });
      fromList.push({ position: fromList.length + 1, text: text.slice(0, 400), labels });
    });
  });

  if (fromList.length >= 2) return { steps: fromList, reliable: true };

  // Fallback: imperative sentences from the body. Lower confidence by construction.
  const body = ($("main").length ? $("main") : $("body")).text().replace(/\s+/g, " ").trim();
  const sentences = body
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => IMPERATIVE.test(s) && s.length > 12 && s.length < 400);
  const steps = sentences.map((text, i) => ({ position: i + 1, text, labels: [] }));
  return { steps, reliable: false };
}

/** Normalise for comparison: case, punctuation and whitespace insensitive. */
const norm = (s: string) =>
  s
    .replace(/\(doc step\)/gi, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/** Does any flow step plausibly perform this documented instruction? */
function findFlowStepFor(
  docStep: DocStep,
  flowSteps: Array<{ target?: string; expected?: { labelEquals?: string; modalTitle?: string } }>
): number | undefined {
  const needles = [...docStep.labels]
    .filter((l) => l.length >= 3)
    .map(norm)
    .filter(Boolean);
  if (!needles.length) return undefined;

  for (let i = 0; i < flowSteps.length; i++) {
    const s = flowSteps[i];
    const hay = norm(
      [s.target ?? "", s.expected?.labelEquals ?? "", s.expected?.modalTitle ?? ""].join(" ")
    );
    if (!hay) continue;
    if (needles.some((n) => hay.includes(n))) return i + 1; // 1-based flow step number
  }
  return undefined;
}

/**
 * Compare a documented procedure with the flow that transcribes it.
 *
 * Only documented steps carrying an identifiable control label are considered — an instruction like
 * "You will get a success message" names nothing to automate and is not a defect.
 */
export function compareDocSequence(args: {
  docUrl: string;
  html: string;
  flowSteps: Array<{ target?: string; expected?: { labelEquals?: string; modalTitle?: string } }>;
}): SequenceReport {
  const { steps: docSteps, reliable } = extractDocSteps(args.html);
  const findings: SequenceFinding[] = [];

  const actionable = docSteps.filter((d) => d.labels.some((l) => l.length >= 3));
  const matches: Array<{ docPosition: number; flowStepNumber: number; label: string }> = [];

  for (const d of actionable) {
    const flowStepNumber = findFlowStepFor(d, args.flowSteps);
    if (flowStepNumber === undefined) {
      findings.push({
        kind: "not-covered-by-automation",
        docPosition: d.position,
        docText: d.text,
        labels: d.labels,
        recommendation:
          `The doc's step ${d.position} refers to ${d.labels.map((l) => `"${l}"`).join(" / ")}, and no flow ` +
          `step targets it, so nothing verifies that instruction. Most often the page documents a second ` +
          `procedure this flow was never meant to cover; less often the doc gained a step, or the ` +
          `transcription dropped one. Read it before concluding the doc is wrong.`,
      });
    } else {
      matches.push({ docPosition: d.position, flowStepNumber, label: d.labels[0] });
    }
  }

  // ORDER CHECKING IS DELIBERATELY NOT IMPLEMENTED.
  //
  // A first attempt flagged 2 order differences across 16 flows and BOTH were false. Matching a doc label
  // to a flow step is greedy — it takes the first step whose text contains the label — and generic labels
  // ("Actions", "Delete Brand Kit") occur in several steps, so one bad match drags the running position
  // and makes every later step look reordered. Reporting misordered steps to a technical writer on that
  // basis would be worse than staying silent, so this reports only steps that appear NOWHERE in the flow.
  // Order detection needs one-to-one matching (each doc step consuming a distinct flow step) before it is
  // trustworthy.

  return {
    docUrl: args.docUrl,
    reliable,
    docStepCount: docSteps.length,
    matchedCount: matches.length,
    findings,
    note: reliable
      ? `${actionable.length} actionable instruction(s) read from the document's ordered list.`
      : `No ordered list found; instructions were guessed from prose, so these findings are low confidence ` +
        `and should be read as hints only.`,
  };
}

/** Markdown for the report. Kept explicitly advisory — these are never auto-applied. */
export function renderSequenceFindings(reports: SequenceReport[]): string[] {
  const withFindings = reports.filter((r) => r.findings.length);
  if (!withFindings.length) return [];

  const lines = [
    `## Documented instructions nothing verifies (coverage, not drift)`,
    ``,
    `Found by comparing the document's ordered procedure with the flow that transcribes it — a gap no`,
    `failing selector can reveal, since the flow passes while these instructions go untested.`,
    ``,
    `**This is a coverage list, not a defect list.** Most entries are a page carrying a second procedure the`,
    `flow never set out to cover. Read before concluding a doc is wrong; nothing here is auto-applied.`,
    ``,
  ];
  for (const r of withFindings) {
    lines.push(`### ${r.docUrl}`);
    if (!r.reliable) lines.push(`- _${r.note}_`);
    for (const f of r.findings) {
      if (f.kind === "not-covered-by-automation") {
        lines.push(`- **doc step ${f.docPosition} is not covered** — ${f.labels.map((l) => `"${l}"`).join(" / ")}`);
        lines.push(`  - > ${f.docText.slice(0, 240)}`);
      } else {
        lines.push(
          `- **order differs** — "${f.label}" is doc step ${f.docPosition} but flow step ${f.flowStepNumber}`
        );
      }
      lines.push(`  - ${f.recommendation}`);
    }
    lines.push(``);
  }
  return lines;
}

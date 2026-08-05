// core/healing/elementMatcher.ts
/**
 * The riskiest component in the agent, and therefore the one with direct unit tests
 * (`tests/healing/elementMatcher.unit.spec.ts`).
 *
 * Pure function: given the element we were looking for (as captured in a previous DOM snapshot, plus
 * the doc's expected label) and the elements present in the live DOM, propose ranked replacements.
 *
 * Tiers run cheapest → most expensive and stop as soon as one clears the threshold:
 *   1 original-selector  1.00  transient render flake
 *   2 stable-attribute   0.85-0.95  data-test-id / aria-label / name / role+text survive class churn
 *   3 structural         0.65-0.80  same tag + same-ish DOM path + similar surrounding text
 *   4 fuzzy-text         0.50-0.85  accessible name vs the doc's expected label
 *
 * Nothing here trusts its own verdict — `repairLoop` only accepts a candidate if replaying the step
 * in a real browser actually works.
 */
import type { Candidate, MatchStrategy, StructuredElement } from "./types";

/** Levenshtein distance, iterative two-row form. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = new Array<number>(b.length + 1);
  let cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[b.length];
}

/** Normalised similarity in 0..1. */
export function similarity(a: string, b: string): number {
  const x = normaliseLabel(a);
  const y = normaliseLabel(b);
  if (!x && !y) return 1;
  if (!x || !y) return 0;
  if (x === y) return 1;
  const max = Math.max(x.length, y.length);
  return 1 - levenshtein(x, y) / max;
}

/**
 * Normalise a label for comparison: lowercase, strip the repo's `(doc step)` suffix, drop
 * punctuation, collapse whitespace.
 */
export function normaliseLabel(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/\(doc step\)/gi, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Similarity of two DOM paths, comparing segments from the leaf backwards. */
export function pathSimilarity(a: string, b: string): number {
  const x = a.split(">").reverse();
  const y = b.split(">").reverse();
  const n = Math.max(x.length, y.length);
  if (!n) return 0;
  let same = 0;
  for (let i = 0; i < Math.min(x.length, y.length); i++) {
    if (x[i] === y[i]) same += 1;
    else {
      // Same tag but a different nth-of-type still counts as a partial structural match.
      const tagX = x[i].replace(/:nth-of-type\(\d+\)/, "");
      const tagY = y[i].replace(/:nth-of-type\(\d+\)/, "");
      if (tagX === tagY) same += 0.5;
      break;
    }
  }
  return same / n;
}

/** Escape a string for use inside a CSS attribute-selector value. */
function cssQuote(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Escape a string for a Playwright `:has-text("…")` argument. */
function textQuote(v: string): string {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Ids/classes that look framework-generated are unstable — never build a selector on them.
 * e.g. `css-1q2w3e`, `ember1234`, `react-select-3-input`, long hex/uuid fragments.
 */
export function looksGenerated(v: string | undefined): boolean {
  if (!v) return true;
  return (
    /^(css|sc|jss|emotion|ember|mui|ant)[-_]?\d/i.test(v) ||
    /^[a-f0-9]{8,}$/i.test(v) ||
    /\b\d{4,}\b/.test(v) ||
    /[a-f0-9]{6,}-[a-f0-9]{4,}/i.test(v)
  );
}

/**
 * Build the most stable selector we can for an element, preferring attributes that survive
 * restyling. Returns undefined when nothing stable enough exists.
 */
export function synthesiseSelector(el: StructuredElement): string | undefined {
  if (el.testId) return `[data-test-id="${cssQuote(el.testId)}"], [data-testid="${cssQuote(el.testId)}"]`;
  if (el.ariaLabel) return `${el.tag}[aria-label="${cssQuote(el.ariaLabel)}"]`;
  if (el.name) return `${el.tag}[name="${cssQuote(el.name)}"]`;
  if (el.id && !looksGenerated(el.id)) return `#${el.id}`;
  if (el.placeholder) return `${el.tag}[placeholder="${cssQuote(el.placeholder)}"]`;
  if (el.title) return `${el.tag}[title="${cssQuote(el.title)}"]`;
  if (el.text && el.text.length <= 60) return `${el.tag}:has-text("${textQuote(el.text)}")`;

  const stableClass = el.classes.find((c) => !looksGenerated(c));
  if (stableClass) return `${el.tag}.${stableClass}`;
  return undefined;
}

export type MatchInput = {
  /** The element as captured in the previous snapshot, if we had one. */
  reference?: StructuredElement;
  /** The doc's expected label for this step (the flow step's `target`, or `expected.labelEquals`). */
  expectedLabel?: string;
  /** Elements present in the live DOM now. */
  live: StructuredElement[];
  confidenceThreshold: number;
};

/** True when a live element is a usable target (visibility is only known for live extractions). */
const usable = (el: StructuredElement): boolean => el.visible !== false;

/**
 * Every name an element could plausibly be identified by.
 *
 * Deliberately a list rather than a `ariaLabel ?? text ?? …` preference chain. Real apps set junk
 * aria-labels — this one ships `aria-label="aria-button"` on its primary action — and a preference
 * chain then compares the doc's label against that placeholder and discards the element whose visible
 * text is an exact match. Score every name and keep the best.
 */
const accessibleNames = (el: StructuredElement): string[] =>
  [el.ariaLabel, el.text, el.title, el.placeholder].filter((s): s is string => !!s && s.trim().length > 0);

/** Best similarity between `label` and any of the element's names, plus which name won. */
function bestNameMatch(label: string, el: StructuredElement): { sim: number; via?: string } {
  let best = { sim: 0 } as { sim: number; via?: string };
  for (const n of accessibleNames(el)) {
    const s = similarity(label, n);
    if (s > best.sim) best = { sim: s, via: n };
  }
  return best;
}

function mk(
  element: StructuredElement,
  strategy: MatchStrategy,
  confidence: number,
  rationale: string
): Candidate | undefined {
  const selector = synthesiseSelector(element);
  if (!selector) return undefined;
  return { element, strategy, confidence, selector, rationale };
}

/**
 * Rank replacement candidates for a drifted element, best first.
 *
 * Only candidates at or above `confidenceThreshold` are returned as actionable; everything scored is
 * still reported by `rankAll` so genuine-failure reports can list the closest near-misses for triage.
 */
export function findCandidates(input: MatchInput): Candidate[] {
  const { reference, expectedLabel, live, confidenceThreshold } = input;
  const out: Candidate[] = [];
  const pushIf = (c: Candidate | undefined) => {
    if (c && c.confidence >= confidenceThreshold) out.push(c);
  };

  const label = normaliseLabel(expectedLabel ?? reference?.text ?? reference?.ariaLabel);

  // ---- Tier 2: stable attributes carried over from the snapshot ----------------------------------
  if (reference) {
    if (reference.testId) {
      const hit = live.find((e) => e.testId === reference.testId && usable(e));
      pushIf(hit && mk(hit, "stable-attribute", 0.95, `data-test-id "${reference.testId}" unchanged`));
    }
    if (reference.ariaLabel) {
      const hit = live.find((e) => e.ariaLabel === reference.ariaLabel && usable(e));
      pushIf(hit && mk(hit, "stable-attribute", 0.9, `aria-label "${reference.ariaLabel}" unchanged`));
    }
    if (reference.name) {
      const hit = live.find((e) => e.name === reference.name && e.tag === reference.tag && usable(e));
      pushIf(hit && mk(hit, "stable-attribute", 0.88, `${reference.tag}[name="${reference.name}"] unchanged`));
    }
    if (reference.role && reference.text) {
      const hit = live.find(
        (e) => e.role === reference.role && normaliseLabel(e.text) === normaliseLabel(reference.text) && usable(e)
      );
      pushIf(
        hit &&
          mk(hit, "stable-attribute", 0.85, `role "${reference.role}" + exact text "${reference.text}" unchanged`)
      );
    }
  }

  // ---- Tier 3: structural similarity ------------------------------------------------------------
  //
  // Position is corroborating evidence, never identifying evidence on its own. When a control is
  // removed, whatever reflows into its old DOM slot sits at the *identical* path — so matching on
  // position alone happily proposes an unrelated neighbour ("Filter" where "New Brand Kit" used to
  // be). That is the worst failure mode the matcher has, because a confident wrong heal hides genuine
  // doc/app drift. So a structural match must also be textually plausible.
  if (reference) {
    const refName = normaliseLabel(reference.ariaLabel ?? reference.text ?? expectedLabel);

    /**
     * Reject a positional match whose name bears no resemblance to what we sought. Scores every name
     * the element has, for the same reason as tier 4 — a junk aria-label must not be able to veto an
     * element whose visible text is a match.
     */
    const corroborated = (e: StructuredElement): boolean => {
      if (!refName) return true; // nothing to corroborate against; position is all we have
      if (!accessibleNames(e).length) return false; // an unnamed element cannot corroborate
      return bestNameMatch(refName, e).sim >= 0.5;
    };

    const exactPath = live.find(
      (e) => e.domPath === reference.domPath && e.tag === reference.tag && usable(e) && corroborated(e)
    );
    pushIf(
      exactPath &&
        mk(
          exactPath,
          "structural",
          0.8,
          `identical DOM path ${reference.domPath} with a corroborating accessible name`
        )
    );

    let best: { el: StructuredElement; score: number } | undefined;
    for (const e of live) {
      if (e.tag !== reference.tag || !usable(e)) continue;
      if (!corroborated(e)) continue;
      const ps = pathSimilarity(reference.domPath, e.domPath);
      if (ps < 0.7) continue;
      const ss = reference.surroundingText
        ? similarity(reference.surroundingText, e.surroundingText ?? "")
        : 0.5;
      const score = 0.55 + 0.15 * ps + 0.1 * ss;
      if (!best || score > best.score) best = { el: e, score };
    }
    if (best) {
      pushIf(
        mk(
          best.el,
          "structural",
          Math.min(0.79, Number(best.score.toFixed(3))),
          `same <${reference.tag}> at similar DOM position with similar surrounding text`
        )
      );
    }
  }

  // ---- Tier 4: fuzzy text against the doc's expected label ---------------------------------------
  if (label) {
    let best: { el: StructuredElement; sim: number; via?: string } | undefined;
    for (const e of live) {
      if (!usable(e)) continue;
      const m = bestNameMatch(label, e);
      if (m.sim < 0.75) continue;
      if (!best || m.sim > best.sim) best = { el: e, sim: m.sim, via: m.via };
    }
    if (best) {
      // 0.75 similarity floor maps to ~0.76 confidence; an exact match reaches 0.85.
      const confidence = Number(Math.min(0.85, 0.5 + 0.35 * best.sim).toFixed(3));
      pushIf(
        mk(
          best.el,
          "fuzzy-text",
          confidence,
          `name "${best.via}" ≈ doc label "${expectedLabel ?? label}" (similarity ${best.sim.toFixed(2)})`
        )
      );
    }
  }

  // Dedupe by synthesised selector, keeping the highest-confidence entry, then sort best-first.
  const bySelector = new Map<string, Candidate>();
  for (const c of out) {
    const prev = bySelector.get(c.selector);
    if (!prev || c.confidence > prev.confidence) bySelector.set(c.selector, c);
  }
  return [...bySelector.values()].sort((a, b) => b.confidence - a.confidence);
}

/**
 * Every scored candidate regardless of threshold, best-first. Used by genuine-failure reports to
 * show a human the closest non-matching candidates so triage is fast.
 */
export function rankAll(input: MatchInput): Candidate[] {
  return findCandidates({ ...input, confidenceThreshold: 0 });
}

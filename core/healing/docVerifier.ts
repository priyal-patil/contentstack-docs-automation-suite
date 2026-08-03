// core/healing/docVerifier.ts
/**
 * Reconciles the three sources of truth so a finding can name **which one is wrong**.
 *
 *   the DOCUMENT   — what we tell users to do (the thing writers own)
 *   the FLOW JSON  — our machine-readable transcription of that document
 *   the LIVE APP   — what actually exists
 *
 * Finding drift in the *document* is the point of the whole agent; healing selectors only exists to
 * stop stale locators from drowning that signal. So whenever the app disagrees with us, we must go back
 * to the document before reporting, because the answer differs completely:
 *
 *   doc agrees with our JSON, app differs  → the DOC is stale        → report to the writers
 *   doc agrees with the app, our JSON differs → our JSON is stale    → fix the JSON, tell nobody
 *
 * Worked example, verified against the live doc:
 *   Doc:      "click the **+ New Content Type** button"
 *   Flow JSON: expects "+ New Content Type"
 *   App:       renders "New Content Type"
 *   → doc-confirms-flow → the doc should drop the "+". Our JSON is right and is left alone.
 *
 * Severity follows the shape of the difference, not its location:
 *   a wrong/renamed/misplaced label → WARNING (report it, carry on)
 *   the step cannot be performed at all → FAILURE (the flow is genuinely blocked)
 */
import axios from "axios";
import * as cheerio from "cheerio";

export type DocVerdict =
  /** The two sides are the same string — a framework artefact, not drift. */
  | "no-drift"
  /** The doc literally contains what the flow expects, so the app is what changed. */
  | "doc-confirms-flow"
  /** The doc matches the app, not our transcription — our flow JSON is out of date. */
  | "doc-matches-app"
  /** The doc mentions neither wording; a human has to look. */
  | "doc-mentions-neither"
  /** Could not read the doc, so no conclusion is drawn. */
  | "doc-unavailable";

/** Wrong label vs. a step that cannot be performed at all. Drives warning vs failure. */
export type DriftKind = "label-mismatch" | "container-mismatch" | "element-missing";

export type DocCheck = {
  verdict: DocVerdict;
  /** Shape of the difference, so wording drift and location drift can be reported separately. */
  kind?: DriftKind;
  severity: "warning" | "failure";
  docUrl: string;
  /** The sentence from the doc that decided it, for the report. */
  docQuote?: string;
  expectedByFlow?: string;
  seenInApp?: string;
  /** Plain-language instruction for whoever picks this up. */
  recommendation: string;
  /** Present only when our JSON is the stale side. */
  proposedFlowUpdate?: { from: string; to: string };
};

export type DocContent = { url: string; title?: string; text: string; error?: string };

const cache = new Map<string, DocContent>();

/**
 * Fetch and flatten a doc page.
 *
 * Uses axios + cheerio rather than the `contentstack-docs` MCP so this works unattended in CI. The MCP
 * is the better interactive tool; it is not available to a GitHub Actions runner.
 */
export async function fetchDocContent(url: string): Promise<DocContent> {
  const hit = cache.get(url);
  if (hit) return hit;

  if (!/^https?:\/\//i.test(url)) {
    const bad = { url, text: "", error: "no usable doc URL" };
    cache.set(url, bad);
    return bad;
  }

  try {
    const res = await axios.get(url, {
      timeout: 20000,
      headers: { "User-Agent": "docs-qa-healing-agent" },
    });
    const $ = cheerio.load(String(res.data));
    // Strip the parts that are not prose; the app inlines a lot of script into these pages.
    $("script, style, nav, footer, noscript").remove();

    const title = $("h1").first().text().replace(/\s+/g, " ").trim() || $("title").text().trim();
    const body = $("main").length ? $("main").text() : $("body").text();
    const out = { url, title, text: body.replace(/\s+/g, " ").trim() };
    cache.set(url, out);
    return out;
  } catch (err: any) {
    const bad = { url, text: "", error: err?.message ?? String(err) };
    cache.set(url, bad);
    return bad;
  }
}

/**
 * Human-readable phrases a locator is looking for.
 *
 * A step's internal `target` ("Project ID field in Optimizely Configuration") is our own naming and will
 * never appear in the doc verbatim. The doc-facing wording lives inside the locator's text predicates —
 * `:has-text("Project ID")` — so those are what we compare against the document.
 */
export function docPhrasesFromLocator(locator: string | undefined): string[] {
  if (!locator) return [];
  const out: string[] = [];
  const push = (v?: string) => {
    const t = v?.replace(/\s+/g, " ").trim();
    if (t && t.length > 1 && !out.includes(t)) out.push(t);
  };
  for (const m of locator.matchAll(/:(?:has-text|text-is|text)\((['"])(.*?)\1\)/g)) push(m[2]);
  for (const m of locator.matchAll(/\[aria-label\s*[~^$*|]?=\s*(['"])(.*?)\1/g)) push(m[2]);
  // Longest first: the most specific phrase is the most convincing evidence.
  return out.sort((a, b) => b.length - a.length);
}

/**
 * Framework container types, not user-visible labels.
 *
 * `expected.within: "Modal"` describes the *kind* of container a step should be inside, not text a
 * reader would ever see in the doc. Comparing these against the document produces nonsense findings
 * like `doc says "Modal" · app shows "name"`, so they are excluded from doc comparison entirely.
 */
const FRAMEWORK_CONTAINER = /^(modal|dialog|popup|popover|drawer|tooltip|panel|form|page|container)$/i;

export function isFrameworkContainerWord(s: string | undefined): boolean {
  return !!s && FRAMEWORK_CONTAINER.test(s.trim());
}

/** Case/whitespace-insensitive containment, punctuation preserved — the "+" in a label is meaningful. */
export function docContains(docText: string, phrase: string | undefined): boolean {
  if (!phrase) return false;
  const norm = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
  return norm(docText).includes(norm(phrase));
}

/**
 * The document's own wording for `phrase`, with the doc's original casing and punctuation.
 *
 * This is the ONLY sanctioned source for a value written into a flow JSON. The app's rendered text must
 * never be written: the app frequently reports a lower-cased or trimmed variant ("new content type"
 * where the doc says "New Content Type"), and more importantly the flow JSON is our transcription of
 * the *document* — so the document is its spec. Copying from the app would quietly make the test assert
 * whatever the app currently does, which is precisely the drift we exist to detect.
 */
export function exactPhraseFromDoc(docText: string, phrase: string): string | undefined {
  const idx = docText.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return undefined;
  return docText.slice(idx, idx + phrase.length);
}

/**
 * Invariant guard for any proposed flow-JSON edit: the new value must appear verbatim in the document.
 *
 * Called before a write is ever offered. If this returns false the edit is app-derived (or invented) and
 * must be discarded — reporting the drift is correct, silently teaching the test the app's behaviour is
 * not.
 */
export function isSourcedFromDoc(docText: string, proposedValue: string | undefined): boolean {
  return docContains(docText, proposedValue);
}

/** The sentence around the first occurrence of `phrase`, so the report can quote the doc. */
export function quoteFromDoc(docText: string, phrase: string): string | undefined {
  const idx = docText.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return undefined;
  const start = Math.max(0, docText.lastIndexOf(".", idx) + 1);
  const endDot = docText.indexOf(".", idx + phrase.length);
  const end = endDot === -1 ? Math.min(docText.length, idx + 200) : endDot + 1;
  return docText.slice(start, end).trim();
}

/**
 * `Label validation failed: expected "+ New Content Type" (contains), got "new content type".`
 * → { expected: '+ New Content Type', got: 'new content type' }
 */
export function parseLabelMismatch(message: string): { expected: string; got: string } | undefined {
  const m = /expected\s+"([^"]+)"[^"]*?(?:\([^)]*\))?\s*,?\s*got\s+"([^"]*)"/i.exec(message);
  return m ? { expected: m[1], got: m[2] } : undefined;
}

/**
 * `Doc container mismatch: expected within "Left Navigation", but target resolved to "Content Models".`
 */
export function parseContainerMismatch(
  message: string
): { expected: string; resolved: string } | undefined {
  const m = /expected within\s+"([^"]+)".*?resolved to\s+"([^"]*)"/i.exec(message);
  return m ? { expected: m[1], resolved: m[2] } : undefined;
}

/**
 * Decide which of the three sources is wrong.
 *
 * Precedence matters: check whether the doc contains the flow's expected wording **first**. The app's
 * wording is frequently a substring of the doc's ("New Content Type" inside "+ New Content Type"), so
 * testing the app's wording first would report the doc as matching the app and wrongly "fix" a flow
 * JSON that was correct all along.
 */
export function reconcile(args: {
  docText: string;
  docUrl: string;
  docError?: string;
  /** What our flow JSON expects (our transcription of the doc). */
  expectedByFlow?: string;
  /** Additional doc-facing phrasings to try, e.g. pulled out of the locator's text predicates. */
  expectedCandidates?: string[];
  /** What the app actually shows, when known. */
  seenInApp?: string;
  kind: DriftKind;
}): DocCheck {
  const { docText, docUrl, docError, seenInApp, kind } = args;
  const candidates = [args.expectedByFlow, ...(args.expectedCandidates ?? [])].filter(
    (s): s is string => !!s && s.trim().length > 0 && !isFrameworkContainerWord(s)
  );
  const expectedByFlow = args.expectedByFlow;

  // A missing step blocks the flow; a wrong name does not.
  const severity: DocCheck["severity"] = kind === "element-missing" ? "failure" : "warning";

  const same = (a?: string, b?: string) =>
    !!a && !!b && a.replace(/\s+/g, " ").trim().toLowerCase() === b.replace(/\s+/g, " ").trim().toLowerCase();

  // The framework reports some mismatches where both sides are the same string (the container name
  // matched but the structural check still failed). That is not documentation drift, and reporting it
  // as "doc says X, app shows X" would bury the real findings.
  // Container mismatches are NOT documentation drift, and treating them as such produced 78 false
  // writer-facing findings in a real sweep. The two sides are not two wordings of the same thing:
  // `expected` is the framework's container concept ("Left Navigation", "Modal", "Top Bar") and
  // `resolved` is the element that was found ("Assets", "name"). A pair like
  // `Left Navigation || Assets` means the target resolved outside the expected container — a
  // selector-scoping assertion about our own test, not a claim about the document. For
  // `delete-an-asset` the doc does say "click the Assets icon" and the app has it: nothing is wrong.
  if (kind === "container-mismatch") {
    return {
      verdict: "no-drift",
      kind,
      severity: "warning",
      docUrl,
      expectedByFlow: args.expectedByFlow,
      seenInApp,
      recommendation: `Not documentation drift — the step resolved outside the expected container ("${args.expectedByFlow}" → "${seenInApp}"). This is a selector-scoping assertion in the flow, so review the step's \`expected.within\`, not the doc.`,
    };
  }

  if (same(args.expectedByFlow, seenInApp)) {
    return {
      verdict: "no-drift",
      kind,
      severity: "warning",
      docUrl,
      expectedByFlow: args.expectedByFlow,
      seenInApp,
      recommendation: `Not documentation drift — the doc and the app both say "${seenInApp}". The step failed a structural check, not a wording check.`,
    };
  }

  if (docError || !docText) {
    return {
      verdict: "doc-unavailable",
      kind,
      severity,
      docUrl,
      expectedByFlow,
      seenInApp,
      recommendation: `Could not read the doc (${docError ?? "empty"}) — verify manually against ${docUrl}.`,
    };
  }

  // First phrasing the doc actually uses wins; see the precedence note above.
  const matched = candidates.find((c) => docContains(docText, c));
  const docHasApp = docContains(docText, seenInApp);

  if (matched) {
    const quote = quoteFromDoc(docText, matched);
    return {
      verdict: "doc-confirms-flow",
      kind,
      severity,
      docUrl,
      docQuote: quote,
      // Report the phrasing the doc actually uses, which is the evidence a writer needs.
      expectedByFlow: matched,
      seenInApp,
      recommendation:
        // Only claim the doc is wrong when BOTH sides are known: the doc's wording and the app's. For a
        // plain "not found" we know one side only, and the cause could equally be an app change, a
        // renamed control, or the step running on the wrong screen. Asserting "the doc is out of date"
        // on that evidence would send writers to edit pages that are actually correct.
        kind === "element-missing"
          ? `The doc documents "${matched}" but it could not be found in the app at this step. Confirm whether the app removed or renamed it, or whether the step ran on the wrong screen, before editing the doc.`
          : seenInApp
            ? `THE DOC IS OUT OF DATE. It says "${matched}" but the app shows "${seenInApp}". Update the doc wording.`
            : `The doc documents "${matched}" and the app no longer matches it — needs confirmation.`,
    };
  }

  if (docHasApp && seenInApp) {
    // Take the replacement from the DOCUMENT, never from the app — see `exactPhraseFromDoc`. In this
    // branch the doc happens to contain the app's wording, but the value written must still be the
    // doc's own text (correct casing and punctuation), because the doc is the flow JSON's spec.
    const docWording = exactPhraseFromDoc(docText, seenInApp);
    const sourced = isSourcedFromDoc(docText, docWording);

    return {
      verdict: "doc-matches-app",
      kind,
      severity,
      docUrl,
      docQuote: quoteFromDoc(docText, seenInApp),
      expectedByFlow,
      seenInApp,
      recommendation: `OUR FLOW JSON IS OUT OF DATE — the doc documents "${docWording ?? seenInApp}", our flow expects "${expectedByFlow}". No doc change needed; update the flow definition to the doc's wording.`,
      // Only offered when the value provably comes from the document.
      ...(expectedByFlow && docWording && sourced
        ? { proposedFlowUpdate: { from: expectedByFlow, to: docWording } }
        : {}),
    };
  }

  return {
    verdict: "doc-mentions-neither",
    kind,
    severity,
    docUrl,
    expectedByFlow,
    seenInApp,
    recommendation: seenInApp
      ? `The doc mentions neither "${candidates[0] ?? "(nothing)"}" nor "${seenInApp}". Either the doc was rewritten or the flow step is wrong — needs a human.`
      : `The doc does not mention ${candidates.length ? candidates.map((c) => `"${c}"`).join(" or ") : "the expected wording"}. Either the doc was rewritten or the flow step is wrong — needs a human.`,
  };
}

/** One-line rendering for the report. */
export function renderDocCheck(c: DocCheck): string {
  if (c.verdict === "no-drift") return `**NO DRIFT** — ${c.recommendation}`;
  const tag =
    c.verdict === "doc-confirms-flow"
      // A confident verdict needs both sides. See the note in `reconcile`.
      ? c.seenInApp
        ? "DOC OUT OF DATE"
        : "NOT FOUND IN APP — VERIFY"
      : c.verdict === "doc-matches-app"
        ? "FLOW JSON OUT OF DATE"
        : c.verdict === "doc-mentions-neither"
          ? "NEEDS REVIEW"
          : "DOC UNREADABLE";
  return `**${tag}** — ${c.recommendation}${c.docQuote ? `\n  > ${c.docQuote}` : ""}`;
}

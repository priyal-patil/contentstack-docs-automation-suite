// tests/healing/elementMatcher.unit.spec.ts
/**
 * Unit tests for the element-recovery matcher — the riskiest component in the healing agent.
 *
 * These are pure tests: no browser, no live app. `extractFromHtml` parses the fixture pairs in
 * `data/fixtures/healing/` with cheerio, producing exactly the same `StructuredElement[]` shape that
 * a live page would, so the matcher under test is the real one.
 *
 * The fixtures simulate the four drift modes that actually occur:
 *   renamed class · moved element · changed label text · removed entirely
 *
 * Run:  npx playwright test --project=healing
 */
import fs from "fs";
import path from "path";
import { test, expect } from "@playwright/test";
import { extractFromHtml } from "../../core/healing/domExtract";
import {
  findCandidates,
  levenshtein,
  looksGenerated,
  normaliseLabel,
  pathSimilarity,
  similarity,
  synthesiseSelector,
} from "../../core/healing/elementMatcher";
import { referenceFromSelector, enrichFromSnapshot } from "../../core/healing/reference";
import {
  reconcile,
  isSourcedFromDoc,
  docPhrasesFromLocator,
  isFrameworkContainerWord,
} from "../../core/healing/docVerifier";

const FIXTURES = path.resolve(__dirname, "../../data/fixtures/healing");
const load = (name: string) => extractFromHtml(fs.readFileSync(path.join(FIXTURES, name), "utf8"));

/** The selector chain the BrandKit flow was actually authored with. */
const AUTHORED_CHAIN =
  '[data-test-id="brand-kit-click-btn-primary-action-homepage-add-brand-kit"], button:has-text("New Brand Kit")';
const EXPECTED_LABEL = "New Brand Kit";
const THRESHOLD = 0.6;

/** Reference as the agent builds it in production: from the failed chain, enriched by the good snapshot. */
function buildReference() {
  const ref = referenceFromSelector(AUTHORED_CHAIN, EXPECTED_LABEL);
  expect(ref, "a reference must be derivable from the authored chain").toBeTruthy();
  return enrichFromSnapshot(ref!, [path.join(FIXTURES, "brandkit-listing.before.html")]);
}

test.describe("matcher primitives", () => {
  test("levenshtein and similarity behave", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("same", "same")).toBe(0);
    expect(similarity("New Brand Kit", "New Brand Kit")).toBe(1);
    expect(similarity("New Brand Kit", "New Brand Kits")).toBeGreaterThan(0.9);
    expect(similarity("New Brand Kit", "Delete Voice Profile")).toBeLessThan(0.5);
  });

  test("normaliseLabel strips the repo's (doc step) suffix and punctuation", () => {
    expect(normaliseLabel("Brand Kits page New Brand Kit primary (doc step)")).toBe(
      "brand kits page new brand kit primary"
    );
    expect(normaliseLabel("Select Stack(s)")).toBe("select stack s");
  });

  test("looksGenerated rejects framework-generated ids and classes", () => {
    expect(looksGenerated("css-1a2b3c4")).toBe(true);
    expect(looksGenerated("ember1042")).toBe(true);
    expect(looksGenerated("a3f9c8e1b7d2")).toBe(true);
    expect(looksGenerated("cs-btn--primary")).toBe(false);
    expect(looksGenerated(undefined)).toBe(true);
  });

  test("pathSimilarity scores leaf-first agreement", () => {
    const a = "html>body>div:nth-of-type(1)>main:nth-of-type(1)>button:nth-of-type(1)";
    expect(pathSimilarity(a, a)).toBe(1);
    expect(pathSimilarity(a, "html>body>section:nth-of-type(9)>span:nth-of-type(4)")).toBeLessThan(0.5);
  });

  test("synthesiseSelector prefers stable attributes and refuses generated ids", () => {
    expect(synthesiseSelector({ tag: "button", classes: [], domPath: "", siblingIndex: 0, testId: "x-y" })).toContain(
      '[data-test-id="x-y"]'
    );
    expect(
      synthesiseSelector({ tag: "button", classes: [], domPath: "", siblingIndex: 0, ariaLabel: "New Brand Kit" })
    ).toBe('button[aria-label="New Brand Kit"]');
    // A hash-like id must never become the selector; fall through to text.
    expect(
      synthesiseSelector({
        tag: "button",
        classes: ["css-2m3n4o"],
        domPath: "",
        siblingIndex: 0,
        id: "ember1042",
        text: "New Brand Kit",
      })
    ).toBe('button:has-text("New Brand Kit")');
  });
});

test.describe("reference construction", () => {
  test("recovers the intended attributes from the authored selector chain", () => {
    const ref = referenceFromSelector(AUTHORED_CHAIN, EXPECTED_LABEL)!;
    expect(ref.testId).toBe("brand-kit-click-btn-primary-action-homepage-add-brand-kit");
    expect(ref.text).toBe("New Brand Kit");
    expect(ref.tag).toBe("button");
  });

  test("enrichment from a known-good snapshot supplies the structural context a selector cannot", () => {
    const bare = referenceFromSelector(AUTHORED_CHAIN, EXPECTED_LABEL)!;
    expect(bare.domPath).toBe("");
    const enriched = buildReference();
    expect(enriched.domPath).toContain("button");
    expect(enriched.surroundingText).toBeTruthy();
  });

  test("returns undefined when there is nothing to go on", () => {
    expect(referenceFromSelector(undefined, undefined)).toBeUndefined();
    expect(referenceFromSelector(".css-1a2b3c4 > div", undefined)).toBeUndefined();
  });
});

test.describe("drift recovery — fixture pairs", () => {
  test("case 1: renamed class — recovered via unchanged data-test-id, high confidence", () => {
    const candidates = findCandidates({
      reference: buildReference(),
      expectedLabel: EXPECTED_LABEL,
      live: load("brandkit-listing.renamed-class.html"),
      confidenceThreshold: THRESHOLD,
    });

    expect(candidates.length).toBeGreaterThan(0);
    const best = candidates[0];
    expect(best.strategy).toBe("stable-attribute");
    expect(best.confidence).toBeGreaterThanOrEqual(0.95);
    expect(best.selector).toContain("brand-kit-click-btn-primary-action-homepage-add-brand-kit");
    // Must not build the selector out of the regenerated class or the hash-like id.
    expect(best.selector).not.toContain("css-");
    expect(best.selector).not.toContain("ember");
  });

  test("case 2: moved element with test-id dropped — recovered via aria-label", () => {
    const candidates = findCandidates({
      reference: buildReference(),
      expectedLabel: EXPECTED_LABEL,
      live: load("brandkit-listing.moved.html"),
      confidenceThreshold: THRESHOLD,
    });

    expect(candidates.length).toBeGreaterThan(0);
    const best = candidates[0];
    expect(best.strategy).toBe("stable-attribute");
    expect(best.selector).toBe('button[aria-label="New Brand Kit"]');
    // The neighbouring Filter button must not win.
    expect(best.selector).not.toContain("Filter");
  });

  test("case 3: changed label text, no stable attributes — recovered via fuzzy text", () => {
    const candidates = findCandidates({
      reference: buildReference(),
      expectedLabel: EXPECTED_LABEL,
      live: load("brandkit-listing.relabelled.html"),
      confidenceThreshold: THRESHOLD,
    });

    expect(candidates.length).toBeGreaterThan(0);
    const best = candidates[0];
    expect(["fuzzy-text", "structural"]).toContain(best.strategy);
    expect(best.selector).toContain("New Brand Kits");
    // Fuzzy matches are never allowed to look as certain as an attribute match.
    expect(best.confidence).toBeLessThan(0.95);
  });

  test("case 4: element removed entirely — MUST NOT invent a candidate", () => {
    const candidates = findCandidates({
      reference: buildReference(),
      expectedLabel: EXPECTED_LABEL,
      live: load("brandkit-listing.removed.html"),
      confidenceThreshold: THRESHOLD,
    });

    // A false positive here would hide genuine doc/app drift behind a fake heal.
    const impostors = candidates.filter((c) => /Filter|Sort|Learn more/i.test(c.selector));
    expect(impostors, `matcher latched onto an unrelated control: ${JSON.stringify(impostors)}`).toHaveLength(0);
    expect(candidates).toHaveLength(0);
  });

  test("an unchanged page still resolves, so healing is idempotent on re-runs", () => {
    const candidates = findCandidates({
      reference: buildReference(),
      expectedLabel: EXPECTED_LABEL,
      live: load("brandkit-listing.before.html"),
      confidenceThreshold: THRESHOLD,
    });
    expect(candidates[0].confidence).toBeGreaterThanOrEqual(0.95);
  });
});

test.describe("junk aria-label must not shadow real text (regression)", () => {
  /**
   * Taken from the live Brand Kits page during the known-answer end-to-end test. The app ships
   * `aria-label="aria-button"` on its primary action, and an unrelated nav button carries
   * `aria-label="brand kit"`. An earlier version compared the doc label against the aria-label only,
   * scored "aria-button" as a mismatch, and reported genuine doc drift for a button that was right
   * there. Names must be scored best-of, not by preference order.
   */
  const LIVE_PAGE: Array<Parameters<typeof findCandidates>[0]["live"][number]> = [
    { tag: "button", role: "button", ariaLabel: "brand kit", testId: "cs-brand kit-button", classes: [], domPath: "html>body>nav:nth-of-type(1)>button:nth-of-type(1)", siblingIndex: 0 },
    { tag: "div", text: "Brand Kits", testId: "cs-page-title", classes: [], domPath: "html>body>main:nth-of-type(1)>div:nth-of-type(1)", siblingIndex: 0 },
    { tag: "div", text: "Brand KitsNew Brand Kit", testId: "cs-page-header", classes: [], domPath: "html>body>main:nth-of-type(1)>div:nth-of-type(2)", siblingIndex: 1 },
    {
      tag: "button", role: "button", text: "New Brand Kit",
      ariaLabel: "aria-button", // ← junk label the app really ships
      testId: "brand-kit-click-btn-primary-action-homepage-add-brand-kit",
      classes: [], domPath: "html>body>main:nth-of-type(1)>div:nth-of-type(2)>button:nth-of-type(1)", siblingIndex: 0,
    },
  ];

  test("recovers the button by its visible text despite the junk aria-label", () => {
    // The authored chain's test id has been renamed away, leaving only the doc's label to go on.
    const ref = referenceFromSelector('[data-test-id="brand-kit-OBSOLETE-renamed-in-v2"]', EXPECTED_LABEL);
    const candidates = findCandidates({
      reference: ref,
      expectedLabel: EXPECTED_LABEL,
      live: LIVE_PAGE,
      confidenceThreshold: THRESHOLD,
    });

    expect(candidates.length, "must recover the button from the doc label alone").toBeGreaterThan(0);
    expect(candidates[0].selector).toContain("brand-kit-click-btn-primary-action-homepage-add-brand-kit");
  });

  test("the similarly-named nav button and page heading are not mistaken for it", () => {
    const ref = referenceFromSelector('[data-test-id="brand-kit-OBSOLETE-renamed-in-v2"]', EXPECTED_LABEL);
    const best = findCandidates({
      reference: ref,
      expectedLabel: EXPECTED_LABEL,
      live: LIVE_PAGE,
      confidenceThreshold: THRESHOLD,
    })[0];

    expect(best.selector).not.toContain("cs-brand kit-button");
    expect(best.selector).not.toContain("cs-page-title");
    expect(best.selector).not.toContain("cs-page-header");
  });
});

test.describe("doc reconciliation — the document is the spec for the flow JSON", () => {
  /** Real sentence from https://www.contentstack.com/docs/developers/marketplace-apps/optimizely */
  const DOC =
    "Go to your stack, click the Content Models icon in the left navigation panel, and click the " +
    "+ New Content Type button. If you want to create a new content type, select Create New.";

  test("doc agrees with our flow → the DOC is the stale side, JSON untouched", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "+ New Content Type",
      seenInApp: "new content type",
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-confirms-flow");
    expect(c.severity).toBe("warning"); // a wrong name is a warning, not a failure
    expect(c.recommendation).toContain("DOC IS OUT OF DATE");
    // Nothing may be proposed against our flow definition when the flow already matches the doc.
    expect(c.proposedFlowUpdate).toBeUndefined();
  });

  test("precedence: the app's wording being a substring must not flip the verdict", () => {
    // "New Content Type" is a substring of the doc's "+ New Content Type". Checking the app's wording
    // first would report doc-matches-app and wrongly rewrite a correct flow JSON.
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "+ New Content Type",
      seenInApp: "New Content Type",
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-confirms-flow");
    expect(c.proposedFlowUpdate).toBeUndefined();
  });

  test("our flow disagrees with the doc → update the JSON, using the DOC's wording", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Add Content Type", // stale transcription, absent from the doc
      seenInApp: "new content type", // app text: lower-cased
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-matches-app");
    expect(c.proposedFlowUpdate).toBeDefined();
    expect(c.proposedFlowUpdate!.from).toBe("Add Content Type");
    // Must be the doc's casing, NOT the app's lower-cased string.
    expect(c.proposedFlowUpdate!.to).toBe("New Content Type");
    expect(c.proposedFlowUpdate!.to).not.toBe("new content type");
  });

  test("a proposed JSON value must always appear verbatim in the document", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Add Content Type",
      seenInApp: "new content type",
      kind: "label-mismatch",
    });
    expect(isSourcedFromDoc(DOC, c.proposedFlowUpdate!.to)).toBe(true);
  });

  test("app-only wording is NEVER proposed as a flow update", () => {
    // The app renamed the control to something the doc has never mentioned. That is doc drift to report,
    // not a licence to teach the test whatever the app now does.
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Add Content Type",
      seenInApp: "Create Model v2", // exists only in the app
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-mentions-neither");
    expect(c.proposedFlowUpdate).toBeUndefined();
    expect(isSourcedFromDoc(DOC, "Create Model v2")).toBe(false);
  });

  test("a step that cannot be performed is a failure, not a warning", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedCandidates: ["+ New Content Type"],
      kind: "element-missing",
    });
    expect(c.severity).toBe("failure");
    // With only one side known, do not assert the doc is wrong.
    expect(c.recommendation).not.toContain("DOC IS OUT OF DATE");
    expect(c.recommendation).toContain("Confirm");
  });

  test("locator text predicates supply the doc-facing phrases", () => {
    const phrases = docPhrasesFromLocator(
      'label:has-text("Project ID"), *:text-is("Snippet Details"), [aria-label="Copy"]'
    );
    expect(phrases).toContain("Project ID");
    expect(phrases).toContain("Snippet Details");
    expect(phrases).toContain("Copy");
    // Longest first, so the most specific evidence is preferred.
    expect(phrases[0]).toBe("Snippet Details");
  });

  test("identical sides are NOT drift (regression)", () => {
    // The framework emits mismatches where both sides are the same string — the container name matched
    // but a structural check still failed. Reporting `doc says "Assets" · app shows "Assets"` as drift
    // inflated a real sweep from a handful of findings to 79 and buried the genuine ones.
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Assets",
      seenInApp: "Assets",
      kind: "container-mismatch",
    });
    expect(c.verdict).toBe("no-drift");
    expect(c.proposedFlowUpdate).toBeUndefined();
  });

  test("case-only differences are also not drift", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Settings",
      seenInApp: "settings",
      kind: "container-mismatch",
    });
    expect(c.verdict).toBe("no-drift");
  });

  test("framework container words are never treated as doc wording (regression)", () => {
    // `expected.within: "Modal"` is a container *type*, not text any reader sees. Comparing it against
    // the doc produced the nonsense finding `doc says "Modal" · app shows "name"`.
    expect(isFrameworkContainerWord("Modal")).toBe(true);
    expect(isFrameworkContainerWord("dialog")).toBe(true);
    expect(isFrameworkContainerWord("Left Navigation")).toBe(false);
    expect(isFrameworkContainerWord("+ New Content Type")).toBe(false);

    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Modal",
      seenInApp: "name",
      kind: "container-mismatch",
    });
    // "Modal" must not be used as doc evidence, so no confident verdict can be reached.
    expect(c.verdict).not.toBe("doc-confirms-flow");
    expect(c.proposedFlowUpdate).toBeUndefined();
  });

  test("an unreadable doc yields no verdict and no proposed edit", () => {
    const c = reconcile({
      docText: "",
      docUrl: "https://example.test/doc",
      docError: "timeout",
      expectedByFlow: "+ New Content Type",
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-unavailable");
    expect(c.proposedFlowUpdate).toBeUndefined();
  });
});

test.describe("guardrails", () => {
  test("invisible elements are never proposed", () => {
    const live = load("brandkit-listing.renamed-class.html").map((e) =>
      e.testId ? { ...e, visible: false } : e
    );
    const candidates = findCandidates({
      reference: buildReference(),
      expectedLabel: EXPECTED_LABEL,
      live,
      confidenceThreshold: THRESHOLD,
    });
    expect(candidates.every((c) => !c.selector.includes("brand-kit-click-btn-primary"))).toBe(true);
  });

  test("raising the threshold suppresses weak matches", () => {
    const live = load("brandkit-listing.relabelled.html");
    const ref = buildReference();
    expect(findCandidates({ reference: ref, expectedLabel: EXPECTED_LABEL, live, confidenceThreshold: 0.6 }).length)
      .toBeGreaterThan(0);
    expect(findCandidates({ reference: ref, expectedLabel: EXPECTED_LABEL, live, confidenceThreshold: 0.95 }))
      .toHaveLength(0);
  });
});

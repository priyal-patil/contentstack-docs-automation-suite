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
import {
  referenceFromSelector,
  enrichFromSnapshot,
  docFacingLabel,
  looksLikeUiLabel,
} from "../../core/healing/reference";
import { checkFixtureFailure, extractFixtureToken } from "../../core/healing/fixtureCheck";
import { checkPrecondition, checkActionTimedOutAfterVerify } from "../../core/healing/preconditionCheck";
import { applyFlowLabelUpdate, assertFlowWritable } from "../../core/healing/flowJsonWriter";
import {
  reconcile,
  isSourcedFromDoc,
  docPhrasesFromLocator,
  isFrameworkContainerWord,
  sameIgnoringIconGlyph,
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

  // NB: deliberately not a "+ …" label. A leading-glyph difference is a transcription artefact, not
  // drift — see the icon-glyph describe block below.
  test("doc agrees with our flow → the DOC is the stale side, JSON untouched", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Create New",
      seenInApp: "make new",
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-confirms-flow");
    expect(c.severity).toBe("warning"); // a wrong name is a warning, not a failure
    expect(c.recommendation).toContain("DOC IS OUT OF DATE");
    // Nothing may be proposed against our flow definition when the flow already matches the doc.
    expect(c.proposedFlowUpdate).toBeUndefined();
  });

  test("precedence: the app's wording being a substring must not flip the verdict", () => {
    // "Create" is a substring of the doc's "Create New". Checking the app's wording first would report
    // doc-matches-app and wrongly rewrite a flow JSON that was correct.
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "Create New",
      seenInApp: "Create",
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

test.describe("missing test fixtures are not documentation drift", () => {
  /** Verbatim from the failed BrandKit run 30776076221 (13 of 14 failures were this). */
  const REAL_ERROR =
    "expect(locator).toBeVisible() failed\n\n" +
    "Locator: locator('a.brand-kit-card-link').filter({ hasText: /AUTO-CBK-/i }).first()\n" +
    "Expected: visible\nTimeout: 120000ms\nError: element(s) not found";

  test("recognises a generated fixture id in the failure", () => {
    expect(extractFixtureToken(REAL_ERROR)).toBe("AUTO-CBK-");
    expect(extractFixtureToken('locator("button:has-text(\\"Publish\\")")')).toBeUndefined();
  });

  test("an un-substituted template token counts as a fixture problem", () => {
    expect(extractFixtureToken('hasText: "AUTO-BK-{unique5}"')).toBe("{unique5}");
  });

  test("classifies the real BrandKit failure as a fixture problem, not drift", () => {
    const v = checkFixtureFailure({
      errorMessage: REAL_ERROR,
      attemptedLocator: "a.brand-kit-card-link",
    });
    expect(v.isFixtureFailure).toBe(true);
    expect(v.fixtureToken).toBe("AUTO-CBK-");
  });

  test("ordinary locator drift is NOT misread as a fixture problem", () => {
    // Must not swallow the case the agent exists to fix.
    const v = checkFixtureFailure({
      errorMessage:
        'expect(locator).toBeVisible() failed\n\nLocator: locator(\'[data-test-id="brand-kit-OBSOLETE"]\')\nError: element(s) not found',
      attemptedLocator: '[data-test-id="brand-kit-OBSOLETE"]',
    });
    expect(v.isFixtureFailure).toBe(false);
    expect(v.confidence).toBe("none");
  });

  test("a doc-wording mismatch is NOT misread as a fixture problem", () => {
    const v = checkFixtureFailure({
      errorMessage: 'Label validation failed: expected "+ New Voice Profile" (contains), got "new voice profile".',
    });
    expect(v.isFixtureFailure).toBe(false);
  });

  test("saved DOM upgrades the verdict to confirmed when the UI is intact", () => {
    // Base selector's token IS present, fixture id is NOT — the UI works, only the data is missing.
    const snap = path.join(FIXTURES, "brandkit-fixture-missing.html");
    const v = checkFixtureFailure({
      errorMessage: REAL_ERROR,
      attemptedLocator: "a.brand-kit-card-link",
      snapshotPath: snap,
    });
    expect(v.isFixtureFailure).toBe(true);
    expect(v.confidence).toBe("confirmed");
  });

  test("if the fixture IS on the page, it is real drift rather than missing data", () => {
    const snap = path.join(FIXTURES, "brandkit-fixture-present.html");
    const v = checkFixtureFailure({
      errorMessage: REAL_ERROR,
      attemptedLocator: "a.brand-kit-card-link",
      snapshotPath: snap,
    });
    expect(v.isFixtureFailure).toBe(false);
  });
});

test.describe("found-but-unusable is not drift (Developer-Hub run 30870235729)", () => {
  /** Verbatim: 6 of 13 failures in that run were this shape. */
  const APP_LIMIT =
    'Developer Hub "+ New App" (button[data-test-id="new-app-cta"]) did not become enabled. ' +
    "If this persists, check org Developer Hub app limits, plan entitlements, or any dashboard banner " +
    "explaining disabled creation. expect(locator).toBeEnabled() failed\n\n" +
    "Locator:  locator('button[data-test-id=\"new-app-cta\"]').first()\n" +
    "Expected: enabled\nReceived: disabled";

  test("a disabled control is not a heal candidate", () => {
    const v = checkPrecondition({ errorMessage: APP_LIMIT });
    expect(v.isPrecondition).toBe(true);
    expect(v.kind).toBe("control-disabled");
    // The framework's own explanation is the actionable part — surface it.
    expect(v.hint).toContain("app limits");
  });

  test("a disabled Save button surfaces what must be provided", () => {
    const v = checkPrecondition({
      errorMessage:
        "Managing webhooks doc: manifest **Save** stayed disabled — provide **URL to Notify** and required event selections.",
    });
    expect(v.isPrecondition).toBe(true);
    expect(v.kind).toBe("control-disabled");
  });

  test("a wrong toggle state is a behaviour difference, not a locator problem", () => {
    const v = checkPrecondition({ errorMessage: "expect(locator).toBeChecked() failed\nExpected: checked" });
    expect(v.isPrecondition).toBe(true);
    expect(v.kind).toBe("wrong-ui-state");
  });

  test("a genuinely missing element is still a heal candidate", () => {
    // Must not swallow the case the agent exists for.
    const v = checkPrecondition({
      errorMessage: "expect(locator).toBeVisible() failed\nError: element(s) not found",
    });
    expect(v.isPrecondition).toBe(false);
  });

  test("fixture detection generalises beyond BrandKit's AUTO-* convention", () => {
    // Developer-Hub generates slugs like Mc55a2cb6, which a token-only detector missed entirely.
    const msg =
      'Developer Hub listing: could not open an app containing "Mc55a2cb6". Ensure that slug appears on an app card.';
    expect(extractFixtureToken(msg)).toBe("Mc55a2cb6");
    expect(checkFixtureFailure({ errorMessage: msg }).isFixtureFailure).toBe(true);
  });
});

test.describe("leading '+' is an icon glyph, not doc drift (regression)", () => {
  const DOC = "Click the + New App button. To set the App URL, click the View Hosting Settings link.";

  test("a difference that is only the leading glyph is not drift", () => {
    expect(sameIgnoringIconGlyph("+ New App", "new app")).toBe(true);
    expect(sameIgnoringIconGlyph("+ New Voice Profile", "new voice profile")).toBe(true);
    // Unrelated labels must not be collapsed.
    expect(sameIgnoringIconGlyph("View Hosting Settings", "view hosting")).toBe(false);
    expect(sameIgnoringIconGlyph("+ New App", "delete app")).toBe(false);
  });

  test("reconcile stops calling the 416 glyph steps documentation drift", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "+ New App",
      seenInApp: "new app",
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("no-drift");
    expect(c.recommendation).toContain("plus icon");
  });

  test("a genuine label change is still reported as drift", () => {
    const c = reconcile({
      docText: DOC,
      docUrl: "https://example.test/doc",
      expectedByFlow: "View Hosting Settings",
      seenInApp: "view hosting",
      kind: "label-mismatch",
    });
    expect(c.verdict).toBe("doc-confirms-flow");
    expect(c.recommendation).toContain("DOC IS OUT OF DATE");
  });
});

test.describe("the matcher must search for a DOC-FACING label (regression)", () => {
  /**
   * Real Developer-Hub targets. Feeding the internal identifier to the fuzzy tier meant comparing it
   * against ~100 real accessible names, matching nothing, and reporting genuine doc/app drift after five
   * ~60s attempts. Two of three "findings" in that run were this bug, not the product.
   */
  test("internal identifiers are not mistaken for UI labels", () => {
    expect(looksLikeUiLabel("Releases")).toBe(true);
    expect(looksLikeUiLabel("New Brand Kit")).toBe(true);
    expect(looksLikeUiLabel("Developer Hub Basic Information restore version Yes Restore prompt")).toBe(false);
    expect(looksLikeUiLabel("Developer Hub UI location Field Modifier Allowed Field Types dropdown")).toBe(false);
    expect(looksLikeUiLabel("Invite Collaborators flow: collaborators table Actions column header")).toBe(false);
  });

  test("expected.labelEquals wins — it is the author's transcription of the doc", () => {
    const r = docFacingLabel(
      { expected: { labelEquals: "New Brand Kit" } },
      "Brand Kits page New Brand Kit primary (doc step)",
      '[data-test-id="x"]'
    );
    expect(r).toEqual({ label: "New Brand Kit", source: "expected" });
  });

  test("falls back to the locator's own text predicate", () => {
    const r = docFacingLabel({}, "Some Internal Target Name That Is Long (doc step)", 'button:has-text("Publish")');
    expect(r).toEqual({ label: "Publish", source: "locator-text" });
  });

  test("a short target is accepted as a label", () => {
    expect(docFacingLabel({}, "Releases (doc step)", undefined)).toEqual({ label: "Releases", source: "target" });
  });

  test("with nothing doc-facing it reports NO label rather than inventing one", () => {
    const r = docFacingLabel(
      {},
      "Developer Hub Basic Information restore version Yes Restore prompt (doc step)",
      undefined
    );
    expect(r.label).toBeUndefined();
    expect(r.source).toBe("none");
  });

  test("a partial attribute selector is not treated as an exact test id", () => {
    // [data-test-id^="uilocation-field-modifier-"] is a PREFIX; using it as a full id searches for an
    // element that cannot exist.
    const partial = referenceFromSelector('[data-test-id^="uilocation-field-modifier-"] div.Select__control', "x");
    expect(partial?.testId).toBeUndefined();
    // An exact match is still picked up.
    const exact = referenceFromSelector('[data-test-id="new-app-cta"]', "x");
    expect(exact?.testId).toBe("new-app-cta");
  });
});

test.describe("flow JSON is corrected to the DOCUMENT, never the app", () => {
  const TMP = path.resolve(__dirname, "../../projects/__tmp-test__/mod/flows/tmp-label.flow.json");
  const DOC = "On the Dashboard, click the Create Experience button to begin.";

  const seed = () => {
    fs.mkdirSync(path.dirname(TMP), { recursive: true });
    // Two steps share the same expected label — a naive global replace would corrupt the other.
    fs.writeFileSync(
      TMP,
      JSON.stringify(
        {
          id: "tmp-label",
          steps: [
            { action: "verify", target: "a", expected: { labelEquals: "New Experience" } },
            { action: "verify", target: "b", expected: { labelEquals: "New Experience" } },
          ],
        },
        null,
        2
      ),
      "utf8"
    );
  };
  const read = () => JSON.parse(fs.readFileSync(TMP, "utf8"));
  const cleanup = () => fs.rmSync(path.resolve(__dirname, "../../projects/__tmp-test__"), { recursive: true, force: true });

  test("applies a doc-sourced correction to the right step only", () => {
    seed();
    try {
      const r = applyFlowLabelUpdate({
        flowPath: TMP,
        stepIndex: 1,
        from: "New Experience",
        to: "Create Experience",
        docText: DOC,
      });
      expect(r.applied).toBe(true);
      const f = read();
      // Only step 2 changed.
      expect(f.steps[0].expected.labelEquals).toBe("New Experience");
      expect(f.steps[1].expected.labelEquals).toBe("Create Experience");
    } finally {
      cleanup();
    }
  });

  test("REFUSES a value that does not appear in the document", () => {
    seed();
    try {
      const r = applyFlowLabelUpdate({
        flowPath: TMP,
        stepIndex: 0,
        from: "New Experience",
        to: "Whatever The App Says Now", // app-sourced, absent from the doc
        docText: DOC,
      });
      expect(r.applied).toBe(false);
      expect(r.reason).toContain("does not appear in the document");
      expect(read().steps[0].expected.labelEquals).toBe("New Experience");
    } finally {
      cleanup();
    }
  });

  test("refuses when the step does not currently expect the stated value", () => {
    seed();
    try {
      const r = applyFlowLabelUpdate({
        flowPath: TMP,
        stepIndex: 0,
        from: "Something Else",
        to: "Create Experience",
        docText: DOC,
      });
      expect(r.applied).toBe(false);
      expect(r.reason).toContain("refusing to guess");
    } finally {
      cleanup();
    }
  });

  test("dry run changes nothing on disk", () => {
    seed();
    try {
      const r = applyFlowLabelUpdate({
        flowPath: TMP,
        stepIndex: 0,
        from: "New Experience",
        to: "Create Experience",
        docText: DOC,
        dryRun: true,
      });
      expect(r.applied).toBe(false);
      expect(r.reason).toContain("dry run");
      expect(read().steps[0].expected.labelEquals).toBe("New Experience");
    } finally {
      cleanup();
    }
  });

  test("write path is restricted to flow definitions", () => {
    expect(() => assertFlowWritable("/tmp/evil.json")).toThrow(/Refusing to write/);
    expect(() =>
      assertFlowWritable(path.resolve(__dirname, "../../projects/P/m/selectors/x.selectors.ts"))
    ).toThrow(/Refusing to write/);
  });
});

test.describe("an action timing out after a passing verify is not drift (BrandKit delete-a-voice-profile)", () => {
  /** The real shape: a verify and an action on the SAME target, back to back. */
  const FLOW = {
    steps: [
      { action: "click", target: "vertical ellipsis" },
      { action: "verify", target: "Delete" },
      { action: "click", target: "Delete" },
    ],
  };

  test("catches the real signature: verify passed, action waited out its timeout", () => {
    const v = checkActionTimedOutAfterVerify({
      flow: FLOW,
      stepIndex: 2,
      errorMessage: "locator.click: Target page, context or browser has been closed",
    });
    expect(v.timedOutAfterVerify).toBe(true);
    expect(v.reason).toContain("present");
  });

  test("also catches a plain action timeout", () => {
    const v = checkActionTimedOutAfterVerify({
      flow: FLOW,
      stepIndex: 2,
      errorMessage: "locator.click: Timeout 45000ms exceeded.",
    });
    expect(v.timedOutAfterVerify).toBe(true);
  });

  test("a genuinely missing element is NOT reclassified", () => {
    // No preceding verify on the same target, so the agent should still try to heal it.
    const v = checkActionTimedOutAfterVerify({
      flow: { steps: [{ action: "click", target: "Something Else" }, { action: "click", target: "Delete" }] },
      stepIndex: 1,
      errorMessage: "expect(locator).toBeVisible() failed\nError: element(s) not found",
    });
    expect(v.timedOutAfterVerify).toBe(false);
  });

  test("a preceding verify on a DIFFERENT target does not qualify", () => {
    const v = checkActionTimedOutAfterVerify({
      flow: { steps: [{ action: "verify", target: "Actions" }, { action: "click", target: "Delete" }] },
      stepIndex: 1,
      errorMessage: "locator.click: Timeout 45000ms exceeded.",
    });
    expect(v.timedOutAfterVerify).toBe(false);
    expect(v.reason).toContain("targets something else");
  });

  test("a failing verify step is not treated as an action", () => {
    const v = checkActionTimedOutAfterVerify({
      flow: FLOW,
      stepIndex: 1,
      errorMessage: "locator.click: Timeout 45000ms exceeded.",
    });
    expect(v.timedOutAfterVerify).toBe(false);
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

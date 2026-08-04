// core/healing/fixtureCheck.ts
/**
 * Detects failures caused by a missing **test fixture** rather than by drift.
 *
 * Why this exists: in a real BrandKit run, 13 of 14 failures were a single fixture dependency. Every
 * dependent flow opens the brand-kit card named `AUTO-CBK-*`, created by a sibling flow. The card was
 * absent, so the step failed — but the selector was perfectly fine (`a.brand-kit-card-link` matched 18
 * elements on the page) and the documentation was not wrong about anything.
 *
 * Without this check the agent classifies all of them as `genuine-failure`, which lands them in the
 * technical writers' "doc/app mismatch" report. That would have made the first real report 93% noise.
 * Documentation never contains a generated fixture id like `AUTO-CBK-a1b2c`, so this can be decided
 * with confidence.
 *
 * It is also a large practical saving: a fixture cannot be healed by any selector change, so these
 * targets are skipped instead of consuming an attempt budget of browser replays each.
 */
import fs from "fs";

/**
 * Names the flows generate for their own test data: `AUTO-BK-a1b2c`, `AUTO-CBK-…`, `AUTO-VP-…`.
 * Also matches an un-substituted template token, which indicates a templating failure.
 */
// Trailing separator is kept: flows search for the *prefix* (`hasText: /AUTO-CBK-/i`), and reporting
// the token exactly as the test looked for it is clearer than trimming it.
const FIXTURE_TOKEN = /\bAUTO[-_][A-Z0-9]{1,10}(?:[-_][A-Za-z0-9]+)?[-_]?/;
const TEMPLATE_TOKEN = /\{unique\d*\}/i;

export type FixtureVerdict = {
  isFixtureFailure: boolean;
  /** The fixture identifier the step was looking for, e.g. "AUTO-CBK-". */
  fixtureToken?: string;
  /** "confirmed" when a saved DOM proves the base selector resolved but the fixture text was absent. */
  confidence: "confirmed" | "likely" | "none";
  reason: string;
};

/** The fixture identifier a failure was looking for, if any. */
export function extractFixtureToken(text: string | undefined): string | undefined {
  if (!text) return undefined;
  if (TEMPLATE_TOKEN.test(text)) return TEMPLATE_TOKEN.exec(text)![0];
  return FIXTURE_TOKEN.exec(text)?.[0];
}

/** Base selector with any Playwright `.filter({...})` / `.first()` chaining stripped off. */
function baseSelector(locator: string | undefined): string | undefined {
  if (!locator) return undefined;
  return locator.split(/\.(?:filter|first|nth|last)\s*\(/)[0].trim() || undefined;
}

/**
 * A crude presence test for a CSS selector's distinguishing token inside saved HTML. Good enough to
 * answer "did the base selector have anything to match?", which is all this needs.
 */
function selectorLikelyPresent(html: string, selector: string): boolean {
  // Pull class / attribute-value / tag tokens out of the selector and look for any of them.
  const tokens = [
    ...[...selector.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((m) => m[1]),
    ...[...selector.matchAll(/\[[\w-]+\s*[~^$*|]?=\s*(['"])(.*?)\1/g)].map((m) => m[2]),
  ].filter((t) => t.length > 3);
  if (!tokens.length) return false;
  return tokens.some((t) => html.includes(t));
}

/**
 * Decide whether a failure is a missing fixture.
 *
 * The strong form of the evidence is: the step's *base* selector still resolves in the saved DOM, but
 * the fixture identifier appears nowhere on the page. That means the UI is intact and only the test's
 * own data is absent — nothing a heal could fix, and nothing to tell a writer about.
 */
export function checkFixtureFailure(args: {
  errorMessage?: string;
  missingElementSummary?: string;
  attemptedLocator?: string;
  /** Saved failure DOM from the run, when available. */
  snapshotPath?: string;
}): FixtureVerdict {
  const haystack = `${args.errorMessage ?? ""} ${args.missingElementSummary ?? ""} ${args.attemptedLocator ?? ""}`;
  const token = extractFixtureToken(haystack);

  if (!token) {
    return { isFixtureFailure: false, confidence: "none", reason: "no test-fixture identifier in the failure" };
  }

  // Try to upgrade "likely" to "confirmed" using the saved DOM.
  if (args.snapshotPath && fs.existsSync(args.snapshotPath)) {
    try {
      const raw = fs.readFileSync(args.snapshotPath, "utf8");
      // Strip comments and inline script/style before asking "is the fixture on the page?". These
      // snapshots embed the whole JS bundle, so a bare substring search over the raw HTML happily
      // finds identifiers that are not rendered anywhere — which would wrongly conclude the fixture
      // exists and send a test-data problem to the technical writers as doc drift.
      const html = raw
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ");
      const fixtureOnPage = html.includes(token.replace(/[-_]$/, ""));
      const base = baseSelector(args.attemptedLocator);
      const uiPresent = base ? selectorLikelyPresent(html, base) : false;

      if (!fixtureOnPage && uiPresent) {
        return {
          isFixtureFailure: true,
          fixtureToken: token,
          confidence: "confirmed",
          reason: `the page rendered normally and the step's selector still resolves, but no "${token}" test fixture exists on it — the fixture was never created (or is not on the rendered page), so no selector change can fix this`,
        };
      }
      if (!fixtureOnPage) {
        return {
          isFixtureFailure: true,
          fixtureToken: token,
          confidence: "likely",
          reason: `the step looked for the "${token}" test fixture, which is absent from the saved page`,
        };
      }
      // The fixture IS on the page — so this is probably real drift after all.
      return {
        isFixtureFailure: false,
        fixtureToken: token,
        confidence: "none",
        reason: `the "${token}" fixture is present on the page, so the failure is not caused by missing test data`,
      };
    } catch {
      /* fall through to the snapshot-free answer */
    }
  }

  return {
    isFixtureFailure: true,
    fixtureToken: token,
    confidence: "likely",
    reason: `the step looked for the "${token}" test fixture; no saved DOM was available to confirm, but documentation never contains generated fixture ids`,
  };
}

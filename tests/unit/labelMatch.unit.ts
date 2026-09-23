#!/usr/bin/env ts-node
/**
 * Unit tests for core/labelMatch.ts.
 *
 * Plain `node:assert`: pure string logic, no browser, no `globalSetup`.
 *
 * Run:  npm run test:label-match-unit
 */
import assert from "node:assert/strict";
import { labelMatches, withoutLeadingIconGlyph, normalizeLabelText } from "../../core/labelMatch";

let passed = 0;
const it = (name: string, fn: () => void) => {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (err: any) {
    console.error(`  FAIL  ${name}\n        ${err?.message ?? err}`);
    process.exitCode = 1;
  }
};

console.log("labelMatch");

it("the real failure: documented '+ Invite User' vs the app's 'Invite User'", () => {
  // Personalize user-permissions-invite-user step 12. The button was present and correct; its classes
  // included Button--icon-alignment-left, so the plus is an icon and the accessible name omits it.
  assert.equal(labelMatches("invite user", "+ Invite User", "contains"), true);
  assert.equal(labelMatches("Invite User", "+ Invite User", "exact"), true);
});

it("still matches when the app DOES render the plus as text", () => {
  assert.equal(labelMatches("+ New Voice Profile", "+ New Voice Profile", "exact"), true);
  assert.equal(labelMatches("+ New Event", "+ New Event", "contains"), true);
});

it("a genuine wording difference is still a failure", () => {
  // The case the agent exists to find must not be masked.
  assert.equal(labelMatches("Events", "+ New Event", "contains"), false);
  assert.equal(labelMatches("Activate Draft", "Save Draft", "contains"), false);
  assert.equal(labelMatches("View Hosting", "View Hosting Settings", "contains"), false);
});

it("only a LEADING plus is optional", () => {
  // A plus inside the string stays significant.
  assert.equal(labelMatches("a b", "a + b", "contains"), false);
  assert.equal(labelMatches("Drag + Drop", "Drag + Drop", "exact"), true);
});

it("relaxation is one-directional: a plus the app adds is not stripped", () => {
  // Doc says "New Event", app shows "+ New Event". Under `contains` this legitimately matches; under
  // `exact` it must not, because only the EXPECTED side is relaxed.
  assert.equal(labelMatches("+ New Event", "New Event", "contains"), true);
  assert.equal(labelMatches("+ New Event", "New Event", "exact"), false);
});

it("case and whitespace are insensitive, as before", () => {
  assert.equal(labelMatches("  INVITE   USER ", "+ invite user", "exact"), true);
  assert.equal(normalizeLabelText("  A  B "), "a b");
});

it("empty inputs never match", () => {
  assert.equal(labelMatches("", "+ Invite User"), false);
  assert.equal(labelMatches("Invite User", ""), false);
  assert.equal(labelMatches("", ""), false);
});

it("a bare plus does not match everything", () => {
  // Stripping "+" would leave an empty expected string, which must not become a wildcard.
  assert.equal(labelMatches("anything at all", "+"), false);
  assert.equal(labelMatches("anything at all", "+ "), false);
});

it("withoutLeadingIconGlyph strips only the leading glyph", () => {
  assert.equal(withoutLeadingIconGlyph("+ New Event"), "New Event");
  assert.equal(withoutLeadingIconGlyph("+New Event"), "New Event");
  assert.equal(withoutLeadingIconGlyph("  +   New Event  "), "New Event");
  assert.equal(withoutLeadingIconGlyph("New + Event"), "New + Event");
  assert.equal(withoutLeadingIconGlyph("New Event"), "New Event");
});

console.log(`\n${passed} passed${process.exitCode ? " (with failures)" : ""}`);

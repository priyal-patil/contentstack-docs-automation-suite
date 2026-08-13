#!/usr/bin/env ts-node
/**
 * Unit tests for core/fieldLabelFromTarget.ts.
 *
 * Plain `node:assert` rather than a Playwright spec: this is pure string logic, so it needs no browser
 * and no `globalSetup` login and runs in a second.
 *
 * Run:  npx ts-node --transpile-only tests/unit/fieldLabelFromTarget.unit.ts
 */
import assert from "node:assert/strict";
import { fieldLabelFromTarget, missingSelectorMessage } from "../../core/fieldLabelFromTarget";

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

console.log("fieldLabelFromTarget");

it("rejects the real target that failed every run", () => {
  // Personalize get-started step 10 — searched for a field labelled "…(doc step)" and timed out for 30s.
  const d = fieldLabelFromTarget("Personalize New Project Name field (doc step)");
  assert.equal(d.usable, false);
  assert.equal(d.reason, "describes-a-control");
  assert.equal(d.uiName, "Personalize New Project Name field");
});

it("strips the (doc step) suffix", () => {
  assert.equal(fieldLabelFromTarget("Name (doc step)").uiName, "Name");
  assert.equal(fieldLabelFromTarget("Name (doc step)").usable, true);
});

it("strips a '<Doc name> doc:' prefix", () => {
  const d = fieldLabelFromTarget("DAL Lytics doc: Title field (doc step)");
  assert.equal(d.uiName, "Title field");
  // Still describes a control, so still not usable — but the prefix is gone.
  assert.equal(d.usable, false);
  assert.equal(d.reason, "describes-a-control");
});

it("accepts a bare label that happens to BE a kind word", () => {
  // CMS really has a field labelled "Description"; Personalize a control labelled "Proceed".
  for (const label of ["Description", "Name", "Proceed", "Email"]) {
    const d = fieldLabelFromTarget(`${label} (doc step)`);
    assert.equal(d.usable, true, `${label} should be usable`);
    assert.equal(d.uiName, label);
  }
});

it("rejects a phrase describing a control", () => {
  for (const t of [
    "URL path pattern textarea (doc step)",
    "Email input on Invite User page (doc step)",
    "Store Hash input in Authorize pop-up (doc step)",
    "Personalize Settings Users Invite modal email addresses pill (doc step)",
  ]) {
    assert.equal(fieldLabelFromTarget(t).usable, false, `${t} should be rejected`);
  }
});

it("rejects anything still carrying a colon", () => {
  // A colon that is not the "doc:" form means an unstripped qualifier.
  const d = fieldLabelFromTarget("Some Screen: Name (doc step)");
  assert.equal(d.usable, false);
  assert.equal(d.reason, "internal-prefix");
});

it("rejects an empty or whitespace target", () => {
  assert.equal(fieldLabelFromTarget("(doc step)").usable, false);
  assert.equal(fieldLabelFromTarget("   ").reason, "empty");
  assert.equal(fieldLabelFromTarget("").reason, "empty");
});

it("rejects a phrase too long to be a label", () => {
  const d = fieldLabelFromTarget("fill every empty field on the configuration screen with placeholders (doc step)");
  assert.equal(d.usable, false);
  assert.equal(d.reason, "too-long");
});

it("accepts a genuine multi-word label", () => {
  const d = fieldLabelFromTarget("URL to Notify (doc step)");
  assert.equal(d.usable, true);
  assert.equal(d.uiName, "URL to Notify");
});

it("the error names the exact file to add the key to, and the scoping trap", () => {
  const msg = missingSelectorMessage({
    target: "Personalize New Project Name field (doc step)",
    project: "Personalize",
    module: "get-started",
    flowId: "get-started-with-personalize-ab-test-end-to-end-guide",
    reason: "describes-a-control",
  });
  assert.ok(
    msg.includes("projects/Personalize/get-started/selectors/get-started-with-personalize-ab-test-end-to-end-guide.selectors.ts"),
    "must name the flow-scoped file path"
  );
  // The 121-of-258 case: the key exists but is filed out of reach. The message must say so.
  assert.ok(msg.includes("shared -> legacy -> project -> module -> flow"), "must explain the merge order");
  assert.ok(msg.includes("ANOTHER flow"), "must warn that another flow's file is invisible");
});

it("missing metadata degrades to placeholders rather than throwing", () => {
  const msg = missingSelectorMessage({ target: "x (doc step)" });
  assert.ok(msg.includes("<project>") && msg.includes("<module>") && msg.includes("<flowId>"));
});

console.log(`\n${passed} passed${process.exitCode ? " (with failures)" : ""}`);

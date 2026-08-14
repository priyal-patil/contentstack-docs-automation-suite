#!/usr/bin/env ts-node
/**
 * Regression test for core/report/parseFlowSpecTitle.ts.
 *
 * Deliberately a plain `node:assert` script rather than a Playwright spec: it needs no browser and no
 * `globalSetup` login, so it runs anywhere in a second. `playwright test` would drag the whole auth
 * bootstrap in for what is pure string parsing.
 *
 * Run:  npm run test:report-unit
 */
import assert from "node:assert/strict";
import {
  collectAllFlowSpecs,
  collectCmsFlowSpecs,
  projectFromPlaywrightSpecTitle,
  flowIdFromPlaywrightSpecTitle,
  type PwSuite,
} from "../../core/report/parseFlowSpecTitle";

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

/**
 * The real shape emitted by Playwright for tests/flows.spec.ts: `Project=… Module=… Stage=…` sits on an
 * ancestor suite and the spec title is the bare flow id. Reproduced from an actual BrandKit run report.
 */
const REAL: { suites: PwSuite[] } = {
  suites: [
    {
      title: "flows.spec.ts",
      suites: [
        {
          title: "Flow suite (parallel across modules; all URLs in a module/stage run even if one fails)",
          suites: [
            {
              title: "Project=BrandKit Module=get-started Stage=main",
              specs: [
                { title: "create-a-brand-kit", tests: [{ results: [{ status: "passed" }] }] },
                { title: "edit-a-brand-kit", tests: [{ results: [{ status: "failed" }] }] },
              ],
            },
            {
              title: "Project=CMS Module=assets Stage=main",
              specs: [{ title: "publish-an-asset", tests: [{ results: [{ status: "passed" }] }] }],
            },
          ],
        },
      ],
    },
  ],
};

/** Legacy flat shape: the whole single-line title lived on the spec itself. Must keep working. */
const LEGACY: { suites: PwSuite[] } = {
  suites: [
    {
      title: "flows.spec.ts",
      specs: [{ title: "Project=Launch Module=projects Stage=main custom-domain", tests: [{ results: [{ status: "passed" }] }] }],
    },
  ],
};

console.log("parseFlowSpecTitle");

it("collects specs whose Project= context lives on an ancestor suite", () => {
  const specs = collectAllFlowSpecs(REAL);
  // Before the fix this returned 0, which emptied every downstream report.
  assert.equal(specs.length, 3, `expected 3 specs, got ${specs.length}`);
});

it("reconstructs the documented single-line title", () => {
  const [first] = collectAllFlowSpecs(REAL);
  assert.equal(first.title, "Project=BrandKit Module=get-started Stage=main create-a-brand-kit");
});

it("project and flow id parse out of the reconstructed title", () => {
  for (const s of collectAllFlowSpecs(REAL)) {
    assert.ok(projectFromPlaywrightSpecTitle(s.title!), `no project parsed from "${s.title}"`);
    assert.ok(flowIdFromPlaywrightSpecTitle(s.title!).length > 0);
  }
  const bk = collectAllFlowSpecs(REAL).find((s) => /create-a-brand-kit$/.test(s.title!))!;
  assert.equal(projectFromPlaywrightSpecTitle(bk.title!), "BrandKit");
  assert.equal(flowIdFromPlaywrightSpecTitle(bk.title!), "create-a-brand-kit");
});

it("does not inherit prose or file-level suite titles into the id", () => {
  const [first] = collectAllFlowSpecs(REAL);
  assert.ok(!first.title!.includes("flows.spec.ts"), "file-level suite leaked into the title");
  assert.ok(!first.title!.includes("Flow suite"), "prose describe leaked into the title");
});

it("per-project filtering still works", () => {
  const cms = collectCmsFlowSpecs(REAL);
  assert.equal(cms.length, 1);
  assert.equal(flowIdFromPlaywrightSpecTitle(cms[0].title!), "publish-an-asset");
});

it("test status survives collection", () => {
  const specs = collectAllFlowSpecs(REAL);
  const failed = specs.filter((s) => s.tests?.[0]?.results?.[0]?.status === "failed");
  assert.equal(failed.length, 1);
});

it("the legacy flat title shape is unaffected", () => {
  const specs = collectAllFlowSpecs(LEGACY);
  assert.equal(specs.length, 1);
  assert.equal(projectFromPlaywrightSpecTitle(specs[0].title!), "Launch");
  assert.equal(flowIdFromPlaywrightSpecTitle(specs[0].title!), "custom-domain");
});

it("empty or malformed input yields no specs rather than throwing", () => {
  assert.equal(collectAllFlowSpecs(null).length, 0);
  assert.equal(collectAllFlowSpecs(undefined).length, 0);
  assert.equal(collectAllFlowSpecs({ suites: [] }).length, 0);
  assert.equal(collectAllFlowSpecs({ suites: [{ title: "no context", specs: [{ title: "x" }] }] }).length, 0);
});

console.log(`\n${passed} passed${process.exitCode ? " (with failures)" : ""}`);

#!/usr/bin/env ts-node
// scripts/healFailedFlows.ts
/**
 * Self-healing docs QA agent — CLI entry point.
 *
 * Consumes a failed run's `doc-step-failures.json`, retries each failed flow with a DOM-assisted
 * element-recovery loop, distinguishes self-healed locator drift from genuine doc/app mismatch, and
 * writes healed selectors back to the flow-level selector layer.
 *
 * Usage:
 *   npx ts-node scripts/healFailedFlows.ts --reportDir reports/brandkit-123-1 --project BrandKit
 *   npx ts-node scripts/healFailedFlows.ts --reportDir reports/latest --dry-run
 *   npx ts-node scripts/healFailedFlows.ts --reportDir reports/latest --commit --pr
 *
 * Flags
 *   --reportDir <p>     Run directory containing doc-step-failures.json  (default reports/latest)
 *   --project <name>    Only heal flows from this project
 *   --flow <id>         Repeatable. Only heal these flow ids
 *   --max-attempts <n>  Budget for idempotent flows (default 5)
 *   --dry-run           Find and verify heals but write nothing
 *   --llm               Enable the LLM tier when rules miss (needs ANTHROPIC_API_KEY)
 *   --commit            Commit each healed selector fix on a branch (off by default)
 *   --pr                Open a PR via gh after committing (implies --commit)
 *   --slack             Post the summary to Slack (off by default)
 *   --headed            Show the browser (debugging)
 *
 * Side-effectful steps are opt-in on purpose: by default this writes files and reports, and touches
 * neither git history nor Slack.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import axios from "axios";
import { chromium } from "@playwright/test";
import { AuditLog } from "../core/healing/auditLog";
import {
  parseFailureReport,
  parseWarningReport,
  renderWarningsMarkdown,
  verifyWarningsAgainstDocs,
  extractAttemptedLocator,
  parseFailureDrift,
} from "../core/healing/reportParser";
import { repairLoop, replayFlowAfterCorrection } from "../core/healing/repairLoop";
import { flowSelectorPath } from "../core/healing/selectorLayers";
import { checkFixtureFailure, type FixtureVerdict } from "../core/healing/fixtureCheck";
import { checkPrecondition, checkActionTimedOutAfterVerify, type PreconditionVerdict } from "../core/healing/preconditionCheck";
import { applyFlowLabelUpdate, type FlowUpdateResult } from "../core/healing/flowJsonWriter";
import { compareDocSequence, renderSequenceFindings, type SequenceReport } from "../core/healing/docSequence";
import { fetchDocContent } from "../core/healing/docVerifier";
import { escalateToLlm } from "../core/healing/escalate";
import {
  buildGenuineFailureReport,
  renderGenuineFailureMarkdown,
  type GenuineFailureReport,
} from "../core/healing/genuineFailure";
import { DEFAULT_HEAL_CONFIG, type HealConfig, type HealResult, type HealTarget } from "../core/healing/types";

const REPO_ROOT = path.resolve(__dirname, "..");

// ── args ───────────────────────────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name: string) => argv.includes(`--${name}`);
const opt = (name: string, fallback?: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : fallback;
};
const optAll = (name: string) => {
  const out: string[] = [];
  argv.forEach((a, i) => {
    if (a === `--${name}` && argv[i + 1] && !argv[i + 1].startsWith("--")) out.push(argv[i + 1]);
  });
  return out;
};

const reportDir = opt("reportDir", process.env.REPORT_DIR ?? "reports/latest")!;
const doCommit = flag("commit") || flag("pr");
const doPr = flag("pr");
const doSlack = flag("slack");
const dryRun = flag("dry-run");
/** Correct a flow JSON's expected label when the DOCUMENT disagrees with it. Off by default. */
const updateFlows = flag("update-flows");
/** Also report documented instructions nothing verifies. Advisory coverage data; fetches each doc. */
const docSequence = flag("doc-sequence");

const cfg: HealConfig = {
  ...DEFAULT_HEAL_CONFIG,
  maxHealAttempts: Number(opt("max-attempts", String(DEFAULT_HEAL_CONFIG.maxHealAttempts))),
  enableLlmEscalation: flag("llm"),
  dryRun,
  reportDir,
  snapshotDir: path.join(REPO_ROOT, "data/dom"),
};

const log = (m: string) => console.log(m);

/** `fix(<project>-<module>): auto-heal selector for <doc title>` + an auditable trailer. */
function commitMessage(r: HealResult, chain: string): string {
  const t = r.target;
  const subject = `fix(${t.project.toLowerCase()}-${t.module}): auto-heal selector for ${t.docTitle}`;
  const body = [
    "",
    `Auto-healed stale selector for step ${t.stepNumber} ("${t.target}").`,
    `Strategy: ${r.resolvedBy} · recovered: ${r.resolvedSelector}`,
    `Original chain preserved first; recovered selector appended:`,
    `  ${chain}`,
    "",
    `Verified by replaying the full flow after write-back.`,
    `Healed by self-healing-docs-qa-agent${process.env.GITHUB_RUN_ID ? `, run ${process.env.GITHUB_RUN_ID}` : ""}, attempt ${r.attempts.length}.`,
  ].join("\n");
  return `${subject}\n${body}`;
}

function sh(cmd: string): string {
  return execSync(cmd, { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

async function main(): Promise<void> {
  const audit = new AuditLog(reportDir);
  const targets = parseFailureReport(reportDir, {
    projectFilter: opt("project"),
    flowFilter: optAll("flow"),
  });

  // Doc drift the flows tolerated as warnings. Not healable — there is no broken selector — but it is
  // the highest-signal output for technical writers, so it is always reported even when nothing failed.
  // Every warning is then checked back against the source document, so the report can say which of the
  // three — doc, flow JSON, or app — is actually out of date.
  // Wording mismatches recorded as failures count as drift too, and must come from EVERY failure
  // record — the heal queue keeps only the earliest per flow, which would discard later doc findings.
  const driftWarnings = await verifyWarningsAgainstDocs([
    ...parseWarningReport(reportDir, {
      projectFilter: opt("project"),
      flowFilter: optAll("flow"),
    }),
    ...parseFailureDrift(reportDir, {
      projectFilter: opt("project"),
      flowFilter: optAll("flow"),
    }),
  ]);

  audit.runStarted({
    reportDir,
    targets: targets.length,
    driftWarnings: driftWarnings.length,
    cfg: { ...cfg, snapshotDir: undefined },
  });
  log(`\n🔧 Self-healing agent — ${targets.length} failed flow(s) from ${reportDir}\n`);
  if (driftWarnings.length) {
    const docStale = driftWarnings.filter((w) => w.docCheck?.verdict === "doc-confirms-flow").length;
    const jsonStale = driftWarnings.filter((w) => w.docCheck?.verdict === "doc-matches-app").length;
    log(`⚠️  ${driftWarnings.length} documentation-drift warning(s):`);
    log(`     ${docStale} where the DOC is out of date  → for the technical writers`);
    log(`     ${jsonStale} where our FLOW JSON is out of date → fix the flow definition`);
    log(`     ${driftWarnings.length - docStale - jsonStale} needing review\n`);
  }
  // Where the DOCUMENT and our flow JSON disagree, the JSON is the stale side — the document is its
  // specification. Correct it to the DOC's wording (never the app's; flowJsonWriter re-checks that).
  const flowUpdates: FlowUpdateResult[] = [];
  for (const w of driftWarnings) {
    const upd = w.docCheck?.proposedFlowUpdate;
    if (!upd || !w.flowPath || typeof w.stepIndex !== "number") continue;
    const doc = await fetchDocContent(w.documentUrl);
    const res = applyFlowLabelUpdate({
      flowPath: w.flowPath,
      stepIndex: w.stepIndex,
      from: upd.from,
      to: upd.to,
      docText: doc.text,
      dryRun: cfg.dryRun || !updateFlows,
    });
    flowUpdates.push(res);
    log(`${res.applied ? "✍️ " : "🧪"} flow JSON ${w.flowId} step ${w.stepNumber}: ${res.reason}`);
  }
  if (driftWarnings.some((w) => w.docCheck?.proposedFlowUpdate) && !updateFlows) {
    log(`   (pass --update-flows to apply these; the value is always taken from the doc)\n`);
  }

  // Coverage: documented instructions no flow step performs. Opt-in — it fetches every doc, and it is
  // advisory rather than a defect list, so it is kept out of the default run.
  const sequenceReports: SequenceReport[] = [];
  if (docSequence) {
    const seen = new Set<string>();
    for (const t of targets) {
      if (!t.documentUrl || seen.has(t.documentUrl)) continue;
      seen.add(t.documentUrl);
      try {
        const flow = JSON.parse(fs.readFileSync(t.flowPath, "utf8"));
        const res = await axios.get(t.documentUrl, { timeout: 20_000, headers: { "User-Agent": "docs-qa-healing-agent" } });
        sequenceReports.push(
          compareDocSequence({ docUrl: t.documentUrl, html: String(res.data), flowSteps: flow.steps ?? [] })
        );
      } catch {
        /* a doc we cannot fetch simply yields no coverage data */
      }
    }
    const n = sequenceReports.reduce((a, r) => a + r.findings.length, 0);
    if (n) log(`📋 ${n} documented instruction(s) nothing verifies (coverage, not drift)\n`);
  }

  if (!targets.length) log("Nothing to heal.");
  for (const t of targets) {
    log(
      `   • ${t.flowId} step ${t.stepNumber} (${t.action}) — ${t.mutability}, selector layer: ${t.currentSelectorLayer}`
    );
  }
  log("");

  const headed = flag("headed");
  // No targets still falls through to the report: a green run can hide doc drift recorded as warnings,
  // and that report is the whole point. Only launch a browser if there is something to heal.
  const appliedCorrections = flowUpdates.filter((u) => u.applied);
  const browser =
    targets.length || appliedCorrections.length ? await chromium.launch({ headless: !headed }) : undefined;
  const deadline = Date.now() + cfg.globalTimeoutMs;

  const healed: Array<{ result: HealResult; chain: string; file: string }> = [];
  const genuine: GenuineFailureReport[] = [];
  const skipped: HealResult[] = [];
  const ineffective: HealResult[] = [];
  const envFailures: HealResult[] = [];
  const fixtureFailures: Array<{ target: HealTarget; verdict: FixtureVerdict }> = [];
  const preconditionFailures: Array<{ target: HealTarget; verdict: PreconditionVerdict }> = [];
  const jsonCorrected: Array<{ flowId: string; stepNumber: number; from?: string; to?: string; file: string }> = [];

  // A corrected JSON step must be RE-RUN, not assumed fixed. If the flow now completes the outcome is
  // JSON CORRECTED (a test-authoring fix, flagged for review in case the DOC was the wrong side after all).
  // If it still fails the correction did not help, and the target stays in the heal queue below.
  const correctedAndPassing = new Set<string>();
  if (browser && appliedCorrections.length) {
    for (const upd of appliedCorrections) {
      const w = driftWarnings.find((x) => x.flowPath === upd.file && x.docCheck?.proposedFlowUpdate);
      if (!w?.flowPath) continue;
      log(`\n──── re-running ${w.flowId} after correcting step ${w.stepNumber} ────`);
      const res = await replayFlowAfterCorrection({ browser, flowPath: w.flowPath, log });
      if (res.passed) {
        log(`✅ JSON CORRECTED — flow passes with the doc's wording`);
        jsonCorrected.push({
          flowId: w.flowId,
          stepNumber: w.stepNumber,
          from: upd.from,
          to: upd.to,
          file: upd.file,
        });
        correctedAndPassing.add(w.flowId);
      } else {
        log(`↩️  still failing after the correction (step ${res.failedStepNumber ?? "?"}) — continuing to heal`);
      }
    }
  }

  try {
    // Serial per flow: parallel healing would clobber each other's DOM snapshots and app state.
    for (const target of (browser ? targets : []).filter((t) => !correctedAndPassing.has(t.flowId))) {
      log(`\n──── ${target.flowId} · step ${target.stepNumber} ────`);

      // Verified present one step earlier, gone by the time the action ran. No selector can fix that.
      const transient = checkActionTimedOutAfterVerify({
        flow: JSON.parse(fs.readFileSync(target.flowPath, "utf8")),
        stepIndex: target.stepIndex,
        errorMessage: target.errorMessage,
      });
      if (transient.timedOutAfterVerify) {
        log(`⏳ action timed out after a passing verify — ${transient.reason.slice(0, 150)}`);
        log(`   not healable and not doc drift; skipping`);
        preconditionFailures.push({
          target,
          verdict: { isPrecondition: true, kind: "wrong-ui-state", reason: transient.reason },
        });
        continue;
      }

      // The element was found but is disabled or in the wrong state. Nothing is missing, so searching
      // for another selector is wasted work and reporting it as doc drift is simply wrong.
      const precondition = checkPrecondition({ errorMessage: target.errorMessage });
      if (precondition.isPrecondition) {
        log(`🚫 ${precondition.kind} — ${precondition.reason}`);
        log(`   not healable and not doc drift; skipping`);
        preconditionFailures.push({ target, verdict: precondition });
        continue;
      }

      // Missing test data is not drift and cannot be healed: skip before spending a browser replay
      // budget, and keep it out of the technical writers' findings entirely.
      const fixture = checkFixtureFailure({
        errorMessage: target.errorMessage,
        attemptedLocator: target.currentSelector ?? extractAttemptedLocator(target.errorMessage),
        snapshotPath: target.snapshotPath,
      });
      if (fixture.isFixtureFailure) {
        log(`🧪 missing test fixture (${fixture.confidence}) — ${fixture.reason}`);
        log(`   not healable and not doc drift; skipping`);
        fixtureFailures.push({ target, verdict: fixture });
        continue;
      }
      const result = await repairLoop(target, cfg, {
        browser: browser!,
        audit,
        deadline,
        log,
        escalate: cfg.enableLlmEscalation ? escalateToLlm : undefined,
      });

      if (result.outcome === "skipped") {
        log(`⏭️  skipped — ${result.genuineFailureReason}`);
        skipped.push(result);
        continue;
      }

      // Infrastructure noise, not documentation drift — reported separately so writers only ever see
      // findings that are actually about the docs.
      if (result.outcome === "environment-failure") {
        log(`🌐 environment failure — ${result.genuineFailureReason}`);
        envFailures.push(result);
        continue;
      }

      // The repair loop already wrote the fix to the flow-level selector layer and re-ran the flow
      // through the real `loadOverrides()` resolution path — so reaching "healed" already proves the
      // written override takes effect. Nothing to write or re-verify here.
      if (result.outcome === "healed" && result.resolvedSelector) {
        log(`✅ verified by replay through the written override: ${result.resolvedSelector} (${result.resolvedBy})`);
        if (cfg.dryRun) {
          log(`🧪 dry-run — write was reverted; would have appended to the chain`);
        } else if (result.writtenTo) {
          log(`✍️  ${path.relative(REPO_ROOT, result.writtenTo)}`);
        }
        healed.push({
          result,
          chain: result.newChain ?? result.resolvedSelector,
          file: result.writtenTo ?? flowSelectorPath(target.project, target.module, target.flowId),
        });
        continue;
      }

      log(`❌ genuine failure — ${result.genuineFailureReason}`);
      genuine.push(await buildGenuineFailureReport(result));
    }
  } finally {
    await browser?.close().catch(() => {});
  }

  // ── commit / PR (opt-in) ────────────────────────────────────────────────────────────────────────
  let branch: string | undefined;
  if (doCommit && healed.length && !cfg.dryRun) {
    branch = `auto-heal/${new Date().toISOString().slice(0, 10)}-${process.env.GITHUB_RUN_ID ?? Date.now()}`;
    try {
      sh(`git checkout -b "${branch}"`);
      // One commit per doc/flow so history stays traceable.
      for (const h of healed) {
        sh(`git add "${path.relative(REPO_ROOT, h.file)}"`);
        const msgFile = path.join(reportDir, "healing", `.commitmsg-${h.result.target.flowId}.txt`);
        fs.writeFileSync(msgFile, commitMessage(h.result, h.chain), "utf8");
        sh(`git commit -F "${msgFile}"`);
        fs.unlinkSync(msgFile);
      }
      log(`\n🌿 committed ${healed.length} fix(es) on ${branch}`);
      if (doPr) {
        sh(`git push -u origin "${branch}"`);
        const body = [
          `Auto-healed ${healed.length} stale selector(s) after a failed scheduled run.`,
          ``,
          `Each fix **appends** the recovered selector to the existing chain, so the original locator`,
          `still matches first — a wrong heal is inert rather than destructive. Every fix was verified`,
          `by replaying the full flow after write-back.`,
          ``,
          ...healed.map(
            (h) =>
              `- \`${h.result.target.flowId}\` step ${h.result.target.stepNumber} — ${h.result.resolvedBy} — \`${h.result.resolvedSelector}\``
          ),
          ``,
          `Audit log: \`${audit.path}\``,
          ``,
          `🤖 Generated with [Claude Code](https://claude.com/claude-code)`,
        ].join("\n");
        const bodyFile = path.join(reportDir, "healing", ".pr-body.md");
        fs.writeFileSync(bodyFile, body, "utf8");
        sh(`gh pr create --title "fix: auto-heal ${healed.length} stale selector(s)" --body-file "${bodyFile}"`);
        log(`🔗 PR opened`);
      }
    } catch (err: any) {
      log(`⚠️  git/PR step failed: ${err?.message ?? err}`);
    }
  }

  // ── artifacts ───────────────────────────────────────────────────────────────────────────────────
  const outDir = path.join(reportDir, "healing");
  fs.mkdirSync(outDir, { recursive: true });

  const summary = {
    reportDir,
    generatedAt: new Date().toISOString(),
    dryRun: cfg.dryRun,
    branch,
    counts: {
      targets: targets.length,
      healed: healed.length,
      genuine: genuine.length,
      environmentFailures: envFailures.length,
      skipped: skipped.length,
      overrideIneffective: ineffective.length,
      fixtureFailures: fixtureFailures.length,
      preconditionFailures: preconditionFailures.length,
      driftWarnings: driftWarnings.length,
      flowJsonUpdatesApplied: flowUpdates.filter((u) => u.applied).length,
      jsonCorrected: jsonCorrected.length,
      docOutOfDate: driftWarnings.filter((w) => w.docCheck?.verdict === "doc-confirms-flow").length,
      flowJsonOutOfDate: driftWarnings.filter((w) => w.docCheck?.verdict === "doc-matches-app").length,
    },
    healed: healed.map((h) => ({
      flowId: h.result.target.flowId,
      docTitle: h.result.target.docTitle,
      stepNumber: h.result.target.stepNumber,
      strategy: h.result.resolvedBy,
      resolvedSelector: h.result.resolvedSelector,
      newChain: h.chain,
      file: path.relative(REPO_ROOT, h.file),
      attempts: h.result.attempts.length,
    })),
    preconditionFailures: preconditionFailures.map((f) => ({
      flowId: f.target.flowId,
      stepNumber: f.target.stepNumber,
      kind: f.verdict.kind,
      hint: f.verdict.hint,
      reason: f.verdict.reason,
    })),
    fixtureFailures: fixtureFailures.map((f) => ({
      flowId: f.target.flowId,
      stepNumber: f.target.stepNumber,
      fixtureToken: f.verdict.fixtureToken,
      confidence: f.verdict.confidence,
      reason: f.verdict.reason,
    })),
    docCoverageFindings: sequenceReports.filter((r) => r.findings.length),
    jsonCorrected,
    flowJsonUpdates: flowUpdates,
    docDriftWarnings: driftWarnings,
    genuineFailures: genuine,
    environmentFailures: envFailures.map((e) => ({
      flowId: e.target.flowId,
      stepNumber: e.target.stepNumber,
      reason: e.genuineFailureReason,
    })),
    skipped: skipped.map((s) => ({ flowId: s.target.flowId, reason: s.genuineFailureReason })),
    auditLog: path.relative(REPO_ROOT, audit.path),
  };
  fs.writeFileSync(path.join(outDir, "healing-summary.json"), JSON.stringify(summary, null, 2), "utf8");

  const md = [
    `# Self-healing run — ${new Date().toISOString()}`,
    ``,
    `| | count |`,
    `|---|---|`,
    `| Auto-healed (locator drift) | ${healed.length} |`,
    `| JSON corrected from the doc (then passed) | ${jsonCorrected.length} |`,
    `| Genuine doc/app mismatch | ${genuine.length} |`,
    `| Documentation drift (warning, not healable) | ${driftWarnings.length} |`,
    `| Control found but disabled / wrong state | ${preconditionFailures.length} |`,
    `| Missing test fixture (not doc drift) | ${fixtureFailures.length} |`,
    `| Environment failure (not doc drift) | ${envFailures.length} |`,
    `| Skipped | ${skipped.length} |`,
    `| Override ineffective | ${ineffective.length} |`,
    ``,
    ...(envFailures.length
      ? [
          `> ${envFailures.length} flow(s) could not be evaluated because the session or page was broken —`,
          `> infrastructure noise, deliberately excluded from the doc/app drift findings below.`,
          ``,
        ]
      : []),
    ...(healed.length
      ? [
          `## Auto-healed`,
          ``,
          ...healed.map(
            (h) =>
              `- **${h.result.target.docTitle}** — step ${h.result.target.stepNumber}, ${h.result.resolvedBy}: \`${h.result.resolvedSelector}\``
          ),
          ``,
        ]
      : []),
    ...(genuine.length ? [`## Genuine doc/app mismatch`, ``, ...genuine.map(renderGenuineFailureMarkdown), ``] : []),
    ...(jsonCorrected.length
      ? [
          `## Flow JSON corrected from the documentation`,
          ``,
          `Our test file disagreed with the doc. It was corrected to the DOC's wording and the flow then`,
          `passed — a test-authoring fix, not a doc defect. Flagged for review in case the DOC is actually`,
          `the side that should change.`,
          ``,
          ...jsonCorrected.map(
            (j) => `- \`${j.flowId}\` step ${j.stepNumber}: "${j.from}" → "${j.to}"`
          ),
          ``,
        ]
      : []),
    ...(preconditionFailures.length
      ? [
          `## Control found but not usable (not documentation drift)`,
          ``,
          `The element was located and visible but disabled, or held the wrong state. No selector change`,
          `can fix these — an unmet precondition is blocking them. For the automation team.`,
          ``,
          ...preconditionFailures.map(
            (f) =>
              `- \`${f.target.flowId}\` step ${f.target.stepNumber} — ${f.verdict.kind}` +
              (f.verdict.hint ? `\n  - hint: ${f.verdict.hint}` : "")
          ),
          ``,
        ]
      : []),
    ...(fixtureFailures.length
      ? [
          `## Missing test fixtures (not documentation drift)`,
          ``,
          `These steps looked for test data a sibling flow was supposed to create. The UI and the docs`,
          `are fine — the fixture was absent, so no selector change could help. For the automation team.`,
          ``,
          ...fixtureFailures.map(
            (f) =>
              `- \`${f.target.flowId}\` step ${f.target.stepNumber} — looked for \`${f.verdict.fixtureToken}\` (${f.verdict.confidence})`
          ),
          ``,
        ]
      : []),
    ...renderWarningsMarkdown(driftWarnings),
    ...renderSequenceFindings(sequenceReports),
  ].join("\n");
  fs.writeFileSync(path.join(outDir, "healing-report.md"), md, "utf8");

  audit.runFinished(summary.counts);

  log(`\n${"─".repeat(60)}`);
  log(
    `✅ healed: ${healed.length}   📝 json-corrected: ${jsonCorrected.length}   ❌ genuine doc/app: ${genuine.length}   🚫 precondition: ${preconditionFailures.length}   🧪 fixture: ${fixtureFailures.length}   ⚠️  doc-drift warnings: ${driftWarnings.length}   ⏭️  skipped: ${skipped.length}`
  );
  log(`📄 ${path.relative(REPO_ROOT, path.join(outDir, "healing-report.md"))}`);
  log(`🧾 ${path.relative(REPO_ROOT, audit.path)}`);

  // ── Slack (opt-in) ──────────────────────────────────────────────────────────────────────────────
  if (doSlack && process.env.SLACK_BOT_TOKEN && process.env.SLACK_CHANNEL_ID) {
    const text = [
      `🔧 *Self-healing agent* — ${healed.length} auto-healed, ${genuine.length} genuine mismatch(es)`,
      branch ? `Branch: \`${branch}\`` : undefined,
      ...genuine.slice(0, 5).map((g) => `• *${g.docTitle}* step ${g.stepNumber}: \`${g.searchedFor}\` not found`),
    ]
      .filter(Boolean)
      .join("\n");
    try {
      const res = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
        },
        body: JSON.stringify({
          channel: process.env.SLACK_CHANNEL_ID,
          text,
          // Thread under the original failure notification when the caller supplies its ts.
          ...(process.env.SLACK_THREAD_TS ? { thread_ts: process.env.SLACK_THREAD_TS } : {}),
        }),
      });
      log((await res.json())?.ok ? `💬 Slack posted` : `⚠️  Slack post rejected`);
    } catch (err: any) {
      log(`⚠️  Slack post failed: ${err?.message ?? err}`);
    }
  }

  // Genuine doc/app drift is a real finding — surface it as a non-zero exit for CI.
  if (genuine.length) process.exitCode = 2;
}

main().catch((err) => {
  console.error(`Fatal: ${err?.stack ?? err}`);
  process.exit(1);
});

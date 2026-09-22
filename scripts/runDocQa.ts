#!/usr/bin/env npx ts-node
/**
 * One-command docs QA: give it doc URLs, get one report per doc covering BOTH halves.
 *
 *   A. the documented steps, performed in the browser against the real app
 *   B. the Doc Testing Checklist + Style Guide audit of the published page
 *
 * This script does not reimplement either half — it orchestrates what already
 * exists (bulkIngestFromUrls → flows.spec.ts → docs-checklist.spec.ts →
 * generateCombinedDocReport.ts) and adds the roll-up index across all URLs.
 *
 * Usage:
 *   npx ts-node scripts/runDocQa.ts --url https://www.contentstack.com/docs/...
 *   npx ts-node scripts/runDocQa.ts --urls data/my-urls.txt
 *   npx ts-node scripts/runDocQa.ts --urls list.txt --skip-flows      # page audit only
 *
 * Staging / dev docs:
 *   npx ts-node scripts/runDocQa.ts --urls list.txt \
 *     --docs-user <u> --docs-pass <p> \        # HTTP basic auth on the doc page
 *     --app-origin https://<stag-app-host> \   # which product env the steps run against
 *     --stack "My Stack"
 *
 * Every option also reads from the environment, so the web UI (phase 2) can set
 * env vars instead of building an argv.
 */

import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import { normalizeCanonicalDocUrl, parseDocsUrlsCsvFile } from "../core/docsUrlsCsv";
import { loadRuntimeEnv } from "../core/env";

const ROOT = process.cwd();

// The Playwright specs get .env via global-setup, but this script reads CS_EMAIL/CS_PASSWORD
// itself for the login preflight, so it must load .env the same way the rest of the repo does.
loadRuntimeEnv();

// ---------------------------------------------------------------------------
// args
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i++;
    } else {
      out[key] = true;
    }
  }
  return out;
}

const args = parseArgs(process.argv);
const str = (k: string, envKey?: string): string =>
  (typeof args[k] === "string" ? (args[k] as string) : envKey ? process.env[envKey] || "" : "").trim();
const flag = (k: string): boolean => args[k] === true || args[k] === "true";

const REPORT_DIR = path.resolve(
  ROOT,
  str("report-dir", "REPORT_DIR") || `reports/docqa-${new Date().toISOString().replace(/[:.]/g, "-")}`
);

// ---------------------------------------------------------------------------
// URL input
// ---------------------------------------------------------------------------

/** One URL per line, or a `project,url` CSV, or --url a,b,c. Comments and blanks ignored. */
function resolveUrls(): string[] {
  const raw: string[] = [];

  const inline = str("url");
  if (inline) raw.push(...inline.split(",").map((s) => s.trim()));

  const file = str("urls", "DOCQA_URLS_FILE");
  if (file) {
    const p = path.resolve(ROOT, file);
    if (!fs.existsSync(p)) die(`--urls file not found: ${p}`);
    if (p.endsWith(".csv")) {
      raw.push(...parseDocsUrlsCsvFile(p).map((r) => r.url));
    } else {
      raw.push(
        ...fs
          .readFileSync(p, "utf-8")
          .split(/\r?\n/)
          .map((l) => l.trim())
          .filter((l) => l && !l.startsWith("#"))
      );
    }
  }

  const envList = str("", "DOCQA_URLS");
  if (envList) raw.push(...envList.split(",").map((s) => s.trim()));

  const seen = new Set<string>();
  const urls: string[] = [];
  for (const u of raw) {
    if (!u) continue;
    // Staging/dev hosts are left alone — only production docs URLs get canonicalised.
    const norm = /(?:^|\/\/)www\.contentstack\.com\//.test(u) ? normalizeCanonicalDocUrl(u) : u.replace(/\/$/, "");
    if (seen.has(norm)) continue;
    seen.add(norm);
    urls.push(norm);
  }
  return urls;
}

function die(msg: string): never {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// doc-type router
// ---------------------------------------------------------------------------

export type DocKind = "ui-flow" | "cli" | "sdk" | "api" | "kickstart";

const KICKSTART_SLUGS = [
  "next", "nuxt", "react", "angular", "astro", "sveltekit", "svelte", "veda", "vue", "gatsby",
];

/**
 * Which half-A executor can perform this doc's steps.
 *
 * Only `ui-flow` is executed by this repo. The others are named — not silently
 * dropped — so the report can say "the page was audited, the steps were not run,
 * and here is the project that runs them".
 */
export function classifyDoc(url: string): DocKind {
  const p = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();

  if (p.includes("/docs/developers/apis/")) return "api";
  if (p.includes("/docs/developers/sdks/")) return "sdk";
  if (/\bcli\b/.test(p) || p.includes("-using-the-cli") || p.includes("csdx")) return "cli";

  const last = p.replace(/\/$/, "").split("/").pop() || "";
  if (p.includes("/docs/headless-cms/") && KICKSTART_SLUGS.includes(last)) return "kickstart";

  return "ui-flow";
}

const EXECUTOR_FOR: Record<DocKind, string> = {
  "ui-flow": "this repo (flows.spec.ts)",
  cli: "Developer-Resources-Docs-Automation/cli-automation",
  sdk: "Developer-Resources-Docs-Automation/sdk-automation",
  kickstart: "Developer-Resources-Docs-Automation/kickstart-automation",
  api: "api-docs-automation",
};

// ---------------------------------------------------------------------------
// existing-flow index — an old doc's curated flow beats an auto-generated one
// ---------------------------------------------------------------------------

type FlowFile = { id: string; source?: string; project?: string; module?: string; type?: string; steps?: unknown[] };

/** Every flow/selector file currently on disk, repo-relative — used to report what a run created. */
function listFlowFiles(): string[] {
  const root = path.join(ROOT, "projects");
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".flow.json") || name.endsWith(".selectors.ts")) out.push(path.relative(ROOT, p));
    }
  };
  walk(root);
  return out.sort();
}

function indexExistingFlows(): Map<string, FlowFile[]> {
  const byUrl = new Map<string, FlowFile[]>();
  const root = path.join(ROOT, "projects");
  if (!fs.existsSync(root)) return byUrl;

  const walk = (dir: string) => {
    for (const name of fs.readdirSync(dir)) {
      const p = path.join(dir, name);
      if (fs.statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".flow.json")) {
        try {
          const flow = JSON.parse(fs.readFileSync(p, "utf-8")) as FlowFile;
          if (!flow.source) continue;
          const key = normalizeCanonicalDocUrl(flow.source).replace(/\/$/, "");
          const list = byUrl.get(key) || [];
          list.push(flow);
          byUrl.set(key, list);
        } catch {
          /* a malformed flow file must not abort the whole run */
        }
      }
    }
  };
  walk(root);
  return byUrl;
}

// ---------------------------------------------------------------------------
// project / module derivation for newly-ingested docs
// ---------------------------------------------------------------------------

const PROJECT_BY_SEGMENT: Record<string, string> = {
  "content-managers": "CMS",
  "headless-cms": "CMS",
  developers: "CMS",
  launch: "Launch",
  personalize: "Personalize",
  studio: "Studio",
  administration: "Administration",
  marketplace: "Marketplace",
  "developer-hub": "Developer-Hub",
  analytics: "Analytics",
  "brand-kit": "BrandKit",
  agentos: "AgentOS",
};

function deriveTarget(url: string): { project: string; module: string; id: string } {
  const segs = (() => {
    try {
      return new URL(url).pathname.split("/").filter(Boolean);
    } catch {
      return [];
    }
  })();
  const afterDocs = segs[0] === "docs" ? segs.slice(1) : segs;
  const project = PROJECT_BY_SEGMENT[afterDocs[0]] || "AdHoc";
  const module = afterDocs.length > 2 ? afterDocs[1] : afterDocs[0] || "general";
  const id = (afterDocs[afterDocs.length - 1] || "doc").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return { project, module, id };
}

// ---------------------------------------------------------------------------
// login preflight
// ---------------------------------------------------------------------------

/**
 * One POST /v3/user-session to find out whether the steps half can run at all.
 *
 * global-setup.ts waits for that endpoint to return **200**, so every non-200 — a wrong
 * password, a rate limit, a locked account — presents identically as a 90s timeout with no
 * cause. This reads the actual status and error_message instead, and lets the caller stop
 * before a browser adds another rejected attempt to the account's lockout counter.
 */
async function preflightLogin(
  email: string | undefined,
  password: string | undefined,
  appOrigin: string
): Promise<{ ok: boolean; reason: string }> {
  if (!email || !password) {
    return { ok: false, reason: "CS_EMAIL / CS_PASSWORD are not set (pass --email / --password, or set them in .env)." };
  }
  const origin = (appOrigin || "https://app.contentstack.com").replace(/\/$/, "");
  try {
    const res = await fetch(`${origin}/api/v3/user-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: { email, password } }),
    });
    if (res.ok) return { ok: true, reason: "" };

    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { error_message?: string; error_code?: number };
      if (body.error_message) detail = `HTTP ${res.status} — ${body.error_message}`;
      // 104 = account locked after 10 rejected attempts. Unlocking alone is not the fix if
      // the stored password is stale: the next run simply re-locks it.
      if (body.error_code === 104) {
        detail += "\n    (An account only reaches this after 10 REJECTED attempts — check that " +
          "CS_PASSWORD is current, not just that the account was unlocked.)";
      }
    } catch {
      /* non-JSON error body — the status alone is the signal */
    }
    return { ok: false, reason: detail };
  } catch (e) {
    return { ok: false, reason: `could not reach ${origin}: ${String(e)}` };
  }
}

// ---------------------------------------------------------------------------
// child-process helpers
// ---------------------------------------------------------------------------

function run(cmd: string, argv: string[], env: NodeJS.ProcessEnv, label: string): number {
  console.log(`\n▶ ${label}\n  ${cmd} ${argv.join(" ")}`);
  const res = spawnSync(cmd, argv, { stdio: "inherit", env: { ...process.env, ...env }, cwd: ROOT, shell: false });
  if (res.error) {
    console.error(`  ✖ ${label} could not start: ${res.error.message}`);
    return 1;
  }
  return res.status ?? 1;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

type DocPlan = {
  url: string;
  kind: DocKind;
  flowIds: string[];
  flowSource: "existing" | "generated" | "none";
  note: string;
};

async function main() {
  const urls = resolveUrls();
  if (!urls.length) {
    die(
      "No URLs. Pass --url <url> or --urls <file>.\n" +
        "  npx ts-node scripts/runDocQa.ts --url https://www.contentstack.com/docs/..."
    );
  }

  const skipFlows = flag("skip-flows");
  const skipChecklist = flag("skip-checklist");
  const headed = flag("headed");

  // Credentials / environment. Everything the two halves need, in one place.
  const env: NodeJS.ProcessEnv = { REPORT_DIR };
  const docsUser = str("docs-user", "STAG_DOCS_USERNAME");
  const docsPass = str("docs-pass", "STAG_DOCS_PASSWORD");
  if (docsUser && docsPass) {
    env.STAG_DOCS_USERNAME = docsUser;
    env.STAG_DOCS_PASSWORD = docsPass;
  }
  const appOrigin = str("app-origin", "CS_APP_ORIGIN");
  if (appOrigin) env.CS_APP_ORIGIN = appOrigin;
  const email = str("email", "CS_EMAIL");
  const password = str("password", "CS_PASSWORD");
  if (email) env.CS_EMAIL = email;
  if (password) env.CS_PASSWORD = password;
  const stack = str("stack", "DEFAULT_STACK");
  if (stack) env.DEFAULT_STACK = stack;

  // auth.json can be written empty while the fast path only checks the file exists,
  // so a prod session can silently survive a switch to staging. Always re-login when
  // this run names an app environment or credentials of its own.
  if (appOrigin || email) env.FORCE_RELOGIN = "true";

  fs.mkdirSync(REPORT_DIR, { recursive: true });

  console.log("\n════════════════════════════════════════════════════════");
  console.log(" Docs QA run");
  console.log("════════════════════════════════════════════════════════");
  console.log(` URLs        : ${urls.length}`);
  console.log(` Report dir  : ${path.relative(ROOT, REPORT_DIR)}`);
  console.log(` App origin  : ${appOrigin || "(default — app.contentstack.com)"}`);
  console.log(` Docs auth   : ${docsUser ? "basic auth supplied" : "none (public docs)"}`);
  console.log(` Steps half  : ${skipFlows ? "SKIPPED" : "enabled"}`);
  console.log(` Audit half  : ${skipChecklist ? "SKIPPED" : "enabled"}`);

  // -- plan -----------------------------------------------------------------
  const existing = indexExistingFlows();
  const plans: DocPlan[] = [];
  const toIngest: Array<{ url: string; project: string; module: string; id: string }> = [];

  for (const url of urls) {
    const kind = classifyDoc(url);
    const key = normalizeCanonicalDocUrl(url).replace(/\/$/, "");
    const found = existing.get(key) || [];

    if (found.length) {
      const executable = found.filter((f) => (f.steps?.length ?? 0) > 0);
      plans.push({
        url,
        kind,
        flowIds: found.map((f) => f.id),
        flowSource: "existing",
        note: executable.length
          ? `${found.length} curated flow(s) already exist for this URL — reused, not regenerated.`
          : `Flow exists but is informational (no steps). Page audit only.`,
      });
      continue;
    }

    if (kind !== "ui-flow") {
      plans.push({
        url,
        kind,
        flowIds: [],
        flowSource: "none",
        note: `Steps for a ${kind} doc are executed by ${EXECUTOR_FOR[kind]}, not this repo. Page audited only.`,
      });
      continue;
    }

    const t = deriveTarget(url);
    toIngest.push({ url, ...t });
    plans.push({ url, kind, flowIds: [t.id], flowSource: "generated", note: "No existing flow — generated from the doc." });
  }

  console.log(`\n Plan: ${plans.filter((p) => p.flowSource === "existing").length} existing flow(s), ` +
    `${toIngest.length} to generate, ` +
    `${plans.filter((p) => p.flowSource === "none").length} page-audit-only`);

  // -- 1. ingest new docs ---------------------------------------------------
  // Ingest writes real flow/selector files into projects/ and appends to data/docs-urls.csv.
  // That persistence is the point — today's generated flow becomes tomorrow's curated one —
  // but it means a QA run modifies the repo, so the run states exactly what it created.
  const flowFilesBefore = listFlowFiles();
  if (toIngest.length && !skipFlows) {
    const csvPath = path.join(REPORT_DIR, "ingest-input.csv");
    const rows = ["url,module,id,project,stage"];
    for (const it of toIngest) rows.push(`${it.url},${it.module},${it.id},${it.project},main`);
    fs.writeFileSync(csvPath, rows.join("\n"), "utf-8");

    const code = run(
      "npx",
      ["ts-node", "scripts/bulkIngestFromUrls.ts", "--input", path.relative(ROOT, csvPath), "--analyze-docs"],
      env,
      `Ingest ${toIngest.length} new doc(s) → flow files`
    );
    if (code !== 0) console.warn("  ⚠ ingest reported a non-zero exit — continuing; generated flows may be incomplete.");
  }

  // Re-index so generated flows are visible, and drop planned ids that never materialised.
  const afterIngest = indexExistingFlows();
  const allFlowIds = new Set<string>();
  for (const plan of plans) {
    if (plan.flowSource === "generated") {
      const found = afterIngest.get(normalizeCanonicalDocUrl(plan.url).replace(/\/$/, "")) || [];
      if (!found.length) {
        plan.flowIds = [];
        plan.flowSource = "none";
        plan.note =
          "Could not derive executable steps from this page — the doc may be conceptual, " +
          "or its steps use UI the step mapper does not know yet. Page audited only.";
      } else {
        plan.flowIds = found.map((f) => f.id);
      }
    }
    for (const id of plan.flowIds) allFlowIds.add(id);
  }

  // -- 2. half A: perform the documented steps ------------------------------
  // Preflight the login with ONE API call before opening a browser. The browser path costs
  // an attempt per run (more with retries), and Contentstack locks an account after 10
  // rejected attempts — so a stale password silently escalates into a lockout that blocks
  // every other automation using the same QA user. One call, then stop.
  let loginOk = true;
  if (!skipFlows && allFlowIds.size) {
    const check = await preflightLogin(env.CS_EMAIL || process.env.CS_EMAIL, env.CS_PASSWORD || process.env.CS_PASSWORD, appOrigin);
    loginOk = check.ok;
    if (!check.ok) {
      console.error(`\n  ✖ Skipping the steps half — login preflight failed: ${check.reason}`);
      console.error("    No browser was opened, so this run added no further login attempts.");
      console.error("    Every doc below is marked “steps not run”; half B (page audit) still runs.\n");
    }
  }

  let flowsRan = false;
  if (!skipFlows && loginOk && allFlowIds.size) {
    const grep = [...allFlowIds].map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const argv = ["playwright", "test", "tests/flows.spec.ts", "--project=flows", "-g", grep];
    if (headed) argv.push("--headed");
    // A failing step is a finding, not a runner error — never abort the run on exit code.
    run("npx", argv, env, `Perform documented steps (${allFlowIds.size} flow(s))`);
    flowsRan = true;
  }

  // The combined report treats any flow id absent from ran-flows.json as executed, so an
  // unrun flow renders as all-steps-passed. Mark every id this run did not actually execute
  // — skipped by request, no flow at all, or a doc type another project runs — as not run.
  markUnexecuted(plans, flowsRan);

  // -- 3. half B: checklist + style guide audit (runs for EVERY url) --------
  // SKIP_LOGIN=1 is not optional here. The audit reads published pages anonymously, but
  // global-setup would still try an app login first — so a locked, rate-limited or simply
  // unsupplied QA account aborts the whole Playwright run and every page silently reports
  // zero rules checked. It also stops each audit adding another failed login attempt.
  if (!skipChecklist) {
    // The docs-checklist project declares storageState: "auth.json"; with SKIP_LOGIN=1 nothing
    // creates it, and Playwright errors on a missing file. An empty state is correct here —
    // the audit is meant to see the page as a logged-out reader does.
    const authPath = path.join(ROOT, "auth.json");
    if (!fs.existsSync(authPath)) {
      fs.writeFileSync(authPath, JSON.stringify({ cookies: [], origins: [] }, null, 2), "utf-8");
      console.log("  ℹ auth.json was missing — wrote an empty state for the anonymous page audit.");
    }
    run(
      "npx",
      ["playwright", "test", "tests/docs-checklist.spec.ts", "--project=docs-checklist"],
      { ...env, DOCS_CHECKLIST_URL: urls.join(","), SKIP_LOGIN: "1", FORCE_RELOGIN: "" },
      `Checklist + style-guide audit (${urls.length} page(s))`
    );
  }

  // -- 4. one combined report per doc ---------------------------------------
  for (const plan of plans) {
    const reportId = plan.flowIds[0] || deriveTarget(plan.url).id;
    run(
      "npx",
      ["ts-node", "scripts/generateCombinedDocReport.ts", reportId, plan.url],
      env,
      `Combined report — ${reportId}`
    );
  }

  // -- 5. indexes ------------------------------------------------------------
  // The per-doc roll-up already exists (run-docs-full-pass.sh uses it); this run writes
  // ran-flows.json in the shape it reads, so reuse it rather than duplicating the table.
  run("npx", ["ts-node", "scripts/generateFullPassIndex.ts"], env, "Per-doc index (shared with full-pass)");

  // Then the one thing that index cannot know: which doc types were routed where, what was
  // generated, and which pages had no executor at all.
  const created = listFlowFiles().filter((f) => !flowFilesBefore.includes(f));
  writeIndex(plans, { flowsRan, skipFlows, skipChecklist, created });

  console.log("\n════════════════════════════════════════════════════════");
  const rel = path.relative(ROOT, REPORT_DIR);
  console.log(` Done.`);
  console.log(`   Per-doc results : ${path.join(rel, "full-pass-index.html")}`);
  console.log(`   Routing/coverage: ${path.join(rel, "docqa-coverage.html")}`);
  if (created.length) {
    console.log(`\n This run created ${created.length} file(s) in the repo:`);
    for (const f of created) console.log(`   ${f}`);
    console.log(" Review them before committing — `git checkout -- projects/ data/docs-urls.csv` to discard.");
  }
  console.log("════════════════════════════════════════════════════════\n");
}

/**
 * Merge `stepsExecuted: false` entries into ran-flows.json for every report id whose steps
 * were not performed in this run. Merges rather than overwrites, so ids that flows.spec.ts
 * genuinely executed keep their real result.
 */
function markUnexecuted(plans: DocPlan[], flowsRan: boolean) {
  const manifestPath = path.join(REPORT_DIR, "ran-flows.json");
  type Entry = { flowId: string; project?: string; module?: string; docUrl?: string; stepsExecuted?: boolean };
  const manifest: { flows: Entry[] } = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf-8"))
    : { flows: [] };
  const known = new Set((manifest.flows || []).map((f) => f.flowId));
  // Entries present before this function runs are the ones flows.spec.ts actually executed.
  const executedCount = known.size;

  for (const plan of plans) {
    const t = deriveTarget(plan.url);
    const ids = plan.flowIds.length ? plan.flowIds : [t.id];
    for (const id of ids) {
      // An id already in the manifest was put there by flows.spec.ts, which is the only
      // thing that can witness an execution — leave its verdict alone.
      if (known.has(id)) continue;
      // Everything else did NOT run. This is never `true`: invoking the flows command is
      // not evidence that a flow executed (global-setup can abort the whole Playwright run
      // before a single test starts), and a missing entry rendered as "passed" is the exact
      // false-pass this function exists to prevent.
      // docUrl/project/module match buildRanFlowsManifest.ts so generateFullPassIndex.ts
      // can read this run's manifest too.
      manifest.flows.push({
        flowId: id,
        project: t.project,
        module: t.module,
        docUrl: plan.url,
        stepsExecuted: false,
      });
      known.add(id);
    }
  }

  // Backfill docUrl on entries flows.spec.ts wrote, so the shared index can key on URL.
  for (const entry of manifest.flows) {
    if (entry.docUrl) continue;
    const plan = plans.find((p) => p.flowIds.includes(entry.flowId));
    if (plan) entry.docUrl = plan.url;
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  // Flows were attempted, yet flows.spec.ts recorded nothing: the Playwright run died before
  // any test started — almost always global-setup failing to log in. Say so loudly, because
  // the reports below will otherwise look like a doc with no problems.
  if (flowsRan && !executedCount) {
    console.warn(
      "\n  ⚠ The steps half was requested but NO flow was executed — the Playwright run aborted\n" +
        "    before any test started (check the global-setup login error above).\n" +
        "    Every doc in this report is marked “steps not run”. This is not a passing result."
    );
  }
}

// ---------------------------------------------------------------------------
// roll-up
// ---------------------------------------------------------------------------

const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const safeName = (u: string) => Buffer.from(u).toString("base64").replace(/[/+=]/g, "_");

function writeIndex(
  plans: DocPlan[],
  meta: { flowsRan: boolean; skipFlows: boolean; skipChecklist: boolean; created: string[] }
) {
  const readJson = (p: string, fallback: unknown) =>
    fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf-8")) : fallback;

  const failuresDoc = readJson(path.join(REPORT_DIR, "doc-step-failures.json"), { failures: [] }) as any;
  const warningsDoc = readJson(path.join(REPORT_DIR, "doc-step-warnings.json"), []) as any;
  const failures = failuresDoc.failures || [];
  const warnings = Array.isArray(warningsDoc) ? warningsDoc : warningsDoc.warnings || [];

  const rows = plans.map((plan) => {
    const audit = readJson(
      path.join(REPORT_DIR, "checklist-per-doc", `${safeName(plan.url)}.json`),
      null
    ) as any;
    const counts = audit?.counts ?? { PASS: 0, WARN: 0, FAIL: 0, NA: 0, NOT_CHECKED: 0 };
    const stepFails = failures.filter((f: any) => plan.flowIds.includes(f.flowId)).length;
    const stepWarns = warnings.filter((w: any) => plan.flowIds.includes(w.flowId)).length;
    const reportId = plan.flowIds[0] || deriveTarget(plan.url).id;
    return { plan, counts, stepFails, stepWarns, reportFile: `${reportId}-combined-report.html` };
  });

  const totals = rows.reduce(
    (a, r) => ({
      stepFails: a.stepFails + r.stepFails,
      stepWarns: a.stepWarns + r.stepWarns,
      findings: a.findings + r.counts.WARN,
      notChecked: a.notChecked + r.counts.NOT_CHECKED,
      unloadable: a.unloadable + r.counts.FAIL,
    }),
    { stepFails: 0, stepWarns: 0, findings: 0, notChecked: 0, unloadable: 0 }
  );

  const notExecuted = rows.filter((r) => r.plan.flowSource === "none");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Docs QA coverage — ${rows.length} page(s)</title>
<style>
 :root{--bg:#fff;--fg:#1b1c1e;--muted:#6b7280;--line:#e5e7eb;--card:#f9fafb;--fail:#b91c1c;--warn:#b45309;--pass:#15803d;--nc:#6d28d9}
 *{box-sizing:border-box}
 body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.55 Inter,system-ui,-apple-system,Segoe UI,sans-serif}
 .wrap{max-width:1100px;margin:0 auto;padding:40px 24px 80px}
 h1{font-size:28px;margin:0 0 6px;font-weight:600}
 .sub{color:var(--muted);margin:0 0 28px}
 .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:32px}
 .card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px}
 .card .n{font-size:26px;font-weight:600;line-height:1.1}
 .card .l{color:var(--muted);font-size:13px;margin-top:4px}
 .card.fail .n{color:var(--fail)} .card.warn .n{color:var(--warn)} .card.nc .n{color:var(--nc)}
 table{width:100%;border-collapse:collapse;font-size:14px}
 th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
 th{font-weight:600;color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em}
 td.num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
 a{color:#4338ca}
 .kind{display:inline-block;font-size:11px;padding:2px 7px;border-radius:99px;background:#eef2ff;color:#4338ca;white-space:nowrap}
 .note{color:var(--muted);font-size:12.5px;margin-top:4px;max-width:52ch}
 .banner{border:1px solid var(--line);border-left:3px solid var(--nc);background:var(--card);border-radius:8px;padding:14px 16px;margin:28px 0;font-size:14px}
 .banner h3{margin:0 0 6px;font-size:14px}
 footer{margin-top:40px;color:var(--muted);font-size:12.5px;border-top:1px solid var(--line);padding-top:16px}
 .scroll{overflow-x:auto}
</style></head><body><div class="wrap">
<h1>Docs QA — routing &amp; coverage</h1>
<p class="sub">${rows.length} page(s) · ${esc(new Date().toISOString())} · per-doc results: <a href="full-pass-index.html">full-pass-index.html</a></p>

<div class="cards">
  <div class="card fail"><div class="n">${totals.stepFails}</div><div class="l">Step failures</div></div>
  <div class="card warn"><div class="n">${totals.stepWarns}</div><div class="l">Step warnings</div></div>
  <div class="card warn"><div class="n">${totals.findings}</div><div class="l">Checklist / style findings</div></div>
  <div class="card nc"><div class="n">${totals.notChecked}</div><div class="l">Not checked</div></div>
  <div class="card fail"><div class="n">${totals.unloadable}</div><div class="l">Pages that would not load</div></div>
</div>

<div class="scroll"><table>
<thead><tr><th>Doc</th><th>Type</th><th class="num">Step fail</th><th class="num">Step warn</th><th class="num">Findings</th><th class="num">Not checked</th><th>Report</th></tr></thead>
<tbody>
${rows
  .map(
    (r) => `<tr>
  <td><a href="${esc(r.plan.url)}" target="_blank" rel="noreferrer">${esc(r.plan.url.replace(/^https?:\/\/[^/]+/, ""))}</a>
      <div class="note">${esc(r.plan.note)}</div></td>
  <td><span class="kind">${esc(r.plan.kind)}</span></td>
  <td class="num">${r.stepFails || "—"}</td>
  <td class="num">${r.stepWarns || "—"}</td>
  <td class="num">${r.counts.WARN || "—"}</td>
  <td class="num">${r.counts.NOT_CHECKED || "—"}</td>
  <td><a href="${esc(r.reportFile)}">open</a></td>
</tr>`
  )
  .join("\n")}
</tbody></table></div>

${
  notExecuted.length
    ? `<div class="banner"><h3>Steps not executed for ${notExecuted.length} page(s)</h3>
   <p style="margin:0 0 8px">These pages were audited against the checklist and style guide, but their documented
   steps were not performed here. This is stated rather than counted as a pass.</p>
   <ul style="margin:0;padding-left:20px">${notExecuted
     .map((r) => `<li><code>${esc(r.plan.url.replace(/^https?:\/\/[^/]+/, ""))}</code> — ${esc(r.plan.note)}</li>`)
     .join("")}</ul></div>`
    : ""
}

${
  meta.created.length
    ? `<div class="banner"><h3>This run created ${meta.created.length} file(s) in the repo</h3>
   <p style="margin:0 0 8px">Auto-generated flows persist so they can be reviewed and become curated flows.
   Review them before committing.</p>
   <ul style="margin:0;padding-left:20px">${meta.created.map((f) => `<li><code>${esc(f)}</code></li>`).join("")}</ul></div>`
    : ""
}

${meta.skipFlows ? `<div class="banner"><h3>--skip-flows was set</h3><p style="margin:0">No documented step was executed in this run. The steps column is empty by request, not because the steps passed.</p></div>` : ""}
${meta.skipChecklist ? `<div class="banner"><h3>--skip-checklist was set</h3><p style="margin:0">No page was audited against the checklist or style guide in this run.</p></div>` : ""}

<footer>
Half A (documented steps) is executed by <code>tests/flows.spec.ts</code>; half B (checklist + style guide) by
<code>tests/docs-checklist.spec.ts</code>. Findings never fail a run — only a page that cannot be loaded does.
Rules that automation cannot judge are always reported as “not checked”, so this report states its own coverage
rather than implying it.
</footer>
</div></body></html>`;

  fs.writeFileSync(path.join(REPORT_DIR, "docqa-coverage.html"), html, "utf-8");
  fs.writeFileSync(
    path.join(REPORT_DIR, "docqa-summary.json"),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        reportDir: path.relative(ROOT, REPORT_DIR),
        totals,
        docs: rows.map((r) => ({
          url: r.plan.url,
          kind: r.plan.kind,
          flowIds: r.plan.flowIds,
          flowSource: r.plan.flowSource,
          note: r.plan.note,
          stepFailures: r.stepFails,
          stepWarnings: r.stepWarns,
          checklist: r.counts,
          report: r.reportFile,
        })),
      },
      null,
      2
    ),
    "utf-8"
  );
}

main().catch((e) => die(String(e?.stack || e)));

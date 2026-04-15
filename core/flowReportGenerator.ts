/**
 * Generate HTML flow report (steps + warnings).
 * Used by flows.spec afterAll and scripts/generateFlowReportHtml.ts.
 */
import fs from "fs";
import path from "path";

function escapeHtml(s: string): string {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Relative URL from a flow report HTML file to a file under reportDir (e.g. flow-screenshots/x.png). */
function hrefFromReportHtmlToReportFile(reportHtmlAbs: string, fileRelativeToReportDir: string, reportDirAbs: string): string {
  const absFile = path.join(reportDirAbs, fileRelativeToReportDir);
  let rel = path.relative(path.dirname(reportHtmlAbs), absFile);
  rel = rel.split(path.sep).join("/");
  return encodeURI(rel);
}

/** Renders document link only for http(s) URLs; plain text for placeholders (e.g. unpublished docs). */
function formatDocumentUrlForHtml(documentUrl: string): string {
  const s = String(documentUrl || "").trim();
  if (!s) return escapeHtml("(no document URL)");
  if (/^https?:\/\//i.test(s)) {
    return `<a href="${escapeHtml(s)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s)}</a>`;
  }
  return escapeHtml(s);
}

function findFlowFile(root: string, flowId: string): string | null {
  const projectsDir = path.join(root, "projects");
  if (!fs.existsSync(projectsDir)) return null;
  const walk = (dir: string): string | null => {
    for (const n of fs.readdirSync(dir)) {
      const p = path.join(dir, n);
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        const found = walk(p);
        if (found) return found;
      } else if (n === `${flowId}.flow.json`) return p;
    }
    return null;
  };
  return walk(projectsDir);
}

export type FlowReportHtmlOptions = {
  /** Write under <reportDir>/<subdir>/<flowId>-report.html instead of report root. */
  subdir?: string;
  /** Extra HTML before closing wrapper (e.g. link to Playwright HTML report for screenshots). */
  extraFooterHtml?: string;
};

export function generateFlowReportHtml(
  flowId: string,
  reportDir?: string,
  options?: FlowReportHtmlOptions
): string | null {
  const root = process.cwd();
  const dir = reportDir ? path.resolve(root, reportDir) : path.resolve(root, "reports/latest");
  const flowPath = findFlowFile(root, flowId);
  if (!flowPath || !fs.existsSync(flowPath)) return null;

  const flow = JSON.parse(fs.readFileSync(flowPath, "utf-8"));
  const steps = flow.steps || [];
  const documentUrl = flow.source || flow.documentUrl || "";

  const warningsPath = path.join(dir, "doc-step-warnings.json");
  let warnings: Array<{ flowId?: string; stepNumber?: number; stepIndex?: number; target?: string; warningMessage?: string }> = [];
  if (fs.existsSync(warningsPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(warningsPath, "utf-8"));
      warnings = (payload.warnings || []).filter((w: any) => (w.flowId || "").toString() === flowId);
    } catch {
      // ignore
    }
  }

  const failuresPath = path.join(dir, "doc-step-failures.json");
  let failures: Array<{
    flowId?: string;
    stepNumber?: number;
    stepIndex?: number;
    target?: string;
    errorMessage?: string;
    missingElementSummary?: string;
    screenshotRelativePath?: string;
  }> = [];
  if (fs.existsSync(failuresPath)) {
    try {
      const payload = JSON.parse(fs.readFileSync(failuresPath, "utf-8"));
      failures = (payload.failures || []).filter((f: any) => (f.flowId || "").toString() === flowId);
    } catch {
      // ignore
    }
  }

  const reportDirAbs = path.resolve(dir);

  /** Latest failure per step for this flow (last in JSON array wins; avoids duplicate rows from merged runs). */
  const failureByStep = new Map<
    number,
    { msg: string; target: string; missing?: string; screenshotRel?: string }
  >();
  for (const f of failures) {
    const stepNum = Number(f.stepNumber ?? (typeof f.stepIndex === "number" ? f.stepIndex + 1 : 0));
    if (stepNum > 0) {
      const msg = (f.errorMessage || "").trim();
      if (msg)
        failureByStep.set(stepNum, {
          msg: escapeHtml(msg),
          target: escapeHtml(String(f.target || "")),
          missing: (f.missingElementSummary || "").trim() ? escapeHtml(String(f.missingElementSummary).trim()) : "",
          screenshotRel: (f.screenshotRelativePath || "").trim() ? String(f.screenshotRelativePath).trim() : "",
        });
    }
  }

  const warningByStep = new Map<number, string>();
  for (const w of warnings) {
    const stepNum = Number(w.stepNumber ?? (typeof w.stepIndex === "number" ? w.stepIndex + 1 : 1));
    if (stepNum > 0) {
      const existing = warningByStep.get(stepNum) || "";
      const msg = (w.warningMessage || "").trim();
      if (msg) warningByStep.set(stepNum, existing ? `${existing}<br/>${escapeHtml(msg)}` : escapeHtml(msg));
    }
  }

  const failedStepNums = [...failureByStep.keys()];
  const firstFailedStep = failedStepNums.length > 0 ? Math.min(...failedStepNums) : null;

  const outDir = options?.subdir ? path.join(dir, options.subdir) : dir;
  const reportHtmlAbsForHref = path.join(outDir, `${flowId}-report.html`);

  const stepsHtml = steps
    .map((s: any, i: number) => {
      const stepNum = i + 1;
      const fail = failureByStep.get(stepNum);
      const warn = warningByStep.get(stepNum);
      const skippedAfterFail = firstFailedStep !== null && stepNum > firstFailedStep;
      const rowClass = fail ? "step-failed" : skippedAfterFail ? "step-skipped" : warn ? "step-warning" : "";
      const action = escapeHtml(String(s.action || ""));
      const target = escapeHtml(String(s.target || ""));
      const expected = s.expected ? escapeHtml(JSON.stringify(s.expected)) : "—";
      const value = s.value ? escapeHtml(String(s.value)) : "—";
      let statusCell = "<td>—</td>";
      if (fail) {
        const missingBlock = fail.missing
          ? `<div class="missing-on-page"><strong>Not found on page:</strong> ${fail.missing}</div>`
          : "";
        const shot =
          fail.screenshotRel
            ? (() => {
                const href = hrefFromReportHtmlToReportFile(reportHtmlAbsForHref, fail.screenshotRel, reportDirAbs);
                const label = escapeHtml(fail.screenshotRel.split("/").pop() || "screenshot");
                return `<div class="fail-shot"><a href="${escapeHtml(href)}" target="_blank" rel="noopener">Open screenshot</a> · <span class="mono small">${label}</span></div><a href="${escapeHtml(href)}" target="_blank" rel="noopener"><img class="fail-thumb" src="${escapeHtml(href)}" alt="Failure screenshot step ${stepNum}" loading="lazy" /></a>`;
              })()
            : "";
        statusCell = `<td class="fail-msg"><strong>Failed</strong>${missingBlock}<div class="err-detail">${fail.msg}</div>${shot}</td>`;
      } else if (skippedAfterFail) {
        statusCell = `<td class="skipped-msg">Skipped — not executed after step ${firstFailedStep} failed. Warnings do not stop the flow; hard failures do.</td>`;
      } else if (warn) {
        statusCell = `<td class="warn-msg">⚠️ ${warn}</td>`;
      }
      return `<tr class="${rowClass}"><td>${stepNum}</td><td>${action}</td><td class="mono">${target}</td><td class="mono small">${expected}</td><td class="mono small">${value}</td>${statusCell}</tr>`;
    })
    .join("");

  const warningCount = warnings.length;
  const failureCount = failureByStep.size;
  let okSteps = 0;
  for (let si = 0; si < steps.length; si++) {
    const sn = si + 1;
    if (failureByStep.has(sn)) continue;
    if (firstFailedStep !== null && sn > firstFailedStep) continue;
    if (warningByStep.has(sn)) continue;
    okSteps++;
  }
  const passedApprox = okSteps;
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Flow Report: ${escapeHtml(flowId)}</title>
  <style>
    body{font-family:system-ui,-apple-system,sans-serif;background:#f6f7fb;margin:0;padding:24px;color:#1f2937}
    .wrap{max-width:1200px;margin:0 auto}
    h1{margin:0 0 8px 0}
    .meta{color:#6b7280;font-size:13px;margin-bottom:20px}
    .meta a{color:#6c5ce7}
    .cards{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
    .card{background:white;border-radius:10px;padding:14px 20px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
    .card .value{font-size:22px;font-weight:700}
    .card .label{font-size:12px;color:#6b7280}
    .green{color:#15803d}.red{color:#b91c1c}.amber{color:#b45309}
    section{background:white;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.08);margin-bottom:14px;overflow-x:auto}
    h2{font-size:17px;margin:0 0 12px 0}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{padding:9px 10px;border-bottom:1px solid #eceff3;text-align:left;vertical-align:top}
    th{background:#f8fafc;font-weight:600}
    .mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
    .small{font-size:11px;max-width:220px;word-break:break-all}
    .step-warning{background:#fffbeb}
    .step-failed{background:#fef2f2}
    .step-skipped{background:#f3f4f6}
    .skipped-msg{color:#4b5563;font-size:12px}
    .fail-msg{color:#b91c1c;font-size:12px}
    .missing-on-page{background:#fff7ed;border:1px solid #fdba74;border-radius:6px;padding:8px;margin:6px 0;font-size:12px;color:#9a3412}
    .err-detail{margin-top:6px;font-size:11px;color:#7f1d1d;word-break:break-word}
    .fail-shot{margin-top:8px;font-size:12px}
    .fail-thumb{max-width:100%;max-height:280px;margin-top:6px;border-radius:6px;border:1px solid #fecaca;cursor:zoom-in}
    .warn-msg{color:#b45309;font-size:12px}
    .warnings-box{background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-top:12px}
    .warnings-box h3{font-size:14px;margin:0 0 8px 0;color:#b45309}
    .warnings-box ul{margin:0;padding-left:18px}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Flow Report: ${escapeHtml(flowId)}</h1>
    <div class="meta">
      Document: ${formatDocumentUrlForHtml(documentUrl)}<br/>
      Generated: ${escapeHtml(new Date().toISOString())}
    </div>
    <div class="cards">
      <div class="card"><div class="value">${steps.length}</div><div class="label">Steps (in flow)</div></div>
      <div class="card"><div class="value ${failureCount > 0 ? "red" : "green"}">${failureCount}</div><div class="label">Failed steps</div></div>
      <div class="card"><div class="value amber">${warningCount}</div><div class="label">Warnings</div></div>
      <div class="card"><div class="value green">${passedApprox}</div><div class="label">OK (ran, no fail/warn)</div></div>
    </div>

    <section>
      <h2>Steps & Results</h2>
      <table>
        <thead>
          <tr><th>#</th><th>Action</th><th>Target</th><th>Expected</th><th>Value</th><th>Result / warning</th></tr>
        </thead>
        <tbody>${stepsHtml}</tbody>
      </table>
    </section>

    ${
      failureCount > 0
        ? `
    <section style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-top:12px">
      <h3 style="margin:0 0 8px 0;color:#b91c1c;font-size:15px">Failed steps (${failureCount})</h3>
      <p style="margin:0 0 8px 0;font-size:13px;color:#444">Execution stopped at the first hard failure; later steps in the flow were not run. Doc verification warnings (placement/labels) do not stop execution—only failures such as missing targets or timeouts do.</p>
      <ul style="margin:0;padding-left:18px">
        ${[...failureByStep.entries()]
          .sort((a, b) => a[0] - b[0])
          .map(([stepNum, row]) => {
            const { msg, target, missing, screenshotRel } = row;
            const miss = missing ? `<br/><em>Not on page:</em> ${missing}` : "";
            const pic = screenshotRel
              ? (() => {
                  const href = hrefFromReportHtmlToReportFile(reportHtmlAbsForHref, screenshotRel, reportDirAbs);
                  return `<br/><a href="${escapeHtml(href)}">Screenshot</a> <span class="mono">(${escapeHtml(screenshotRel)})</span>`;
                })()
              : "";
            return `<li><strong>Step ${stepNum}</strong> (${target}): ${msg}${miss}${pic}</li>`;
          })
          .join("")}
      </ul>
    </section>
    `
        : ""
    }
    ${
      warningCount > 0
        ? `
    <section class="warnings-box">
      <h3>⚠️ Doc verification warnings (${warningCount})</h3>
      <p>These indicate a mismatch between the document and the app. The flow continues; use these to improve docs/UI alignment.</p>
      <ul>
        ${warnings.map((w) => `<li><strong>Step ${(w.stepNumber ?? (w.stepIndex ?? 0) + 1)}</strong> (${escapeHtml(w.target || "")}): ${escapeHtml(w.warningMessage || "")}</li>`).join("")}
      </ul>
    </section>
    `
        : ""
    }
    ${options?.extraFooterHtml || ""}
  </div>
</body>
</html>`;

  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${flowId}-report.html`);
  fs.writeFileSync(outPath, html, "utf-8");
  return outPath;
}

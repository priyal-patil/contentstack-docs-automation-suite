/**
 * Post a short summary from unified-report.json to Slack Incoming Webhook.
 * Env: SLACK_WEBHOOK_URL, REPORT_DIR, RUN_URL, RUN_ID (set by GitHub Actions workflow).
 */
"use strict";

const fs = require("fs");
const https = require("https");
const { URL } = require("url");

const webhook = process.env.SLACK_WEBHOOK_URL;
const dir = process.env.REPORT_DIR;
const runUrl = process.env.RUN_URL;
const runId = process.env.RUN_ID;

if (!webhook) {
  console.log("SLACK_WEBHOOK_URL not set; skipping Slack.");
  process.exit(0);
}
if (!dir) {
  console.log("REPORT_DIR not set; skipping Slack.");
  process.exit(0);
}

const jsonPath = `${dir}/unified-report.json`;
if (!fs.existsSync(jsonPath)) {
  console.log("No unified-report.json; skipping Slack.");
  process.exit(0);
}

const j = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const s = j.summary || {};
const text =
  `*Documentation automation* (run ${runId || "local"})\n` +
  `Pass: ${s.pass ?? 0} · Warn: ${s.warning ?? 0} · Fail: ${s.fail ?? 0}\n` +
  (runUrl ? `<${runUrl}|Open workflow run>` : "");

const body = JSON.stringify({ text });
const u = new URL(webhook);
const opts = {
  hostname: u.hostname,
  path: u.pathname + u.search,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(body),
  },
};

const req = https.request(opts, (res) => {
  res.resume();
});
req.on("error", (e) => {
  console.error("Slack notify error:", e.message);
  process.exit(0);
});
req.write(body);
req.end();

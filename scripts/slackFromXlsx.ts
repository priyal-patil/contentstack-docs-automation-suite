#!/usr/bin/env npx ts-node
/**
 * Minimal Slack ping: read bot token from encryption_data.xlsx (row slack.authToken),
 * post one message to the channel.
 *
 * 1. In encryption_data.xlsx, Key = slack.authToken, Value = your Bot User OAuth token (xoxb-... from Slack app).
 * 2. Optional: Key = slack.channelId, Value = C... (or set SLACK_CHANNEL_ID).
 * 3. Run: npx ts-node scripts/slackFromXlsx.ts
 *
 * If the cell is encrypt_... (Contentstack), add encryption.secretKey in the same sheet or ENCRYPTION_SECRET_KEY in .env.
 */
import path from "path";
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
} catch {
  /* optional */
}

import { logEncryptionWorkbookPath, resolveSlackBotToken, resolveSlackChannelId } from "./lib/encryptionData";

async function postMessage(botToken: string, channelId: string, text: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25_000);
  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${botToken}`,
      },
      body: JSON.stringify({ channel: channelId, text }),
      signal: controller.signal,
    });
    const raw = await res.text();
    const data = JSON.parse(raw) as { ok?: boolean; error?: string };
    if (!data.ok) throw new Error(data.error || raw.slice(0, 200));
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  const cwd = process.cwd();
  logEncryptionWorkbookPath(cwd);
  const token = resolveSlackBotToken(cwd);
  if (!token) {
    throw new Error(
      `Missing slack.authToken. Add a row in encryption_data.xlsx: Key slack.authToken, Value = xoxb-... (Bot token from Slack app → OAuth & Permissions).`
    );
  }
  const channelId = resolveSlackChannelId(cwd);
  const text =
    process.env.SLACK_PING_TEXT?.trim() ||
    `Docs automation ping — ${new Date().toISOString()}\n(slack.authToken from encryption_data.xlsx)`;
  await postMessage(token, channelId, text);
  // eslint-disable-next-line no-console
  console.log(`✅ Message sent to Slack channel ${channelId}`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e?.message || e);
  process.exitCode = 1;
});

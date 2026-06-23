/**
 * Deletes ALL content types from PriyalDocsStack via the Contentstack Management API.
 * Run with: npx ts-node scripts/delete-all-content-types-api.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import * as https from "https";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const EMAIL = process.env.CS_EMAIL!;
const PASSWORD = process.env.CS_PASSWORD!;
const APP_ORIGIN = process.env.CS_APP_ORIGIN ?? "https://app.contentstack.com";
const STACK_NAME = "PriyalDocsStack";

// Derive API base from app origin
// app.contentstack.com  → api.contentstack.io
// app.contentstackapis.com (EU/GCP) → api.contentstackapis.com
const API_BASE = APP_ORIGIN.includes("contentstack.com")
  ? "https://api.contentstack.io"
  : APP_ORIGIN.replace("app.", "api.").replace(/\/$/, "");

function request(method: string, url: string, headers: Record<string, string>, body?: object): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const data = body ? JSON.stringify(body) : undefined;
    const req = https.request(
      {
        method,
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data).toString() } : {}),
          ...headers,
        },
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch {
            resolve(raw);
          }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log("================================================================");
  console.log(`  Deleting all content types from: ${STACK_NAME}`);
  console.log(`  API Base: ${API_BASE}`);
  console.log("================================================================\n");

  // 1. Login
  console.log("🔐 Logging in...");
  const loginRes = await request("POST", `${API_BASE}/v3/user-session`, {}, {
    user: { email: EMAIL, password: PASSWORD },
  });
  const authtoken = loginRes?.user?.authtoken;
  if (!authtoken) {
    console.error("❌ Login failed:", JSON.stringify(loginRes));
    process.exit(1);
  }
  console.log("✅ Logged in, got authtoken\n");

  // 2. List stacks and find PriyalDocsStack
  console.log(`🔍 Finding stack: ${STACK_NAME}...`);
  const stacksRes = await request("GET", `${API_BASE}/v3/stacks`, {
    authtoken,
  });
  const stacks = stacksRes?.stacks ?? [];
  const stack = stacks.find((s: any) => s.name === STACK_NAME);
  if (!stack) {
    console.error(`❌ Stack "${STACK_NAME}" not found. Available stacks:`, stacks.map((s: any) => s.name));
    process.exit(1);
  }
  const apiKey = stack.api_key;
  console.log(`✅ Found stack: ${STACK_NAME} (api_key: ${apiKey})\n`);

  // 3. List all content types (paginated)
  console.log("📋 Listing all content types...");
  let allContentTypes: any[] = [];
  let skip = 0;
  const limit = 100;
  while (true) {
    const res = await request("GET", `${API_BASE}/v3/content_types?include_count=true&skip=${skip}&limit=${limit}`, {
      authtoken,
      api_key: apiKey,
    });
    const cts = Array.isArray(res?.content_types) ? res.content_types : [];
    if (cts.length === 0) {
      // Log raw response on first empty page to aid debugging
      if (skip === 0) console.log("  Raw response:", JSON.stringify(res).slice(0, 300));
      break;
    }
    for (const ct of cts) allContentTypes.push(ct);
    console.log(`  Page: skip=${skip} → ${cts.length} content types`);
    if (cts.length < limit) break;
    skip += limit;
  }
  console.log(`✅ Found ${allContentTypes.length} content type(s)\n`);

  if (allContentTypes.length === 0) {
    console.log("✅ No content types to delete — stack is already empty.");
    return;
  }

  // 4. Delete each content type
  let deleted = 0;
  let failed = 0;
  for (const ct of allContentTypes) {
    const uid = ct.uid;
    process.stdout.write(`  🗑  Deleting: ${uid} ...`);
    try {
      const delRes = await request("DELETE", `${API_BASE}/v3/content_types/${uid}?force=true`, {
        authtoken,
        api_key: apiKey,
      });
      if (delRes?.notice || delRes?.message?.toLowerCase().includes("delete")) {
        console.log(" ✅");
        deleted++;
      } else {
        console.log(` ⚠️  Unexpected response: ${JSON.stringify(delRes)}`);
        failed++;
      }
    } catch (err) {
      console.log(` ❌ Error: ${err}`);
      failed++;
    }
  }

  console.log("\n================================================================");
  console.log(`  COMPLETE`);
  console.log(`  Deleted : ${deleted}/${allContentTypes.length}`);
  if (failed > 0) console.log(`  Failed  : ${failed}`);
  console.log("================================================================");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});

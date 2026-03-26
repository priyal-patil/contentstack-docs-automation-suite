import { chromium, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { appUrl, loadRuntimeEnv } from "./core/env";

const envPath = loadRuntimeEnv();
console.log("✅ Loaded .env from:", envPath);

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}. Check ${envPath}`);
  return v.trim();
}

export default async () => {
  // Reset per-run doc-step JSONL so getDocStepFailures() does not merge failures from earlier Playwright invocations (same 2h window).
  const reportDir = process.env.REPORT_DIR || path.resolve(process.cwd(), "reports/latest");
  const docStepWorkerDir = path.join(reportDir, ".doc-step-workers");
  if (fs.existsSync(docStepWorkerDir)) {
    fs.rmSync(docStepWorkerDir, { recursive: true, force: true });
  }

  const storagePath = path.resolve(process.cwd(), "auth.json");

  // Fast-path: reuse existing auth state unless explicitly forced to re-login.
  if (process.env.FORCE_RELOGIN !== "true" && fs.existsSync(storagePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
      const hasCookies = Array.isArray(existing?.cookies) && existing.cookies.length > 0;
      const hasOrigins = Array.isArray(existing?.origins) && existing.origins.length > 0;
      if (hasCookies || hasOrigins) {
        // Validate the saved session by opening stacks page once.
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext({ storageState: storagePath });
        const page = await context.newPage();
        await page.goto(appUrl("/#!/stacks"), { waitUntil: "commit", timeout: 120_000 });
        const stillLoggedIn = !/#!\/login/i.test(page.url());
        await context.close();
        await browser.close();

        if (stillLoggedIn) {
          console.log("✅ Reusing existing auth state at:", storagePath);
          return;
        }

        console.log("ℹ️ Existing auth state is expired. Performing fresh login.");
      }
    } catch {
      // If auth.json is corrupt, fall through to re-login.
    }
  }

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const email = mustGetEnv("CS_EMAIL");
  const password = mustGetEnv("CS_PASSWORD");

  await page.goto(appUrl("/#!/stacks"), { waitUntil: "commit", timeout: 120_000 });

  // If already authenticated, /#!/stacks stays in stack context.
  // If unauthenticated, Contentstack redirects to /#!/login.
  if (!page.url().includes("/#!/login")) {
    await page.context().storageState({ path: storagePath });
    console.log("✅ Saved auth state to:", storagePath);
    await browser.close();
    return;
  }

  // Inputs (prefer label, fall back to common attributes)
  const emailInput = page.getByLabel(/email/i).first();
  const passInput = page.getByLabel(/password/i).first();

  const emailFallback = page
    .locator('input[type="email"], input[name="email"], input#email, [data-test-id="cs-login-email"]')
    .first();
  const passFallback = page
    .locator('input[type="password"], input[name="password"], input#password, [data-test-id="cs-login-password"]')
    .first();

  const emailAlt = page
    .locator('input[name="email"], input[name="username"], input[autocomplete="username"]')
    .first();

  // Some environments land on SSO-first view. Switch to email/password form if needed.
  if (!(await emailFallback.isVisible().catch(() => false))) {
    const emailLoginBtn = page
      .getByRole("button", { name: /log in via email/i })
      .or(page.getByText(/log in via email/i, { exact: false }))
      .first();
    if (await emailLoginBtn.isVisible().catch(() => false)) {
      await emailLoginBtn.click({ timeout: 15_000 }).catch(() => {});
      await page.waitForTimeout(400);
    }
  }

  const emailField = (await emailInput.count())
    ? emailInput
    : (await emailFallback.count())
      ? emailFallback
      : emailAlt;
  const passField = (await passInput.count()) ? passInput : passFallback;

  await expect(emailField).toBeVisible({ timeout: 30_000 });
  await emailField.fill(email);

  // Some login flows show password only after clicking Continue/Next
  const submitButton = page.locator('button[type="submit"]').first();
  const continueByName = page.getByRole("button", { name: /continue|next|sign in|log in/i }).first();

  if (!(await passField.isVisible().catch(() => false))) {
    if (await continueByName.isVisible().catch(() => false)) {
      await continueByName.click({ timeout: 30_000 });
    } else {
      await expect(submitButton).toBeVisible({ timeout: 30_000 });
      await submitButton.click({ timeout: 30_000 });
    }
  }

  await expect(passField).toBeVisible({ timeout: 30_000 });
  await passField.fill(password);

  if (await submitButton.isVisible().catch(() => false)) {
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/v3/user-session") && r.status() === 200, {
        timeout: 90_000,
      }),
      submitButton.click({ timeout: 30_000 }),
    ]);
  } else {
    await Promise.all([
      page.waitForResponse((r) => r.url().includes("/api/v3/user-session") && r.status() === 200, {
        timeout: 90_000,
      }),
      continueByName.click({ timeout: 30_000 }),
    ]);
  }

  await expect(page).not.toHaveURL(/#!\/login/i, { timeout: 90_000 });

  await page.context().storageState({ path: storagePath });
  console.log("✅ Saved auth state to:", storagePath);

  await browser.close();
};


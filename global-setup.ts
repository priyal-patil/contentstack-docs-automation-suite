import { chromium, expect } from "@playwright/test";
import path from "path";
import fs from "fs";
import { appUrl, loadRuntimeEnv } from "./core/env";

const envPath = loadRuntimeEnv();
console.log("✅ Loaded .env from:", envPath);

/** Headed login is unreliable on Linux CI (no display). Matches PLAYWRIGHT_HEADLESS / CI usage in playwright.config.ts. */
function globalSetupHeadless(): boolean {
  if (process.env.GLOBAL_SETUP_HEADFUL === "true") return false;
  return (
    process.env.PLAYWRIGHT_HEADLESS === "1" ||
    process.env.CI === "true" ||
    process.env.GLOBAL_SETUP_HEADLESS === "true"
  );
}

function mustGetEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new Error(`Missing required env var: ${name}. Check ${envPath}`);
  return v.trim();
}

/**
 * Cookie count and URL alone are unreliable signals: the app sets non-auth cookies (analytics/CSRF)
 * on first load, and the client-side redirect to /#!/login can lag the initial navigation. The only
 * trustworthy signal is whether a post-login app UI marker (matches shared/steps/login.step.ts) is
 * actually visible.
 */
async function isAuthenticatedAppShell(page: import("@playwright/test").Page): Promise<boolean> {
  const appUiMarker = page
    .locator(
      '[data-test-id="cs-cms-button"], [data-test-id*="stack-card" i], [data-test-id="cms-nav-entries"], [data-test-id="cms-nav-content-models"]'
    )
    .first();
  const loginUiMarker = page
    .locator('input[type="email"], input[name="email"], input#email, [data-test-id="cs-login-email"]')
    .first();

  for (let n = 0; n < 15; n++) {
    if (await loginUiMarker.isVisible().catch(() => false)) return false;
    if (await appUiMarker.isVisible().catch(() => false)) return true;
    await page.waitForTimeout(1_000);
  }
  return false;
}

export default async () => {
  // Reset per-run doc-step JSONL so getDocStepFailures() does not merge failures from earlier Playwright invocations (same 2h window).
  const reportDir = process.env.REPORT_DIR || path.resolve(process.cwd(), "reports/latest");
  const docStepWorkerDir = path.join(reportDir, ".doc-step-workers");
  if (fs.existsSync(docStepWorkerDir)) {
    fs.rmSync(docStepWorkerDir, { recursive: true, force: true });
  }

  // Public-docs runs (the docs-checklist / docs-audit projects) never touch the app, so
  // they must not be blocked by an app login — the QA account's authtokens get evicted
  // regularly. SKIP_LOGIN=1 writes an empty storage state and returns.
  if (process.env.SKIP_LOGIN === "1") {
    const p = path.resolve(process.cwd(), "auth.json");
    if (!fs.existsSync(p)) fs.writeFileSync(p, JSON.stringify({ cookies: [], origins: [] }), "utf-8");
    console.log("ℹ️ SKIP_LOGIN=1 — no app login performed (public docs run).");
    return;
  }

  const storagePath = path.resolve(process.cwd(), "auth.json");

  // SKIP_LOGIN=1: suites that audit published pages anonymously (docs-checklist, docs-audit)
  // must not attempt an app login. Without this, a locked or rate-limited QA account blocks a
  // page audit that never needed credentials — and each run adds another failed login attempt.
  if (process.env.SKIP_LOGIN === "1") {
    console.log("ℹ️ SKIP_LOGIN=1 — no app login attempted (page-audit suites do not need one).");
    return;
  }

  // Fast-path: reuse existing auth state unless explicitly forced to re-login.
  if (process.env.FORCE_RELOGIN !== "true" && fs.existsSync(storagePath)) {
    try {
      const existing = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
      const hasCookies = Array.isArray(existing?.cookies) && existing.cookies.length > 0;
      const hasOrigins = Array.isArray(existing?.origins) && existing.origins.length > 0;
      if (hasCookies || hasOrigins) {
        // Validate the saved session by opening stacks page once.
        const browser = await chromium.launch({
          headless: true,
          args: ["--disable-dev-shm-usage", "--no-sandbox"],
        });
        const context = await browser.newContext({ storageState: storagePath });
        const page = await context.newPage();
        await page.goto(appUrl("/#!/stacks"), { waitUntil: "domcontentloaded", timeout: 120_000 });
        const stillLoggedIn = await isAuthenticatedAppShell(page);
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

  const headless = globalSetupHeadless();
  const browser = await chromium.launch({
    headless,
    args: headless ? ["--disable-dev-shm-usage", "--no-sandbox"] : [],
  });
  const page = await browser.newPage();

  const email = mustGetEnv("CS_EMAIL");
  const password = mustGetEnv("CS_PASSWORD");

  await page.goto(appUrl("/#!/stacks"), { waitUntil: "domcontentloaded", timeout: 120_000 });

  // The redirect to /#!/login is client-side and lands AFTER navigation commits, and the app
  // sets non-auth cookies (analytics/CSRF) on first load regardless of login state — so neither
  // URL nor cookie count is a trustworthy "already logged in" signal. Wait for a real post-login
  // app UI marker instead.
  if (await isAuthenticatedAppShell(page)) {
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

  const finalState = await page.context().storageState({ path: storagePath });
  if (finalState.cookies.length === 0) {
    throw new Error(
      `Login appeared to succeed but auth.json has 0 cookies (${storagePath}). Every later run would start logged out.`
    );
  }
  console.log(`✅ Saved auth state to: ${storagePath} (${finalState.cookies.length} cookies)`);

  await browser.close();
};


import { Page, expect } from "@playwright/test";
import { appUrl } from "../../core/env";

/**
 * "login" shared step.
 *
 * We rely on Playwright `global-setup.ts` to create `auth.json`.
 * This step is a lightweight guard to ensure we are not on the login page.
 */
export async function loginStep(page: Page) {
  const emailByLabel = page.getByLabel(/email/i).first();
  const passByLabel = page.getByLabel(/password/i).first();
  const emailFallback = page
    .locator(
      'input[type="email"], input[name="email"], input#email, [data-test-id="cs-login-email"], input[name="username"], input[name*="user" i], input[autocomplete="username"]'
    )
    .first();
  const passFallback = page
    .locator('input[type="password"], input[name="password"], input#password, [data-test-id="cs-login-password"]')
    .first();
  const loginHeading = page.getByText(/log in to contentstack/i).first();
  const submitButton = page
    .locator(
      'button[type="submit"], button:has-text("Log In"), button:has-text("Sign In"), button[aria-label*="Log In" i], button[aria-label*="Sign In" i]'
    )
    .first();
  const continueByName = page
    .locator('button:has-text("Continue"), button:has-text("Next"), button[aria-label*="Continue" i], button[aria-label*="Next" i]')
    .first();
  const appUiMarker = page
    .locator(
      '[data-test-id="cs-cms-button"], [data-test-id*="stack-card" i], [data-test-id="cms-nav-entries"], [data-test-id="cms-nav-content-models"]'
    )
    .first();
  const loginEntryPoint = page
    .locator('button:has-text("Log in via email"), button:has-text("Login via email"), button:has-text("Log In"), button:has-text("Sign In"), button:has-text("Continue"), button:has-text("Next")')
    .first();

  const isLoginOrAppSurfaceVisible = async () => {
    const loginVisibleNow =
      (await emailByLabel.isVisible().catch(() => false)) ||
      (await emailFallback.isVisible().catch(() => false)) ||
      (await passByLabel.isVisible().catch(() => false)) ||
      (await passFallback.isVisible().catch(() => false)) ||
      (await loginHeading.isVisible().catch(() => false)) ||
      (await loginEntryPoint.isVisible().catch(() => false));
    const appVisibleNow = await appUiMarker.isVisible().catch(() => false);
    return loginVisibleNow || appVisibleNow;
  };

  // Recover from intermittent blank-load state by retrying stacks/login navigation.
  let surfaceReady = false;
  for (let i = 0; i < 3; i++) {
    await page.goto(appUrl("/#!/stacks"), { waitUntil: "commit", timeout: 120_000 }).catch(() => {});
    await page.waitForLoadState("domcontentloaded", { timeout: 45_000 }).catch(() => {});
    for (let n = 0; n < 20; n++) {
      if (await isLoginOrAppSurfaceVisible()) {
        surfaceReady = true;
        break;
      }
      await page.waitForTimeout(2000);
    }
    if (surfaceReady) break;
    await page.goto(appUrl("/#!/login"), { waitUntil: "commit", timeout: 120_000 }).catch(() => {});
    await page.waitForLoadState("domcontentloaded", { timeout: 45_000 }).catch(() => {});
    await page.waitForTimeout(4000);
  }
  if (!surfaceReady) {
    // Do not hard-fail here; downstream flow step failures should report exact missing UI step.
    console.log("⚠️ App shell readiness not confirmed; proceeding to normal login checks.");
  }

  const loginUiVisible =
    (await emailByLabel.isVisible().catch(() => false)) ||
    (await emailFallback.isVisible().catch(() => false)) ||
    (await passByLabel.isVisible().catch(() => false)) ||
    (await passFallback.isVisible().catch(() => false)) ||
    (await loginHeading.isVisible().catch(() => false));

  // Fallback login path: if login URL or login UI is visible, fill credentials from env.
  if (/#!\/login/i.test(page.url()) || loginUiVisible) {
    const email = (process.env.CS_EMAIL || "").trim();
    const password = (process.env.CS_PASSWORD || "").trim();
    if (!email || !password) {
      throw new Error("Missing CS_EMAIL/CS_PASSWORD for login fallback.");
    }

    if (!(await emailByLabel.isVisible().catch(() => false)) && !(await emailFallback.isVisible().catch(() => false))) {
      const emailLoginBtn = page
        .getByRole("button", { name: /log in via email|login via email|email and password|use email/i })
        .first();
      if (await emailLoginBtn.isVisible().catch(() => false)) {
        await emailLoginBtn.click({ timeout: 15_000 }).catch(() => {});
        await page.waitForTimeout(500);
      }
    }

    const emailField = (await emailByLabel.count()) ? emailByLabel : emailFallback;
    const passField = (await passByLabel.count()) ? passByLabel : passFallback;

    await expect(emailField).toBeVisible({ timeout: 90_000 });
    await emailField.fill(email);

    if (!(await passField.isVisible().catch(() => false))) {
      if (await continueByName.isVisible().catch(() => false)) {
        await continueByName.click({ timeout: 30_000 });
      } else {
        await expect(submitButton).toBeVisible({ timeout: 30_000 });
        await submitButton.click({ timeout: 30_000 });
      }
    }

    await expect(passField).toBeVisible({ timeout: 90_000 });
    await passField.fill(password);

    if (await submitButton.isVisible().catch(() => false)) {
      await submitButton.click({ timeout: 30_000 });
    } else if (await continueByName.isVisible().catch(() => false)) {
      await continueByName.click({ timeout: 30_000 });
    } else {
      throw new Error("Login submit button not found on login screen.");
    }

    // Ensure we are actually out of login screen (URL alone is not reliable).
    await expect(emailField).not.toBeVisible({ timeout: 90_000 });
    await page.goto(appUrl("/#!/stacks"), { waitUntil: "domcontentloaded", timeout: 120_000 });
  }

  const loginEmailVisibleFinal =
    (await emailByLabel.isVisible().catch(() => false)) || (await emailFallback.isVisible().catch(() => false));
  if (loginEmailVisibleFinal) {
    throw new Error("Login guard failed: still on login UI after fallback authentication.");
  }
}


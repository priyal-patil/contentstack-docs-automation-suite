import { Page, expect } from "@playwright/test";

/**
 * "login" shared step.
 *
 * We rely on Playwright `global-setup.ts` to create `auth.json`.
 * This step is a lightweight guard to ensure we are not on the login page.
 */
export async function loginStep(page: Page) {
  // If auth is broken, Contentstack may redirect to /#!/login on any navigation.
  await page.goto("https://app.contentstack.com/#!/dashboard", { waitUntil: "domcontentloaded" });
  await expect(page).not.toHaveURL(/#!\/login/i, { timeout: 30_000 });
}


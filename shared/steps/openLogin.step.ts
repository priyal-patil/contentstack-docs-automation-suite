import { Page } from "@playwright/test";
import { appUrl } from "../../core/env";

export async function openLoginStep(page: Page) {
  await page.goto(appUrl("/#!/login"), { waitUntil: "commit", timeout: 120_000 });
  await page.waitForLoadState("domcontentloaded", { timeout: 45_000 });
}

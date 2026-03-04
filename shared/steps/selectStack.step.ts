import { Page } from "@playwright/test";
import { ensureOnStacksAndSelectStack } from "../../core/navigation";

export async function selectStackStep(page: Page) {
  await ensureOnStacksAndSelectStack(page);
}


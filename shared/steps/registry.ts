import { Page } from "@playwright/test";
import { loginStep } from "./login.step";
import { selectStackStep } from "./selectStack.step";

export type SharedStepName = "login" | "selectStack";

export async function runSharedSteps(page: Page, use: string[] | undefined) {
  const steps: SharedStepName[] = (use?.length ? use : ["login", "selectStack"]).filter(Boolean) as SharedStepName[];

  for (const name of steps) {
    switch (name) {
      case "login":
        await loginStep(page);
        break;
      case "selectStack":
        await selectStackStep(page);
        break;
      default:
        throw new Error(`Unknown shared step: ${name}`);
    }
  }
}


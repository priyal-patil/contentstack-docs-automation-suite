import { Page } from "@playwright/test";
import { loginStep } from "./login.step";
import { selectStackStep } from "./selectStack.step";
import { openLoginStep } from "./openLogin.step";

export type SharedStepName = "login" | "selectStack" | "openLogin";

export async function runSharedSteps(page: Page, use: string[] | undefined) {
  // Default shared setup only when `use` is omitted.
  // If flow explicitly sets `use: []`, run no shared steps.
  const steps: SharedStepName[] = (use === undefined ? ["login", "selectStack"] : use).filter(Boolean) as SharedStepName[];

  for (const name of steps) {
    switch (name) {
      case "login":
        await loginStep(page);
        break;
      case "selectStack":
        await selectStackStep(page);
        break;
      case "openLogin":
        await openLoginStep(page);
        break;
      default:
        throw new Error(`Unknown shared step: ${name}`);
    }
  }
}


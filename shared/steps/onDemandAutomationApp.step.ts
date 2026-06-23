import { Page } from "@playwright/test";
import { loadFlowById } from "../../core/flowDiscovery";

/**
 * "on-demand-automation-app" shared step.
 * Runs the on-demand-automation-app flow as a prerequisite (with use:[] to skip re-running login).
 * Used by automation-sharing and managing-triggers flows.
 */
export async function onDemandAutomationAppStep(page: Page): Promise<void> {
  const flow = loadFlowById("on-demand-automation-app");
  if (!flow) throw new Error("on-demand-automation-app flow not found");
  const { executeFlow } = await import("../../core/executor");
  await executeFlow(page, { ...flow, use: [] }, { skipSharedSteps: true });
}

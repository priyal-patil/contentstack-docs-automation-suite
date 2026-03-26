/**
 * Generate an HTML report for a flow run showing steps and warnings.
 * Usage: npx ts-node scripts/generateFlowReportHtml.ts [--flowId create-content-type] [--reportDir reports/latest]
 */
import path from "path";
import { generateFlowReportHtml } from "../core/flowReportGenerator";

function main() {
  const arg = (name: string, fallback: string) => {
    const i = process.argv.indexOf(name);
    return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
  };
  const flowId = arg("--flowId", "create-content-type");
  const reportDir = arg("--reportDir", "reports/latest");

  const outPath = generateFlowReportHtml(flowId, reportDir);
  if (outPath) {
    const fileUrl = "file://" + (outPath.startsWith("/") ? outPath : path.resolve(outPath));
    // eslint-disable-next-line no-console
    console.log("✅ Flow report:", outPath);
    // eslint-disable-next-line no-console
    console.log("   Link:", fileUrl);
  } else {
    // eslint-disable-next-line no-console
    console.error(`Flow not found: ${flowId}`);
    process.exit(1);
  }
}

main();

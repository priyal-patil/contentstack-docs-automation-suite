import type {
  Reporter,
  TestCase,
  TestResult,
  FullResult
} from "@playwright/test/reporter";
import fs from "fs";
import path from "path";

class DashboardReporter implements Reporter {
  private results: { title: string; status: string; duration: number }[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration
    });
  }

  async onEnd(result: FullResult) {
    const outDir = path.resolve(__dirname, "../reports");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const summary = {
      overallStatus: result.status,
      total: this.results.length,
      passed: this.results.filter(r => r.status === "passed").length,
      failed: this.results.filter(r => r.status === "failed").length,
      skipped: this.results.filter(r => r.status === "skipped").length,
      results: this.results
    };

    fs.writeFileSync(
      path.join(outDir, "dashboard.json"),
      JSON.stringify(summary, null, 2),
      "utf-8"
    );
  }
}

export default DashboardReporter;

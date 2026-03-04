const fs = require("fs");
const path = require("path");

class DashboardReporter {
  constructor() {
    this.results = [];
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      status: result.status,
      duration: result.duration,
    });
  }

  async onEnd(result) {
    const outDir = path.resolve(__dirname, "../reports");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const summary = {
      overallStatus: result.status,
      total: this.results.length,
      passed: this.results.filter((r) => r.status === "passed").length,
      failed: this.results.filter((r) => r.status === "failed").length,
      skipped: this.results.filter((r) => r.status === "skipped").length,
      results: this.results,
    };

    fs.writeFileSync(
      path.join(outDir, "dashboard.json"),
      JSON.stringify(summary, null, 2),
      "utf-8"
    );
  }
}

module.exports = DashboardReporter;

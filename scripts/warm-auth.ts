// Runs global-setup's login/session-validation logic standalone, outside a Playwright test run,
// so a dedicated CI job can populate the shared auth.json cache before the day's other scheduled
// workflows start (see .github/workflows/cs-auth-warm.yml).
import globalSetup from "../global-setup";

globalSetup()
  .then(() => {
    console.log("✅ Auth warm-up complete.");
  })
  .catch((err) => {
    console.error("❌ Auth warm-up failed:", err);
    process.exit(1);
  });

# Troubleshooting

Quick fixes for common automation issues. CMS batch behavior follows `scripts/run-cms-sequential-modules-dashboard.sh`; Playwright uses `global-setup.ts` and `playwright.config.ts`.

### auth.json stale or missing

**Symptom:** Login errors, redirect to `#!/login`, or global-setup exceptions before tests run.  
**Cause:** `auth.json` is absent, corrupt, or session cookies no longer valid (`global-setup.ts` skips reuse when validation fails).  
**Fix:** Fix `CS_EMAIL` / `CS_PASSWORD` in `.env`, set `FORCE_RELOGIN=true` if needed, and run any Playwright command so `global-setup.ts` regenerates `auth.json`.

### macOS sleep stopping a long run

**Symptom:** Log stops for a long time, Playwright `Terminated`, or browser closed errors after wake.  
**Cause:** System sleep suspends the machine; background CMS launchers may wrap in `caffeinate`, but lid-close / deep sleep can still kill progress.  
**Fix:** Use AC power and sane Energy settings; avoid `SKIP_CAFFEINATE=1` when you want idle sleep deferred; for guaranteed completion use CI or an always-on host.

### REPORT_DIR collision between runs

**Symptom:** Wrong `flows-results.json`, mixed Playwright parts, or dashboards showing another run’s data.  
**Cause:** Two jobs share the same `REPORT_DIR` (explicit env or both using default `reports/latest` outside the CMS script’s timestamped dir).  
**Fix:** Let `run-cms-sequential-modules-dashboard.sh` set its default `reports/cms-seq-<timestamp>`, or set a **unique** `REPORT_DIR` per run; do not point parallel batches at one directory.

### Playwright timeout on first run

**Symptom:** Failure in `global-setup.ts` (e.g. navigation timeout) or immediate test errors before flows execute.  
**Cause:** Bad or missing `.env` (`mustGetEnv` for `CS_EMAIL` / `CS_PASSWORD`), slow network, or app not reachable at the URL from `core/env`.  
**Fix:** Verify `.env` and stack/login prerequisites; increase patience on slow links; ensure the first `page.goto` target in global-setup can load within its timeout.

### Sync not picking up new URLs

**Symptom:** `data/docs-urls.csv` omits a doc URL you added only in flow JSON or `flows/*/docs.json`.  
**Cause:** Sync does not run on file save; `npm run sync:docs-urls` must execute to refresh the CSV from disk.  
**Fix:** Run `npm run sync:docs-urls` and commit `data/docs-urls.csv` if audits should include the new rows (see `.cursor/rules/docs-urls-sync.mdc` for `keep` / pruning behavior).

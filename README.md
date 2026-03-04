## Contentstack Docs → Playwright Automation

This repo executes **documentation flows** as generic JSON step sequences, with selector overrides layered by **shared → project → module → flow**.

**Important:** We run **only the steps defined in the flow** (from the document). We do **not** add or infer steps. The goal is to find **missing or wrong steps in the docs**: if the doc says "click New" but the app has no "New" button on that page, the run fails and we report it so technical writers can fix the document.

### Document-step failure report (for technical writers)

When a step fails (e.g. element not found), the run records:

- **Document URL** (source of the flow)
- **Flow id**
- **Step number** and **step text** (action + target)
- **Error message** (e.g. "Element not found", "Timeout")

After all flow tests, see **`reports/latest/doc-step-failures.json`**. Each entry means: *this document URL failed at this step because the element could not be located* — the document may be missing a step or describing the wrong UI. Generic steps (e.g. "Content Models", "New Content Type") are fine when they match the app; document-specific steps must be correct or they will appear in this report.

### Folder structure (project-wise)

```
contentstack-ai-automation/
  projects/
    CMS/
      content-models/
        flows/
          <id>.flow.json
        selectors/
          module.selectors.ts
          <id>.selectors.ts
        index.ts
    Launch/
    Personalize/

  shared/
    steps/
      login.step.ts
      selectStack.step.ts
      registry.ts
    overrides/
      common.selectors.ts

  core/
  rules/
  tests/
```

### How flows run

- `tests/flows.spec.ts` auto-discovers:
  - New flows: `projects/**/flows/*.flow.json`
  - Legacy flows: `flows/**.json` (until you delete legacy folders)
- Each flow can include:
  - `use: ["login", "selectStack"]` → shared steps run before the flow steps.
- Selector overrides are loaded in this order:
  1) `shared/overrides/common.selectors.ts`
  2) `projects/<project>/selectors/project.selectors.ts` (optional)
  3) `projects/<project>/<module>/selectors/module.selectors.ts` (optional)
  4) `projects/<project>/<module>/selectors/<id>.selectors.ts` (optional)
  5) legacy `rules/overrides/**` (backwards compatible)

### Run commands

- **All CMS flows**:

```bash
npx playwright test tests/flows.spec.ts -g "Project=CMS"
```

- **CMS → content-models**:

```bash
npx playwright test tests/flows.spec.ts -g "Project=CMS Module=content-models"
```

Or use package scripts:

```bash
npm run test:cms
npm run test:cms:content-models
```

### Add a new flow manually

1) Create:
- `projects/<Project>/<module>/flows/<id>.flow.json`
- `projects/<Project>/<module>/selectors/<id>.selectors.ts` (optional, but recommended)

2) Run:

```bash
npx playwright test tests/flows.spec.ts -g "<id>"
```

### Bulk import (URL ingestion)

Create an input file as JSON:

```json
[
  { "project": "CMS", "module": "content-models", "id": "edit-content-type", "source": "https://..." }
]
```

Then run:

```bash
npm run ingest:docs -- --input data/ingest.json
```

This generates:
- `projects/<project>/<module>/flows/<id>.flow.json` (skeleton if missing)
- `projects/<project>/<module>/selectors/<id>.selectors.ts` (stub if missing)
- updates `projects/<project>/<module>/index.ts`


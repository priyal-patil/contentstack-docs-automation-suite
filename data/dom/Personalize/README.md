# Personalize — captured DOM snapshots

Reference HTML for selector authoring in **`projects/Personalize/set-up-personalize/selectors/`**.

| File | Use |
|------|-----|
| `personalize-projects.html` | Projects landing / cards |
| `new-personalize-project.html` | Create project modal |
| `experiences.html` | Experiences listing, **New Experience**, **Prioritize Experiences** |
| `exp-rightnav.html` | Experience editor **Experience Information** drawer — **Information** tab (`info-tab-icon`), **Contentstack CMS Sync Status**, **Variant Group** link (`variant-group-url`) |
| `prioritize-experience-page.html` | **Prioritize Experiences** sidebar — drag rows, **Save** / Cancel |
| `select-experience-type.html` | **Select Experience Type** modal (Segmented / A/B Test) |
| `segmented-experience-page.html` | Segmented experience draft — **Overview** (Name, Description, **Save General Details**) |
| `seg-exp-configuration.html` | **Configuration** — Variants, **Add Variant**, Audiences, **Save Draft** |
| `attributes-list.html`, `create-new-attribute.html` | **Attributes** — **+ New Attribute**, **New Attribute** modal |
| `events-list.html`, `create-new-event.html` | **Events** — **+ New Event** / **New Event** modal (`event-form-submit`) |
| `audiences.html`, `create-audiences.html`, … | Audiences flows |

Flow **`create-segmented-experience`** uses the `experiences` / `select-experience-type` / `segmented-experience` / `seg-exp-configuration` captures.

Flow **`create-ab-test-experience`** reuses `experiences.html` and `select-experience-type.html` (A/B card: **`data-testid="ab-testing-experience"`**). Prefer adding a capture of the A/B draft **Configuration** page when available (expected container: **`ab-testing-experience-draft-config-body`**).

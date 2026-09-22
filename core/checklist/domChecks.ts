/**
 * Pure functions: PageFacts in, CheckResult out. No page access, so these are unit
 * testable and cannot flake.
 *
 * Expected typography values come from the checklist sheet verbatim. They are
 * overridable through env because the checklist predates the docs redesign — but the
 * default is what the sheet says, so a mismatch surfaces instead of being absorbed.
 */

import type { CheckResult, Evidence } from "./types";
import type { PageFacts } from "./pageFacts";

const envNum = (key: string, fallback: number) => {
  const raw = process.env[key]?.trim();
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Expected values, taken from the Doc Testing Checklist sheet's **column C** as it stands
 * on 2026-09-03 (rows 1.0 and 8 "Code Snippets font"). Column C was updated with the
 * measured live values, so these are now the checklist's own numbers — not the
 * pre-redesign ones (H1 30px bold / body 18px Arial / code #d66960), which no longer
 * appear anywhere in the sheet.
 */
export const TYPO_EXPECTATIONS = {
  h1: { size: envNum("CL_H1_PX", 32), weight: envNum("CL_H1_WEIGHT", 400), family: /tercia|serif/i },
  h2: { size: envNum("CL_H2_PX", 24), weight: envNum("CL_H2_WEIGHT", 400), family: /tercia|serif/i },
  h3: { size: envNum("CL_H3_PX", 18), weight: envNum("CL_H3_WEIGHT", 600), family: /inter/i },
  body: { size: envNum("CL_BODY_PX", 16), family: /inter|arial|helvetica|sans-serif/i },
  code: { size: envNum("CL_CODE_PX", 14), family: /roboto mono|mono|courier/i, color: "#cad3f5", background: "#1a1919" },
  inlineCode: { size: 14, family: /roboto mono|mono/i, color: "#89e6d4", background: "#1a1919" },
  table: { headerWeight: 700, size: 14 },
};

/** Callout left-border colours, per column C of checklist row 6.0. */
export const CALLOUT_BORDER_COLORS: Record<string, string> = {
  note: "#899cfa",
  tip: "#b0f7ba",
  warning: "#f35f61",
  "add-res": "#ac75ff",
  "add-resource": "#ac75ff",
};

const pass = (id: string, summary: string, evidence: Evidence[] = []): CheckResult => ({ id, status: "PASS", summary, evidence });
const na = (id: string, summary: string): CheckResult => ({ id, status: "NA", summary, evidence: [] });
const warn = (
  id: string,
  summary: string,
  evidence: Evidence[],
  issue: string,
  rootCause: string,
  suggestedFix: string
): CheckResult => ({ id, status: "WARN", summary, evidence, issue, rootCause, suggestedFix });

const MAX_EVIDENCE = 10;
const cap = (e: Evidence[]) =>
  e.length <= MAX_EVIDENCE ? e : [...e.slice(0, MAX_EVIDENCE), { where: `… and ${e.length - MAX_EVIDENCE} more` }];

/** rgb(214,105,96) -> #d66960 */
function rgbToHex(rgb: string): string {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return rgb;
  return "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("");
}

export function checkTypography(f: PageFacts): CheckResult[] {
  const out: CheckResult[] = [];

  // CL-1.1 single H1
  if (f.h1Count === 1) out.push(pass("CL-1.1", "Exactly one H1 in the article."));
  else
    out.push(
      warn(
        "CL-1.1",
        `Article contains ${f.h1Count} H1 elements.`,
        [{ where: "article", expected: "1", actual: String(f.h1Count) }],
        `The page has ${f.h1Count} H1 headings.`,
        f.h1Count === 0 ? "The title is rendered with a non-heading element." : "More than one section is marked as the page title.",
        "Keep one H1 for the page title and demote the rest to H2."
      )
    );

  // CL-1.2 heading typography
  const headingEvidence: Evidence[] = [];
  for (const h of f.headings.filter((x) => x.level <= 3)) {
    const exp = h.level === 1 ? TYPO_EXPECTATIONS.h1 : h.level === 2 ? TYPO_EXPECTATIONS.h2 : TYPO_EXPECTATIONS.h3;
    const sizeOk = Math.abs(h.fontSize - exp.size) < 0.6;
    // Column C pins H1/H2 at weight 400, so ">= expected" would wrongly pass a bolded
    // heading. Compare exactly, allowing the 400/normal and 700/bold synonyms.
    const weightOk = h.fontWeight === exp.weight;
    const alignOk = /left|start/.test(h.textAlign);
    if (!sizeOk || !weightOk || !alignOk) {
      headingEvidence.push({
        where: `h${h.level} "${h.text.slice(0, 45)}"`,
        expected: `${exp.size}px / weight ${exp.weight} / left`,
        actual: `${h.fontSize}px / weight ${h.fontWeight} / ${h.textAlign}`,
      });
    }
  }
  if (!f.headings.length) out.push(na("CL-1.2", "No headings found in the article."));
  else if (!headingEvidence.length) out.push(pass("CL-1.2", "All H1–H3 match the expected size, weight and alignment."));
  else
    out.push(
      warn(
        "CL-1.2",
        `${headingEvidence.length} heading(s) differ from the checklist's typography.`,
        cap(headingEvidence),
        "Rendered heading typography does not match the values pinned in checklist item 1.0.",
        "Either the page uses a non-standard style, or the checklist's px values predate the current docs theme.",
        "Confirm which is authoritative. If the theme changed deliberately, update checklist item 1.0 (and CL_H1_PX/CL_H2_PX/CL_H3_PX here) to the new values; otherwise fix the page styles."
      )
    );

  // CL-1.3 strong inside heading
  const strongHeads = f.headings.filter((h) => h.hasNestedStrong);
  if (!f.headings.length) out.push(na("CL-1.3", "No headings found."));
  else if (!strongHeads.length) out.push(pass("CL-1.3", "No <strong>/<b> nested inside a heading."));
  else
    out.push(
      warn(
        "CL-1.3",
        `${strongHeads.length} heading(s) wrap their text in <strong>/<b>.`,
        cap(strongHeads.map((h) => ({ where: `h${h.level} "${h.text.slice(0, 50)}"`, expected: "plain heading text", actual: "<strong> inside heading" }))),
        "A heading contains a redundant bold tag.",
        "Bold was applied in the CMS rich-text editor on text that was then promoted to a heading.",
        "Remove the <strong>/<b> wrapper — the heading style already carries the weight."
      )
    );

  // CL-1.4 body copy
  if (!f.paragraphStyle) out.push(na("CL-1.4", "No body paragraph long enough to measure."));
  else {
    const p = f.paragraphStyle;
    const sizeOk = Math.abs(p.fontSize - TYPO_EXPECTATIONS.body.size) < 0.6;
    if (sizeOk) out.push(pass("CL-1.4", `Body copy is ${p.fontSize}px ${p.fontFamily}.`));
    else
      out.push(
        warn(
          "CL-1.4",
          `Body copy is ${p.fontSize}px, checklist expects ${TYPO_EXPECTATIONS.body.size}px.`,
          [
            { where: "first body paragraph", expected: `${TYPO_EXPECTATIONS.body.size}px regular`, actual: `${p.fontSize}px weight ${p.fontWeight} ${p.fontFamily}` },
            ...(f.listItemStyle ? [{ where: "first list item", expected: `${TYPO_EXPECTATIONS.body.size}px`, actual: `${f.listItemStyle.fontSize}px ${f.listItemStyle.fontFamily}` }] : []),
          ],
          "Body text size does not match checklist item 1.0.",
          "Same root cause as CL-1.2 — the checklist's px values and the live theme disagree.",
          "Reconcile the checklist with the current docs theme, then set CL_BODY_PX to the agreed value."
        )
      );
  }

  // CL-1.5 code typography
  if (!f.codeBlocks.length) out.push(na("CL-1.5", "No code blocks on this page."));
  else {
    const bad = f.codeBlocks
      .map((c, i) => ({ c, i }))
      .filter(
        ({ c }) =>
          Math.abs(c.fontSize - TYPO_EXPECTATIONS.code.size) >= 0.6 ||
          !TYPO_EXPECTATIONS.code.family.test(c.fontFamily) ||
          rgbToHex(c.color).toLowerCase() !== TYPO_EXPECTATIONS.code.color
      );
    if (!bad.length) out.push(pass("CL-1.5", `All ${f.codeBlocks.length} code block(s) use monospace at the expected size.`));
    else
      out.push(
        warn(
          "CL-1.5",
          `${bad.length} code block(s) differ from the expected code typography.`,
          cap(bad.map(({ c, i }) => ({ where: `pre[${i}]`, expected: `${TYPO_EXPECTATIONS.code.size}px monospace ${TYPO_EXPECTATIONS.code.color}`, actual: `${c.fontSize}px ${c.fontFamily} ${rgbToHex(c.color)}` }))),
          "Code block styling does not match checklist item 1.0.",
          "The code block is rendered outside the standard code component, or the theme changed.",
          "Re-apply the standard code block component in the entry; if the theme changed, update the checklist."
        )
      );
  }

  // CL-1.6 bold table headers
  if (!f.tables.length) out.push(na("CL-1.6", "No tables on this page."));
  else {
    const bad = f.tables.map((t, i) => ({ t, i })).filter(({ t }) => t.headerCells > 0 && t.boldHeaderCells < t.headerCells);
    const noHeader = f.tables.map((t, i) => ({ t, i })).filter(({ t }) => t.headerCells === 0);
    if (!bad.length && !noHeader.length) out.push(pass("CL-1.6", `All ${f.tables.length} table(s) have bold header cells.`));
    else
      out.push(
        warn(
          "CL-1.6",
          `${bad.length + noHeader.length} table(s) have a header problem.`,
          cap([
            ...bad.map(({ t, i }) => ({ where: `table[${i}]`, expected: "all <th> bold", actual: `${t.boldHeaderCells}/${t.headerCells} bold` })),
            ...noHeader.map(({ i }) => ({ where: `table[${i}]`, expected: "<th> header row", actual: "no <th> cells" })),
          ]),
          "A table is missing a bold header row.",
          "The table was authored with <td> cells only, so no header styling applies.",
          "Mark the first row as a header row in the rich-text editor so it renders as <th>."
        )
      );
  }

  return out;
}

export function checkBreadcrumb(f: PageFacts, brokenBreadcrumbs: { href: string; status?: number }[]): CheckResult[] {
  const out: CheckResult[] = [];
  const crumbs = f.breadcrumb;
  if (!crumbs.length) {
    out.push(
      warn(
        "CL-2.1",
        "No breadcrumb trail found on the page.",
        [{ where: "nav", expected: "Home / Section / Page", actual: "none" }],
        "The page renders without a breadcrumb.",
        "The breadcrumb nav is missing from this template or failed to render.",
        "Restore the breadcrumb component so readers can navigate one level up."
      )
    );
    return out;
  }

  if (!brokenBreadcrumbs.length)
    out.push(pass("CL-2.1", `Breadcrumb present (${crumbs.map((c) => c.text).join(" / ")}) and all links resolve.`));
  else
    out.push(
      warn(
        "CL-2.1",
        `${brokenBreadcrumbs.length} breadcrumb link(s) do not resolve.`,
        cap(brokenBreadcrumbs.map((b) => ({ where: b.href, expected: "200", actual: String(b.status ?? "no response") }))),
        "A breadcrumb link is broken.",
        "The parent section was renamed or unpublished without updating the breadcrumb source.",
        "Point the breadcrumb at the current section URL."
      )
    );

  // Row 2 point 2 ("hover shows a tooltip") was removed from column C on 2026-09-03,
  // so no tooltip assertion is made. Column C now only requires that every breadcrumb
  // link opens its landing page, which CL-2.1 covers.
  return out;

}

export function checkImages(f: PageFacts): CheckResult[] {
  const out: CheckResult[] = [];
  const content = f.images.filter((i) => i.inArticle);
  if (!content.length) {
    out.push(na("CL-4.1", "No images inside the article."));
    out.push(na("CL-4.2", "No images inside the article."));
    out.push(na("CL-4.4", "No images inside the article."));
  } else {
    const broken = content.filter((i) => i.naturalWidth === 0);
    broken.length
      ? out.push(
          warn(
            "CL-4.1",
            `${broken.length} image(s) failed to render.`,
            cap(broken.map((i) => ({ where: i.src.slice(-70), expected: "renders", actual: "naturalWidth = 0" }))),
            "An image on the page does not render.",
            "The asset URL 404s, or the asset was unpublished from the stack.",
            "Re-upload the asset and update the entry with the new URL."
          )
        )
      : out.push(pass("CL-4.1", `All ${content.length} article image(s) render.`));

    const noAlt = content.filter((i) => !i.alt.trim());
    noAlt.length
      ? out.push(
          warn(
            "CL-4.2",
            `${noAlt.length} image(s) have no alt text.`,
            cap(noAlt.map((i) => ({ where: i.src.slice(-70), expected: "descriptive alt", actual: "empty" }))),
            "An image is missing alt text.",
            "Alt text was not filled in when the asset was inserted.",
            "Add sentence-case alt text describing what the screenshot shows (style guide: alt text uses sentence case)."
          )
        )
      : out.push(pass("CL-4.2", `All ${content.length} article image(s) have alt text.`));

    const upscaled = content.filter((i) => i.naturalWidth > 0 && i.clientWidth > i.naturalWidth * 1.15);
    upscaled.length
      ? out.push(
          warn(
            "CL-4.4",
            `${upscaled.length} image(s) are displayed larger than their intrinsic size.`,
            cap(upscaled.map((i) => ({ where: i.src.slice(-70), expected: `≤ ${i.naturalWidth}px wide`, actual: `${i.clientWidth}px` }))),
            "An image is being upscaled by the browser and will look soft.",
            "The screenshot was captured at a lower resolution than the slot it is rendered into.",
            "Recapture the screenshot at 2× the display width and replace the asset."
          )
        )
      : out.push(pass("CL-4.4", "No image is upscaled beyond its intrinsic width."));
  }

  const placeholderHit = /\/\/\s?SS\b|\[screenshot\]|TBD screenshot|image placeholder/i.exec(f.articleText);
  placeholderHit
    ? out.push(
        warn(
          "CL-4.3",
          "Screenshot placeholder marker found in the page text.",
          [{ where: `"${placeholderHit[0]}"`, expected: "a real screenshot", actual: "placeholder marker" }],
          "A placeholder marker was published to the live page.",
          "The writer flagged a pending screenshot and the page shipped before it was added.",
          "Capture the screenshot and replace the marker."
        )
      )
    : out.push(pass("CL-4.3", "No screenshot placeholder markers in the page text."));

  return out;
}

export function checkCallouts(f: PageFacts): CheckResult[] {
  const out: CheckResult[] = [];
  // The checklist names the Additional Resources class "add-res", but the live docs
  // render "add-resource". Both are accepted so the mismatch surfaces once (in the
  // checklist sheet) instead of as a finding on every page that has one.
  const APPROVED = ["note", "tip", "warning", "add-res", "add-resource"];
  if (!f.callouts.length) {
    out.push(na("CL-6.1", "No callouts on this page."));
    out.push(na("CL-6.2", "No callouts on this page."));
    out.push(na("CL-6.3", "No Additional Resources callout on this page."));
  } else {
    const unapproved = f.callouts.filter((c) => !c.className.split(/\s+/).some((cl) => APPROVED.includes(cl)));
    unapproved.length
      ? out.push(
          warn(
            "CL-6.1",
            `${unapproved.length} callout(s) use a class outside the approved set.`,
            cap(unapproved.map((c) => ({ where: c.text.slice(0, 60), expected: APPROVED.join(" | "), actual: c.className }))),
            "A callout uses a non-standard class.",
            "The class was typed by hand in the HTML editor instead of using the callout style.",
            `Change the class to one of ${APPROVED.join(", ")}.`
          )
        )
      : out.push(pass("CL-6.1", `All ${f.callouts.length} callout(s) use approved classes.`));

    const labelIssues = f.callouts.filter((c) => {
      const cls = c.className.split(/\s+/).find((x) => APPROVED.includes(x));
      if (!cls) return false;
      const expectedLabel = cls.startsWith("add-res") ? "additional resource" : cls;
      return !c.labelBold || !c.label.toLowerCase().startsWith(expectedLabel.slice(0, 4));
    });
    labelIssues.length
      ? out.push(
          warn(
            "CL-6.2",
            `${labelIssues.length} callout(s) have a missing, non-bold or mismatched label.`,
            cap(labelIssues.map((c) => ({ where: c.className, expected: "bold label matching the class", actual: c.labelBold ? `"${c.label}"` : "no bold label" }))),
            "A callout's bold label does not match its type.",
            "The label text was edited without changing the class, or the bold tag was dropped.",
            "Set the leading bold word to Note / Tip / Warning / Additional Resource to match the class."
          )
        )
      : out.push(pass("CL-6.2", "Every callout has a bold label matching its class."));

    const addRes = f.callouts.filter((c) => c.className.split(/\s+/).some((x) => x.startsWith("add-res")));
    if (!addRes.length) out.push(na("CL-6.3", "No Additional Resources callout on this page."));
    else {
      const empty = addRes.filter((c) => c.linkCount === 0);
      empty.length
        ? out.push(
            warn(
              "CL-6.3",
              `${empty.length} Additional Resources callout(s) contain no link.`,
              cap(empty.map((c) => ({ where: c.text.slice(0, 60), expected: "≥ 1 link", actual: "0 links" }))),
              "An Additional Resources box has no linked resource.",
              "The box was added as a placeholder and the links were never filled in.",
              "Link the related documents, or remove the box."
            )
          )
        : out.push(pass("CL-6.3", "Every Additional Resources callout links to at least one document."));
    }
  }

  // CL-6.5 per-type left-border colour (checklist row 6.0, column C)
  if (!f.callouts.length) out.push(na("CL-6.5", "No callouts on this page."));
  else {
    const wrong: Evidence[] = [];
    for (const c of f.callouts) {
      const cls = c.className.split(/\s+/).find((x) => CALLOUT_BORDER_COLORS[x]);
      if (!cls) continue;
      const expected = CALLOUT_BORDER_COLORS[cls];
      const actual = c.borderLeftColor.toLowerCase();
      if (actual !== expected) {
        wrong.push({ where: `.${cls} — "${c.text.slice(0, 40)}"`, expected: `${expected} left border`, actual });
      }
    }
    wrong.length
      ? out.push(
          warn(
            "CL-6.5",
            `${wrong.length} callout(s) do not use the colour their type requires.`,
            cap(wrong),
            "A callout's left-border colour does not match its type.",
            "The callout styling changed, or the class was applied to the wrong box type.",
            "Restore the colour column C pins for that type (note #899cfa, tip #b0f7ba, warning #f35f61, additional resource #ac75ff)."
          )
        )
      : out.push(pass("CL-6.5", `All ${f.callouts.length} callout(s) use the colour their type requires.`));
  }

  // CL-6.4 destructive content needs a Warning
  // Only fire when the page actually walks the reader through a destructive action.
  // Matching the bare word "delete" anywhere flagged pages that merely NAME a menu item
  // ("the ellipsis adds Manage Billing, Downgrade, and Cancel & Delete Account").
  const destructiveHeading = f.headings.some((h) =>
    /\b(delete|deleting|remove|restore|revert)\b/i.test(h.text)
  );
  const destructivePhrase =
    /\b(permanently delete|cannot be undone|can't be undone|irreversible|will be deleted|moves? to the trash|deletes? (the|all|your) )\b/i.test(
      f.articleText
    );
  const destructive = destructiveHeading || destructivePhrase;
  const hasWarning = f.callouts.some((c) => c.className.split(/\s+/).includes("warning"));
  if (!destructive) out.push(na("CL-6.4", "Page does not document deletion or restore actions."));
  else if (hasWarning) out.push(pass("CL-6.4", "Destructive content is accompanied by a Warning callout."));
  else
    out.push(
      warn(
        "CL-6.4",
        "Page documents deletion/restore but carries no Warning callout.",
        [{ where: "article text", expected: "a .warning callout", actual: "none" }],
        "Destructive steps are documented without a warning.",
        "Checklist 6.0 makes a Warning mandatory for deletion/restore content; none was authored.",
        "Add a Warning callout above the destructive step stating what cannot be undone."
      )
    );

  return out;
}

export function checkSeo(f: PageFacts, auditedUrl: string): CheckResult[] {
  const out: CheckResult[] = [];
  const title = f.title || "";

  title.trim().endsWith("| Contentstack")
    ? out.push(pass("CL-10.1", `Title ends with the brand suffix: "${title}".`))
    : out.push(
        warn(
          "CL-10.1",
          `Title does not end with " | Contentstack".`,
          [{ where: "<title>", expected: "… | Contentstack", actual: title }],
          "The SEO title is missing the brand suffix.",
          "The SEO Title field in the entry was left without the trailing brand.",
          `Set the SEO title to "${title.replace(/\s*\|\s*Contentstack\s*$/, "")} | Contentstack".`
        )
      );

  const h1 = f.headings.find((h) => h.level === 1)?.text ?? "";
  // Strip whatever trailing "| <suffix>" the site emits, not only "| Contentstack".
  // Otherwise "X | Documentation" fails CL-10.2 over a suffix problem CL-10.1 already
  // reports, and the title/H1/slug comparison is simply wrong.
  const titleCore = title.replace(/\s*\|[^|]*$/, "").trim();
  const slug = decodeURIComponent(new URL(auditedUrl).pathname.split("/").filter(Boolean).pop() || "");
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const slugWords = new Set(norm(slug.replace(/-/g, " ")).split(" ").filter(Boolean));
  const h1Words = norm(h1).split(" ").filter(Boolean);
  const overlap = h1Words.length ? h1Words.filter((w) => slugWords.has(w)).length / h1Words.length : 0;
  const titleMatchesH1 = norm(titleCore) === norm(h1);

  if (titleMatchesH1 && overlap >= 0.6) out.push(pass("CL-10.2", `Title, H1 and slug agree ("${h1}").`));
  else
    out.push(
      warn(
        "CL-10.2",
        "Title, H1 and URL slug are not the same.",
        [
          { where: "<title>", expected: "same as H1", actual: titleCore },
          { where: "H1", actual: h1 },
          { where: "URL slug", expected: `words overlapping the H1 (${Math.round(overlap * 100)}% match)`, actual: slug },
        ],
        "The page title, the H1 and the URL slug do not carry the same name.",
        "The page was renamed after publish and only some of the three were updated.",
        `Pick one name and apply it to all three — currently title "${titleCore}", H1 "${h1}", slug "${slug}".`
      )
    );

  const canonical = f.canonical ? f.canonical.replace(/\/$/, "") : null;
  const audited = auditedUrl.replace(/\/$/, "");
  if (!canonical) out.push(warn("CL-10.3", "No canonical link on the page.", [{ where: "link[rel=canonical]", expected: audited, actual: "missing" }], "The page declares no canonical URL.", "The canonical tag is not emitted by this template.", `Emit <link rel="canonical" href="${audited}">.`));
  else if (canonical === audited) out.push(pass("CL-10.3", "Canonical URL matches the audited URL."));
  else
    out.push(
      warn(
        "CL-10.3",
        "Canonical URL points somewhere else.",
        [{ where: "link[rel=canonical]", expected: audited, actual: canonical }],
        "The canonical URL does not match the page it is on.",
        "The entry was duplicated from another page and the canonical field was carried over.",
        `Set the canonical to ${audited}.`
      )
    );

  return out;
}

export function checkNavigation(f: PageFacts): CheckResult[] {
  const out: CheckResult[] = [];

  if (!f.rightNavPresent) {
    out.push(
      warn(
        "CL-11.1",
        "No 'On this page' navigation found.",
        [{ where: "right nav", expected: "On this page list", actual: "missing" }],
        "The right-hand navigation is absent.",
        "The page has no headings to index, or the component failed to render.",
        "Confirm the page has H2 sections; if it does, the right nav component is broken on this template."
      )
    );
  } else {
    const ids = new Set(f.headingIds);
    const dangling = f.rightNav.filter((r) => r.href.startsWith("#") && !ids.has(decodeURIComponent(r.href.slice(1))));
    dangling.length
      ? out.push(
          warn(
            "CL-11.1",
            `${dangling.length} right-nav entr(ies) point at an id that does not exist.`,
            cap(dangling.map((d) => ({ where: d.text, expected: "matching heading id", actual: d.href }))),
            "A right-nav anchor scrolls nowhere.",
            "The heading text was edited after the anchor id was generated.",
            "Regenerate the heading anchors so the right-nav hrefs match the heading ids."
          )
        )
      : out.push(pass("CL-11.1", `All ${f.rightNav.length} right-nav entries resolve to a heading on the page.`));
  }

  if (f.leftNavActive.present && f.leftNavActive.activeText)
    out.push(pass("CL-12.1", `Left nav marks the current page (${f.leftNavActive.activeText}).`));
  else if (!f.leftNavActive.present)
    out.push(
      warn(
        "CL-12.1",
        "Current page is not listed in the left navigation.",
        [{ where: "left nav", expected: "an entry linking to this page", actual: "none" }],
        "This page has no entry in the left navigation.",
        "The page is orphaned — published but never added to the section's nav tree.",
        "Add the page to the left navigation for its section."
      )
    );
  else
    out.push(
      warn(
        "CL-12.1",
        "Left nav lists the page but does not visually mark it as selected.",
        [{ where: "left nav entry", expected: "aria-current / active class / distinct style", actual: "same as siblings" }],
        "The active left-nav entry is indistinguishable from its siblings.",
        "The nav component does not set aria-current or an active class on the current route.",
        "Set aria-current=\"page\" on the active entry and style it distinctly."
      )
    );

  return out;
}

export function checkCodeBlocks(f: PageFacts): CheckResult[] {
  const out: CheckResult[] = [];
  if (!f.codeBlocks.length) {
    out.push(na("CL-15.1", "No code blocks on this page."));
    out.push(na("CL-15.2", "No code blocks on this page."));
    out.push(na("CL-15.3", "No code blocks on this page."));
    return out;
  }

  const noCopy = f.codeBlocks.map((c, i) => ({ c, i })).filter(({ c }) => !c.hasCopyControl);
  noCopy.length
    ? out.push(
        warn(
          "CL-15.1",
          `${noCopy.length}/${f.codeBlocks.length} code block(s) have no copy control.`,
          cap(noCopy.map(({ i }) => ({ where: `pre[${i}]`, expected: "copy button", actual: "none" }))),
          "A code block cannot be copied with one click.",
          "The snippet was authored as a plain <pre> instead of the code block component.",
          "Re-insert the snippet using the code block component so the copy icon renders."
        )
      )
    : out.push(pass("CL-15.1", `All ${f.codeBlocks.length} code block(s) expose a copy control.`));

  const mixedQuotes = f.codeBlocks
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      const single = (c.text.match(/'/g) || []).length;
      const dbl = (c.text.match(/"/g) || []).length;
      return single >= 2 && dbl >= 2;
    });
  mixedQuotes.length
    ? out.push(
        warn(
          "CL-15.2",
          `${mixedQuotes.length} code block(s) mix single and double quotes.`,
          cap(mixedQuotes.map(({ i }) => ({ where: `pre[${i}]`, expected: "one quote style", actual: "both ' and \"" }))),
          "Quote style is inconsistent inside one snippet.",
          "The snippet was assembled from two sources with different conventions.",
          "Normalise the snippet to a single quote style."
        )
      )
    : out.push(pass("CL-15.2", "Quote style is consistent within each code block."));

  const unbalanced = f.codeBlocks
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => {
      const count = (ch: string) => (c.text.match(new RegExp("\\" + ch, "g")) || []).length;
      return count("{") !== count("}") || count("[") !== count("]") || count("(") !== count(")");
    });
  unbalanced.length
    ? out.push(
        warn(
          "CL-15.3",
          `${unbalanced.length} code block(s) have unbalanced brackets.`,
          cap(unbalanced.map(({ i }) => ({ where: `pre[${i}]`, expected: "balanced () [] {}", actual: "unbalanced" }))),
          "A snippet's brackets do not balance, so it will not run as printed.",
          "The snippet is truncated, or an ellipsis replaced part of it without closing the structure.",
          "Complete the snippet, or mark the elision so the reader knows code was omitted."
        )
      )
    : out.push(pass("CL-15.3", "All code blocks have balanced brackets."));

  return out;
}

export function checkLlmControls(f: PageFacts, auditedUrl: string, markdownStatus: number | null): CheckResult[] {
  const out: CheckResult[] = [];

  if (!f.viewAsMarkdown) {
    out.push(
      warn(
        "CL-22.2",
        "No 'View as Markdown' link on the page.",
        [{ where: "page", expected: "View as Markdown link", actual: "missing" }],
        "The View as Markdown affordance is absent.",
        "The control is not rendered on this template.",
        "Render the View as Markdown link alongside Copy for LLM."
      )
    );
    return out;
  }

  const href = f.viewAsMarkdown.href || "";
  const expectedPath = new URL(auditedUrl).pathname.replace(/\/$/, "") + ".md";
  const pathOk = href.replace(/\/$/, "") === expectedPath;
  const newTab = f.viewAsMarkdown.target === "_blank";
  const reachable = markdownStatus !== null && markdownStatus < 400;

  if (pathOk && newTab && reachable)
    out.push(pass("CL-22.2", `View as Markdown opens ${href} in a new tab (HTTP ${markdownStatus}).`));
  else
    out.push(
      warn(
        "CL-22.2",
        "View as Markdown does not behave as the checklist specifies.",
        [
          { where: "href", expected: expectedPath, actual: href },
          { where: "target", expected: "_blank", actual: f.viewAsMarkdown.target ?? "none" },
          { where: "markdown response", expected: "< 400", actual: markdownStatus === null ? "not fetched" : String(markdownStatus) },
        ],
        "The Markdown view link is wrong or unreachable.",
        pathOk ? "The link resolves but the .md response is not served." : "The link's href does not mirror the page URL with a .md suffix.",
        `Point the link at ${expectedPath} with target="_blank" and confirm the .md route responds.`
      )
    );

  return out;
}

/** Checklist final row (added 2026-09-02): the page should show when it was last updated. */
export function checkLastUpdated(f: PageFacts): CheckResult {
  if (f.lastUpdated) return pass("CL-22.3", `Page shows "${f.lastUpdated}".`);
  return warn(
    "CL-22.3",
    "No 'Last updated' stamp found on the page.",
    [{ where: "page", expected: "a Last updated date", actual: "none" }],
    "The page does not tell the reader how current it is.",
    "The template does not render the entry's updated_at.",
    "Render a 'Last updated <date>' stamp on every doc page, as the checklist now requires."
  );
}

export function checkButtons(f: PageFacts): CheckResult[] {
  const inArticle = f.buttons.filter((b) => b.inArticle);
  if (!inArticle.length) return [na("CL-3.1", "No buttons inside the article body.")];
  const bad = inArticle.filter((b) => !b.name || b.disabled);
  if (!bad.length) return [pass("CL-3.1", `All ${inArticle.length} in-article button(s) are named and enabled.`)];
  return [
    warn(
      "CL-3.1",
      `${bad.length} in-article button(s) are unnamed or disabled.`,
      cap(bad.map((b) => ({ where: b.name || "(no accessible name)", expected: "named and enabled", actual: b.disabled ? "disabled" : "no accessible name" }))),
      "A control in the article body has no accessible name or cannot be activated.",
      "The button renders an icon with no aria-label, or ships in a disabled state.",
      "Give the control an aria-label, or remove it if it is not meant to be used."
    ),
  ];
}

/**
 * Drives one doc URL through every checklist + style-guide rule and returns a
 * ChecklistDocResult.
 *
 * Interactive checks (link status, hover, responsive, keyboard, scroll-spy, copy
 * button) live here because they need the Page; everything static is delegated to
 * domChecks/proseChecks.
 */

import type { Page } from "@playwright/test";
import { collectPageFacts, type PageFacts } from "./pageFacts";
import {
  checkBreadcrumb,
  checkButtons,
  checkLastUpdated,
  checkCallouts,
  checkCodeBlocks,
  checkImages,
  checkLlmControls,
  checkNavigation,
  checkSeo,
  checkTypography,
} from "./domChecks";
import {
  checkBoldLimits,
  checkCommaSplice,
  checkCodeTags,
  checkHeadingCase,
  checkPassiveVoice,
  checkSecrets,
  checkSmartQuotes,
  checkTitleRules,
  checkUiBold,
  checkWhyWhen,
  checkWordRules,
} from "./proseChecks";
import { CHECKS, MANUAL_CHECKS } from "./registry";
import { tallyCounts, type CheckResult, type ChecklistDocResult, type Evidence } from "./types";

const LOAD_BUDGET_MS = Number(process.env.CL_LOAD_BUDGET_MS || 4000); // checklist 19.0: "shouldn't be more than 4 secs"
const LINK_CONCURRENCY = Number(process.env.CL_LINK_CONCURRENCY || 8);
const MAX_LINKS = Number(process.env.CL_MAX_LINKS || 120);
/**
 * Wall-clock budget for the whole link sweep. www.contentstack.com throttles repeated
 * bursts of link checks, and a throttled host used to stall the test until Playwright
 * tore the page down — which surfaced as every rule FAILing. When the budget runs out the
 * remaining links are reported as unchecked rather than silently dropped.
 */
const LINK_BUDGET_MS = Number(process.env.CL_LINK_BUDGET_MS || 90_000);

const pass = (id: string, summary: string, evidence: Evidence[] = []): CheckResult => ({ id, status: "PASS", summary, evidence });
const warn = (id: string, summary: string, evidence: Evidence[], issue: string, rootCause: string, suggestedFix: string): CheckResult => ({
  id,
  status: "WARN",
  summary,
  evidence,
  issue,
  rootCause,
  suggestedFix,
});
const cap = (e: Evidence[], n = 10) => (e.length <= n ? e : [...e.slice(0, n), { where: `… and ${e.length - n} more` }]);

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

/** Uses the page's request context so cookies/CDN rules match what a reader gets. */
async function headStatus(page: Page, url: string): Promise<{ status?: number; error?: string }> {
  try {
    const res = await page.request.get(url, { maxRedirects: 5, timeout: 10_000 });
    return { status: res.status() };
  } catch (e) {
    return { error: String(e).slice(0, 120) };
  }
}

/**
 * Statuses that mean "the runner was throttled or bot-blocked", not "the link is dead".
 * GitHub answers 429 to a burst of link checks; LinkedIn answers 999. Reporting these as
 * broken links trains the reader to ignore CL-5.1.
 */
const INCONCLUSIVE_STATUSES = new Set([429, 999, 403]);
/**
 * A request that never answered is inconclusive, not broken. Under throttling the docs
 * host simply stops responding, and reporting those as 404s would cry wolf on links that
 * are demonstrably fine (the same URLs resolve when the sweep is not being throttled).
 * Only a real HTTP status >= 400 counts as broken.
 */
const isBroken = (status?: number) => (status === undefined ? false : status >= 400 && !INCONCLUSIVE_STATUSES.has(status));
const isInconclusive = (status?: number, error?: string) =>
  (status !== undefined && INCONCLUSIVE_STATUSES.has(status)) || (status === undefined && !!error);

async function checkLinks(page: Page, facts: PageFacts): Promise<CheckResult[]> {
  const out: CheckResult[] = [];
  const links = facts.links.filter((l) => /^https?:/i.test(l.resolved)).slice(0, MAX_LINKS);

  if (!links.length) {
    out.push({ id: "CL-5.1", status: "NA", summary: "No links in the article body.", evidence: [] });
    out.push({ id: "CL-5.2", status: "NA", summary: "No links in the article body.", evidence: [] });
    out.push({ id: "CL-5.3", status: "NA", summary: "No links in the article body.", evidence: [] });
    out.push({ id: "CL-5.4", status: "NA", summary: "No links in the article body.", evidence: [] });
    out.push({ id: "CL-5.5", status: "NA", summary: "No links in the article body.", evidence: [] });
    return out;
  }

  const sweepStart = Date.now();
  let skipped = 0;
  const statuses = await mapLimit(links, LINK_CONCURRENCY, async (l) => {
    if (Date.now() - sweepStart > LINK_BUDGET_MS) {
      skipped += 1;
      return { l, status: undefined, error: "not checked (link-sweep budget exhausted)", skipped: true };
    }
    return { l, ...(await headStatus(page, l.resolved)), skipped: false };
  });
  const checked = statuses.filter((s) => !s.skipped);
  const broken = checked.filter((s) => isBroken(s.status));
  const throttled = checked.filter((s) => isInconclusive(s.status, s.error));
  const skipNote = skipped
    ? ` ${skipped} of ${links.length} link(s) were NOT checked - the ${Math.round(LINK_BUDGET_MS / 1000)}s link-sweep budget ran out (the docs host throttles bursts). Raise CL_LINK_BUDGET_MS to cover them.`
    : "";
  const throttleNote = throttled.length
    ? ` ${throttled.length} link(s) were INCONCLUSIVE - a 403/429/999 answer or no answer at all (throttling or bot-blocking), not counted as broken: ${throttled
        .map((t) => `${t.l.resolved} → ${t.status ?? "no response"}`)
        .slice(0, 3)
        .join(", ")}`
    : "";

  broken.length
    ? out.push(
        warn(
          "CL-5.1",
          `${broken.length}/${checked.length} checked link(s) are broken.${throttleNote}${skipNote}`,
          cap(broken.map((b) => ({ where: `"${b.l.text}" → ${b.l.resolved}`, expected: "< 400", actual: b.error ? b.error : String(b.status) }))),
          "A link in the article does not resolve.",
          "The target page was renamed, unpublished, or the URL was mistyped.",
          "Update the href to the current URL, or remove the link."
        )
      )
    : out.push(pass("CL-5.1", `All ${checked.length} checked article link(s) resolve.${throttleNote}${skipNote}`));

  // CL-5.2 internal links in the same tab.
  // Only /docs pages count: the checklist's rule is about staying inside the documentation.
  // Off-docs same-host destinations (login, pricing) and the View-as-Markdown control are
  // excluded — CL-22.2 explicitly requires the Markdown link to open in a new tab.
  const internalNewTab = links.filter(
    (l) => l.docsInternal && l.target === "_blank" && !/\.md$/i.test(l.href) && !/view as markdown/i.test(l.text)
  );
  internalNewTab.length
    ? out.push(
        warn(
          "CL-5.2",
          `${internalNewTab.length} internal link(s) open in a new tab.`,
          cap(internalNewTab.map((l) => ({ where: `"${l.text}" → ${l.href}`, expected: "same tab", actual: 'target="_blank"' }))),
          "An internal docs link opens a new tab.",
          "target=\"_blank\" was applied to a link that stays on the docs site.",
          "Remove target=\"_blank\" — the checklist reserves it for third-party links."
        )
      )
    : out.push(pass("CL-5.2", "All internal links open in the same tab."));

  // CL-5.3 external links
  const externals = links.filter((l) => l.external);
  if (!externals.length) out.push({ id: "CL-5.3", status: "NA", summary: "No third-party links on this page.", evidence: [] });
  else {
    const bad = externals.filter((l) => l.target !== "_blank" || l.resolved.startsWith("http://"));
    bad.length
      ? out.push(
          warn(
            "CL-5.3",
            `${bad.length}/${externals.length} third-party link(s) do not follow the rule.`,
            cap(bad.map((l) => ({ where: `"${l.text}" → ${l.resolved}`, expected: 'https + target="_blank"', actual: `${l.resolved.startsWith("http://") ? "http" : "https"} + target=${l.target ?? "none"}` }))),
            "A third-party link either stays in the same tab or uses http.",
            "The link was inserted without the new-tab attribute, or the vendor URL was copied as http.",
            'Set target="_blank" rel="noopener noreferrer" and use the https URL.'
          )
        )
      : out.push(pass("CL-5.3", `All ${externals.length} third-party link(s) use https and open in a new tab.`));
  }

  // CL-5.4 — checklist 5.0 as revised 2026-09-02: links are underlined (at rest) and blue
  // on hover. Prose links only; chrome inside the article container (prev/next pagination,
  // the Markdown control) is styled as a button, not a link.
  const sample = links.filter((l) => l.inProse).slice(0, 5);
  const hoverResults: Evidence[] = [];
  for (const l of sample) {
    try {
      const locator = page.locator(`#docs-article-content a[href="${l.href.replace(/"/g, '\\"')}"]`).first();
      if (!(await locator.count())) continue;
      const read = () =>
        locator.evaluate((el) => {
          const s = getComputedStyle(el);
          return { deco: s.textDecorationLine, color: s.color };
        });
      const before = await read();
      await locator.hover({ timeout: 5000 });
      await page.waitForTimeout(200);
      const after = await read();
      if (!/underline/.test(before.deco)) {
        hoverResults.push({ where: `"${l.text}"`, expected: "underlined at rest", actual: before.deco });
      }
      if (before.color === after.color) {
        hoverResults.push({
          where: `"${l.text}" on hover`,
          expected: "colour changes on hover (checklist says blue)",
          actual: `unchanged ${after.color}`,
        });
      }
    } catch {
      // hover can fail on off-screen or covered links; not a finding
    }
  }
  if (!sample.length) out.push({ id: "CL-5.4", status: "NA", summary: "No prose links to hover-test.", evidence: [] });
  else hoverResults.length
    ? out.push(
        warn(
          "CL-5.4",
          `${hoverResults.length} link-styling issue(s) across ${sample.length} sampled prose link(s).`,
          cap(hoverResults),
          "Link styling does not match checklist 5.0 points 1 and 2.",
          "Either the underline is missing at rest, or hovering does not change the colour.",
          "Underline article links at rest and give them a distinct hover colour, as the checklist states."
        )
      )
    : out.push(pass("CL-5.4", `Sampled ${sample.length} prose link(s); all underlined at rest and changing colour on hover.`));

  // CL-5.5 stray whitespace inside the anchor
  const edgeWs = links.filter((l) => l.anchorHasEdgeWhitespace);
  edgeWs.length
    ? out.push(
        warn(
          "CL-5.5",
          `${edgeWs.length} link(s) include leading/trailing whitespace inside the anchor.`,
          cap(edgeWs.map((l) => ({ where: `"${l.text}"`, expected: "no space inside the anchor", actual: "whitespace inside <a>" }))),
          "The underline extends past the link text.",
          "A space was selected along with the words when the link was applied in the editor.",
          "Re-apply the link to the words only, leaving the surrounding spaces outside the anchor."
        )
      )
    : out.push(pass("CL-5.5", "No anchor carries stray leading/trailing whitespace."));

  return out;
}

async function checkScrollSpy(page: Page, facts: PageFacts): Promise<CheckResult> {
  if (!facts.rightNavPresent || facts.rightNav.length < 2)
    return { id: "CL-11.2", status: "NA", summary: "Right nav absent or too short to scroll-spy.", evidence: [] };
  try {
    // Track WHICH entry is active at each scroll position — not what one entry looks like.
    //
    // The previous implementation scrolled to section N and then read the style of section
    // N's own anchor. When scroll-spy works, the anchor for the section in view is always
    // the active one, so every sample returned the identical active style, the "distinct
    // styles" set had size 1, and the check fell through to a fallback that tested the LAST
    // nav entry — which can never become active, because the page runs out of scroll before
    // that section reaches the top. Net effect: working scroll-spy reported as broken on
    // every page with a right nav. Verified against the live site, where the highlight
    // demonstrably moves between entries as the reader scrolls.
    const candidates = facts.rightNav
      .map((r) => r.href.slice(1))
      .filter(Boolean)
      .slice(0, 6);

    /** Scroll a section to centre, then report which nav entry is highlighted. */
    const activeAfterScrollTo = async (sectionId: string): Promise<string | null> => {
      const ok = await page
        .evaluate((id) => {
          const el = document.getElementById(id);
          if (!el) return false;
          el.scrollIntoView({ block: "center" });
          return true;
        }, sectionId)
        .catch(() => false);
      if (!ok) return null;
      await page.waitForTimeout(700);
      return page
        .evaluate(() => {
          const nav = Array.from(document.querySelectorAll("nav,aside")).find((n) =>
            /on this page/i.test((n.textContent || "").slice(0, 200))
          );
          if (!nav) return null;
          const anchors = Array.from(nav.querySelectorAll("a")) as HTMLElement[];
          if (anchors.length < 2) return null;
          const styleOf = (a: HTMLElement) => {
            const s = getComputedStyle(a);
            return `${s.color}|${s.fontWeight}|${s.borderLeftColor}`;
          };
          // The inactive style is whatever most entries share; the odd one out is active.
          const counts = new Map<string, number>();
          for (const a of anchors) {
            const k = styleOf(a);
            counts.set(k, (counts.get(k) || 0) + 1);
          }
          let inactive = "";
          let best = -1;
          for (const [style, n] of counts) {
            if (n > best) {
              best = n;
              inactive = style;
            }
          }
          const active = anchors.find((a) => styleOf(a) !== inactive);
          return active ? active.getAttribute("href") : null;
        })
        .catch(() => null);
    };

    const actives: string[] = [];
    for (const id of candidates) {
      const href = await activeAfterScrollTo(id);
      if (href) actives.push(href);
    }

    const distinct = new Set(actives);
    if (distinct.size > 1) {
      return pass(
        "CL-11.2",
        `Right nav tracks the reader's position (${distinct.size} different entries became active across ${candidates.length} sampled sections).`
      );
    }
    if (!actives.length) {
      return {
        id: "CL-11.2",
        status: "NA",
        summary: "No right-nav entry was ever styled differently from the rest — active and inactive are indistinguishable.",
        evidence: [],
      };
    }
    return warn(
      "CL-11.2",
      "Right-nav highlight does not move as different sections are scrolled into view.",
      [
        {
          where: "right nav ('On this page')",
          expected: "a different entry becomes active per section",
          actual: `the same entry (${actives[0]}) stayed active across ${actives.length} sampled sections`,
        },
      ],
      "The 'On this page' list does not track the reader's scroll position.",
      "No scroll-spy observer is wired to the right nav, or it never updates after the first section.",
      "Highlight the entry whose section is in the viewport, as checklist 11.0 requires."
    );
  } catch (e) {
    return { id: "CL-11.2", status: "NA", summary: `Scroll-spy check skipped: ${String(e).slice(0, 80)}`, evidence: [] };
  }
}

async function checkResponsive(page: Page): Promise<CheckResult> {
  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1440, height: 900 },
  ];
  const original = page.viewportSize();
  const evidence: Evidence[] = [];
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (overflow.scrollWidth > overflow.clientWidth + 2) {
      evidence.push({ where: `${vp.name} ${vp.width}px`, expected: `≤ ${overflow.clientWidth}px`, actual: `${overflow.scrollWidth}px` });
    }
  }
  if (original) await page.setViewportSize(original);
  if (!evidence.length) return pass("CL-16.1", "No horizontal overflow at mobile, tablet or desktop widths.");
  return warn(
    "CL-16.1",
    `Horizontal overflow at ${evidence.length} viewport size(s).`,
    evidence,
    "The page scrolls sideways on at least one screen size.",
    "A fixed-width element (usually a wide table, code block or image) does not shrink below its content width.",
    "Give the offending block overflow-x: auto inside its own container so the page itself never scrolls sideways."
  );
}

async function checkKeyboard(page: Page): Promise<CheckResult> {
  try {
    await page.keyboard.press("Tab");
    const reached: string[] = [];
    for (let i = 0; i < 25; i++) {
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const article = document.querySelector("#docs-article-content");
        return {
          tag: el.tagName.toLowerCase(),
          name: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 40),
          inArticle: !!(article && article.contains(el)),
          visibleFocus: getComputedStyle(el).outlineStyle !== "none" || getComputedStyle(el).boxShadow !== "none",
        };
      });
      if (info?.inArticle) reached.push(`${info.tag}:${info.name}`);
      await page.keyboard.press("Tab");
    }
    if (reached.length) return pass("CL-18.1", `Keyboard tab order reaches ${reached.length} element(s) inside the article.`, [{ where: reached.slice(0, 5).join(", ") }]);
    return warn(
      "CL-18.1",
      "25 Tab presses never landed inside the article body.",
      [{ where: "tab order", expected: "focus enters the article", actual: "focus stayed in chrome/nav" }],
      "A keyboard user cannot reach the article content in a reasonable number of tab presses.",
      "There is no skip-to-content link, so focus walks the entire header and left nav first.",
      "Add a 'Skip to main content' link as the first focusable element."
    );
  } catch (e) {
    return { id: "CL-18.1", status: "NA", summary: `Keyboard check skipped: ${String(e).slice(0, 80)}`, evidence: [] };
  }
}

async function checkCopyForLlm(page: Page, facts: PageFacts): Promise<CheckResult> {
  if (!facts.copyForLlmPresent)
    return warn(
      "CL-22.1",
      "No 'Copy for LLM' control found on the page.",
      [{ where: "page", expected: "Copy for LLM button", actual: "missing" }],
      "The Copy for LLM affordance is absent.",
      "The control is not rendered on this template.",
      "Render the Copy for LLM control as on the other doc pages."
    );
  try {
    // The label is duplicated in a visually-hidden span, so target the button element itself.
    const btn = page.locator("button").filter({ hasText: /copy for llm/i }).first();
    // Two things this check got wrong before:
    //  1. the page must be FOCUSED — navigator.clipboard.writeText() rejects in an
    //     unfocused tab, so the app's success handler never runs and no state appears;
    //  2. the "Copied" state is transient (it shows around 600ms and then reverts), so a
    //     single read at a fixed delay misses it. Poll instead.
    await page.bringToFront().catch(() => {});
    await btn.scrollIntoViewIfNeeded({ timeout: 5000 });
    const labelBefore = (await btn.innerText()).replace(/\s+/g, " ").trim();
    await btn.click({ timeout: 5000 });
    let confirmed = false;
    let labelAfter = labelBefore;
    for (let i = 0; i < 20 && !confirmed; i++) {
      await page.waitForTimeout(200);
      const state = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll("button")).find((x) =>
          /copy for llm|copied/i.test(x.textContent || "")
        );
        return {
          body: /copied/i.test(document.body.innerText),
          label: (b?.textContent || "").replace(/\s+/g, " ").trim(),
        };
      });
      if (state.label) labelAfter = state.label;
      confirmed = state.body || /copied/i.test(state.label);
    }
    if (confirmed) return pass("CL-22.1", "Copy for LLM shows a 'Copied' confirmation after the click.");
    return warn(
      "CL-22.1",
      "Copy for LLM did not show a 'Copied' confirmation.",
      [
        { where: "button label", expected: "changes to 'Copied'", actual: `"${labelBefore}" → "${labelAfter}"` },
        { where: "page text", expected: "'Copied' appears somewhere", actual: "not found within 4s of the click, with the page focused and clipboard permission granted" },
      ],
      "The button gives no feedback that the copy succeeded.",
      "The confirmation state is not rendered, or clipboard access is denied in this browser context.",
      "Show the 'Copied' state on success; if the clipboard API is blocked, surface an error instead of nothing."
    );
  } catch (e) {
    return { id: "CL-22.1", status: "NA", summary: `Copy for LLM check skipped: ${String(e).slice(0, 80)}`, evidence: [] };
  }
}

export type RunOptions = {
  project: string;
  /** Console errors captured by the caller across page load. */
  consoleErrors: string[];
  /** navigationStart → loadEventEnd, measured by the caller. */
  loadMs: number;
  httpStatus?: number;
};

export async function runChecklistForPage(page: Page, docUrl: string, opts: RunOptions): Promise<ChecklistDocResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const facts = await collectPageFacts(page);

  // Breadcrumb link statuses (separate from article links — breadcrumbs live outside the article root).
  const bcLinks = facts.breadcrumb.filter((b) => b.href);
  const bcStatuses = await mapLimit(bcLinks, 4, async (b) => {
    const abs = new URL(b.href!, docUrl).toString();
    const { status } = await headStatus(page, abs);
    return { href: abs, status };
  });
  const brokenBreadcrumbs = bcStatuses.filter((s) => isBroken(s.status));

  // .md route for the View as Markdown check
  let markdownStatus: number | null = null;
  if (facts.viewAsMarkdown?.href) {
    const abs = new URL(facts.viewAsMarkdown.href, docUrl).toString();
    markdownStatus = (await headStatus(page, abs)).status ?? null;
  }

  const results: CheckResult[] = [
    ...checkTypography(facts),
    ...checkBreadcrumb(facts, brokenBreadcrumbs),
    ...checkButtons(facts),
    ...checkImages(facts),
    ...(await checkLinks(page, facts)),
    ...checkCallouts(facts),
    checkBoldLimits(facts),
    checkCodeTags(facts),
    checkUiBold(facts),
    ...checkSeo(facts, docUrl),
    ...checkNavigation(facts),
    await checkScrollSpy(page, facts),
    ...checkCodeBlocks(facts),
    await checkResponsive(page),
    checkSecrets(facts),
    // CL-18.1 keyboard check excluded at the user's request (2026-09-03).
    await checkCopyForLlm(page, facts),
    ...checkLlmControls(facts, docUrl, markdownStatus),
    checkLastUpdated(facts),
    // style guide
    checkHeadingCase(facts),
    ...checkTitleRules(facts),
    ...checkWordRules(facts),
    checkPassiveVoice(facts),
    checkWhyWhen(facts),
    checkSmartQuotes(facts),
    checkCommaSplice(facts),
  ];

  // CL-19.1 / CL-19.2 from the caller's measurements
  results.push(
    opts.loadMs <= LOAD_BUDGET_MS
      ? pass("CL-19.1", `Page load completed in ${opts.loadMs} ms (budget ${LOAD_BUDGET_MS} ms).`)
      : warn(
          "CL-19.1",
          `Page load took ${opts.loadMs} ms, over the ${LOAD_BUDGET_MS} ms budget.`,
          [{ where: "navigation timing", expected: `≤ ${LOAD_BUDGET_MS} ms`, actual: `${opts.loadMs} ms` }],
          "The page exceeds the checklist's load-time budget on this run.",
          "Measured from Navigation Timing on one headless run — third-party scripts and cold CDN caches both inflate it.",
          "Confirm with PageSpeed Insights before filing; if it reproduces, the usual cause is unoptimised images or blocking third-party tags."
        )
  );
  results.push(
    opts.consoleErrors.length === 0
      ? pass("CL-19.2", "No JavaScript console errors during load.")
      : warn(
          "CL-19.2",
          `${opts.consoleErrors.length} console error(s) during load.`,
          cap(opts.consoleErrors.map((e) => ({ where: e.slice(0, 160) }))),
          "The page logs JavaScript errors while loading.",
          "Usually a third-party tag or a failed asset request rather than the docs app itself.",
          "Triage each error; anything thrown by the docs app itself should be filed against the docs site."
        )
  );

  // Rules automation deliberately does not judge.
  for (const m of MANUAL_CHECKS) {
    results.push({
      id: m.id,
      status: "NOT_CHECKED",
      summary: m.rationale,
      evidence: [],
    });
  }

  // Any registered check that produced no result at all (guards against silent gaps).
  const seen = new Set(results.map((r) => r.id));
  for (const def of CHECKS) {
    if (!seen.has(def.id)) {
      results.push({ id: def.id, status: "NOT_CHECKED", summary: "No result produced by this run.", evidence: [] });
    }
  }

  results.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  return {
    docUrl,
    project: opts.project,
    finalUrl: facts.url,
    httpStatus: opts.httpStatus,
    pageTitle: facts.title,
    runStartedAt: startedAt,
    durationMs: Date.now() - t0,
    results,
    counts: tallyCounts(results),
  };
}

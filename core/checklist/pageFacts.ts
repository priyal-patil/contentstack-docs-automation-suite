/**
 * One in-page evaluation that collects everything the static checks need.
 *
 * Kept as a single evaluate() call so a doc page is only walked once — the audit
 * already runs over 75 Administration URLs and a per-check round trip would triple
 * the wall clock.
 *
 * ARTICLE_ROOT is the redesigned docs container (`#docs-article-content`). Falling
 * back to <main> would drag the left/right nav into every text check.
 */

import type { Page } from "@playwright/test";

export const ARTICLE_ROOT = "#docs-article-content";

export type HeadingFact = {
  level: number;
  text: string;
  id: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  textAlign: string;
  hasNestedStrong: boolean;
};

export type LinkFact = {
  text: string;
  href: string;
  resolved: string;
  target: string | null;
  rel: string | null;
  external: boolean;
  /** Same site AND under /docs — the only kind the "open in the same tab" rule covers. */
  docsInternal: boolean;
  /** Sits inside a paragraph/list/table cell, i.e. is a prose link rather than page chrome. */
  inProse: boolean;
  color: string;
  textDecoration: string;
  hoverUnderline: boolean;
  anchorHasEdgeWhitespace: boolean;
  inArticle: boolean;
};

export type ImageFact = {
  src: string;
  alt: string;
  naturalWidth: number;
  naturalHeight: number;
  clientWidth: number;
  clientHeight: number;
  inArticle: boolean;
};

export type CalloutFact = {
  className: string;
  label: string;
  labelBold: boolean;
  text: string;
  linkCount: number;
  /** Left-border colour as #rrggbb — checklist row 6.0 column C pins one per type. */
  borderLeftColor: string;
  borderLeftWidth: string;
};

export type CodeBlockFact = {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  textAlign: string;
  hasCopyControl: boolean;
};

export type PageFacts = {
  url: string;
  title: string;
  canonical: string | null;
  metaDescription: string | null;
  h1Count: number;
  headings: HeadingFact[];
  paragraphStyle: { fontSize: number; fontWeight: number; fontFamily: string } | null;
  listItemStyle: { fontSize: number; fontFamily: string } | null;
  links: LinkFact[];
  images: ImageFact[];
  callouts: CalloutFact[];
  codeBlocks: CodeBlockFact[];
  inlineCodeCount: number;
  tables: { headerCells: number; boldHeaderCells: number; rows: number }[];
  breadcrumb: { text: string; href: string | null; hasTooltip: boolean }[];
  rightNav: { text: string; href: string }[];
  rightNavPresent: boolean;
  headingIds: string[];
  leftNavActive: { present: boolean; activeText: string | null };
  buttons: { name: string; disabled: boolean; inArticle: boolean }[];
  articleText: string;
  articleHtml: string;
  boldTexts: string[];
  copyForLlmPresent: boolean;
  viewAsMarkdown: { href: string | null; target: string | null } | null;
  /** Text of the "Last updated" stamp, when the page carries one. */
  lastUpdated: string | null;
};

export async function collectPageFacts(page: Page): Promise<PageFacts> {
  return page.evaluate((articleRootSelector) => {
    const doc = document;
    const article = doc.querySelector(articleRootSelector) as HTMLElement | null;
    const root: HTMLElement = article || (doc.querySelector("main") as HTMLElement) || doc.body;

    const num = (v: string) => parseFloat(v) || 0;
    const inArticle = (el: Element) => !!(article && article.contains(el));

    // --- headings -----------------------------------------------------------
    const headings = Array.from(root.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((el) => {
      const s = getComputedStyle(el);
      return {
        level: Number(el.tagName.slice(1)),
        text: (el.textContent || "").trim(),
        id: el.id || "",
        fontSize: num(s.fontSize),
        fontWeight: Number(s.fontWeight) || 400,
        fontFamily: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
        textAlign: s.textAlign,
        hasNestedStrong: !!el.querySelector("strong,b"),
      };
    });

    // --- body copy ----------------------------------------------------------
    const firstPara = Array.from(root.querySelectorAll("p")).find(
      (p) => (p.textContent || "").trim().length > 40 && !p.className.includes("note")
    );
    const paragraphStyle = firstPara
      ? (() => {
          const s = getComputedStyle(firstPara);
          return {
            fontSize: num(s.fontSize),
            fontWeight: Number(s.fontWeight) || 400,
            fontFamily: s.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
          };
        })()
      : null;
    const firstLi = root.querySelector("li");
    const listItemStyle = firstLi
      ? (() => {
          const s = getComputedStyle(firstLi);
          return { fontSize: num(s.fontSize), fontFamily: s.fontFamily.split(",")[0].replace(/["']/g, "").trim() };
        })()
      : null;

    // --- links --------------------------------------------------------------
    const origin = location.origin;
    const links = Array.from(doc.querySelectorAll("a[href]"))
      .filter((a) => inArticle(a))
      .map((a) => {
        const el = a as HTMLAnchorElement;
        const href = el.getAttribute("href") || "";
        const s = getComputedStyle(el);
        // Hover underline: read the :hover rule from the stylesheet is unreliable across
        // Tailwind builds, so record the base decoration and let the runner hover-test a sample.
        const raw = el.textContent || "";
        const docsInternal = el.href.startsWith(origin) && new URL(el.href).pathname.startsWith("/docs");
        const inProse = !!el.closest("p, li, td, th, blockquote");
        return {
          text: raw.trim().slice(0, 80),
          href,
          resolved: el.href,
          target: el.getAttribute("target"),
          rel: el.getAttribute("rel"),
          external: !!el.href && !el.href.startsWith(origin) && /^https?:/i.test(el.href),
          docsInternal,
          inProse,
          color: s.color,
          textDecoration: s.textDecorationLine,
          hoverUnderline: false, // filled in by the runner for a sampled subset
          anchorHasEdgeWhitespace: raw.length > 0 && raw !== raw.trim(),
          inArticle: true,
        };
      });

    // --- images -------------------------------------------------------------
    const images = Array.from(doc.querySelectorAll("img")).map((i) => {
      const img = i as HTMLImageElement;
      return {
        src: img.currentSrc || img.src || img.getAttribute("src") || "",
        alt: img.getAttribute("alt") ?? "",
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        clientWidth: img.clientWidth,
        clientHeight: img.clientHeight,
        inArticle: inArticle(img),
      };
    });

    // --- callouts -----------------------------------------------------------
    // add-resource is the class the live docs use; add-res is what the checklist names.
    const calloutSelector = ".note,.tip,.warning,.add-res,.add-resource,[class*='callout'],[class*='admonition']";
    const callouts = Array.from(root.querySelectorAll(calloutSelector)).map((el) => {
      const strong = el.querySelector("strong,b");
      const cs = getComputedStyle(el);
      const toHex = (rgb: string) => {
        const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return m ? "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("") : rgb;
      };
      return {
        className: el.className.toString(),
        label: (strong?.textContent || "").trim(),
        labelBold: !!strong,
        text: (el.textContent || "").trim().slice(0, 400),
        linkCount: el.querySelectorAll("a[href]").length,
        borderLeftColor: toHex(cs.borderLeftColor),
        borderLeftWidth: cs.borderLeftWidth,
      };
    });

    // --- code ---------------------------------------------------------------
    const codeBlocks = Array.from(root.querySelectorAll("pre")).map((pre) => {
      const s = getComputedStyle(pre);
      const codeEl = pre.querySelector("code") || pre;
      // The copy control is not a sibling of <pre>: the redesign nests
      // pre > .cs-code-with-lines > div > div > .notranslate(code card) and hangs the
      // button (aria-label="copy-code-icon") off the card. Walk up a few levels.
      const hasCopyControl = (scope: Element) =>
        !!Array.from(scope.querySelectorAll("button,[role='button'],[class*='copy'],[aria-label*='copy']")).find((b) =>
          /copy/i.test((b.textContent || "") + " " + (b.getAttribute("aria-label") || "") + " " + b.className.toString())
        );
      let copy = false;
      let scope: Element | null = pre;
      for (let depth = 0; depth < 5 && scope; depth++) {
        scope = scope.parentElement;
        if (scope && hasCopyControl(scope)) {
          copy = true;
          break;
        }
      }
      const codeStyle = getComputedStyle(codeEl as Element);
      return {
        text: (codeEl.textContent || "").slice(0, 4000),
        fontSize: num(codeStyle.fontSize),
        fontFamily: codeStyle.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
        color: codeStyle.color,
        backgroundColor: s.backgroundColor,
        textAlign: s.textAlign,
        hasCopyControl: copy,
      };
    });
    const inlineCodeCount = root.querySelectorAll("span.code, code").length;

    // --- tables -------------------------------------------------------------
    const tables = Array.from(root.querySelectorAll("table")).map((t) => {
      const headerCells = Array.from(t.querySelectorAll("th"));
      const boldHeaderCells = headerCells.filter((th) => {
        const w = Number(getComputedStyle(th).fontWeight) || 400;
        return w >= 600 || !!th.querySelector("strong,b");
      });
      return { headerCells: headerCells.length, boldHeaderCells: boldHeaderCells.length, rows: t.querySelectorAll("tr").length };
    });

    // --- breadcrumb ---------------------------------------------------------
    const bcNav = Array.from(doc.querySelectorAll("nav")).find((n) => /^home/i.test((n.textContent || "").trim()));
    const breadcrumb = bcNav
      ? Array.from(bcNav.querySelectorAll("a,span"))
          .map((el) => ({
            text: (el.textContent || "").trim(),
            href: el.getAttribute("href"),
            hasTooltip: !!(el.getAttribute("title") || el.getAttribute("aria-label")),
          }))
          .filter((b) => b.text.length > 0)
      : [];

    // --- right nav ----------------------------------------------------------
    const rnav = Array.from(doc.querySelectorAll("nav,aside")).find((n) => /on this page/i.test((n.textContent || "").slice(0, 200)));
    const rightNav = rnav
      ? Array.from(rnav.querySelectorAll("a[href^='#']")).map((a) => ({
          text: (a.textContent || "").trim(),
          href: a.getAttribute("href") || "",
        }))
      : [];

    const headingIds = Array.from(root.querySelectorAll("[id]")).map((el) => el.id);

    // --- left nav -----------------------------------------------------------
    const path = location.pathname.replace(/\/$/, "");
    const leftNavLinks = Array.from(doc.querySelectorAll("aside a[href], nav a[href]")).filter((a) => {
      const h = (a as HTMLAnchorElement).getAttribute("href") || "";
      return h.startsWith("/docs");
    });
    const current = leftNavLinks.find((a) => ((a as HTMLAnchorElement).getAttribute("href") || "").replace(/\/$/, "") === path);
    const activeMarked = (() => {
      if (!current) return null;
      const aria = current.getAttribute("aria-current");
      if (aria) return `aria-current=${aria}`;
      const cls = current.className.toString();
      if (/active|selected|current/i.test(cls)) return `class:${cls.slice(0, 60)}`;
      // The redesign marks the active entry with a font-weight/colour change instead.
      const w = Number(getComputedStyle(current).fontWeight) || 400;
      const siblings = leftNavLinks.filter((a) => a !== current).slice(0, 8);
      const others = siblings.map((a) => Number(getComputedStyle(a).fontWeight) || 400);
      // The redesign marks the active entry with a coloured LEFT BORDER
      // (border-left: 1px solid #ac75ff) while siblings have 0px. Check that first:
      // weight and colour are identical across entries, so they never differ.
      const curStyle = getComputedStyle(current);
      const borderPx = parseFloat(curStyle.borderLeftWidth) || 0;
      const siblingBorders = siblings.map((a) => parseFloat(getComputedStyle(a).borderLeftWidth) || 0);
      // Majority, not unanimity: an odd sibling can carry a border of its own (hover
      // state, group divider). Requiring EVERY sibling to be border-free made this
      // report "not marked" on pages where the active entry is plainly highlighted.
      const plain = siblingBorders.filter((b) => b < borderPx).length;
      if (borderPx > 0 && siblings.length > 0 && plain >= Math.ceil(siblings.length * 0.6)) {
        return `left border ${curStyle.borderLeftWidth} ${curStyle.borderLeftColor} vs none on siblings`;
      }
      const curBg = curStyle.backgroundColor;
      if (curBg !== "rgba(0, 0, 0, 0)" && siblings.every((a) => getComputedStyle(a).backgroundColor !== curBg)) {
        return `distinct background ${curBg}`;
      }
      const heavier = others.length > 0 && others.every((o) => w > o);
      const distinctColor = (() => {
        const c = getComputedStyle(current).color;
        return siblings.length > 0 && siblings.every((a) => getComputedStyle(a).color !== c);
      })();
      if (heavier) return `font-weight ${w} vs siblings`;
      if (distinctColor) return `distinct colour ${getComputedStyle(current).color}`;
      return null;
    })();

    // --- buttons ------------------------------------------------------------
    const buttons = Array.from(doc.querySelectorAll("button")).map((b) => ({
      name: ((b.textContent || "") + " " + (b.getAttribute("aria-label") || "")).trim().slice(0, 60),
      disabled: (b as HTMLButtonElement).disabled,
      inArticle: inArticle(b),
    }));

    const boldTexts = Array.from(root.querySelectorAll("strong,b")).map((e) => (e.textContent || "").trim()).filter(Boolean);

    const bodyText = doc.body.innerText || "";
    const copyForLlmPresent = /copy for llm/i.test(bodyText);
    const vam = Array.from(doc.querySelectorAll("a")).find((a) => /view as markdown/i.test(a.textContent || ""));

    // "Last updated" is plain text near the article rather than a labelled element, so
    // match the leaf node carrying the phrase.
    const lastUpdatedEl = Array.from(doc.querySelectorAll("p,span,div,time")).find(
      (e) => e.children.length === 0 && /last\s*updated/i.test(e.textContent || "")
    );

    return {
      url: location.href,
      title: doc.title,
      canonical: (doc.querySelector("link[rel=canonical]") as HTMLLinkElement | null)?.href ?? null,
      metaDescription: (doc.querySelector("meta[name=description]") as HTMLMetaElement | null)?.content ?? null,
      h1Count: root.querySelectorAll("h1").length,
      headings,
      paragraphStyle,
      listItemStyle,
      links,
      images,
      callouts,
      codeBlocks,
      inlineCodeCount,
      tables,
      breadcrumb,
      rightNav,
      rightNavPresent: !!rnav,
      headingIds,
      leftNavActive: { present: !!current, activeText: activeMarked },
      buttons,
      articleText: (root.innerText || "").slice(0, 200000),
      articleHtml: (root.innerHTML || "").slice(0, 400000),
      boldTexts,
      copyForLlmPresent,
      viewAsMarkdown: vam ? { href: vam.getAttribute("href"), target: vam.getAttribute("target") } : null,
      lastUpdated: lastUpdatedEl ? (lastUpdatedEl.textContent || "").trim().slice(0, 120) : null,
    };
  }, ARTICLE_ROOT);
}

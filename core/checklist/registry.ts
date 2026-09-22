/**
 * The catalogue of every rule the checklist audit knows about.
 *
 * Every rule in the source checklist and every mechanically-checkable rule in the
 * style guide appears here — including the ones automation cannot judge. Those are
 * marked tier "manual" and always reported as NOT_CHECKED, so the report states its
 * own coverage instead of implying the unlisted rules passed.
 */

import type { CheckDefinition } from "./types";

export const CHECKS: CheckDefinition[] = [
  // ---------------------------------------------------------------- CL 1.0 typography
  {
    id: "CL-1.1",
    source: "checklist",
    reference: "1.0 Font size, style, and alignment",
    title: "Exactly one H1 on the page",
    tier: "deterministic",
    rationale: "A page with zero or multiple H1s breaks the document outline and SEO title mapping.",
  },
  {
    id: "CL-1.2",
    source: "checklist",
    reference: "1.0 Font size, style, and alignment",
    title: "Heading typography matches the checklist's expected values",
    tier: "deterministic",
    rationale: "Checklist pins H1 30px/bold/left, H2 24px/bold/left, H3 21px/bold/left.",
  },
  {
    id: "CL-1.3",
    source: "checklist",
    reference: "1.0 Font size, style, and alignment",
    title: "No <strong>/<b> tag applied inside a heading",
    tier: "deterministic",
    rationale: "Headings are already bold; a nested strong tag doubles the weight and pollutes the markup.",
  },
  {
    id: "CL-1.4",
    source: "checklist",
    reference: "1.0 Font size, style, and alignment",
    title: "Body copy typography matches the checklist's expected values",
    tier: "deterministic",
    rationale: "Checklist pins paragraphs and list items to 18px regular Arial/sans-serif.",
  },
  {
    id: "CL-1.5",
    source: "checklist",
    reference: "1.0 Font size, style, and alignment",
    title: "Code block typography matches the checklist's expected values",
    tier: "deterministic",
    rationale: "Checklist pins code to 14px monospace, colour #d66960, left aligned, background shaded.",
  },
  {
    id: "CL-1.6",
    source: "checklist",
    reference: "1.0 Font size, style, and alignment",
    title: "Table headings are bold",
    tier: "deterministic",
    rationale: "A table whose header row is not bold reads as a data row.",
  },

  // ---------------------------------------------------------------- CL 2.0 breadcrumbs
  {
    id: "CL-2.1",
    source: "checklist",
    reference: "2.0 Breadcrumbs and its tooltip",
    title: "Breadcrumb trail is present and every link resolves",
    tier: "deterministic",
    rationale: "A breadcrumb pointing at a 404 strands the reader one level up from where they are.",
  },
  // CL-2.2 intentionally not registered - removed from the checklist sheet (2026-09-03).

  // ---------------------------------------------------------------- CL 3.0 buttons
  {
    id: "CL-3.1",
    source: "checklist",
    reference: "3.0 Buttons",
    title: "In-page buttons are enabled and have an accessible name",
    tier: "deterministic",
    rationale: "A nameless or permanently disabled control on a doc page is dead UI.",
  },

  // ---------------------------------------------------------------- CL 4.0 images
  {
    id: "CL-4.1",
    source: "checklist",
    reference: "4.0 Image",
    title: "No broken images",
    tier: "deterministic",
    rationale: "Covers both a failed request and a 200 response that renders at zero width.",
  },
  {
    id: "CL-4.2",
    source: "checklist",
    reference: "4.0 Image",
    title: "Every content image has alt text",
    tier: "deterministic",
    rationale: "Alt text is required for screen readers and is a checklist item in its own right.",
  },
  {
    id: "CL-4.3",
    source: "checklist",
    reference: "4.0 Image",
    title: "No placeholder image markers left in the page (//SS etc.)",
    tier: "heuristic",
    rationale: "Writers leave //SS markers where a screenshot still has to be taken.",
  },
  {
    id: "CL-4.4",
    source: "checklist",
    reference: "4.0 Image",
    title: "Images are not upscaled beyond their intrinsic size",
    tier: "heuristic",
    rationale: "Displaying an image wider than its natural width is the usual cause of a blurry screenshot.",
  },
  {
    id: "CL-4.5",
    source: "checklist",
    reference: "4.0 Image",
    title: "Screenshot matches the current app UI, is unblurred, and masks private data",
    tier: "manual",
    rationale: "Requires comparing the image against the live product and reading its pixels — needs a human or a vision model.",
  },

  // ---------------------------------------------------------------- CL 5.0 links
  {
    id: "CL-5.1",
    source: "checklist",
    reference: "5.0 Links",
    title: "No link returns a broken status",
    tier: "deterministic",
    rationale: "404s in a doc are the highest-signal, lowest-argument finding there is.",
  },
  {
    id: "CL-5.2",
    source: "checklist",
    reference: "5.0 Links",
    title: "Internal doc links open in the same tab",
    tier: "deterministic",
    rationale: "Checklist rule: only third-party links get target=_blank.",
  },
  {
    id: "CL-5.3",
    source: "checklist",
    reference: "5.0 Links",
    title: "Third-party links open in a new tab and use https",
    tier: "deterministic",
    rationale: "Sending the reader off-site in the same tab loses their place; http links are insecure.",
  },
  {
    id: "CL-5.4",
    source: "checklist",
    reference: "5.0 Links",
    title: "Links are underlined at rest and change colour on hover",
    tier: "deterministic",
    rationale: "Checklist 5.0 as revised 2026-09-02: links are underlined, and blue on hover.",
  },
  {
    id: "CL-5.5",
    source: "checklist",
    reference: "5.0 Links",
    title: "Link underline does not extend past the anchor text",
    tier: "heuristic",
    rationale: "A leading/trailing space inside the anchor drags the underline beyond the words.",
  },

  // ---------------------------------------------------------------- CL 6.0 callouts
  {
    id: "CL-6.1",
    source: "checklist",
    reference: "6.0 Note/Tip/Warning/Additional Resources",
    title: "Callouts use the approved class names",
    tier: "deterministic",
    rationale: "Only note, tip, warning and add-res are styled; anything else renders as plain text.",
  },
  {
    id: "CL-6.2",
    source: "checklist",
    reference: "6.0 Note/Tip/Warning/Additional Resources",
    title: "Callout label is bold and matches its class",
    tier: "deterministic",
    rationale: "A 'Note' box whose label says 'Tip' misleads; the label must also be bold.",
  },
  {
    id: "CL-6.3",
    source: "checklist",
    reference: "6.0 Note/Tip/Warning/Additional Resources",
    title: "Additional Resources callouts contain at least one link",
    tier: "deterministic",
    rationale: "An Additional Resources box with no link has nothing to offer.",
  },
  {
    id: "CL-6.4",
    source: "checklist",
    reference: "6.0 Note/Tip/Warning/Additional Resources",
    title: "Deletion/restore content carries a Warning callout",
    tier: "heuristic",
    rationale: "Checklist makes a Warning mandatory whenever the page documents destructive actions.",
  },

  {
    id: "CL-6.5",
    source: "checklist",
    reference: "6.0 Note/Tip/Warning/Additional Resources",
    title: "Callout left-border colour matches its type",
    tier: "deterministic",
    rationale: "Column C pins a colour per type: note #899cfa, tip #b0f7ba, warning #f35f61, additional resource #ac75ff.",
  },

  // ---------------------------------------------------------------- CL 7.0 / 8.0 / 9.0
  {
    id: "CL-7.1",
    source: "checklist",
    reference: "7.0 Count/size",
    title: "Counts and sizes are bold",
    tier: "heuristic",
    rationale: "Limits must be scannable; the checklist and the style guide both require the number to stand out.",
  },
  {
    id: "CL-8.1",
    source: "checklist",
    reference: "8.0 Code tags",
    title: "Code-like tokens in prose are wrapped in a code span",
    tier: "heuristic",
    rationale: "Method names, params, filenames and URLs must render as code, not as prose.",
  },
  {
    id: "CL-9.1",
    source: "checklist",
    reference: "9.0 Use bold for screen texts",
    title: "UI labels quoted in instructions are bold",
    tier: "heuristic",
    rationale: "Checklist requires on-screen text (buttons, modal titles) to be bold so steps are scannable.",
  },

  // ---------------------------------------------------------------- CL 10.0 title/SEO
  {
    id: "CL-10.1",
    source: "checklist",
    reference: "10.0 Title, URL, and SEO name",
    title: "SEO title ends with ' | Contentstack'",
    tier: "deterministic",
    rationale: "Checklist requires the trailing brand suffix on every page.",
  },
  {
    id: "CL-10.2",
    source: "checklist",
    reference: "10.0 Title, URL, and SEO name",
    title: "Page title, H1 and URL slug agree",
    tier: "deterministic",
    rationale: "Checklist requires all three to be the same; drift between them breaks search and navigation.",
  },
  {
    id: "CL-10.3",
    source: "checklist",
    reference: "10.0 Title, URL, and SEO name",
    title: "Canonical URL matches the audited URL",
    tier: "deterministic",
    rationale: "A canonical pointing elsewhere de-indexes the page it sits on.",
  },

  // ---------------------------------------------------------------- CL 11.0 / 12.0 nav
  {
    id: "CL-11.1",
    source: "checklist",
    reference: "11.0 Right navigation bar",
    title: "Right nav exists and every entry resolves to a heading on the page",
    tier: "deterministic",
    rationale: "An 'On this page' anchor with no matching id scrolls nowhere.",
  },
  {
    id: "CL-11.2",
    source: "checklist",
    reference: "11.0 Right navigation bar",
    title: "Right nav highlights the section in view while scrolling",
    tier: "deterministic",
    rationale: "Checklist requires the scroll-spy highlight, not just the anchor links.",
  },
  {
    id: "CL-12.1",
    source: "checklist",
    reference: "12.0 Left navigation bar",
    title: "Left nav marks the current page as selected",
    tier: "deterministic",
    rationale: "Readers orient themselves by the highlighted entry in the section tree.",
  },

  // ---------------------------------------------------------------- CL 13.0 content
  {
    id: "CL-13.1",
    source: "checklist",
    reference: "13.0 Content/Technical part",
    title: "Documented steps execute against the live product",
    tier: "manual",
    rationale: "Covered by this repo's flow runs, not by the page audit — reported here so the checklist row is accounted for.",
  },

  // ---------------------------------------------------------------- CL 15.0 code
  {
    id: "CL-15.1",
    source: "checklist",
    reference: "15.0 Code snippets",
    title: "Every code block has a working copy control",
    tier: "deterministic",
    rationale: "Checklist requires the copy icon to be present and functional.",
  },
  {
    id: "CL-15.2",
    source: "checklist",
    reference: "15.0 Code snippets",
    title: "Quote style is consistent within a code block",
    tier: "heuristic",
    rationale: "Mixing ' and \" inside one snippet is the checklist's named example of sloppy code.",
  },
  {
    id: "CL-15.3",
    source: "checklist",
    reference: "15.0 Code snippets",
    title: "Code blocks are balanced (brackets, braces, quotes)",
    tier: "heuristic",
    rationale: "Catches truncated or mis-pasted snippets without executing them.",
  },

  // ---------------------------------------------------------------- CL 16-19 (page level)
  {
    id: "CL-16.1",
    source: "checklist",
    reference: "16.0 Responsive design",
    title: "No horizontal overflow at mobile, tablet and desktop widths",
    tier: "deterministic",
    rationale: "Sideways scroll on mobile is the most common responsive defect on doc pages.",
  },
  {
    id: "CL-17.1",
    source: "checklist",
    reference: "17.0 Security testing",
    title: "No live credentials or tokens in the page text",
    tier: "deterministic",
    rationale: "Scans prose and code for API keys, delivery/management tokens, JWTs and cloud keys.",
  },
  {
    id: "CL-17.2",
    source: "checklist",
    reference: "17.0 Security testing",
    title: "No unmasked sensitive data inside screenshots",
    tier: "manual",
    rationale: "Requires reading text out of image pixels — needs a vision model or a human.",
  },
  // CL-18.1 intentionally not registered - excluded at the user's request (2026-09-03).
  {
    id: "CL-19.1",
    source: "checklist",
    reference: "19.0 Performance testing",
    title: "Page load stays inside the checklist's 4 second budget",
    tier: "deterministic",
    rationale: "Measured from Navigation Timing on this run; Lighthouse scoring stays a separate job.",
  },
  {
    id: "CL-19.2",
    source: "checklist",
    reference: "19.0 Performance testing",
    title: "No JavaScript console errors on load",
    tier: "deterministic",
    rationale: "Checklist requires a clean console alongside the performance numbers.",
  },

  // ---------------------------------------------------------------- CL final row
  {
    id: "CL-22.1",
    source: "checklist",
    reference: "Final row — Copy for LLM / View as Markdown",
    title: "Copy for LLM control is present and confirms the copy",
    tier: "deterministic",
    rationale: "Checklist requires the button to show 'Copied' after the click.",
  },
  {
    id: "CL-22.2",
    source: "checklist",
    reference: "Final row — Copy for LLM / View as Markdown",
    title: "View as Markdown opens the same URL with a .md suffix in a new tab",
    tier: "deterministic",
    rationale: "Checklist names the exact expected behaviour of the link.",
  },

  // ---------------------------------------------------------------- Style guide
  {
    id: "CL-22.3",
    source: "checklist",
    reference: "Final row - Copy for LLM / View as Markdown",
    title: "A 'Last updated' stamp is present on the page",
    tier: "deterministic",
    rationale: "Added to the checklist 2026-09-02: the reader needs to know how current the page is.",
  },

  {
    id: "SG-HEAD-CASE",
    source: "style-guide",
    reference: "Spelling and Capitalization / Writing Clear Titles and Headings",
    title: "H1 and H2 in Title Case, H3 and below in sentence case",
    tier: "heuristic",
    rationale: "Style guide states the split explicitly and explains why lower headings are sentence case.",
  },
  {
    id: "SG-TITLE-LEN",
    source: "style-guide",
    reference: "Writing Clear Titles and Headings",
    title: "Page title is 60 characters or fewer",
    tier: "deterministic",
    rationale: "Style guide caps titles at 60 characters.",
  },
  {
    id: "SG-VAGUE-TITLE",
    source: "style-guide",
    reference: "Writing Clear Titles and Headings",
    title: "Title avoids vague openers such as 'Understanding' or 'Guide to'",
    tier: "heuristic",
    rationale: "Named anti-pattern in the style guide.",
  },
  {
    id: "SG-PASSIVE",
    source: "style-guide",
    reference: "General Grammar Rules / Active vs. Passive Voice",
    title: "Prose prefers active voice",
    tier: "heuristic",
    rationale: "Passive constructions obscure who acts; the guide allows them only when the actor is irrelevant.",
  },
  {
    id: "SG-GENDER",
    source: "style-guide",
    reference: "General Grammar Rules / Gender-Neutral Language",
    title: "No gendered pronouns or gendered role nouns",
    tier: "heuristic",
    rationale: "Guide requires singular they and neutral role names.",
  },
  {
    id: "SG-NAV-PREP",
    source: "style-guide",
    reference: "General Grammar Rules / 'On' or 'In' left navigation panel",
    title: "Uses 'in the left navigation panel', never 'on'",
    tier: "deterministic",
    rationale: "The guide singles this phrasing out as a standing correction.",
  },
  {
    id: "SG-PLEASE",
    source: "style-guide",
    reference: "Voice and Tone",
    title: "Instructions avoid 'please'",
    tier: "deterministic",
    rationale: "Guide: be polite through clarity, not through 'please'.",
  },
  {
    id: "SG-WILL",
    source: "style-guide",
    reference: "Voice and Tone",
    title: "Instructions use present tense, not 'will'",
    tier: "heuristic",
    rationale: "Guide: 'The system displays a message', not 'will display'.",
  },
  {
    id: "SG-TERMS",
    source: "style-guide",
    reference: "Writing Guidelines / Common terms in docs",
    title: "Preferred Contentstack spellings are used",
    tier: "deterministic",
    rationale: "email not e-mail, plugin not plug-in, dropdown, checkbox, frontend, CMSs, one-word Contentstack.",
  },
  {
    id: "SG-SYMBOLS",
    source: "style-guide",
    reference: "Spelling and Capitalization / Writing Guidelines",
    title: "No '+' for 'more than' and no 'X' for 'times'",
    tier: "deterministic",
    rationale: "Both are called out as banned shorthand.",
  },
  {
    id: "SG-US-SPELLING",
    source: "style-guide",
    reference: "Spelling and Capitalization / Preferred Spelling",
    title: "American English spelling throughout",
    tier: "heuristic",
    rationale: "Guide names Merriam-Webster as the authority; British variants are findings.",
  },
  {
    id: "SG-IDIOM",
    source: "style-guide",
    reference: "Avoiding Jargon and Idioms",
    title: "No idioms or untranslatable jargon",
    tier: "heuristic",
    rationale: "Guide lists 'out of the box', 'move the needle', 'boil the ocean' among others.",
  },
  {
    id: "SG-ELLIPSIS",
    source: "style-guide",
    reference: "Writing Guidelines / Horizontal or Vertical Ellipsis",
    title: "Refers to the ellipsis icon by orientation, not 'three dots'",
    tier: "deterministic",
    rationale: "Guide requires the precise UI term.",
  },
  {
    id: "SG-AI-TONE",
    source: "style-guide",
    reference: "Responsible Use of AI-Generated Content",
    title: "No AI-tell phrasing ('effortlessly', 'powerful tool', 'seamlessly')",
    tier: "heuristic",
    rationale: "Guide names generic enthusiasm as the signal that AI text was pasted in unedited.",
  },
  {
    id: "SG-STRUCTURE",
    source: "style-guide",
    reference: "Structuring Technical Documentation / Creating a Documentation Plan",
    title: "Page states the why/when, not only the how",
    tier: "heuristic",
    rationale: "v1.0.3 added the requirement for a use-case or 'When to Use This' framing.",
  },
  {
    id: "SG-QUOTES",
    source: "style-guide",
    reference: "Punctuation Guidelines / Quotation Marks and Nested Quotes",
    title: "Prose uses smart quotes; straight quotes only in code",
    tier: "deterministic",
    rationale: "The guide requires smart quotes (\u201c \u201d) throughout documentation content, reserving straight quotes for code blocks, inline code and command-line samples.",
  },
  {
    id: "SG-SPLICE",
    source: "style-guide",
    reference: "General Grammar Rules",
    title: "No comma splices joining two independent clauses",
    tier: "heuristic",
    rationale: "A comma joining two full clauses forces the reader to re-parse the sentence; the guide's clarity principle calls for a period, semicolon or conjunction.",
  },

  {
    id: "SG-VOICE-TONE",
    source: "style-guide",
    reference: "Brand Voice and Tone",
    title: "Voice is professional, friendly and audience-appropriate",
    tier: "manual",
    rationale: "A judgement about register across a whole page — a language model or an editor decides this, not a regex.",
  },
];

export const CHECK_BY_ID = new Map(CHECKS.map((c) => [c.id, c]));

/** Rules the audit deliberately does not attempt — surfaced in the report. */
export const MANUAL_CHECKS = CHECKS.filter((c) => c.tier === "manual");

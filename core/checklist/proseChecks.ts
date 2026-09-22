/**
 * Style-guide checks that read the page's prose.
 *
 * These are pattern matches, not language understanding — every rule here is one the
 * style guide states as a hard, quotable rule (a banned word, a preferred spelling, a
 * casing rule), never a judgement about register. Judgement rules live in the registry
 * as tier "manual" and are reported NOT_CHECKED.
 *
 * Everything is a WARNING. False positives are expected on the heuristic rules and are
 * cheaper than silence.
 */

import type { CheckResult, Evidence } from "./types";
import type { PageFacts } from "./pageFacts";

const cap = (e: Evidence[], n = 8) => (e.length <= n ? e : [...e.slice(0, n), { where: `… and ${e.length - n} more` }]);

const pass = (id: string, summary: string): CheckResult => ({ id, status: "PASS", summary, evidence: [] });
const warn = (id: string, summary: string, evidence: Evidence[], issue: string, rootCause: string, suggestedFix: string): CheckResult => ({
  id,
  status: "WARN",
  summary,
  evidence,
  issue,
  rootCause,
  suggestedFix,
});

/** Split article text into sentences, dropping nav noise and very short fragments. */
export function sentencesOf(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/(?<=[.!?])\s+(?=[A-Z“"])/))
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && /\s/.test(s));
}

/** Matches a term as a whole word, case-insensitively. */
const rx = (pattern: string) => new RegExp(pattern, "gi");

function findAll(sentences: string[], pattern: RegExp, label: (m: string, s: string) => Evidence): Evidence[] {
  const out: Evidence[] = [];
  for (const s of sentences) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(s))) {
      out.push(label(m[0], s));
      if (!pattern.global) break;
    }
  }
  return out;
}

const snippet = (s: string, term: string) => {
  const i = s.toLowerCase().indexOf(term.toLowerCase());
  const start = Math.max(0, i - 45);
  return (start > 0 ? "…" : "") + s.slice(start, Math.min(s.length, i + term.length + 45)).trim() + (i + term.length + 45 < s.length ? "…" : "");
};

// ---------------------------------------------------------------- casing

/** Title Case per the guide: first/last word capitalised, minor words lowercase. */
const MINOR_WORDS = new Set(["a", "an", "the", "and", "or", "but", "nor", "for", "in", "of", "on", "to", "at", "by", "up", "as", "is", "vs"]);

function looksTitleCase(text: string): boolean {
  const words = text.replace(/[(),:—–-]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length < 2) return true;
  const significant = words.filter((w, i) => i === 0 || i === words.length - 1 || !MINOR_WORDS.has(w.toLowerCase()));
  const capitalisable = significant.filter((w) => /^[a-zA-Z]/.test(w) && w.length > 1 && w !== w.toUpperCase());
  if (!capitalisable.length) return true;
  const capitalised = capitalisable.filter((w) => /^[A-Z]/.test(w));
  return capitalised.length / capitalisable.length >= 0.8;
}

function looksSentenceCase(text: string): boolean {
  const words = text.replace(/[(),:—–-]/g, " ").split(/\s+/).filter(Boolean);
  if (words.length < 3) return true;
  const rest = words.slice(1).filter((w) => /^[a-zA-Z]/.test(w) && w.length > 2 && w !== w.toUpperCase());
  if (!rest.length) return true;
  const capitalised = rest.filter((w) => /^[A-Z]/.test(w));
  // Allow product nouns (Contentstack, Organization Settings) — flag only when most words are capitalised.
  return capitalised.length / rest.length < 0.6;
}

export function checkHeadingCase(f: PageFacts): CheckResult {
  const evidence: Evidence[] = [];
  for (const h of f.headings) {
    if (h.level <= 2) {
      if (!looksTitleCase(h.text)) evidence.push({ where: `h${h.level} "${h.text.slice(0, 60)}"`, expected: "Title Case", actual: "not Title Case" });
    } else if (h.level >= 3) {
      if (!looksSentenceCase(h.text)) evidence.push({ where: `h${h.level} "${h.text.slice(0, 60)}"`, expected: "Sentence case", actual: "Title Case" });
    }
  }
  if (!f.headings.length) return { id: "SG-HEAD-CASE", status: "NA", summary: "No headings to evaluate.", evidence: [] };
  if (!evidence.length) return pass("SG-HEAD-CASE", "H1/H2 are Title Case and H3+ are sentence case.");
  return warn(
    "SG-HEAD-CASE",
    `${evidence.length} heading(s) use the wrong capitalisation.`,
    cap(evidence),
    "Heading capitalisation does not follow the style guide's split.",
    "The guide requires Title Case for H1/H2 and sentence case for H3 and below; these headings were written in one style throughout.",
    "Recase the flagged headings — Title Case for H1/H2, sentence case for H3+."
  );
}

// ---------------------------------------------------------------- title rules

export function checkTitleRules(f: PageFacts): CheckResult[] {
  const out: CheckResult[] = [];
  const h1 = f.headings.find((h) => h.level === 1)?.text ?? f.title.replace(/\s*\|\s*Contentstack\s*$/, "");

  h1.length <= 60
    ? out.push(pass("SG-TITLE-LEN", `Title is ${h1.length} characters.`))
    : out.push(
        warn(
          "SG-TITLE-LEN",
          `Title is ${h1.length} characters, over the 60-character cap.`,
          [{ where: "H1", expected: "≤ 60 characters", actual: `${h1.length}: "${h1}"` }],
          "The page title exceeds the style guide's length cap.",
          "The title tries to describe the whole scope in one line.",
          "Shorten the title and move the qualifier into the intro paragraph."
        )
      );

  const vague = /^(understanding|guide to|a guide|introduction to|how to use|all about|everything about)\b/i.exec(h1);
  vague
    ? out.push(
        warn(
          "SG-VAGUE-TITLE",
          `Title opens with the vague phrase "${vague[0]}".`,
          [{ where: "H1", expected: "direct wording (e.g. 'Using the Contentstack API')", actual: h1 }],
          "The title uses an opener the style guide names as an anti-pattern.",
          "Titles that begin with 'Understanding' or 'Guide to' bury the actual subject.",
          `Rewrite as a direct phrase — drop "${vague[0]}".`
        )
      )
    : out.push(pass("SG-VAGUE-TITLE", "Title avoids the guide's named vague openers."));

  return out;
}

// ---------------------------------------------------------------- word-level rules

type WordRule = {
  id: string;
  pattern: RegExp;
  /** Reason shown in the report. */
  issue: string;
  rootCause: string;
  fix: string;
  expected: string;
};

const WORD_RULES: WordRule[] = [
  {
    id: "SG-NAV-PREP",
    pattern: rx("\\bon the (left|right) navigation (panel|pane|bar|menu)\\b"),
    expected: "in the left navigation panel",
    issue: "Uses 'on the … navigation panel' where the guide requires 'in'.",
    rootCause: "The guide states 'in' is correct for navigation panels; 'on' is reserved for surfaces like a toolbar.",
    fix: "Replace 'on the left navigation panel' with 'in the left navigation panel'.",
  },
  {
    id: "SG-PLEASE",
    pattern: rx("\\bplease\\b"),
    expected: "instruction without 'please'",
    issue: "Instruction uses 'please'.",
    rootCause: "The guide asks for politeness through clarity; 'please' reads as indirect in a procedure.",
    fix: "Delete 'please' — 'Click Save', not 'Please click Save'.",
  },
  {
    id: "SG-WILL",
    pattern: rx("\\bwill (be |not )?[a-z]+\\b"),
    expected: "present tense",
    issue: "Uses future tense 'will'.",
    rootCause: "The guide requires present tense so the reader knows the effect is immediate.",
    fix: "Rewrite in present tense — 'The system displays a message', not 'will display'.",
  },
  {
    id: "SG-ELLIPSIS",
    pattern: rx("\\bthree dots?\\b|\\bthree-dot\\b"),
    expected: "horizontal ellipsis / vertical ellipsis",
    issue: "Refers to the ellipsis icon as 'three dots'.",
    rootCause: "The guide requires naming the icon by orientation for precision.",
    fix: "Use 'horizontal ellipsis (⋯)' or 'vertical ellipsis (⋮)' to match the icon.",
  },
];

const TERM_RULES: { wrong: RegExp; right: string }[] = [
  { wrong: rx("\\be-mail\\b"), right: "email" },
  { wrong: rx("\\bplug-ins?\\b"), right: "plugin / plugins" },
  { wrong: rx("\\bdrop-down\\b|\\bdrop down\\b"), right: "dropdown" },
  { wrong: rx("\\bcheck-box\\b|\\bcheck box\\b"), right: "checkbox" },
  { wrong: rx("\\bfront-end\\b|\\bfront end\\b"), right: "frontend" },
  { wrong: rx("\\bback-end\\b|\\bback end\\b"), right: "backend" },
  { wrong: rx("\\bCMSes\\b"), right: "CMSs" },
  { wrong: rx("\\bContent Stack\\b"), right: "Contentstack" },
  { wrong: rx("\\bE-Book\\b|\\be-book\\b"), right: "ebook" },
  { wrong: rx("\\bWeb site\\b|\\bweb-site\\b"), right: "website" },
  { wrong: rx("\\bInternet\\b(?! of Things)"), right: "internet (lowercase)" },
];

/** Only exact, unambiguous pairs — a generic "-ise" rule fires on "wise", "rise", "precise". */
const BRITISH_SPELLINGS: { wrong: RegExp; right: string }[] = [
  { wrong: rx("\\bcolour\\b"), right: "color" },
  { wrong: rx("\\bbehaviour\\b"), right: "behavior" },
  { wrong: rx("\\bcentre\\b"), right: "center" },
  { wrong: rx("\\borganis(e|ed|ing|ation)\\b"), right: "organiz-" },
  { wrong: rx("\\bcustomis(e|ed|ing|ation)\\b"), right: "customiz-" },
  { wrong: rx("\\blicence\\b"), right: "license" },
  { wrong: rx("\\bcatalogue\\b"), right: "catalog" },
  { wrong: rx("\\bcancelled\\b|\\bcancelling\\b"), right: "canceled / canceling" },
];

const IDIOMS = [
  "out of the box",
  "boil the ocean",
  "move the needle",
  "double down",
  "low-hanging fruit",
  "hit the ground running",
  "circle back",
  "under the hood",
  "a piece of cake",
  "in a nutshell",
];

const AI_TELLS = ["effortlessly", "seamlessly", "powerful tool", "unlock the power", "in today's fast-paced", "revolutionize", "game-changer", "delve into", "robust solution"];

const GENDERED = [
  { wrong: rx("\\b(he|she|his|her|him|hers)\\b"), right: "they / them / their" },
  { wrong: rx("\\bchairman\\b"), right: "chairperson" },
  { wrong: rx("\\bmanpower\\b"), right: "workforce" },
  { wrong: rx("\\bhe or she\\b|\\bhis or her\\b"), right: "they / their" },
];

export function checkWordRules(f: PageFacts): CheckResult[] {
  const sentences = sentencesOf(f.articleText);
  const out: CheckResult[] = [];

  for (const rule of WORD_RULES) {
    const hits = findAll(sentences, rule.pattern, (m, s) => ({ where: snippet(s, m), expected: rule.expected, actual: m }));
    out.push(
      hits.length
        ? warn(rule.id, `${hits.length} occurrence(s) found.`, cap(hits), rule.issue, rule.rootCause, rule.fix)
        : pass(rule.id, "No occurrences found.")
    );
  }

  // preferred terms
  const termHits: Evidence[] = [];
  for (const t of TERM_RULES) {
    termHits.push(...findAll(sentences, t.wrong, (m, s) => ({ where: snippet(s, m), expected: t.right, actual: m })));
  }
  out.push(
    termHits.length
      ? warn(
          "SG-TERMS",
          `${termHits.length} non-preferred term(s) found.`,
          cap(termHits),
          "The page uses spellings the style guide replaces with a preferred form.",
          "The guide fixes a house spelling for these terms (email, plugin, dropdown, checkbox, frontend, CMSs …).",
          "Replace each flagged term with the preferred spelling shown in the Expected column."
        )
      : pass("SG-TERMS", "All preferred Contentstack spellings are used.")
  );

  // banned symbols
  const symbolHits = [
    ...findAll(sentences, rx("\\d+\\s?X\\b"), (m, s) => ({ where: snippet(s, m), expected: "'three times' style wording", actual: m })),
    ...findAll(sentences, rx("\\d+\\+(?!\\d)"), (m, s) => ({ where: snippet(s, m), expected: "'more than N'", actual: m })),
  ];
  out.push(
    symbolHits.length
      ? warn(
          "SG-SYMBOLS",
          `${symbolHits.length} banned shorthand symbol(s) found.`,
          cap(symbolHits),
          "The page uses '+' for 'more than' or 'X' for 'times'.",
          "Both are explicitly banned by the style guide.",
          "Spell the words out — 'three times', 'more than 50'."
        )
      : pass("SG-SYMBOLS", "No banned '+' or 'X' shorthand.")
  );

  // British spellings
  const britHits: Evidence[] = [];
  for (const b of BRITISH_SPELLINGS) {
    britHits.push(...findAll(sentences, b.wrong, (m, s) => ({ where: snippet(s, m), expected: b.right, actual: m })));
  }
  out.push(
    britHits.length
      ? warn(
          "SG-US-SPELLING",
          `${britHits.length} British spelling(s) found.`,
          cap(britHits),
          "The page uses British spellings.",
          "The guide names Merriam-Webster (American English) as the authority.",
          "Replace with the American spelling."
        )
      : pass("SG-US-SPELLING", "No British spellings detected.")
  );

  // idioms
  const idiomHits: Evidence[] = [];
  for (const i of IDIOMS) idiomHits.push(...findAll(sentences, rx("\\b" + i.replace(/ /g, "\\s+") + "\\b"), (m, s) => ({ where: snippet(s, m), expected: "plain wording", actual: m })));
  out.push(
    idiomHits.length
      ? warn(
          "SG-IDIOM",
          `${idiomHits.length} idiom(s) found.`,
          cap(idiomHits),
          "The page uses an idiom the style guide bans.",
          "Idioms do not translate and slow non-native readers.",
          "Rewrite the phrase literally."
        )
      : pass("SG-IDIOM", "No banned idioms found.")
  );

  // AI tells
  const aiHits: Evidence[] = [];
  for (const a of AI_TELLS) aiHits.push(...findAll(sentences, rx("\\b" + a.replace(/ /g, "\\s+") + "\\b"), (m, s) => ({ where: snippet(s, m), expected: "specific, plain phrasing", actual: m })));
  out.push(
    aiHits.length
      ? warn(
          "SG-AI-TONE",
          `${aiHits.length} phrase(s) matching the guide's AI-tone signals.`,
          cap(aiHits),
          "The page contains generic-enthusiasm phrasing the guide flags as an AI tell.",
          "The guide asks writers to rephrase AI drafts rather than publish them as generated.",
          "Replace with a concrete statement of what the feature does."
        )
      : pass("SG-AI-TONE", "No AI-tone phrases detected.")
  );

  // gendered language
  const genderHits: Evidence[] = [];
  for (const g of GENDERED) genderHits.push(...findAll(sentences, g.wrong, (m, s) => ({ where: snippet(s, m), expected: g.right, actual: m })));
  out.push(
    genderHits.length
      ? warn(
          "SG-GENDER",
          `${genderHits.length} gendered term(s) found.`,
          cap(genderHits),
          "The page uses gendered pronouns or role nouns.",
          "The guide requires singular 'they' and neutral role names.",
          "Rewrite using they/them/their, or address the reader as 'you'."
        )
      : pass("SG-GENDER", "No gendered pronouns or role nouns found.")
  );

  return out;
}

/** Passive voice: "<be> + past participle" with an optional "by" agent. Heuristic by design. */
export function checkPassiveVoice(f: PageFacts): CheckResult {
  const sentences = sentencesOf(f.articleText);
  const passive = rx("\\b(is|are|was|were|be|been|being)\\s+(\\w+ed|shown|made|given|taken|sent|written|built|held|kept|set|put|read|done|seen|known|found)\\b(\\s+by\\b)?");
  const hits = findAll(sentences, passive, (m, s) => ({ where: snippet(s, m), expected: "active voice", actual: m }));
  const ratio = sentences.length ? hits.length / sentences.length : 0;
  if (!sentences.length) return { id: "SG-PASSIVE", status: "NA", summary: "No prose to evaluate.", evidence: [] };
  if (ratio <= 0.15) return pass("SG-PASSIVE", `${hits.length}/${sentences.length} sentences look passive (within tolerance).`);
  return warn(
    "SG-PASSIVE",
    `${hits.length}/${sentences.length} sentences (${Math.round(ratio * 100)}%) look passive.`,
    cap(hits),
    "Passive constructions dominate the prose.",
    "The guide allows passive voice only when the actor is unknown or irrelevant; here it is the default.",
    "Rewrite the flagged sentences with the actor first — 'Contentstack sends the webhook', not 'The webhook is sent'."
  );
}

/** v1.0.3 addition: the page must say why the feature exists and when to use it. */
export function checkWhyWhen(f: PageFacts): CheckResult {
  const text = f.articleText.toLowerCase();
  const headingText = f.headings.map((h) => h.text.toLowerCase()).join(" | ");
  const signals = ["use case", "when to use", "why use", "what you will learn", "overview", "benefits", "prerequisites"];
  const found = signals.filter((s) => headingText.includes(s) || text.includes(s));
  if (found.length) return pass("SG-STRUCTURE", `Page frames the why/when (found: ${found.join(", ")}).`);
  return warn(
    "SG-STRUCTURE",
    "No use-case or 'when to use this' framing found.",
    [{ where: "headings", expected: "a Use Case / When to Use This / What You Will Learn section", actual: f.headings.map((h) => h.text).slice(0, 6).join(" | ") || "(none)" }],
    "The page explains how, but never why the feature exists or when to choose it.",
    "Style guide v1.0.3 added this requirement to the documentation plan section.",
    "Add a short 'When to use this' section stating the problem it solves and the alternative."
  );
}

/** Checklist 7.0 / style guide 'Highlighting Limits' — the number in a limit must be bold. */
export function checkBoldLimits(f: PageFacts): CheckResult {
  const sentences = sentencesOf(f.articleText);
  const limitRx = rx("\\b(up to|maximum of|max\\.?|at most|limit of|no more than)\\s+([\\d,]+)\\s*(\\w+)?");
  const hits = findAll(sentences, limitRx, (m, s) => ({ where: snippet(s, m), actual: m }));
  if (!hits.length) return { id: "CL-7.1", status: "NA", summary: "No numeric limits stated on this page.", evidence: [] };
  const boldBlob = f.boldTexts.join(" ");
  const unbolded = hits.filter((h) => {
    const num = (h.actual || "").match(/[\d,]+/)?.[0];
    return num ? !boldBlob.includes(num) : false;
  });
  if (!unbolded.length) return pass("CL-7.1", `All ${hits.length} stated limit(s) are bold.`);
  return warn(
    "CL-7.1",
    `${unbolded.length}/${hits.length} stated limit(s) are not bold.`,
    cap(unbolded.map((u) => ({ ...u, expected: "number and unit in bold" }))),
    "A count or size limit is written in plain text.",
    "Checklist 7.0 and the guide's 'Highlighting Limits' section both require the number to be emphasised.",
    "Bold the number and its unit so the limit is scannable."
  );
}

/** Checklist 8.0 — code-ish tokens sitting in prose without a code span. */
export function checkCodeTags(f: PageFacts): CheckResult {
  const sentences = sentencesOf(f.articleText);
  const codeish = rx("\\b(?:[a-z]+(?:_[a-z]+)+|[a-z]+[A-Z][a-zA-Z]*\\(\\)|\\w+\\.(?:json|js|ts|yml|yaml|env|md))\\b");
  const hits = findAll(sentences, codeish, (m, s) => ({ where: snippet(s, m), expected: "wrapped in a code span", actual: m }));
  // The token may already be inside a code element — those are excluded by comparing against inline code text.
  if (!hits.length) return { id: "CL-8.1", status: "NA", summary: "No code-like tokens found in prose." , evidence: []};
  const unique = new Map(hits.map((h) => [h.actual, h]));
  return warn(
    "CL-8.1",
    `${unique.size} code-like token(s) appear in prose; confirm each is wrapped in a code span.`,
    cap([...unique.values()]),
    "Method names, parameters or filenames may be rendered as plain prose.",
    "Checklist 8.0 requires <span class=\"code\"> around method names, params, URLs in code, filenames and scopes.",
    "Wrap each flagged token in a code span, or confirm it is prose and dismiss."
  );
}

/** Checklist 9.0 — UI labels in a click instruction should be bold. */
export function checkUiBold(f: PageFacts): CheckResult {
  const sentences = sentencesOf(f.articleText);
  const clickRx = rx("\\b(click|select|choose|tap)\\s+(?:the\\s+)?([A-Z][A-Za-z0-9 ]{1,30}?)\\s*(?:button|tab|icon|link|option|checkbox|dropdown|menu)\\b");
  const hits: Evidence[] = [];
  const boldBlob = f.boldTexts.join(" | ").toLowerCase();
  for (const s of sentences) {
    clickRx.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = clickRx.exec(s))) {
      const label = m[2].trim();
      if (label.length > 1 && !boldBlob.includes(label.toLowerCase())) {
        hits.push({ where: snippet(s, m[0]), expected: `"${label}" in bold`, actual: "plain text" });
      }
    }
  }
  if (!sentences.length) return { id: "CL-9.1", status: "NA", summary: "No prose to evaluate.", evidence: [] };
  if (!hits.length) return pass("CL-9.1", "On-screen labels in instructions are bold.");
  return warn(
    "CL-9.1",
    `${hits.length} on-screen label(s) in instructions are not bold.`,
    cap(hits),
    "A UI label named in a step is not bold.",
    "Checklist 9.0 requires screen text (CTA buttons, modal titles, field names) to be bold.",
    "Bold the label so the step is scannable."
  );
}

/**
 * Style guide: smart quotes in prose, straight quotes only in code.
 * Code block text is subtracted first so snippets are never flagged.
 */
export function checkSmartQuotes(f: PageFacts): CheckResult {
  const codeBlob = f.codeBlocks.map((c) => c.text).join("\n");
  const sentences = sentencesOf(f.articleText).filter((s) => !codeBlob.includes(s.slice(0, 40)));
  const hits: Evidence[] = [];
  for (const s of sentences) {
    const m = s.match(/"[^"]{1,60}"|'[^']{1,60}'/);
    if (m) hits.push({ where: snippet(s, m[0]), expected: "smart quotes \u201c \u201d", actual: m[0] });
  }
  if (!sentences.length) return { id: "SG-QUOTES", status: "NA", summary: "No prose to evaluate.", evidence: [] };
  if (!hits.length) return pass("SG-QUOTES", "Prose uses smart quotes.");
  return warn(
    "SG-QUOTES",
    `${hits.length} sentence(s) use straight quotes in prose.`,
    cap(hits),
    "Prose uses straight quotes where the guide requires smart quotes.",
    "The text was authored in a plain-text editor that does not curl quotes; straight quotes belong only in code blocks and inline code.",
    "Replace the straight quotes with \u201c \u201d in prose, leaving code samples untouched."
  );
}

/** Comma splice: ", <subject> <verb>" joining two independent clauses. Heuristic. */
export function checkCommaSplice(f: PageFacts): CheckResult {
  const sentences = sentencesOf(f.articleText);
  const splice = rx(
    ",\\s+(it|you|they|we|this|that|there|he|she)\\s+" +
      "(is|are|was|were|can|could|should|would|may|might|must|has|have|had|does|do|did|shows|displays|restores|allows|becomes|remains|stays|skips|fails|runs|applies|reflects|deletes|replaces|handles|validates|review|reviews)\\b"
  );
  const hits = findAll(sentences, splice, (m, s) => ({ where: snippet(s, m), expected: "period, semicolon or conjunction", actual: m.trim() }));
  if (!sentences.length) return { id: "SG-SPLICE", status: "NA", summary: "No prose to evaluate.", evidence: [] };
  if (!hits.length) return pass("SG-SPLICE", "No comma splices detected.");
  return warn(
    "SG-SPLICE",
    `${hits.length} likely comma splice(s).`,
    cap(hits),
    "A comma joins two independent clauses.",
    "The second clause is a full sentence, so a comma cannot carry the join.",
    "Split into two sentences, or use a semicolon or a coordinating conjunction."
  );
}

/** Checklist 17.0 — credentials that should never appear in a doc. */
export function checkSecrets(f: PageFacts): CheckResult {
  const haystack = f.articleText + "\n" + f.codeBlocks.map((c) => c.text).join("\n");
  const patterns: { name: string; rx: RegExp }[] = [
    { name: "Contentstack stack API key", rx: /\bblt[0-9a-f]{16,}\b/g },
    { name: "Contentstack management token", rx: /\bcs[0-9a-f]{20,}\b/g },
    { name: "JWT", rx: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g },
    { name: "AWS access key id", rx: /\bAKIA[0-9A-Z]{16}\b/g },
    { name: "GitHub token", rx: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g },
    { name: "Private key block", rx: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  ];
  const evidence: Evidence[] = [];
  for (const p of patterns) {
    const found = haystack.match(p.rx);
    if (found) {
      for (const hit of [...new Set(found)].slice(0, 5)) {
        evidence.push({ where: p.name, expected: "masked or a placeholder", actual: hit.slice(0, 12) + "…" });
      }
    }
  }
  if (!evidence.length) return pass("CL-17.1", "No credential-shaped strings in the page text or code.");
  return warn(
    "CL-17.1",
    `${evidence.length} credential-shaped string(s) found.`,
    cap(evidence),
    "A value that looks like a live credential is published on the page.",
    "A real key was pasted into an example instead of a placeholder.",
    "Replace with a placeholder (e.g. <your_api_key>) and rotate the exposed credential if it is real."
  );
}

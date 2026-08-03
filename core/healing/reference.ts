// core/healing/reference.ts
/**
 * Builds the "element we were looking for" that the matcher needs.
 *
 * The obvious source — the saved failure DOM — is the wrong one: that snapshot *is* the broken state,
 * so the element is absent from it (or present only in its drifted form). The reliable description of
 * the intended element is the **failed selector chain itself**, which encodes the stable attributes
 * the flow author chose (`data-test-id`, `aria-label`, `name`, expected text).
 *
 * A prior snapshot is still useful as an *enrichment*: if the old selector's attributes match an
 * element in a known-good snapshot, we recover that element's DOM path and surrounding text, which is
 * what unlocks the structural matching tier.
 */
import type { StructuredElement } from "./types";
import { extractFromSnapshotFile } from "./domExtract";

/** Pull `data-test-id` / `data-testid` values out of a CSS chain. */
function attr(chain: string, name: string): string | undefined {
  const re = new RegExp(`\\[${name}\\s*[~^$*|]?=\\s*(['"])(.*?)\\1`, "i");
  return re.exec(chain)?.[2];
}

/** Pull the first `:has-text("…")` / `:text-is("…")` argument. */
function hasText(chain: string): string | undefined {
  return /:(?:has-text|text-is|text)\((['"])(.*?)\1\)/i.exec(chain)?.[2];
}

/** First plain tag name at the start of any alternative in the chain. */
function leadingTag(chain: string): string | undefined {
  for (const part of chain.split(",")) {
    const m = /^\s*([a-z][a-z0-9]*)\b/i.exec(part);
    if (m) return m[1].toLowerCase();
  }
  return undefined;
}

/** Pull `#id` if the chain names one. */
function idOf(chain: string): string | undefined {
  return /(?:^|[\s,>])#([A-Za-z][\w-]*)/.exec(chain)?.[1];
}

/**
 * Synthesise a reference element from the selector chain that was in force, plus the doc's expected
 * label. Every field is best-effort — the matcher tolerates absent fields by skipping that tier.
 */
export function referenceFromSelector(
  chain: string | undefined,
  expectedLabel?: string
): StructuredElement | undefined {
  if (!chain && !expectedLabel) return undefined;
  const c = chain ?? "";

  const testId = attr(c, "data-test-id") ?? attr(c, "data-testid");
  const ariaLabel = attr(c, "aria-label");
  const name = attr(c, "name");
  const title = attr(c, "title");
  const placeholder = attr(c, "placeholder");
  const text = hasText(c) ?? expectedLabel;
  const tag = leadingTag(c) ?? "*";

  if (!testId && !ariaLabel && !name && !text && !title && !placeholder) return undefined;

  return {
    tag,
    role: tag === "button" ? "button" : tag === "a" ? "link" : undefined,
    text,
    id: idOf(c),
    classes: [],
    testId,
    ariaLabel,
    name,
    title,
    placeholder,
    // No structural information is recoverable from a selector; enrichment fills this in when possible.
    domPath: "",
    siblingIndex: 0,
  };
}

/** Does `el` satisfy the stable attributes of `ref`? Used to find `ref` inside a snapshot. */
function matchesReference(el: StructuredElement, ref: StructuredElement): boolean {
  if (ref.testId && el.testId === ref.testId) return true;
  if (ref.ariaLabel && el.ariaLabel === ref.ariaLabel) return true;
  if (ref.name && el.tag === ref.tag && el.name === ref.name) return true;
  if (ref.id && el.id === ref.id) return true;
  return false;
}

/**
 * Enrich a reference with structural context by finding it inside a snapshot taken when the selector
 * still worked. Returns the reference unchanged when no snapshot match exists.
 */
export function enrichFromSnapshot(
  ref: StructuredElement,
  snapshotPaths: string[]
): StructuredElement {
  for (const p of snapshotPaths) {
    const els = extractFromSnapshotFile(p);
    if (!els.length) continue;
    const hit = els.find((e) => matchesReference(e, ref));
    if (hit) {
      return {
        ...ref,
        tag: ref.tag === "*" ? hit.tag : ref.tag,
        role: ref.role ?? hit.role,
        text: ref.text ?? hit.text,
        classes: hit.classes,
        domPath: hit.domPath,
        siblingIndex: hit.siblingIndex,
        surroundingText: hit.surroundingText,
      };
    }
  }
  return ref;
}

/**
 * The doc's expected label for a step: prefer an explicit `expected.labelEquals` (what the doc
 * literally says), falling back to the step target with the repo's `(doc step)` suffix stripped.
 */
export function expectedLabelForStep(step: Record<string, unknown>, target: string): string {
  const expected = step?.["expected"] as Record<string, unknown> | undefined;
  const explicit = expected?.["labelEquals"] ?? expected?.["modalTitle"];
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  return target.replace(/\s*\(doc step\)\s*$/i, "").trim();
}

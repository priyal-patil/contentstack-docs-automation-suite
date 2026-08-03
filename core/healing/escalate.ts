// core/healing/escalate.ts
/**
 * Optional LLM tier. Consulted only when every rule-based tier has missed.
 *
 * Safety model: the model **proposes**, the browser **decides**. Whatever comes back is fed through
 * exactly the same empirical gate as a rule-derived candidate — applied to a live page, with the rest
 * of the flow required to pass. A hallucinated selector therefore cannot produce a false heal; it
 * simply fails to apply and the attempt is recorded as a miss.
 *
 * Disabled unless `--llm` is passed and ANTHROPIC_API_KEY is set.
 */
import type { Candidate, HealTarget, StructuredElement } from "./types";

const MODEL = process.env.HEALING_MODEL ?? "claude-sonnet-5";
const API_URL = "https://api.anthropic.com/v1/messages";

/** Keep the prompt bounded: only interactive-ish elements, trimmed to the useful fields. */
function compact(live: StructuredElement[], limit = 120): Array<Record<string, unknown>> {
  return live
    .filter((e) => e.visible !== false)
    .filter((e) => e.testId || e.ariaLabel || e.text || e.name || e.placeholder)
    .slice(0, limit)
    .map((e) => ({
      tag: e.tag,
      role: e.role,
      text: e.text,
      testId: e.testId,
      ariaLabel: e.ariaLabel,
      name: e.name,
      placeholder: e.placeholder,
    }));
}

export async function escalateToLlm(args: {
  target: HealTarget;
  live: StructuredElement[];
  expectedLabel: string;
}): Promise<Candidate | undefined> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return undefined;

  const prompt = [
    `A documentation-derived UI test step failed because its CSS selector no longer matches.`,
    ``,
    `Documentation says the user should: ${args.target.action} "${args.expectedLabel}"`,
    `Doc URL: ${args.target.documentUrl}`,
    `Selector that no longer works: ${args.target.currentSelector ?? "(unknown)"}`,
    ``,
    `These interactive elements are present on the live page right now (JSON):`,
    JSON.stringify(compact(args.live), null, 1),
    ``,
    `If one of these elements is plainly the control the documentation is describing, reply with ONLY`,
    `a JSON object: {"selector": "<css selector>", "confidence": <0-1>, "rationale": "<short reason>"}.`,
    `Prefer data-test-id, then aria-label, then name, then :has-text(). If none of them is clearly the`,
    `described control, reply with exactly: {"selector": null}. Do not guess — a wrong answer is worse`,
    `than no answer, because it hides genuine documentation drift.`,
  ].join("\n");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return undefined;

    const data: any = await res.json();
    const text: string = (data?.content ?? []).map((c: any) => c?.text ?? "").join("");
    const m = /\{[\s\S]*\}/.exec(text);
    if (!m) return undefined;

    const parsed = JSON.parse(m[0]) as { selector?: string | null; confidence?: number; rationale?: string };
    if (!parsed.selector) return undefined;

    return {
      element: {
        tag: "*",
        classes: [],
        domPath: "",
        siblingIndex: 0,
      },
      strategy: "llm-escalation",
      // Capped: an LLM proposal never outranks a rule-based match, and still faces the empirical gate.
      confidence: Math.min(0.7, Number(parsed.confidence ?? 0.6)),
      selector: parsed.selector,
      rationale: `LLM proposal (${MODEL}): ${parsed.rationale ?? "no rationale given"}`,
    };
  } catch {
    return undefined;
  }
}

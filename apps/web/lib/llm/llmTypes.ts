import { z } from "zod";

import type { Citation, RewriteSuggestion } from "../domain/types";

/**
 * LLM response schema for PR8.
 *
 * Notes:
 * - We keep this deliberately tolerant: normalization happens after parsing.
 * - The goal is reliability for demo; we should rarely “hard fail” on formatting.
 */
export const LlmRewriteSuggestionSchema = z.object({
  citation: z
    .object({
      sentenceIndex: z.number().int().nonnegative(),
      start: z.number().int().nonnegative(),
      end: z.number().int().nonnegative(),
      snippet: z.string(),
    })
    .strict(),
  suggestedText: z.string(),
  rationale: z.string(),
});

export const LlmResponseSchema = z
  .object({
    claims: z
      .array(
        z
          .object({
            text: z.string(),
            kind: z.enum(["factual", "marketing", "legal"]).optional(),
          })
          .strict()
      )
      .default([]),
    rewriteSuggestions: z.array(LlmRewriteSuggestionSchema).default([]),
  })
  .strict();

export type LlmResponse = z.infer<typeof LlmResponseSchema>;

export function normalizeRewriteSuggestions(input: LlmResponse): RewriteSuggestion[] {
  // Normalize + guardrail: clamp offsets and filter empty suggestions.
  return (input.rewriteSuggestions ?? [])
    .filter((s) => s.suggestedText.trim().length > 0)
    .map((s) => {
      const citation: Citation = {
        sentenceIndex: Math.max(0, s.citation.sentenceIndex),
        start: Math.max(0, s.citation.start),
        end: Math.max(Math.max(0, s.citation.start), s.citation.end),
        snippet: String(s.citation.snippet ?? ""),
      };

      return {
        citation,
        suggestedText: s.suggestedText.trim(),
        rationale: s.rationale.trim(),
      };
    });
}

import { LlmResponseSchema, type LlmResponse } from "./llmTypes";

type OpenAiResponsesApiText = {
  type: "output_text";
  text: string;
};

type OpenAiResponse = {
  output?: Array<{ content?: OpenAiResponsesApiText[] }>;
};

function extractText(res: OpenAiResponse): string {
  const parts = res.output?.flatMap((o) => o.content ?? []) ?? [];
  return parts
    .filter((p) => p.type === "output_text")
    .map((p) => p.text)
    .join("\n")
    .trim();
}

function extractFirstJsonObject(text: string): unknown {
  // Best-effort: find the first {...} block.
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  const jsonText = text.slice(start, end + 1);
  return JSON.parse(jsonText);
}

export type OpenAiConfig = {
  apiKey: string;
  model?: string;
  timeoutMs?: number;
};

export type RewriteInput = {
  draft: string;
  violations: Array<{ ruleId: string; message: string; citation: { sentenceIndex: number; start: number; end: number; snippet: string } }>;
  requiredDisclosures: string[];
};

export async function getRewriteSuggestionsViaOpenAi(
  input: RewriteInput,
  config: OpenAiConfig
): Promise<LlmResponse> {
  const model = config.model ?? "gpt-4o-mini";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 12000);

  const system =
    "You are a careful compliance writing assistant. You rewrite marketing copy to reduce compliance risk while preserving intent.";

  const user = {
    draft: input.draft,
    violations: input.violations,
    requiredDisclosures: input.requiredDisclosures,
    instructions: {
      output: {
        claims: "Extract key claims from the draft. Keep them short.",
        rewriteSuggestions:
          "Return rewriteSuggestions with citation offsets/snippets (use provided citations), suggestedText, and rationale.",
      },
      constraints: [
        "Do not remove required disclosures; suggest where to add them if missing.",
        "Keep suggestedText concise and ready to paste.",
        "If there are no violations, return empty rewriteSuggestions.",
      ],
    },
  };

  try {
    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(user) },
        ],
        // Prefer structured output for demo reliability.
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "rewrite_suggestions_v1",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                claims: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      text: { type: "string" },
                      kind: { type: "string", enum: ["factual", "marketing", "legal"] },
                    },
                    required: ["text"],
                  },
                },
                rewriteSuggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      citation: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                          sentenceIndex: { type: "integer", minimum: 0 },
                          start: { type: "integer", minimum: 0 },
                          end: { type: "integer", minimum: 0 },
                          snippet: { type: "string" },
                        },
                        required: ["sentenceIndex", "start", "end", "snippet"],
                      },
                      suggestedText: { type: "string" },
                      rationale: { type: "string" },
                    },
                    required: ["citation", "suggestedText", "rationale"],
                  },
                },
              },
              required: ["claims", "rewriteSuggestions"],
            },
          },
        },
      }),
      signal: controller.signal,
    });

    if (!resp.ok) {
      const t = await resp.text();
      throw new Error(`OpenAI API error (${resp.status}): ${t.slice(0, 500)}`);
    }

    const data = (await resp.json()) as OpenAiResponse;

    // Most of the time, json_schema output will arrive as plain text containing JSON.
    const text = extractText(data);
    const obj = extractFirstJsonObject(text);

    return LlmResponseSchema.parse(obj);
  } finally {
    clearTimeout(timeout);
  }
}

import { describe, expect, it, vi } from "vitest";

import { getRewriteSuggestionsViaOpenAi } from "./openai";

function mockFetchOk(bodyText: string) {
  // Minimal Responses API shape.
  return vi.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      output: [
        {
          content: [{ type: "output_text", text: bodyText }],
        },
      ],
    }),
  })) as unknown as typeof fetch;
}

describe("getRewriteSuggestionsViaOpenAi", () => {
  it("parses json output text", async () => {
    const fetchMock = mockFetchOk(
      JSON.stringify({ claims: [{ text: "claim" }], rewriteSuggestions: [] })
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await getRewriteSuggestionsViaOpenAi(
      { draft: "hi", violations: [], requiredDisclosures: [] },
      { apiKey: "test" }
    );

    expect(res.claims[0].text).toBe("claim");
  });

  it("extracts the first JSON object if wrapped in prose", async () => {
    const fetchMock = mockFetchOk(
      `Here you go:\n\n{ "claims": [], "rewriteSuggestions": [] }\n`
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await getRewriteSuggestionsViaOpenAi(
      { draft: "hi", violations: [], requiredDisclosures: [] },
      { apiKey: "test" }
    );

    expect(res.rewriteSuggestions).toEqual([]);
  });
});

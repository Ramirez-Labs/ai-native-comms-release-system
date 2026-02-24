import { describe, expect, it } from "vitest";
import { findSentenceIndexForOffset, segmentSentences } from "./segment";

describe("segmentSentences", () => {
  it("splits on newlines and punctuation and returns stable offsets", () => {
    const input = "Hello world. Next sentence!\nLine two? Tail";
    const spans = segmentSentences(input);

    expect(spans.map((s) => s.text)).toEqual([
      "Hello world.",
      "Next sentence!",
      "Line two?",
      "Tail",
    ]);

    // Offset inside "Line two" should map to that sentence.
    const idx = findSentenceIndexForOffset(spans, input.indexOf("two"));
    expect(idx).toBe(2);
  });
});

/**
 * Sentence segmentation + offset mapping.
 *
 * Goal: stable sentence-level citations with `{ sentenceIndex, start, end, snippet }`.
 *
 * This is intentionally simple and deterministic for MVP:
 * - Split on newline boundaries first (common in drafts).
 * - Within each line, split on `.`, `!`, `?` followed by whitespace.
 * - Preserve original offsets in the full input string.
 */

export type SentenceSpan = {
  index: number;
  start: number;
  end: number;
  text: string;
};

const SENTENCE_BOUNDARY = /([.!?])\s+/g;

export function segmentSentences(input: string): SentenceSpan[] {
  const spans: SentenceSpan[] = [];

  let globalOffset = 0;
  const lines = input.split("\n");

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
    const line = lines[lineIdx] ?? "";

    // Include the newline char between lines in offset math (except after last).
    const lineStartOffset = globalOffset;

    if (line.trim().length === 0) {
      globalOffset += line.length + 1;
      continue;
    }

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = SENTENCE_BOUNDARY.exec(line)) != null) {
      const boundaryIndex = match.index + match[0].length; // after punctuation + whitespace

      const raw = line.slice(lastIndex, boundaryIndex).trim();
      if (raw.length > 0) {
        const start = lineStartOffset + lastIndex;
        const end = lineStartOffset + boundaryIndex;
        spans.push({ index: spans.length, start, end, text: raw });
      }

      lastIndex = boundaryIndex;
    }

    const tail = line.slice(lastIndex).trim();
    if (tail.length > 0) {
      const start = lineStartOffset + lastIndex;
      const end = lineStartOffset + line.length;
      spans.push({ index: spans.length, start, end, text: tail });
    }

    // move global offset past this line + newline
    globalOffset += line.length + 1;

    // reset regex state for next line
    SENTENCE_BOUNDARY.lastIndex = 0;
  }

  return spans;
}

export function findSentenceIndexForOffset(
  sentences: SentenceSpan[],
  offset: number
): number {
  // Linear scan is fine for MVP (small drafts). Replace with binary search if needed.
  const hit = sentences.find((s) => offset >= s.start && offset < s.end);
  if (hit) return hit.index;

  // If no hit, choose nearest prior sentence, else 0.
  for (let i = sentences.length - 1; i >= 0; i -= 1) {
    if (offset >= sentences[i]!.end) return sentences[i]!.index;
  }
  return 0;
}

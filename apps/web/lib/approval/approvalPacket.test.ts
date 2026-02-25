import { describe, expect, it } from "vitest";

import { buildPacketJsonForStorage } from "./approvalPacket";

import type { ReleaseCase, Evaluation } from "../domain/types";

describe("buildPacketJsonForStorage", () => {
  it("includes required fields for export", () => {
    const releaseCase: ReleaseCase = {
      id: "case-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
      status: "evaluated",
      submission: { text: "hello", context: { channel: "email" } },
      evaluation: undefined,
    };

    const evaluation: Evaluation = {
      evaluatedAt: "2026-01-02T00:00:00.000Z",
      policyVersion: "generic.v0.1",
      decision: "needs_changes",
      severity: "medium",
      confidence: { score: 0.75 },
      violations: [],
      requiredDisclosures: [],
      rewriteSuggestions: [],
      abstained: false,
    };

    const json = buildPacketJsonForStorage({
      releaseCase,
      revisionId: "rev-1",
      evaluation,
      submissionText: "hello",
      revisionHistory: [],
      previousSubmissionText: "hi",
    });

    expect(json.caseId).toBe("case-1");
    expect(json.revisionId).toBe("rev-1");
    expect(json.policyVersion).toBe("generic.v0.1");
    expect(json.decision).toBe("needs_changes");
    expect(json.diff).toEqual(expect.objectContaining({ changed: true }));
  });
});

import { describe, expect, it } from "vitest";

import { loadDemoCases } from "./loadDemoCases";

function makeFakeRepo() {
  const created: string[] = [];

  return {
    create: async () => {
      const id = `case-${created.length + 1}`;
      created.push(id);
      return {
        id,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        status: "draft",
        submission: { text: "x", context: { channel: "email" } },
        evaluation: undefined,
      };
    },
    appendRevision: async () => {},
    getWithRevisions: async (caseId: string) => ({
      releaseCase: {
        id: caseId,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        status: "evaluated",
        submission: { text: "x", context: { channel: "email" } },
        evaluation: undefined,
      },
      revisions: [{ id: `rev-${caseId}`, createdAt: "2026-01-01T00:00:00.000Z", submission: { text: "x", context: { channel: "email" } }, evaluation: {
        evaluatedAt: "2026-01-01T00:00:00.000Z",
        policyVersion: "generic.v0.1",
        decision: "pass",
        severity: "low",
        confidence: { score: 0.95 },
        violations: [],
        requiredDisclosures: [],
      }}],
    }),
    createApprovalPacket: async () => ({ id: "pkt" }),
  };
}

describe("loadDemoCases", () => {
  it("creates 3 cases", async () => {
    const repo = makeFakeRepo() as unknown as Parameters<typeof loadDemoCases>[0];
    const res = await loadDemoCases(repo);
    expect(res.caseIds).toHaveLength(3);
  });
});

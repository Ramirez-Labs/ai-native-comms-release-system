import { describe, expect, it } from "vitest";

import { canApprove, canPublish, approvalRequirements } from "./gating";

describe("workflow gating", () => {
  it("requires signoff for escalate", () => {
    expect(approvalRequirements("escalate").needsSignoff).toBe(true);
    expect(approvalRequirements("pass").needsSignoff).toBe(false);
  });

  it("blocks approve when no decision", () => {
    expect(canApprove({ status: "evaluated", decision: undefined })).toEqual({
      ok: false,
      reason: "No decision yet",
    });
  });

  it("allows approve from evaluated", () => {
    expect(canApprove({ status: "evaluated", decision: "pass" })).toEqual({ ok: true });
  });

  it("publish requires approved", () => {
    expect(canPublish({ status: "evaluated" })).toEqual({ ok: false, reason: "Not approved" });
    expect(canPublish({ status: "approved" })).toEqual({ ok: true });
  });
});

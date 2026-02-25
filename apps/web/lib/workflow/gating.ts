import type { Decision, ReleaseCaseStatus } from "../domain/types";

export type ApprovalRequirements = {
  needsSignoff: boolean;
};

export function approvalRequirements(decision: Decision): ApprovalRequirements {
  return {
    needsSignoff: decision === "escalate",
  };
}

export function canApprove(args: {
  status: ReleaseCaseStatus;
  decision?: Decision;
}): { ok: true } | { ok: false; reason: string } {
  if (args.status === "published") return { ok: false, reason: "Already published" };
  if (args.status === "approved") return { ok: false, reason: "Already approved" };
  if (!args.decision) return { ok: false, reason: "No decision yet" };
  return { ok: true };
}

export function canPublish(args: {
  status: ReleaseCaseStatus;
}): { ok: true } | { ok: false; reason: string } {
  if (args.status === "published") return { ok: false, reason: "Already published" };
  if (args.status !== "approved") return { ok: false, reason: "Not approved" };
  return { ok: true };
}

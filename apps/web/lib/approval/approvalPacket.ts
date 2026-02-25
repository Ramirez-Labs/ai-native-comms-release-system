import type { ApprovalPacket, ReleaseCase, Evaluation } from "../domain/types";

export type RevisionSummary = {
  revisionId: string;
  createdAt: string;
  decision: string;
  severity: string;
  confidenceScore: number;
};

export type ApprovalPacketInput = {
  packetId: string;
  caseId: string;
  revisionId: string;
  createdAt: string;

  submissionText: string;
  evaluation: Evaluation;

  revisionHistory: RevisionSummary[];

  /** Optional: previous revision draft for simple diff metadata */
  previousSubmissionText?: string;
};

export function buildApprovalPacket(input: ApprovalPacketInput): ApprovalPacket {
  const { evaluation } = input;

  return {
    id: input.packetId,
    caseId: input.caseId,
    createdAt: input.createdAt,

    policyVersion: evaluation.policyVersion,
    decision: evaluation.decision,
    severity: evaluation.severity,

    violations: evaluation.violations,
    requiredDisclosures: evaluation.requiredDisclosures,

    inputHash: undefined,

    humanSignoff: undefined,
  };
}

export function buildPacketJsonForStorage(args: {
  releaseCase: ReleaseCase;
  revisionId: string;
  evaluation: Evaluation;
  submissionText: string;
  revisionHistory: RevisionSummary[];
  previousSubmissionText?: string;
}) {
  const prev = args.previousSubmissionText;
  const next = args.submissionText;

  return {
    caseId: args.releaseCase.id,
    revisionId: args.revisionId,

    createdAt: new Date().toISOString(),

    status: args.releaseCase.status,
    context: args.releaseCase.submission.context,

    policyVersion: args.evaluation.policyVersion,
    decision: args.evaluation.decision,
    severity: args.evaluation.severity,
    confidence: args.evaluation.confidence,
    abstained: args.evaluation.abstained ?? false,

    requiredDisclosures: args.evaluation.requiredDisclosures,
    violations: args.evaluation.violations,
    rewriteSuggestions: args.evaluation.rewriteSuggestions ?? [],

    draft: {
      text: next,
    },

    revisionHistory: args.revisionHistory,

    diff: prev
      ? {
          previousLength: prev.length,
          latestLength: next.length,
          changed: prev !== next,
        }
      : { changed: false },
  };
}

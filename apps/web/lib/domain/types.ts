/**
 * Domain types for the Release Gate.
 *
 * Intentionally framework-agnostic (no Next/Supabase dependencies) so the core
 * decisioning logic stays easy to test.
 */

export type Id = string;

export type ISODateTime = string;

export type Channel = "email" | "push" | "landing_page" | "blog";

export type Severity = "low" | "medium" | "high";

export type Decision = "pass" | "needs_changes" | "escalate";

export type Confidence = {
  /** 0..1 */
  score: number;
  /**
   * Optional: freeform reason used for debugging/logging.
   * Avoid showing this in primary UI.
   */
  reason?: string;
};

export type Citation = {
  /** Stable sentence index in the normalized draft */
  sentenceIndex: number;
  /** Character start offset (inclusive) in the full draft */
  start: number;
  /** Character end offset (exclusive) in the full draft */
  end: number;
  /** Small snippet for quick display */
  snippet: string;
};

export type Violation = {
  ruleId: string;
  severity: Severity;
  message: string;
  citation: Citation;
  requiredDisclosures?: string[];
};

export type DraftContext = {
  channel: Channel;
  /** e.g., “Cash account” */
  product?: string;
  /** e.g., “New users” */
  audience?: string;
};

export type DraftSubmission = {
  text: string;
  context: DraftContext;
};

export type ReleaseCaseStatus =
  | "draft"
  | "evaluated"
  | "approved"
  | "blocked"
  | "published";

export type ReleaseCase = {
  id: Id;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;

  status: ReleaseCaseStatus;

  /** Latest submission snapshot */
  submission: DraftSubmission;

  /** Latest evaluation result (if evaluated) */
  evaluation?: Evaluation;
};

export type Evaluation = {
  evaluatedAt: ISODateTime;
  policyVersion: string;

  decision: Decision;
  severity: Severity;
  confidence: Confidence;

  violations: Violation[];
  requiredDisclosures: string[];

  /** Optional: rewrite suggestions, kept separate from decisioning. */
  rewriteSuggestions?: RewriteSuggestion[];

  /**
   * True if the system abstained and routed to human review.
   * This is important for “fail closed” behavior.
   */
  abstained?: boolean;
};

export type RewriteSuggestion = {
  citation: Citation;
  suggestedText: string;
  rationale: string;
};

export type ApprovalPacket = {
  id: Id;
  caseId: Id;

  createdAt: ISODateTime;

  policyVersion: string;
  decision: Decision;
  severity: Severity;

  /** Evidence used to make the decision */
  violations: Violation[];
  requiredDisclosures: string[];

  /** Hash of the input draft (optional for now; used later for immutability) */
  inputHash?: string;

  /** Human sign-off (required for escalations) */
  humanSignoff?: HumanSignoff;
};

export type HumanSignoff = {
  approverName: string;
  approverEmail?: string;
  signedAt: ISODateTime;
  /** Why the human approved/rejected/overrode system recommendation */
  reason?: string;
};

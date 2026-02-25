import type { SupabaseClient } from "@supabase/supabase-js";

import type { DraftSubmission, Evaluation, ReleaseCase } from "../domain/types";
import { nowIso } from "../domain/time";
import { getSupabaseClient } from "./supabaseClient";

export type CreateReleaseCaseInput = {
  submission: DraftSubmission;
};

export type AppendRevisionInput = {
  caseId: string;
  submission: DraftSubmission;
  evaluation: Evaluation;
};

export type ListReleaseCasesInput = {
  limit?: number;
  decision?: "pass" | "needs_changes" | "escalate";
};

export type CaseRevision = {
  id: string;
  createdAt: string;
  submission: DraftSubmission;
  evaluation: Evaluation;
};

/**
 * Minimal persistence for MVP (no auth/RLS, single tenant).
 *
 * Design goals:
 * - keep DB logic thin and explicit
 * - keep domain logic outside the repo layer
 * - allow dependency injection for unit tests
 */
export class ReleaseCaseRepo {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient ?? getSupabaseClient();
  }

  async getApprovalPacketForRevision(input: { caseId: string; revisionId: string }): Promise<
    | {
        id: string;
        packetJson: unknown;
        createdAt: string;
      }
    | null
  > {
    const { data, error } = await this.supabase
      .from("approval_packets")
      .select("id, packet_json, created_at")
      .eq("case_id", input.caseId)
      .eq("revision_id", input.revisionId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return { id: data.id, packetJson: data.packet_json, createdAt: data.created_at };
  }

  async createApprovalPacket(input: {
    caseId: string;
    revisionId: string;
    policyVersion: string;
    decision: string;
    severity: string;
    packetJson: unknown;
  }): Promise<{ id: string }> {
    const { data, error } = await this.supabase
      .from("approval_packets")
      .insert({
        case_id: input.caseId,
        revision_id: input.revisionId,
        policy_version: input.policyVersion,
        decision: input.decision,
        severity: input.severity,
        packet_json: input.packetJson,
      })
      .select("id")
      .single();

    if (error) throw error;
    return { id: data.id };
  }

  async list(input: ListReleaseCasesInput = {}): Promise<ReleaseCase[]> {
    const limit = input.limit ?? 50;

    let q = this.supabase
      .from("release_cases")
      .select(
        "id, created_at, updated_at, status, channel, product, audience, draft_text, latest_decision, latest_severity, latest_confidence_score, latest_policy_version"
      )
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (input.decision) {
      q = q.eq("latest_decision", input.decision);
    }

    const { data, error } = await q;
    if (error) throw error;

    return (data ?? []).map((row) => {
      const hasEval = row.latest_decision && row.latest_severity && row.latest_confidence_score != null;

      return {
        id: row.id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        status: row.status,
        submission: {
          text: row.draft_text,
          context: {
            channel: row.channel,
            product: row.product ?? undefined,
            audience: row.audience ?? undefined,
          },
        },
        evaluation: hasEval
          ? {
              evaluatedAt: row.updated_at,
              policyVersion: row.latest_policy_version ?? "unknown",
              decision: row.latest_decision,
              severity: row.latest_severity,
              confidence: {
                score: Number(row.latest_confidence_score),
              },
              violations: [],
              requiredDisclosures: [],
            }
          : undefined,
      } satisfies ReleaseCase;
    });
  }

  async setCaseStatus(input: {
    caseId: string;
    status: "approved" | "published" | "blocked";
  }): Promise<void> {
    const ts = nowIso();
    const { error } = await this.supabase
      .from("release_cases")
      .update({ status: input.status, updated_at: ts })
      .eq("id", input.caseId);

    if (error) throw error;
  }

  async setApprovalPacketSignoff(input: {
    packetId: string;
    approverName: string;
    approverEmail?: string;
    overrideReason: string;
    signedAt: string;
  }): Promise<void> {
    const { error } = await this.supabase
      .from("approval_packets")
      .update({
        approver_name: input.approverName,
        approver_email: input.approverEmail ?? null,
        override_reason: input.overrideReason,
        signed_at: input.signedAt,
      })
      .eq("id", input.packetId);

    if (error) throw error;
  }

  async getWithRevisions(caseId: string): Promise<{ releaseCase: ReleaseCase; revisions: CaseRevision[] }> {
    const { data: rc, error: rcErr } = await this.supabase
      .from("release_cases")
      .select(
        "id, created_at, updated_at, status, channel, product, audience, draft_text, latest_decision, latest_severity, latest_confidence_score, latest_policy_version"
      )
      .eq("id", caseId)
      .single();

    if (rcErr) throw rcErr;

    const hasEval = rc.latest_decision && rc.latest_severity && rc.latest_confidence_score != null;

    const releaseCase: ReleaseCase = {
      id: rc.id,
      createdAt: rc.created_at,
      updatedAt: rc.updated_at,
      status: rc.status,
      submission: {
        text: rc.draft_text,
        context: {
          channel: rc.channel,
          product: rc.product ?? undefined,
          audience: rc.audience ?? undefined,
        },
      },
      evaluation: hasEval
        ? {
            evaluatedAt: rc.updated_at,
            policyVersion: rc.latest_policy_version ?? "unknown",
            decision: rc.latest_decision,
            severity: rc.latest_severity,
            confidence: {
              score: Number(rc.latest_confidence_score),
            },
            violations: [],
            requiredDisclosures: [],
          }
        : undefined,
    };

    const { data: revRows, error: revErr } = await this.supabase
      .from("case_revisions")
      .select(
        "id, created_at, draft_text, channel, product, audience, policy_version, decision, severity, confidence_score, abstained, violations, required_disclosures, rewrite_suggestions"
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (revErr) throw revErr;

    const revisions: CaseRevision[] = (revRows ?? []).map((r) => ({
      id: r.id,
      createdAt: r.created_at,
      submission: {
        text: r.draft_text,
        context: {
          channel: r.channel,
          product: r.product ?? undefined,
          audience: r.audience ?? undefined,
        },
      },
      evaluation: {
        evaluatedAt: r.created_at,
        policyVersion: r.policy_version,
        decision: r.decision,
        severity: r.severity,
        confidence: { score: Number(r.confidence_score) },
        abstained: r.abstained,
        violations: (r.violations ?? []) as unknown as Evaluation["violations"],
        requiredDisclosures: (r.required_disclosures ?? []) as string[],
        rewriteSuggestions: (r.rewrite_suggestions ?? []) as unknown as Evaluation["rewriteSuggestions"],
      },
    }));

    return { releaseCase, revisions };
  }

  async create(input: CreateReleaseCaseInput): Promise<ReleaseCase> {
    const ts = nowIso();

    const { data, error } = await this.supabase
      .from("release_cases")
      .insert({
        status: "draft",
        channel: input.submission.context.channel,
        product: input.submission.context.product ?? null,
        audience: input.submission.context.audience ?? null,
        draft_text: input.submission.text,
        created_at: ts,
        updated_at: ts,
      })
      .select("id, created_at, updated_at, status, channel, product, audience, draft_text")
      .single();

    if (error) throw error;

    return {
      id: data.id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      status: data.status,
      submission: {
        text: data.draft_text,
        context: {
          channel: data.channel,
          product: data.product ?? undefined,
          audience: data.audience ?? undefined,
        },
      },
      evaluation: undefined,
    };
  }

  /**
   * Appends a revision row (audit trail) and updates the case's latest summary.
   *
   * Approval packet generation is handled later (PR9).
   */
  async appendRevision(input: AppendRevisionInput): Promise<{ revisionId: string }> {
    const ts = nowIso();

    const { data: rev, error: revErr } = await this.supabase
      .from("case_revisions")
      .insert({
        case_id: input.caseId,
        draft_text: input.submission.text,
        channel: input.submission.context.channel,
        product: input.submission.context.product ?? null,
        audience: input.submission.context.audience ?? null,
        policy_version: input.evaluation.policyVersion,
        decision: input.evaluation.decision,
        severity: input.evaluation.severity,
        confidence_score: input.evaluation.confidence.score,
        abstained: input.evaluation.abstained ?? false,
        violations: input.evaluation.violations ?? [],
        required_disclosures: input.evaluation.requiredDisclosures ?? [],
        rewrite_suggestions: input.evaluation.rewriteSuggestions ?? [],
        created_at: ts,
      })
      .select("id")
      .single();

    if (revErr) throw revErr;

    const { error: upErr } = await this.supabase
      .from("release_cases")
      .update({
        status: "evaluated",
        updated_at: ts,
        channel: input.submission.context.channel,
        product: input.submission.context.product ?? null,
        audience: input.submission.context.audience ?? null,
        draft_text: input.submission.text,
        latest_decision: input.evaluation.decision,
        latest_severity: input.evaluation.severity,
        latest_confidence_score: input.evaluation.confidence.score,
        latest_policy_version: input.evaluation.policyVersion,
      })
      .eq("id", input.caseId);

    if (upErr) throw upErr;

    return { revisionId: rev.id };
  }
}

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
      .select()
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

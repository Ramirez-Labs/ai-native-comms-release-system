"use server";

import { redirect } from "next/navigation";

import type { Channel, DraftSubmission } from "../../../lib/domain/types";
import { nowIso } from "../../../lib/domain/time";
import { loadGenericPolicyPackV01 } from "../../../lib/policy/loadPolicyPack";
import { evaluateDeterministicRules } from "../../../lib/policy/ruleEngine";
import { routeFromRuleEngine, toEvaluation } from "../../../lib/decision/routing";
import { ReleaseCaseRepo } from "../../../lib/db/releaseCaseRepo";

export type CreateCaseState =
  | { ok: true }
  | { ok: false; message: string };

function toChannel(input: string): Channel {
  const v = input.toLowerCase();
  if (v === "email") return "email";
  if (v === "push") return "push";
  if (v === "landing_page") return "landing_page";
  if (v === "blog") return "blog";
  throw new Error(`Unknown channel: ${input}`);
}

export async function createCaseAction(
  _prev: CreateCaseState,
  formData: FormData
): Promise<CreateCaseState> {
  const text = String(formData.get("draft") ?? "").trim();
  const channelRaw = String(formData.get("channel") ?? "email");
  const product = String(formData.get("product") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim();

  if (!text) return { ok: false, message: "Paste a draft to review." };

  const submission: DraftSubmission = {
    text,
    context: {
      channel: toChannel(channelRaw),
      product: product || undefined,
      audience: audience || undefined,
    },
  };

  const policy = loadGenericPolicyPackV01();
  const ruleResult = evaluateDeterministicRules(submission, policy);
  const routing = routeFromRuleEngine(ruleResult);
  const evaluation = toEvaluation(ruleResult, nowIso(), routing);

  try {
    const repo = new ReleaseCaseRepo();
    const rc = await repo.create({ submission });
    await repo.appendRevision({ caseId: rc.id, submission, evaluation });
    redirect(`/cases/${rc.id}`);
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}

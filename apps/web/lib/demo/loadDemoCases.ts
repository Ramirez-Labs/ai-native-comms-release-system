import type { DraftSubmission } from "../domain/types";
import { nowIso } from "../domain/time";
import { loadGenericPolicyPackV01 } from "../policy/loadPolicyPack";
import { evaluateDeterministicRules } from "../policy/ruleEngine";
import { routeFromRuleEngine, toEvaluation } from "../decision/routing";
import { buildPacketJsonForStorage } from "../approval/approvalPacket";
import type { ReleaseCaseRepo } from "../db/releaseCaseRepo";
import { fixtureDrafts } from "../fixtures/drafts";

export type DemoLoadResult = {
  caseIds: string[];
};

function submissionForFixture(args: { submission: DraftSubmission; label: string }): DraftSubmission {
  return {
    ...args.submission,
    context: {
      ...args.submission.context,
      product: `[DEMO] ${args.label}`,
      audience: args.submission.context.audience ?? "Demo",
    },
  };
}

export async function loadDemoCases(repo: ReleaseCaseRepo): Promise<DemoLoadResult> {
  const policy = loadGenericPolicyPackV01();
  const ts = nowIso();

  const scenarios: Array<{ label: string; submission: DraftSubmission }> = [
    { label: "Auto-pass", submission: fixtureDrafts.autoPass },
    { label: "Needs changes", submission: fixtureDrafts.needsChanges },
    { label: "Escalate", submission: fixtureDrafts.escalate },
  ].map((s) => ({ ...s, submission: submissionForFixture(s) }));

  const caseIds: string[] = [];

  for (const s of scenarios) {
    const ruleResult = evaluateDeterministicRules(s.submission, policy);
    const routing = routeFromRuleEngine(ruleResult);
    const evaluation = {
      ...toEvaluation(ruleResult, ts, routing),
      // Demo loader is deterministic-only; LLM suggestions come from normal /new flow.
      rewriteSuggestions: [],
    };

    const rc = await repo.create({ submission: s.submission });
    await repo.appendRevision({ caseId: rc.id, submission: s.submission, evaluation });

    // Pre-generate an approval packet so approve/publish can be demoed immediately.
    const history = [
      {
        revisionId: "latest",
        createdAt: ts,
        decision: evaluation.decision,
        severity: evaluation.severity,
        confidenceScore: evaluation.confidence.score,
      },
    ];

    const packetJson = buildPacketJsonForStorage({
      releaseCase: {
        ...rc,
        status: "evaluated",
      },
      revisionId: "latest",
      evaluation,
      submissionText: s.submission.text,
      revisionHistory: history,
    });

    // Store packet tied to the latest revision (real revision id is unknown here without re-load; best-effort).
    // For demo reliability, we re-load the case to get the actual latest revision id.
    const reloaded = await repo.getWithRevisions(rc.id);
    const latest = reloaded.revisions[0];
    if (latest) {
      await repo.createApprovalPacket({
        caseId: rc.id,
        revisionId: latest.id,
        policyVersion: evaluation.policyVersion,
        decision: evaluation.decision,
        severity: evaluation.severity,
        packetJson,
      });
    }

    caseIds.push(rc.id);
  }

  return { caseIds };
}

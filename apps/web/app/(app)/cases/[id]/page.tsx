import Link from "next/link";

import { DecisionBadge } from "../../../../components/DecisionBadge";
import { PageHeader } from "../../../../components/PageHeader";
import { ConnectSupabaseCallout } from "../../../../components/ConnectSupabaseCallout";
import { isMissingSupabaseEnvError } from "../../../../lib/db/errors";
import { ReleaseCaseRepo } from "../../../../lib/db/releaseCaseRepo";
import { formatIsoUtc } from "../../../../lib/ui/format";
import { CaseActions } from "./CaseActions";

function shortId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id;
}

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let data: Awaited<ReturnType<ReleaseCaseRepo["getWithRevisions"]>> | null = null;
  let loadError: unknown = null;

  try {
    const repo = new ReleaseCaseRepo();
    data = await repo.getWithRevisions(id);
  } catch (err) {
    loadError = err;
  }

  if (loadError) {
    if (isMissingSupabaseEnvError(loadError)) {
      return <ConnectSupabaseCallout errorMessage={(loadError as Error).message} />;
    }

    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h1 className="text-2xl font-semibold tracking-tight">Release case</h1>
          <p className="text-sm text-base-content/70 mt-1">Couldn’t load this case.</p>
          <div className="mt-4 text-xs text-base-content/60 font-mono break-words">{String(loadError)}</div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h1 className="text-2xl font-semibold tracking-tight">Release case</h1>
          <p className="text-sm text-base-content/70 mt-1">No data returned.</p>
        </div>
      </div>
    );
  }

  const { releaseCase, revisions } = data;
  const latest = revisions[0];
  const evalSummary = latest?.evaluation ?? releaseCase.evaluation;

  const repo = new ReleaseCaseRepo();
  const existingPacket = latest
    ? await repo.getApprovalPacketForRevision({ caseId: releaseCase.id, revisionId: latest.id })
    : null;
  const hasApprovalPacket = !!existingPacket;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Release case"
        title={shortId(releaseCase.id)}
        subtitle="Review the decision, evidence, and next steps."
        actions={
          <>
            <Link href="/queue" className="btn btn-ghost btn-sm">
              Back
            </Link>
            <span className="badge badge-outline">Status: {releaseCase.status}</span>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Decision</h2>
                  <p className="text-sm text-base-content/70 mt-1">
                    This is the recommended outcome based on the terms we checked.
                  </p>
                </div>
                {evalSummary ? (
                  <DecisionBadge decision={evalSummary.decision} severity={evalSummary.severity} />
                ) : (
                  <span className="badge badge-outline">Draft</span>
                )}
              </div>

              {evalSummary ? (
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                    <div className="text-xs text-base-content/60">Severity</div>
                    <div className="text-sm font-semibold mt-1">{evalSummary.severity}</div>
                  </div>
                  <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                    <div className="text-xs text-base-content/60">Confidence</div>
                    <div className="text-sm font-semibold mt-1">{Math.round(evalSummary.confidence.score * 100)}%</div>
                  </div>
                  <div className="rounded-xl border border-base-300 bg-base-200/40 p-4">
                    <div className="text-xs text-base-content/60">Policy</div>
                    <div className="text-sm font-semibold mt-1">{evalSummary.policyVersion}</div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Latest draft</h2>
              <p className="text-sm text-base-content/70 mt-1">Snapshot of the copy that was evaluated.</p>
              <div className="mt-4 whitespace-pre-wrap rounded-xl border border-base-300 bg-base-200/40 p-4 text-sm">
                {latest?.submission.text ?? releaseCase.submission.text}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Issues to fix</h2>
              <p className="text-sm text-base-content/70 mt-1">
                These items explain why the draft was flagged, with citations and suggested rewrites.
              </p>

              {latest?.evaluation.violations?.length ? (
                (() => {
                  const violations = latest.evaluation.violations;
                  const allSuggestions = latest.evaluation.rewriteSuggestions ?? [];

                  const keyForCitation = (c: { start: number; end: number }) => `${c.start}:${c.end}`;

                  const violationKeys = new Set<string>(violations.map((v) => keyForCitation(v.citation)));
                  const suggestionsByKey = new Map<string, (typeof allSuggestions)[number]>();

                  for (const s of allSuggestions) {
                    suggestionsByKey.set(keyForCitation(s.citation), s);
                  }

                  const unmatchedSuggestions = allSuggestions.filter(
                    (s) => !violationKeys.has(keyForCitation(s.citation))
                  );

                  return (
                    <div className="mt-4 space-y-3">
                      {violations.map((v, idx) => {
                        const suggestion = suggestionsByKey.get(keyForCitation(v.citation));

                        return (
                          <div key={`${v.ruleId}-${idx}`} className="rounded-xl border border-base-300 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="text-sm font-semibold pr-2">{v.message}</div>
                              <span className="badge badge-outline shrink-0">{v.ruleId}</span>
                            </div>
                            <div className="mt-2 text-xs text-base-content/60">
                              <span className="font-semibold">Citation:</span> {v.citation.snippet}
                            </div>

                            {suggestion ? (
                              <div className="mt-4 rounded-xl border border-base-300 bg-base-200/40 p-3">
                                <div className="text-xs font-semibold text-base-content/70">Suggested rewrite</div>
                                <div className="mt-2 text-sm whitespace-pre-wrap">{suggestion.suggestedText}</div>
                                <div className="mt-2 text-xs text-base-content/60">{suggestion.rationale}</div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      {unmatchedSuggestions.length ? (
                        <div className="rounded-xl border border-base-300 bg-base-200/30 p-4">
                          <div className="text-sm font-semibold">General suggestions</div>
                          <div className="text-sm text-base-content/70 mt-1">
                            These suggestions didn’t map cleanly to a specific violation citation, but may still help.
                          </div>
                          <div className="mt-4 space-y-3">
                            {unmatchedSuggestions.map((s, i) => (
                              <div key={i} className="rounded-xl border border-base-300 bg-base-100 p-4">
                                <div className="text-xs font-semibold text-base-content/70">Suggested rewrite</div>
                                <div className="mt-2 text-sm whitespace-pre-wrap">{s.suggestedText}</div>
                                <div className="mt-2 text-xs text-base-content/60">{s.rationale}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })()
              ) : (
                <div className="mt-4 rounded-xl bg-base-200/60 border border-base-300 p-4 text-sm text-base-content/70">
                  No violations recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Revisions</h2>
              <p className="text-sm text-base-content/70 mt-1">Audit trail of submissions and decisions.</p>

              {revisions.length ? (
                <ul className="mt-4 space-y-2">
                  {revisions.map((r) => (
                    <li key={r.id} className="rounded-xl border border-base-300 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold">{shortId(r.id)}</span>
                        <span className="text-xs text-base-content/60">{formatIsoUtc(r.createdAt)}</span>
                      </div>
                      <div className="mt-2">
                        <DecisionBadge decision={r.evaluation.decision} severity={r.evaluation.severity} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-4 text-sm text-base-content/70">No revisions yet.</div>
              )}
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Approval packet</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Step 1 for approvals. Generates a JSON audit artifact (stored in the database).
              </p>

              {latest ? (
                <a className="btn btn-outline btn-sm mt-4 w-full" href={`/api/cases/${releaseCase.id}/approval-packet`}>
                  Export JSON
                </a>
              ) : (
                <button className="btn btn-outline btn-sm mt-4 w-full" disabled>
                  Export JSON
                </button>
              )}

              <div className="mt-3 text-xs text-base-content/60">
                Demo note: export is idempotent per revision and is stored in the database.
              </div>
            </div>
          </div>

          <CaseActions
            caseId={releaseCase.id}
            status={releaseCase.status}
            decision={latest?.evaluation.decision}
            hasApprovalPacket={hasApprovalPacket}
          />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

import { DecisionBadge } from "../../../../components/DecisionBadge";
import { PageHeader } from "../../../../components/PageHeader";
import { ConnectSupabaseCallout } from "../../../../components/ConnectSupabaseCallout";
import { isMissingSupabaseEnvError } from "../../../../lib/db/errors";
import { ReleaseCaseRepo } from "../../../../lib/db/releaseCaseRepo";
import { formatIsoUtc } from "../../../../lib/ui/format";

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Release case"
        title={shortId(releaseCase.id)}
        subtitle="Verdict-first review with sentence-level citations."
        actions={
          <>
            <Link href="/queue" className="btn btn-ghost btn-sm">
              Back
            </Link>
            <button className="btn btn-primary btn-sm" disabled>
              Publish
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Verdict</h2>
                  <p className="text-sm text-base-content/70 mt-1">
                    The gate’s decision is based on deterministic policy rules.
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
              <h2 className="text-base font-semibold">Violations</h2>
              <p className="text-sm text-base-content/70 mt-1">Rules that fired, with sentence-level citations.</p>

              {latest?.evaluation.violations?.length ? (
                <div className="mt-4 space-y-3">
                  {latest.evaluation.violations.map((v, idx) => (
                    <div key={`${v.ruleId}-${idx}`} className="rounded-xl border border-base-300 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{v.message}</div>
                        <span className="badge badge-outline">{v.ruleId}</span>
                      </div>
                      <div className="mt-2 text-xs text-base-content/60">
                        <span className="font-semibold">Citation:</span> {v.citation.snippet}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-base-200/60 border border-base-300 p-4 text-sm text-base-content/70">
                  No violations recorded.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
              <p className="text-sm text-base-content/70 mt-1">Export comes in PR9. This view focuses on decision + evidence.</p>
              <button className="btn btn-outline btn-sm mt-4" disabled>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

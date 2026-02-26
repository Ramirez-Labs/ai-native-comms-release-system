import Link from "next/link";

import type { Decision } from "../../../lib/domain/types";
import { ReleaseCaseRepo } from "../../../lib/db/releaseCaseRepo";
import { isMissingSupabaseEnvError } from "../../../lib/db/errors";
import { PageHeader } from "../../../components/PageHeader";
import { EmptyStateCard } from "../../../components/EmptyStateCard";
import { ConnectSupabaseCallout } from "../../../components/ConnectSupabaseCallout";
import { DecisionBadge } from "../../../components/DecisionBadge";
import { formatIsoUtc } from "../../../lib/ui/format";
import { DemoLoader } from "./DemoLoader";

function decisionTabs(selected?: Decision) {
  const tabs: Array<{ label: string; decision?: Decision; href: string }> = [
    { label: "All", href: "/queue" },
    { label: "Needs changes", decision: "needs_changes", href: "/queue?decision=needs_changes" },
    { label: "Escalate", decision: "escalate", href: "/queue?decision=escalate" },
    { label: "Pass", decision: "pass", href: "/queue?decision=pass" },
  ];

  return (
    <div role="tablist" className="tabs tabs-boxed">
      {tabs.map((t) => (
        <Link
          key={t.label}
          href={t.href}
          role="tab"
          className={`tab ${t.decision === selected || (!t.decision && !selected) ? "tab-active" : ""}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export default async function QueuePage({
  searchParams,
}: {
  searchParams: Promise<{ decision?: Decision }>;
}) {
  const { decision } = await searchParams;

  let cases: Awaited<ReturnType<ReleaseCaseRepo["list"]>> | null = null;
  let loadError: unknown = null;

  try {
    const repo = new ReleaseCaseRepo();
    cases = await repo.list({ decision });
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
          <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
          <p className="text-sm text-base-content/70 mt-1">Couldn’t load cases.</p>
          <div className="mt-4 text-xs text-base-content/60 font-mono break-words">{String(loadError)}</div>
        </div>
      </div>
    );
  }

  if (!cases) {
    return (
      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
          <p className="text-sm text-base-content/70 mt-1">No data returned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Queue"
        subtitle="Review drafts, see what needs changes, and publish only after approval."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {decisionTabs(decision)}
        <div className="text-xs text-base-content/60">Sorted by most recently updated</div>
      </div>

      <DemoLoader />

      {cases.length === 0 ? (
        <EmptyStateCard
          title="No release cases yet"
          description="Create a submission to generate a routed decision."
          action={
            <Link href="/new" className="btn btn-outline btn-sm">
              Submit your first draft
            </Link>
          }
        />
      ) : (
        <div className="card bg-base-100 border border-base-300">
          <div className="card-body p-0">
            <div className="divide-y divide-base-300">
              {cases.map((c) => (
                <Link
                  key={c.id}
                  href={`/cases/${c.id}`}
                  className="block px-5 py-4 hover:bg-base-200/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {c.evaluation ? (
                          <DecisionBadge decision={c.evaluation.decision} severity={c.evaluation.severity} />
                        ) : (
                          <span className="badge badge-outline">Draft</span>
                        )}
                        <span className="text-xs text-base-content/60">
                          {c.submission.context.channel.replace("_", " ")}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-medium truncate">
                        {c.submission.context.product ?? "Untitled"}
                        {c.submission.context.audience ? (
                          <span className="text-base-content/60 font-normal"> · {c.submission.context.audience}</span>
                        ) : null}
                      </div>
                      <div className="mt-1 text-xs text-base-content/60 truncate">
                        {c.submission.text.slice(0, 120)}
                        {c.submission.text.length > 120 ? "…" : ""}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs text-base-content/60">Updated</div>
                      <div className="text-xs font-medium">{formatIsoUtc(c.updatedAt)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

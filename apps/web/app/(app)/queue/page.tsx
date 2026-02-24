import Link from "next/link";

export default function QueuePage() {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Queue</h1>
            <p className="text-sm text-base-content/70 mt-1">
              Release cases routed by policy checks. The gate owns the workflow.
            </p>
          </div>
          <Link href="/new" className="btn btn-primary btn-sm">
            New submission
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-base-300 bg-base-200/50 p-6">
          <div className="text-sm font-medium">No release cases yet</div>
          <div className="text-sm text-base-content/70 mt-1">
            Submit a draft to generate a routed decision and approval packet.
          </div>
          <div className="mt-4">
            <Link href="/new" className="btn btn-outline btn-sm">
              Submit your first draft
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-xs font-semibold text-base-content/50">Coming next</div>
          <ul className="mt-2 text-sm text-base-content/70 list-disc pl-5 space-y-1">
            <li>Real routing states: pass / needs changes / escalate</li>
            <li>Case detail view with sentence-level citations</li>
            <li>Approval packet export</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

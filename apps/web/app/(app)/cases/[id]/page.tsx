export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-base-content/50">Release case</div>
          <h1 className="text-2xl font-semibold tracking-tight">{id}</h1>
          <p className="text-sm text-base-content/70 mt-1">
            This page will show the routed decision, citations, and approval packet.
          </p>
        </div>
        <button className="btn btn-primary btn-sm" disabled>
          Publish
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Decision</h2>
                <span className="badge badge-outline">Pending</span>
              </div>
              <p className="text-sm text-base-content/70 mt-1">The decision engine will set pass / needs changes / escalate.</p>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Violations</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Violations will map to exact sentences with rule IDs and required disclosures.
              </p>
              <div className="mt-4 rounded-xl bg-base-200/60 border border-base-300 p-4 text-sm text-base-content/70">
                No violations loaded.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Approval packet</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Exportable JSON + readable summary. Required to unlock publish.
              </p>
              <button className="btn btn-outline btn-sm mt-4" disabled>
                Export
              </button>
            </div>
          </div>

          <div className="card bg-base-100 border border-base-300">
            <div className="card-body">
              <h2 className="text-base font-semibold">Human sign-off</h2>
              <p className="text-sm text-base-content/70 mt-1">
                Required for escalations. Captured in the audit log.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

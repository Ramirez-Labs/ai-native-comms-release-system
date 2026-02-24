export default function NewSubmissionPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">New submission</h1>
        <p className="text-sm text-base-content/70 mt-1">
          Submit outbound copy for a routed decision: pass, needs changes, or escalate.
        </p>
      </header>

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <form className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="form-control">
                <div className="label">
                  <span className="label-text">Channel</span>
                </div>
                <select className="select select-bordered">
                  <option>Email</option>
                  <option>Push</option>
                  <option>Landing page</option>
                  <option>Blog</option>
                </select>
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Product</span>
                </div>
                <input className="input input-bordered" placeholder="e.g. Cash account" />
              </label>

              <label className="form-control">
                <div className="label">
                  <span className="label-text">Audience</span>
                </div>
                <input className="input input-bordered" placeholder="e.g. New users" />
              </label>
            </div>

            <label className="form-control">
              <div className="label">
                <span className="label-text">Draft</span>
                <span className="label-text-alt text-base-content/60">Paste the full copy to review.</span>
              </div>
              <textarea className="textarea textarea-bordered min-h-[180px]" placeholder="Paste your draft here…" />
            </label>

            <div className="flex items-center justify-end gap-2">
              <button className="btn btn-ghost" type="button" disabled>
                Save draft
              </button>
              <button className="btn btn-primary" type="button" disabled>
                Submit for review
              </button>
            </div>

            <div className="text-xs text-base-content/60">
              Prototype shell. Submission and routing will be implemented in later PRs.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

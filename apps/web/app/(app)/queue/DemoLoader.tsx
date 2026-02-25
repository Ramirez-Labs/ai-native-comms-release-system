"use client";

import { useState } from "react";

export function DemoLoader() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string[] | null>(null);

  async function load() {
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/demo/load", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to load demo cases");

      setCreated(json.caseIds);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Demo setup</div>
            <div className="text-sm text-base-content/70 mt-1">
              Create 3 demo cases (Pass / Needs changes / Escalate) in Supabase.
            </div>
          </div>
          <button className="btn btn-outline btn-sm" onClick={load} disabled={busy}>
            {busy ? "Loading…" : "Load demo cases"}
          </button>
        </div>

        {error ? (
          <div className="mt-4 alert alert-error">
            <span className="text-sm">{error}</span>
          </div>
        ) : null}

        {created ? (
          <div className="mt-4 rounded-xl border border-base-300 bg-base-200/30 p-4">
            <div className="text-sm font-semibold">Created</div>
            <div className="mt-2 text-sm text-base-content/70">
              Open a case to demo export → approve → publish:
            </div>
            <ul className="mt-3 space-y-2">
              {created.map((id) => (
                <li key={id}>
                  <a className="link" href={`/cases/${id}`}>
                    /cases/{id}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-3 text-xs text-base-content/60">
          This writes to your Supabase database. Demo cases are labeled with a <span className="font-mono">[DEMO]</span>
          prefix.
        </div>
      </div>
    </div>
  );
}

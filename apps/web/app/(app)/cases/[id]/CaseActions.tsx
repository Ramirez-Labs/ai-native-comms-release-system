"use client";

import { useMemo, useState } from "react";

import type { Decision, ReleaseCaseStatus } from "../../../../lib/domain/types";
import { approvalRequirements, canApprove, canPublish } from "../../../../lib/workflow/gating";

export function CaseActions(props: {
  caseId: string;
  status: ReleaseCaseStatus;
  decision?: Decision;
  hasApprovalPacket: boolean;
}) {
  const approveGate = canApprove({ status: props.status, decision: props.decision });
  const publishGate = canPublish({ status: props.status });
  const reqs = props.decision ? approvalRequirements(props.decision) : { needsSignoff: false };

  const [approverName, setApproverName] = useState("");
  const [approverEmail, setApproverEmail] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  const [busy, setBusy] = useState<"approve" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const approveDisabledReason = useMemo(() => {
    if (!approveGate.ok) return approveGate.reason;
    if (!props.hasApprovalPacket) return "Export an approval packet first";
    if (reqs.needsSignoff && !approverName.trim()) return "Approver name is required";
    if (reqs.needsSignoff && !overrideReason.trim()) return "Override reason is required";
    return null;
  }, [approveGate, props.hasApprovalPacket, reqs.needsSignoff, approverName, overrideReason]);

  async function doApprove() {
    setError(null);
    setOk(null);
    setBusy("approve");

    try {
      const res = await fetch(`/api/cases/${props.caseId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approverName, approverEmail, overrideReason }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Approve failed");
      setOk("Approved. You can now publish.");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function doPublish() {
    setError(null);
    setOk(null);
    setBusy("publish");

    try {
      const res = await fetch(`/api/cases/${props.caseId}/publish`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Publish failed");
      setOk("Published.");
      window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="alert alert-error">
          <span className="text-sm">{error}</span>
        </div>
      ) : null}
      {ok ? (
        <div className="alert alert-success">
          <span className="text-sm">{ok}</span>
        </div>
      ) : null}

      <div className="card bg-base-100 border border-base-300">
        <div className="card-body">
          <h2 className="text-base font-semibold">Publish gate</h2>
          <p className="text-sm text-base-content/70 mt-1">
            Publishing is blocked unless this case is approved.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="rounded-xl border border-base-300 bg-base-200/30 p-4">
              <div className="text-xs text-base-content/60">Status</div>
              <div className="text-sm font-semibold mt-1">{props.status}</div>
            </div>
          </div>

          {reqs.needsSignoff ? (
            <div className="mt-4 rounded-xl border border-base-300 bg-base-200/20 p-4">
              <div className="text-sm font-semibold">Human sign-off required</div>
              <p className="text-sm text-base-content/70 mt-1">
                This case is an escalation. Add an approver and a short override reason to approve.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <input
                  className="input input-bordered"
                  placeholder="Approver name"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                />
                <input
                  className="input input-bordered w-full"
                  placeholder="Approver email (optional)"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                />
                <textarea
                  className="textarea textarea-bordered w-full min-h-[96px]"
                  placeholder="Override reason (required for escalations)"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              className="btn btn-outline btn-sm w-full sm:w-auto"
              disabled={!!approveDisabledReason || busy === "approve"}
              onClick={doApprove}
              title={approveDisabledReason ?? undefined}
            >
              {busy === "approve" ? "Approving…" : "Approve"}
            </button>

            <button
              className="btn btn-primary btn-sm w-full sm:w-auto"
              disabled={!publishGate.ok || busy === "publish"}
              onClick={doPublish}
              title={!publishGate.ok ? publishGate.reason : undefined}
            >
              {busy === "publish" ? "Publishing…" : "Publish"}
            </button>
          </div>

          {!props.hasApprovalPacket ? (
            <div className="mt-3 text-xs text-base-content/60">
              You’ll need to export an approval packet before approving so the sign-off can be recorded.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

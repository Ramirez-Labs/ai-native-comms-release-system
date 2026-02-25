import { NextResponse } from "next/server";

import { ReleaseCaseRepo } from "../../../../../lib/db/releaseCaseRepo";
import { isMissingSupabaseEnvError } from "../../../../../lib/db/errors";
import { canApprove, approvalRequirements } from "../../../../../lib/workflow/gating";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    const body = (await req.json()) as {
      approverName?: string;
      approverEmail?: string;
      overrideReason?: string;
    };

    const repo = new ReleaseCaseRepo();
    const { releaseCase, revisions } = await repo.getWithRevisions(id);
    const latest = revisions[0];

    if (!latest) {
      return NextResponse.json({ error: "No revisions found" }, { status: 400 });
    }

    const gate = canApprove({ status: releaseCase.status, decision: latest.evaluation.decision });
    if (!gate.ok) {
      return NextResponse.json({ error: gate.reason }, { status: 400 });
    }

    // Ensure we have a packet; approvals are recorded on the packet.
    const existing = await repo.getApprovalPacketForRevision({ caseId: id, revisionId: latest.id });
    if (!existing) {
      return NextResponse.json(
        { error: "Approval packet not found. Export an approval packet first." },
        { status: 400 }
      );
    }

    const reqs = approvalRequirements(latest.evaluation.decision);
    if (reqs.needsSignoff) {
      const name = String(body.approverName ?? "").trim();
      const reason = String(body.overrideReason ?? "").trim();
      const email = String(body.approverEmail ?? "").trim();

      if (!name) return NextResponse.json({ error: "Missing approverName" }, { status: 400 });
      if (!reason) return NextResponse.json({ error: "Missing overrideReason" }, { status: 400 });

      await repo.setApprovalPacketSignoff({
        packetId: existing.id,
        approverName: name,
        approverEmail: email || undefined,
        overrideReason: reason,
        signedAt: new Date().toISOString(),
      });
    }

    await repo.setCaseStatus({ caseId: id, status: "approved" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isMissingSupabaseEnvError(err)) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }

    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

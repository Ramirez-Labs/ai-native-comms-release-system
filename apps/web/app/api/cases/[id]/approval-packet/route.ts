import { NextResponse } from "next/server";

import { ReleaseCaseRepo } from "../../../../../lib/db/releaseCaseRepo";
import { isMissingSupabaseEnvError } from "../../../../../lib/db/errors";
import { buildPacketJsonForStorage } from "../../../../../lib/approval/approvalPacket";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    const repo = new ReleaseCaseRepo();

    // Load case + revisions.
    const { releaseCase, revisions } = await repo.getWithRevisions(id);
    const latest = revisions[0];

    if (!latest) {
      return NextResponse.json(
        { error: "No revisions found for this case" },
        { status: 400 }
      );
    }

    // Idempotent: if a packet already exists for this revision, return it.
    const existing = await repo.getApprovalPacketForRevision({ caseId: id, revisionId: latest.id });
    if (existing) {
      return jsonAttachment(existing.packetJson, `approval-packet-${id}.json`);
    }

    const history = revisions.map((r) => ({
      revisionId: r.id,
      createdAt: r.createdAt,
      decision: r.evaluation.decision,
      severity: r.evaluation.severity,
      confidenceScore: r.evaluation.confidence.score,
    }));

    const prevText = revisions[1]?.submission.text;

    const packetJson = buildPacketJsonForStorage({
      releaseCase,
      revisionId: latest.id,
      evaluation: latest.evaluation,
      submissionText: latest.submission.text,
      revisionHistory: history,
      previousSubmissionText: prevText,
    });

    await repo.createApprovalPacket({
      caseId: id,
      revisionId: latest.id,
      policyVersion: latest.evaluation.policyVersion,
      decision: latest.evaluation.decision,
      severity: latest.evaluation.severity,
      packetJson,
    });

    return jsonAttachment(packetJson, `approval-packet-${id}.json`);
  } catch (err) {
    if (isMissingSupabaseEnvError(err)) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

function jsonAttachment(obj: unknown, filename: string) {
  const body = JSON.stringify(obj, null, 2);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

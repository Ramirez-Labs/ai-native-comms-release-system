import { NextResponse } from "next/server";

import { ReleaseCaseRepo } from "../../../../../lib/db/releaseCaseRepo";
import { isMissingSupabaseEnvError } from "../../../../../lib/db/errors";
import { canPublish } from "../../../../../lib/workflow/gating";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;

  try {
    const repo = new ReleaseCaseRepo();
    const { releaseCase } = await repo.getWithRevisions(id);

    const gate = canPublish({ status: releaseCase.status });
    if (!gate.ok) {
      return NextResponse.json({ error: gate.reason }, { status: 400 });
    }

    await repo.setCaseStatus({ caseId: id, status: "published" });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (isMissingSupabaseEnvError(err)) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }

    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

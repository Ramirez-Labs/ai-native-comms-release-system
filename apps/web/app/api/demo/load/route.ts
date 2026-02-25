import { NextResponse } from "next/server";

import { ReleaseCaseRepo } from "../../../../lib/db/releaseCaseRepo";
import { isMissingSupabaseEnvError } from "../../../../lib/db/errors";
import { loadDemoCases } from "../../../../lib/demo/loadDemoCases";

export async function POST(): Promise<Response> {
  try {
    const repo = new ReleaseCaseRepo();
    const result = await loadDemoCases(repo);

    return NextResponse.json(result);
  } catch (err) {
    if (isMissingSupabaseEnvError(err)) {
      return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

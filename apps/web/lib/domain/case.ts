import type { DraftSubmission, ReleaseCase } from "./types";
import { newId } from "./ids";
import { nowIso } from "./time";

export function createReleaseCase(submission: DraftSubmission): ReleaseCase {
  const ts = nowIso();

  return {
    id: newId("rc"),
    createdAt: ts,
    updatedAt: ts,
    status: "draft",
    submission,
  };
}

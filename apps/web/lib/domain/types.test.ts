import { describe, expect, it } from "vitest";
import { createReleaseCase } from "./case";
import { fixtureDrafts } from "../fixtures/drafts";

describe("domain model", () => {
  it("creates a release case with expected defaults", () => {
    const rc = createReleaseCase(fixtureDrafts.autoPass);

    expect(rc.id).toMatch(/^rc_/);
    expect(rc.status).toBe("draft");
    expect(rc.submission.context.channel).toBe("email");
    expect(rc.submission.text).toContain("quick update");
    expect(rc.createdAt).toMatch(/Z$/);
    expect(rc.updatedAt).toBe(rc.createdAt);
  });
});

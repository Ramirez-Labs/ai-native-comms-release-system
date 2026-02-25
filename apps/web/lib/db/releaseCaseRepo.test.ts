import { describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ReleaseCaseRepo } from "./releaseCaseRepo";
import { fixtureDrafts } from "../fixtures/drafts";

type Call =
  | { op: "from"; table: string }
  | { op: "insert"; payload: unknown }
  | { op: "update"; payload: unknown };

type ChainResult = { data: unknown; error: unknown };

type FakeChain = {
  insert: (payload: unknown) => FakeChain;
  update: (payload: unknown) => FakeChain;
  select: () => FakeChain;
  single: () => Promise<ChainResult>;
  eq: (column: string, value: unknown) => FakeChain;
};

type FakeSupabase = {
  from: (table: string) => FakeChain;
  __calls: Call[];
};

function makeFakeSupabase(): FakeSupabase {
  const calls: Call[] = [];

  function chain(result: ChainResult): FakeChain {
    return {
      insert: (payload: unknown) => {
        calls.push({ op: "insert", payload });
        return chain(result);
      },
      update: (payload: unknown) => {
        calls.push({ op: "update", payload });
        return chain(result);
      },
      select: () => chain(result),
      single: async () => result,
      eq: () => chain(result),
    };
  }

  const base: ChainResult = {
    data: {
      id: "00000000-0000-0000-0000-000000000000",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      status: "draft",
      channel: "email",
      product: null,
      audience: null,
      draft_text: "hello",
    },
    error: null,
  };

  return {
    from: (table: string) => {
      calls.push({ op: "from", table });
      return chain(base);
    },
    __calls: calls,
  };
}

describe("ReleaseCaseRepo", () => {
  it("creates a release case with expected insert payload", async () => {
    const fake = makeFakeSupabase();
    const repo = new ReleaseCaseRepo(fake as unknown as SupabaseClient);

    const rc = await repo.create({ submission: fixtureDrafts.autoPass });

    expect(rc.id).toBeTruthy();

    const insertCall = fake.__calls.find((c) => c.op === "insert");
    expect(insertCall.payload.status).toBe("draft");
    expect(insertCall.payload.channel).toBe("email");
    expect(insertCall.payload.draft_text).toContain("quick update");
  });
});

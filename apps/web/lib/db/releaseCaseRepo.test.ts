import { describe, expect, it } from "vitest";

import type { SupabaseClient } from "@supabase/supabase-js";
import { ReleaseCaseRepo } from "./releaseCaseRepo";
import { fixtureDrafts } from "../fixtures/drafts";

type Call =
  | { op: "from"; table: string }
  | { op: "insert"; payload: unknown }
  | { op: "update"; payload: unknown }
  | { op: "select"; args: unknown[] }
  | { op: "eq"; column: string; value: unknown }
  | { op: "order"; column: string }
  | { op: "limit"; n: number };

type ChainResult = { data: unknown; error: unknown };

type FakeChain = {
  insert: (payload: unknown) => FakeChain;
  update: (payload: unknown) => FakeChain;
  select: (...args: unknown[]) => FakeChain;
  single: () => Promise<ChainResult>;
  eq: (column: string, value: unknown) => FakeChain;
  order: (column: string, opts?: unknown) => FakeChain;
  limit: (n: number) => FakeChain;
  then: (resolve: (r: ChainResult) => unknown) => Promise<unknown>;
};

type FakeSupabase = {
  from: (table: string) => FakeChain;
  __calls: Call[];
};

function makeFakeSupabase(overrides?: { single?: unknown; many?: unknown }): FakeSupabase {
  const calls: Call[] = [];

  const baseSingle: ChainResult = {
    data: {
      id: "00000000-0000-0000-0000-000000000000",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      status: "draft",
      channel: "email",
      product: null,
      audience: null,
      draft_text: "hello",
      latest_decision: null,
      latest_severity: null,
      latest_confidence_score: null,
      latest_policy_version: null,
    },
    error: null,
  };

  const baseMany: ChainResult = {
    data: [baseSingle.data],
    error: null,
  };

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
      select: (...args: unknown[]) => {
        calls.push({ op: "select", args });
        return chain(result);
      },
      single: async () => ({ ...result, data: overrides?.single ?? baseSingle.data }),
      eq: (column: string, value: unknown) => {
        calls.push({ op: "eq", column, value });
        return chain(result);
      },
      order: (column: string) => {
        calls.push({ op: "order", column });
        return chain(result);
      },
      limit: (n: number) => {
        calls.push({ op: "limit", n });
        return chain(result);
      },
      then: async (resolve: (r: ChainResult) => unknown) =>
        resolve({ ...result, data: overrides?.many ?? baseMany.data }),
    };
  }

  return {
    from: (table: string) => {
      calls.push({ op: "from", table });
      // Default to returning many rows for list(); callers can override via `overrides`.
      return chain(baseMany);
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
    expect(insertCall && "payload" in insertCall).toBe(true);

    const payload = (insertCall as { payload: unknown }).payload as {
      status?: unknown;
      channel?: unknown;
      draft_text?: unknown;
    };

    expect(payload.status).toBe("draft");
    expect(payload.channel).toBe("email");
    expect(String(payload.draft_text)).toContain("quick update");
  });

  it("lists cases ordered by updated_at", async () => {
    const fake = makeFakeSupabase({
      many: [
        {
          id: "case-1",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-02T00:00:00.000Z",
          status: "evaluated",
          channel: "email",
          product: null,
          audience: null,
          draft_text: "hello",
          latest_decision: "pass",
          latest_severity: "low",
          latest_confidence_score: 0.95,
          latest_policy_version: "generic.v0.0",
        },
      ],
    });

    const repo = new ReleaseCaseRepo(fake as unknown as SupabaseClient);
    const cases = await repo.list({ limit: 10 });

    expect(cases).toHaveLength(1);
    expect(cases[0].evaluation?.decision).toBe("pass");

    expect(fake.__calls.some((c) => c.op === "order" && c.column === "updated_at")).toBe(true);
    expect(fake.__calls.some((c) => c.op === "limit" && c.n === 10)).toBe(true);
  });

  it("loads a case with revision audit trail", async () => {
    const fake = makeFakeSupabase({
      single: {
        id: "case-1",
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-02T00:00:00.000Z",
        status: "evaluated",
        channel: "email",
        product: null,
        audience: null,
        draft_text: "hello",
        latest_decision: "needs_changes",
        latest_severity: "medium",
        latest_confidence_score: 0.75,
        latest_policy_version: "generic.v0.1",
      },
      many: [
        {
          id: "rev-1",
          created_at: "2026-01-02T00:00:00.000Z",
          draft_text: "hello",
          channel: "email",
          product: null,
          audience: null,
          policy_version: "generic.v0.1",
          decision: "needs_changes",
          severity: "medium",
          confidence_score: 0.75,
          abstained: false,
          violations: [],
          required_disclosures: [],
          rewrite_suggestions: [],
        },
      ],
    });

    const repo = new ReleaseCaseRepo(fake as unknown as SupabaseClient);
    const result = await repo.getWithRevisions("case-1");

    expect(result.releaseCase.id).toBe("case-1");
    expect(result.revisions).toHaveLength(1);
    const fromTables = fake.__calls
      .filter((c) => c.op === "from")
      .map((c) => (c as { table: string }).table);

    expect(fromTables).toEqual(expect.arrayContaining(["release_cases", "case_revisions"]));
  });
});

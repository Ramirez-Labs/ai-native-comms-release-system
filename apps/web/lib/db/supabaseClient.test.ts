import { describe, expect, it } from "vitest";
import { getSupabaseClient } from "./supabaseClient";

describe("getSupabaseClient", () => {
  it("throws when env vars are missing", () => {
    const old = { ...process.env };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    expect(() => getSupabaseClient()).toThrow(/Missing Supabase env vars/);

    process.env = old;
  });

  it("creates a client when env vars are present", () => {
    const old = { ...process.env };
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";

    const client = getSupabaseClient();
    expect(client).toBeTruthy();

    process.env = old;
  });
});

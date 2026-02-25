export function isMissingSupabaseEnvError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.message.includes("Missing Supabase env vars");
}

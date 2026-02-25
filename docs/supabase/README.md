# Supabase (MVP)

We use a **cloud-hosted Supabase Postgres** instance.

## MVP posture
- **No Auth / No RLS** in MVP (single-tenant prototype for the contest)
- Schema is managed via SQL migrations under `supabase/migrations/`

## Environment variables (web)
These are intentionally not committed.

Create `apps/web/.env.local` with:

- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

(We use anon key for the prototype. Service role key should never be placed in the browser.)

## Applying migrations
Migrations can be applied via Supabase SQL editor, or via Supabase CLI later.

For now (cloud-only), copy/paste the newest migration SQL into the SQL editor.

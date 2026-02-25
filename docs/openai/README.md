# OpenAI (PR8)

PR8 introduces a best-effort OpenAI call to generate **rewrite suggestions** for demo purposes.

## Environment variables

Set these **server-side only** (never `NEXT_PUBLIC_*`):

- `OPENAI_API_KEY=...` (required to enable suggestions)
- `OPENAI_MODEL=gpt-4o-mini` (optional; default is `gpt-4o-mini`)

### Local dev
Create `apps/web/.env.local`:

```bash
OPENAI_API_KEY=... 
OPENAI_MODEL=gpt-4o-mini

NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### Deployments
Add the same env vars in your hosting provider (Vercel/etc).

## Reliability notes
- We use the OpenAI **Responses API** with `response_format: json_schema` to strongly bias toward valid output.
- Even so, the app treats suggestions as **best-effort**:
  - if OpenAI errors/timeouts, the case still saves
  - UI still renders; you’ll just see no rewrite suggestions

# AI-Native Comms Release Gate
Rebuilding Marketing & Customer Communications Approval as an AI-First System

North star: [`one-pager.md`](./one-pager.md)

## Tech decisions (MVP)
- Web: **Next.js + TypeScript**
- UI: **Tailwind CSS + daisyUI**
- DB: **Supabase Postgres**
- Auth/RLS: **not in MVP** (Option A). Single-tenant prototype for the submission.

## PR plan (checklist)

**Progress:** PR1 merged ✅ (UI shell). PR2 merged ✅ (domain model + fixtures + unit tests). PR3 merged ✅ (policy pack v0.1 + deterministic rule engine). PR4 merged ✅ (sentence-level citation mapping). PR5 merged ✅ (routing decision engine). PR6 merged ✅ (Supabase schema + persistence + migrations workflow). CI merged ✅ (Actions runs lint/test/build on PRs + main).

We’ll build this as a sequence of small, reviewable PRs. Each PR should:
- stay narrowly scoped
- add/adjust tests for new logic
- preserve the “release gate owns the workflow” requirement (routing + publish blocking)

### PR1 — Next.js scaffold + daisyUI shell (DONE)
- [x] Next.js + TypeScript scaffold
- [x] Tailwind + daisyUI setup
- [x] Minimal navigation + pages (stubs): Queue / New Submission / Case Detail
- [x] Basic copy aligned with `one-pager.md`
- [x] CI-ready scripts (lint/build)

### PR2 — Domain model + fixtures (pure TypeScript)
- [x] Define core types: `ReleaseCase`, `CaseRevision`, `Decision`, `Violation`, `PolicyRule`, `ApprovalPacket`
- [x] Add fixture drafts: auto-pass / needs-changes / escalate
- [x] Unit tests for type-level helpers / fixtures loading

### PR3 — Policy pack v0.1 + deterministic rule engine
- [x] Add `POLICY_GENERIC_v0.1` with rule IDs + severities + required disclosures
- [x] Implement deterministic checks (regex/heuristics) → `violations[]`
- [x] Unit tests: each fixture triggers expected rules + severities

### PR4 — Sentence-level citation mapping
- [x] Sentence splitting + stable citation model `{ sentenceIndex, start, end, snippet }`
- [x] Map violations to citations (span references)
- [x] Unit tests for citation correctness on fixtures

### PR5 — Routing decision engine (operational responsibility)
- [x] Aggregate violations → `severity`
- [x] Compute `decision = pass | needs_changes | escalate` with confidence/abstain rules
- [x] Deterministic routing rules documented in code
- [x] Unit tests for routing outcomes across fixtures

### PR6 — Supabase schema + persistence (no auth/RLS)
- [x] Supabase project config notes for local/dev (`docs/supabase/README.md`)
- [x] Database schema + migrations for:
  - [x] `release_cases`
  - [x] `case_revisions`
  - [x] `approval_packets`
- [x] Minimal DB access layer (create/append revision)
- [x] Unit tests for persistence layer (mocked Supabase client)
- [x] GitHub Action to auto-apply migrations on `main` (`.github/workflows/supabase-migrations.yml`)

### PR7 — Wire UI to real data (Queue + Case Detail)
- [ ] Queue shows cases by decision/state (pass/needs_changes/escalate)
- [ ] Case detail shows: decision, violations, citations, required disclosures
- [ ] Manual test steps in PR description

### PR8 — Constrained LLM step (strict JSON) + rewrite suggestions
- [ ] LLM outputs strict JSON: claim extraction + rewrite suggestions
- [ ] Schema validation (fail closed → abstain/escalate)
- [ ] Ensure deterministic high-severity rules cannot be overridden by LLM output
- [ ] Tests with mocked LLM responses

### PR9 — Approval packet generator + export
- [ ] Generate approval packet (JSON + readable summary)
- [ ] Include inputs, policy version, rules fired, citations, timestamps, diffs across revisions
- [ ] Tests for packet shape + required fields

### PR10 — Hard publish gate + human sign-off
- [ ] Publish action blocked unless approved state
- [ ] Human sign-off required for escalations (name/timestamp + override reason)
- [ ] End-to-end flows: auto-pass→publish; escalate→sign→publish

### PR11 — Demo hardening (video-ready)
- [ ] One-click load of 3 canonical demo scenarios
- [ ] Copy polish to match one-pager language (“Release Case”, “Approval Packet”, etc.)
- [ ] Add `/docs/demo-script.md` and `/docs/writeup-500-words.md` outlines

## CI
GitHub Actions runs `lint`, `test`, and `build` for the web app on every PR and on pushes to `main`.

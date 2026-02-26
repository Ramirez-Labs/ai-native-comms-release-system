# AI-Native Comms Release Gate
Rebuilding Marketing & Customer Communications Approval as an AI-First System

North star: [`one-pager.md`](./one-pager.md)

## Tech decisions (MVP)
- Web: **Next.js + TypeScript**
- UI: **Tailwind CSS + daisyUI**
- DB: **Supabase Postgres**
- Auth/RLS: **not in MVP** (Option A). Single-tenant prototype for the submission.

## PR plan (checklist)

**Progress:** PR1 merged ✅ (UI shell). PR2 merged ✅ (domain model + fixtures + unit tests). PR3 merged ✅ (policy pack v0.1 + deterministic rule engine). PR4 merged ✅ (sentence-level citation mapping). PR5 merged ✅ (routing decision engine). PR6 merged ✅ (Supabase schema + persistence + migrations workflow). PR7 merged ✅ (UI wired to real Supabase data; demo flow works). PR8 merged ✅ (OpenAI rewrite suggestions + normalization; demo-safe fallbacks). PR9 merged ✅ (Approval packet export + persistence). PR10 merged ✅ (Publish gate + escalation sign-off). PR11 merged ✅ (Demo hardening). CI merged ✅ (Actions runs lint/test/build on PRs + main).

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
- [x] Queue shows cases by decision/state (pass/needs_changes/escalate)
- [x] Case detail shows: decision, violations, citations, required disclosures
- [x] New submission creates a case + revision and redirects to the case detail (demo fixtures included)
- [x] Missing env vars render a friendly “Connect Supabase” callout (demo-safe)
- [x] Manual test steps documented in PR description + `docs/ui/pr7-wire-ui-real-data.md`

### PR8 — Constrained LLM step (strict-ish JSON) + rewrite suggestions
- [x] OpenAI call generates rewrite suggestions (best-effort; demo-focused)
- [x] Response normalization + schema validation (avoid demo breakage)
- [x] Ensure deterministic high-severity rules cannot be overridden by LLM output
- [x] Tests with mocked OpenAI responses
- [x] Docs: `docs/openai/README.md`
- [x] Demo reliability: unmatched suggestions appear under “General suggestions”

### PR9 — Approval packet generator + export
- [x] Generate approval packet (JSON)
- [x] Include inputs, policy version, decision/severity/confidence, violations+citation evidence, required disclosures
- [x] Include revision history summary + simple diff metadata
- [x] Persist packets to `approval_packets` (idempotent per revision)
- [x] Export JSON download from case detail
- [x] Tests for packet shape + required fields
- [x] Docs: `docs/ui/pr9-approval-packet-export.md`

### PR10 — Hard publish gate + human sign-off
- [x] Publish action blocked unless approved state
- [x] Approve action (API) updates case status to `approved`
- [x] Escalations require human sign-off (approver name + override reason; stored on approval packet)
- [x] Publish action (API) updates case status to `published`
- [x] Demo-friendly UI on case detail (Approve/Publish with clear disabled reasons)
- [x] Unit tests for gating logic + repo update calls
- [x] Docs: `docs/ui/pr10-publish-gate-signoff.md`

### PR11 — Demo hardening (video-ready)
- [x] One-click load of 3 canonical demo scenarios (Queue → Load demo cases)
- [x] Copy polish and demo-friendly UX
- [x] Add `/docs/demo-script.md`
- [x] Add `/docs/writeup-500-words.md`

---

## Roadmap (post-PR11) — meet the “expand human capability” bar

The current prototype is demo-ready, but it doesn’t yet fully satisfy the brief:
- human role isn’t consistently explicit in the UI
- the system doesn’t yet support many people/tenants
- reliability at scale (jobs/retries/monitoring) isn’t built

Below is the next PR sequence to close those gaps.

### PR12 — Workflow clarity overhaul (UI + copy)
**Goal:** make the product self-explanatory in <30 seconds.
- [ ] Add a persistent “Who does what” banner:
  - **AI recommends** (issues + suggested rewrites)
  - **Human approves** (especially escalations)
  - **System enforces** (publish is blocked without approval)
- [ ] Redesign Case Detail information architecture:
  - top: Decision + “Next step” module
  - middle: Draft + Issues to fix + Suggested rewrites
  - right rail: Actions only (Export → Approve → Publish)
  - advanced details collapsed by default
- [ ] Remove duplicate CTAs + make one primary action per screen
- [ ] Add UI state polish: loading/empty/error on Queue + Case

### PR13 — Analysis as a first-class step (Re-analyze + revisions)
**Goal:** demonstrate the system taking operational responsibility over time.
- [ ] Add “Re-analyze” action (creates a new revision) without requiring a new case
- [ ] Show what changed since last revision (diff summary + new/cleared issues)
- [ ] Ensure approval/publish always target the latest revision (or explicitly choose)
- [ ] Unit tests for revision lifecycle + state transitions

### PR14 — Policy pack management (versioning + change control)
**Goal:** higher-quality, maintainable decisions as complexity grows.
- [ ] Policy pack registry with semantic versions + changelog
- [ ] “Policy version used” surfaced in UI and exported packet
- [ ] Guardrail tests: fixtures + golden cases remain stable across policy updates

### PR15 — Multi-tenant + auth (Supabase RLS)
**Goal:** “serve far more people” safely.
- [ ] Auth (Supabase)
- [ ] Tenant model (orgs/projects) + RLS policies
- [ ] Data scoping for cases/revisions/packets
- [ ] Minimal role model: reviewer vs approver

### PR16 — Scale reliability (background jobs + retries)
**Goal:** make AI + persistence reliable under load.
- [ ] Move analysis and packet generation to background job queue
- [ ] Retry strategy for OpenAI timeouts/rate limits
- [ ] Idempotency keys for revision creation + packet generation
- [ ] Basic observability: job status, last error, timing

### PR17 — Explicit human-critical decision (product + audit)
**Goal:** explicitly name and enforce the one decision that must remain human.
- [ ] In-product copy: “Escalation override must remain human” + rationale
- [ ] Require sign-off on escalations (already enforced) + show it prominently in packet UI
- [ ] Audit view: who approved, why, and what evidence they saw

## CI
GitHub Actions runs `lint`, `test`, and `build` for the web app on every PR and on pushes to `main`.

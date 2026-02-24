# AI-Native Comms Release Gate
Rebuilding Marketing & Customer Communications Approval as an AI-First System

North star: [`one-pager.md`](./one-pager.md)

## PR plan (checklist)
We’ll build this as a sequence of small, reviewable PRs. Each PR should:
- stay narrowly scoped
- add/adjust tests for new logic
- preserve the “release gate owns the workflow” requirement (routing + publish blocking)

### PR1 — Repo scaffold + minimal UI shell
- [ ] Next.js app + basic page layout (no AI)
- [ ] Minimal navigation: Queue / New Submission / Case Detail (stub)
- [ ] Basic styling + copy aligned with `one-pager.md`
- [ ] CI-ready scripts (lint/test placeholders)

### PR2 — Domain model + fixtures (pure TypeScript)
- [ ] Define core types: `ReleaseCase`, `CaseRevision`, `Decision`, `Violation`, `PolicyRule`, `ApprovalPacket`
- [ ] Add fixture drafts: auto-pass / needs-changes / escalate
- [ ] Unit tests for type-level helpers / fixtures loading

### PR3 — Policy pack v0.1 + deterministic rule engine
- [ ] Add `POLICY_GENERIC_v0.1` with rule IDs + severities + required disclosures
- [ ] Implement deterministic checks (regex/heuristics) → `violations[]`
- [ ] Unit tests: each fixture triggers expected rules + severities

### PR4 — Sentence-level citation mapping
- [ ] Sentence splitting + stable citation model `{ sentenceIndex, start, end, snippet }`
- [ ] Map violations to citations (span references)
- [ ] Unit tests for citation correctness on fixtures

### PR5 — Routing decision engine (operational responsibility)
- [ ] Aggregate violations → `severity`
- [ ] Compute `decision = pass | needs_changes | escalate` with confidence/abstain rules
- [ ] Deterministic routing rules documented in code
- [ ] Unit tests for routing outcomes across fixtures

### PR6 — Persistence for Release Cases + revision history (local/dev)
- [ ] Store cases + revisions (SQLite or file-backed store)
- [ ] Create/Load case endpoints
- [ ] Tests for create/update/revision append

### PR7 — Queue + Case Detail UI wired to real data
- [ ] Queue shows cases by state (pass/needs_changes/escalate)
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

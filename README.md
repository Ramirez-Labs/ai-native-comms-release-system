# AI-Native Comms Release Gate
Rebuilding Marketing & Customer Communications Approval as an AI-First System

North star: [`one-pager.md`](./one-pager.md)

## PR plan (checklist)
We’ll build this as a sequence of small, reviewable PRs. Each PR should:
- stay narrowly scoped
- add/adjust tests for new logic
- preserve the “release gate owns the workflow” requirement (routing + publish blocking)

### PR1 — Scaffold + domain model + versioned policy pack (no AI yet)
- [ ] Create app skeleton (web UI + API)
- [ ] Define core types: `ReleaseCase`, `Decision`, `Violation`, `PolicyRule`, `ApprovalPacket`
- [ ] Add versioned policy pack (e.g. `POLICY_GENERIC_v0.1`) with rule IDs + severities
- [ ] Add fixture drafts covering: auto-pass / needs-changes / escalate
- [ ] Unit tests for rule matching primitives

### PR2 — Draft ingestion + sentence-level citations
- [ ] Draft intake form (paste text + context fields)
- [ ] Sentence splitting + citation model `{ sentenceIndex, start, end, snippet }`
- [ ] UI shows violations mapped to specific sentences/spans
- [ ] Unit tests for citation mapping on fixtures

### PR3 — Deterministic rule engine + routing (operational responsibility)
- [ ] Deterministic checks produce `violations[]` + aggregated `severity`
- [ ] Routing: `pass | needs_changes | escalate` (+ confidence/abstain rules)
- [ ] Queues/views for routed states
- [ ] Unit tests for routing outcomes across fixtures

### PR4 — Constrained LLM step (strict JSON) + rewrite suggestions
- [ ] LLM outputs strict JSON: claims, violation explanations, suggested rewrites
- [ ] Schema validation (fail closed → abstain/escalate)
- [ ] Ensure deterministic high-severity rules cannot be overridden by LLM output
- [ ] Tests with mocked LLM responses

### PR5 — Approval packet + hard publish gate + human sign-off
- [ ] Approval packet export (JSON + readable)
- [ ] Publish endpoint/button is blocked unless approved
- [ ] Human sign-off required for escalations (record name/timestamp + override reason)
- [ ] End-to-end flows: auto-pass→publish; escalate→sign→publish

### PR6 — Demo hardening (video-ready)
- [ ] One-click load of 3 canonical demo scenarios
- [ ] Copy polish to match one-pager language (“Release Case”, “Approval Packet”, etc.)
- [ ] Add `/docs/demo-script.md` and `/docs/writeup-500-words.md` outlines


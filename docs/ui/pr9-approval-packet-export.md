# PR9 — Approval packet generator + export

## Feature name
Approval packet export (JSON + readable summary)

## User
Comms/Marketing operator (demo persona) + reviewer

## Top question
“Can I ship this, and what evidence supports the decision?”

## Primary CTA
**Export approval packet**

## Scope (in)
- Generate an Approval Packet from the latest revision (decision + evidence)
- Persist packet to `approval_packets` table (audit artifact)
- Export packet as downloadable JSON (demo-friendly)
- Show minimal UI for export on Case Detail (enabled when evaluated)

## Non-scope (out)
- Human sign-off UX + publish gate (PR10)
- PDF export (optional later)
- Full diff visualization UI (include diff data in packet only)

## Acceptance criteria
- [ ] `/cases/:id` has an enabled **Export** action when a revision/evaluation exists
- [ ] Export returns a JSON attachment containing:
  - case id + revision id
  - policy version, decision, severity, confidence
  - violations + citations
  - required disclosures
  - draft snapshot
  - revision history summary
  - simple diff metadata (previous vs latest)
- [ ] Export generates and persists a row in `approval_packets`
- [ ] If packet already exists for that revision, reuse it (idempotent)
- [ ] If Supabase not configured, show Connect Supabase callout (no crash)
- [ ] Unit tests for approval packet generation

## States
- Empty: no revisions → export disabled + explanatory copy
- Loading/In progress: generating… (client button state)
- Success: downloads JSON
- Needs attention/Error: inline error toast/callout; case page still renders

## Risks / unknowns
- Server-route auth: still MVP single-tenant; we accept for demo
- Diff approach: keep minimal (byte size small)

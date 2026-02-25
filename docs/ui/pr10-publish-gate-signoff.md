# PR10 — Hard publish gate + human sign-off

## Domain intake
- **User:** Comms/Marketing operator + approver
- **Style:** Neutral premium SaaS, verdict-first
- **Top question:** “Is this approved to ship, and if not, what do I do next?”

## Scope
- Publish button is disabled unless case is **Approved**.
- Add an **Approve** action on case detail:
  - For `decision=escalate`: requires human sign-off (name + optional email + reason) stored with the approval packet.
  - For `decision=pass` or `needs_changes`: allow approval without sign-off (MVP), but still record approver name when provided.
- Add a **Publish** action on case detail:
  - Only allowed when case status is `approved`.
  - Sets status to `published`.

## Acceptance criteria
- [ ] Case detail shows clear status (Draft/Evaluated/Approved/Published)
- [ ] Approve action updates DB (`release_cases.status=approved`) and stores sign-off for escalations
- [ ] Publish action updates DB (`release_cases.status=published`) and remains blocked otherwise
- [ ] UI copy is demo-friendly and explains what’s missing when blocked
- [ ] Unit tests cover gating logic (approve/publish) and repo update calls

## Non-scope
- Auth/RLS
- Multi-approver workflows
- Email notifications

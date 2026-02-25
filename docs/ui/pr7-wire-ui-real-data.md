# PR7 — Wire UI to real data (Queue + Case Detail)

## Domain intake
- **Product:** AI-Native Comms Release Gate
- **User:** Marketing/Comms operator (demo persona: “Ops reviewer”)
- **Style mode:** Neutral Premium SaaS (Stripe-ish)
- **Density:** Balanced
- **Accessibility:** Default

## Top question (per screen)
- **Queue:** “What needs attention right now?”
- **Case detail:** “Is this safe to ship, and what do I do next?”

## Screen spec

### Queue
**Header**
- Title: Queue
- Subtitle: concise explanation
- Primary CTA: **New submission**

**Content**
- Tabs/filters by decision/status (Pass / Needs changes / Escalate / All)
- List of cases (cards or rows): decision badge, channel, product/audience (optional), updated time
- Click → case detail

**Empty**
- Friendly empty state with a single CTA to create a first case

**Error / Not configured**
- If Supabase env vars are missing: show “Connect Supabase” callout with the exact env vars needed.

### Case detail
**Header**
- Title: Release case
- Subtitle: human-friendly identifier (shortened UUID)
- Primary action: (future) Publish — disabled for now

**Hero verdict**
- Decision badge + severity + confidence
- Short copy: what the decision means

**Core content**
- Latest draft text (read-only)
- Violations list (from latest revision): rule id, message, severity, citations (sentence snippets)

**Supporting**
- Revision timeline (IDs + timestamps)
- “Advanced details” collapsible (raw JSON later)

**Empty**
- If case exists but has no revision: show callout to analyze (future PR)

## States matrix
- **Loading:** skeleton rows/cards
- **Empty:** “No cases yet” with CTA
- **Not configured:** Connect Supabase callout
- **Error:** “Couldn’t load cases” with retry suggestion

## Component inventory (planned)
- `PageHeader`
- `EmptyStateCard`
- `ConnectSupabaseCallout`
- `DecisionBadge`
- `CaseListItem`

## Acceptance checklist
- [ ] Queue loads cases from Supabase and is demo-friendly (clear hierarchy)
- [ ] Case detail loads case + latest revision and renders a verdict-first view
- [ ] Missing env vars shows a helpful callout (no blank crash page)
- [ ] Unit tests for repo queries and key UI states (at least not-configured + empty)
- [ ] Copy avoids technical jargon in primary UI

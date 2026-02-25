# Demo script (PR11)

Goal: show an end-to-end governed workflow in ~2–3 minutes.

## Setup (1 minute)
1) Ensure Supabase env vars are set (see `docs/supabase/README.md`).
2) (Optional) Set OpenAI key for suggestions (see `docs/openai/README.md`).
3) Start the app: `cd apps/web && npm run dev`

## Flow
### 1) Load demo cases (10 seconds)
- Go to **Queue**.
- Click **Load demo cases**.
- Open the **Escalate** case (labeled `[DEMO] Escalate`).

### 2) Review verdict + evidence (30 seconds)
- Point out the **Verdict** banner (decision, severity, confidence).
- Show **Violations** with sentence-level citations.
- Show **Suggested rewrite** (if OpenAI key is set).

### 3) Export an approval packet (20 seconds)
- Click **Export JSON**.
- Explain this creates an auditable artifact in `approval_packets`.

### 4) Human sign-off (30 seconds)
- In **Publish gate**, click **Approve**.
- For escalations, enter:
  - Approver name
  - Override reason
- Approve → status becomes `approved`.

### 5) Publish (10 seconds)
- Click **Publish** → status becomes `published`.

## Closing line
“AI generates evidence and suggestions, but humans still own approval and publishing.”

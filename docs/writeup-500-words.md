# Release Gate — 500-word writeup (PR11)

**What a human can now do that they couldn’t before**

A comms operator can take a draft (email/push/landing/blog), submit it, and immediately get a governed “release case” with an explicit verdict (pass / needs changes / escalate), evidence, and an exportable approval artifact. Instead of relying on ad‑hoc reviews in Slack or scattered docs, the workflow is centralized: cases show up in a queue, each case has an audit trail of revisions, and approval/publish are enforced by the system.

**What the AI is responsible for**

AI’s job is to accelerate review—never to silently ship. The system uses deterministic policy checks as the source of truth for routing and severity. On top of that, an OpenAI step can generate rewrite suggestions and concise claim extraction. The AI output is treated as best‑effort assistance: it’s normalized into a stable shape and displayed alongside citations so a human can quickly understand “what triggered” and “how to fix it.”

**Where AI must stop**

AI must not approve or publish on its own. Escalations require named human sign‑off with an override reason, and publishing is hard‑gated on approval. The AI also must not override deterministic high‑severity findings: deterministic rules drive the decision; AI suggestions are advisory only.

**What would break first at scale**

The first pressure point is data governance: without authentication/RLS and tenant isolation, this cannot be deployed broadly. Next, the LLM step becomes a reliability and cost hotspot—network latency, rate limits, and prompt drift can hurt throughput (even though the UI degrades gracefully when AI fails). Finally, the policy pack/rule engine will need stronger lifecycle management (versioning, change control, and richer testing) as the rule set grows and as more channels/products introduce edge cases.

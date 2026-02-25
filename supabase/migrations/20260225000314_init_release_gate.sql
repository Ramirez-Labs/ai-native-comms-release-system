-- AI-Native Comms Release Gate
-- Initial schema (MVP, no auth/RLS yet).
--
-- NOTE: For the contest MVP we are intentionally not enabling RLS.
-- This is a single-tenant prototype. Hardening (Auth + RLS) is a later milestone.

begin;

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Release cases represent the primary workflow object.
create table if not exists public.release_cases (
  id uuid primary key default gen_random_uuid(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  status text not null check (status in ('draft','evaluated','approved','blocked','published')),

  -- context fields (lightweight)
  channel text not null check (channel in ('email','push','landing_page','blog')),
  product text,
  audience text,

  -- latest draft text snapshot
  draft_text text not null,

  -- denormalized latest evaluation summary (optional; source of truth is case_revisions)
  latest_decision text check (latest_decision in ('pass','needs_changes','escalate')),
  latest_severity text check (latest_severity in ('low','medium','high')),
  latest_confidence_score numeric,
  latest_policy_version text
);

-- Each resubmission/evaluation appends a revision (auditability).
create table if not exists public.case_revisions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.release_cases(id) on delete cascade,

  created_at timestamptz not null default now(),

  -- immutable snapshot of what was evaluated
  draft_text text not null,
  channel text not null check (channel in ('email','push','landing_page','blog')),
  product text,
  audience text,

  policy_version text not null,
  decision text not null check (decision in ('pass','needs_changes','escalate')),
  severity text not null check (severity in ('low','medium','high')),
  confidence_score numeric not null,
  abstained boolean not null default false,

  -- structured outputs for UI + packet generation
  violations jsonb not null default '[]'::jsonb,
  required_disclosures jsonb not null default '[]'::jsonb,
  rewrite_suggestions jsonb not null default '[]'::jsonb
);

create index if not exists case_revisions_case_id_created_at_idx
  on public.case_revisions(case_id, created_at desc);

-- Approval packets are the release artifact.
create table if not exists public.approval_packets (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.release_cases(id) on delete cascade,
  revision_id uuid not null references public.case_revisions(id) on delete restrict,

  created_at timestamptz not null default now(),

  policy_version text not null,
  decision text not null check (decision in ('pass','needs_changes','escalate')),
  severity text not null check (severity in ('low','medium','high')),

  packet_json jsonb not null,

  -- human sign-off (required for escalations)
  approver_name text,
  approver_email text,
  signed_at timestamptz,
  override_reason text
);

create index if not exists approval_packets_case_id_created_at_idx
  on public.approval_packets(case_id, created_at desc);

commit;

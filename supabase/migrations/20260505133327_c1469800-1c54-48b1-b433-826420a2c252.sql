create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  company text not null,
  role text not null,
  source text,
  created_at timestamptz not null default now(),
  unique (email, source)
);

alter table public.waitlist enable row level security;

-- No client policies; only the edge function (service role) writes/reads.
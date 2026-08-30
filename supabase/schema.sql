-- Virus Tracker — Supabase schema (T0.5: time-series storage layer)
--
-- Idempotent: safe to re-run in the Supabase SQL editor. All tables use
-- CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS.
--
-- Access model: Row Level Security is enabled on every table below with NO
-- policies attached. This means:
--   - The service-role key (used exclusively by the server-side client in
--     src/server/db/supabase.ts) bypasses RLS entirely and has full access.
--   - The anon/public key (if ever exposed to a browser) gets ZERO access,
--     since no policy grants it any rows. This is deliberate: this schema
--     is written and read only by trusted server code.

-- ---------------------------------------------------------------------------
-- ingestion_runs — one row per ingestion cycle, tracking source health.
-- ---------------------------------------------------------------------------
create table if not exists ingestion_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  source_health jsonb not null default '[]'
);

alter table ingestion_runs enable row level security;
comment on table ingestion_runs is
  'RLS enabled with no policies: only the service-role key (server-only) can read/write. Anon key gets no access.';

-- ---------------------------------------------------------------------------
-- metric_observations — time-series of per-region metric snapshots.
-- ---------------------------------------------------------------------------
create table if not exists metric_observations (
  id bigint generated always as identity primary key,
  run_id bigint references ingestion_runs(id) on delete cascade,
  observed_at timestamptz not null default now(),
  virus_slug text not null,
  country_code text not null,
  location_id text not null,
  location_level text not null,
  active_cases bigint,
  confirmed_cases bigint,
  deaths bigint,
  recovered bigint,
  extra jsonb
);

alter table metric_observations enable row level security;
comment on table metric_observations is
  'RLS enabled with no policies: only the service-role key (server-only) can read/write. Anon key gets no access.';

create index if not exists metric_observations_virus_observed_idx
  on metric_observations (virus_slug, observed_at desc);

create index if not exists metric_observations_virus_country_observed_idx
  on metric_observations (virus_slug, country_code, observed_at desc);

-- ---------------------------------------------------------------------------
-- snapshots — latest (and historical, keyed by cache key) dashboard snapshot
-- payloads. Replaces the Upstash Redis L2 cache.
-- ---------------------------------------------------------------------------
create table if not exists snapshots (
  key text primary key,
  payload jsonb not null,
  generated_at timestamptz not null
);

alter table snapshots enable row level security;
comment on table snapshots is
  'RLS enabled with no policies: only the service-role key (server-only) can read/write. Anon key gets no access.';

-- ---------------------------------------------------------------------------
-- news_items — deduplicated news feed, keyed by article link.
-- ---------------------------------------------------------------------------
create table if not exists news_items (
  link text primary key,
  title text not null,
  source text not null,
  published_at timestamptz,
  summary text,
  virus_tags text[] not null default '{}'
);

alter table news_items enable row level security;
comment on table news_items is
  'RLS enabled with no policies: only the service-role key (server-only) can read/write. Anon key gets no access.';

create index if not exists news_items_published_at_idx
  on news_items (published_at desc);

CREATE TABLE IF NOT EXISTS viruses (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  country_code TEXT NOT NULL,
  region_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS daily_metrics (
  id BIGSERIAL PRIMARY KEY,
  virus_id INT NOT NULL REFERENCES viruses(id),
  region_id INT NOT NULL REFERENCES regions(id),
  active_cases BIGINT NOT NULL,
  confirmed_cases BIGINT NOT NULL,
  deaths BIGINT NOT NULL,
  recovered BIGINT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS outbreak_events (
  id BIGSERIAL PRIMARY KEY,
  virus_id INT NOT NULL REFERENCES viruses(id),
  title TEXT NOT NULL,
  details TEXT,
  severity TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS trajectories (
  id BIGSERIAL PRIMARY KEY,
  virus_id INT NOT NULL REFERENCES viruses(id),
  day_label TEXT NOT NULL,
  projected_cases BIGINT NOT NULL,
  confidence_low BIGINT NOT NULL,
  confidence_high BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS news_items (
  id BIGSERIAL PRIMARY KEY,
  external_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT,
  published_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS source_health (
  id BIGSERIAL PRIMARY KEY,
  source_name TEXT UNIQUE NOT NULL,
  healthy BOOLEAN NOT NULL,
  message TEXT NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

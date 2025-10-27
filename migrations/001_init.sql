-- PawReels Database Migration 001
-- Postgres schema for PawReels video reel system

create table "User"(
  id uuid primary key default gen_random_uuid(),
  handle text unique not null,
  locale text not null default 'en',
  refCode text unique,
  created_at timestamptz not null default now()
);

create table "Track"(
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  bpm int not null,
  duration_ms int not null,
  license_id text not null,
  license_expiry timestamptz not null,
  url text not null,
  waveform_json jsonb not null default '[]',
  genre text,
  mood text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table "Template"(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  json_spec jsonb not null,
  thumb_url text,
  min_clips int not null,
  max_clips int not null,
  theme text,
  tags text[] not null default '{}',
  version int not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create type ReelStatus as enum('draft','rendering','public','flagged','removed');

create table "Reel"(
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references "User"(id) on delete cascade,
  template_id uuid references "Template"(id),
  track_id uuid references "Track"(id),
  src_json jsonb not null default '{}',
  mp4_url text,
  poster_url text,
  duration_ms int,
  remix_of_id uuid references "Reel"(id),
  watermark boolean not null default true,
  locale text not null default 'en',
  status ReelStatus not null default 'draft',
  kpi_shares int not null default 0,
  kpi_installs int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table "Clip"(
  id uuid primary key default gen_random_uuid(),
  reel_id uuid references "Reel"(id) on delete cascade,
  "order" int not null,
  src_url text not null,
  start_ms int not null default 0,
  end_ms int not null,
  caption_json jsonb,
  created_at timestamptz not null default now()
);

create table "RemixEdge"(
  parent_id uuid references "Reel"(id) on delete cascade,
  child_id uuid references "Reel"(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(parent_id, child_id)
);

create table "ShareEvent"(
  id uuid primary key default gen_random_uuid(),
  reel_id uuid references "Reel"(id) on delete cascade,
  channel text not null,
  referrer_user_id uuid references "User"(id),
  created_at timestamptz not null default now()
);

create table "ModerationFlag"(
  id uuid primary key default gen_random_uuid(),
  reel_id uuid references "Reel"(id) on delete cascade,
  kind text not null,
  score float not null,
  status text not null default 'pending',
  notes text,
  reviewed_by uuid references "User"(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index idx_clip_reel_order on "Clip"(reel_id,"order");
create index idx_reel_owner_status_created on "Reel"(owner_id,status,created_at);
create index idx_reel_status_created on "Reel"(status,created_at);
create index idx_reel_remix_of on "Reel"(remix_of_id);
create index idx_reel_template on "Reel"(template_id);
create index idx_track_license_expiry on "Track"(license_expiry);
create index idx_template_is_active on "Template"(is_active,theme);
create index idx_share_reel_created on "ShareEvent"(reel_id,created_at);
create index idx_moderation_reel_status on "ModerationFlag"(reel_id,status);


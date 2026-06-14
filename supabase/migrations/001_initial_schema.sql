-- Bharosa v1 schema

create extension if not exists "uuid-ossp";

-- Celebrities registry
create table celebrities (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  aliases text[] default '{}',
  gender text not null check (gender in ('men', 'women')),
  influence_score smallint not null check (influence_score between 1 and 10),
  last_scored_at timestamptz,
  created_at timestamptz default now()
);

-- Raw ingested posts
create table posts (
  id uuid primary key default uuid_generate_v4(),
  source text not null,
  source_url text,
  image_url text not null,
  posted_at timestamptz not null,
  celebrity_id uuid references celebrities(id),
  detection_confidence numeric(4,3),
  ingested_at timestamptz default now(),
  raw_meta jsonb default '{}'
);

-- Deduped spottings
create table spottings (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid references posts(id) on delete cascade,
  celebrity_id uuid references celebrities(id),
  spotting_date date not null,
  garment text not null check (garment in ('shirt', 'pant')),
  fit text not null,
  colour text not null,
  colour_hex text,
  fabric text not null,
  pattern text not null,
  trend_cluster_id uuid,
  unique (celebrity_id, spotting_date, garment, post_id)
);

-- Trend clusters
create table trend_clusters (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  description text not null,
  garment text not null check (garment in ('shirt', 'pant')),
  gender text not null check (gender in ('men', 'women')) default 'men',
  attribute_signature jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table spottings
  add constraint spottings_trend_cluster_id_fkey
  foreign key (trend_cluster_id) references trend_clusters(id);

-- Daily ranking snapshots
create table daily_rankings (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  trend_cluster_id uuid references trend_clusters(id) on delete cascade,
  score numeric(10,2) not null,
  rank integer not null,
  unique (date, trend_cluster_id)
);

create index daily_rankings_date_rank_idx on daily_rankings (date, rank);

-- Retailers (linked to Supabase auth.users via phone)
create table retailers (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text not null unique,
  created_at timestamptz default now()
);

-- Wishlist
create table wishlist_items (
  id uuid primary key default uuid_generate_v4(),
  retailer_id uuid references retailers(id) on delete cascade,
  trend_cluster_id uuid references trend_clusters(id) on delete cascade,
  created_at timestamptz default now(),
  unique (retailer_id, trend_cluster_id)
);

-- RLS policies
alter table retailers enable row level security;
alter table wishlist_items enable row level security;

create policy "Retailers can read own profile"
  on retailers for select using (auth.uid() = id);

create policy "Retailers can read own wishlist"
  on wishlist_items for select using (auth.uid() = retailer_id);

create policy "Retailers can insert own wishlist"
  on wishlist_items for insert with check (auth.uid() = retailer_id);

create policy "Retailers can delete own wishlist"
  on wishlist_items for delete using (auth.uid() = retailer_id);

-- Public read for trend data
alter table celebrities enable row level security;
alter table posts enable row level security;
alter table spottings enable row level security;
alter table trend_clusters enable row level security;
alter table daily_rankings enable row level security;

create policy "Public read celebrities" on celebrities for select using (true);
create policy "Public read posts" on posts for select using (true);
create policy "Public read spottings" on spottings for select using (true);
create policy "Public read trends" on trend_clusters for select using (true);
create policy "Public read rankings" on daily_rankings for select using (true);

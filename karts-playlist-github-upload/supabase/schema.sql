create extension if not exists "pgcrypto";

drop table if exists public.posts;

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  school text not null,
  place text not null,
  cover text default '',
  likes integer not null default 1,
  liked_by text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_likes_idx on public.posts (likes desc);

alter table public.posts enable row level security;

create policy "public read posts"
on public.posts
for select
to anon
using (true);

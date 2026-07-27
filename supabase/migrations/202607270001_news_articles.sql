-- News publishing schema and authorization. Safe to apply more than once.
create extension if not exists pgcrypto;

create table if not exists public.approved_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id) on delete set null
);

revoke all on public.approved_staff from anon, authenticated;

create or replace function public.is_approved_staff(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select check_user_id is not null
    and exists (select 1 from public.approved_staff where user_id = check_user_id);
$$;

revoke all on function public.is_approved_staff(uuid) from public;
grant execute on function public.is_approved_staff(uuid) to anon, authenticated;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text not null,
  thumbnail_path text,
  status text not null default 'draft',
  author_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint articles_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) between 3 and 100),
  constraint articles_title_length check (char_length(btrim(title)) between 1 and 180),
  constraint articles_excerpt_length check (excerpt is null or char_length(excerpt) <= 500),
  constraint articles_body_present check (char_length(btrim(body)) > 0),
  constraint articles_status_check check (status in ('draft', 'published')),
  constraint articles_publish_time_check check (
    (status = 'draft' and published_at is null)
    or (status = 'published' and published_at is not null)
  )
);

create index if not exists articles_published_listing_idx
  on public.articles (published_at desc) where status = 'published';
create index if not exists articles_status_updated_idx
  on public.articles (status, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

revoke all on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

alter table public.approved_staff enable row level security;
alter table public.articles enable row level security;

drop policy if exists "staff can view allowlist" on public.approved_staff;
create policy "staff can view allowlist" on public.approved_staff
for select to authenticated using (public.is_approved_staff());

drop policy if exists "published articles are public" on public.articles;
create policy "published articles are public" on public.articles
for select to anon, authenticated
using (status = 'published' or public.is_approved_staff());

drop policy if exists "staff can create articles" on public.articles;
create policy "staff can create articles" on public.articles
for insert to authenticated
with check (public.is_approved_staff() and author_id = auth.uid());

drop policy if exists "staff can update articles" on public.articles;
create policy "staff can update articles" on public.articles
for update to authenticated
using (public.is_approved_staff())
with check (public.is_approved_staff());

drop policy if exists "staff can delete articles" on public.articles;
create policy "staff can delete articles" on public.articles
for delete to authenticated
using (public.is_approved_staff());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-thumbnails',
  'article-thumbnails',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "published article thumbnails are readable" on storage.objects;
create policy "published article thumbnails are readable" on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'article-thumbnails'
  and (
    public.is_approved_staff()
    or exists (
      select 1 from public.articles
      where articles.thumbnail_path = storage.objects.name
        and articles.status = 'published'
    )
  )
);

drop policy if exists "staff can upload thumbnails" on storage.objects;
create policy "staff can upload thumbnails" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'article-thumbnails'
  and public.is_approved_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "staff can replace thumbnails" on storage.objects;
create policy "staff can replace thumbnails" on storage.objects
for update to authenticated
using (bucket_id = 'article-thumbnails' and public.is_approved_staff())
with check (bucket_id = 'article-thumbnails' and public.is_approved_staff());

drop policy if exists "staff can delete thumbnails" on storage.objects;
create policy "staff can delete thumbnails" on storage.objects
for delete to authenticated
using (bucket_id = 'article-thumbnails' and public.is_approved_staff());

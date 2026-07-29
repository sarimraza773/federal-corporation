-- Defense-in-depth hardening for the existing News publishing workflow.
-- Apply after 202607270001_news_articles.sql and 202607270002_add_article_author_name.sql.

-- Do not allow callers to use the helper to test another account's allowlist status.
create or replace function public.is_approved_staff(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select check_user_id = auth.uid()
    and exists (
      select 1
      from public.approved_staff
      where user_id = auth.uid()
    );
$$;

-- Preserve the authenticated creator as the audit owner of an article.
create or replace function public.protect_article_author_id()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.author_id is distinct from old.author_id then
    raise exception 'Article author_id cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists articles_protect_author_id on public.articles;
create trigger articles_protect_author_id
before update of author_id on public.articles
for each row execute function public.protect_article_author_id();

-- The private bucket already enforces a 5 MB maximum and the image MIME allowlist.
-- RLS additionally enforces user-scoped, safe-extension object paths.
drop policy if exists "staff can upload thumbnails" on storage.objects;
create policy "staff can upload thumbnails" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'article-thumbnails'
  and public.is_approved_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

-- The application replaces thumbnails by uploading a new random path. Prevent
-- in-place overwrites of objects that are already attached to an article.
drop policy if exists "staff can replace thumbnails" on storage.objects;
create policy "staff can replace thumbnails" on storage.objects
for update to authenticated
using (
  bucket_id = 'article-thumbnails'
  and public.is_approved_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
  and not exists (
    select 1 from public.articles where thumbnail_path = storage.objects.name
  )
)
with check (
  bucket_id = 'article-thumbnails'
  and public.is_approved_staff()
  and (storage.foldername(name))[1] = auth.uid()::text
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp', 'gif')
  and not exists (
    select 1 from public.articles where thumbnail_path = storage.objects.name
  )
);

-- A referenced object cannot be deleted, even if a compromised client skips
-- the application's reference check.
drop policy if exists "staff can delete thumbnails" on storage.objects;
create policy "staff can delete thumbnails" on storage.objects
for delete to authenticated
using (
  bucket_id = 'article-thumbnails'
  and public.is_approved_staff()
  and not exists (
    select 1 from public.articles where thumbnail_path = storage.objects.name
  )
);

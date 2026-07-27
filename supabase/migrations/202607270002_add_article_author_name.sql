-- Add public article bylines without disrupting existing production rows.
alter table public.articles
  add column if not exists author_name text;

update public.articles
set author_name = 'Rizvi & Rizvi'
where author_name is null or btrim(author_name) = '';

alter table public.articles
  alter column author_name set not null;

alter table public.articles
  drop constraint if exists articles_author_name_present;

alter table public.articles
  add constraint articles_author_name_present
  check (char_length(btrim(author_name)) between 1 and 120);

comment on column public.articles.author_name is
  'Human-readable public byline. author_id remains the authenticated staff account responsible for the operation.';

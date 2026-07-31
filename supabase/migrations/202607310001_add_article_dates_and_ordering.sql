-- Add date-only publication dates and persistent manual ordering to News.
-- Apply after the existing News migrations. Safe to run more than once.

alter table public.articles
  add column if not exists published_date date;

alter table public.articles
  add column if not exists sort_order integer;

-- Preserve the original record timestamp while giving legacy rows a date-only
-- public date. UTC makes the one-time conversion deterministic.
update public.articles
set published_date = (created_at at time zone 'UTC')::date
where published_date is null;

-- Keep any existing manual positions, then give every remaining legacy row a
-- stable sequential position using the required fallback order.
with ordered_articles as (
  select
    id,
    row_number() over (
      order by
        sort_order asc nulls last,
        published_date desc nulls last,
        created_at desc,
        id asc
    ) - 1 as position
  from public.articles
)
update public.articles as articles
set sort_order = ordered_articles.position
from ordered_articles
where articles.id = ordered_articles.id
  and articles.sort_order is distinct from ordered_articles.position;

alter table public.articles
  alter column published_date set default current_date,
  alter column published_date set not null,
  alter column sort_order set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.articles'::regclass
      and conname = 'articles_sort_order_unique'
  ) then
    execute '
      alter table public.articles
      add constraint articles_sort_order_unique
      unique (sort_order)
      deferrable initially deferred
    ';
  end if;
end;
$$;

create or replace function public.set_new_article_defaults()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.published_date is null then
    new.published_date = current_date;
  end if;

  if new.sort_order is null then
    lock table public.articles in share row exclusive mode;
    select coalesce(min(sort_order), 1) - 1
    into new.sort_order
    from public.articles;
  end if;

  return new;
end;
$$;

drop trigger if exists articles_set_new_defaults on public.articles;
create trigger articles_set_new_defaults
before insert on public.articles
for each row execute function public.set_new_article_defaults();

-- Swap two positions atomically. The frontend exposes this only inside the
-- protected staff area, and this function independently enforces the same
-- approved-staff authorization at the database boundary.
create or replace function public.swap_article_order(
  first_article_id uuid,
  second_article_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  first_order integer;
  second_order integer;
begin
  if not public.is_approved_staff() then
    raise exception 'Only approved staff can reorder articles'
      using errcode = '42501';
  end if;

  if first_article_id is null
    or second_article_id is null
    or first_article_id = second_article_id then
    raise exception 'Two different article IDs are required'
      using errcode = '22023';
  end if;

  select sort_order
  into first_order
  from public.articles
  where id = first_article_id
  for update;

  if not found then
    raise exception 'The first article no longer exists'
      using errcode = 'P0002';
  end if;

  select sort_order
  into second_order
  from public.articles
  where id = second_article_id
  for update;

  if not found then
    raise exception 'The second article no longer exists'
      using errcode = 'P0002';
  end if;

  update public.articles
  set sort_order = case id
    when first_article_id then second_order
    when second_article_id then first_order
  end
  where id in (first_article_id, second_article_id);
end;
$$;

revoke all on function public.swap_article_order(uuid, uuid) from public;
grant execute on function public.swap_article_order(uuid, uuid) to authenticated;

create index if not exists articles_manual_order_idx
  on public.articles (sort_order asc, published_date desc, created_at desc);

create index if not exists articles_published_manual_order_idx
  on public.articles (sort_order asc, published_date desc, created_at desc)
  where status = 'published';

comment on column public.articles.published_date is
  'Date-only public article date selected by staff.';

comment on column public.articles.sort_order is
  'Persistent manual article position; lower values appear first.';

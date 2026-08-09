-- Private storage and database-backed rate limiting for the public contact form.
-- Browser roles receive no table access. The Edge Function uses service-role
-- credentials and the narrowly granted function below.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new',
  notification_status text not null default 'pending',
  user_agent text,
  client_hash text not null,
  created_at timestamptz not null default now(),
  constraint contact_inquiries_name_length check (char_length(name) between 2 and 100),
  constraint contact_inquiries_email_length check (char_length(email) between 3 and 254),
  constraint contact_inquiries_email_normalized check (email = lower(btrim(email))),
  constraint contact_inquiries_email_format check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint contact_inquiries_message_length check (char_length(message) between 10 and 1800),
  constraint contact_inquiries_status check (status in ('new', 'in_progress', 'closed', 'spam')),
  constraint contact_inquiries_notification_status check (notification_status in ('pending', 'sent', 'failed')),
  constraint contact_inquiries_user_agent_length check (user_agent is null or char_length(user_agent) <= 500),
  constraint contact_inquiries_client_hash check (client_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);

create index if not exists contact_inquiries_client_rate_idx
  on public.contact_inquiries (client_hash, created_at desc);

alter table public.contact_inquiries enable row level security;

-- Intentionally create no RLS policies: anon and authenticated users cannot
-- select, insert, update, or delete rows through the public data API.
revoke all on table public.contact_inquiries from anon, authenticated;
grant all on table public.contact_inquiries to service_role;

create or replace function public.accept_contact_inquiry(
  p_name text,
  p_email text,
  p_message text,
  p_user_agent text,
  p_client_hash text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  inquiry_id uuid;
  recent_count integer;
  latest_submission timestamptz;
begin
  -- Serialize submissions for the same privacy-preserving client hash so
  -- concurrent requests cannot race around the cooldown.
  perform pg_advisory_xact_lock(hashtextextended(p_client_hash, 0));

  select count(*), max(created_at)
    into recent_count, latest_submission
  from public.contact_inquiries
  where client_hash = p_client_hash
    and created_at >= now() - interval '15 minutes';

  if recent_count >= 3
    or latest_submission >= now() - interval '60 seconds' then
    raise exception using errcode = 'P0001', message = 'contact_rate_limited';
  end if;

  insert into public.contact_inquiries (
    name,
    email,
    message,
    user_agent,
    client_hash
  ) values (
    p_name,
    p_email,
    p_message,
    nullif(p_user_agent, ''),
    p_client_hash
  )
  returning id into inquiry_id;

  return inquiry_id;
end;
$$;

revoke all on function public.accept_contact_inquiry(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.accept_contact_inquiry(text, text, text, text, text) to service_role;

comment on table public.contact_inquiries is
  'Private website contact inquiries; accessible only through trusted server-side operations.';
comment on column public.contact_inquiries.client_hash is
  'SHA-256 hash of a server-secret salt and best-available client address; no raw IP is stored.';

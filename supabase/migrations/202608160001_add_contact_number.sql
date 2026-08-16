-- Store and deliver the contact number collected by the public inquiry form.

alter table public.contact_inquiries
  add column if not exists contact_number text,
  add constraint contact_inquiries_contact_number_format
    check (
      contact_number is null
      or (
        char_length(contact_number) between 7 and 30
        and contact_number ~ '^\+?[0-9][0-9[:space:]().-]*$'
      )
    );

create or replace function public.accept_contact_inquiry(
  p_name text,
  p_email text,
  p_contact_number text,
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
    contact_number,
    message,
    user_agent,
    client_hash
  ) values (
    p_name,
    p_email,
    p_contact_number,
    p_message,
    nullif(p_user_agent, ''),
    p_client_hash
  )
  returning id into inquiry_id;

  return inquiry_id;
end;
$$;

revoke all on function public.accept_contact_inquiry(text, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.accept_contact_inquiry(text, text, text, text, text, text) to service_role;

comment on column public.contact_inquiries.contact_number is
  'Contact number supplied with the website inquiry.';

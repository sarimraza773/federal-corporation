-- Track the independently delivered visitor confirmation email. Confirmation
-- remains pending while ENABLE_VISITOR_CONFIRMATION is disabled.

alter table public.contact_inquiries
  add column confirmation_status text not null default 'pending',
  add column confirmation_sent_at timestamptz,
  add constraint contact_inquiries_confirmation_status
    check (confirmation_status in ('pending', 'sent', 'failed'));

comment on column public.contact_inquiries.confirmation_status is
  'Delivery state for the opt-in automated confirmation sent to the visitor.';
comment on column public.contact_inquiries.confirmation_sent_at is
  'Timestamp recorded after Resend accepts the visitor confirmation email.';

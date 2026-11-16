create schema if not exists booking_notifications;
revoke all on schema booking_notifications from public, anon, authenticated;

create table if not exists booking_notifications.email_outbox (
  booking_id bigint primary key references public.bookings(id) on delete cascade,
  queued_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table booking_notifications.email_outbox enable row level security;
revoke all on table booking_notifications.email_outbox from public, anon, authenticated;

create or replace function booking_notifications.enqueue_booking_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into booking_notifications.email_outbox (booking_id)
  values (new.id)
  on conflict (booking_id) do nothing;
  return new;
end;
$$;

revoke all on function booking_notifications.enqueue_booking_email() from public, anon, authenticated;

create or replace trigger bookings_enqueue_email
after insert on public.bookings
for each row
when (new.status = 'new')
execute function booking_notifications.enqueue_booking_email();

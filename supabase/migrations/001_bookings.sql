begin;

create table public.booking_owners (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.booking_owners enable row level security;
revoke all on public.booking_owners from public, anon, authenticated;

create function public.is_booking_owner()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.booking_owners where user_id = auth.uid());
$$;
revoke all on function public.is_booking_owner() from public, anon, authenticated;
grant execute on function public.is_booking_owner() to authenticated;

create table public.bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  customer_name text not null check (char_length(customer_name) between 1 and 100),
  customer_phone text not null check (customer_phone ~ '^[+]?[0-9]{10,15}$'),
  requested_service text not null check (char_length(requested_service) between 1 and 120),
  requested_date date not null,
  requested_time time not null,
  consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new', 'processed'))
);
create index bookings_phone_created_idx on public.bookings (customer_phone, created_at desc);
alter table public.bookings enable row level security;
revoke all on public.bookings from public, anon, authenticated;
grant select on public.bookings to authenticated;
grant update (status) on public.bookings to authenticated;
create policy booking_owner_select on public.bookings for select to authenticated
  using ((select public.is_booking_owner()));
create policy booking_owner_update on public.bookings for update to authenticated
  using ((select public.is_booking_owner()))
  with check ((select public.is_booking_owner()));

create function public.submit_booking(
  customer_name text, customer_phone text, requested_service text,
  requested_date date, requested_time time, consent_given boolean
)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  clean_name text := btrim(customer_name);
  clean_phone text := regexp_replace(customer_phone, '[^0-9]', '', 'g');
  clean_service text := btrim(requested_service);
begin
  if consent_given is distinct from true
     or coalesce(char_length(clean_name), 0) not between 1 and 100
     or coalesce(char_length(clean_phone), 0) not between 10 and 15
     or coalesce(char_length(clean_service), 0) not between 1 and 120
     or requested_date is null or requested_time is null
     or requested_date not between (now() at time zone 'Europe/Moscow')::date
                               and (now() at time zone 'Europe/Moscow')::date + 366
  then
    raise exception 'Invalid booking' using errcode = '22023';
  end if;

  -- Serialize repeat submissions for one number, including simultaneous retries.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(clean_phone, 0));
  if exists (
    select 1 from public.bookings b
    where b.customer_phone = clean_phone and b.requested_date = $4
      and b.requested_time = $5 and b.requested_service = clean_service
      and b.created_at > now() - interval '5 minutes'
  ) then
    return;
  end if;

  insert into public.bookings
    (customer_name, customer_phone, requested_service, requested_date, requested_time)
  values (clean_name, clean_phone, clean_service, $4, $5);
end;
$$;
revoke all on function public.submit_booking(text,text,text,date,time,boolean)
  from public, anon, authenticated;
grant execute on function public.submit_booking(text,text,text,date,time,boolean)
  to anon, authenticated;

commit;

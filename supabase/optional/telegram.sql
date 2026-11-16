-- Enable pg_net and add telegram_bot_token and telegram_chat_id to Vault first.
begin;
create function public.notify_booking_owner()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  bot_token text;
  chat_id text;
begin
  select decrypted_secret into bot_token from vault.decrypted_secrets
    where name = 'telegram_bot_token';
  select decrypted_secret into chat_id from vault.decrypted_secrets
    where name = 'telegram_chat_id';

  if bot_token ~ '^[0-9]+:[A-Za-z0-9_-]+$' and chat_id ~ '^-?[0-9]+$' then
    perform net.http_post(
      url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
      body := jsonb_build_object(
        'chat_id', chat_id,
        'text', 'КС Авто 26: новая заявка №' || new.id || '. Откройте кабинет сайта.'
      )
    );
  end if;
  return new;
exception when others then
  raise warning 'Could not queue booking notification';
  return new;
end;
$$;
revoke all on function public.notify_booking_owner() from public, anon, authenticated;
create trigger notify_booking_owner after insert on public.bookings
  for each row execute function public.notify_booking_owner();
commit;

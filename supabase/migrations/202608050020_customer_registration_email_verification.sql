-- Wow & Amazing — Phase 7N customer registration and verification support
-- Run after 202608040019_auto_hide_demo_properties.sql.
-- Safe additive update: preserves all users, profiles, orders, addresses, and products.

begin;

-- Keep the registration phone number supplied in Auth user metadata when the
-- public profile is created. Existing profile behaviour is preserved.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Backfill a phone number for accounts created during testing when it already
-- exists in Supabase Auth metadata but was not copied to public.profiles.
update public.profiles p
set phone = nullif(u.raw_user_meta_data ->> 'phone', ''),
    updated_at = now()
from auth.users u
where u.id = p.id
  and (p.phone is null or btrim(p.phone) = '')
  and nullif(u.raw_user_meta_data ->> 'phone', '') is not null;

commit;

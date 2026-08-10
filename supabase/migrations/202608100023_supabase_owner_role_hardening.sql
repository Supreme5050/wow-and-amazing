-- Wow & Amazing — Phase 8K Supabase owner-role hardening
-- Purpose:
-- 1) Keep the permanent admin/owner role in public.profiles.
-- 2) Keep everyday admin authorization database-backed through public.is_owner().
-- 3) Prevent authenticated customers from promoting themselves by writing profiles.role.
-- 4) Preserve normal customer profile editing for full_name, email and phone.
-- Safe additive hardening migration. Run after migration 022.

begin;

-- The role column/type were introduced by migration 006. Re-assert the
-- expected database-backed owner check used by the application and RLS.
create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'owner'::public.app_role
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

alter table public.profiles enable row level security;

-- IMPORTANT SECURITY HARDENING:
-- Earlier migrations granted authenticated users table-wide INSERT/UPDATE on
-- profiles. Once a role column exists, table-wide mutation privileges could
-- allow a signed-in customer to attempt to write role='owner'.
-- Replace them with column-level privileges that exclude role and all internal
-- business-control fields such as is_test_account.
revoke insert, update on table public.profiles from authenticated;

grant select on table public.profiles to authenticated;
grant insert (id, full_name, email, phone) on table public.profiles to authenticated;
grant update (full_name, email, phone) on table public.profiles to authenticated;

-- Server-only owner bootstrap/admin APIs continue to have full access.
grant select, insert, update, delete on table public.profiles to service_role;

-- Keep the existing row-level rules explicit and idempotent.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- Owner can read all profiles for customer/order administration.
drop policy if exists "Owners can read all profiles" on public.profiles;
create policy "Owners can read all profiles"
on public.profiles for select
to authenticated
using (public.is_owner());

comment on column public.profiles.role is
  'Server-managed authorization role. Customers must never be granted direct INSERT/UPDATE privileges on this column.';

commit;

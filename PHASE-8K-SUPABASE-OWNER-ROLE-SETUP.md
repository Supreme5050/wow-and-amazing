# Wow & Amazing — Phase 8K Supabase Owner Role Hardening

This phase makes Supabase `public.profiles.role` the permanent source of truth for owner/admin authorization.

## Important
- Everyday `/admin` access is determined by `profiles.role = 'owner'`.
- `ADMIN_OWNER_EMAIL` remains only as the one-time bootstrap safety check for `/admin/setup`.
- Authenticated customers can update their name/email/phone, but cannot write the `role` column.
- No customer/order/product data is deleted.

## Migration
Run only:

`supabase/migrations/202608100023_supabase_owner_role_hardening.sql`

## Promote the real owner
After the owner already exists in **Authentication > Users**, run this separately in SQL Editor, replacing the placeholder email:

```sql
insert into public.profiles (id, full_name, email, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), 'Store Owner'),
  u.email,
  'owner'::public.app_role
from auth.users u
where lower(u.email) = lower('OWNER_EMAIL_HERE')
on conflict (id) do update set
  email = excluded.email,
  full_name = coalesce(public.profiles.full_name, excluded.full_name),
  role = 'owner'::public.app_role,
  updated_at = now();
```

## Verify

```sql
select
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name
from auth.users u
left join public.profiles p on p.id = u.id
where lower(u.email) = lower('OWNER_EMAIL_HERE');
```

Expected role: `owner`.

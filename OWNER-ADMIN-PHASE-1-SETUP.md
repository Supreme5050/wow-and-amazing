# Wow & Amazing — Owner Admin Phase 1 Setup

This build adds a private `/admin` owner dashboard, Supabase owner-role security, product image uploads, product CRUD, live Supabase catalog loading, order management, and stock updates after successful checkout.

## Required environment value

Keep all existing values in `.env.local` and add:

```env
ADMIN_OWNER_EMAIL=your-real-owner-email@example.com
```

The email used at `/admin/login` must match this value exactly.

## Supabase migration

Run only this new migration after the earlier project migrations:

```text
supabase/migrations/202607140006_owner_admin_foundation.sql
```

It is additive. It does not drop the existing catalog, customers, carts, or orders.

## Owner access

1. Start the site.
2. Open `http://localhost:3004/admin/login`.
3. For a new owner account, choose **First-time setup**.
4. Use the exact email configured in `ADMIN_OWNER_EMAIL`.
5. Confirm the email if Supabase email confirmation is enabled.
6. Sign in and open the private owner dashboard.

# Wow & Amazing — Phase 8E Live Data Cutover

This phase removes demonstration information from every main public/admin view and switches reporting to genuine records only.

## What the migration does

- Marks every order, payment attempt, customer interaction, review, enquiry, contact message and subscriber that already exists at the time of migration as test data.
- Marks all supplied seed products (fixed UUID prefixes 20000000, 21000000, 22000000 and 23000000) as demo records and unpublishes them.
- Preserves every old record in Supabase for audit; nothing is deleted.
- Prevents the supplied seed product UUIDs from becoming public again if an old seed migration is accidentally rerun.
- Makes the storefront, search, homepage, product ratings, dashboard metrics, charts, orders, payments, reviews, enquiries and subscribers use live records only.
- Keeps local/Paystack-test activity labelled as test data.
- Lets production customer accounts and live Paystack orders become real data automatically.

## Expected result immediately after migration

The admin dashboard may show zero revenue, zero orders and zero customers. The catalog total will show only products or rental properties created by the owner, not supplied starter records. This is correct: the system no longer invents business activity.

## Data mode

Keep local development in test mode:

```env
NEXT_PUBLIC_DATA_MODE=test
```

For the final Vercel production deployment, set:

```env
NEXT_PUBLIC_DATA_MODE=live
```

Do not set live mode while using a Paystack `sk_test_` secret key. The server also detects Paystack test keys and keeps those payment records out of live reporting.

## Migration

Run only:

```text
supabase/migrations/202608050021_live_data_cutover.sql
```

Do not rerun migrations 001–020.

## Real data workflow

1. Add genuine products/properties from `/admin/products/new`.
2. Publish them; they appear on the storefront and in Catalog Items immediately.
3. Real production customer registrations populate Customers.
4. Successful live Paystack payments populate Revenue, Orders, charts and Recent Orders.
5. Genuine enquiries, reviews and newsletter signups populate their admin pages automatically.

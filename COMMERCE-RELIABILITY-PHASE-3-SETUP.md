# Wow & Amazing — Commerce Reliability Phase 3

This phase hardens payment and order handling before public launch.

## Included

- Server-side Paystack transaction initialization.
- Server-side Paystack verification before an order is created.
- Signed Paystack webhook endpoint at `/api/payments/paystack/webhook`.
- Idempotent order finalization: the same payment reference cannot create duplicate orders.
- Atomic database order creation, order-item creation, and stock reduction.
- Payment-attempt records for reconciliation.
- Owner Payments page at `/admin/payments`.
- Owner can re-check a payment directly with Paystack.
- Paid transactions that cannot be fulfilled are marked `review_required` instead of silently failing.
- Order payment details and fulfilment status history in `/admin/orders`.
- Dedicated `/checkout/complete` confirmation page.

## Supabase migration

Run only:

`supabase/migrations/202607150009_commerce_reliability.sql`

CMD clipboard command:

```cmd
type "supabase\migrations\202607150009_commerce_reliability.sql" | clip
```

## Environment

Required values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_SITE_URL=http://localhost:3004
PAYSTACK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_PAYSTACK_CURRENCY=USD
ADMIN_OWNER_EMAIL=...
```

`NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` may remain in the file, but this phase initializes transactions securely from the server using `PAYSTACK_SECRET_KEY`.

## Paystack webhook

After deployment, configure this URL in the Paystack dashboard:

`https://YOUR-DOMAIN.com/api/payments/paystack/webhook`

A localhost URL cannot receive Paystack webhook events. The normal callback verification still allows local test-payment testing.

## Verification

```cmd
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

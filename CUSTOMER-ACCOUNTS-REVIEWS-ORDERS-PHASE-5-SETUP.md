# Wow & Amazing — Customer Accounts, Reviews & Orders Phase 5

This phase completes the remaining customer-account and post-purchase experience before the motion, visual-correction, final-QA, and deployment stages.

## Included

### Customer account

- Profile editing for full name, phone number, and email-change requests.
- Logged-in password change.
- Forgot-password email flow.
- Secure password-recovery form inside `/account?mode=recovery`.
- Improved account dashboard and navigation.

### Saved delivery addresses

- Add several addresses.
- Edit and delete addresses.
- Mark one address as the default.
- Automatic default-address reassignment after deletion.
- Select a saved address during checkout.
- Save a new checkout address to the customer account.

### Customer orders

- Improved `/account/orders` order cards.
- Individual `/account/orders/[id]` detail pages.
- Product images, variants, quantities, totals, payment information, and delivery details.
- Customer-visible order progress and fulfilment timeline.
- Owner timeline notes from `/admin/orders`.
- Improved public `/track-order` result with items and status history.

### Verified customer reviews

- Real Supabase review comments and rating averages.
- Only a customer with a confirmed paid order containing the product may review it.
- One review per customer per product, with editing and deletion.
- Owner response displayed publicly beneath the review.
- Private `/admin/reviews` moderation page for publishing, hiding, responding, and deleting.

## Supabase migration

Run only:

```text
supabase/migrations/202607150012_customer_accounts_reviews_orders.sql
```

The migration is additive. It preserves existing products, customers, orders, payments, services, enquiries, subscribers, and owner data.

## CMD merge command

```cmd
set "PROJECT=%USERPROFILE%\Desktop\Wow-and-Amazing"
if not exist "%PROJECT%" mkdir "%PROJECT%"
tar -xf "%USERPROFILE%\Downloads\Wow-and-Amazing-Customer-Accounts-Reviews-Orders-Phase-5.zip" -C "%PROJECT%"
cd /d "%PROJECT%"
```

## CMD SQL clipboard command

```cmd
type "supabase\migrations\202607150012_customer_accounts_reviews_orders.sql" | clip
```

Paste the copied SQL into the existing Supabase project's SQL Editor and run it once.

## Supabase password-reset redirect

In the Supabase project, open Authentication → URL Configuration and add this local redirect URL:

```text
http://localhost:3004/account?mode=recovery
```

When the site is deployed, also add the production equivalent:

```text
https://YOUR-DOMAIN/account?mode=recovery
```

## CMD verification

```cmd
cd /d "%USERPROFILE%\Desktop\Wow-and-Amazing"
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if exist node_modules rmdir /s /q node_modules
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## Test routes

```text
http://localhost:3004/account
http://localhost:3004/account/addresses
http://localhost:3004/account/orders
http://localhost:3004/track-order
http://localhost:3004/admin/orders
http://localhost:3004/admin/reviews
```

## Recommended test order

1. Sign in as a normal customer, not the owner.
2. Edit the customer profile.
3. Add two addresses and make one the default.
4. Add a product to the cart and confirm the default address appears during checkout.
5. Complete a Paystack test payment while signed in.
6. Open the new order under `/account/orders` and inspect the order timeline.
7. Open the purchased product and submit a review.
8. Sign in as the owner and moderate or respond to the review at `/admin/reviews`.
9. Update the order status and add a customer-visible timeline note at `/admin/orders`.
10. Confirm the customer order page and public Track Order page show the update.

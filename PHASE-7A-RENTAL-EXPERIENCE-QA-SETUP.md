# Wow & Amazing — Phase 7A Rental Experience & QA Foundation

This additive update keeps the existing storefront, products, Paystack flow, Supabase data, owner dashboard, cinematic pages, and housing collection.

## Included

- Dedicated rental availability states: Available, Reserved, Rented.
- Owner controls for rental availability in Admin → Products.
- Server-side prevention of checkout for reserved or rented properties.
- Automatic display of Rented when rental stock reaches zero after successful payment.
- Rental-specific property cards, product detail facts, and line icons.
- Rental-only checkout wording with no shipping language or shipping fee.
- Mixed product + rental checkout support with shipping calculated only on physical products.
- Fixed quantity of one for each property listing.
- Rental-aware cart drawer, cart page, Paystack metadata, and availability errors.
- No changes to ordinary product quantities, checkout, delivery, or stock behaviour.

## Required SQL

Run only:

`supabase/migrations/202608010017_rental_availability_and_checkout.sql`

Do not rerun migrations 001–016.

## Verification

Run from the project folder:

```cmd
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## Rental test flow

1. Open `/category/housing-decor?collection=houses-for-rent#products`.
2. Open an available house.
3. Confirm the property facts, availability badge, and `Rent this property` button.
4. Add the property and verify quantity is fixed at one.
5. Open `/checkout` and confirm rental-only wording has no shipping step or shipping charge.
6. In Admin → Products, mark a property Reserved and confirm checkout is blocked.
7. Mark it Available again and complete a Paystack test payment.
8. Confirm stock becomes zero and the public listing displays Rented.

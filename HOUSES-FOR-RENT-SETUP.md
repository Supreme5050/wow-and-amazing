# Wow & Amazing — Houses for Rent

Adds a new **Houses for Rent** collection inside the existing **Housing & Decor** department, so customers can browse available homes and rent one by paying in full at checkout — exactly like buying any other product.

## How it works

- Houses are stored as ordinary `products` rows (category: Housing & Decor, collection: `houses-for-rent`). No new tables, no schema changes.
- Each listing has one "Standard" option with `stock_qty = 1`. Renting a house pays the full price immediately through the existing Paystack checkout, and stock drops to 0 — the listing automatically shows as "Out of Stock" until you reset it from the owner dashboard.
- Bedrooms, bathrooms, location and amenities are written into the product description (no new fields), the same way every other product describes itself.
- The new "Houses for Rent" tab appears automatically on `/category/housing-decor` and on the Housing & Decor cinematic page (`/experiences/home-decor`) because both pages read their tabs from `src/data/categoryMerchandising.ts`.
- You can add, edit, or unpublish houses at any time from the existing **Admin → Products** dashboard — pick "Housing & Decor" as the category and "Houses for Rent" as the collection. No code changes needed for new listings.

## What was added

- `supabase/migrations/202607280015_housing_rentals.sql` — seeds 6 example listings (duplex, studio, bungalow, flat, mansion, mini flat).
- `supabase/migrations/202607280016_housing_rental_details.sql` — adds optional `rental_bedrooms`, `rental_bathrooms`, `rental_location`, `rental_size_label`, `rental_property_type` columns to `products` (null for every non-rental product) and backfills the 6 example listings.
- `src/data/catalog.ts` — matching fallback copies of the same 6 listings, for when Supabase isn't reachable.
- `src/data/categoryMerchandising.ts` — registers the "Houses for Rent" collection tab under Housing & Decor.
- `public/catalog/products/rental-*.webp` — 5 new illustrated listing images (branded placeholders in the site's style; swap for real property photos any time via Admin → Products).
- Product page and product cards now show bedrooms / bathrooms / size / location / property type as labeled fields whenever a listing has them set — invisible on every other product, since those fields stay null there.
- **Admin → Products → Edit** now shows a "Rental details" section (bedrooms, bathrooms, property type, size, location) whenever the "Houses for Rent" collection is selected, so the owner can fill these in for every new listing without any code changes.

## Running both new migrations

Run them in order (the filenames sort correctly, so pasting them one after another into the SQL editor works fine):

```
supabase/migrations/202607280015_housing_rentals.sql
supabase/migrations/202607280016_housing_rental_details.sql
```

If migration `202607280015` was already run before, it's safe to skip straight to `202607280016` — it only adds new columns and updates the 6 example rows.

## Database

Run the new migration against your Supabase project (via the Supabase CLI or the SQL editor):

```
supabase/migrations/202607280015_housing_rentals.sql
```

It's additive and idempotent — safe to run more than once. No existing product, order, payment, customer, or Supabase data is affected.

## Required verification

```cmd
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## Known cosmetic note

Checkout still labels the address step "Delivery address" and shows a "Shipping" line (since houses reuse the exact same checkout as every other product, as requested). It doesn't affect payment or order creation — just wording. Say the word if you'd like that reworded for rentals later.

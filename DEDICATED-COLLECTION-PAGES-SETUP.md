# Wow & Amazing — Dedicated Collection Pages Upgrade

This upgrade turns every category card into a real, shareable shopping collection.

## Customer experience

Examples:

- `/category/gadgets-accessories/phone-accessories`
- `/category/gadgets-accessories/wireless-audio`
- `/category/creator-kits/microphones`
- `/category/restaurant-food/family-portions`
- `/category/housing-decor/soft-furnishings`
- `/category/cinematography/lighting-grip`

Each collection page includes a premium hero, breadcrumbs, product statistics, filters, sorting, related collections, and a direct link to the existing cinematic gateway.

## Owner experience

The product editor now includes a **Product collection** field. The owner chooses both:

1. Main category
2. Product collection

That selection controls the exact collection page where the product appears.

## Database migration

Run only:

`supabase/migrations/202607190014_dedicated_collection_pages.sql`

The migration:

- Adds `products.subcategory_slug`
- Assigns existing products to suitable collections
- Adds a collection lookup index
- Adds more starter product varieties
- Preserves existing customers, orders, payments, products and owner accounts

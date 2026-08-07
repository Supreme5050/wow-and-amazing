# Wow & Amazing — Single-Step Cinematic Catalogue Finalisation

This final storefront-flow update removes unnecessary intermediate collection screens while preserving every existing route, product, owner, cart, checkout, payment, order, review, service and cinematic feature.

## New customer flow

- A cinematic page remains the premium visual introduction.
- Product types now appear as compact filter tabs immediately above the products.
- Clicking a type filters the products on the same page and scrolls directly to them.
- Department pages use the same one-click collection filtering.
- Old dedicated collection URLs safely redirect to the matching department and selected collection.

## Database

No Supabase migration is required for this update.

## Required verification

```cmd
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

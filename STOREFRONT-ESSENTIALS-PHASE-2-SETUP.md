# Wow & Amazing — Storefront Essentials Phase 2

This phase adds the public product-search experience, newsletter subscriber capture, owner subscriber management, and the locked sticky-header behaviour.

## New public functionality

- Header search opens an inline desktop panel and a full-screen mobile overlay.
- Suggestions are debounced by 300ms.
- Search uses Supabase/Postgres ranked search when migration 008 is installed.
- Enter and “See all results” route to `/search?q=`.
- Empty search and no-result states always show a message.
- Footer newsletter signup stores validated email addresses in Supabase.
- The header becomes fixed with a subtle shadow after the hero is passed.

## New owner functionality

- `/admin/subscribers` lists newsletter subscribers.
- Subscriber search is available.
- The owner can export the visible list as CSV.

## Supabase migration

Run only:

`supabase/migrations/202607140008_storefront_search_and_subscribers.sql`

The migration is additive and does not delete or reset data.

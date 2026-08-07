# Wow & Amazing — Category Catalog Lint Hotfix

This hotfix removes the synchronous `setState` call from a React effect in `CategoryCatalog.tsx`.

It also adds a stable `key` to the category page so a direct collection URL can remount the catalogue with the correct initial collection without needing the effect.

No database migration is required.
No environment variables are changed.
No product, order, payment, customer, or Supabase data is affected.

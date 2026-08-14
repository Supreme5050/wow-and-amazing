# Wow & Amazing — Phase 8M Navigation Click Reliability Hotfix

This patch makes the affected navigation use native browser anchors instead of client-intercepted Next.js Link navigation.

Changed files:
- src/components/admin/AdminShell.tsx
- src/components/catalog/ProductCard.tsx

Fixes:
- Admin sidebar navigation reliably opens Dashboard, Notifications, Products, Orders, Payments, Enquiries, Reviews, Services, and Subscribers.
- Admin header/store links use native navigation.
- Product image, product title, and View details reliably open the product page.
- No database, Supabase, Paystack, product data, or design changes.

No SQL migration is required.

# Wow & Amazing — Phase 8B Admin Analytics Charts

This update adds live charts to the private owner dashboard without changing storefront, payment, authentication, products, rentals, orders or Supabase schema.

## Added

- Six-month paid revenue trend chart.
- Monthly order counts displayed beneath the trend.
- Live order-status doughnut chart.
- Status percentages and totals.
- Responsive desktop, tablet and mobile layouts.
- Empty states for stores with no orders yet.

The charts read real order records from the existing `orders` table through the protected `/api/admin/overview` endpoint. No sample chart figures are hardcoded.

## Installation

Extract the ZIP into the existing project folder, clear `.next`, then run:

```cmd
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

No Supabase SQL migration is required.

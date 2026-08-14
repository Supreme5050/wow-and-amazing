# Wow & Amazing — Phase 8N Notification Open Action Fix

This hotfix corrects the confusing Open action in Admin → Notifications.

## What was happening
The vendor notification test record deliberately points to `/admin/notifications` because it has no order, payment, or enquiry record behind it. Since the owner is already on `/admin/notifications`, clicking **Open** appeared to do nothing.

## What changed
- Test notifications now show **Test complete** instead of a misleading Open link.
- Real notifications keep an **Open** action.
- Real notification actions use normal browser navigation for reliability:
  - paid order → Orders
  - service enquiry/contact message → Enquiries
  - payment review → Payments
  - low stock → Products
- No database migration is required.
- No notification delivery logic, Brevo configuration, Twilio configuration, Paystack logic, or Supabase data is changed.

## Verify
Run from the project root:

```cmd
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npx next typegen
npm run lint
npx tsc --noEmit
npm run build
```

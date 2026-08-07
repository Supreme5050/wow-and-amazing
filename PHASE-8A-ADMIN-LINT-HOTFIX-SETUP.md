# Phase 8A Admin Lint Hotfix

This hotfix removes an obsolete ESLint disable comment from `src/components/admin/AdminShell.tsx`.

No UI, authentication, Supabase, Paystack, product, order, or admin functionality changes are included.

After extraction, run:

```cmd
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

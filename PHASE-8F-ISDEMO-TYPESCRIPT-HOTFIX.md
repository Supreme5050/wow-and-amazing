# Phase 8F TypeScript Hotfix — ProductSeed.isDemo

This hotfix restores the optional `isDemo?: boolean` field to `ProductSeed` in `src/data/catalog.ts`.

Why: Phase 8E's live-data catalog mapper returns `isDemo`, and filters real vs demo rental listings using that property. If an older `catalog.ts` remained in the local project, TypeScript rejects the `isDemo` property during `next build`.

No database or Supabase migration is required.

After extracting, run:

```cmd
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

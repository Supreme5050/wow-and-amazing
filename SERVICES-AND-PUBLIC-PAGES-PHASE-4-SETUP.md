# Wow & Amazing — Services & Public Pages Phase 4

This phase adds the complete creative-services module and closes the remaining required public-page gaps.

## Included

- Public `/services` page with the four locked service names.
- Service details, deliverables, turnaround, optional starting price, and enquiry flow.
- Private `/admin/services` management page.
- Private `/admin/inquiries` inbox for service enquiries and contact messages.
- Public `/about`, `/contact`, and `/support` pages.
- Working contact form stored in Supabase.
- Help, privacy, terms, and shipping/returns guidance consolidated on `/support` so the public sitemap is not expanded with unapproved pages.
- Footer legal links corrected to the support-page sections.
- Track-order and customer-order totals corrected to display the configured store currency.

## Supabase migration

Run only:

```text
supabase/migrations/202607150011_services_and_public_pages.sql
```

The migration is additive. It preserves existing products, customers, orders, payments, and owner data.

## CMD merge command

```cmd
set "PROJECT=%USERPROFILE%\Desktop\Wow-and-Amazing"
if not exist "%PROJECT%" mkdir "%PROJECT%"
tar -xf "%USERPROFILE%\Downloads\Wow-and-Amazing-Services-Public-Pages-Phase-4.zip" -C "%PROJECT%"
cd /d "%PROJECT%"
```

## CMD SQL clipboard command

```cmd
type "supabase\migrations\202607150011_services_and_public_pages.sql" | clip
```

Paste into the existing Supabase project's SQL Editor and run it once.

## CMD verification

```cmd
cd /d "%USERPROFILE%\Desktop\Wow-and-Amazing"
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if exist node_modules rmdir /s /q node_modules
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## Test routes

```text
http://localhost:3004/services
http://localhost:3004/about
http://localhost:3004/contact
http://localhost:3004/support
http://localhost:3004/admin/services
http://localhost:3004/admin/inquiries
```

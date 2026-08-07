# Wow & Amazing — Premium Commerce UI Overhaul

This package changes the actual Next.js website interface. It is not an image mock-up.

## Preserved

- Supabase connection and existing database
- Owner dashboard and permissions
- Product upload, stock and variants
- Cart and wishlist logic
- Paystack checkout and order creation
- Services, enquiries, reviews and customer accounts
- Existing routes and cinematic category pages

## Redesigned

- Premium split e-commerce homepage hero using a live featured product
- More organised navigation and mega-menu presentation
- Editorial category collection grid
- Larger premium product cards and catalogue grid
- Refined filters, sorting toolbar and catalogue header
- Full premium customer account dashboard inspired by the supplied reference
- Account sidebar, welcome banner, stats, quick actions, recent orders, wishlist preview, saved address and profile sections
- Responsive mobile/tablet layouts
- Light premium footer and improved spacing throughout

## SQL

No Supabase SQL migration is required for this interface-only update.

## Windows CMD installation

```cmd
set "PROJECT=%USERPROFILE%\Desktop\Wow-and-Amazing"
tar -xf "%USERPROFILE%\Downloads\Wow-and-Amazing-Premium-Commerce-UI-Overhaul.zip" -C "%PROJECT%"
cd /d "%PROJECT%"

taskkill /F /IM node.exe 2>nul
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if exist node_modules rmdir /s /q node_modules

npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/
npm ci --registry=https://registry.npmjs.org/
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Open `http://localhost:3004`.

# Wow & Amazing — Reference-Accurate Premium Commerce Redesign

This package rebuilds the live storefront to closely follow the nine supplied premium e-commerce reference screens while preserving the existing Wow & Amazing product categories, cinematic gateways, Supabase data, Paystack checkout, owner dashboard, customer accounts, orders, wishlist, reviews, services and enquiries.

## Main visual changes

- Compact black announcement bar.
- Stable premium white header with visible desktop search field.
- Full-width editorial hero using the existing Gadgets cinematic artwork.
- Six-department image ribbon linked to the correct cinematic storefronts.
- Best-seller product grid with premium promotional editorial cards.
- Five-part assurance strip.
- New-arrivals and customer-story layout.
- Compact branded newsletter band.
- More refined service cards.
- Reference-inspired catalog banner, department tabs, filters and product grid.
- Reference-inspired product detail, cart, checkout, wishlist, account and admin styling.
- Cinematic pages retained and visually refined.
- Hydration-warning suppression added around the root and footer areas commonly modified by browser security extensions.

## Supabase

No SQL migration is included or required. This is a UI and layout package only.

## Windows CMD installation

```cmd
set "PROJECT=%USERPROFILE%\Desktop\Wow-and-Amazing"
if not exist "%PROJECT%" mkdir "%PROJECT%"
tar -xf "%USERPROFILE%\Downloads\Wow-and-Amazing-Reference-Accurate-Premium-Commerce.zip" -C "%PROJECT%"
cd /d "%PROJECT%"
```

Clean and install:

```cmd
taskkill /F /IM node.exe 2>nul
npm config delete proxy
npm config delete https-proxy
npm config set registry https://registry.npmjs.org/
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if exist node_modules rmdir /s /q node_modules
npm cache verify
npm ci --registry=https://registry.npmjs.org/
```

Verify:

```cmd
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Open `http://localhost:3004`.

## Important test routes

- `/`
- `/category/all`
- `/product/wireless-earbuds-pro`
- `/cart`
- `/checkout`
- `/wishlist`
- `/account`
- `/admin`
- `/experiences/gadgets`
- `/experiences/food`
- `/experiences/creators`
- `/experiences/home-decor`

## Browser extension note

The terminal warning containing `bis_skin_checked` is commonly injected by antivirus/password-manager browser extensions rather than the website. Root and footer hydration suppression are included, but if the warning persists in development, temporarily disable the extension for `localhost:3004` and refresh.

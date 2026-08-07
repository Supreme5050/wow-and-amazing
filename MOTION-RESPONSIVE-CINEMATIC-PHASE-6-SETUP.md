# Wow & Amazing — Phase 6 Setup

## Phase
Motion, responsive polishing, and cinematic category refinements.

## Included
- Framer Motion installed and configured.
- Locked hero stagger animation.
- Scroll reveal and 80ms sibling staggering for trust, category, product, service, and cinematic collection cards.
- Wishlist heart scale-pop.
- Cart badge scale-bounce.
- Animated mobile navigation drawer.
- Animated mini-cart drawer and backdrop.
- Smooth cart line-item entry/removal.
- Sticky-header transition retained and polished.
- Reduced-motion accessibility support.
- Active navigation states.
- Premium button, card, image, and focus transitions.
- Mobile checkout, cart, account, orders, search, and catalog refinements.
- Tablet grid refinements.
- Cinematic hero crop adjustments for gadgets, food, creators, and home decor.
- Consistent local production port 3004.

## Database
No Supabase SQL migration is required for Phase 6.

## CMD extraction
```cmd
set "PROJECT=%USERPROFILE%\Desktop\Wow-and-Amazing"
if not exist "%PROJECT%" mkdir "%PROJECT%"
tar -xf "%USERPROFILE%\Downloads\Wow-and-Amazing-Motion-Responsive-Cinematic-Phase-6.zip" -C "%PROJECT%"
cd /d "%PROJECT%"
```

## Verification
```cmd
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
if exist node_modules rmdir /s /q node_modules
npm ci
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## Main test pages
- http://localhost:3004
- http://localhost:3004/experiences/gadgets
- http://localhost:3004/experiences/food
- http://localhost:3004/experiences/creators
- http://localhost:3004/experiences/home-decor
- http://localhost:3004/category/all
- http://localhost:3004/cart
- http://localhost:3004/checkout
- http://localhost:3004/account
- http://localhost:3004/admin

## Acceptance checks
- Hero content enters in order: eyebrow, title, text, buttons.
- Cards reveal quietly on scroll.
- Wishlist heart pops when selected.
- Cart badge animates when quantity changes.
- Cart and mobile navigation slide correctly.
- Keyboard focus is visible.
- Reduced-motion preference removes movement effects.
- Mobile and tablet layouts do not overflow horizontally.
- All existing products, payments, orders, Supabase data, and owner controls remain intact.

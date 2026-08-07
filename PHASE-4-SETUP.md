# Wow & Amazing — Phase 4 setup

## Included
- Guest cart with localStorage persistence
- Logged-in cart and wishlist synchronization with Supabase
- Header cart/wishlist badges
- Right-side mini-cart
- Full cart and wishlist pages
- Supabase sign-in/create-account page
- Orders and addresses pages
- Checkout flow with Paystack integration
- Secure server-side Paystack verification and order creation
- Public order tracking

## Environment
Copy `.env.example` to `.env.local` and enter the real values.
Never expose `SUPABASE_SERVICE_ROLE_KEY` or `PAYSTACK_SECRET_KEY` in browser code.

## Database
Run `supabase/migrations/202607130005_phase4_commerce.sql` after migrations 001–004.

CMD clipboard command:

```cmd
clip < "supabase\migrations\202607130005_phase4_commerce.sql"
```

## Verification

```cmd
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Development URL: http://localhost:3004

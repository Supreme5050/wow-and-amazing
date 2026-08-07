# Wow & Amazing — Paystack NGN Currency Hotfix

This hotfix corrects the `Currency not supported by merchant` error for a standard Nigerian Paystack account.

## Cause

The storefront was sending `USD` to Paystack. A Nigerian Paystack account can only accept USD after USD settlement has been enabled on the merchant account. Standard Nigerian merchant accounts should initialize transactions in `NGN`.

## Changes

- Default checkout/payment currency changed from USD to NGN.
- Product cards, product pages, cart, checkout, search, and admin money displays now use the same configured currency.
- Product editor labels show the active currency.
- Paystack currency errors now explain the required correction.
- Database currency defaults changed to NGN without deleting existing records.

## Required local environment value

```env
NEXT_PUBLIC_PAYSTACK_CURRENCY=NGN
```

Restart the Next.js server after changing `.env.local`.

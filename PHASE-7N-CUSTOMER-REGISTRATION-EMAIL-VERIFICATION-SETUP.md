# Wow & Amazing — Phase 7N Customer Registration & Email Verification

This phase completes the public customer account journey without changing guest shopping or the private admin area.

## Included

- Premium sign-in and registration interface
- Full name, email, phone, password confirmation, and consent fields
- Supabase email confirmation redirect callback
- Check-your-email screen
- Resend verification flow
- Friendly expired/invalid link state
- Forgot-password and reset-password flow
- Permanent wishlist/cart merging after sign-in
- Verified badge in the customer account
- Verified email requirement for order history and saved addresses
- Verified account requirement for all property rental and mixed rental checkouts
- Server-side Paystack initialization protection for rental payments
- Ordinary product guest checkout remains available

## Supabase dashboard configuration

Open Supabase Dashboard → Authentication.

### Email provider

Under Providers → Email:

- Enable Email provider
- Enable Confirm email
- Keep password-based sign-in enabled

### URL configuration

Set Site URL during local testing to:

`http://localhost:3004`

Add this Redirect URL:

`http://localhost:3004/auth/callback`

After Vercel deployment, also add:

`https://YOUR-DOMAIN.com/auth/callback`

and change Site URL to the production domain.

### Email templates

The branded templates are already included in:

- `supabase/email-templates/confirm-signup.html`
- `supabase/email-templates/reset-password.html`
- `supabase/email-templates/change-email.html`
- `supabase/email-templates/magic-link.html`

Copy each HTML file into its matching Supabase Authentication → Email Templates section when ready.

### SMTP note

The application flow is complete, but production customer delivery requires a reliable custom SMTP sender. The built-in Supabase mail service is suitable only for limited testing. Keep the existing Brevo work paused until the branded domain/sender is ready, then connect the verified sender in Authentication → SMTP Settings.

## Test checklist

1. Create a customer account.
2. Confirm the Check Your Email page appears.
3. Click the newest confirmation link.
4. Confirm the callback redirects to Account Activated or Checkout.
5. Sign out and sign in again.
6. Test Forgot Password and create a new password.
7. Test ordinary product checkout without signing in.
8. Add a property rental and confirm checkout requires a verified account.
9. Sign in with a verified account and confirm rental checkout opens.
10. Confirm order history, addresses, wishlist merge, and sign-out work.

# Wow & Amazing — Email, Navigation & Stock Hotfix

## What this package fixes

- Adds **Home** to desktop and mobile navigation.
- Replaces raw Supabase password-reset wording with Wow & Amazing wording.
- Converts the raw `email rate limit exceeded` error into a useful customer message.
- Prevents repeated reset submissions while a request is being sent.
- Removes invalid, zero-quantity, and out-of-stock cart lines during cart reconciliation.
- Prevents zero-quantity items from appearing at checkout.
- Shows low-stock information professionally.
- Gives customers a clear refresh/review action if stock changes before payment.

## Important: branded email sender setup

The website code cannot choose the sender by itself. Supabase Auth sends the email, so configure a custom SMTP provider in the Supabase dashboard.

You need SMTP details from a provider such as Resend, Brevo, Postmark, SendGrid, AWS SES, or another SMTP-compatible service:

- SMTP host
- SMTP port
- SMTP username
- SMTP password
- Verified sender email

Recommended production identity:

- Sender name: `Wow & Amazing`
- Sender email: `no-reply@your-live-domain.com`

The email address must be verified by the SMTP provider. Do not invent an address on a domain you do not control.

### Supabase dashboard

1. Open the Wow & Amazing Supabase project.
2. Go to **Authentication**.
3. Open **Emails / SMTP Settings** (the exact wording may vary slightly).
4. Enable **Custom SMTP**.
5. Enter the SMTP host, port, username, and password from the email provider.
6. Set sender name to `Wow & Amazing`.
7. Set the verified sender address.
8. Save the configuration.
9. Open **Authentication → Rate Limits** and set a sensible email limit after custom SMTP is active.

## Branded templates

Files are provided in:

`supabase/email-templates/`

In Supabase go to **Authentication → Email Templates** and paste the matching HTML:

- Reset Password → `reset-password.html`
- Confirm Signup → `confirm-signup.html`
- Magic Link → `magic-link.html`
- Change Email Address → `change-email.html`

Suggested subjects:

- Reset Password: `Reset your Wow & Amazing password`
- Confirm Signup: `Welcome to Wow & Amazing — confirm your email`
- Magic Link: `Your secure Wow & Amazing sign-in link`
- Change Email: `Confirm your new Wow & Amazing email address`

Disable link tracking in the external email provider for authentication emails because tracking can rewrite secure links.

## SQL

This hotfix has no database migration. Do not run any SQL for it.

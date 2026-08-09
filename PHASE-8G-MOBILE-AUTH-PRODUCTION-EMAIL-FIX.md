# Phase 8G — Mobile Auth + Production Email Fix

This patch improves mobile storefront/auth presentation, adds show/hide password controls, and makes all confirmation/reset/resend URLs prefer `NEXT_PUBLIC_SITE_URL` so production email links consistently return to `https://itsamazing.com.ng`.

## Supabase production settings required

Authentication → URL Configuration
- Site URL: `https://itsamazing.com.ng`
- Redirect URLs:
  - `https://itsamazing.com.ng/auth/callback`
  - `https://www.itsamazing.com.ng/auth/callback`
  - `https://wow-and-amazing.vercel.app/auth/callback`
  - `http://localhost:3004/auth/callback`

Authentication → Sign In / Providers → Email
- Email enabled
- Allow new users enabled
- Confirm email enabled

## Custom SMTP for production customer emails

The Supabase default sender is not suitable for arbitrary production customers. Configure your GO54 business mailbox under Authentication → Emails / SMTP Settings.

For GO54 Cloud Mail, the published SMTP settings are:
- Host: `smtp.go54mail.com`
- Port: `587`
- Encryption: STARTTLS
- Username: full business email address
- Password: business mailbox password
- Sender email: the same verified business email address
- Sender name: `Wow & Amazing`

Do not commit mailbox passwords or SMTP credentials to GitHub.

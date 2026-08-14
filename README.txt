Wow & Amazing — One-time Owner Password Reset Tool

Run this from the project root:
node scripts\reset-owner-password.mjs

The tool reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
It checks that the user exists, the email is confirmed, and public.profiles.role = owner before changing the password.

After a successful reset:
1. Delete scripts\reset-owner-password.mjs
2. Do not commit the temporary reset tool to GitHub.
3. Sign in at https://itsamazing.com.ng/admin/login

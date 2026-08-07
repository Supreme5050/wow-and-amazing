# Wow & Amazing — Phase 8F Vendor Order Notifications

This phase adds a private owner notification centre, admin bell/unread count,
Brevo business-email alerts, official Twilio WhatsApp alerts, delivery history,
and duplicate-alert protection.

## Events covered

- Verified paid product orders
- Verified paid property rentals
- Service enquiries
- Contact messages
- Payment verification problems that need owner review
- Low-stock warnings after paid orders

Dashboard notifications are stored even when email or WhatsApp has not yet been
configured. External delivery for records marked as test data is disabled by
default. The manual Test buttons remain available for checking configured
channels.

## 1. Install the patch

From Windows CMD:

```cmd
set "PROJECT=%USERPROFILE%\Desktop\wow-and-amazing-update"
tar -xf "%USERPROFILE%\Downloads\Wow-and-Amazing-Phase-8F-Vendor-Order-Notifications.zip" -C "%PROJECT%"
cd /d "%PROJECT%"
```

## 2. Run only migration 022

```cmd
type "supabase\migrations\202608060022_vendor_order_notifications.sql" | clip
```

Paste it into Supabase SQL Editor and click Run. Do not rerun migrations 001–021.

## 3. Add notification settings to `.env.local`

Never share the real values publicly.

```env
# Owner email notification
VENDOR_NOTIFICATION_EMAIL=orders@itsamazing.com.ng
BREVO_API_KEY=xkeysib-YOUR_REAL_BREVO_API_KEY
BREVO_SENDER_EMAIL=no-reply@itsamazing.com.ng
BREVO_SENDER_NAME=Wow & Amazing

# Official Twilio WhatsApp notification
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=YOUR_REAL_TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM=+14155238886
VENDOR_WHATSAPP_TO=+2348012345678

# Production template mode (recommended for business-initiated messages)
# Leave both blank during a supported Twilio Sandbox test when free-form
# messaging is allowed by the active WhatsApp session.
TWILIO_MESSAGING_SERVICE_SID=MGxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_CONTENT_SID=HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Keep automatic external alerts off for test records.
NOTIFY_TEST_DATA=false
```

`VENDOR_WHATSAPP_TO` must use international format, for example `+234...`.
The code adds the `whatsapp:` prefix automatically.

## 4. Clear and verify

```cmd
taskkill /F /IM node.exe 2>nul
if exist .next rmdir /s /q .next
if exist tsconfig.tsbuildinfo del /f /q tsconfig.tsbuildinfo
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

## 5. Open the notification centre

```text
http://localhost:3004/admin/notifications
```

The top-right bell also shows unread live alerts and a quick preview.

## 6. Test safely

1. Confirm Email alerts or WhatsApp alerts shows **Connected**.
2. Click **Send test** for the configured channel.
3. Confirm the delivery appears in Notification History.
4. Test orders created while `NEXT_PUBLIC_DATA_MODE=test` are saved in the
   notification history but do not send automatic external alerts unless
   `NOTIFY_TEST_DATA=true`.
5. Keep `NOTIFY_TEST_DATA=false` for normal use.

## 7. Production values

In Vercel, add the same notification environment variables. Set:

```env
NEXT_PUBLIC_SITE_URL=https://itsamazing.com.ng
NEXT_PUBLIC_DATA_MODE=live
NOTIFY_TEST_DATA=false
```

The website automatically supplies this Twilio delivery-status callback when
`NEXT_PUBLIC_SITE_URL` uses HTTPS:

```text
https://itsamazing.com.ng/api/notifications/twilio/status
```

The Paystack production webhook remains:

```text
https://itsamazing.com.ng/api/payments/paystack/webhook
```

## Safety behaviour

- Paystack webhook signatures are verified before order finalisation.
- A notification is sent only after the order is confirmed/finalised.
- Email and WhatsApp attempts are claimed atomically in Supabase.
- Duplicate Paystack callback/webhook arrivals cannot send the same channel
  alert twice.
- Twilio delivery callbacks are signature-verified.
- Provider credentials remain server-only.
- Every notification and channel result is preserved for the owner.

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const statusMap: Record<string, "queued" | "sent" | "delivered" | "read" | "failed"> = {
  accepted: "queued",
  scheduled: "queued",
  queued: "queued",
  sending: "queued",
  sent: "sent",
  delivered: "delivered",
  read: "read",
  undelivered: "failed",
  failed: "failed",
};

function validTwilioSignature(url: string, form: FormData, receivedSignature: string, authToken: string) {
  const pairs = [...form.entries()]
    .map(([key, value]) => [key, typeof value === "string" ? value : value.name] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const signedValue = pairs.reduce((result, [key, value]) => `${result}${key}${value}`, url);
  const expected = createHmac("sha1", authToken).update(signedValue).digest("base64");

  try {
    const receivedBuffer = Buffer.from(receivedSignature);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || "").trim();
  const signature = request.headers.get("x-twilio-signature") || "";
  const form = await request.formData();

  if (!authToken || !signature || !validTwilioSignature(request.url, form, signature, authToken)) {
    return NextResponse.json({ error: "Invalid Twilio callback signature." }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const messageSid = String(form.get("MessageSid") || "").trim();
  const providerStatus = String(form.get("MessageStatus") || "").trim().toLowerCase();
  const status = statusMap[providerStatus];
  const errorCode = String(form.get("ErrorCode") || "").trim();
  const errorMessage = String(form.get("ErrorMessage") || "").trim();

  if (!messageSid || !status) {
    return NextResponse.json({ received: true });
  }

  const update: Record<string, unknown> = {
    status,
    last_error: status === "failed" ? [errorCode, errorMessage].filter(Boolean).join(": ") || "Twilio reported delivery failure." : null,
  };
  if (status === "delivered" || status === "read") update.delivered_at = new Date().toISOString();

  await admin
    .from("notification_deliveries")
    .update(update)
    .eq("provider_message_id", messageSid)
    .eq("channel", "whatsapp");

  return NextResponse.json({ received: true });
}

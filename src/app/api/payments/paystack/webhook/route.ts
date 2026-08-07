import { createHmac, timingSafeEqual } from "node:crypto";
import { after, NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyPaidOrder, notifyPaymentReview } from "@/lib/notifications/server";

type PaystackEvent = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    channel?: string;
    paid_at?: string;
    customer?: { email?: string };
    [key: string]: unknown;
  };
};

function signaturesMatch(received: string, expected: string) {
  try {
    const receivedBuffer = Buffer.from(received, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const admin = getSupabaseAdminClient();
  if (!secret || !admin) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 503 });

  const rawBody = await request.text();
  const receivedSignature = request.headers.get("x-paystack-signature") || "";
  const expectedSignature = createHmac("sha512", secret).update(rawBody).digest("hex");
  if (!receivedSignature || !signaturesMatch(receivedSignature, expectedSignature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let event: PaystackEvent;
  try {
    event = JSON.parse(rawBody) as PaystackEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  if (event.event !== "charge.success" || event.data?.status !== "success" || !event.data.reference) {
    return NextResponse.json({ received: true });
  }

  const reference = event.data.reference;
  const { data: attempt } = await admin
    .from("payment_attempts")
    .select("id, email, amount, currency, order_id")
    .eq("reference", reference)
    .maybeSingle();

  // A 200 response prevents needless retries for payments that were not
  // initialized by this website.
  if (!attempt) return NextResponse.json({ received: true });
  if (attempt.order_id) {
    after(() => notifyPaidOrder(String(attempt.order_id)).catch(() => undefined));
    return NextResponse.json({ received: true });
  }

  const amountMatches = event.data.amount === Math.round(Number(attempt.amount) * 100);
  const currencyMatches = String(event.data.currency || "").toUpperCase() === String(attempt.currency).toUpperCase();
  const emailMatches = !event.data.customer?.email || event.data.customer.email.trim().toLowerCase() === String(attempt.email).trim().toLowerCase();

  if (!amountMatches || !currencyMatches || !emailMatches) {
    await admin
      .from("payment_attempts")
      .update({
        status: "review_required",
        failure_reason: "Webhook payment details did not match the checkout session.",
        provider_payload: event.data,
      })
      .eq("id", attempt.id);
    after(() => notifyPaymentReview(reference, "Webhook payment details did not match the checkout session.").catch(() => undefined));
    return NextResponse.json({ received: true });
  }

  const { data, error } = await admin.rpc("finalize_paid_checkout", {
    p_reference: reference,
    p_payment_channel: event.data.channel || null,
    p_paid_at: event.data.paid_at || new Date().toISOString(),
    p_provider_payload: event.data,
  });

  if (error) {
    await admin
      .from("payment_attempts")
      .update({ status: "review_required", failure_reason: error.message, provider_payload: event.data })
      .eq("id", attempt.id);
    after(() => notifyPaymentReview(reference, error.message).catch(() => undefined));
  } else {
    const result = (data as Array<{ result_order_id?: string | null; result_status?: string; result_message?: string }> | null)?.[0];
    if (result?.result_status === "review_required") {
      const reviewReason = result.result_message || "Order finalization needs review.";
      await admin
        .from("payment_attempts")
        .update({ status: "review_required", failure_reason: reviewReason })
        .eq("id", attempt.id);
      after(() => notifyPaymentReview(reference, reviewReason).catch(() => undefined));
    } else if (result?.result_order_id) {
      after(() => notifyPaidOrder(result.result_order_id as string).catch(() => undefined));
    }
  }

  return NextResponse.json({ received: true });
}

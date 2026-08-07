import { after, NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";
import { notifyPaidOrder, notifyPaymentReview } from "@/lib/notifications/server";

type ConfirmBody = { reference?: string };
type FinalizeResult = {
  result_order_id: string | null;
  result_order_number: string | null;
  result_status: string;
  result_message: string;
};

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: "Supabase server configuration is incomplete." }, { status: 503 });

    const body = (await request.json()) as ConfirmBody;
    const reference = String(body.reference || "").trim();
    if (!reference) return NextResponse.json({ error: "Payment reference is required." }, { status: 400 });

    const { data: attempt, error: attemptError } = await admin
      .from("payment_attempts")
      .select("id, reference, email, amount, currency, status, order_id")
      .eq("reference", reference)
      .maybeSingle();

    if (attemptError) throw new Error(attemptError.message);
    if (!attempt) return NextResponse.json({ error: "This payment session was not found." }, { status: 404 });

    if (attempt.order_id) {
      const { data: order } = await admin.from("orders").select("order_number").eq("id", attempt.order_id).single();
      after(() => notifyPaidOrder(String(attempt.order_id)).catch(() => undefined));
      return NextResponse.json({ orderNumber: order?.order_number, status: "completed" });
    }

    const verification = await verifyPaystackTransaction(reference);
    const transaction = verification.data;
    if (!transaction || transaction.status !== "success") {
      await admin
        .from("payment_attempts")
        .update({ status: "failed", failure_reason: `Paystack status: ${transaction?.status || "unknown"}`, provider_payload: transaction || {} })
        .eq("id", attempt.id);
      return NextResponse.json({ error: "Payment has not been confirmed as successful." }, { status: 402 });
    }

    const expectedAmount = Math.round(Number(attempt.amount) * 100);
    if (transaction.amount !== expectedAmount) {
      await admin
        .from("payment_attempts")
        .update({ status: "review_required", failure_reason: "Verified amount mismatch.", provider_payload: transaction })
        .eq("id", attempt.id);
      after(() => notifyPaymentReview(reference, "Verified amount mismatch.").catch(() => undefined));
      return NextResponse.json({ error: "The verified payment amount does not match this checkout." }, { status: 409 });
    }

    if (String(transaction.currency || "").toUpperCase() !== String(attempt.currency).toUpperCase()) {
      await admin
        .from("payment_attempts")
        .update({ status: "review_required", failure_reason: "Verified currency mismatch.", provider_payload: transaction })
        .eq("id", attempt.id);
      after(() => notifyPaymentReview(reference, "Verified currency mismatch.").catch(() => undefined));
      return NextResponse.json({ error: "The verified payment currency does not match this checkout." }, { status: 409 });
    }

    const paidEmail = transaction.customer?.email?.trim().toLowerCase();
    if (paidEmail && paidEmail !== String(attempt.email).trim().toLowerCase()) {
      await admin
        .from("payment_attempts")
        .update({ status: "review_required", failure_reason: "Verified customer email mismatch.", provider_payload: transaction })
        .eq("id", attempt.id);
      after(() => notifyPaymentReview(reference, "Verified customer email mismatch.").catch(() => undefined));
      return NextResponse.json({ error: "The verified payment customer does not match this checkout." }, { status: 409 });
    }

    const { data, error } = await admin.rpc("finalize_paid_checkout", {
      p_reference: reference,
      p_payment_channel: transaction.channel || null,
      p_paid_at: transaction.paid_at || new Date().toISOString(),
      p_provider_payload: transaction,
    });

    if (error) throw new Error(error.message);
    const result = (data as FinalizeResult[] | null)?.[0];
    if (!result || result.result_status === "review_required") {
      const reviewReason = result?.result_message || "Payment succeeded, but this order needs owner review.";
      after(() => notifyPaymentReview(reference, reviewReason).catch(() => undefined));
      return NextResponse.json(
        { error: reviewReason },
        { status: 409 },
      );
    }
    if (!result.result_order_number) throw new Error(result.result_message || "Order finalization failed.");

    if (result.result_order_id) {
      after(() => notifyPaidOrder(result.result_order_id as string).catch(() => undefined));
    }

    return NextResponse.json({
      orderNumber: result.result_order_number,
      status: result.result_status,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to confirm payment." },
      { status: 500 },
    );
  }
}

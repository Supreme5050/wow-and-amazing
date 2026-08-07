import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";
import { verifyPaystackTransaction } from "@/lib/payments/paystack";

type FinalizeResult = {
  result_order_number: string | null;
  result_status: string;
  result_message: string;
};

export async function POST(request: NextRequest, context: { params: Promise<{ reference: string }> }) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  try {
    const { reference: encodedReference } = await context.params;
    const reference = decodeURIComponent(encodedReference).trim();
    const { data: attempt, error: attemptError } = await auth.admin
      .from("payment_attempts")
      .select("id, email, amount, currency, order_id")
      .eq("reference", reference)
      .eq("is_test_data", false)
      .maybeSingle();

    if (attemptError) throw new Error(attemptError.message);
    if (!attempt) return NextResponse.json({ error: "Payment attempt not found." }, { status: 404 });
    if (attempt.order_id) {
      const { data: order } = await auth.admin.from("orders").select("order_number").eq("id", attempt.order_id).single();
      return NextResponse.json({ status: "completed", orderNumber: order?.order_number });
    }

    const verification = await verifyPaystackTransaction(reference);
    const transaction = verification.data;
    if (!transaction || transaction.status !== "success") {
      await auth.admin
        .from("payment_attempts")
        .update({
          status: "failed",
          failure_reason: `Paystack status: ${transaction?.status || "unknown"}`,
          provider_payload: transaction || {},
        })
        .eq("id", attempt.id);
      return NextResponse.json({ error: "Paystack has not confirmed this payment as successful." }, { status: 409 });
    }

    const amountMatches = transaction.amount === Math.round(Number(attempt.amount) * 100);
    const currencyMatches = String(transaction.currency || "").toUpperCase() === String(attempt.currency).toUpperCase();
    const emailMatches = !transaction.customer?.email || transaction.customer.email.trim().toLowerCase() === String(attempt.email).trim().toLowerCase();
    if (!amountMatches || !currencyMatches || !emailMatches) {
      await auth.admin
        .from("payment_attempts")
        .update({
          status: "review_required",
          failure_reason: "Verified payment details do not match the checkout session.",
          provider_payload: transaction,
        })
        .eq("id", attempt.id);
      return NextResponse.json({ error: "Verified payment details do not match the checkout." }, { status: 409 });
    }

    const { data, error } = await auth.admin.rpc("finalize_paid_checkout", {
      p_reference: reference,
      p_payment_channel: transaction.channel || null,
      p_paid_at: transaction.paid_at || new Date().toISOString(),
      p_provider_payload: transaction,
    });
    if (error) throw new Error(error.message);

    const result = (data as FinalizeResult[] | null)?.[0];
    if (!result || result.result_status === "review_required") {
      return NextResponse.json({ error: result?.result_message || "This payment still requires owner review." }, { status: 409 });
    }

    return NextResponse.json({ status: result.result_status, orderNumber: result.result_order_number });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to reconcile payment." }, { status: 500 });
  }
}

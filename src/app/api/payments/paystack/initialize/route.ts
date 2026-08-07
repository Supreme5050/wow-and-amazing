import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTestDataEnvironment } from "@/lib/store/dataMode";
import {
  type CheckoutAddress,
  type CheckoutRequestItem,
  validateCheckoutItems,
} from "@/lib/payments/paystack";

type InitializeBody = {
  email?: string;
  address?: CheckoutAddress;
  items?: CheckoutRequestItem[];
};

type PaystackInitializeResponse = {
  status: boolean;
  message?: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const admin = getSupabaseAdminClient();
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!admin || !secret) {
      return NextResponse.json(
        { error: "Supabase or Paystack server configuration is incomplete." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as InitializeBody;
    const email = String(body.email || "").trim().toLowerCase();
    const address = body.address && typeof body.address === "object" ? body.address : null;
    if (!emailPattern.test(email) || !address) {
      return NextResponse.json({ error: "A valid email and customer address are required." }, { status: 400 });
    }

    const checkout = await validateCheckoutItems(body.items || []);
    const currency = (process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "NGN").trim().toUpperCase();
    const reference = `WAA-${Date.now()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;

    let userId: string | null = null;
    let authenticatedEmail = "";
    let emailVerified = false;
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (token) {
      const { data, error } = await admin.auth.getUser(token);
      if (!error && data.user) {
        userId = data.user.id;
        authenticatedEmail = String(data.user.email ?? "").trim().toLowerCase();
        emailVerified = Boolean(data.user.email_confirmed_at);
      }
    }

    if (checkout.containsRental) {
      if (!userId) {
        return NextResponse.json(
          { error: "Sign in to a verified customer account before paying for a property rental." },
          { status: 401 },
        );
      }
      if (!emailVerified) {
        return NextResponse.json(
          { error: "Verify your customer email address before paying for a property rental." },
          { status: 403 },
        );
      }
      if (!authenticatedEmail || authenticatedEmail !== email) {
        return NextResponse.json(
          { error: "Use the verified email address connected to your customer account for this rental." },
          { status: 400 },
        );
      }
    }

    const { data: attempt, error: attemptError } = await admin
      .from("payment_attempts")
      .insert({
        reference,
        user_id: userId,
        email,
        address,
        items: checkout.items,
        amount: checkout.total,
        currency,
        status: "initialized",
        is_test_data: isTestDataEnvironment(),
      })
      .select("id")
      .single();

    if (attemptError || !attempt) {
      throw new Error(attemptError?.message || "Unable to prepare this payment.");
    }

    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
    const callbackBase = configuredSiteUrl || request.nextUrl.origin;
    const callbackUrl = `${callbackBase}/checkout/complete`;

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(checkout.total * 100).toString(),
        currency,
        reference,
        callback_url: callbackUrl,
        metadata: JSON.stringify({
          payment_attempt_id: attempt.id,
          source: "wow-and-amazing-web",
          checkout_type: checkout.containsRental ? "rental-or-mixed" : "merchandise",
        }),
      }),
      cache: "no-store",
    });

    const payload = (await paystackResponse.json()) as PaystackInitializeResponse;
    if (!paystackResponse.ok || !payload.status || !payload.data) {
      const providerMessage = payload.message || "Paystack initialization failed.";
      const currencyRejected = providerMessage.toLowerCase().includes("currency")
        && providerMessage.toLowerCase().includes("not supported");
      const customerMessage = currencyRejected
        ? `Your Paystack merchant account is not enabled for ${currency}. Set NEXT_PUBLIC_PAYSTACK_CURRENCY to your enabled settlement currency (NGN for a standard Nigerian account), restart the app, and try again.`
        : providerMessage;

      await admin
        .from("payment_attempts")
        .update({ status: "failed", failure_reason: customerMessage })
        .eq("id", attempt.id);
      throw new Error(customerMessage);
    }

    await admin
      .from("payment_attempts")
      .update({
        access_code: payload.data.access_code,
        authorization_url: payload.data.authorization_url,
      })
      .eq("id", attempt.id);

    return NextResponse.json({
      authorizationUrl: payload.data.authorization_url,
      accessCode: payload.data.access_code,
      reference: payload.data.reference,
      amount: checkout.total,
      currency,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to initialize payment." },
      { status: 400 },
    );
  }
}

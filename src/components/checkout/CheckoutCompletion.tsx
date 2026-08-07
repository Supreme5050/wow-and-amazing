"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store/StoreProvider";

type CompletionState = "confirming" | "success" | "error";

export function CheckoutCompletion() {
  const searchParams = useSearchParams();
  const { clearCart } = useStore();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const started = useRef(false);
  const [state, setState] = useState<CompletionState>(reference ? "confirming" : "error");
  const [message, setMessage] = useState(reference ? "Confirming your payment and creating your order…" : "No Paystack payment reference was returned. Your cart has not been cleared.");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!reference) return;

    async function confirmPayment() {
      try {
        const response = await fetch("/api/payments/paystack/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const payload = await response.json() as { orderNumber?: string; error?: string };
        if (!response.ok || !payload.orderNumber) {
          throw new Error(payload.error || "Payment could not be confirmed.");
        }

        clearCart();
        setOrderNumber(payload.orderNumber);
        setMessage(`Order ${payload.orderNumber} has been confirmed.`);
        setState("success");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Payment could not be confirmed.");
        setState("error");
      }
    }

    void confirmPayment();
  }, [clearCart, reference]);

  return (
    <section className="section-shell store-page">
      <div className="site-container checkout-complete-shell">
        <div className={`checkout-confirmation checkout-confirmation-${state}`}>
          <p className="wa-eyebrow">{state === "success" ? "ORDER CONFIRMED" : state === "error" ? "PAYMENT REVIEW" : "SECURE PAYMENT"}</p>
          <h1>{state === "success" ? "Thank you for your order." : state === "error" ? "We need to check this payment." : "Please wait a moment."}</h1>
          {state === "confirming" ? <span className="checkout-confirmation-spinner" aria-hidden="true" /> : null}
          <p>{message}</p>
          {reference ? <p className="checkout-reference">Payment reference: <strong>{reference}</strong></p> : null}
          {state === "success" ? (
            <div className="checkout-complete-actions">
              <Link className="button-primary" href="/account/orders">View your orders</Link>
              <Link className="button-secondary" href="/category/all">Continue shopping</Link>
            </div>
          ) : null}
          {state === "error" ? (
            <div className="checkout-complete-actions">
              <Link className="button-primary" href="/checkout">Return to checkout</Link>
              <Link className="button-secondary" href="/">Return to store</Link>
            </div>
          ) : null}
          {orderNumber ? <span className="sr-only">Confirmed order {orderNumber}</span> : null}
        </div>
      </div>
    </section>
  );
}

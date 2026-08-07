"use client";

import { useEffect, useMemo, useState } from "react";
import { ownerFetch } from "@/lib/admin/client";

type OrderLink = { order_number: string };
type PaymentAttempt = {
  id: string;
  reference: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  orders: OrderLink | OrderLink[] | null;
};
type Payload = { payments: PaymentAttempt[] };

const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });
const statusOptions = ["all", "initialized", "paid", "failed", "review_required", "abandoned"];

function orderNumber(payment: PaymentAttempt) {
  if (Array.isArray(payment.orders)) return payment.orders[0]?.order_number || "";
  return payment.orders?.order_number || "";
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 2 }).format(Number(value));
  } catch {
    return `${currency || ""} ${Number(value).toFixed(2)}`.trim();
  }
}

export function AdminPayments() {
  const [payments, setPayments] = useState<PaymentAttempt[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [message, setMessage] = useState("");

  async function loadPayments() {
    const data = await ownerFetch<Payload>("/api/admin/payments");
    setPayments(data.payments);
  }

  useEffect(() => {
    ownerFetch<Payload>("/api/admin/payments")
      .then((data) => setPayments(data.payments))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load payments."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return payments.filter((payment) => {
      const matchesStatus = status === "all" || payment.status === status;
      const matchesQuery = !value || `${payment.reference} ${payment.email} ${payment.status} ${orderNumber(payment)}`.toLowerCase().includes(value);
      return matchesStatus && matchesQuery;
    });
  }, [payments, query, status]);

  const reviewCount = payments.filter((payment) => payment.status === "review_required").length;
  const initializedCount = payments.filter((payment) => payment.status === "initialized").length;
  const paidCount = payments.filter((payment) => payment.status === "paid").length;

  async function reconcile(payment: PaymentAttempt) {
    setWorking(payment.reference);
    setMessage(`Checking ${payment.reference} with Paystack…`);
    try {
      const result = await ownerFetch<{ status: string; orderNumber?: string }>(
        `/api/admin/payments/${encodeURIComponent(payment.reference)}/reconcile`,
        { method: "POST" },
      );
      await loadPayments();
      setMessage(result.orderNumber ? `Payment reconciled. Order ${result.orderNumber} is ready.` : "Payment check completed.");
    } catch (error) {
      await loadPayments().catch(() => undefined);
      setMessage(error instanceof Error ? error.message : "Unable to reconcile payment.");
    } finally {
      setWorking("");
    }
  }

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <p className="wa-eyebrow">PAYMENT RECONCILIATION</p>
          <h1>Payments</h1>
          <p>Match Paystack transactions to orders and surface any payment that needs manual attention.</p>
        </div>
      </div>

      <div className="admin-metric-grid admin-payment-metrics">
        <article><span>Paid</span><strong>{paidCount}</strong><small>Completed attempts</small></article>
        <article><span>Awaiting return</span><strong>{initializedCount}</strong><small>Started checkouts</small></article>
        <article><span>Needs review</span><strong>{reviewCount}</strong><small>Owner attention required</small></article>
      </div>

      <div className="admin-toolbar admin-payment-toolbar">
        <label className="admin-search-field">Search payments<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference, email, status, or order" /></label>
        <label className="admin-search-field">Status<select className="input-field" value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option value={item} key={item}>{item === "all" ? "All statuses" : item.replace("_", " ")}</option>)}</select></label>
        <span>{visible.length} payments</span>
      </div>

      {message ? <div className="admin-alert">{message}</div> : null}

      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading payments…</p></div> : visible.length ? (
          <div className="admin-payment-list">
            {visible.map((payment) => {
              const linkedOrder = orderNumber(payment);
              const canReconcile = !payment.order_id && payment.status !== "paid";
              return (
                <article className={`admin-payment-card status-${payment.status}`} key={payment.id}>
                  <div className="admin-payment-main">
                    <div>
                      <span className={`admin-status ${payment.status}`}>{payment.status.replace("_", " ")}</span>
                      <h2>{payment.reference}</h2>
                      <p>{payment.email} · {date.format(new Date(payment.created_at))}</p>
                    </div>
                    <strong>{formatMoney(payment.amount, payment.currency)}</strong>
                  </div>
                  <div className="admin-payment-meta">
                    <span>Order<strong>{linkedOrder || "Not created"}</strong></span>
                    <span>Last updated<strong>{date.format(new Date(payment.updated_at))}</strong></span>
                  </div>
                  {payment.failure_reason ? <p className="admin-payment-reason">{payment.failure_reason}</p> : null}
                  {canReconcile ? <button className="button-secondary admin-payment-reconcile" type="button" disabled={working === payment.reference} onClick={() => void reconcile(payment)}>{working === payment.reference ? "Checking…" : "Re-check with Paystack"}</button> : null}
                </article>
              );
            })}
          </div>
        ) : <div className="admin-empty"><h2>No payments found.</h2><p>Payment attempts will appear here after customers begin checkout.</p></div>}
      </section>
    </div>
  );
}

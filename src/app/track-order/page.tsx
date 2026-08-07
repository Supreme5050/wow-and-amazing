"use client";

import { FormEvent, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, PackageIcon } from "@/components/icons/LineIcons";
import { ORDER_STATUS_FLOW, orderStatusDescription, orderStatusLabel } from "@/lib/orders/status";
import { formatStoreMoney } from "@/lib/store/currency";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type TrackedItem = {
  id: string;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  qty: number;
  product_slug: string | null;
  product_image_url: string | null;
};

type TrackedEvent = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
};

type TrackedOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  payment_channel: string | null;
  delivery: { full_name: string | null; city: string | null; state: string | null; country: string | null };
  items: TrackedItem[];
  history: TrackedEvent[];
};

export default function TrackOrderPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentIndex = useMemo(() => order ? ORDER_STATUS_FLOW.indexOf(order.status as (typeof ORDER_STATUS_FLOW)[number]) : -1, [order]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrder(null);
    setLoading(true);
    setMessage("Checking your order…");
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      setLoading(false);
      return;
    }

    const form = new FormData(event.currentTarget);
    const { data, error } = await supabase.rpc("track_order_details", {
      p_order_number: String(form.get("orderNumber") ?? "").trim(),
      p_email: String(form.get("email") ?? "").trim(),
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const found = (data ?? null) as TrackedOrder | null;
    setOrder(found);
    setMessage(found ? "" : "No order matched that order number and email address.");
    setLoading(false);
  }

  return (
    <section className="section-shell store-page">
      <div className="site-container track-order-page-shell">
        <div className="store-page-heading track-order-heading">
          <p className="wa-eyebrow">ORDER STATUS</p>
          <h1 className="wa-section-heading">Track Order</h1>
          <p>Enter the exact order number and email address used at checkout. No login is required.</p>
        </div>

        <form className="track-order-form track-order-search-form" onSubmit={submit}>
          <label>Order number<input className="input-field" name="orderNumber" placeholder="WA-2026-XXXXXXXX" required /></label>
          <label>Email address<input className="input-field" name="email" type="email" required /></label>
          <button className="button-primary" type="submit" disabled={loading}>{loading ? "Checking…" : "Track Order"}</button>
        </form>
        {message ? <p className="form-message track-order-message" role="status">{message}</p> : null}

        {order ? (
          <div className="tracked-order-result">
            <div className="tracked-order-hero">
              <div><p className="wa-eyebrow">CURRENT STATUS</p><h2>{orderStatusLabel(order.status)}</h2><p>{orderStatusDescription(order.status)}</p></div>
              <div><span>Order number</span><strong>{order.order_number}</strong><small>Placed {new Date(order.created_at).toLocaleDateString("en-NG", { dateStyle: "long" })}</small></div>
            </div>

            {!['cancelled', 'refunded'].includes(order.status) ? (
              <div className="order-progress-card tracked-order-progress">
                {ORDER_STATUS_FLOW.map((status, index) => {
                  const complete = currentIndex >= index;
                  return <div className={complete ? "order-progress-step complete" : "order-progress-step"} key={status}><span>{complete ? <CheckIcon size={17} /> : index + 1}</span><strong>{orderStatusLabel(status)}</strong></div>;
                })}
              </div>
            ) : <div className={`order-exception-banner order-exception-${order.status}`}><strong>{orderStatusLabel(order.status)}</strong><p>{orderStatusDescription(order.status)}</p></div>}

            <div className="tracked-order-content-grid">
              <section className="tracked-order-panel">
                <div className="customer-order-panel-heading"><div><p className="wa-eyebrow">ORDER ITEMS</p><h2>Your purchase</h2></div><strong>{formatStoreMoney(Number(order.total))}</strong></div>
                <div className="tracked-order-items">
                  {order.items.map((item) => (
                    <article key={item.id}>
                      <div>{item.product_image_url ? <Image src={item.product_image_url} alt={item.product_name} width={80} height={80} unoptimized={item.product_image_url.startsWith("http")} /> : <PackageIcon size={26} />}</div>
                      <span><strong>{item.product_slug ? <Link href={`/product/${item.product_slug}`}>{item.product_name}</Link> : item.product_name}</strong><small>{item.variant_name || "Standard"} · Qty {item.qty}</small></span>
                      <b>{formatStoreMoney(Number(item.unit_price) * item.qty)}</b>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="tracked-order-panel tracked-order-delivery">
                <p className="wa-eyebrow">DELIVERY</p>
                <h2>{order.delivery.full_name || "Customer"}</h2>
                <p>{[order.delivery.city, order.delivery.state, order.delivery.country].filter(Boolean).join(", ")}</p>
                <dl><div><dt>Payment</dt><dd>{order.paid_at ? "Confirmed" : "Not recorded"}</dd></div><div><dt>Channel</dt><dd>{order.payment_channel || "Not recorded"}</dd></div><div><dt>Last updated</dt><dd>{new Date(order.updated_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</dd></div></dl>
              </aside>
            </div>

            <section className="tracked-order-panel tracked-order-timeline-panel">
              <div className="customer-order-panel-heading"><div><p className="wa-eyebrow">FULFILMENT HISTORY</p><h2>Tracking timeline</h2></div></div>
              <ol className="customer-order-timeline">
                {order.history.map((event, index) => <li key={event.id}><span>{index + 1}</span><div><strong>{orderStatusLabel(event.status)}</strong>{event.note ? <p>{event.note}</p> : null}<time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</time></div></li>)}
              </ol>
            </section>
          </div>
        ) : null}
      </div>
    </section>
  );
}

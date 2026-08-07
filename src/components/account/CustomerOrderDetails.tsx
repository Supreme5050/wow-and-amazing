/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, PackageIcon } from "@/components/icons/LineIcons";
import { ORDER_STATUS_FLOW, orderStatusDescription, orderStatusLabel } from "@/lib/orders/status";
import { formatStoreMoney } from "@/lib/store/currency";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const visibleOrderTestFlag = process.env.NEXT_PUBLIC_DATA_MODE !== "live";

type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  qty: number;
  product_slug: string | null;
  product_image_url: string | null;
};

type StatusEvent = {
  id: string;
  status: string;
  note: string | null;
  created_at: string;
};

type Order = {
  id: string;
  order_number: string;
  email: string;
  status: string;
  total: number;
  currency: string;
  address: Record<string, string>;
  payment_provider: string | null;
  payment_reference: string | null;
  payment_channel: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  order_status_events: StatusEvent[];
};

export function CustomerOrderDetails({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("Loading order details…");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setMessage("Sign in to view this order.");
        return;
      }
      if (!data.user.email_confirmed_at) {
        setMessage("Verify your email address before viewing permanent order details.");
        return;
      }
      const { data: row, error } = await supabase
        .from("orders")
        .select("id, order_number, email, status, total, currency, address, payment_provider, payment_reference, payment_channel, paid_at, created_at, updated_at, order_items(id, product_name, variant_name, unit_price, qty, product_slug, product_image_url), order_status_events(id, status, note, created_at)")
        .eq("id", orderId)
        .eq("is_test_data", visibleOrderTestFlag)
        .maybeSingle();
      setOrder((row as Order | null) ?? null);
      setMessage(error?.message ?? (row ? "" : "This order could not be found in your account."));
    });
  }, [orderId]);

  const history = useMemo(() => [...(order?.order_status_events ?? [])].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()), [order]);
  const currentIndex = order ? ORDER_STATUS_FLOW.indexOf(order.status as (typeof ORDER_STATUS_FLOW)[number]) : -1;

  if (message) {
    return <section className="section-shell store-page"><div className="site-container"><div className="store-empty-card empty-store-state"><h1>Order Details</h1><p>{message}</p><Link className="button-primary" href={message.startsWith("Verify") ? "/account?mode=verify" : message.startsWith("Sign") ? "/account" : "/account/orders"}>{message.startsWith("Verify") ? "Verify email" : message.startsWith("Sign") ? "Sign in" : "Back to Orders"}</Link></div></div></section>;
  }
  if (!order) return null;

  const address = order.address || {};
  const addressName = address.fullName || address.full_name;
  const line1 = address.line1 || address.line_1;
  const line2 = address.line2 || address.line_2;

  return (
    <section className="section-shell store-page">
      <div className="site-container customer-order-detail-shell">
        <div className="customer-order-detail-header">
          <div><Link className="account-back-link" href="/account/orders">← Back to orders</Link><p className="wa-eyebrow">ORDER {order.order_number}</p><h1 className="wa-section-heading">{orderStatusLabel(order.status)}</h1><p>{orderStatusDescription(order.status)}</p></div>
          <div className="customer-order-total"><span>Order total</span><strong>{formatStoreMoney(Number(order.total))}</strong><small>Placed {new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</small></div>
        </div>

        {!['cancelled', 'refunded'].includes(order.status) ? (
          <div className="order-progress-card" aria-label="Order progress">
            {ORDER_STATUS_FLOW.map((status, index) => {
              const complete = currentIndex >= index;
              return <div className={complete ? "order-progress-step complete" : "order-progress-step"} key={status}><span>{complete ? <CheckIcon size={17} /> : index + 1}</span><strong>{orderStatusLabel(status)}</strong></div>;
            })}
          </div>
        ) : <div className={`order-exception-banner order-exception-${order.status}`}><strong>{orderStatusLabel(order.status)}</strong><p>{orderStatusDescription(order.status)}</p></div>}

        <div className="customer-order-detail-grid">
          <div className="customer-order-main-column">
            <section className="customer-order-panel">
              <div className="customer-order-panel-heading"><div><p className="wa-eyebrow">PURCHASED ITEMS</p><h2>Products in this order</h2></div><span>{order.order_items.reduce((sum, item) => sum + item.qty, 0)} items</span></div>
              <div className="customer-order-item-list">
                {order.order_items.map((item) => (
                  <article key={item.id}>
                    <div className="customer-order-item-image">{item.product_image_url ? <Image src={item.product_image_url} alt={item.product_name} width={96} height={96} unoptimized={item.product_image_url.startsWith("http")} /> : <PackageIcon size={28} />}</div>
                    <div><strong>{item.product_slug ? <Link href={`/product/${item.product_slug}`}>{item.product_name}</Link> : item.product_name}</strong><p>{item.variant_name || "Standard"}</p><span>{formatStoreMoney(Number(item.unit_price))} × {item.qty}</span></div>
                    <b>{formatStoreMoney(Number(item.unit_price) * item.qty)}</b>
                  </article>
                ))}
              </div>
            </section>

            <section className="customer-order-panel">
              <div className="customer-order-panel-heading"><div><p className="wa-eyebrow">FULFILMENT HISTORY</p><h2>Order timeline</h2></div></div>
              <ol className="customer-order-timeline">
                {history.map((event, index) => (
                  <li key={event.id}><span>{index + 1}</span><div><strong>{orderStatusLabel(event.status)}</strong>{event.note ? <p>{event.note}</p> : null}<time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</time></div></li>
                ))}
              </ol>
            </section>
          </div>

          <aside className="customer-order-side-column">
            <section className="customer-order-panel compact"><p className="wa-eyebrow">DELIVERY ADDRESS</p><h2>{addressName}</h2><p>{line1}{line2 ? <><br />{line2}</> : null}<br />{address.city}{address.state ? `, ${address.state}` : ""}{address.postalCode || address.postal_code ? ` ${address.postalCode || address.postal_code}` : ""}<br />{address.country}<br />{address.phone}</p></section>
            <section className="customer-order-panel compact"><p className="wa-eyebrow">PAYMENT DETAILS</p><dl className="customer-order-meta"><div><dt>Provider</dt><dd>{order.payment_provider || "Paystack"}</dd></div><div><dt>Channel</dt><dd>{order.payment_channel || "Not recorded"}</dd></div><div><dt>Reference</dt><dd>{order.payment_reference || "Not recorded"}</dd></div><div><dt>Paid</dt><dd>{order.paid_at ? new Date(order.paid_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "Not recorded"}</dd></div></dl></section>
            <section className="customer-order-help"><h3>Need help with this order?</h3><p>Include your order number when contacting support so the owner can assist you quickly.</p><Link className="button-secondary" href="/support">Get Support</Link></section>
          </aside>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ownerFetch } from "@/lib/admin/client";

type OrderItem = {
  id: string;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  qty: number;
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
  order_items: OrderItem[];
  order_status_events: StatusEvent[];
};

type Payload = { orders: Order[] };

const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });
const statuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"];

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return `${currency || ""} ${Number(value).toFixed(2)}`.trim();
  }
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function loadOrders() {
    const data = await ownerFetch<Payload>("/api/admin/orders");
    setOrders(data.orders);
  }

  useEffect(() => {
    ownerFetch<Payload>("/api/admin/orders")
      .then((data) => setOrders(data.orders))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery = !value || `${order.order_number} ${order.email} ${order.status} ${order.payment_reference || ""}`.toLowerCase().includes(value);
      return matchesStatus && matchesQuery;
    });
  }, [orders, query, statusFilter]);

  async function updateStatus(order: Order, status: string, note = "") {
    setMessage(`Updating ${order.order_number}…`);
    try {
      await ownerFetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
      await loadOrders();
      setNotes((current) => ({ ...current, [order.id]: "" }));
      setMessage(note ? `${order.order_number} timeline was updated.` : `${order.order_number} is now ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update order.");
    }
  }

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div>
          <p className="wa-eyebrow">ORDER MANAGEMENT</p>
          <h1>Customer Orders</h1>
          <p>Review purchases, delivery details, payment references, and fulfilment history.</p>
        </div>
      </div>

      <div className="admin-toolbar admin-order-toolbar">
        <label className="admin-search-field">Search orders<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order number, email, payment reference" /></label>
        <label className="admin-search-field">Status<select className="input-field" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option value={status} key={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>
        <span>{visible.length} orders</span>
      </div>

      {message ? <div className="admin-alert">{message}</div> : null}

      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading orders…</p></div> : visible.length ? (
          <div className="admin-order-list">
            {visible.map((order) => {
              const address = order.address || {};
              const history = [...(order.order_status_events || [])].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              return (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-summary">
                    <button type="button" className="admin-order-expand" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                      <span>
                        <strong>{order.order_number}</strong>
                        <small>{order.email} · {date.format(new Date(order.created_at))}</small>
                      </span>
                      <b>{money(order.total, order.currency)}</b>
                    </button>
                    <label>Status<select className="input-field" value={order.status} onChange={(event) => void updateStatus(order, event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label>
                  </div>

                  {expanded === order.id ? (
                    <div className="admin-order-details admin-order-details-expanded">
                      <div>
                        <h3>Items</h3>
                        {order.order_items.map((item) => <p key={item.id}><span>{item.product_name} {item.variant_name ? `— ${item.variant_name}` : ""} × {item.qty}</span><strong>{money(Number(item.unit_price) * item.qty, order.currency)}</strong></p>)}
                      </div>
                      <div>
                        <h3>Delivery address</h3>
                        <p className="admin-order-address">{address.fullName || address.full_name}<br />{address.line1 || address.line_1}<br />{address.line2 || address.line_2}<br />{address.city}, {address.state}<br />{address.country}<br />{address.phone}</p>
                      </div>
                      <div>
                        <h3>Payment</h3>
                        <dl className="admin-order-payment-list">
                          <div><dt>Provider</dt><dd>{order.payment_provider || "Not recorded"}</dd></div>
                          <div><dt>Channel</dt><dd>{order.payment_channel || "Not recorded"}</dd></div>
                          <div><dt>Reference</dt><dd>{order.payment_reference || "Not recorded"}</dd></div>
                          <div><dt>Paid</dt><dd>{order.paid_at ? date.format(new Date(order.paid_at)) : "Not recorded"}</dd></div>
                        </dl>
                      </div>
                      <div className="admin-order-history">
                        <h3>Status history</h3>
                        {history.length ? <ol>{history.map((event) => <li key={event.id}><span>{event.status}{event.note ? <small>{event.note}</small> : null}</span><time>{date.format(new Date(event.created_at))}</time></li>)}</ol> : <p>No status history recorded.</p>}
                        <div className="admin-order-note-editor">
                          <label>Customer-visible update note<textarea className="input-field" value={notes[order.id] ?? ""} maxLength={1000} onChange={(event) => setNotes((current) => ({ ...current, [order.id]: event.target.value }))} placeholder="Example: Your parcel has been handed to the delivery partner." /></label>
                          <button className="button-secondary" type="button" disabled={!notes[order.id]?.trim()} onClick={() => void updateStatus(order, order.status, notes[order.id])}>Add Timeline Note</button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : <div className="admin-empty"><h2>No orders found.</h2><p>Paid customer orders will appear here.</p></div>}
      </section>
    </div>
  );
}

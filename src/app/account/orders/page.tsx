/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons/LineIcons";
import { orderStatusLabel } from "@/lib/orders/status";
import { formatStoreMoney } from "@/lib/store/currency";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const visibleOrderTestFlag = process.env.NEXT_PUBLIC_DATA_MODE !== "live";

type OrderItem = {
  id: string;
  product_name: string;
  qty: number;
  product_image_url: string | null;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
  order_items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("Loading orders…");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        setMessage("Sign in to view your orders.");
        return;
      }
      if (!data.user.email_confirmed_at) {
        setMessage("Verify your email address before opening permanent order history.");
        return;
      }

      const { data: rows, error } = await supabase
        .from("orders")
        .select("id, order_number, status, total, currency, created_at, order_items(id, product_name, qty, product_image_url)")
        .eq("is_test_data", visibleOrderTestFlag)
        .order("created_at", { ascending: false });
      setOrders((rows ?? []) as Order[]);
      setMessage(error?.message ?? "");
    });
  }, []);

  return (
    <section className="section-shell store-page">
      <div className="site-container">
        <div className="store-page-heading account-subpage-heading">
          <div><p className="wa-eyebrow">ORDER HISTORY</p><h1 className="wa-section-heading">Your Orders</h1><p>Open an order to see its products, payment details, delivery address, and fulfilment timeline.</p></div>
          <Link className="button-secondary" href="/account">Back to Account</Link>
        </div>

        {message ? (
          <div className="store-loading account-order-message">{message} {message.startsWith("Sign") || message.startsWith("Verify") ? <Link href={message.startsWith("Verify") ? "/account?mode=verify" : "/account"}>Open account</Link> : null}</div>
        ) : orders.length === 0 ? (
          <div className="empty-store-state store-empty-card"><h2>No orders yet.</h2><p>Your confirmed purchases will appear here.</p><Link className="button-primary" href="/category/all">Shop Products</Link></div>
        ) : (
          <div className="customer-order-list">
            {orders.map((order) => {
              const preview = order.order_items.slice(0, 3);
              const quantity = order.order_items.reduce((sum, item) => sum + Number(item.qty), 0);
              return (
                <article className="customer-order-card" key={order.id}>
                  <div className="customer-order-head">
                    <div><span>Order</span><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}</small></div>
                    <span className={`order-status order-status-${order.status}`}>{orderStatusLabel(order.status)}</span>
                  </div>
                  <div className="customer-order-body">
                    <div className="customer-order-images">
                      {preview.map((item) => item.product_image_url ? (
                        <Image key={item.id} src={item.product_image_url} alt={item.product_name} width={72} height={72} unoptimized={item.product_image_url.startsWith("http")} />
                      ) : <span key={item.id}>{item.product_name.slice(0, 1)}</span>)}
                    </div>
                    <div className="customer-order-summary"><p>{quantity} {quantity === 1 ? "item" : "items"}</p><strong>{formatStoreMoney(Number(order.total))}</strong></div>
                    <Link className="customer-order-open" href={`/account/orders/${order.id}`}>View Details <ArrowRightIcon size={18} /></Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  BagIcon,
  BoxIcon,
  ChatIcon,
  CreditCardIcon,
  PlusIcon,
  UserIcon,
} from "@/components/icons/LineIcons";
import { ownerFetch } from "@/lib/admin/client";

type MonthlyPerformance = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
};

type StatusBreakdown = {
  status: string;
  value: number;
};

type Overview = {
  metrics: { revenue: number; products: number; orders: number; customers: number; pendingOrders: number };
  analytics: { monthlyPerformance: MonthlyPerformance[]; statusBreakdown: StatusBreakdown[] };
  lowStock: { id: string; name: string; slug: string; stock_qty: number; is_active: boolean }[];
  recentOrders: { id: string; order_number: string; email: string; status: string; total: number; created_at: string }[];
};

const currency = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "NGN";
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 });
const compactMoney = new Intl.NumberFormat("en-NG", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });
const statusPalette = ["#b8860b", "#1a1a1a", "#6b6b6b", "#d9cfbe", "#9c6b12", "#f6eee3"];

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function RevenueTrendChart({ months }: { months: MonthlyPerformance[] }) {
  const width = 760;
  const height = 290;
  const left = 62;
  const right = 22;
  const top = 28;
  const baseline = 218;
  const chartWidth = width - left - right;
  const chartHeight = baseline - top;
  const maxRevenue = Math.max(...months.map((month) => month.revenue), 1);
  const step = months.length > 1 ? chartWidth / (months.length - 1) : chartWidth;
  const points = months.map((month, index) => ({
    ...month,
    x: left + index * step,
    y: baseline - (month.revenue / maxRevenue) * chartHeight,
  }));
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = points.length ? `${linePath} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z` : "";
  const gridRows = Array.from({ length: 4 }, (_, index) => {
    const ratio = index / 3;
    return { y: top + ratio * chartHeight, value: maxRevenue * (1 - ratio) };
  });

  return (
    <div className="admin-revenue-chart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue performance for the last six months">
        <defs>
          <linearGradient id="adminRevenueArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8860b" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#b8860b" stopOpacity="0.015" />
          </linearGradient>
        </defs>
        {gridRows.map((row) => (
          <g key={row.y}>
            <line className="admin-chart-grid-line" x1={left} y1={row.y} x2={width - right} y2={row.y} />
            <text className="admin-chart-axis-value" x={left - 12} y={row.y + 4} textAnchor="end">{compactMoney.format(row.value)}</text>
          </g>
        ))}
        {areaPath ? <path className="admin-chart-area" d={areaPath} /> : null}
        {linePath ? <path className="admin-chart-line" d={linePath} /> : null}
        {points.map((point) => (
          <g key={point.key}>
            <circle className="admin-chart-point-halo" cx={point.x} cy={point.y} r="8" />
            <circle className="admin-chart-point" cx={point.x} cy={point.y} r="4" />
            <text className="admin-chart-month" x={point.x} y="250" textAnchor="middle">{point.label}</text>
            <text className="admin-chart-order-count" x={point.x} y="270" textAnchor="middle">{point.orders} {point.orders === 1 ? "order" : "orders"}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function OrderStatusChart({ items }: { items: StatusBreakdown[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradientParts = items.map((item, index) => {
    const start = cursor;
    cursor += total ? (item.value / total) * 100 : 0;
    return `${statusPalette[index % statusPalette.length]} ${start}% ${cursor}%`;
  });
  const donutBackground = total ? `conic-gradient(${gradientParts.join(", ")})` : "conic-gradient(#ded4c5 0 100%)";

  return (
    <div className="admin-status-chart-layout">
      <div className="admin-donut-chart" style={{ background: donutBackground }} aria-label={`${total} total orders`}>
        <div><strong>{total}</strong><span>Total orders</span></div>
      </div>
      <div className="admin-status-legend">
        {items.length ? items.map((item, index) => (
          <div key={item.status}>
            <span className="admin-status-legend-dot" style={{ background: statusPalette[index % statusPalette.length] }} />
            <p><strong>{titleCase(item.status)}</strong><small>{item.value} {item.value === 1 ? "order" : "orders"}</small></p>
            <b>{total ? Math.round((item.value / total) * 100) : 0}%</b>
          </div>
        )) : <div className="admin-chart-empty-copy"><strong>No order activity yet</strong><small>Status distribution will appear after the first order.</small></div>}
      </div>
    </div>
  );
}

export function AdminDashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    ownerFetch<Overview>("/api/admin/overview").then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load dashboard."));
  }, []);

  return (
    <div className="admin-page-stack">
      <section className="admin-dashboard-hero">
        <div>
          <p className="wa-eyebrow">WOW & AMAZING OPERATIONS</p>
          <h1>Run your store with clarity.</h1>
          <p>Live products, rentals, orders, payments, customers and service activity—all organised in one private workspace.</p>
          <div className="admin-dashboard-hero-actions">
            <Link className="button-primary" href="/admin/products/new"><PlusIcon size={17} /> Add New Product</Link>
            <Link className="button-secondary" href="/admin/orders">Review Orders <ArrowRightIcon size={17} /></Link>
          </div>
        </div>
        <div className="admin-dashboard-health">
          <span className="admin-dashboard-health-icon"><BoxIcon size={28} /></span>
          <p>Store status</p>
          <strong>Operational</strong>
          <small>{data ? `${data.metrics.pendingOrders} orders need attention · ${data.lowStock.length} low-stock items` : "Checking live store activity…"}</small>
        </div>
      </section>

      <section className="admin-live-data-banner">
        <div><span>LIVE DATA ONLY</span><strong>Test records and starter products are archived.</strong></div>
        <p>New owner-published products and genuine customer activity will update every metric and chart automatically.</p>
      </section>

      {error ? <div className="admin-alert error">{error}</div> : null}
      {!data ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading business overview…</p></div> : (
        <>
          <section className="admin-metric-grid" aria-label="Business metrics">
            <article><span className="admin-metric-icon"><CreditCardIcon size={21} /></span><div><span>Total revenue</span><strong>{money.format(data.metrics.revenue)}</strong><small>Live paid and fulfilled orders</small></div></article>
            <article><span className="admin-metric-icon"><BoxIcon size={21} /></span><div><span>Total orders</span><strong>{data.metrics.orders}</strong><small>{data.metrics.pendingOrders} currently need attention</small></div></article>
            <article><span className="admin-metric-icon"><BagIcon size={21} /></span><div><span>Catalog items</span><strong>{data.metrics.products}</strong><small>Live products and rentals</small></div></article>
            <article><span className="admin-metric-icon"><UserIcon size={21} /></span><div><span>Customers</span><strong>{data.metrics.customers}</strong><small>Live registered customer accounts</small></div></article>
          </section>

          <section className="admin-analytics-grid" aria-label="Store analytics">
            <article className="admin-panel admin-analytics-panel admin-revenue-panel">
              <div className="admin-panel-heading admin-chart-heading">
                <div><p className="wa-eyebrow">SALES PERFORMANCE</p><h2>Revenue trend</h2><span>Paid revenue and order volume across the latest six months.</span></div>
                <div className="admin-chart-summary"><small>6-month revenue</small><strong>{money.format(data.analytics.monthlyPerformance.reduce((sum, month) => sum + month.revenue, 0))}</strong></div>
              </div>
              <RevenueTrendChart months={data.analytics.monthlyPerformance} />
            </article>

            <article className="admin-panel admin-analytics-panel admin-status-panel">
              <div className="admin-panel-heading admin-chart-heading">
                <div><p className="wa-eyebrow">ORDER HEALTH</p><h2>Status overview</h2><span>See where every customer order currently stands.</span></div>
              </div>
              <OrderStatusChart items={data.analytics.statusBreakdown} />
              <Link className="admin-chart-link" href="/admin/orders">Manage all orders <ArrowRightIcon size={15} /></Link>
            </article>
          </section>

          <section className="admin-quick-action-grid" aria-label="Quick actions">
            <Link href="/admin/products/new"><span><PlusIcon size={20} /></span><div><strong>Add a product</strong><small>Publish products or rental properties</small></div><ArrowRightIcon size={17} /></Link>
            <Link href="/admin/orders"><span><BoxIcon size={20} /></span><div><strong>Process orders</strong><small>Update fulfilment and customer timelines</small></div><ArrowRightIcon size={17} /></Link>
            <Link href="/admin/payments"><span><CreditCardIcon size={20} /></span><div><strong>Review payments</strong><small>Reconcile Paystack attempts safely</small></div><ArrowRightIcon size={17} /></Link>
            <Link href="/admin/inquiries"><span><ChatIcon size={20} /></span><div><strong>Answer enquiries</strong><small>Handle service and contact requests</small></div><ArrowRightIcon size={17} /></Link>
          </section>

          <div className="admin-dashboard-grid">
            <section className="admin-panel admin-panel-orders">
              <div className="admin-panel-heading"><div><p className="wa-eyebrow">RECENT ACTIVITY</p><h2>Latest orders</h2><span>Newest customer purchases and their current status.</span></div><Link href="/admin/orders">View all <ArrowRightIcon size={15} /></Link></div>
              {data.recentOrders.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Total</th><th>Date</th></tr></thead><tbody>{data.recentOrders.map((order) => <tr key={order.id}><td><strong>{order.order_number}</strong></td><td>{order.email}</td><td><span className={`admin-status ${order.status}`}>{order.status}</span></td><td>{money.format(Number(order.total))}</td><td>{date.format(new Date(order.created_at))}</td></tr>)}</tbody></table></div> : <div className="admin-empty"><h3>No orders yet.</h3><p>New paid orders will appear here immediately.</p></div>}
            </section>

            <section className="admin-panel admin-panel-stock">
              <div className="admin-panel-heading"><div><p className="wa-eyebrow">STOCK WATCH</p><h2>Low stock</h2><span>Items with five units or fewer.</span></div><Link href="/admin/products">Manage <ArrowRightIcon size={15} /></Link></div>
              {data.lowStock.length ? <div className="admin-stock-list">{data.lowStock.map((product) => <Link href={`/admin/products/${product.id}/edit`} key={product.id}><span><strong>{product.name}</strong><small>{product.is_active ? "Published" : "Draft"}</small></span><b>{product.stock_qty} left</b></Link>)}</div> : <div className="admin-empty compact"><h3>Stock levels look healthy.</h3><p>No product is currently at five units or below.</p></div>}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

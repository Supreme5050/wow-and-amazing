import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

type OrderOverviewRow = {
  total: number | string | null;
  status: string | null;
  created_at: string;
};

const revenueStatuses = new Set(["paid", "processing", "shipped", "delivered"]);
const statusOrder = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

function buildMonthlyPerformance(orders: OrderOverviewRow[]) {
  const monthFormatter = new Intl.DateTimeFormat("en-NG", { month: "short" });
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - index), 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return { key, label: monthFormatter.format(date), revenue: 0, orders: 0 };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));

  orders.forEach((order) => {
    const createdAt = new Date(order.created_at);
    if (Number.isNaN(createdAt.getTime())) return;

    const key = `${createdAt.getUTCFullYear()}-${String(createdAt.getUTCMonth() + 1).padStart(2, "0")}`;
    const month = monthMap.get(key);
    if (!month) return;

    month.orders += 1;
    if (order.status && revenueStatuses.has(order.status)) {
      month.revenue += Number(order.total ?? 0);
    }
  });

  return months;
}

function buildStatusBreakdown(orders: OrderOverviewRow[]) {
  const counts = orders.reduce<Map<string, number>>((result, order) => {
    const status = order.status?.trim().toLowerCase() || "unknown";
    result.set(status, (result.get(status) ?? 0) + 1);
    return result;
  }, new Map());

  return [...counts.entries()]
    .map(([status, value]) => ({ status, value }))
    .sort((a, b) => {
      const aIndex = statusOrder.indexOf(a.status);
      const bIndex = statusOrder.indexOf(b.status);
      if (aIndex === -1 && bIndex === -1) return b.value - a.value;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const [productsCount, ordersCount, customerCount, ordersResult, lowStockResult, recentResult] = await Promise.all([
    auth.admin.from("products").select("id", { count: "exact", head: true }).eq("is_demo", false),
    auth.admin.from("orders").select("id", { count: "exact", head: true }).eq("is_test_data", false),
    auth.admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer").eq("is_test_account", false),
    auth.admin.from("orders").select("total, status, created_at").eq("is_test_data", false),
    auth.admin.from("products").select("id, name, slug, stock_qty, is_active").eq("is_demo", false).lte("stock_qty", 5).order("stock_qty", { ascending: true }).limit(6),
    auth.admin.from("orders").select("id, order_number, email, status, total, created_at").eq("is_test_data", false).order("created_at", { ascending: false }).limit(6),
  ]);

  const orders = (ordersResult.data ?? []) as OrderOverviewRow[];
  const revenue = orders.reduce((sum, order) => order.status && revenueStatuses.has(order.status) ? sum + Number(order.total ?? 0) : sum, 0);
  const pendingOrders = orders.filter((order) => order.status === "pending" || order.status === "paid").length;

  return NextResponse.json({
    metrics: {
      revenue,
      products: productsCount.count ?? 0,
      orders: ordersCount.count ?? 0,
      customers: customerCount.count ?? 0,
      pendingOrders,
    },
    analytics: {
      monthlyPerformance: buildMonthlyPerformance(orders),
      statusBreakdown: buildStatusBreakdown(orders),
    },
    lowStock: lowStockResult.data ?? [],
    recentOrders: recentResult.data ?? [],
  });
}

import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const { data, error } = await auth.admin
    .from("orders")
    .select("id, order_number, email, status, total, address, payment_provider, payment_reference, currency, payment_channel, paid_at, created_at, order_items(id, product_name, variant_name, unit_price, qty), order_status_events(id, status, note, created_at)")
    .eq("is_test_data", false)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}

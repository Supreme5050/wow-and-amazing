import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const { data, error } = await auth.admin
    .from("payment_attempts")
    .select("id, reference, email, amount, currency, status, access_code, authorization_url, order_id, failure_reason, created_at, updated_at, orders(order_number)")
    .eq("is_test_data", false)
    .order("created_at", { ascending: false })
    .limit(250);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ payments: data ?? [] });
}

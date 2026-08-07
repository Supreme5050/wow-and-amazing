import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

const statuses = new Set(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const { id } = await context.params;
  const body = await request.json() as { status?: string; note?: string };
  const status = String(body.status ?? "");
  const note = String(body.note ?? "").trim().slice(0, 1000);
  if (!status || !statuses.has(status)) return NextResponse.json({ error: "Invalid order status." }, { status: 400 });

  const { data: current, error: currentError } = await auth.admin.from("orders").select("status").eq("id", id).eq("is_test_data", false).single();
  if (currentError) return NextResponse.json({ error: currentError.message }, { status: 404 });

  if (current.status !== status) {
    const { error } = await auth.admin.from("orders").update({ status }).eq("id", id).eq("is_test_data", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    if (note) {
      const { data: latest } = await auth.admin
        .from("order_status_events")
        .select("id")
        .eq("order_id", id)
        .eq("status", status)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (latest?.id) await auth.admin.from("order_status_events").update({ note }).eq("id", latest.id);
    }
  } else if (note) {
    const { error } = await auth.admin.from("order_status_events").insert({ order_id: id, status, note, created_by: auth.user.id });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

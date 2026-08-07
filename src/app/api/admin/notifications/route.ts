import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";
import { getPublicNotificationSetup } from "@/lib/notifications/server";

type DeliveryRow = {
  notification_id: string;
  channel: string;
  provider: string;
  recipient: string;
  status: string;
  provider_message_id: string | null;
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
};

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const limitValue = Number(request.nextUrl.searchParams.get("limit") || 30);
  const limit = Number.isFinite(limitValue) ? Math.min(Math.max(Math.floor(limitValue), 1), 100) : 30;
  const unreadOnly = request.nextUrl.searchParams.get("unread") === "true";

  let query = auth.admin
    .from("business_notifications")
    .select("id, event_type, title, body, href, is_test_data, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) query = query.is("read_at", null);

  const [{ data: notifications, error }, unreadResult] = await Promise.all([
    query,
    auth.admin
      .from("business_notifications")
      .select("id", { count: "exact", head: true })
      .is("read_at", null)
      .eq("is_test_data", false),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const ids = (notifications || []).map((item) => String(item.id));
  let deliveries: DeliveryRow[] = [];

  if (ids.length) {
    const { data, error: deliveryError } = await auth.admin
      .from("notification_deliveries")
      .select("notification_id, channel, provider, recipient, status, provider_message_id, attempts, last_error, sent_at, delivered_at")
      .in("notification_id", ids)
      .order("created_at", { ascending: true });
    if (deliveryError) return NextResponse.json({ error: deliveryError.message }, { status: 500 });
    deliveries = (data || []) as DeliveryRow[];
  }

  const deliveryMap = deliveries.reduce<Record<string, DeliveryRow[]>>((result, delivery) => {
    (result[delivery.notification_id] ||= []).push(delivery);
    return result;
  }, {});

  return NextResponse.json({
    notifications: (notifications || []).map((notification) => ({
      ...notification,
      deliveries: deliveryMap[String(notification.id)] || [],
    })),
    unreadCount: unreadResult.count ?? 0,
    setup: getPublicNotificationSetup(),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const body = await request.json().catch(() => ({})) as { id?: string; markAll?: boolean };
  const readAt = new Date().toISOString();

  if (body.markAll) {
    const { error } = await auth.admin
      .from("business_notifications")
      .update({ read_at: readAt })
      .is("read_at", null)
      .eq("is_test_data", false);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  const id = String(body.id || "").trim();
  if (!id) return NextResponse.json({ error: "Notification id is required." }, { status: 400 });

  const { error } = await auth.admin
    .from("business_notifications")
    .update({ read_at: readAt })
    .eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

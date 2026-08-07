import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";
import { sendManualTestNotification } from "@/lib/notifications/server";

export async function POST(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const body = await request.json().catch(() => ({})) as { channel?: string };
  const channel = body.channel === "email" || body.channel === "whatsapp" ? body.channel : "all";
  const ownerName = String(auth.user.user_metadata?.full_name || auth.user.email || "Store Owner");

  try {
    const result = await sendManualTestNotification(channel, ownerName);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to send the test notification." },
      { status: 500 },
    );
  }
}

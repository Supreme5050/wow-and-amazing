import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const [serviceResult, contactResult] = await Promise.all([
    auth.admin.from("service_inquiries").select("id, service_title, full_name, email, phone, company, budget, preferred_date, message, status, owner_notes, created_at, updated_at").eq("is_test_data", false).order("created_at", { ascending: false }).limit(300),
    auth.admin.from("contact_messages").select("id, full_name, email, phone, subject, message, status, owner_notes, created_at, updated_at").eq("is_test_data", false).order("created_at", { ascending: false }).limit(300),
  ]);

  if (serviceResult.error) return NextResponse.json({ error: serviceResult.error.message }, { status: 500 });
  if (contactResult.error) return NextResponse.json({ error: contactResult.error.message }, { status: 500 });
  return NextResponse.json({ serviceInquiries: serviceResult.data ?? [], contactMessages: contactResult.data ?? [] });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const input = await request.json() as { type?: string; id?: string; status?: string; ownerNotes?: string };
  const table = input.type === "contact" ? "contact_messages" : input.type === "service" ? "service_inquiries" : null;
  if (!table || !input.id) return NextResponse.json({ error: "A valid message type and id are required." }, { status: 400 });

  const allowed = table === "contact_messages"
    ? ["new", "read", "replied", "closed"]
    : ["new", "contacted", "quoted", "booked", "completed", "closed"];
  if (!allowed.includes(String(input.status))) return NextResponse.json({ error: "Select a valid status." }, { status: 400 });

  const { error } = await auth.admin.from(table).update({
    status: input.status,
    owner_notes: String(input.ownerNotes ?? "").trim() || null,
  }).eq("id", input.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

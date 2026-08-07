import { after, NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTestDataEnvironment } from "@/lib/store/dataMode";
import { notifyContactMessage } from "@/lib/notifications/server";

function clean(value: unknown, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Contact messages are temporarily unavailable." }, { status: 503 });

  const input = await request.json() as Record<string, unknown>;
  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 254).toLowerCase();
  const subject = clean(input.subject, 200);
  const message = clean(input.message, 6000);

  if (!fullName || !email || !subject || message.length < 10) {
    return NextResponse.json({ error: "Name, email, subject, and message are required." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const { data: contactMessage, error } = await admin.from("contact_messages").insert({
    full_name: fullName,
    email,
    phone: clean(input.phone, 60) || null,
    subject,
    message,
    is_test_data: isTestDataEnvironment(),
  }).select("id").single();

  if (error || !contactMessage) return NextResponse.json({ error: error?.message || "Unable to save your message." }, { status: 500 });
  after(() => notifyContactMessage(String(contactMessage.id)).catch(() => undefined));
  return NextResponse.json({ message: "Thank you. Your message has been received and added to the private owner inbox." }, { status: 201 });
}

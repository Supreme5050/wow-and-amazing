import { after, NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTestDataEnvironment } from "@/lib/store/dataMode";
import { notifyServiceInquiry } from "@/lib/notifications/server";

function clean(value: unknown, max = 5000) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: NextRequest) {
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Service enquiries are temporarily unavailable." }, { status: 503 });

  const input = await request.json() as Record<string, unknown>;
  const fullName = clean(input.fullName, 120);
  const email = clean(input.email, 254).toLowerCase();
  const serviceSlug = clean(input.serviceSlug, 120);
  const message = clean(input.message, 6000);

  if (!fullName || !email || !serviceSlug || message.length < 20) {
    return NextResponse.json({ error: "Name, email, service, and at least 20 characters of project details are required." }, { status: 400 });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const { data: service, error: serviceError } = await admin
    .from("services")
    .select("id, title")
    .eq("slug", serviceSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (serviceError || !service) return NextResponse.json({ error: "Select an available service." }, { status: 400 });

  const preferredDate = clean(input.preferredDate, 20);
  const { data: inquiry, error } = await admin.from("service_inquiries").insert({
    service_id: service.id,
    service_title: service.title,
    full_name: fullName,
    email,
    phone: clean(input.phone, 60) || null,
    company: clean(input.company, 160) || null,
    budget: clean(input.budget, 120) || null,
    preferred_date: preferredDate || null,
    message,
    is_test_data: isTestDataEnvironment(),
  }).select("id").single();

  if (error || !inquiry) return NextResponse.json({ error: error?.message || "Unable to save your enquiry." }, { status: 500 });
  after(() => notifyServiceInquiry(String(inquiry.id)).catch(() => undefined));
  return NextResponse.json({ message: "Your service enquiry has been received. The owner will contact you with the next steps." }, { status: 201 });
}

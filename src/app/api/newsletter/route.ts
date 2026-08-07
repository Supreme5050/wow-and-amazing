import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTestDataEnvironment } from "@/lib/store/dataMode";

const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Newsletter signup is not connected to Supabase yet." }, { status: 503 });
  }

  const isTestData = isTestDataEnvironment();
  const { data: existing, error: lookupError } = await admin
    .from("newsletter_subscribers")
    .select("id, is_test_data")
    .ilike("email", email)
    .maybeSingle();

  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 400 });

  if (existing) {
    if (existing.is_test_data !== isTestData) {
      const { error } = await admin
        .from("newsletter_subscribers")
        .update({ is_test_data: isTestData })
        .eq("id", existing.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  const { error } = await admin.from("newsletter_subscribers").insert({
    email,
    is_test_data: isTestData,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, alreadySubscribed: false });
}

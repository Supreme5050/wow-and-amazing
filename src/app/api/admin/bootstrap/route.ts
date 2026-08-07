import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const admin = getSupabaseAdminClient();
  const configuredEmail = process.env.ADMIN_OWNER_EMAIL?.trim().toLowerCase();
  if (!admin || !configuredEmail || configuredEmail === "owner@example.com") {
    return NextResponse.json(
      { error: "Set ADMIN_OWNER_EMAIL and the Supabase server keys in .env.local first." },
      { status: 503 },
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const { data, error } = await admin.auth.getUser(token);
  const user = data.user;
  if (error || !user?.email) return NextResponse.json({ error: "Your session is invalid or expired." }, { status: 401 });
  if (user.email.toLowerCase() !== configuredEmail) {
    return NextResponse.json({ error: "This email is not authorised as the Wow & Amazing owner." }, { status: 403 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? "Store Owner",
    role: "owner",
  });

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTestDataEnvironment } from "@/lib/store/dataMode";

export async function POST(request: NextRequest) {
  if (isTestDataEnvironment()) {
    return NextResponse.json({ promoted: false, mode: "test" });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase server configuration is incomplete." }, { status: 503 });

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "Sign in is required." }, { status: 401 });

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return NextResponse.json({ error: "The customer session is invalid." }, { status: 401 });

  const { error: updateError } = await admin
    .from("profiles")
    .update({ is_test_account: false })
    .eq("id", data.user.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ promoted: true, mode: "live" });
}

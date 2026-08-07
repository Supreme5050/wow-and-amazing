import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type OwnerAuth = {
  user: User;
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>;
};

export async function requireOwner(request: NextRequest): Promise<OwnerAuth | NextResponse> {
  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Supabase server configuration is incomplete." },
      { status: 503 },
    );
  }

  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const { data: authData, error: authError } = await admin.auth.getUser(token);
  const user = authData.user;
  if (authError || !user) return NextResponse.json({ error: "Your session is invalid or expired." }, { status: 401 });

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "owner") {
    return NextResponse.json({ error: "This account is not authorised as the store owner." }, { status: 403 });
  }

  return { user, admin };
}

export function isOwnerAuth(value: OwnerAuth | NextResponse): value is OwnerAuth {
  return !(value instanceof NextResponse);
}

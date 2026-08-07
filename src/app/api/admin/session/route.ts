import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const { data: profile } = await auth.admin
    .from("profiles")
    .select("full_name, email, role")
    .eq("id", auth.user.id)
    .single();

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      fullName: profile?.full_name || auth.user.user_metadata?.full_name || "Store Owner",
      role: profile?.role,
    },
  });
}

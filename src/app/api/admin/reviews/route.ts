import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  is_visible: boolean;
  owner_response: string | null;
  created_at: string;
  updated_at: string;
  products: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const { data, error } = await auth.admin
    .from("reviews")
    .select("id, product_id, user_id, rating, comment, is_visible, owner_response, created_at, updated_at, products(name, slug)")
    .eq("is_test_data", false)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as unknown as ReviewRow[];
  const userIds = [...new Set(rows.map((review) => review.user_id))];
  const names = new Map<string, { full_name: string | null; email: string | null }>();
  if (userIds.length) {
    const { data: profiles, error: profileError } = await auth.admin.from("profiles").select("id, full_name, email").in("id", userIds);
    if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });
    for (const profile of profiles ?? []) names.set(profile.id, { full_name: profile.full_name, email: profile.email });
  }

  return NextResponse.json({
    reviews: rows.map((review) => ({
      ...review,
      customer: names.get(review.user_id) ?? { full_name: null, email: null },
      product: Array.isArray(review.products) ? review.products[0] ?? null : review.products,
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const input = await request.json() as { id?: string; isVisible?: boolean; ownerResponse?: string };
  const id = String(input.id ?? "").trim();
  if (!id) return NextResponse.json({ error: "Review id is required." }, { status: 400 });

  const { error } = await auth.admin
    .from("reviews")
    .update({
      is_visible: input.isVisible !== false,
      owner_response: String(input.ownerResponse ?? "").trim() || null,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const id = request.nextUrl.searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "Review id is required." }, { status: 400 });
  const { error } = await auth.admin.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

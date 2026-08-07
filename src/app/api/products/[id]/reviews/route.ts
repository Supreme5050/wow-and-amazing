import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { isTestDataEnvironment } from "@/lib/store/dataMode";

type ReviewRow = {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  owner_response: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
};

const paidStatuses = ["paid", "processing", "shipped", "delivered"];

function displayName(fullName: string | null | undefined) {
  const parts = String(fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Verified Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts.at(-1)?.[0] ?? ""}.`;
}

async function optionalUser(request: NextRequest, admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>): Promise<User | null> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const { data, error } = await admin.auth.getUser(token);
  return error ? null : data.user;
}

async function hasPurchasedProduct(
  admin: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  userId: string,
  productId: string,
) {
  const { data: orders, error: orderError } = await admin
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .in("status", paidStatuses)
    .eq("is_test_data", isTestDataEnvironment())
    .limit(250);

  if (orderError || !orders?.length) return false;
  const orderIds = orders.map((order) => order.id);
  const { count, error } = await admin
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .in("order_id", orderIds)
    .eq("product_id", productId);

  return !error && (count ?? 0) > 0;
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });

  const { id: productId } = await context.params;
  const user = await optionalUser(request, admin);

  const { data, error } = await admin
    .from("reviews")
    .select("id, user_id, rating, comment, owner_response, is_visible, created_at, updated_at")
    .eq("product_id", productId)
    .eq("is_test_data", isTestDataEnvironment())
    .or(user ? `is_visible.eq.true,user_id.eq.${user.id}` : "is_visible.eq.true")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as ReviewRow[];
  const userIds = [...new Set(rows.map((review) => review.user_id))];
  const profileNames = new Map<string, string>();

  if (userIds.length) {
    const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", userIds);
    for (const profile of profiles ?? []) profileNames.set(profile.id, displayName(profile.full_name));
  }

  const publicRows = rows.filter((review) => review.is_visible);
  const summary = {
    rating: publicRows.length ? publicRows.reduce((sum, review) => sum + Number(review.rating), 0) / publicRows.length : 0,
    count: publicRows.length,
  };

  const existingReview = user ? rows.find((review) => review.user_id === user.id) ?? null : null;
  const canReview = user ? await hasPurchasedProduct(admin, user.id, productId) : false;

  return NextResponse.json({
    reviews: publicRows.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      ownerResponse: review.owner_response,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      displayName: profileNames.get(review.user_id) ?? "Verified Customer",
      isMine: user?.id === review.user_id,
    })),
    summary,
    viewer: {
      signedIn: Boolean(user),
      canReview,
      existingReview: existingReview ? {
        id: existingReview.id,
        rating: existingReview.rating,
        comment: existingReview.comment,
        isVisible: existingReview.is_visible,
      } : null,
    },
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });

  const { id: productId } = await context.params;
  const user = await optionalUser(request, admin);
  if (!user) return NextResponse.json({ error: "Sign in before writing a review." }, { status: 401 });

  const input = await request.json() as { rating?: number; comment?: string };
  const rating = Math.floor(Number(input.rating));
  const comment = String(input.comment ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choose a rating from one to five stars." }, { status: 400 });
  }
  if (comment.length < 10 || comment.length > 1200) {
    return NextResponse.json({ error: "Your review must be between 10 and 1,200 characters." }, { status: 400 });
  }

  const purchased = await hasPurchasedProduct(admin, user.id, productId);
  if (!purchased) {
    return NextResponse.json({ error: "Only customers with a paid order for this product can review it." }, { status: 403 });
  }

  const { data, error } = await admin
    .from("reviews")
    .upsert({ product_id: productId, user_id: user.id, rating, comment, is_test_data: isTestDataEnvironment() }, { onConflict: "product_id,user_id" })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ review: data }, { status: 201 });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const admin = getSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: "Supabase server access is not configured." }, { status: 503 });

  const { id: productId } = await context.params;
  const user = await optionalUser(request, admin);
  if (!user) return NextResponse.json({ error: "Sign in before deleting a review." }, { status: 401 });

  const { error } = await admin.from("reviews").delete().eq("product_id", productId).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

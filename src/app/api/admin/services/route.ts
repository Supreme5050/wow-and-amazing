import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

type ServiceInput = {
  id?: string;
  title?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  priceFrom?: number | string | null;
  turnaround?: string;
  deliverables?: string[];
  isActive?: boolean;
  sortOrder?: number | string;
};

function normalize(input: ServiceInput) {
  const slug = String(input.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const priceValue = input.priceFrom === null || input.priceFrom === "" || input.priceFrom === undefined ? null : Math.max(0, Number(input.priceFrom) || 0);
  return {
    title: String(input.title ?? "").trim(),
    slug,
    short_description: String(input.shortDescription ?? "").trim(),
    description: String(input.description ?? "").trim(),
    image_url: String(input.imageUrl ?? "").trim() || null,
    price_from: priceValue,
    turnaround: String(input.turnaround ?? "").trim() || null,
    deliverables: (input.deliverables ?? []).map((item) => String(item).trim()).filter(Boolean).slice(0, 12),
    is_active: input.isActive !== false,
    sort_order: Math.max(0, Math.floor(Number(input.sortOrder) || 0)),
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const { data, error } = await auth.admin
    .from("services")
    .select("id, slug, title, short_description, description, image_url, price_from, turnaround, deliverables, is_active, sort_order, created_at, updated_at")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ services: data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const values = normalize(await request.json() as ServiceInput);
  if (!values.title || !values.slug || !values.short_description || !values.description) {
    return NextResponse.json({ error: "Title, slug, short description, and full description are required." }, { status: 400 });
  }
  const { data, error } = await auth.admin.from("services").insert(values).select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ service: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const input = await request.json() as ServiceInput;
  const id = String(input.id ?? "");
  const values = normalize(input);
  if (!id || !values.title || !values.slug || !values.short_description || !values.description) {
    return NextResponse.json({ error: "A valid service and all required fields are needed." }, { status: 400 });
  }
  const { error } = await auth.admin.from("services").update(values).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Service id is required." }, { status: 400 });
  const { error } = await auth.admin.from("services").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

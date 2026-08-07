import { NextRequest, NextResponse } from "next/server";
import { isOwnerAuth, requireOwner } from "@/lib/admin/auth";

type VariantInput = { name: string; priceDelta: number; stockQty: number };
type ProductInput = {
  name: string;
  slug: string;
  categoryId: string;
  subcategorySlug: string;
  description: string;
  price: number;
  imageUrls: string[];
  isFeatured: boolean;
  isActive: boolean;
  variants: VariantInput[];
  rentalBedrooms?: number | string | null;
  rentalBathrooms?: number | string | null;
  rentalLocation?: string | null;
  rentalSizeLabel?: string | null;
  rentalPropertyType?: string | null;
  rentalStatus?: "available" | "reserved" | "rented" | null;
};

function values(input: ProductInput) {
  const variants = (input.variants ?? []).map((variant) => ({
    name: String(variant.name ?? "").trim(),
    price_delta: Math.max(0, Number(variant.priceDelta) || 0),
    stock_qty: Math.max(0, Math.floor(Number(variant.stockQty) || 0)),
  })).filter((variant) => variant.name);
  return {
    product: {
      name: String(input.name ?? "").trim(),
      slug: String(input.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      category_id: String(input.categoryId ?? ""),
      subcategory_slug: String(input.subcategorySlug ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      description: String(input.description ?? "").trim(),
      price: Math.max(0, Number(input.price) || 0),
      image_urls: (input.imageUrls ?? []).map(String).filter(Boolean).slice(0, 6),
      is_featured: Boolean(input.isFeatured),
      is_active: Boolean(input.isActive),
      stock_qty: variants.reduce((sum, variant) => sum + variant.stock_qty, 0),
      rental_bedrooms: input.rentalBedrooms === null || input.rentalBedrooms === undefined || input.rentalBedrooms === "" ? null : Math.max(0, Math.floor(Number(input.rentalBedrooms) || 0)),
      rental_bathrooms: input.rentalBathrooms === null || input.rentalBathrooms === undefined || input.rentalBathrooms === "" ? null : Math.max(0, Math.floor(Number(input.rentalBathrooms) || 0)),
      rental_location: input.rentalLocation ? String(input.rentalLocation).trim() || null : null,
      rental_size_label: input.rentalSizeLabel ? String(input.rentalSizeLabel).trim() || null : null,
      rental_property_type: input.rentalPropertyType ? String(input.rentalPropertyType).trim() || null : null,
      rental_status: String(input.subcategorySlug ?? "") === "houses-for-rent" ? (input.rentalStatus === "reserved" || input.rentalStatus === "rented" ? input.rentalStatus : "available") : null,
    },
    variants,
  };
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const { id } = await context.params;
  const { data, error } = await auth.admin
    .from("products")
    .select("id, name, slug, description, price, image_urls, is_featured, is_active, stock_qty, subcategory_slug, category_id, rental_bedrooms, rental_bathrooms, rental_location, rental_size_label, rental_property_type, rental_status, product_variants(id, name, price_delta, stock_qty)")
    .eq("id", id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ product: data });
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const { id } = await context.params;
  const { product, variants } = values(await request.json() as ProductInput);
  if (!product.name || !product.slug || !product.category_id || !product.subcategory_slug || !product.description || !product.image_urls.length || !variants.length) {
    return NextResponse.json({ error: "Complete every required product field, image, and option." }, { status: 400 });
  }

  const { error: updateError } = await auth.admin.from("products").update(product).eq("id", id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  const { error: deleteError } = await auth.admin.from("product_variants").delete().eq("product_id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  const { error: variantError } = await auth.admin.from("product_variants").insert(variants.map((variant) => ({ ...variant, product_id: id })));
  if (variantError) return NextResponse.json({ error: variantError.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;
  const { id } = await context.params;
  const { error } = await auth.admin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

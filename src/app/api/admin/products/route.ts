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

function normalizeInput(input: ProductInput) {
  const slug = String(input.slug ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const variants = (input.variants ?? [])
    .map((variant) => ({
      name: String(variant.name ?? "").trim(),
      price_delta: Math.max(0, Number(variant.priceDelta) || 0),
      stock_qty: Math.max(0, Math.floor(Number(variant.stockQty) || 0)),
    }))
    .filter((variant) => variant.name);
  return {
    name: String(input.name ?? "").trim(),
    slug,
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
    is_demo: false,
    variants,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const [products, categories] = await Promise.all([
    auth.admin
      .from("products")
      .select("id, name, slug, description, price, image_urls, is_featured, is_active, stock_qty, subcategory_slug, rental_status, is_demo, created_at, category_id, categories(name, slug), product_variants(id, name, price_delta, stock_qty)")
      .eq("is_demo", false)
      .order("created_at", { ascending: false }),
    auth.admin.from("categories").select("id, name, slug").order("sort_order", { ascending: true }),
  ]);

  if (products.error) return NextResponse.json({ error: products.error.message }, { status: 500 });
  if (categories.error) return NextResponse.json({ error: categories.error.message }, { status: 500 });
  return NextResponse.json({ products: products.data ?? [], categories: categories.data ?? [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireOwner(request);
  if (!isOwnerAuth(auth)) return auth;

  const input = normalizeInput(await request.json() as ProductInput);
  if (!input.name || !input.slug || !input.category_id || !input.subcategory_slug || !input.description || input.price < 0) {
    return NextResponse.json({ error: "Name, slug, category, collection, description, and a valid price are required." }, { status: 400 });
  }
  if (!input.image_urls.length) return NextResponse.json({ error: "Upload at least one product image." }, { status: 400 });
  if (!input.variants.length) return NextResponse.json({ error: "Add at least one product option, such as Standard." }, { status: 400 });

  const { variants, ...productValues } = input;
  const { data: product, error: productError } = await auth.admin
    .from("products")
    .insert(productValues)
    .select("id, slug")
    .single();

  if (productError || !product) return NextResponse.json({ error: productError?.message || "Unable to create product." }, { status: 400 });

  const { error: variantError } = await auth.admin
    .from("product_variants")
    .insert(variants.map((variant) => ({ ...variant, product_id: product.id })));

  if (variantError) {
    await auth.admin.from("products").delete().eq("id", product.id);
    return NextResponse.json({ error: variantError.message }, { status: 400 });
  }

  return NextResponse.json({ product }, { status: 201 });
}

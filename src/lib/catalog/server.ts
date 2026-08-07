import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  categories as fallbackCategories,
  featuredProducts as fallbackProducts,
  type CategorySeed,
  type ProductSeed,
  type ProductVariantSeed,
} from "@/data/catalog";

type RawCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
};

type RawVariant = {
  id: string;
  name: string;
  price_delta: number | string;
  stock_qty: number;
};

type RawReview = { rating: number; is_visible?: boolean };

type RawProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number | string;
  image_urls: string[] | null;
  is_featured: boolean;
  is_active: boolean;
  stock_qty: number;
  created_at: string;
  subcategory_slug: string | null;
  categories: { slug: string } | { slug: string }[] | null;
  product_variants: RawVariant[] | null;
  reviews: RawReview[] | null;
  rental_bedrooms: number | null;
  rental_bathrooms: number | null;
  rental_location: string | null;
  rental_size_label: string | null;
  rental_property_type: string | null;
  rental_status: "available" | "reserved" | "rented" | null;
  is_demo: boolean;
};

export type CatalogSnapshot = {
  categories: CategorySeed[];
  products: ProductSeed[];
  source: "supabase" | "fallback";
};

function publicServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey || url.includes("YOUR-PROJECT") || anonKey.includes("YOUR_")) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

function categorySlug(value: RawProduct["categories"]) {
  if (Array.isArray(value)) return value[0]?.slug ?? "";
  return value?.slug ?? "";
}

function mapVariant(variant: RawVariant): ProductVariantSeed {
  return {
    id: variant.id,
    name: variant.name,
    priceDelta: Number(variant.price_delta),
    stockQty: Number(variant.stock_qty),
  };
}

function mapProduct(product: RawProduct): ProductSeed {
  const lockedFallback = fallbackProducts.find((item) => item.id === product.id || item.slug === product.slug);
  const reviews = (product.reviews ?? []).filter((review) => review.is_visible !== false);
  const rating = reviews.length
    ? reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length
    : 0;
  const reviewCount = reviews.length;
  const variants = (product.product_variants ?? []).map(mapVariant);
  const normalizedVariants = variants.length
    ? variants
    : [{ id: `${product.id}-standard`, name: "Standard", priceDelta: 0, stockQty: Number(product.stock_qty) }];

  return {
    id: product.id,
    slug: product.slug,
    categorySlug: categorySlug(product.categories),
    subcategorySlug: product.subcategory_slug || lockedFallback?.subcategorySlug,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image_urls?.[0] || lockedFallback?.image || "/catalog/products/wireless-earbuds-pro.webp",
    rating,
    reviewCount,
    stockQty: Number(product.stock_qty),
    isFeatured: Boolean(product.is_featured),
    variants: normalizedVariants,
    rentalBedrooms: product.rental_bedrooms ?? undefined,
    rentalBathrooms: product.rental_bathrooms ?? undefined,
    rentalLocation: product.rental_location ?? undefined,
    rentalSizeLabel: product.rental_size_label ?? undefined,
    rentalPropertyType: product.rental_property_type ?? undefined,
    rentalStatus: product.rental_status ?? lockedFallback?.rentalStatus,
    isDemo: Boolean(product.is_demo),
  };
}

export const getCatalogSnapshot = cache(async (): Promise<CatalogSnapshot> => {
  const supabase = publicServerClient();
  if (!supabase) return { categories: fallbackCategories, products: [], source: "fallback" };

  const [categoryResult, productResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, image_url, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("products")
      .select("id, slug, name, description, price, image_urls, is_featured, is_active, stock_qty, subcategory_slug, created_at, rental_bedrooms, rental_bathrooms, rental_location, rental_size_label, rental_property_type, rental_status, is_demo, categories!inner(slug), product_variants(id, name, price_delta, stock_qty), reviews(rating, is_visible)")
      .eq("is_active", true)
      .eq("is_demo", false)
      .order("created_at", { ascending: false }),
  ]);

  if (categoryResult.error || productResult.error || !categoryResult.data || !productResult.data) {
    return { categories: fallbackCategories, products: [], source: "fallback" };
  }

  const rawCategories = categoryResult.data as unknown as RawCategory[];
  const rawProducts = productResult.data as unknown as RawProduct[];
  const categories: CategorySeed[] = rawCategories.map((category) => {
    const lockedFallback = fallbackCategories.find((item) => item.id === category.id || item.slug === category.slug);
    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      image: category.image_url || lockedFallback?.image || "/catalog/categories/gadgets-accessories.webp",
    };
  });
  const mappedProducts = rawProducts.map(mapProduct);
  const hasRealPublishedRental = mappedProducts.some((product) =>
    product.subcategorySlug === "houses-for-rent" && product.isDemo !== true,
  );
  const products = hasRealPublishedRental
    ? mappedProducts.filter((product) => !(product.subcategorySlug === "houses-for-rent" && product.isDemo === true))
    : mappedProducts;

  return {
    categories: categories.length ? categories : fallbackCategories,
    products,
    source: "supabase",
  };
});

export async function getProductBySlugLive(slug: string) {
  const snapshot = await getCatalogSnapshot();
  return snapshot.products.find((product) => product.slug === slug);
}

export async function getCategoryBySlugLive(slug: string) {
  const snapshot = await getCatalogSnapshot();
  return snapshot.categories.find((category) => category.slug === slug);
}


export async function searchCatalogProducts(query: string, limit = 24): Promise<ProductSeed[]> {
  const normalized = query.trim().replace(/\s+/g, " ").slice(0, 120);
  if (!normalized) return [];

  const safeLimit = Math.max(1, Math.min(Math.floor(limit) || 24, 60));
  const snapshot = await getCatalogSnapshot();
  const byId = new Map(snapshot.products.map((product) => [product.id, product]));
  const supabase = publicServerClient();

  if (supabase) {
    const { data, error } = await supabase.rpc("search_active_product_ids", {
      p_query: normalized,
      p_limit: safeLimit,
    });

    if (!error && Array.isArray(data)) {
      const ranked = (data as { product_id: string; search_rank: number }[])
        .map((row) => byId.get(row.product_id))
        .filter((product): product is ProductSeed => Boolean(product));
      if (ranked.length) return ranked;
    }
  }

  const words = normalized.toLowerCase().split(" ").filter(Boolean);
  const categoryNames = new Map(snapshot.categories.map((category) => [category.slug, category.name.toLowerCase()]));

  return snapshot.products
    .map((product) => {
      const name = product.name.toLowerCase();
      const description = product.description.toLowerCase();
      const category = categoryNames.get(product.categorySlug) ?? "";
      const collection = (product.subcategorySlug ?? "").replace(/-/g, " ");
      let score = 0;

      for (const word of words) {
        if (name === word) score += 12;
        if (name.startsWith(word)) score += 8;
        if (name.includes(word)) score += 6;
        if (category.includes(word)) score += 4;
        if (collection.includes(word)) score += 4;
        if (description.includes(word)) score += 2;
      }

      return { product, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || Number(b.product.isFeatured) - Number(a.product.isFeatured) || a.product.name.localeCompare(b.product.name))
    .slice(0, safeLimit)
    .map((entry) => entry.product);
}


export type PublicCustomerStory = {
  id: string;
  quote: string;
  name: string;
  rating: number;
  productName: string | null;
};

function publicCustomerName(fullName: string | null | undefined) {
  const parts = String(fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Verified Customer";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts.at(-1)?.[0] ?? ""}.`;
}

export const getPublicCustomerStories = cache(async (): Promise<PublicCustomerStory[]> => {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const { data: reviews, error } = await admin
    .from("reviews")
    .select("id, user_id, product_id, rating, comment, created_at")
    .eq("is_visible", true)
    .eq("is_test_data", false)
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !reviews?.length) return [];

  const userIds = [...new Set(reviews.map((review) => review.user_id))];
  const productIds = [...new Set(reviews.map((review) => review.product_id))];
  const [profilesResult, productsResult] = await Promise.all([
    admin.from("profiles").select("id, full_name").in("id", userIds).eq("is_test_account", false),
    admin.from("products").select("id, name").in("id", productIds).eq("is_demo", false),
  ]);

  const profileNames = new Map((profilesResult.data ?? []).map((profile) => [profile.id, publicCustomerName(profile.full_name)]));
  const productNames = new Map((productsResult.data ?? []).map((product) => [product.id, product.name]));

  return reviews.map((review) => ({
    id: review.id,
    quote: review.comment,
    name: profileNames.get(review.user_id) ?? "Verified Customer",
    rating: Number(review.rating),
    productName: productNames.get(review.product_id) ?? null,
  }));
});

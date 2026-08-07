import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type CheckoutRequestItem = {
  productId: string;
  variantId: string;
  qty: number;
};

export type CheckoutAddress = Record<string, string>;

type DbProduct = {
  id: string;
  name: string;
  price: number | string;
  stock_qty: number;
  is_active: boolean;
  subcategory_slug: string | null;
  rental_status: "available" | "reserved" | "rented" | null;
};

type DbVariant = {
  id: string;
  product_id: string;
  name: string;
  price_delta: number | string;
  stock_qty: number;
};

export type ValidatedCheckout = {
  items: CheckoutRequestItem[];
  subtotal: number;
  shipping: number;
  total: number;
  containsRental: boolean;
};

export type PaystackVerification = {
  status: boolean;
  message?: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel?: string;
    paid_at?: string;
    customer?: { email?: string };
  };
};

export async function validateCheckoutItems(items: CheckoutRequestItem[]): Promise<ValidatedCheckout> {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase server configuration is incomplete.");
  if (!Array.isArray(items) || items.length === 0) throw new Error("Your cart is empty.");

  const normalizedItems = items.map((item) => ({
    productId: String(item.productId || ""),
    variantId: String(item.variantId || ""),
    qty: Math.max(1, Math.floor(Number(item.qty) || 1)),
  }));

  if (normalizedItems.some((item) => !item.productId || !item.variantId)) {
    throw new Error("A cart item is incomplete.");
  }

  const productIds = [...new Set(normalizedItems.map((item) => item.productId))];
  const variantIds = [...new Set(normalizedItems.map((item) => item.variantId))];
  const [productsResult, variantsResult] = await Promise.all([
    admin.from("products").select("id, name, price, stock_qty, is_active, subcategory_slug, rental_status").in("id", productIds),
    admin.from("product_variants").select("id, product_id, name, price_delta, stock_qty").in("id", variantIds),
  ]);

  if (productsResult.error || variantsResult.error) {
    throw new Error(productsResult.error?.message || variantsResult.error?.message || "Unable to validate your cart.");
  }

  const products = new Map((productsResult.data as DbProduct[]).map((product) => [product.id, product]));
  const variants = new Map((variantsResult.data as DbVariant[]).map((variant) => [variant.id, variant]));
  let subtotal = 0;
  let merchandiseSubtotal = 0;
  let containsRental = false;
  const validatedItems: CheckoutRequestItem[] = [];

  for (const item of normalizedItems) {
    const product = products.get(item.productId);
    const variant = variants.get(item.variantId);
    if (!product || !product.is_active || !variant || variant.product_id !== product.id) {
      throw new Error("A product in your cart is no longer available.");
    }

    const rental = product.subcategory_slug === "houses-for-rent";
    const effectiveRentalStatus = product.stock_qty < 1 || product.rental_status === "rented"
      ? "rented"
      : product.rental_status === "reserved"
        ? "reserved"
        : "available";

    if (rental && effectiveRentalStatus !== "available") {
      throw new Error(`${product.name} is already ${effectiveRentalStatus} and cannot be checked out.`);
    }

    const qty = rental ? 1 : item.qty;
    if (qty > variant.stock_qty) {
      throw new Error(`${product.name} does not have enough stock for the requested quantity.`);
    }

    const lineTotal = (Number(product.price) + Number(variant.price_delta)) * qty;
    subtotal += lineTotal;
    if (rental) containsRental = true;
    else merchandiseSubtotal += lineTotal;
    validatedItems.push({ ...item, qty });
  }

  subtotal = Number(subtotal.toFixed(2));
  merchandiseSubtotal = Number(merchandiseSubtotal.toFixed(2));
  const shipping = merchandiseSubtotal === 0 || merchandiseSubtotal >= 50 ? 0 : 5;
  return {
    items: validatedItems,
    subtotal,
    shipping,
    total: Number((subtotal + shipping).toFixed(2)),
    containsRental,
  };
}

export async function verifyPaystackTransaction(reference: string): Promise<PaystackVerification> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is missing from the server environment.");

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    },
  );

  const payload = (await response.json()) as PaystackVerification;
  if (!response.ok || !payload.status) {
    throw new Error(payload.message || "Paystack could not verify this transaction.");
  }
  return payload;
}

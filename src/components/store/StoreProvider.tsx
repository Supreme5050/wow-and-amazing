/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type { User } from "@supabase/supabase-js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CartDrawer } from "@/components/store/CartDrawer";
import type { ProductSeed } from "@/data/catalog";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { canRentProduct, isRentalProduct } from "@/lib/catalog/rentals";

const CART_KEY = "wow-amazing-guest-cart";
const WISHLIST_KEY = "wow-amazing-guest-wishlist";

export type StoredCartItem = {
  productId: string;
  variantId: string;
  qty: number;
};

export type DetailedCartItem = StoredCartItem & {
  product: ProductSeed;
  variantName: string;
  unitPrice: number;
  lineTotal: number;
  stockQty: number;
};

type StoreContextValue = {
  ready: boolean;
  user: User | null;
  cart: StoredCartItem[];
  detailedCart: DetailedCartItem[];
  cartCount: number;
  cartSubtotal: number;
  wishlistIds: string[];
  wishlistProducts: ProductSeed[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (productId: string, variantId?: string, qty?: number, openDrawer?: boolean) => void;
  updateCartQuantity: (productId: string, variantId: string, qty: number) => void;
  removeFromCart: (productId: string, variantId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeCart(items: StoredCartItem[], products: ProductSeed[]) {
  const map = new Map<string, StoredCartItem>();

  for (const item of items) {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product || (isRentalProduct(product) && !canRentProduct(product))) continue;
    const variant = product.variants.find((entry) => entry.id === item.variantId) ?? product.variants[0];
    if (!variant || variant.stockQty < 1) continue;
    const requestedQty = Math.floor(Number(item.qty));
    if (!Number.isFinite(requestedQty) || requestedQty < 1) continue;
    const key = `${product.id}:${variant.id}`;
    const current = map.get(key);
    const rental = isRentalProduct(product);
    const qty = rental ? 1 : Math.min(requestedQty, variant.stockQty);
    const mergedQty = rental ? 1 : Math.min((current?.qty ?? 0) + qty, variant.stockQty);
    if (mergedQty < 1) continue;
    map.set(key, { productId: product.id, variantId: variant.id, qty: mergedQty });
  }

  return [...map.values()];
}

export function StoreProvider({ children, products }: { children: React.ReactNode; products: ProductSeed[] }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<StoredCartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    setCart(normalizeCart(readJson<StoredCartItem[]>(CART_KEY, []), products));
    setWishlistIds([...new Set(readJson<string[]>(WISHLIST_KEY, []).filter((id) => products.some((product) => product.id === id)))]);
    setReady(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    let active = true;

    async function mergeAccountData(nextUser: User) {
      const [{ data: remoteWishlist }, { data: remoteCart }] = await Promise.all([
        supabase!.from("wishlists").select("product_id").eq("user_id", nextUser.id),
        supabase!.from("cart_items").select("product_id, variant_id, qty").eq("user_id", nextUser.id),
      ]);

      if (!active) return;

      const localWishlist = readJson<string[]>(WISHLIST_KEY, []);
      const mergedWishlist = [...new Set([
        ...localWishlist,
        ...(remoteWishlist ?? []).map((item) => item.product_id as string),
      ])].filter((id) => products.some((product) => product.id === id));

      const localCart = readJson<StoredCartItem[]>(CART_KEY, []);
      const mergedCart = normalizeCart([
        ...localCart,
        ...(remoteCart ?? []).map((item) => ({
          productId: item.product_id as string,
          variantId: (item.variant_id as string | null) ?? "",
          qty: Number(item.qty),
        })),
      ], products);

      setWishlistIds(mergedWishlist);
      setCart(mergedCart);
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(mergedWishlist));
      window.localStorage.setItem(CART_KEY, JSON.stringify(mergedCart));

      await supabase!.from("wishlists").delete().eq("user_id", nextUser.id);
      if (mergedWishlist.length) {
        await supabase!.from("wishlists").insert(mergedWishlist.map((productId) => ({ user_id: nextUser.id, product_id: productId })));
      }

      await supabase!.from("cart_items").delete().eq("user_id", nextUser.id);
      if (mergedCart.length) {
        await supabase!.from("cart_items").insert(mergedCart.map((item) => ({
          user_id: nextUser.id,
          product_id: item.productId,
          variant_id: item.variantId,
          qty: item.qty,
        })));
      }
    }

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      userRef.current = data.user;
      setUser(data.user);
      if (data.user) void mergeAccountData(data.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      userRef.current = nextUser;
      setUser(nextUser);
      if (nextUser) void mergeAccountData(nextUser);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [products]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds, ready]);

  const detailedCart = useMemo<DetailedCartItem[]>(() => cart.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product || (isRentalProduct(product) && !canRentProduct(product))) return [];
    const variant = product.variants.find((entry) => entry.id === item.variantId) ?? product.variants[0];
    if (!variant || variant.stockQty < 1 || item.qty < 1) return [];
    const safeQty = isRentalProduct(product) ? 1 : Math.min(item.qty, variant.stockQty);
    if (safeQty < 1) return [];
    const unitPrice = product.price + variant.priceDelta;
    return [{ ...item, qty: safeQty, product, variantId: variant.id, variantName: variant.name, unitPrice, lineTotal: unitPrice * safeQty, stockQty: variant.stockQty }];
  }), [cart, products]);

  const syncCartItem = useCallback(async (item: StoredCartItem | null, productId: string, variantId: string) => {
    const currentUser = userRef.current;
    const supabase = getSupabaseBrowserClient();
    if (!currentUser || !supabase) return;

    const { data: existing } = await supabase
      .from("cart_items")
      .select("id")
      .eq("user_id", currentUser.id)
      .eq("product_id", productId)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (!item) {
      if (existing?.id) await supabase!.from("cart_items").delete().eq("id", existing.id);
      return;
    }

    if (existing?.id) {
      await supabase.from("cart_items").update({ qty: item.qty }).eq("id", existing.id);
    } else {
      await supabase!.from("cart_items").insert({ user_id: currentUser.id, product_id: productId, variant_id: variantId, qty: item.qty });
    }
  }, []);

  const addToCart = useCallback((productId: string, variantId?: string, qty = 1, openDrawer = true) => {
    const product = products.find((entry) => entry.id === productId);
    if (!product || (isRentalProduct(product) && !canRentProduct(product))) return;
    const variant = product.variants.find((entry) => entry.id === variantId) ?? product.variants[0];
    if (!variant || variant.stockQty < 1) return;

    let nextItem: StoredCartItem | null = null;
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId && item.variantId === variant.id);
      const rental = isRentalProduct(product);
      const next = existing
        ? current.map((item) => item === existing ? { ...item, qty: rental ? 1 : Math.min(item.qty + Math.max(1, qty), variant.stockQty) } : item)
        : [...current, { productId, variantId: variant.id, qty: rental ? 1 : Math.min(Math.max(1, qty), variant.stockQty) }];
      nextItem = next.find((item) => item.productId === productId && item.variantId === variant.id) ?? null;
      return next;
    });
    window.setTimeout(() => void syncCartItem(nextItem, productId, variant.id), 0);
    if (openDrawer) setCartOpen(true);
  }, [products, syncCartItem]);

  const updateCartQuantity = useCallback((productId: string, variantId: string, qty: number) => {
    const product = products.find((entry) => entry.id === productId);
    const variant = product?.variants.find((entry) => entry.id === variantId);
    if (product && isRentalProduct(product)) {
      if (!canRentProduct(product) || qty < 1) {
        setCart((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
        void syncCartItem(null, productId, variantId);
        return;
      }
      const nextItem = { productId, variantId, qty: 1 };
      setCart((current) => current.map((item) => item.productId === productId && item.variantId === variantId ? nextItem : item));
      void syncCartItem(nextItem, productId, variantId);
      return;
    }
    if (!variant || variant.stockQty < 1 || qty < 1) {
      setCart((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
      void syncCartItem(null, productId, variantId);
      return;
    }
    const safeQty = Math.min(Math.floor(qty), variant.stockQty);
    const nextItem = { productId, variantId, qty: safeQty };
    setCart((current) => current.map((item) => item.productId === productId && item.variantId === variantId ? nextItem : item));
    void syncCartItem(nextItem, productId, variantId);
  }, [products, syncCartItem]);

  const removeFromCart = useCallback((productId: string, variantId: string) => {
    setCart((current) => current.filter((item) => !(item.productId === productId && item.variantId === variantId)));
    void syncCartItem(null, productId, variantId);
  }, [syncCartItem]);

  const clearCart = useCallback(() => {
    setCart([]);
    const currentUser = userRef.current;
    const supabase = getSupabaseBrowserClient();
    if (currentUser && supabase) void supabase.from("cart_items").delete().eq("user_id", currentUser.id);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((current) => {
      const removing = current.includes(productId);
      const next = removing ? current.filter((id) => id !== productId) : [...current, productId];
      const currentUser = userRef.current;
      const supabase = getSupabaseBrowserClient();
      if (currentUser && supabase) {
        if (removing) void supabase.from("wishlists").delete().eq("user_id", currentUser.id).eq("product_id", productId);
        else void supabase.from("wishlists").insert({ user_id: currentUser.id, product_id: productId });
      }
      return next;
    });
  }, []);

  const wishlistProducts = useMemo(() => products.filter((product) => wishlistIds.includes(product.id)), [products, wishlistIds]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const cartSubtotal = useMemo(() => detailedCart.reduce((sum, item) => sum + item.lineTotal, 0), [detailedCart]);

  const value = useMemo<StoreContextValue>(() => ({
    ready,
    user,
    cart,
    detailedCart,
    cartCount,
    cartSubtotal,
    wishlistIds,
    wishlistProducts,
    isCartOpen,
    openCart: () => setCartOpen(true),
    closeCart: () => setCartOpen(false),
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted: (productId) => wishlistIds.includes(productId),
  }), [ready, user, cart, detailedCart, cartCount, cartSubtotal, wishlistIds, wishlistProducts, isCartOpen, addToCart, updateCartQuantity, removeFromCart, clearCart, toggleWishlist]);

  return (
    <StoreContext.Provider value={value}>
      {children}
      <CartDrawer />
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

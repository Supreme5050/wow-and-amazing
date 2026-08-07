"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CloseIcon, MinusIcon, PlusIcon, TrashIcon } from "@/components/icons/LineIcons";
import { useStore } from "@/components/store/StoreProvider";
import { formatStoreMoney } from "@/lib/store/currency";
import { premiumEase } from "@/components/motion/MotionPrimitives";
import { isRentalProduct } from "@/lib/catalog/rentals";

export function CartDrawer() {
  const { isCartOpen, closeCart, detailedCart, cartCount, cartSubtotal, updateCartQuantity, removeFromCart } = useStore();
  const reduceMotion = useReducedMotion();
  const rentalOnly = detailedCart.length > 0 && detailedCart.every((item) => isRentalProduct(item.product));

  return (
    <AnimatePresence>
      {isCartOpen ? (
        <motion.div className="cart-drawer-layer" role="dialog" aria-modal="true" aria-label={rentalOnly ? "Rental checkout" : "Shopping cart"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <motion.button className="cart-drawer-backdrop" type="button" aria-label="Close cart" onClick={closeCart} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} />
          <motion.aside className="cart-drawer-panel" initial={{ x: reduceMotion ? 0 : "100%" }} animate={{ x: 0 }} exit={{ x: reduceMotion ? 0 : "100%" }} transition={{ duration: 0.25, ease: premiumEase }}>
            <div className="cart-drawer-header">
              <div><p className="wa-eyebrow">{rentalOnly ? "RENTAL SELECTION" : "YOUR CART"}</p><h2>{rentalOnly ? "Property Checkout" : "Shopping Cart"}</h2></div>
              <button className="icon-button" type="button" aria-label="Close cart" onClick={closeCart}><CloseIcon /></button>
            </div>
            <div className="cart-drawer-content">
              {detailedCart.length === 0 ? (
                <div className="empty-store-state"><h3>Your cart is empty.</h3><p>Explore the collection and add something exceptional.</p><Link className="button-primary" href="/category/all" onClick={closeCart}>Shop All Products</Link></div>
              ) : (
                <ul className="mini-cart-list">
                  <AnimatePresence initial={false}>
                    {detailedCart.map((item) => {
                      const rental = isRentalProduct(item.product);
                      return (
                        <motion.li className={rental ? "mini-cart-item rental-mini-cart-item" : "mini-cart-item"} key={`${item.productId}:${item.variantId}`} layout initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: reduceMotion ? 0 : 24 }} transition={{ duration: 0.2 }}>
                          <Link href={`/product/${item.product.slug}`} onClick={closeCart}><Image src={item.product.image} alt={item.product.name} width={96} height={96} unoptimized={item.product.image.startsWith("http")} /></Link>
                          <div className="mini-cart-copy">
                            <div className="mini-cart-title-row"><div><p className="mini-cart-kicker">{rental ? "HOUSE FOR RENT" : item.variantName}</p><Link href={`/product/${item.product.slug}`} onClick={closeCart}>{item.product.name}</Link><p>{rental ? item.product.rentalLocation ?? "Single property listing" : item.variantName}</p></div><button className="mini-cart-remove" type="button" aria-label={`Remove ${item.product.name}`} onClick={() => removeFromCart(item.productId, item.variantId)}><TrashIcon size={18} /></button></div>
                            <div className="mini-cart-bottom-row">{rental ? <span className="rental-mini-cart-quantity">One property</span> : <div className="compact-quantity-control" aria-label={`Quantity for ${item.product.name}`}><button type="button" aria-label="Decrease quantity" onClick={() => updateCartQuantity(item.productId, item.variantId, item.qty - 1)}><MinusIcon size={16} /></button><span>{item.qty}</span><button type="button" aria-label="Increase quantity" onClick={() => updateCartQuantity(item.productId, item.variantId, item.qty + 1)}><PlusIcon size={16} /></button></div>}<strong>{formatStoreMoney(item.lineTotal)}</strong></div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            {detailedCart.length > 0 ? (
              <div className="cart-drawer-footer"><div className="cart-drawer-summary"><span>{rentalOnly ? "Rental total" : `Subtotal (${cartCount} items)`}</span><strong>{formatStoreMoney(cartSubtotal)}</strong></div><p>{rentalOnly ? "No shipping charge applies. Availability is confirmed before payment." : "Shipping and taxes are confirmed at checkout."}</p><Link className="button-primary cart-drawer-checkout" href="/checkout" onClick={closeCart}>{rentalOnly ? "Continue to rental checkout" : "Go to checkout"}</Link><Link className="cart-drawer-view-link" href="/cart" onClick={closeCart}>View full cart</Link></div>
            ) : null}
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

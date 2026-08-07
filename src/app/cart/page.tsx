"use client";

import Image from "next/image";
import Link from "next/link";
import { MinusIcon, PlusIcon, TrashIcon } from "@/components/icons/LineIcons";
import { useStore } from "@/components/store/StoreProvider";
import { formatStoreMoney } from "@/lib/store/currency";
import { isRentalProduct } from "@/lib/catalog/rentals";

export default function CartPage() {
  const { ready, detailedCart, cartSubtotal, updateCartQuantity, removeFromCart } = useStore();
  const merchandiseSubtotal = detailedCart.filter((item) => !isRentalProduct(item.product)).reduce((sum, item) => sum + item.lineTotal, 0);
  const containsRental = detailedCart.some((item) => isRentalProduct(item.product));
  const rentalOnly = containsRental && merchandiseSubtotal === 0;
  const shipping = merchandiseSubtotal === 0 || merchandiseSubtotal >= 50 ? 0 : 5;
  const total = cartSubtotal + shipping;

  return (
    <section className="section-shell store-page">
      <div className="site-container">
        <div className="store-page-heading">
          <p className="wa-eyebrow">YOUR CART</p>
          <h1 className="wa-section-heading">{rentalOnly ? "Rental Checkout" : "Shopping Cart"}</h1>
          <p>{rentalOnly ? "Review the selected property and continue to secure rental payment." : containsRental ? "Review your products and rental listing before continuing securely." : "Review your items, update quantities, and continue securely to checkout."}</p>
        </div>

        {!ready ? <p className="store-loading">Loading your cart…</p> : detailedCart.length === 0 ? (
          <div className="empty-store-state store-empty-card">
            <h2>Your cart is empty.</h2>
            <p>Explore the collection and add something exceptional.</p>
            <Link className="button-primary" href="/category/all">Shop All Products</Link>
          </div>
        ) : (
          <div className="cart-page-grid">
            <div className="cart-page-items">
              {detailedCart.map((item) => {
                const rental = isRentalProduct(item.product);
                return (
                  <article className={rental ? "cart-line-item rental-cart-line" : "cart-line-item"} key={`${item.productId}:${item.variantId}`}>
                    <Link className="cart-line-image" href={`/product/${item.product.slug}`}>
                      <Image src={item.product.image} alt={item.product.name} width={180} height={180} unoptimized={item.product.image.startsWith("http")} />
                    </Link>
                    <div className="cart-line-copy">
                      <div className="cart-line-top">
                        <div>
                          <p className="cart-item-kicker">{rental ? "HOUSE FOR RENT" : item.variantName}</p>
                          <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                          {rental ? <p>{item.product.rentalLocation ?? "Verified rental listing"}</p> : <p>{item.variantName}</p>}
                          <strong>{formatStoreMoney(item.unitPrice)}</strong>
                        </div>
                        <button className="cart-remove-button" type="button" onClick={() => removeFromCart(item.productId, item.variantId)} aria-label={`Remove ${item.product.name}`}>
                          <TrashIcon size={18} />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="cart-line-bottom">
                        {rental ? <div className="rental-cart-quantity"><strong>Single property</strong><span>Quantity is fixed at one listing.</span></div> : <div className="compact-quantity-control"><button type="button" aria-label="Decrease quantity" onClick={() => updateCartQuantity(item.productId, item.variantId, item.qty - 1)}><MinusIcon size={16} /></button><span>{item.qty}</span><button type="button" aria-label="Increase quantity" onClick={() => updateCartQuantity(item.productId, item.variantId, item.qty + 1)}><PlusIcon size={16} /></button></div>}
                        <strong>{formatStoreMoney(item.lineTotal)}</strong>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="order-summary-card">
              <h2>{rentalOnly ? "Rental Summary" : "Order Summary"}</h2>
              <dl>
                <div><dt>{rentalOnly ? "Rental subtotal" : "Subtotal"}</dt><dd>{formatStoreMoney(cartSubtotal)}</dd></div>
                <div><dt>{rentalOnly ? "Delivery" : "Shipping"}</dt><dd>{rentalOnly ? "Not applicable" : shipping === 0 ? "Free" : formatStoreMoney(shipping)}</dd></div>
                <div className="order-summary-total"><dt>Total</dt><dd>{formatStoreMoney(total)}</dd></div>
              </dl>
              {rentalOnly ? <p>No shipping charge applies to a property rental. Availability is checked again before payment.</p> : merchandiseSubtotal > 0 && merchandiseSubtotal < 50 ? <p>Add {formatStoreMoney(50 - merchandiseSubtotal)} more in physical products to qualify for free shipping.</p> : <p>{merchandiseSubtotal > 0 ? "Your physical-product order qualifies for free shipping." : "No shipping charge applies."}</p>}
              <Link className="button-primary order-summary-checkout" href="/checkout">{rentalOnly ? "Continue to rental checkout" : "Proceed to checkout"}</Link>
              <Link className="order-summary-continue" href={rentalOnly ? "/category/property-home-services?collection=houses-for-rent#products" : "/category/all"}>{rentalOnly ? "View other properties" : "Continue shopping"}</Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

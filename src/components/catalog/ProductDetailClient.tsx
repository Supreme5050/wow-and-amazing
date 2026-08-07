"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/components/store/StoreProvider";
import type { ProductSeed } from "@/data/catalog";
import { formatStoreMoney } from "@/lib/store/currency";
import { getRentalAvailability, isRentalProduct, rentalAvailabilityLabel } from "@/lib/catalog/rentals";
import { normalizeCatalogText } from "@/lib/catalog/display";

export function ProductDetailClient({ product }: { product: ProductSeed }) {
  const router = useRouter();
  const { addToCart } = useStore();
  const [variantId, setVariantId] = useState(product.variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("");
  const selectedVariant = useMemo(() => product.variants.find((variant) => variant.id === variantId), [product.variants, variantId]);
  const totalPrice = product.price + (selectedVariant?.priceDelta ?? 0);
  const availableStock = selectedVariant?.stockQty ?? product.stockQty;
  const rental = isRentalProduct(product);
  const rentalStatus = getRentalAvailability(product);
  const available = rental ? rentalStatus === "available" : availableStock > 0;
  const displayName = normalizeCatalogText(product.name);

  function addSelection(openDrawer: boolean) {
    if (!available) return;
    addToCart(product.id, variantId, rental ? 1 : quantity, openDrawer);
    setStatus(rental ? `${displayName} has been added to your rental checkout.` : `${displayName} has been added to your cart.`);
  }

  function handleBuyNow() {
    addSelection(false);
    if (!available) return;
    window.setTimeout(() => router.push("/checkout"), 30);
  }

  return (
    <div className={rental ? "product-purchase-panel rental-purchase-panel" : "product-purchase-panel"}>
      <div className="product-purchase-heading">
        <div>
          <span>{rental ? "Secure this property" : "Ready to order"}</span>
          <strong>{rental ? "Complete your rental safely online" : "Fast, secure checkout"}</strong>
        </div>
        {rentalStatus ? <span className={`rental-status-badge detail ${rentalStatus}`}>{rentalAvailabilityLabel(rentalStatus)}</span> : null}
      </div>

      <div className="product-purchase-price-row">
        <p className="product-detail-price">{rental ? <><small>Rent</small>{formatStoreMoney(totalPrice)}</> : formatStoreMoney(totalPrice)}</p>
        {!rental ? <span className={available ? "purchase-availability in-stock" : "purchase-availability"}>{availableStock > 0 ? `${availableStock} in stock` : "Out of stock"}</span> : null}
      </div>
      <p className="product-stock">{rental ? (available ? "Available now. Availability is verified again before payment." : `${rentalAvailabilityLabel(rentalStatus ?? "rented")} — checkout is unavailable`) : availableStock > 0 ? "Choose your preferred option and quantity below." : "This item is currently unavailable."}</p>

      {!rental && product.variants.length ? (
        <fieldset className="variant-fieldset">
          <legend>Choose an option</legend>
          <div className="variant-options">
            {product.variants.map((variant) => (
              <label className={variant.id === variantId ? "variant-option variant-option-selected" : "variant-option"} key={variant.id}>
                <input type="radio" name="variant" value={variant.id} checked={variant.id === variantId} onChange={() => setVariantId(variant.id)} />
                <span>{variant.name}</span>
                {variant.priceDelta > 0 ? <small>+{formatStoreMoney(variant.priceDelta)}</small> : null}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="purchase-selection-row">
        {!rental ? (
          <label className="quantity-control">Quantity
            <input className="input-field" type="number" min="1" max={Math.max(availableStock, 1)} value={quantity} onChange={(event) => setQuantity(Math.min(Math.max(1, Number(event.target.value) || 1), Math.max(availableStock, 1)))} />
          </label>
        ) : <div className="rental-single-listing-note"><strong>One property listing</strong><span>A successful payment automatically marks this listing as rented.</span></div>}
      </div>

      <div className="product-purchase-actions">
        <button className="button-secondary product-detail-cart" type="button" disabled={!available} onClick={() => addSelection(true)}>{rental ? "Add to rental cart" : "Add to cart"}</button>
        <button className="button-primary product-detail-buy-now" type="button" disabled={!available} onClick={handleBuyNow}>{available ? (rental ? "Rent now" : "Buy now") : (rental ? rentalAvailabilityLabel(rentalStatus ?? "rented") : "Unavailable")}</button>
      </div>

      <p className="purchase-security-note">Secure Paystack checkout · Owner-managed availability · No hidden action after payment</p>
      {status ? <p className="cart-confirmation" role="status">{status}</p> : null}
    </div>
  );
}

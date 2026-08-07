"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { HeartIcon } from "@/components/icons/LineIcons";
import { useStore } from "@/components/store/StoreProvider";
import type { ProductSeed } from "@/data/catalog";
import { formatStoreMoney } from "@/lib/store/currency";
import { getRentalAvailability, isRentalProduct, rentalAvailabilityLabel } from "@/lib/catalog/rentals";
import { getPublicDepartmentForSourceCategory } from "@/data/publicDepartments";
import { normalizeCatalogText } from "@/lib/catalog/display";

export function ProductCard({ product }: { product: ProductSeed }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const saved = isWishlisted(product.id);
  const defaultVariant = product.variants[0];
  const reduceMotion = useReducedMotion();
  const rental = isRentalProduct(product);
  const rentalStatus = getRentalAvailability(product);
  const available = rental ? rentalStatus === "available" : Boolean(defaultVariant && defaultVariant.stockQty > 0);
  const department = getPublicDepartmentForSourceCategory(product.categorySlug);
  const displayName = normalizeCatalogText(product.name);

  function handleBuyNow() {
    if (!available) return;
    addToCart(product.id, defaultVariant?.id, 1, false);
    window.setTimeout(() => router.push("/checkout"), 30);
  }

  return (
    <article className={rental ? "product-card rental-product-card" : "product-card"}>
      <div className="product-image-frame">
        {rentalStatus ? <span className={`rental-status-badge ${rentalStatus}`}>{rentalAvailabilityLabel(rentalStatus)}</span> : product.isFeatured ? <span className="product-card-badge">Best seller</span> : null}
        <Link href={`/product/${product.slug}`} aria-label={`View ${displayName}`}>
          <Image className="product-image" src={product.image} alt={displayName} width={420} height={420} unoptimized={product.image.startsWith("http")} />
        </Link>
        <motion.button className={saved ? "product-wishlist-button product-wishlist-button-active" : "product-wishlist-button"} type="button" aria-label={saved ? `Remove ${displayName} from wishlist` : `Save ${displayName} to wishlist`} aria-pressed={saved} animate={saved && !reduceMotion ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: 0.2 }} onClick={() => toggleWishlist(product.id)}>
          <HeartIcon size={19} className={saved ? "wishlist-heart-filled" : undefined} />
        </motion.button>
        <button className="product-add-button" type="button" disabled={!available} onClick={() => addToCart(product.id, defaultVariant?.id, 1, true)}>{available ? (rental ? "Add rental" : "Add to cart") : (rental ? rentalAvailabilityLabel(rentalStatus ?? "rented") : "Out of stock")}</button>
      </div>
      <div className="product-card-copy">
        <p className="product-card-category">{rental ? "House for rent" : department?.name ?? product.categorySlug.replaceAll("-", " ")}</p>
        <Link className="product-name" href={`/product/${product.slug}`}>{displayName}</Link>
        {rental ? (
          <p className="product-card-rental-line">
            {product.rentalBedrooms !== undefined ? `${product.rentalBedrooms} Bed${product.rentalBedrooms === 1 ? "" : "s"}` : null}
            {product.rentalBedrooms !== undefined && product.rentalBathrooms !== undefined ? " · " : null}
            {product.rentalBathrooms !== undefined ? `${product.rentalBathrooms} Bath${product.rentalBathrooms === 1 ? "" : "s"}` : null}
            {(product.rentalBedrooms !== undefined || product.rentalBathrooms !== undefined) && product.rentalLocation ? " · " : null}
            {product.rentalLocation ?? null}
          </p>
        ) : null}
        <div className="product-card-price-row"><p className="product-price">{rental ? <><small>Rent</small>{formatStoreMoney(product.price)}</> : formatStoreMoney(product.price)}</p><span className={available ? "product-stock-dot in-stock" : "product-stock-dot"}>{rental ? rentalAvailabilityLabel(rentalStatus ?? "rented") : available ? "In stock" : "Out of stock"}</span></div>
        <div className="product-card-actions">
          <Link className="product-card-view" href={`/product/${product.slug}`}>View details</Link>
          <button className="product-card-buy" type="button" disabled={!available} onClick={handleBuyNow}>{available ? (rental ? "Rent now" : "Buy now") : (rental ? rentalAvailabilityLabel(rentalStatus ?? "rented") : "Unavailable")}</button>
        </div>
      </div>
    </article>
  );
}

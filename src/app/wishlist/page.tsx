"use client";

import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { useStore } from "@/components/store/StoreProvider";

export default function WishlistPage() {
  const { ready, wishlistProducts } = useStore();

  return (
    <section className="section-shell store-page">
      <div className="site-container">
        <div className="store-page-heading">
          <p className="wa-eyebrow">SAVED ITEMS</p>
          <h1 className="wa-section-heading">Your Wishlist</h1>
          <p>Keep your favourite products together and return to them anytime.</p>
        </div>

        {!ready ? <p className="store-loading">Loading your wishlist…</p> : wishlistProducts.length === 0 ? (
          <div className="empty-store-state store-empty-card">
            <h2>Your wishlist is empty.</h2>
            <p>Use the heart icon to save products you love.</p>
            <Link className="button-primary" href="/category/all">Explore Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlistProducts.map((product) => <ProductCard product={product} key={product.id} />)}
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductSeed } from "@/data/catalog";
import {
  matchesMerchandisingCollection,
  type CategoryMerchandising,
} from "@/data/categoryMerchandising";

type SortValue = "featured" | "price-asc" | "price-desc" | "newest" | "best-rated";

type CategoryCatalogProps = {
  products: ProductSeed[];
  merchandising: CategoryMerchandising;
  categorySlug: string;
  activeCollectionSlug?: string;
};

export function CategoryCatalog({ products, merchandising, categorySlug, activeCollectionSlug }: CategoryCatalogProps) {
  const [selectedCollection, setSelectedCollection] = useState(activeCollectionSlug ?? "all");
  const collectionRef = useRef<HTMLDivElement>(null);
  const highestPrice = Math.ceil(Math.max(...products.map((product) => product.price), 0));
  const currentCollection = merchandising.subcategories.find((item) => item.slug === selectedCollection && !item.serviceHref);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(highestPrice);
  const [minimumRating, setMinimumRating] = useState(0);
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState<SortValue>("featured");
  const propertyDepartment = categorySlug === "property-home-services";

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const collectionMatches = selectedCollection === "all" || (currentCollection ? matchesMerchandisingCollection(product, currentCollection) : true);
      const priceMatches = product.price >= minPrice && product.price <= maxPrice;
      const ratingMatches = product.rating >= minimumRating;
      const stockMatches = availability === "all" || (availability === "in-stock" ? product.stockQty > 0 : product.stockQty === 0);
      return collectionMatches && priceMatches && ratingMatches && stockMatches;
    });

    return [...filtered].sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "best-rated") return b.rating - a.rating || b.reviewCount - a.reviewCount;
      if (sort === "newest") return b.id.localeCompare(a.id);
      return Number(b.isFeatured) - Number(a.isFeatured) || b.rating - a.rating;
    });
  }, [availability, currentCollection, maxPrice, minPrice, minimumRating, products, selectedCollection, sort]);

  function resetFilters() {
    setMinPrice(0);
    setMaxPrice(highestPrice);
    setMinimumRating(0);
    setAvailability("all");
    setSort("featured");
  }

  function chooseCollection(slug: string) {
    setSelectedCollection(slug);
    resetFilters();

    if (typeof window !== "undefined" && categorySlug !== "all") {
      const nextUrl = slug === "all" ? `/category/${categorySlug}` : `/category/${categorySlug}?collection=${slug}`;
      window.history.replaceState({}, "", `${nextUrl}#products`);
    }

    window.requestAnimationFrame(() => {
      collectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <>
      {categorySlug !== "all" ? (
        <section className="instant-collection-bar" aria-labelledby="instant-collection-heading">
          <div className="instant-collection-heading">
            <div>
              <p className="wa-eyebrow">CHOOSE WHAT YOU NEED</p>
              <h2 id="instant-collection-heading">One department. Products and services together.</h2>
            </div>
            <p>Select a product group to filter this page, or open a service enquiry directly. There are no extra category screens.</p>
          </div>
          <div className="instant-collection-tabs" role="tablist" aria-label="Department options">
            <button className={selectedCollection === "all" ? "active" : ""} type="button" role="tab" aria-selected={selectedCollection === "all"} onClick={() => chooseCollection("all")}>All products</button>
            {merchandising.subcategories.map((item) => item.serviceHref ? (
              <Link className="instant-service-link" href={item.serviceHref} key={item.slug}>
                <span className="instant-collection-thumb"><Image src={item.image} alt="" fill sizes="52px" /></span>
                <span><strong>{item.label}</strong><small>{item.description}</small><em>{item.actionLabel ?? "Open service"} →</em></span>
              </Link>
            ) : (
              <button className={selectedCollection === item.slug ? "active" : ""} type="button" role="tab" aria-selected={selectedCollection === item.slug} onClick={() => chooseCollection(item.slug)} key={item.slug}>
                <span className="instant-collection-thumb"><Image src={item.image} alt="" fill sizes="52px" /></span>
                <span><strong>{item.label}</strong><small>{item.description}</small></span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div ref={collectionRef} id="products" className={propertyDepartment ? "catalog-layout premium-catalog-layout instant-product-section property-catalog-layout" : "catalog-layout premium-catalog-layout instant-product-section"}>
        <aside className="catalog-filters" aria-label="Product filters">
          <div className="filter-heading-row">
            <div><p className="wa-eyebrow">REFINE</p><h2>Filters</h2></div>
            <button type="button" onClick={resetFilters}>Reset all</button>
          </div>
          <fieldset className="filter-group">
            <legend>Price range</legend>
            <div className="price-filter-grid">
              <label>Minimum<input className="input-field" type="number" min="0" max={highestPrice} value={minPrice} onChange={(event) => setMinPrice(Number(event.target.value))} /></label>
              <label>Maximum<input className="input-field" type="number" min="0" max={highestPrice} value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label>
            </div>
          </fieldset>
          <label className="filter-group filter-label">Rating
            <select className="input-field" value={minimumRating} onChange={(event) => setMinimumRating(Number(event.target.value))}>
              <option value="0">All ratings</option><option value="4">4 stars & up</option><option value="3">3 stars & up</option><option value="2">2 stars & up</option>
            </select>
          </label>
          <label className="filter-group filter-label">Availability
            <select className="input-field" value={availability} onChange={(event) => setAvailability(event.target.value)}>
              <option value="all">All products</option><option value="in-stock">In stock</option><option value="out-of-stock">Out of stock</option>
            </select>
          </label>
          <div className="catalog-filter-note">
            <strong>Live owner-managed stock</strong>
            <p>Every product, rental listing, price and option is controlled from the private Wow & Amazing dashboard.</p>
          </div>
        </aside>

        <section className="catalog-results" aria-live="polite">
          <div className="catalog-toolbar">
            <div>
              <p className="wa-eyebrow">{currentCollection ? "SELECTED OPTION" : "CURATED PRODUCTS"}</p>
              <h2>{currentCollection?.label ?? (categorySlug === "all" ? "All products" : "Products in this department")}</h2>
              <small>{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"} available</small>
            </div>
            <label>Sort by
              <select className="input-field" value={sort} onChange={(event) => setSort(event.target.value as SortValue)}>
                <option value="featured">Featured</option><option value="price-asc">Price low–high</option><option value="price-desc">Price high–low</option><option value="newest">Newest</option><option value="best-rated">Best rated</option>
              </select>
            </label>
          </div>
          {visibleProducts.length > 0 ? (
            <div className={propertyDepartment ? "catalog-product-grid property-catalog-grid" : "catalog-product-grid"}>{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="catalog-empty">
              <h2>More products are coming to this section</h2>
              <p>Choose another option or reset the filters. New owner-uploaded products will appear here automatically.</p>
              <div className="catalog-empty-actions"><button type="button" className="button button-primary" onClick={() => chooseCollection("all")}>View all products</button><button type="button" className="button button-secondary" onClick={resetFilters}>Reset filters</button></div>
            </div>
          )}
        </section>
      </div>

    </>
  );
}

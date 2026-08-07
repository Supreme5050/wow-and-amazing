import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { searchCatalogProducts } from "@/lib/catalog/server";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the Wow & Amazing product catalog.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = String(params.q ?? "").trim();
  const products = query ? await searchCatalogProducts(query, 60) : [];

  return (
    <section className="section-shell store-page search-page">
      <div className="site-container">
        <div className="store-page-heading">
          <p className="wa-eyebrow">SEARCH RESULTS</p>
          <h1 className="wa-section-heading">{query ? `Results for “${query}”` : "Find something amazing."}</h1>
          <p>{query ? `${products.length} ${products.length === 1 ? "product" : "products"} found.` : "Use the search icon in the header to search products and categories."}</p>
        </div>

        {!query ? (
          <div className="empty-store-state store-empty-card">
            <h2>Enter a product name or category.</h2>
            <p>Try “camera”, “food”, “creator”, or another product keyword.</p>
            <Link className="button-primary" href="/category/all">Browse All Products</Link>
          </div>
        ) : products.length ? (
          <div className="search-results-grid">
            {products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="empty-store-state store-empty-card">
            <h2>No products matched your search.</h2>
            <p>Check the spelling or browse the complete product catalog.</p>
            <Link className="button-primary" href="/category/all">Shop All Products</Link>
          </div>
        )}
      </div>
    </section>
  );
}

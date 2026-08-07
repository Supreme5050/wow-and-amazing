/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TrashIcon } from "@/components/icons/LineIcons";
import { ownerFetch } from "@/lib/admin/client";
import { getCategoryMerchandising } from "@/data/categoryMerchandising";

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image_urls: string[];
  is_featured: boolean;
  is_active: boolean;
  stock_qty: number;
  subcategory_slug: string;
  rental_status: "available" | "reserved" | "rented" | null;
  is_demo: boolean;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type Payload = { products: AdminProduct[] };
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY || "NGN", maximumFractionDigits: 2 });

function categoryName(value: AdminProduct["categories"]) {
  if (Array.isArray(value)) return value[0]?.name || "Uncategorised";
  return value?.name || "Uncategorised";
}

function categorySlug(value: AdminProduct["categories"]) {
  if (Array.isArray(value)) return value[0]?.slug || "";
  return value?.slug || "";
}

function collectionName(product: AdminProduct) {
  return getCategoryMerchandising(categorySlug(product.categories)).subcategories.find((item) => item.slug === product.subcategory_slug)?.label || "General";
}

export function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await ownerFetch<Payload>("/api/admin/products");
      setProducts(data.products);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const categoryOptions = useMemo(() => [...new Set(products.map((product) => categoryName(product.categories)))].sort(), [products]);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return products.filter((product) => {
      const matchesQuery = !value || `${product.name} ${product.slug} ${categoryName(product.categories)} ${collectionName(product)}`.toLowerCase().includes(value);
      const matchesCategory = categoryFilter === "all" || categoryName(product.categories) === categoryFilter;
      const matchesVisibility = visibilityFilter === "all" || (visibilityFilter === "published" ? product.is_active : !product.is_active);
      return matchesQuery && matchesCategory && matchesVisibility;
    });
  }, [categoryFilter, products, query, visibilityFilter]);

  const publishedCount = products.filter((product) => product.is_active).length;
  const draftCount = products.length - publishedCount;
  const lowStockCount = products.filter((product) => product.stock_qty <= 5).length;
  const rentalCount = products.filter((product) => product.subcategory_slug === "houses-for-rent").length;

  async function remove(product: AdminProduct) {
    if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) return;
    setMessage("Deleting product…");
    try {
      await ownerFetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((item) => item.id !== product.id));
      setMessage("Product deleted successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete product.");
    }
  }

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div><p className="wa-eyebrow">CATALOG MANAGEMENT</p><h1>Products</h1><p>Add, edit, publish, or remove genuine products and rental properties without changing the website code. Archived starter records are no longer included here.</p></div>
        <Link className="button-primary" href="/admin/products/new">Add New Product</Link>
      </div>

      <section className="admin-catalog-summary" aria-label="Catalog summary">
        <article><span>Total items</span><strong>{products.length}</strong></article>
        <article><span>Published</span><strong>{publishedCount}</strong></article>
        <article><span>Drafts</span><strong>{draftCount}</strong></article>
        <article><span>Low stock</span><strong>{lowStockCount}</strong></article>
        <article><span>Rental listings</span><strong>{rentalCount}</strong></article>
      </section>

      <div className="admin-toolbar admin-products-toolbar">
        <label className="admin-search-field">Search products<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, slug, category, or collection" /></label>
        <label className="admin-search-field">Department<select className="input-field" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="all">All departments</option>{categoryOptions.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
        <label className="admin-search-field">Visibility<select className="input-field" value={visibilityFilter} onChange={(event) => setVisibilityFilter(event.target.value)}><option value="all">All visibility</option><option value="published">Published</option><option value="draft">Draft</option></select></label>
        <span>{visible.length} {visible.length === 1 ? "result" : "results"}</span>
      </div>
      {message ? <div className="admin-alert">{message}</div> : null}

      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading products…</p></div> : visible.length ? (
          <div className="admin-table-wrap"><table className="admin-table admin-products-table"><thead><tr><th>Product</th><th>Category</th><th>Collection</th><th>Price</th><th>Stock</th><th>Visibility</th><th>Actions</th></tr></thead><tbody>{visible.map((product) => {
            const image = product.image_urls?.[0] || "/catalog/products/wireless-earbuds-pro.webp";
            return <tr key={product.id}><td><div className="admin-product-cell"><Image src={image} alt="" width={64} height={64} unoptimized={image.startsWith("http")} /><span><strong>{product.name}</strong><small>/{product.slug}</small>{product.is_featured ? <em>Featured</em> : null}{product.is_demo ? <small className="admin-demo-label">Starter demo</small> : null}</span></div></td><td>{categoryName(product.categories)}</td><td><span className="admin-collection-label">{collectionName(product)}</span>{product.subcategory_slug === "houses-for-rent" ? <small className={`admin-rental-status ${product.stock_qty < 1 ? "rented" : product.rental_status || "available"}`}>{product.stock_qty < 1 ? "Rented" : product.rental_status === "reserved" ? "Reserved" : product.rental_status === "rented" ? "Rented" : "Available"}</small> : null}</td><td>{money.format(Number(product.price))}</td><td><span className={product.stock_qty <= 5 ? "admin-stock-low" : ""}>{product.stock_qty}</span></td><td><span className={product.is_active ? "admin-status delivered" : "admin-status pending"}>{product.is_active ? "Published" : "Draft"}</span></td><td><div className="admin-row-actions"><Link href={`/admin/products/${product.id}/edit`}>Edit</Link><button type="button" aria-label={`Delete ${product.name}`} onClick={() => void remove(product)}><TrashIcon size={17} /></button></div></td></tr>;
          })}</tbody></table></div>
        ) : <div className="admin-empty"><h2>No matching products.</h2><p>Add a product or clear the current search.</p></div>}
      </section>
    </div>
  );
}

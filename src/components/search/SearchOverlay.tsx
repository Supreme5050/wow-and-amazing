"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "@/components/icons/LineIcons";
import type { ProductSeed } from "@/data/catalog";
import { formatStoreMoney } from "@/lib/store/currency";

type SearchPayload = { query: string; products: ProductSeed[] };

export function SearchOverlay({ open, sticky, onClose }: { open: boolean; sticky: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSeed[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 50);
    const mobile = window.matchMedia("(max-width: 640px)").matches;
    const previousOverflow = document.body.style.overflow;
    if (mobile) document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const value = query.trim();
    if (!value) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(value)}&limit=6`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const payload = await response.json() as SearchPayload;
        setProducts(response.ok ? payload.products : []);
        setSearched(true);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setProducts([]);
          setSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);


  function changeQuery(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setProducts([]);
      setSearched(false);
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  if (!open) return null;

  return (
    <div className={sticky ? "search-layer header-sticky" : "search-layer"} role="dialog" aria-modal="true" aria-label="Search products">
      <button className="search-backdrop" type="button" aria-label="Close search" onClick={onClose} />
      <div className="search-panel">
        <div className="search-panel-heading">
          <span>Search Wow &amp; Amazing</span>
          <button className="icon-button search-close" type="button" aria-label="Close search" onClick={onClose}><CloseIcon /></button>
        </div>
        <form className="search-form" onSubmit={submit}>
          <SearchIcon size={20} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => changeQuery(event.target.value)}
            placeholder="Search products and categories"
            aria-label="Search products and categories"
            autoComplete="off"
          />
          {query ? <button type="button" className="search-clear" onClick={() => changeQuery("")}>Clear</button> : null}
        </form>

        <div className="search-suggestions" aria-live="polite">
          {!query.trim() ? <p className="search-message">Start typing to find products.</p> : null}
          {loading ? <div className="search-loading"><span className="admin-spinner" /><p>Searching…</p></div> : null}
          {!loading && searched && products.length === 0 ? <p className="search-message">No products matched “{query.trim()}”.</p> : null}
          {!loading && products.length ? (
            <>
              <div className="search-result-list">
                {products.map((product) => (
                  <Link className="search-result-item" href={`/product/${product.slug}`} key={product.id} onClick={onClose}>
                    <Image src={product.image} alt="" width={64} height={64} unoptimized={product.image.startsWith("http")} />
                    <span><strong>{product.name}</strong><small>{formatStoreMoney(product.price)}</small></span>
                  </Link>
                ))}
              </div>
              <Link className="search-see-all" href={`/search?q=${encodeURIComponent(query.trim())}`} onClick={onClose}>See all results for “{query.trim()}”</Link>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

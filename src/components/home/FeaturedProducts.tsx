"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductSeed } from "@/data/catalog";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/MotionPrimitives";

export function FeaturedProducts({ products }: { products: ProductSeed[] }) {
  const selected = products.slice(0, 4);
  return (
    <section className="editorial-section editorial-best-sellers" aria-labelledby="featured-heading">
      <div className="site-container">
        <Reveal><div className="editorial-section-heading"><div><p className="wa-eyebrow">BEST SELLERS</p><h2 id="featured-heading">Most-loved selections.</h2></div><Link href="/category/all">View all <span aria-hidden="true">→</span></Link></div></Reveal>
        <div className="editorial-best-grid">
          {selected.length ? (
            <StaggerGroup className="editorial-products-grid">
              {selected.map((product) => <StaggerItem key={product.slug} className="motion-fill"><ProductCard product={product} /></StaggerItem>)}
            </StaggerGroup>
          ) : (
            <div className="live-catalog-empty"><p className="wa-eyebrow">LIVE CATALOGUE</p><h3>No live products published yet.</h3><p>Only genuine owner-published products will appear in this section.</p><Link className="button-secondary" href="/services">Explore Services</Link></div>
          )}
          <Link className="editorial-promo-card editorial-promo-gift" href="/experiences/food">
            <Image src="/experience/food-poster.jpg" alt="Premium food and presentation" fill sizes="(max-width: 900px) 100vw, 25vw" />
            <span className="editorial-promo-shade" />
            <span className="editorial-promo-copy"><small>FOOD &amp; PRESENTATION</small><strong>Beautifully prepared.</strong><em>Explore meals and packaging <span aria-hidden="true">→</span></em></span>
          </Link>
          <Link className="editorial-promo-card editorial-promo-dark" href="/experiences/home-decor">
            <Image src="/experience/home-decor-poster.jpg" alt="Premium home and decor" fill sizes="(max-width: 900px) 100vw, 25vw" />
            <span className="editorial-promo-shade" />
            <span className="editorial-promo-copy"><small>HOME EDIT</small><strong>Live beautifully.</strong><em>Shop housing &amp; décor <span aria-hidden="true">→</span></em></span>
          </Link>
        </div>
      </div>
    </section>
  );
}

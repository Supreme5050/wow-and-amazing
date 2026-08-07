"use client";

import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ProductSeed } from "@/data/catalog";
import type { PublicCustomerStory } from "@/lib/catalog/server";
import { StarIcon } from "@/components/icons/LineIcons";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/MotionPrimitives";

export function HomeEditorialSections({ products, stories }: { products: ProductSeed[]; stories: PublicCustomerStory[] }) {
  const arrivals = [...products].reverse().slice(0, 4);
  return (
    <section className="editorial-section editorial-arrivals" aria-labelledby="arrivals-heading">
      <div className="site-container editorial-arrivals-layout">
        <div>
          <Reveal><div className="editorial-section-heading"><div><p className="wa-eyebrow">NEW ARRIVALS</p><h2 id="arrivals-heading">Freshly selected for you.</h2></div><Link href="/category/all">View all <span aria-hidden="true">→</span></Link></div></Reveal>
          {arrivals.length ? (
            <StaggerGroup className="editorial-arrivals-grid">{arrivals.map((product) => <StaggerItem key={product.id} className="motion-fill"><ProductCard product={product} /></StaggerItem>)}</StaggerGroup>
          ) : (
            <div className="live-catalog-empty compact"><p className="wa-eyebrow">LIVE CATALOGUE</p><h3>Real products will appear here.</h3><p>The owner is preparing the first live collection. No demonstration products are being shown.</p><Link className="button-secondary" href="/services">Explore Services</Link></div>
          )}
        </div>
        <div className="editorial-testimonial-panel">
          <div className="editorial-section-heading"><div><p className="wa-eyebrow">CUSTOMER STORIES</p><h2>Verified customer feedback.</h2></div></div>
          {stories.length ? (
            <div className="editorial-testimonial-list">
              {stories.map((item) => <article key={item.id}><StarIcon size={18} /><blockquote>“{item.quote}”</blockquote><strong>— {item.name}</strong><span>{"★".repeat(Math.max(1, Math.min(5, Math.round(item.rating))))}{"☆".repeat(Math.max(0, 5 - Math.round(item.rating)))}</span>{item.productName ? <small>Purchased: {item.productName}</small> : null}</article>)}
            </div>
          ) : (
            <div className="live-catalog-empty testimonial-empty"><StarIcon size={22} /><h3>No live reviews yet.</h3><p>Verified feedback will appear after genuine customers complete purchases and submit reviews.</p></div>
          )}
        </div>
      </div>
    </section>
  );
}

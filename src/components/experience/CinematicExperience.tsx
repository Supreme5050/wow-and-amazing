"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { ArrowRightIcon } from "@/components/icons/LineIcons";
import { ExperienceMedia } from "@/components/experience/ExperienceMedia";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { ExperienceSeed } from "@/data/experiences";
import type { ProductSeed } from "@/data/catalog";
import { premiumEase } from "@/components/motion/MotionPrimitives";
import {
  getCategoryMerchandising,
  matchesMerchandisingCollection,
  type MerchandisingCollection,
} from "@/data/categoryMerchandising";

type ExperienceFilter = {
  key: string;
  label: string;
  collection?: MerchandisingCollection;
};

export function CinematicExperience({ experience, products }: { experience: ExperienceSeed; products: ProductSeed[] }) {
  const reduceMotion = useReducedMotion();
  const shopRef = useRef<HTMLElement>(null);
  const merchandising = getCategoryMerchandising(experience.departmentSlug);
  const filters = useMemo<ExperienceFilter[]>(() => [
    { key: "all", label: "All products" },
    ...merchandising.subcategories.filter((item) => !item.serviceHref).map((item) => ({ key: item.slug, label: item.label, collection: item })),
  ], [merchandising.subcategories]);
  const serviceLinks = merchandising.subcategories.filter((item) => item.serviceHref);
  const [activeFilter, setActiveFilter] = useState("all");

  const visibleProducts = useMemo(() => {
    const filter = filters.find((item) => item.key === activeFilter);
    if (!filter?.collection) return products;
    return products.filter((product) => matchesMerchandisingCollection(product, filter.collection!));
  }, [activeFilter, filters, products]);

  function chooseFilter(key: string) {
    setActiveFilter(key);
    window.requestAnimationFrame(() => shopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const heroStack: Variants = { hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.1 } } };
  const heroItem: Variants = { hidden: { opacity: 0, y: reduceMotion ? 0 : 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.46, ease: premiumEase } } };

  return (
    <main className={`experience-page experience-${experience.slug}`}>
      <section className="experience-hero" aria-labelledby="experience-title">
        <ExperienceMedia kind={experience.mediaKind} src={experience.mediaSrc} poster={experience.posterSrc} alt={`${experience.eyebrow} cinematic collection`} />
        <div className="experience-hero-overlay" aria-hidden="true" />
        <motion.div className="site-container experience-hero-content" variants={heroStack} initial="hidden" animate="visible">
          <motion.p className="wa-eyebrow experience-eyebrow" variants={heroItem}>{experience.eyebrow}</motion.p>
          <motion.h1 id="experience-title" className="experience-title" variants={heroItem}>{experience.title}</motion.h1>
          <motion.p className="experience-description" variants={heroItem}>{experience.description}</motion.p>
          <motion.div className="experience-actions" variants={heroItem}>
            <button className="button-primary" type="button" onClick={() => chooseFilter("all")}>View products</button>
            {experience.secondaryHref && experience.secondaryLabel ? <Link className="experience-outline-button" href={experience.secondaryHref}>{experience.secondaryLabel}</Link> : null}
          </motion.div>
        </motion.div>
        <button className="experience-scroll-cue" type="button" aria-label="View products below" onClick={() => chooseFilter("all")}><span>View products</span><ArrowRightIcon size={18} /></button>
      </section>

      <section ref={shopRef} id="products" className="cinematic-shop-section" aria-labelledby="cinematic-shop-title">
        <div className="site-container">
          <div className="cinematic-shop-heading">
            <div><p className="wa-eyebrow">ONE ALIGNED DEPARTMENT</p><h2 id="cinematic-shop-title">Products and services without repeated pages.</h2></div>
            <p>Use the filters for products, or open a service request directly. The customer no longer moves through separate Creator, Cinematography, Food Packaging or Housing screens.</p>
          </div>

          <div className="cinematic-filter-tabs" role="tablist" aria-label="Experience product filters">
            {filters.map((filter) => (
              <button className={filter.key === activeFilter ? "active" : ""} type="button" role="tab" aria-selected={filter.key === activeFilter} onClick={() => chooseFilter(filter.key)} key={filter.key}>{filter.label}</button>
            ))}
            {serviceLinks.map((item) => <Link className="cinematic-service-tab" href={item.serviceHref!} key={item.slug}>{item.label} <span aria-hidden="true">→</span></Link>)}
          </div>

          <div className="cinematic-product-toolbar">
            <div><strong>{filters.find((item) => item.key === activeFilter)?.label ?? "All products"}</strong><span>{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}</span></div>
            <Link href={experience.primaryHref}>Open the full department <span aria-hidden="true">→</span></Link>
          </div>

          {visibleProducts.length ? <div className="cinematic-product-grid">{visibleProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="catalog-empty cinematic-empty"><h2>More products are coming</h2><p>The owner can add products from the admin dashboard. Choose another filter or open the relevant service request.</p><button className="button button-primary" type="button" onClick={() => chooseFilter("all")}>View all products</button></div>}

          <div className="cinematic-shop-footer"><div><p className="wa-eyebrow">CONTINUE WITHOUT EXTRA SCREENS</p><h2>Everything important is grouped into one department.</h2></div><Link className="button-primary" href={experience.primaryHref}>{experience.primaryLabel}</Link></div>
        </div>
      </section>
    </main>
  );
}

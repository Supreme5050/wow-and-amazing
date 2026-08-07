"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRightIcon } from "@/components/icons/LineIcons";
import { premiumEase } from "@/components/motion/MotionPrimitives";
import type { ProductSeed } from "@/data/catalog";
import { formatStoreMoney } from "@/lib/store/currency";

export function HeroSection({ product }: { product?: ProductSeed }) {
  const reduceMotion = useReducedMotion();
  const stack: Variants = { hidden: {}, visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.08 } } };
  const item: Variants = { hidden: { opacity: 0, y: reduceMotion ? 0 : 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: premiumEase } } };

  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-media" aria-hidden="true">
        <Image src="/experience/gadgets-poster.jpg" alt="" fill priority sizes="100vw" />
      </div>
      <div className="home-hero-overlay" aria-hidden="true" />
      <div className="site-container home-hero-inner">
        <motion.div className="home-hero-copy" variants={stack} initial="hidden" animate="visible">
          <motion.p className="wa-eyebrow" variants={item}>NEW COLLECTION</motion.p>
          <motion.h1 id="home-hero-title" className="home-hero-title" variants={item}>Exceptional products,<br />made for real life.</motion.h1>
          <motion.p className="home-hero-subtext" variants={item}>Explore premium technology, food and catering, property and home services, plus media production and equipment rentals—managed by one trusted owner.</motion.p>
          <motion.div className="home-hero-actions" variants={item}>
            <Link className="button-primary hero-button" href="/category/all">Shop the Collection</Link>
            <Link className="button-secondary hero-button" href="/services">Explore Services</Link>
          </motion.div>
          <motion.div className="home-hero-featured-note" variants={item}>
            {product ? (
              <><span>Featured now</span><strong>{product.name}</strong><small>{formatStoreMoney(product.price)}</small></>
            ) : (
              <><span>Live catalogue</span><strong>New products arriving soon</strong><small>Real owner-published items will appear here.</small></>
            )}
          </motion.div>
        </motion.div>
      </div>
      <Link className="home-hero-side-link" href="/experiences/gadgets">Enter the gadgets experience <ArrowRightIcon size={16} /></Link>
      <div className="home-hero-dots" aria-hidden="true"><span /><span className="active" /><span /></div>
    </section>
  );
}

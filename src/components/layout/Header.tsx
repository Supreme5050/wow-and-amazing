"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useStore } from "@/components/store/StoreProvider";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { BagIcon, ChevronDownIcon, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons/LineIcons";
import type { CategorySeed } from "@/data/catalog";
import { getCategoryGatewayHref } from "@/data/experiences";
import { premiumEase } from "@/components/motion/MotionPrimitives";

const navigation = [
  { label: "Home", href: "/" },
  { label: "Shop All", href: "/category/all" },
  { label: "Departments", href: "/category/all", menu: "categories" as const },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function CategoryMenu({ categories }: { categories: CategorySeed[] }) {
  return (
    <div className="category-mega-menu" role="menu" aria-label="Shop by category">
      <div className="category-mega-heading">
        <div><span>Explore our departments</span><small>Products and services grouped into four clear areas.</small></div>
        <Link href="/category/all">View all products <span aria-hidden="true">→</span></Link>
      </div>
      <div className="category-mega-grid">
        {categories.map((category) => (
          <Link className="category-mega-item" href={getCategoryGatewayHref(category.slug)} key={category.slug} role="menuitem">
            <Image src={category.image} alt="" width={74} height={74} unoptimized={category.image.startsWith("http")} />
            <span><strong>{category.name}</strong><small>{category.description}</small></span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count < 1) return null;
  return <span className="header-badge" suppressHydrationWarning>{count}</span>;
}

export function Header({ categories }: { categories: CategorySeed[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const { cartCount, wishlistIds, openCart } = useStore();
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setMobileMenuOpen(false);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const updateStickyState = () => setSticky(window.scrollY > 56);
    updateStickyState();
    window.addEventListener("scroll", updateStickyState, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyState);
  }, []);

  function isCurrent(label: string, href: string) {
    if (label === "Home") return pathname === "/";
    if (label === "Shop All") return pathname === "/category/all";
    if (label === "Departments") return (pathname.startsWith("/category/") && pathname !== "/category/all") || pathname.startsWith("/experiences/");
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      <div className="main-header-slot">
        <header className={sticky ? "main-header is-sticky" : "main-header"} suppressHydrationWarning>
          <div className="site-container header-inner">
            <div className="header-brand-area">
              <button className="icon-button mobile-menu-trigger" type="button" aria-label="Open navigation" aria-expanded={mobileMenuOpen} onClick={() => { setSearchOpen(false); setMobileMenuOpen(true); }}><MenuIcon /></button>
              <Link className="header-logo-link" href="/" aria-label="Wow & Amazing home">
                <Image className="header-logo-desktop" src="/brand/logo-full.png" alt="Wow & Amazing" width={1081} height={551} priority />
                <Image className="header-logo-mobile" src="/brand/logo-mark.png" alt="Wow & Amazing" width={695} height={371} priority />
              </Link>
            </div>

            <nav className="desktop-navigation" aria-label="Primary navigation">
              {navigation.map((item) => item.menu === "categories" ? (
                <div className="nav-menu-wrap" key={item.label}>
                  <button className="nav-link nav-menu-button" type="button" aria-current={isCurrent(item.label, item.href) ? "page" : undefined} aria-haspopup="menu">
                    <span>{item.label}</span><ChevronDownIcon />
                  </button>
                  <CategoryMenu categories={categories} />
                </div>
              ) : (
                <Link className="nav-link" href={item.href} key={item.label} aria-current={isCurrent(item.label, item.href) ? "page" : undefined}>{item.label}</Link>
              ))}
            </nav>

            <div className="header-actions" aria-label="Store actions">
              <button className="desktop-search-trigger" type="button" aria-label="Search products" aria-expanded={searchOpen} onClick={() => setSearchOpen(true)}><span>Search for products…</span><SearchIcon size={18} /></button>
              <button className="icon-button mobile-search-trigger" type="button" aria-label="Search" aria-expanded={searchOpen} onClick={() => setSearchOpen(true)}><SearchIcon /></button>
              <Link className="icon-button" href="/account" aria-label="Account"><UserIcon /></Link>
              <Link className="icon-button badge-anchor" href="/wishlist" aria-label="Wishlist"><HeartIcon /><CountBadge count={wishlistIds.length} /></Link>
              <button className="icon-button badge-anchor" type="button" aria-label="Open cart" onClick={openCart}><BagIcon /><CountBadge count={cartCount} /></button>
            </div>
          </div>
        </header>
      </div>

      <div className="mobile-commerce-search-row">
        <button className="mobile-commerce-search-button" type="button" aria-label="Search products, services and rentals" aria-expanded={searchOpen} onClick={() => setSearchOpen(true)}>
          <SearchIcon size={18} />
          <span>Search products, services &amp; rentals</span>
        </button>
      </div>

      <SearchOverlay open={searchOpen} sticky={sticky} onClose={closeSearch} />

      <AnimatePresence>
        {mobileMenuOpen ? (
          <motion.div className="mobile-navigation-layer" role="dialog" aria-modal="true" aria-label="Mobile navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.button type="button" className="mobile-navigation-backdrop" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside id="mobile-navigation" className="mobile-navigation-panel" initial={{ x: reduceMotion ? 0 : "-100%" }} animate={{ x: 0 }} exit={{ x: reduceMotion ? 0 : "-100%" }} transition={{ duration: 0.25, ease: premiumEase }}>
              <div className="mobile-navigation-heading">
                <Link href="/" aria-label="Wow & Amazing home" onClick={() => setMobileMenuOpen(false)}><Image className="mobile-drawer-logo" src="/brand/logo-full.png" alt="Wow & Amazing" width={1081} height={551} /></Link>
                <button className="icon-button" type="button" aria-label="Close navigation" onClick={() => setMobileMenuOpen(false)}><CloseIcon /></button>
              </div>
              <button className="mobile-search-box" type="button" onClick={() => { setMobileMenuOpen(false); setSearchOpen(true); }}><SearchIcon size={18} /><span>Search for products…</span></button>
              <nav className="mobile-navigation-links" aria-label="Mobile primary navigation">
                <Link className="mobile-nav-link" href="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link className="mobile-nav-link" href="/category/all" onClick={() => setMobileMenuOpen(false)}>Shop All</Link>
                <button className="mobile-nav-link mobile-nav-button" type="button" aria-expanded={mobileCategoriesOpen} onClick={() => setMobileCategoriesOpen((current) => !current)}><span>Departments</span><ChevronDownIcon /></button>
                <AnimatePresence initial={false}>
                  {mobileCategoriesOpen ? <motion.div className="mobile-category-list" initial={{ opacity: 0, y: reduceMotion ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -8 }} transition={{ duration: 0.2 }}>{categories.map((category) => <Link href={getCategoryGatewayHref(category.slug)} key={category.slug} onClick={() => setMobileMenuOpen(false)}>{category.name}</Link>)}</motion.div> : null}
                </AnimatePresence>
                {navigation.slice(3).map((item) => <Link className="mobile-nav-link" href={item.href} key={item.label} onClick={() => setMobileMenuOpen(false)}>{item.label}</Link>)}
              </nav>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

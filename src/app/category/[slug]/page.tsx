import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CategoryCatalog } from "@/components/catalog/CategoryCatalog";
import { ExperienceMedia } from "@/components/experience/ExperienceMedia";
import { getCatalogSnapshot } from "@/lib/catalog/server";
import { experiences } from "@/data/experiences";
import { getCategoryMerchandising } from "@/data/categoryMerchandising";
import {
  getPublicCollectionSlug,
  getPublicDepartmentBySlug,
  getPublicDepartmentSlug,
  publicDepartments,
} from "@/data/publicDepartments";

const bannerMap: Record<string, string> = {
  all: "/experience/gadgets-poster.jpg",
  "gadgets-accessories": "/experience/gadgets-poster.jpg",
  "food-catering": "/experience/food-poster.jpg",
  "property-home-services": "/experience/home-decor-poster.jpg",
  "media-gadget-rentals": "/experience/creators-poster.jpg",
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "all") return { title: "Shop All", description: "Explore the complete Wow & Amazing collection." };
  const department = getPublicDepartmentBySlug(getPublicDepartmentSlug(slug));
  return {
    title: department?.name ?? "Shop",
    description: department?.description ?? "Explore Wow & Amazing products and services.",
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ collection?: string }> }) {
  const { slug } = await params;
  const { collection } = await searchParams;
  const publicSlug = getPublicDepartmentSlug(slug);

  if (slug !== "all" && publicSlug !== slug) {
    const mappedCollection = getPublicCollectionSlug(slug, collection);
    const suffix = mappedCollection ? `?collection=${encodeURIComponent(mappedCollection)}#products` : "";
    redirect(`/category/${publicSlug}${suffix}`);
  }

  const catalog = await getCatalogSnapshot();
  const department = slug === "all" ? null : getPublicDepartmentBySlug(slug);
  if (slug !== "all" && !department) notFound();

  const products = slug === "all"
    ? catalog.products
    : catalog.products.filter((product) => department!.categorySlugs.includes(product.categorySlug));
  const merchandising = getCategoryMerchandising(slug);
  const validCollection = merchandising.subcategories.some((item) => item.slug === collection && !item.serviceHref) ? collection : undefined;
  const experience = department ? experiences.find((item) => item.departmentSlug === department.slug) : undefined;

  return (
    <>
      <section className="catalog-editorial-hero compact-category-hero">
        <div className="site-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>›</span><Link href="/category/all">Shop</Link><span>›</span><span>{department?.name ?? "All Products"}</span></nav>
          <div className="catalog-editorial-hero-grid">
            <div className="catalog-editorial-copy">
              <p className="wa-eyebrow">{merchandising.eyebrow}</p>
              <h1>{merchandising.headline}</h1>
              <p>{merchandising.intro}</p>
              <strong className="catalog-hero-promise">{merchandising.promise}</strong>
            </div>
            <div className={`catalog-editorial-banner${experience?.mediaKind === "video" ? " has-cinematic-video" : ""}`}>
              {experience ? (
                <ExperienceMedia
                  kind={experience.mediaKind}
                  src={experience.mediaSrc}
                  poster={experience.posterSrc}
                  alt={`${experience.eyebrow} cinematic introduction`}
                />
              ) : (
                <Image src={bannerMap[slug] ?? bannerMap.all} alt="" fill priority sizes="(max-width: 900px) 100vw, 65vw" />
              )}
              <span />
              <div>
                <small>{experience ? "CINEMATIC DEPARTMENT INTRO" : "WOW & AMAZING"}</small>
                <strong>{experience ? department?.name : <>Fewer departments.<br />Clearer service.</>}</strong>
              </div>
            </div>
          </div>
          <nav className="catalog-category-tabs" aria-label="Public departments">
            <Link className={slug === "all" ? "active" : ""} href="/category/all">All Products</Link>
            {publicDepartments.map((item) => <Link className={slug === item.slug ? "active" : ""} href={`/category/${item.slug}`} key={item.slug}>{item.name}</Link>)}
          </nav>
        </div>
      </section>
      <section className="catalog-section"><div className="site-container"><CategoryCatalog key={`${slug}:${validCollection ?? "all"}`} products={products} merchandising={merchandising} categorySlug={slug} activeCollectionSlug={validCollection} /></div></section>
    </>
  );
}

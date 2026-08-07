import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailClient } from "@/components/catalog/ProductDetailClient";
import { ProductReviews } from "@/components/catalog/ProductReviews";
import { RatingStars } from "@/components/catalog/RatingStars";
import { BathIcon, BedIcon, HomeIcon, KeyIcon, MapPinIcon, RulerIcon, ShieldIcon } from "@/components/icons/LineIcons";
import { getCatalogSnapshot } from "@/lib/catalog/server";
import { getCategoryCollection, getCategoryCollectionHref } from "@/data/categoryMerchandising";
import { getPublicCollectionSlug, getPublicDepartmentForSourceCategory } from "@/data/publicDepartments";
import { getRentalAvailability, isRentalProduct, rentalAvailabilityLabel } from "@/lib/catalog/rentals";
import { normalizeCatalogText } from "@/lib/catalog/display";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getCatalogSnapshot();
  const product = catalog.products.find((item) => item.slug === slug);
  return product ? { title: normalizeCatalogText(product.name), description: normalizeCatalogText(product.description) } : { title: "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalogSnapshot();
  const product = catalog.products.find((item) => item.slug === slug);
  if (!product) notFound();
  const category = getPublicDepartmentForSourceCategory(product.categorySlug);
  const publicCollectionSlug = getPublicCollectionSlug(product.categorySlug, product.subcategorySlug);
  const collection = publicCollectionSlug && category ? getCategoryCollection(category.slug, publicCollectionSlug) : undefined;
  const sameCollection = catalog.products.filter((item) => item.id !== product.id && item.categorySlug === product.categorySlug && item.subcategorySlug === product.subcategorySlug);
  const related = [...sameCollection, ...catalog.products.filter((item) => item.id !== product.id && !sameCollection.some((same) => same.id === item.id))].slice(0, 4);
  const remoteImage = product.image.startsWith("http");
  const rental = isRentalProduct(product);
  const rentalStatus = getRentalAvailability(product);
  const displayName = normalizeCatalogText(product.name);
  const displayDescription = normalizeCatalogText(product.description);

  return (
    <>
      <section className={rental ? "product-detail-section rental-detail-section" : "product-detail-section"}>
        <div className="site-container">
          <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/category/${category?.slug ?? "all"}`}>{category?.name ?? "Shop"}</Link>{collection && publicCollectionSlug && category ? <><span>/</span><Link href={getCategoryCollectionHref(category.slug, publicCollectionSlug)}>{collection.label}</Link></> : null}<span>/</span><span>{displayName}</span></nav>
          <div className="product-detail-grid">
            <div className="product-gallery">
              <div className="product-main-image">
                <Image src={product.image} alt={displayName} width={760} height={760} priority unoptimized={remoteImage} />
                {rentalStatus ? <span className={`rental-status-badge gallery ${rentalStatus}`}>{rentalAvailabilityLabel(rentalStatus)}</span> : null}
              </div>
              <button className="product-thumbnail product-thumbnail-active" type="button" aria-label={`View ${displayName} image`}><Image src={product.image} alt="" width={112} height={112} unoptimized={remoteImage} /></button>
            </div>
            <div className="product-detail-copy">
              <p className="wa-eyebrow">{rental ? "VERIFIED HOUSE FOR RENT" : category?.name}</p>
              <h1 className="product-detail-title">{displayName}</h1>
              <a className="rating-link" href="#reviews"><RatingStars rating={product.rating} reviewCount={product.reviewCount} /></a>
              <p className="product-detail-description">{displayDescription}</p>
              <ProductDetailClient product={product} />
              {rental ? (
                <div className="property-facts-grid" aria-label="Property details">
                  {product.rentalPropertyType ? <div><HomeIcon size={21} /><span><small>Property type</small><strong>{product.rentalPropertyType}</strong></span></div> : null}
                  {product.rentalBedrooms !== undefined ? <div><BedIcon size={21} /><span><small>Bedrooms</small><strong>{product.rentalBedrooms}</strong></span></div> : null}
                  {product.rentalBathrooms !== undefined ? <div><BathIcon size={21} /><span><small>Bathrooms</small><strong>{product.rentalBathrooms}</strong></span></div> : null}
                  {product.rentalSizeLabel ? <div><RulerIcon size={21} /><span><small>Property size</small><strong>{product.rentalSizeLabel}</strong></span></div> : null}
                  {product.rentalLocation ? <div className="wide"><MapPinIcon size={21} /><span><small>Location</small><strong>{product.rentalLocation}</strong></span></div> : null}
                </div>
              ) : null}
              <div className="product-assurance">
                {rental ? <><p><ShieldIcon size={20} /><span><strong>Owner-verified listing</strong><small>Property details are managed from the private owner dashboard.</small></span></p><p><KeyIcon size={20} /><span><strong>Secure rental payment</strong><small>Paystack confirms payment before the property is marked unavailable.</small></span></p></> : <><p><strong>Premium quality</strong><span>Carefully curated and quality checked.</span></p><p><strong>Secure checkout</strong><span>Protected payment processing.</span></p></>}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-information-section" id="reviews">
        <div className="site-container">
          <div className="product-details-copy"><p className="wa-eyebrow">{rental ? "PROPERTY INFORMATION" : "PRODUCT DETAILS"}</p><h2 className="wa-section-heading">{rental ? "Everything you need before renting." : "Designed to deliver more."}</h2><p>{displayDescription}</p><p>{rental ? "Availability is confirmed again during secure checkout. A successful payment changes the listing to rented automatically through the existing stock protection." : "Every item in the Wow & Amazing collection is selected for quality, usefulness, and a refined customer experience."}</p></div>
          <ProductReviews productId={product.id} productSlug={product.slug} productName={displayName} initialRating={product.rating} initialReviewCount={product.reviewCount} />
        </div>
      </section>

      <section className="section-shell related-products-section"><div className="site-container"><div className="section-heading-row"><div className="section-heading-copy"><p className="wa-eyebrow">{rental ? "OTHER AVAILABLE HOMES" : "RELATED PRODUCTS"}</p><h2 className="wa-section-heading section-heading-title">{rental ? "Explore more rental listings." : "You may also like."}</h2></div><Link className="section-text-link" href={rental ? "/category/property-home-services?collection=houses-for-rent#products" : "/category/all"}>{rental ? "View All Rentals" : "Shop All Products"}</Link></div><div className="related-product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
    </>
  );
}

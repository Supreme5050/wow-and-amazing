import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeEditorialSections } from "@/components/home/HomeEditorialSections";
import { ServicesTeaser } from "@/components/home/ServicesTeaser";
import { TrustBar } from "@/components/home/TrustBar";
import { getCatalogSnapshot, getPublicCustomerStories } from "@/lib/catalog/server";

export default async function HomePage() {
  const [catalog, customerStories] = await Promise.all([
    getCatalogSnapshot(),
    getPublicCustomerStories(),
  ]);
  const featured = catalog.products.filter((product) => product.isFeatured);
  const products = featured.length ? featured : catalog.products;

  return (
    <>
      <HeroSection product={products[0]} />
      <CategorySection />
      <FeaturedProducts products={products} />
      <TrustBar />
      <HomeEditorialSections products={products} stories={customerStories} />
      <ServicesTeaser />
    </>
  );
}

import { notFound } from "next/navigation";
import { CinematicExperience } from "@/components/experience/CinematicExperience";
import { getExperienceBySlug } from "@/data/experiences";
import { getCatalogSnapshot } from "@/lib/catalog/server";

export default async function ExperiencePage() {
  const experience = getExperienceBySlug("home-decor");
  if (!experience) notFound();
  const catalog = await getCatalogSnapshot();
  const products = catalog.products.filter((product) => experience.categorySlugs.includes(product.categorySlug));
  return <CinematicExperience experience={experience} products={products} />;
}

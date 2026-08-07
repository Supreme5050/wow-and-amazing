import type { CategorySeed } from "@/data/catalog";

export type PublicDepartment = CategorySeed & {
  categorySlugs: string[];
  experienceHref: string;
};

export const publicDepartments: PublicDepartment[] = [
  {
    id: "public-gadgets-accessories",
    slug: "gadgets-accessories",
    name: "Gadgets & Accessories",
    description: "Devices, accessories and everyday technology",
    image: "/catalog/categories/gadgets-accessories.webp",
    categorySlugs: ["gadgets-accessories"],
    experienceHref: "/experiences/gadgets",
  },
  {
    id: "public-food-catering",
    slug: "food-catering",
    name: "Food & Catering",
    description: "Meals, catering orders and food packaging",
    image: "/catalog/categories/restaurant-food.webp",
    categorySlugs: ["restaurant-food", "food-packaging"],
    experienceHref: "/experiences/food",
  },
  {
    id: "public-property-home-services",
    slug: "property-home-services",
    name: "Property & Home Services",
    description: "House rentals, painting and decoration",
    image: "/catalog/categories/housing-decor.webp",
    categorySlugs: ["housing-decor"],
    experienceHref: "/experiences/home-decor",
  },
  {
    id: "public-media-gadget-rentals",
    slug: "media-gadget-rentals",
    name: "Media Services & Gadget Rentals",
    description: "Media production and equipment rental",
    image: "/catalog/categories/cinematography.webp",
    categorySlugs: ["creator-kits", "cinematography"],
    experienceHref: "/experiences/creators",
  },
];

const legacyDepartmentMap: Record<string, string> = {
  "restaurant-food": "food-catering",
  "food-packaging": "food-catering",
  "housing-decor": "property-home-services",
  "creator-kits": "media-gadget-rentals",
  cinematography: "media-gadget-rentals",
};

export function getPublicDepartmentBySlug(slug: string) {
  return publicDepartments.find((department) => department.slug === slug);
}

export function getPublicDepartmentForSourceCategory(categorySlug: string) {
  return publicDepartments.find((department) => department.categorySlugs.includes(categorySlug));
}

export function getPublicDepartmentSlug(categorySlug: string) {
  return legacyDepartmentMap[categorySlug] ?? categorySlug;
}

export function getPublicDepartmentHref(categorySlug: string) {
  return `/category/${getPublicDepartmentSlug(categorySlug)}`;
}

export function getPublicCollectionSlug(categorySlug: string, collectionSlug?: string) {
  if (categorySlug === "restaurant-food") {
    if (collectionSlug === "treats-drinks") return "drinks-treats";
    return "prepared-meals";
  }
  if (categorySlug === "food-packaging") return collectionSlug === "bulk-bundles" ? "bulk-orders" : "food-packaging";
  if (categorySlug === "housing-decor") return collectionSlug === "houses-for-rent" ? "houses-for-rent" : "decor-products";
  if (categorySlug === "creator-kits") return "creator-equipment";
  if (categorySlug === "cinematography") return "camera-equipment";
  return collectionSlug;
}

export function getAdminCategoryLabel(category: Pick<CategorySeed, "slug" | "name">) {
  const labels: Record<string, string> = {
    "restaurant-food": "Food & Catering — Meals",
    "food-packaging": "Food & Catering — Packaging",
    "housing-decor": "Property & Home Services",
    "creator-kits": "Media & Rentals — Creator Equipment",
    cinematography: "Media & Rentals — Camera Equipment",
  };
  return labels[category.slug] ?? category.name;
}

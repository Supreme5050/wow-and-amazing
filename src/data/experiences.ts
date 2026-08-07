export type ExperienceKind = "video" | "image";

export type ExperienceSeed = {
  slug: "gadgets" | "food" | "creators" | "home-decor";
  departmentSlug: "gadgets-accessories" | "food-catering" | "media-gadget-rentals" | "property-home-services";
  eyebrow: string;
  title: string;
  description: string;
  mediaKind: ExperienceKind;
  mediaSrc: string;
  posterSrc: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  categorySlugs: string[];
};

export const experiences: ExperienceSeed[] = [
  {
    slug: "gadgets",
    departmentSlug: "gadgets-accessories",
    eyebrow: "GADGETS & ACCESSORIES",
    title: "Technology, selected for the way you live.",
    description: "Discover smart accessories, everyday essentials, and premium technology designed to keep life connected, productive, and beautifully simple.",
    mediaKind: "video",
    mediaSrc: "/experience/gadgets-cinematic-clean-v2.mp4",
    posterSrc: "/experience/gadgets-cinematic-clean-v2.jpg",
    primaryHref: "/category/gadgets-accessories",
    primaryLabel: "Shop Gadgets",
    categorySlugs: ["gadgets-accessories"],
  },
  {
    slug: "food",
    departmentSlug: "food-catering",
    eyebrow: "FOOD & CATERING",
    title: "Good food, catering and packaging in one place.",
    description: "Order prepared meals, plan food for an occasion, or source professional packaging without moving between separate departments.",
    mediaKind: "video",
    mediaSrc: "/experience/food-cinematic-clean-v2.mp4",
    posterSrc: "/experience/food-cinematic-clean-v2.jpg",
    primaryHref: "/category/food-catering",
    primaryLabel: "Explore Food & Catering",
    secondaryHref: "/services?service=food-catering#service-enquiry",
    secondaryLabel: "Book Catering",
    categorySlugs: ["restaurant-food", "food-packaging"],
  },
  {
    slug: "creators",
    departmentSlug: "media-gadget-rentals",
    eyebrow: "MEDIA SERVICES & GADGET RENTALS",
    title: "Create, produce and rent from one media hub.",
    description: "Book photography or videography, request production equipment for rent, and browse creator and camera tools in one organised destination.",
    mediaKind: "video",
    mediaSrc: "/experience/creators-cinematic-clean-v2.mp4",
    posterSrc: "/experience/creators-cinematic-clean-v2.jpg",
    primaryHref: "/category/media-gadget-rentals",
    primaryLabel: "Explore Media & Rentals",
    secondaryHref: "/services?service=gadget-equipment-rentals#service-enquiry",
    secondaryLabel: "Request Equipment",
    categorySlugs: ["creator-kits", "cinematography"],
  },
  {
    slug: "home-decor",
    departmentSlug: "property-home-services",
    eyebrow: "PROPERTY & HOME SERVICES",
    title: "Find a home. Paint it. Decorate it.",
    description: "Browse available houses for rent, request painting and decoration, and shop selected home pieces from one clear property and home-services destination.",
    mediaKind: "image",
    mediaSrc: "/experience/home-decor-hero.webp",
    posterSrc: "/experience/home-decor-poster.jpg",
    primaryHref: "/category/property-home-services",
    primaryLabel: "Explore Property & Home",
    secondaryHref: "/services?service=property-home-services#service-enquiry",
    secondaryLabel: "Request Home Service",
    categorySlugs: ["housing-decor"],
  },
];

export function getExperienceBySlug(slug: ExperienceSeed["slug"]) {
  return experiences.find((experience) => experience.slug === slug);
}

const categoryGatewayMap: Record<string, string> = {
  "gadgets-accessories": "/category/gadgets-accessories",
  "creator-kits": "/category/media-gadget-rentals",
  "restaurant-food": "/category/food-catering",
  "food-packaging": "/category/food-catering",
  "housing-decor": "/category/property-home-services",
  cinematography: "/category/media-gadget-rentals",
  "food-catering": "/category/food-catering",
  "property-home-services": "/category/property-home-services",
  "media-gadget-rentals": "/category/media-gadget-rentals",
};

const departmentExperienceMap: Record<string, string> = {
  "gadgets-accessories": "/experiences/gadgets",
  "food-catering": "/experiences/food",
  "property-home-services": "/experiences/home-decor",
  "media-gadget-rentals": "/experiences/creators",
};

export function getCategoryGatewayHref(categorySlug: string) {
  return categoryGatewayMap[categorySlug] ?? `/category/${categorySlug}`;
}

export function getDepartmentExperienceHref(departmentSlug: string) {
  return departmentExperienceMap[departmentSlug];
}

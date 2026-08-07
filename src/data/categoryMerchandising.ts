export type CategoryMerchandising = {
  eyebrow: string;
  headline: string;
  intro: string;
  promise: string;
  subcategories: {
    slug: string;
    label: string;
    description: string;
    image: string;
    keywords: string[];
    sourceCategorySlugs?: string[];
    sourceCollectionSlugs?: string[];
    serviceHref?: string;
    actionLabel?: string;
  }[];
  highlights: { title: string; text: string }[];
};

export const categoryMerchandising: Record<string, CategoryMerchandising> = {
  all: {
    eyebrow: "THE WOW & AMAZING MARKETPLACE",
    headline: "Everything worth discovering, beautifully organised.",
    intro: "Browse premium technology, creator tools, fresh food, responsible packaging, interiors, and production equipment from one carefully managed store.",
    promise: "One owner. One standard. Every department curated.",
    subcategories: [
      { slug: "phones-accessories", label: "Phones & Accessories", description: "Chargers, cases, audio, power and everyday mobile essentials.", image: "/catalog/categories/gadgets-accessories.webp", keywords: ["phone", "charger", "earbud", "power", "case", "cable"] },
      { slug: "creator-essentials", label: "Creator Essentials", description: "Lighting, audio and tools for modern content creation.", image: "/catalog/categories/creator-kits.webp", keywords: ["creator", "microphone", "light", "tripod", "kit"] },
      { slug: "meals-treats", label: "Meals & Treats", description: "Freshly prepared dishes and practical meal options.", image: "/catalog/categories/restaurant-food.webp", keywords: ["food", "meal", "pasta", "bowl", "grill"] },
      { slug: "packaging", label: "Packaging", description: "Food boxes, bags, cups and responsible packaging supplies.", image: "/catalog/categories/food-packaging.webp", keywords: ["box", "packaging", "cup", "bag", "container"] },
      { slug: "home-decor", label: "Home & Décor", description: "Functional pieces and finishing touches for beautiful spaces.", image: "/catalog/categories/housing-decor.webp", keywords: ["home", "decor", "wall", "lamp", "cushion"] },
      { slug: "cameras-production", label: "Cameras & Production", description: "Stability, lighting and professional production accessories.", image: "/catalog/categories/cinematography.webp", keywords: ["camera", "gimbal", "lens", "cinema", "video"] },
    ],
    highlights: [
      { title: "Curated collections", text: "Every department is arranged so customers can find the right product without searching through clutter." },
      { title: "Stock you can trust", text: "Live availability, clear options and secure Paystack checkout keep the shopping journey dependable." },
      { title: "Owner-managed quality", text: "Every listing is published and managed from the private Wow & Amazing owner dashboard." },
    ],
  },
  "gadgets-accessories": {
    eyebrow: "SMART TECH, EVERYDAY EASE",
    headline: "Phones, audio, charging and accessories for modern life.",
    intro: "Shop dependable mobile accessories arranged by the way people actually use them—from staying powered to protecting devices and enjoying better audio.",
    promise: "Practical technology. Premium presentation. Reliable everyday use.",
    subcategories: [
      { slug: "phone-accessories", label: "Phone Accessories", description: "Protective cases, screen care and useful mobile add-ons.", image: "/catalog/categories/gadgets-accessories.webp", keywords: ["phone", "case", "screen", "mobile"] },
      { slug: "wireless-audio", label: "Wireless Audio", description: "Earbuds, headphones and compact listening essentials.", image: "/catalog/products/wireless-earbuds-pro.webp", keywords: ["earbud", "headphone", "audio", "speaker"] },
      { slug: "charging-power", label: "Charging & Power", description: "Fast chargers, power banks, cables and adapters.", image: "/experience/gadgets-poster.jpg", keywords: ["charger", "charging", "power", "cable", "adapter"] },
      { slug: "smart-essentials", label: "Smart Essentials", description: "Useful connected devices for work, travel and home.", image: "/catalog/categories/gadgets-accessories.webp", keywords: ["smart", "watch", "stand", "tracker"] },
    ],
    highlights: [
      { title: "Built for compatibility", text: "Clear product options help customers select the right fit for their phone and daily routine." },
      { title: "Power without the clutter", text: "Charging products are grouped by use so customers can move from need to checkout quickly." },
      { title: "Audio for every moment", text: "From private listening to calls and travel, the collection is organised around real use cases." },
    ],
  },
  "food-catering": {
    eyebrow: "FOOD, CATERING & PACKAGING",
    headline: "Fresh meals, catering support and packaging in one place.",
    intro: "Order prepared food, plan catering for an occasion, or source practical food packaging without moving through separate departments.",
    promise: "One food destination. Fewer steps. Clearer choices.",
    subcategories: [
      { slug: "prepared-meals", label: "Prepared Meals", description: "Browse all freshly prepared meals and family portions.", image: "/catalog/categories/restaurant-food.webp", keywords: ["meal", "food", "pasta", "rice"], sourceCategorySlugs: ["restaurant-food"] },
      { slug: "drinks-treats", label: "Drinks & Treats", description: "Refreshments, desserts and small additions to complete an order.", image: "/experience/food-poster.jpg", keywords: ["drink", "treat", "dessert"], sourceCategorySlugs: ["restaurant-food"], sourceCollectionSlugs: ["treats-drinks"] },
      { slug: "catering-orders", label: "Catering Orders", description: "Request food service for meetings, celebrations and events.", image: "/experience/food-poster.jpg", keywords: ["catering", "event", "food"], serviceHref: "/services?service=food-catering#service-enquiry", actionLabel: "Book catering" },
      { slug: "food-packaging", label: "Food Packaging", description: "Boxes, cups, bags and packaging supplies for food service.", image: "/catalog/categories/food-packaging.webp", keywords: ["packaging", "box", "cup", "bag"], sourceCategorySlugs: ["food-packaging"] },
      { slug: "bulk-orders", label: "Bulk Orders", description: "Larger food portions and packaging bundles for business or events.", image: "/catalog/products/eco-food-box-50pcs.webp", keywords: ["bulk", "family", "bundle"], sourceCategorySlugs: ["restaurant-food", "food-packaging"], sourceCollectionSlugs: ["family-portions", "bulk-bundles"] },
    ],
    highlights: [
      { title: "Meals and supplies together", text: "Customers no longer need separate Restaurant Food and Food Packaging buttons." },
      { title: "Catering enquiries built in", text: "Event and group-food requests go directly into the owner-managed service inbox." },
      { title: "Simple ordering", text: "Prepared food, catering and packaging remain organised without unnecessary pages." },
    ],
  },
  "property-home-services": {
    eyebrow: "PROPERTY & HOME SERVICES",
    headline: "Find a home, refresh a space, or complete the decoration.",
    intro: "Explore available houses for rent, request painting and decoration services, and shop selected home pieces from one organised destination.",
    promise: "Property. Painting. Decoration. One clear service hub.",
    subcategories: [
      { slug: "houses-for-rent", label: "Houses for Rent", description: "View available apartments, duplexes, flats and homes.", image: "/catalog/products/rental-duplex.webp", keywords: ["house", "rent", "property"], sourceCategorySlugs: ["housing-decor"], sourceCollectionSlugs: ["houses-for-rent"] },
      { slug: "painting-decoration", label: "Painting & Decoration", description: "Request painting, finishing and interior decoration support.", image: "/experience/home-decor-poster.jpg", keywords: ["painting", "decoration", "interior"], serviceHref: "/services?service=property-home-services#service-enquiry", actionLabel: "Request this service" },
      { slug: "decor-products", label: "Home Décor Products", description: "Shop wall art, lighting, furnishings and practical accents.", image: "/catalog/categories/housing-decor.webp", keywords: ["decor", "wall", "lighting", "home"], sourceCategorySlugs: ["housing-decor"], sourceCollectionSlugs: ["wall-decor", "lighting", "soft-furnishings", "table-storage"] },
    ],
    highlights: [
      { title: "Verified rental listings", text: "Available houses remain connected to the secure rental checkout and owner controls." },
      { title: "Professional home services", text: "Painting and decoration requests are captured through one structured enquiry form." },
      { title: "Less visual clutter", text: "The former Housing & Decor department is now one clear property and home-services destination." },
    ],
  },
  "media-gadget-rentals": {
    eyebrow: "MEDIA SERVICES & GADGET RENTALS",
    headline: "Production support, creative equipment and gadget rentals together.",
    intro: "Book media production, request cameras or creator equipment for rent, and browse production tools without separate Creator Kits and Cinematography departments.",
    promise: "Create, shoot and rent from one professional media hub.",
    subcategories: [
      { slug: "media-production", label: "Media Production", description: "Photography, videography and content production for brands and events.", image: "/experience/creators-poster.jpg", keywords: ["media", "photo", "video", "content"], serviceHref: "/services?service=media-production#service-enquiry", actionLabel: "Book media service" },
      { slug: "gadget-rentals", label: "Gadget Rentals", description: "Request cameras, lights, microphones and production equipment for rent.", image: "/catalog/categories/cinematography.webp", keywords: ["gadget", "camera", "rent", "equipment"], serviceHref: "/services?service=gadget-equipment-rentals#service-enquiry", actionLabel: "Request equipment" },
      { slug: "creator-equipment", label: "Creator Equipment", description: "Lighting, microphones, tripods and mobile creator tools.", image: "/catalog/categories/creator-kits.webp", keywords: ["creator", "microphone", "tripod", "light"], sourceCategorySlugs: ["creator-kits"] },
      { slug: "camera-equipment", label: "Camera Equipment", description: "Stabilisers, rigs, lighting and camera accessories.", image: "/catalog/categories/cinematography.webp", keywords: ["camera", "gimbal", "rig", "lens"], sourceCategorySlugs: ["cinematography"] },
    ],
    highlights: [
      { title: "One media destination", text: "Creator Kits and Cinematography are now presented as one clear customer-facing department." },
      { title: "Services and rentals", text: "Customers can book production or request equipment without searching through unrelated pages." },
      { title: "Equipment still shop-ready", text: "Existing creator and camera products remain available in the same simplified hub." },
    ],
  },
  "creator-kits": {
    eyebrow: "CREATE WITH CONFIDENCE",
    headline: "Creator tools that make every idea look and sound better.",
    intro: "Explore starter kits, microphones, lighting, supports and practical accessories for creators building consistent content.",
    promise: "From first idea to finished content—everything works together.",
    subcategories: [
      { slug: "starter-bundles", label: "Starter Bundles", description: "Ready-to-use combinations for new and growing creators.", image: "/catalog/products/creator-starter-kit.webp", keywords: ["starter", "bundle", "creator", "kit"] },
      { slug: "lighting", label: "Lighting", description: "Portable lights and modifiers for cleaner visuals.", image: "/experience/creators-poster.jpg", keywords: ["light", "lighting", "ring"] },
      { slug: "microphones", label: "Microphones", description: "Simple audio tools for interviews, voice and video.", image: "/catalog/categories/creator-kits.webp", keywords: ["microphone", "audio", "lav"] },
      { slug: "stands-supports", label: "Stands & Supports", description: "Tripods, mounts and desk supports for stable creation.", image: "/catalog/categories/creator-kits.webp", keywords: ["tripod", "stand", "mount", "support"] },
    ],
    highlights: [
      { title: "Start with a complete setup", text: "Bundles reduce guesswork and make it easier to begin creating immediately." },
      { title: "Upgrade one tool at a time", text: "Every section helps customers improve lighting, sound or stability without replacing everything." },
      { title: "Made for mobile creators", text: "The collection prioritises flexible tools for phones, compact cameras and everyday workspaces." },
    ],
  },
  "restaurant-food": {
    eyebrow: "FRESHLY PREPARED",
    headline: "Meals made to satisfy, presented with care.",
    intro: "Browse comforting bowls, quick meals, family portions and freshly prepared favourites organised for easy ordering.",
    promise: "Fresh choices. Clear portions. Reliable ordering.",
    subcategories: [
      { slug: "bowls-pasta", label: "Bowls & Pasta", description: "Comforting, flavourful meals for lunch or dinner.", image: "/catalog/products/gourmet-pasta-bowl.webp", keywords: ["pasta", "bowl", "rice"] },
      { slug: "quick-meals", label: "Quick Meals", description: "Convenient options when time matters.", image: "/experience/food-poster.jpg", keywords: ["quick", "meal", "wrap", "sandwich"] },
      { slug: "family-portions", label: "Family Portions", description: "Larger servings designed for sharing.", image: "/catalog/categories/restaurant-food.webp", keywords: ["family", "platter", "large"] },
      { slug: "treats-drinks", label: "Treats & Drinks", description: "Small bites and refreshments to complete the order.", image: "/catalog/categories/restaurant-food.webp", keywords: ["drink", "treat", "dessert", "juice"] },
    ],
    highlights: [
      { title: "Prepared with attention", text: "Descriptions and portion choices help customers order confidently." },
      { title: "Easy meal discovery", text: "Food is grouped by occasion instead of forcing customers through one long list." },
      { title: "Simple repeat ordering", text: "Clear favourites and consistent options make returning for another meal effortless." },
    ],
  },
  "food-packaging": {
    eyebrow: "PACKED WITH PURPOSE",
    headline: "Safe, stylish packaging for food businesses and events.",
    intro: "Find boxes, cups, containers, bags and bundles arranged by purpose, volume and presentation.",
    promise: "Practical quantities. Responsible choices. Professional presentation.",
    subcategories: [
      { slug: "takeaway-boxes", label: "Takeaway Boxes", description: "Reliable food boxes for hot and cold meals.", image: "/catalog/products/eco-food-box-50pcs.webp", keywords: ["box", "takeaway", "food"] },
      { slug: "cups-lids", label: "Cups & Lids", description: "Drinkware and covers for service and delivery.", image: "/catalog/categories/food-packaging.webp", keywords: ["cup", "lid", "drink"] },
      { slug: "bags-wraps", label: "Bags & Wraps", description: "Carry bags, wraps and protective service materials.", image: "/experience/food-poster.jpg", keywords: ["bag", "wrap", "paper"] },
      { slug: "bulk-bundles", label: "Bulk Bundles", description: "Higher-volume packs for growing food businesses.", image: "/catalog/categories/food-packaging.webp", keywords: ["bulk", "100", "bundle", "pack"] },
    ],
    highlights: [
      { title: "Choose by serving need", text: "Customers can move directly to takeaway, drinks, wraps or bulk supplies." },
      { title: "Clear pack quantities", text: "Product options make the quantity and price difference easy to understand." },
      { title: "Built for business", text: "The layout supports both small orders and repeat supply purchases." },
    ],
  },
  "housing-decor": {
    eyebrow: "LIVE BEAUTIFULLY",
    headline: "Decor, finishing pieces and useful details for better spaces.",
    intro: "Discover wall pieces, lighting, soft furnishings and practical accents arranged to help customers complete a room with confidence.",
    promise: "Thoughtful pieces. Calm spaces. A more considered home.",
    subcategories: [
      { slug: "wall-decor", label: "Wall Décor", description: "Artwork, mirrors and statement pieces for empty walls.", image: "/catalog/products/wall-art-abstract.webp", keywords: ["wall", "art", "mirror"] },
      { slug: "lighting", label: "Lighting", description: "Lamps and warm accents that shape the mood of a room.", image: "/experience/home-decor-poster.jpg", keywords: ["lamp", "light", "lighting"] },
      { slug: "soft-furnishings", label: "Soft Furnishings", description: "Cushions, throws and comfortable finishing touches.", image: "/catalog/categories/housing-decor.webp", keywords: ["cushion", "throw", "soft"] },
      { slug: "table-storage", label: "Table & Storage", description: "Useful objects that keep surfaces organised and refined.", image: "/catalog/categories/housing-decor.webp", keywords: ["table", "storage", "vase", "organiser"] },
      { slug: "houses-for-rent", label: "Houses for Rent", description: "Verified homes ready to move into, rent paid securely online.", image: "/catalog/products/rental-duplex.webp", keywords: ["house", "rent", "rental", "apartment", "duplex", "bungalow", "studio", "flat", "mansion", "property", "lease"] },
    ],
    highlights: [
      { title: "Shop by room feeling", text: "Collections focus on the effect customers want to create, not only the item type." },
      { title: "Premium without excess", text: "A calm presentation keeps every piece visible and avoids visual clutter." },
      { title: "Details that work", text: "Decor is balanced with useful home essentials for a more complete collection." },
      { title: "Rent with confidence", text: "Every listed home is owner-verified, with rent paid in full and securely through the same trusted checkout." },
    ],
  },
  cinematography: {
    eyebrow: "CAPTURE. CREATE. CINEMATIC.",
    headline: "Camera tools and production accessories for smoother work.",
    intro: "Explore stabilisation, lighting, lenses and production essentials arranged for filmmakers, videographers and content teams.",
    promise: "Stable footage. Better light. More confident production.",
    subcategories: [
      { slug: "stabilisers", label: "Stabilisers", description: "Gimbals and supports for smooth, controlled movement.", image: "/catalog/products/camera-gimbal-pro.webp", keywords: ["gimbal", "stabiliser", "support"] },
      { slug: "camera-accessories", label: "Camera Accessories", description: "Useful add-ons for cameras and production rigs.", image: "/catalog/categories/cinematography.webp", keywords: ["camera", "accessory", "rig"] },
      { slug: "lighting-grip", label: "Lighting & Grip", description: "Portable lighting and mounting solutions for sets.", image: "/experience/creators-poster.jpg", keywords: ["light", "grip", "stand"] },
      { slug: "lens-storage", label: "Lens & Storage", description: "Lens tools, cases and media organisation essentials.", image: "/experience/creators-poster.jpg", keywords: ["lens", "case", "storage", "card"] },
    ],
    highlights: [
      { title: "Designed around production", text: "Departments follow a real shooting workflow—from support and light to accessories and storage." },
      { title: "Clear equipment options", text: "Customers can compare bundles and stock before committing to a purchase." },
      { title: "Cinematic gateway retained", text: "The immersive visual experience remains available before customers enter the full product catalogue." },
    ],
  },
};

export function getCategoryMerchandising(slug: string) {
  return categoryMerchandising[slug] ?? categoryMerchandising.all;
}


export type MerchandisingCollection = CategoryMerchandising["subcategories"][number];

export function matchesMerchandisingCollection(
  product: { categorySlug: string; subcategorySlug?: string },
  collection: MerchandisingCollection,
) {
  const categoryMatches = !collection.sourceCategorySlugs?.length || collection.sourceCategorySlugs.includes(product.categorySlug);
  const collectionMatches = collection.sourceCollectionSlugs?.length
    ? Boolean(product.subcategorySlug && collection.sourceCollectionSlugs.includes(product.subcategorySlug))
    : collection.sourceCategorySlugs?.length
      ? true
      : product.subcategorySlug === collection.slug;
  return categoryMatches && collectionMatches;
}

export function getCategoryCollection(categorySlug: string, collectionSlug: string) {
  return getCategoryMerchandising(categorySlug).subcategories.find((item) => item.slug === collectionSlug);
}

export function getCategoryCollectionHref(categorySlug: string, collectionSlug: string) {
  return `/category/${categorySlug}?collection=${collectionSlug}#products`;
}

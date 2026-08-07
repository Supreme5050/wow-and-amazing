export type ProductVariantSeed = {
  id: string;
  name: string;
  priceDelta: number;
  stockQty: number;
};

export type CategorySeed = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
};

export type ProductSeed = {
  id: string;
  slug: string;
  categorySlug: string;
  subcategorySlug?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  reviewCount: number;
  stockQty: number;
  isFeatured: boolean;
  variants: ProductVariantSeed[];
  rentalBedrooms?: number;
  rentalBathrooms?: number;
  rentalLocation?: string;
  rentalSizeLabel?: string;
  rentalPropertyType?: string;
  rentalStatus?: "available" | "reserved" | "rented";
  isDemo?: boolean;
};

export type ServiceSeed = {
  slug: string;
  title: string;
  description: string;
  icon: "camera" | "package" | "content" | "styling";
};

export const categories: CategorySeed[] = [
  { id: "10000000-0000-4000-8000-000000000001", slug: "gadgets-accessories", name: "Gadgets & Accessories", description: "Smart tech for modern life", image: "/catalog/categories/gadgets-accessories.webp" },
  { id: "10000000-0000-4000-8000-000000000002", slug: "creator-kits", name: "Creator Kits", description: "Tools for creators and innovators", image: "/catalog/categories/creator-kits.webp" },
  { id: "10000000-0000-4000-8000-000000000003", slug: "restaurant-food", name: "Restaurant Food", description: "Delicious meals, delivered fresh", image: "/catalog/categories/restaurant-food.webp" },
  { id: "10000000-0000-4000-8000-000000000004", slug: "food-packaging", name: "Food Packaging", description: "Sustainable. Safe. Stylish.", image: "/catalog/categories/food-packaging.webp" },
  { id: "10000000-0000-4000-8000-000000000005", slug: "housing-decor", name: "Housing & Decor", description: "Design. Décor. Transform.", image: "/catalog/categories/housing-decor.webp" },
  { id: "10000000-0000-4000-8000-000000000006", slug: "cinematography", name: "Cinematography", description: "Capture. Create. Cinematic.", image: "/catalog/categories/cinematography.webp" },
];

const baseProducts: ProductSeed[] = [
  {
    id: "20000000-0000-4000-8000-000000000001", slug: "wireless-earbuds-pro", categorySlug: "gadgets-accessories", name: "Wireless Earbuds Pro", description: "Premium wireless listening for work, travel, and everyday life.", price: 79.99, image: "/catalog/products/wireless-earbuds-pro.webp", rating: 4, reviewCount: 128, stockQty: 40, isFeatured: true,
    variants: [
      { id: "40000000-0000-4000-8000-000000000001", name: "Midnight Ink", priceDelta: 0, stockQty: 24 },
      { id: "40000000-0000-4000-8000-000000000002", name: "Pearl White", priceDelta: 0, stockQty: 16 },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000002", slug: "creator-starter-kit", categorySlug: "creator-kits", name: "Creator Starter Kit", description: "A practical essentials bundle for creators building their next idea.", price: 199, image: "/catalog/products/creator-starter-kit.webp", rating: 4, reviewCount: 96, stockQty: 24, isFeatured: true,
    variants: [
      { id: "40000000-0000-4000-8000-000000000003", name: "Standard Kit", priceDelta: 0, stockQty: 16 },
      { id: "40000000-0000-4000-8000-000000000004", name: "Complete Kit", priceDelta: 49, stockQty: 8 },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000003", slug: "gourmet-pasta-bowl", categorySlug: "restaurant-food", name: "Gourmet Pasta Bowl", description: "A fresh, flavourful pasta bowl prepared for an elevated meal.", price: 14.99, image: "/catalog/products/gourmet-pasta-bowl.webp", rating: 4, reviewCount: 76, stockQty: 60, isFeatured: true,
    variants: [
      { id: "40000000-0000-4000-8000-000000000005", name: "Regular", priceDelta: 0, stockQty: 42 },
      { id: "40000000-0000-4000-8000-000000000006", name: "Large", priceDelta: 4, stockQty: 18 },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000004", slug: "eco-food-box-50pcs", categorySlug: "food-packaging", name: "Eco Food Box (50pcs)", description: "Durable food boxes designed for practical, responsible packaging.", price: 19.99, image: "/catalog/products/eco-food-box-50pcs.webp", rating: 4, reviewCount: 64, stockQty: 80, isFeatured: true,
    variants: [
      { id: "40000000-0000-4000-8000-000000000007", name: "50 Pieces", priceDelta: 0, stockQty: 52 },
      { id: "40000000-0000-4000-8000-000000000008", name: "100 Pieces", priceDelta: 16, stockQty: 28 },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000005", slug: "wall-art-abstract", categorySlug: "housing-decor", name: "Wall Art – Abstract", description: "A refined abstract statement piece for modern interiors.", price: 49.99, image: "/catalog/products/wall-art-abstract.webp", rating: 4, reviewCount: 52, stockQty: 18, isFeatured: true,
    variants: [
      { id: "40000000-0000-4000-8000-000000000009", name: "A3", priceDelta: 0, stockQty: 11 },
      { id: "40000000-0000-4000-8000-000000000010", name: "A2", priceDelta: 20, stockQty: 7 },
    ],
  },
  {
    id: "20000000-0000-4000-8000-000000000006", slug: "camera-gimbal-pro", categorySlug: "cinematography", name: "Camera Gimbal Pro", description: "Stable, smooth motion support for professional-looking footage.", price: 249, image: "/catalog/products/camera-gimbal-pro.webp", rating: 4, reviewCount: 88, stockQty: 16, isFeatured: true,
    variants: [
      { id: "40000000-0000-4000-8000-000000000011", name: "Standard", priceDelta: 0, stockQty: 10 },
      { id: "40000000-0000-4000-8000-000000000012", name: "Creator Bundle", priceDelta: 45, stockQty: 6 },
    ],
  },

  {
    id: "21000000-0000-4000-8000-000000000001", slug: "fast-charge-power-bank", categorySlug: "gadgets-accessories", name: "Fast-Charge Power Bank", description: "Compact high-capacity portable power for phones, earbuds and daily travel.", price: 42.00, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.6, reviewCount: 48, stockQty: 35, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000001", name: "10,000mAh", priceDelta: 0, stockQty: 22 }, { id: "41000000-0000-4000-8000-000000000002", name: "20,000mAh", priceDelta: 18, stockQty: 13 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000002", slug: "premium-phone-case", categorySlug: "gadgets-accessories", name: "Premium Protective Phone Case", description: "Slim shock-resistant protection with a refined matte finish for everyday use.", price: 18.50, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.4, reviewCount: 72, stockQty: 54, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000003", name: "iPhone", priceDelta: 0, stockQty: 28 }, { id: "41000000-0000-4000-8000-000000000004", name: "Samsung", priceDelta: 0, stockQty: 26 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000003", slug: "braided-usb-c-cable", categorySlug: "gadgets-accessories", name: "Braided USB-C Fast Cable", description: "Durable reinforced cable designed for dependable charging and data transfer.", price: 11.99, image: "/catalog/products/wireless-earbuds-pro.webp", rating: 4.5, reviewCount: 91, stockQty: 90, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000005", name: "1 Metre", priceDelta: 0, stockQty: 54 }, { id: "41000000-0000-4000-8000-000000000006", name: "2 Metres", priceDelta: 4, stockQty: 36 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000004", slug: "portable-ring-light", categorySlug: "creator-kits", name: "Portable Ring Light", description: "Adjustable soft lighting for videos, beauty content, calls and product photography.", price: 36.00, image: "/experience/creators-poster.jpg", rating: 4.7, reviewCount: 61, stockQty: 25, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000007", name: "10-inch", priceDelta: 0, stockQty: 16 }, { id: "41000000-0000-4000-8000-000000000008", name: "14-inch", priceDelta: 14, stockQty: 9 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000005", slug: "wireless-lavalier-microphone", categorySlug: "creator-kits", name: "Wireless Lavalier Microphone", description: "Clear portable audio for interviews, short videos and live mobile content.", price: 58.00, image: "/catalog/categories/creator-kits.webp", rating: 4.5, reviewCount: 43, stockQty: 31, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000009", name: "USB-C", priceDelta: 0, stockQty: 19 }, { id: "41000000-0000-4000-8000-000000000010", name: "Lightning", priceDelta: 5, stockQty: 12 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000006", slug: "creator-desk-tripod", categorySlug: "creator-kits", name: "Creator Desk Tripod", description: "Stable compact support for phones, cameras and overhead content creation.", price: 29.99, image: "/catalog/products/creator-starter-kit.webp", rating: 4.3, reviewCount: 38, stockQty: 28, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000011", name: "Standard", priceDelta: 0, stockQty: 28 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000007", slug: "jollof-chicken-bowl", categorySlug: "restaurant-food", name: "Jollof Rice & Grilled Chicken", description: "Smoky Nigerian jollof rice served with seasoned grilled chicken and sides.", price: 18.99, image: "/experience/food-poster.jpg", rating: 4.8, reviewCount: 104, stockQty: 45, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000012", name: "Regular", priceDelta: 0, stockQty: 30 }, { id: "41000000-0000-4000-8000-000000000013", name: "Large", priceDelta: 5, stockQty: 15 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000008", slug: "creamy-chicken-pasta", categorySlug: "restaurant-food", name: "Creamy Chicken Pasta", description: "Rich creamy pasta finished with grilled chicken and fresh herbs.", price: 17.50, image: "/catalog/products/gourmet-pasta-bowl.webp", rating: 4.6, reviewCount: 67, stockQty: 38, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000014", name: "Regular", priceDelta: 0, stockQty: 25 }, { id: "41000000-0000-4000-8000-000000000015", name: "Family Bowl", priceDelta: 18, stockQty: 13 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000009", slug: "fresh-fruit-cooler", categorySlug: "restaurant-food", name: "Fresh Fruit Cooler", description: "A chilled refreshing fruit blend prepared to complete any meal.", price: 6.50, image: "/catalog/categories/restaurant-food.webp", rating: 4.4, reviewCount: 29, stockQty: 60, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000016", name: "50cl", priceDelta: 0, stockQty: 60 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000010", slug: "kraft-takeaway-boxes", categorySlug: "food-packaging", name: "Kraft Takeaway Boxes", description: "Strong natural-finish containers for meals, pastries and food delivery.", price: 24.00, image: "/catalog/products/eco-food-box-50pcs.webp", rating: 4.6, reviewCount: 45, stockQty: 76, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000017", name: "50 Pieces", priceDelta: 0, stockQty: 48 }, { id: "41000000-0000-4000-8000-000000000018", name: "100 Pieces", priceDelta: 20, stockQty: 28 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000011", slug: "clear-cups-with-lids", categorySlug: "food-packaging", name: "Clear Cups with Lids", description: "Professional transparent drink cups for juice, smoothies and cold beverages.", price: 16.00, image: "/catalog/categories/food-packaging.webp", rating: 4.5, reviewCount: 33, stockQty: 84, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000019", name: "25 Pieces", priceDelta: 0, stockQty: 50 }, { id: "41000000-0000-4000-8000-000000000020", name: "50 Pieces", priceDelta: 12, stockQty: 34 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000012", slug: "branded-paper-bags", categorySlug: "food-packaging", name: "Premium Paper Carry Bags", description: "Neat reinforced paper bags for takeaway orders, gifts and retail packaging.", price: 21.00, image: "/experience/food-poster.jpg", rating: 4.3, reviewCount: 26, stockQty: 62, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000021", name: "Small", priceDelta: 0, stockQty: 24 }, { id: "41000000-0000-4000-8000-000000000022", name: "Large", priceDelta: 7, stockQty: 38 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000013", slug: "ambient-table-lamp", categorySlug: "housing-decor", name: "Ambient Table Lamp", description: "Warm minimalist lighting designed for bedrooms, desks and calm living spaces.", price: 64.00, image: "/experience/home-decor-poster.jpg", rating: 4.7, reviewCount: 58, stockQty: 20, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000023", name: "Warm White", priceDelta: 0, stockQty: 12 }, { id: "41000000-0000-4000-8000-000000000024", name: "Natural Linen", priceDelta: 8, stockQty: 8 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000014", slug: "textured-cushion-set", categorySlug: "housing-decor", name: "Textured Cushion Set", description: "Soft decorative cushions that add warmth, depth and comfort to a room.", price: 38.00, image: "/catalog/categories/housing-decor.webp", rating: 4.5, reviewCount: 41, stockQty: 27, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000025", name: "Set of 2", priceDelta: 0, stockQty: 17 }, { id: "41000000-0000-4000-8000-000000000026", name: "Set of 4", priceDelta: 28, stockQty: 10 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000015", slug: "ceramic-decor-vase", categorySlug: "housing-decor", name: "Sculpted Ceramic Vase", description: "A clean sculptural accent for shelves, consoles and dining surfaces.", price: 47.50, image: "/catalog/products/wall-art-abstract.webp", rating: 4.4, reviewCount: 32, stockQty: 19, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000027", name: "Ivory", priceDelta: 0, stockQty: 11 }, { id: "41000000-0000-4000-8000-000000000028", name: "Sand", priceDelta: 0, stockQty: 8 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000016", slug: "led-video-light-panel", categorySlug: "cinematography", name: "LED Video Light Panel", description: "Adjustable portable lighting for interviews, product shoots and compact sets.", price: 86.00, image: "/experience/creators-poster.jpg", rating: 4.6, reviewCount: 54, stockQty: 22, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000029", name: "Single Light", priceDelta: 0, stockQty: 14 }, { id: "41000000-0000-4000-8000-000000000030", name: "Two-Light Kit", priceDelta: 72, stockQty: 8 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000017", slug: "camera-rig-cage", categorySlug: "cinematography", name: "Professional Camera Rig Cage", description: "Expandable protective rig support for monitors, microphones and production accessories.", price: 118.00, image: "/catalog/categories/cinematography.webp", rating: 4.5, reviewCount: 37, stockQty: 15, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000031", name: "Universal", priceDelta: 0, stockQty: 15 }],
  },
  {
    id: "21000000-0000-4000-8000-000000000018", slug: "camera-storage-case", categorySlug: "cinematography", name: "Protective Camera Storage Case", description: "Padded compartment case for cameras, lenses, batteries and memory cards.", price: 74.00, image: "/catalog/products/camera-gimbal-pro.webp", rating: 4.7, reviewCount: 49, stockQty: 24, isFeatured: false,
    variants: [{ id: "41000000-0000-4000-8000-000000000032", name: "Medium", priceDelta: 0, stockQty: 15 }, { id: "41000000-0000-4000-8000-000000000033", name: "Large", priceDelta: 22, stockQty: 9 }],
  },
];

const productSubcategoryAssignments: Record<string, string> = {
  "wireless-earbuds-pro": "wireless-audio",
  "creator-starter-kit": "starter-bundles",
  "gourmet-pasta-bowl": "bowls-pasta",
  "eco-food-box-50pcs": "takeaway-boxes",
  "wall-art-abstract": "wall-decor",
  "camera-gimbal-pro": "stabilisers",
  "fast-charge-power-bank": "charging-power",
  "premium-phone-case": "phone-accessories",
  "braided-usb-c-cable": "charging-power",
  "portable-ring-light": "lighting",
  "wireless-lavalier-microphone": "microphones",
  "creator-desk-tripod": "stands-supports",
  "jollof-chicken-bowl": "bowls-pasta",
  "creamy-chicken-pasta": "bowls-pasta",
  "fresh-fruit-cooler": "treats-drinks",
  "kraft-takeaway-boxes": "takeaway-boxes",
  "clear-cups-with-lids": "cups-lids",
  "branded-paper-bags": "bags-wraps",
  "ambient-table-lamp": "lighting",
  "textured-cushion-set": "soft-furnishings",
  "ceramic-decor-vase": "table-storage",
  "led-video-light-panel": "lighting-grip",
  "camera-rig-cage": "camera-accessories",
  "camera-storage-case": "lens-storage",
};

const collectionExpansionProducts: ProductSeed[] = [
  {
    id: "22000000-0000-4000-8000-000000000001", slug: "tempered-glass-screen-protector", categorySlug: "gadgets-accessories", subcategorySlug: "phone-accessories", name: "Tempered Glass Screen Protector", description: "Crystal-clear impact protection with edge-to-edge coverage and an easy alignment frame.", price: 9.99, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.5, reviewCount: 84, stockQty: 120, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000001", name: "Standard", priceDelta: 0, stockQty: 120 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000002", slug: "magnetic-car-phone-holder", categorySlug: "gadgets-accessories", subcategorySlug: "phone-accessories", name: "Magnetic Car Phone Holder", description: "A secure dashboard mount with one-hand positioning for safer everyday navigation.", price: 24.50, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.6, reviewCount: 57, stockQty: 46, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000002", name: "Standard", priceDelta: 0, stockQty: 46 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000003", slug: "portable-bluetooth-speaker", categorySlug: "gadgets-accessories", subcategorySlug: "wireless-audio", name: "Portable Bluetooth Speaker", description: "Compact room-filling sound with long battery life for work, travel and small gatherings.", price: 49.00, image: "/catalog/products/wireless-earbuds-pro.webp", rating: 4.7, reviewCount: 69, stockQty: 32, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000003", name: "Standard", priceDelta: 0, stockQty: 32 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000004", slug: "noise-cancelling-headphones", categorySlug: "gadgets-accessories", subcategorySlug: "wireless-audio", name: "Noise-Cancelling Headphones", description: "Comfortable over-ear listening with focused sound and reduced background noise.", price: 129.00, image: "/catalog/products/wireless-earbuds-pro.webp", rating: 4.8, reviewCount: 41, stockQty: 20, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000004", name: "Standard", priceDelta: 0, stockQty: 20 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000005", slug: "three-in-one-wireless-charging-stand", categorySlug: "gadgets-accessories", subcategorySlug: "charging-power", name: "3-in-1 Wireless Charging Stand", description: "A refined bedside or desk station for compatible phones, earbuds and smart watches.", price: 54.00, image: "/experience/gadgets-poster.jpg", rating: 4.6, reviewCount: 52, stockQty: 29, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000005", name: "Standard", priceDelta: 0, stockQty: 29 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000006", slug: "smart-fitness-watch", categorySlug: "gadgets-accessories", subcategorySlug: "smart-essentials", name: "Smart Fitness Watch", description: "Everyday activity, call and wellness tracking in a clean, lightweight design.", price: 89.00, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.5, reviewCount: 63, stockQty: 27, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000006", name: "Standard", priceDelta: 0, stockQty: 27 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000007", slug: "bluetooth-item-tracker", categorySlug: "gadgets-accessories", subcategorySlug: "smart-essentials", name: "Bluetooth Item Tracker", description: "Keep keys, bags and travel essentials easier to locate from a connected phone.", price: 22.00, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.4, reviewCount: 38, stockQty: 58, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000007", name: "Standard", priceDelta: 0, stockQty: 58 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000008", slug: "foldable-phone-stand", categorySlug: "gadgets-accessories", subcategorySlug: "smart-essentials", name: "Foldable Phone Stand", description: "An adjustable aluminium stand for video calls, recipes, charging and desk use.", price: 14.50, image: "/catalog/categories/gadgets-accessories.webp", rating: 4.5, reviewCount: 75, stockQty: 66, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000008", name: "Standard", priceDelta: 0, stockQty: 66 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000009", slug: "creator-background-backdrop-kit", categorySlug: "creator-kits", subcategorySlug: "starter-bundles", name: "Creator Background Backdrop Kit", description: "A portable neutral backdrop set for product photography, portraits and short videos.", price: 79.00, image: "/catalog/products/creator-starter-kit.webp", rating: 4.5, reviewCount: 29, stockQty: 17, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000009", name: "Standard", priceDelta: 0, stockQty: 17 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000010", slug: "portable-softbox-lighting-kit", categorySlug: "creator-kits", subcategorySlug: "lighting", name: "Portable Softbox Lighting Kit", description: "Soft, balanced lighting for interviews, beauty work and small product setups.", price: 112.00, image: "/experience/creators-poster.jpg", rating: 4.7, reviewCount: 44, stockQty: 18, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000010", name: "Standard", priceDelta: 0, stockQty: 18 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000011", slug: "compact-shotgun-microphone", categorySlug: "creator-kits", subcategorySlug: "microphones", name: "Compact Shotgun Microphone", description: "Directional on-camera audio for interviews, events and mobile production.", price: 68.00, image: "/catalog/categories/creator-kits.webp", rating: 4.6, reviewCount: 36, stockQty: 25, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000011", name: "Standard", priceDelta: 0, stockQty: 25 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000012", slug: "overhead-desk-mount", categorySlug: "creator-kits", subcategorySlug: "stands-supports", name: "Overhead Desk Mount", description: "A strong adjustable arm for overhead filming, tutorials and hands-free demonstrations.", price: 46.00, image: "/catalog/products/creator-starter-kit.webp", rating: 4.5, reviewCount: 31, stockQty: 22, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000012", name: "Standard", priceDelta: 0, stockQty: 22 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000013", slug: "grilled-chicken-wrap", categorySlug: "restaurant-food", subcategorySlug: "quick-meals", name: "Grilled Chicken Wrap", description: "Seasoned grilled chicken, crisp vegetables and house sauce wrapped for an easy meal.", price: 11.50, image: "/experience/food-poster.jpg", rating: 4.7, reviewCount: 88, stockQty: 55, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000013", name: "Standard", priceDelta: 0, stockQty: 55 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000014", slug: "breakfast-sandwich", categorySlug: "restaurant-food", subcategorySlug: "quick-meals", name: "Breakfast Sandwich", description: "A warm, satisfying breakfast sandwich prepared for a quick start to the day.", price: 8.50, image: "/catalog/categories/restaurant-food.webp", rating: 4.5, reviewCount: 46, stockQty: 48, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000014", name: "Standard", priceDelta: 0, stockQty: 48 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000015", slug: "family-jollof-tray", categorySlug: "restaurant-food", subcategorySlug: "family-portions", name: "Family Jollof Tray", description: "A generous shareable tray of smoky jollof rice with grilled chicken and sides.", price: 52.00, image: "/experience/food-poster.jpg", rating: 4.8, reviewCount: 73, stockQty: 24, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000015", name: "Standard", priceDelta: 0, stockQty: 24 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000016", slug: "chocolate-dessert-cup", categorySlug: "restaurant-food", subcategorySlug: "treats-drinks", name: "Chocolate Dessert Cup", description: "A rich chilled chocolate dessert finished in a convenient individual serving.", price: 7.00, image: "/catalog/categories/restaurant-food.webp", rating: 4.6, reviewCount: 39, stockQty: 42, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000016", name: "Standard", priceDelta: 0, stockQty: 42 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000017", slug: "leakproof-soup-containers", categorySlug: "food-packaging", subcategorySlug: "takeaway-boxes", name: "Leakproof Soup Containers", description: "Secure lidded containers for soups, sauces and delivery-ready hot meals.", price: 28.00, image: "/catalog/products/eco-food-box-50pcs.webp", rating: 4.6, reviewCount: 42, stockQty: 70, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000017", name: "Standard", priceDelta: 0, stockQty: 70 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000018", slug: "paper-hot-cups-with-lids", categorySlug: "food-packaging", subcategorySlug: "cups-lids", name: "Paper Hot Cups with Lids", description: "Insulated paper cups with fitted lids for coffee, tea and takeaway beverages.", price: 18.00, image: "/catalog/categories/food-packaging.webp", rating: 4.5, reviewCount: 37, stockQty: 82, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000018", name: "Standard", priceDelta: 0, stockQty: 82 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000019", slug: "aluminium-foil-wrap", categorySlug: "food-packaging", subcategorySlug: "bags-wraps", name: "Commercial Aluminium Foil Wrap", description: "Reliable food-safe wrapping for kitchens, catering, transport and storage.", price: 15.50, image: "/experience/food-poster.jpg", rating: 4.4, reviewCount: 30, stockQty: 64, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000019", name: "Standard", priceDelta: 0, stockQty: 64 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000020", slug: "bulk-food-packaging-starter-pack", categorySlug: "food-packaging", subcategorySlug: "bulk-bundles", name: "Bulk Food Packaging Starter Pack", description: "A practical mixed bundle of boxes, bags, cups and service essentials for growing food brands.", price: 96.00, image: "/catalog/categories/food-packaging.webp", rating: 4.7, reviewCount: 22, stockQty: 18, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000020", name: "Standard", priceDelta: 0, stockQty: 18 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000021", slug: "round-wall-mirror", categorySlug: "housing-decor", subcategorySlug: "wall-decor", name: "Round Wall Mirror", description: "A simple statement mirror with a slim frame for bedrooms, halls and living spaces.", price: 78.00, image: "/catalog/products/wall-art-abstract.webp", rating: 4.6, reviewCount: 35, stockQty: 15, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000021", name: "Standard", priceDelta: 0, stockQty: 15 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000022", slug: "floor-standing-lamp", categorySlug: "housing-decor", subcategorySlug: "lighting", name: "Floor Standing Lamp", description: "Warm directional lighting with a calm silhouette for reading corners and lounges.", price: 118.00, image: "/experience/home-decor-poster.jpg", rating: 4.7, reviewCount: 27, stockQty: 12, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000022", name: "Standard", priceDelta: 0, stockQty: 12 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000023", slug: "luxury-throw-blanket", categorySlug: "housing-decor", subcategorySlug: "soft-furnishings", name: "Luxury Throw Blanket", description: "A soft textured throw designed to add comfort and quiet warmth to a room.", price: 56.00, image: "/catalog/categories/housing-decor.webp", rating: 4.8, reviewCount: 51, stockQty: 21, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000023", name: "Standard", priceDelta: 0, stockQty: 21 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000024", slug: "woven-storage-baskets", categorySlug: "housing-decor", subcategorySlug: "table-storage", name: "Woven Storage Basket Set", description: "Elegant practical baskets for shelves, wardrobes, living rooms and nursery storage.", price: 44.00, image: "/catalog/categories/housing-decor.webp", rating: 4.5, reviewCount: 33, stockQty: 24, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000024", name: "Standard", priceDelta: 0, stockQty: 24 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000025", slug: "handheld-camera-stabilizer", categorySlug: "cinematography", subcategorySlug: "stabilisers", name: "Handheld Camera Stabilizer", description: "A balanced mechanical support for smooth handheld movement without batteries.", price: 94.00, image: "/catalog/products/camera-gimbal-pro.webp", rating: 4.6, reviewCount: 28, stockQty: 13, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000025", name: "Standard", priceDelta: 0, stockQty: 13 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000026", slug: "camera-monitor-mount", categorySlug: "cinematography", subcategorySlug: "camera-accessories", name: "Adjustable Camera Monitor Mount", description: "A secure tilting mount for field monitors, lights and compact camera accessories.", price: 39.00, image: "/catalog/categories/cinematography.webp", rating: 4.5, reviewCount: 34, stockQty: 26, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000026", name: "Standard", priceDelta: 0, stockQty: 26 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000027", slug: "heavy-duty-light-stand", categorySlug: "cinematography", subcategorySlug: "lighting-grip", name: "Heavy-Duty Light Stand", description: "Stable height-adjustable support for LED panels, flashes and compact modifiers.", price: 72.00, image: "/experience/creators-poster.jpg", rating: 4.7, reviewCount: 40, stockQty: 19, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000027", name: "Standard", priceDelta: 0, stockQty: 19 }],
  },
  {
    id: "22000000-0000-4000-8000-000000000028", slug: "lens-cleaning-storage-kit", categorySlug: "cinematography", subcategorySlug: "lens-storage", name: "Lens Cleaning & Storage Kit", description: "A complete maintenance set with cleaning tools and padded protection for lenses.", price: 34.00, image: "/catalog/products/camera-gimbal-pro.webp", rating: 4.6, reviewCount: 48, stockQty: 37, isFeatured: false,
    variants: [{ id: "42000000-0000-4000-8000-000000000028", name: "Standard", priceDelta: 0, stockQty: 37 }],
  },
];

const housingRentalProducts: ProductSeed[] = [
  {
    id: "23000000-0000-4000-8000-000000000001", slug: "3-bedroom-duplex-lekki-phase-1", categorySlug: "housing-decor", subcategorySlug: "houses-for-rent", name: "3-Bedroom Duplex – Lekki Phase 1", description: "A modern 3-bedroom duplex in the heart of Lekki Phase 1, with 3 bathrooms, a fitted kitchen, private parking for two cars, 24-hour estate security, and constant water supply. Fully tiled, freshly painted, and ready for immediate move-in. Rent is paid securely online, in full, at checkout.", price: 890.00, image: "/catalog/products/rental-duplex.webp", rating: 4.8, reviewCount: 19, stockQty: 1, isFeatured: true,
    variants: [{ id: "43000000-0000-4000-8000-000000000001", name: "Standard", priceDelta: 0, stockQty: 1 }],
    rentalBedrooms: 3, rentalBathrooms: 3, rentalLocation: "Lekki Phase 1, Lagos", rentalSizeLabel: "240 sqm", rentalPropertyType: "Duplex", rentalStatus: "available", isDemo: true,
  },
  {
    id: "23000000-0000-4000-8000-000000000002", slug: "self-contained-studio-yaba", categorySlug: "housing-decor", subcategorySlug: "houses-for-rent", name: "Self-Contained Studio Apartment – Yaba", description: "A compact, self-contained studio apartment in Yaba with a private bathroom, kitchenette, and reliable power supply. Ideal for a student or single professional who wants a quiet, secure space close to the city. Rent covers the full lease term and is paid in full at checkout.", price: 260.00, image: "/catalog/products/rental-studio.webp", rating: 4.5, reviewCount: 12, stockQty: 1, isFeatured: false,
    variants: [{ id: "43000000-0000-4000-8000-000000000002", name: "Standard", priceDelta: 0, stockQty: 1 }],
    rentalBathrooms: 1, rentalLocation: "Yaba, Lagos", rentalSizeLabel: "28 sqm", rentalPropertyType: "Studio", rentalStatus: "available", isDemo: true,
  },
  {
    id: "23000000-0000-4000-8000-000000000003", slug: "4-bedroom-bungalow-ikoyi", categorySlug: "housing-decor", subcategorySlug: "houses-for-rent", name: "4-Bedroom Detached Bungalow – Ikoyi", description: "A spacious 4-bedroom detached bungalow on a quiet street in Ikoyi, with 4 en-suite bathrooms, a large sitting room, a fitted kitchen, staff quarters, and gated parking for three cars. Comes with a backup generator and borehole water supply.", price: 1450.00, image: "/catalog/products/rental-bungalow.webp", rating: 4.9, reviewCount: 8, stockQty: 1, isFeatured: true,
    variants: [{ id: "43000000-0000-4000-8000-000000000003", name: "Standard", priceDelta: 0, stockQty: 1 }],
    rentalBedrooms: 4, rentalBathrooms: 4, rentalLocation: "Ikoyi, Lagos", rentalSizeLabel: "380 sqm", rentalPropertyType: "Bungalow", rentalStatus: "available", isDemo: true,
  },
  {
    id: "23000000-0000-4000-8000-000000000004", slug: "2-bedroom-flat-ajah", categorySlug: "housing-decor", subcategorySlug: "houses-for-rent", name: "2-Bedroom Flat – Ajah", description: "A well-finished 2-bedroom flat in a gated estate in Ajah, with 2 bathrooms, a fitted kitchen, tiled floors throughout, and dedicated parking. Close to shops, schools and the express road, with 24-hour estate security.", price: 410.00, image: "/catalog/products/rental-apartment.webp", rating: 4.6, reviewCount: 15, stockQty: 1, isFeatured: false,
    variants: [{ id: "43000000-0000-4000-8000-000000000004", name: "Standard", priceDelta: 0, stockQty: 1 }],
    rentalBedrooms: 2, rentalBathrooms: 2, rentalLocation: "Ajah, Lagos", rentalSizeLabel: "95 sqm", rentalPropertyType: "Flat", rentalStatus: "available", isDemo: true,
  },
  {
    id: "23000000-0000-4000-8000-000000000005", slug: "5-bedroom-mansion-banana-island", categorySlug: "housing-decor", subcategorySlug: "houses-for-rent", name: "5-Bedroom Luxury Mansion – Banana Island", description: "An expansive 5-bedroom luxury mansion on Banana Island, with 6 bathrooms, a private swimming pool, a home cinema room, staff quarters, and gated parking for six cars. Finished to a premium standard with imported fittings throughout.", price: 3200.00, image: "/catalog/products/rental-mansion.webp", rating: 5, reviewCount: 5, stockQty: 1, isFeatured: true,
    variants: [{ id: "43000000-0000-4000-8000-000000000005", name: "Standard", priceDelta: 0, stockQty: 1 }],
    rentalBedrooms: 5, rentalBathrooms: 6, rentalLocation: "Banana Island, Lagos", rentalSizeLabel: "620 sqm", rentalPropertyType: "Mansion", rentalStatus: "available", isDemo: true,
  },
  {
    id: "23000000-0000-4000-8000-000000000006", slug: "1-bedroom-mini-flat-surulere", categorySlug: "housing-decor", subcategorySlug: "houses-for-rent", name: "1-Bedroom Mini Flat – Surulere", description: "A tidy 1-bedroom mini flat in Surulere with a private bathroom, kitchen, and constant water supply. A short walk from the bus stop and local market, ideal for a small family or young professional starting out. Rent is fixed and paid in full at checkout, with no hidden charges.", price: 300.00, image: "/catalog/products/rental-studio.webp", rating: 4.4, reviewCount: 11, stockQty: 1, isFeatured: false,
    variants: [{ id: "43000000-0000-4000-8000-000000000006", name: "Standard", priceDelta: 0, stockQty: 1 }],
    rentalBedrooms: 1, rentalBathrooms: 1, rentalLocation: "Surulere, Lagos", rentalSizeLabel: "42 sqm", rentalPropertyType: "Mini Flat", rentalStatus: "available", isDemo: true,
  },
];

export const featuredProducts: ProductSeed[] = [...baseProducts, ...collectionExpansionProducts, ...housingRentalProducts].map((product) => ({
  ...product,
  subcategorySlug: product.subcategorySlug ?? productSubcategoryAssignments[product.slug],
}));

export const services: ServiceSeed[] = [
  { slug: "food-catering", title: "Food & Catering", description: "Prepared meals and catering support for meetings, celebrations, events, and group orders.", icon: "package" },
  { slug: "property-home-services", title: "Property & Home Services", description: "House-rental support, painting, finishing, interior decoration, and home-improvement enquiries.", icon: "styling" },
  { slug: "media-production", title: "Media Production", description: "Photography, videography, and content production for people, products, brands, and events.", icon: "camera" },
  { slug: "gadget-equipment-rentals", title: "Gadget & Equipment Rentals", description: "Camera, lighting, audio, and creator-equipment rental requests for productions and events.", icon: "content" },
];

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProductBySlug(slug: string) {
  return featuredProducts.find((product) => product.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return slug === "all"
    ? featuredProducts
    : featuredProducts.filter((product) => product.categorySlug === slug);
}

export function getProductsByCollection(categorySlug: string, subcategorySlug: string) {
  return featuredProducts.filter((product) => product.categorySlug === categorySlug && product.subcategorySlug === subcategorySlug);
}

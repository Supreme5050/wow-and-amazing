import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export type ServiceRecord = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl: string | null;
  priceFrom: number | null;
  turnaround: string | null;
  deliverables: string[];
  sortOrder: number;
};

const fallbackServices: ServiceRecord[] = [
  {
    id: "service-food-catering",
    slug: "food-catering",
    title: "Food & Catering",
    shortDescription: "Prepared meals and catering support for meetings, celebrations, events, and group orders.",
    description: "A coordinated food service for customers who need prepared meals, event catering, office food, family orders, or packaging support. Every request is reviewed by the owner before the menu, quantity, delivery arrangement, price, and date are confirmed.",
    imageUrl: null,
    priceFrom: null,
    turnaround: "Schedule confirmed after consultation",
    deliverables: ["Menu and quantity planning", "Catering or group-order quotation", "Collection or delivery arrangement"],
    sortOrder: 1,
  },
  {
    id: "service-property-home-services",
    slug: "property-home-services",
    title: "Property & Home Services",
    shortDescription: "House-rental support, painting, finishing, decoration, and home-improvement enquiries.",
    description: "A single property and home-services point for rental enquiries, property viewings, painting, finishing, and interior decoration. The owner reviews the property or space, confirms the required work, and provides the appropriate next steps and quotation.",
    imageUrl: null,
    priceFrom: null,
    turnaround: "Inspection or consultation arranged first",
    deliverables: ["Property or space consultation", "Painting and decoration scope", "Quotation and service schedule"],
    sortOrder: 2,
  },
  {
    id: "service-media-production",
    slug: "media-production",
    title: "Media Production",
    shortDescription: "Photography, videography, and content production for brands, people, products, and events.",
    description: "Professional media production planned around the purpose, audience, location, and final platform. Projects can include photography, videography, interviews, event coverage, product visuals, and edited content assets.",
    imageUrl: null,
    priceFrom: null,
    turnaround: "Timeline confirmed after consultation",
    deliverables: ["Creative and production consultation", "Photography or video production", "Professionally edited final assets"],
    sortOrder: 3,
  },
  {
    id: "service-gadget-equipment-rentals",
    slug: "gadget-equipment-rentals",
    title: "Gadget & Equipment Rentals",
    shortDescription: "Camera, lighting, audio, and creator equipment requested for productions and events.",
    description: "A managed rental-enquiry service for cameras, stabilisers, lighting, microphones, tripods, and other creator or production equipment. Availability, rental period, security terms, pickup or delivery, and final pricing are confirmed before booking.",
    imageUrl: null,
    priceFrom: null,
    turnaround: "Availability confirmed before booking",
    deliverables: ["Equipment availability check", "Rental period and terms", "Pickup or delivery arrangement"],
    sortOrder: 4,
  },
];
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR-PROJECT") || key.includes("YOUR_")) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export const getActiveServices = cache(async (): Promise<ServiceRecord[]> => {
  const supabase = client();
  if (!supabase) return fallbackServices;

  const { data, error } = await supabase
    .from("services")
    .select("id, slug, title, short_description, description, image_url, price_from, turnaround, deliverables, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data?.length) return fallbackServices;

  return data.map((service) => ({
    id: String(service.id),
    slug: String(service.slug),
    title: String(service.title),
    shortDescription: String(service.short_description || service.description || ""),
    description: String(service.description || ""),
    imageUrl: service.image_url ? String(service.image_url) : null,
    priceFrom: service.price_from === null ? null : Number(service.price_from),
    turnaround: service.turnaround ? String(service.turnaround) : null,
    deliverables: Array.isArray(service.deliverables) ? service.deliverables.map(String) : [],
    sortOrder: Number(service.sort_order || 0),
  }));
});

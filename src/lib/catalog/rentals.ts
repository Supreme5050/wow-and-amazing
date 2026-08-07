import type { ProductSeed } from "@/data/catalog";

export type RentalAvailability = "available" | "reserved" | "rented";

export function isRentalProduct(product: Pick<ProductSeed, "subcategorySlug">) {
  return product.subcategorySlug === "houses-for-rent";
}

export function getRentalAvailability(product: Pick<ProductSeed, "subcategorySlug" | "stockQty" | "rentalStatus">): RentalAvailability | null {
  if (!isRentalProduct(product)) return null;
  if (product.stockQty < 1 || product.rentalStatus === "rented") return "rented";
  if (product.rentalStatus === "reserved") return "reserved";
  return "available";
}

export function rentalAvailabilityLabel(status: RentalAvailability) {
  if (status === "reserved") return "Reserved";
  if (status === "rented") return "Rented";
  return "Available";
}

export function canRentProduct(product: Pick<ProductSeed, "subcategorySlug" | "stockQty" | "rentalStatus">) {
  return getRentalAvailability(product) === "available";
}

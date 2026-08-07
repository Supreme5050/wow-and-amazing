import { NextRequest, NextResponse } from "next/server";
import { searchCatalogProducts } from "@/lib/catalog/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 8);
  const limit = Math.max(1, Math.min(Number.isFinite(requestedLimit) ? requestedLimit : 8, 24));

  if (!query) return NextResponse.json({ query: "", products: [] });

  const products = await searchCatalogProducts(query, limit);
  return NextResponse.json({ query, products });
}

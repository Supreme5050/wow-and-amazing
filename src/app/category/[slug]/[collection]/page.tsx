import { redirect } from "next/navigation";

export default async function LegacyCollectionPage({ params }: { params: Promise<{ slug: string; collection: string }> }) {
  const { slug, collection } = await params;
  redirect(`/category/${slug}?collection=${collection}#products`);
}

import type { Metadata } from "next";
import { ProductEditor } from "@/components/admin/ProductEditor";

export const metadata: Metadata = { title: "Add Product" };
export default function NewProductPage() { return <ProductEditor />; }

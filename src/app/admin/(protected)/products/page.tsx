import type { Metadata } from "next";
import { AdminProducts } from "@/components/admin/AdminProducts";

export const metadata: Metadata = { title: "Manage Products" };
export default function AdminProductsPage() { return <AdminProducts />; }

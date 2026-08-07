import type { Metadata } from "next";
import { AdminServices } from "@/components/admin/AdminServices";

export const metadata: Metadata = { title: "Manage Services" };
export default function AdminServicesPage() { return <AdminServices />; }

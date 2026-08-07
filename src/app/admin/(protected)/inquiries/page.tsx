import type { Metadata } from "next";
import { AdminInquiries } from "@/components/admin/AdminInquiries";

export const metadata: Metadata = { title: "Enquiries & Messages" };
export default function AdminInquiriesPage() { return <AdminInquiries />; }

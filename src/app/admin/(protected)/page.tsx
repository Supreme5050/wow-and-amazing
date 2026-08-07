import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "Owner Dashboard" };
export default function AdminDashboardPage() { return <AdminDashboard />; }

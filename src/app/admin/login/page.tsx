import type { Metadata } from "next";
import { AdminLogin } from "@/components/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Owner Sign In",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLoginPage() { return <AdminLogin />; }

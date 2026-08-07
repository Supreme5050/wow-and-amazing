import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: { default: "Owner Dashboard", template: "%s | Wow & Amazing Admin" },
  robots: { index: false, follow: false, nocache: true },
};

export default function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard><AdminShell>{children}</AdminShell></AdminGuard>;
}

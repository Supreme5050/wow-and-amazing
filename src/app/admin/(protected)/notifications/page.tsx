import type { Metadata } from "next";
import { AdminNotifications } from "@/components/admin/AdminNotifications";

export const metadata: Metadata = {
  title: "Notifications | Wow & Amazing Admin",
  robots: { index: false, follow: false },
};

export default function AdminNotificationsPage() {
  return <AdminNotifications />;
}

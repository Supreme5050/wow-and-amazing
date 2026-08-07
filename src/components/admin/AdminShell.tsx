"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BagIcon,
  BellIcon,
  BoxIcon,
  CameraIcon,
  ChatIcon,
  CloseIcon,
  CreditCardIcon,
  HomeIcon,
  MailIcon,
  MenuIcon,
  PlusIcon,
  StarIcon,
  UserIcon,
} from "@/components/icons/LineIcons";
import { ownerFetch } from "@/lib/admin/client";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type OwnerSession = {
  user: {
    id: string;
    email: string | null;
    fullName: string;
    role: string | null;
  };
};

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: typeof HomeIcon;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "OVERVIEW",
    items: [
      { href: "/admin", label: "Dashboard", description: "Business snapshot", icon: HomeIcon },
      { href: "/admin/notifications", label: "Notifications", description: "Orders and customer alerts", icon: BellIcon },
    ],
  },
  {
    label: "COMMERCE",
    items: [
      { href: "/admin/products", label: "Products", description: "Catalog and rentals", icon: BagIcon },
      { href: "/admin/orders", label: "Orders", description: "Fulfilment and tracking", icon: BoxIcon },
      { href: "/admin/payments", label: "Payments", description: "Paystack reconciliation", icon: CreditCardIcon },
    ],
  },
  {
    label: "CUSTOMER CARE",
    items: [
      { href: "/admin/inquiries", label: "Enquiries", description: "Messages and requests", icon: ChatIcon },
      { href: "/admin/reviews", label: "Reviews", description: "Moderation and replies", icon: StarIcon },
    ],
  },
  {
    label: "GROWTH",
    items: [
      { href: "/admin/services", label: "Services", description: "Offers and pricing", icon: CameraIcon },
      { href: "/admin/subscribers", label: "Subscribers", description: "Newsletter audience", icon: MailIcon },
    ],
  },
];

const pageLabels: Record<string, { eyebrow: string; title: string }> = {
  "/admin": { eyebrow: "OWNER WORKSPACE", title: "Dashboard" },
  "/admin/notifications": { eyebrow: "OWNER ALERTS", title: "Notifications" },
  "/admin/products": { eyebrow: "CATALOG", title: "Products" },
  "/admin/products/new": { eyebrow: "CATALOG", title: "Add Product" },
  "/admin/orders": { eyebrow: "COMMERCE", title: "Orders" },
  "/admin/payments": { eyebrow: "COMMERCE", title: "Payments" },
  "/admin/inquiries": { eyebrow: "CUSTOMER CARE", title: "Enquiries" },
  "/admin/reviews": { eyebrow: "CUSTOMER CARE", title: "Reviews" },
  "/admin/services": { eyebrow: "GROWTH", title: "Services" },
  "/admin/subscribers": { eyebrow: "GROWTH", title: "Subscribers" },
};

type NotificationPreview = {
  id: string;
  event_type: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

type NotificationPreviewResponse = {
  notifications: NotificationPreview[];
  unreadCount: number;
};

const notificationTime = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "WA";
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [owner, setOwner] = useState<OwnerSession["user"] | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState<NotificationPreviewResponse>({ notifications: [], unreadCount: 0 });

  useEffect(() => {
    ownerFetch<OwnerSession>("/api/admin/session")
      .then((payload) => setOwner(payload.user))
      .catch(() => setOwner(null));
  }, []);

  const loadNotificationPreview = useCallback(() => {
    ownerFetch<NotificationPreviewResponse>("/api/admin/notifications?limit=6")
      .then((payload) => setNotificationPayload(payload))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    loadNotificationPreview();
    const interval = window.setInterval(loadNotificationPreview, 30000);
    return () => window.clearInterval(interval);
  }, [loadNotificationPreview]);

  async function markNotificationRead(id: string) {
    try {
      await ownerFetch("/api/admin/notifications", { method: "PATCH", body: JSON.stringify({ id }) });
      loadNotificationPreview();
    } catch {
      // The full notification centre remains available if this quick action fails.
    }
  }

  const currentPage = useMemo(() => {
    if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) return { eyebrow: "CATALOG", title: "Edit Product" };
    return pageLabels[pathname] ?? { eyebrow: "OWNER WORKSPACE", title: "Administration" };
  }, [pathname]);

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-app">
      <button
        className={open ? "admin-sidebar-backdrop visible" : "admin-sidebar-backdrop"}
        type="button"
        aria-label="Close owner menu"
        onClick={() => setOpen(false)}
      />

      <aside className={open ? "admin-sidebar open" : "admin-sidebar"}>
        <div className="admin-sidebar-brand">
          <Link href="/admin" aria-label="Wow & Amazing owner dashboard">
            <Image src="/brand/logo-reversed.png" alt="Wow & Amazing" width={420} height={160} priority />
          </Link>
          <button className="admin-mobile-close" type="button" aria-label="Close menu" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="admin-sidebar-intro">
          <span className="admin-live-dot" aria-hidden="true" />
          <div>
            <strong>Owner Control Centre</strong>
            <small>Store operations are live</small>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Owner navigation">
          {navGroups.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <p className="admin-sidebar-label">{group.label}</p>
              {group.items.map((item) => {
                const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link className={active ? "active" : ""} href={item.href} key={item.href} onClick={() => setOpen(false)}>
                    <span className="admin-nav-icon"><Icon size={19} /></span>
                    <span className="admin-nav-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                    <ArrowRightIcon className="admin-nav-arrow" size={15} />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-owner-card">
            <span className="admin-owner-avatar">{initials(owner?.fullName ?? "Store Owner")}</span>
            <span><strong>{owner?.fullName ?? "Store Owner"}</strong><small>{owner?.email ?? "Authorised owner"}</small></span>
          </div>
          <div className="admin-sidebar-actions">
            <Link href="/" target="_blank"><ArrowRightIcon size={16} /> Open Store</Link>
            <button type="button" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </aside>

      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button className="admin-menu-button" type="button" aria-label="Open owner menu" onClick={() => setOpen(true)}><MenuIcon /></button>
            <div className="admin-topbar-title">
              <span>{currentPage.eyebrow}</span>
              <strong>{currentPage.title}</strong>
            </div>
          </div>
          <div className="admin-topbar-actions">
            <Link className="admin-topbar-add" href="/admin/products/new"><PlusIcon size={17} /> Add Product</Link>
            <Link className="admin-view-store" href="/" target="_blank">View Store <ArrowRightIcon size={16} /></Link>
            <div className="admin-notification-menu">
              <button
                className={notificationOpen ? "admin-notification-bell active" : "admin-notification-bell"}
                type="button"
                aria-label={`Notifications${notificationPayload.unreadCount ? `, ${notificationPayload.unreadCount} unread` : ""}`}
                aria-expanded={notificationOpen}
                onClick={() => setNotificationOpen((value) => !value)}
              >
                <BellIcon size={19} />
                {notificationPayload.unreadCount > 0 ? <span>{notificationPayload.unreadCount > 99 ? "99+" : notificationPayload.unreadCount}</span> : null}
              </button>
              {notificationOpen ? (
                <div className="admin-notification-popover">
                  <div className="admin-notification-popover-head">
                    <div><span>OWNER ALERTS</span><strong>Notifications</strong></div>
                    <Link href="/admin/notifications" onClick={() => setNotificationOpen(false)}>View all</Link>
                  </div>
                  <div className="admin-notification-popover-list">
                    {notificationPayload.notifications.length ? notificationPayload.notifications.map((notification) => (
                      <Link
                        className={!notification.read_at ? "unread" : ""}
                        href={notification.href || "/admin/notifications"}
                        key={notification.id}
                        onClick={() => {
                          setNotificationOpen(false);
                          if (!notification.read_at) void markNotificationRead(notification.id);
                        }}
                      >
                        <span className="admin-notification-popover-icon"><BellIcon size={17} /></span>
                        <span><strong>{notification.title}</strong><small>{notification.body}</small><time>{notificationTime.format(new Date(notification.created_at))}</time></span>
                      </Link>
                    )) : <div className="admin-notification-popover-empty"><BellIcon size={24} /><strong>No new alerts</strong><span>Paid orders and enquiries will appear here.</span></div>}
                  </div>
                  <Link className="admin-notification-popover-footer" href="/admin/notifications" onClick={() => setNotificationOpen(false)}>Open notification centre <ArrowRightIcon size={15} /></Link>
                </div>
              ) : null}
            </div>
            <span className="admin-topbar-avatar" title={owner?.fullName ?? "Store Owner"}><UserIcon size={18} /></span>
          </div>
        </header>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

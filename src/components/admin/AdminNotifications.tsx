"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  CreditCardIcon,
  MailIcon,
} from "@/components/icons/LineIcons";
import { ownerFetch } from "@/lib/admin/client";

type Delivery = {
  channel: "email" | "whatsapp";
  provider: string;
  recipient: string;
  status: string;
  provider_message_id: string | null;
  attempts: number;
  last_error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
};

type Notification = {
  id: string;
  event_type: string;
  title: string;
  body: string;
  href: string | null;
  is_test_data: boolean;
  read_at: string | null;
  created_at: string;
  deliveries: Delivery[];
};

type Setup = {
  email: { configured: boolean; recipient: string; provider: string };
  whatsapp: { configured: boolean; recipient: string; provider: string; templateMode: boolean };
  testDataNotifications: boolean;
};

type NotificationResponse = {
  notifications: Notification[];
  unreadCount: number;
  setup: Setup;
};

const dateTime = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });

function titleCase(value: string) {
  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function deliveryLabel(delivery: Delivery) {
  if (delivery.status === "read") return "Read";
  if (delivery.status === "delivered") return "Delivered";
  if (delivery.status === "sent" || delivery.status === "queued") return "Sent";
  if (delivery.status === "failed") return "Failed";
  return "Not sent";
}

export function AdminNotifications() {
  const [payload, setPayload] = useState<NotificationResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "orders" | "enquiries">("all");

  async function load() {
    try {
      const response = await ownerFetch<NotificationResponse>("/api/admin/notifications?limit=80");
      setPayload(response);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load notifications.");
    }
  }

  useEffect(() => {
    let cancelled = false;

    ownerFetch<NotificationResponse>("/api/admin/notifications?limit=80")
      .then((response) => {
        if (cancelled) return;
        setPayload(response);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load notifications.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    const notifications = payload?.notifications ?? [];
    if (filter === "unread") return notifications.filter((item) => !item.read_at && !item.is_test_data);
    if (filter === "orders") return notifications.filter((item) => item.event_type === "order_paid" || item.event_type === "rental_paid");
    if (filter === "enquiries") return notifications.filter((item) => item.event_type === "service_inquiry" || item.event_type === "contact_message");
    return notifications;
  }, [filter, payload]);

  async function markRead(id: string) {
    setBusy(`read:${id}`);
    try {
      await ownerFetch("/api/admin/notifications", { method: "PATCH", body: JSON.stringify({ id }) });
      await load();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "Unable to update the notification.");
    } finally {
      setBusy("");
    }
  }

  async function markAllRead() {
    setBusy("all-read");
    try {
      await ownerFetch("/api/admin/notifications", { method: "PATCH", body: JSON.stringify({ markAll: true }) });
      await load();
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : "Unable to mark notifications as read.");
    } finally {
      setBusy("");
    }
  }

  async function sendTest(channel: "email" | "whatsapp" | "all") {
    setBusy(`test:${channel}`);
    try {
      const result = await ownerFetch<{ results: Array<{ channel: string; status: string; error?: string }> }>(
        "/api/admin/notifications/test",
        { method: "POST", body: JSON.stringify({ channel }) },
      );
      const failed = result.results.filter((item) => item.status !== "sent");
      setError(failed.length ? failed.map((item) => `${titleCase(item.channel)}: ${item.error || item.status}`).join(" · ") : "");
      await load();
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Unable to send the test notification.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="admin-page admin-notifications-page">
      <section className="admin-page-hero admin-notification-hero">
        <div>
          <p className="wa-eyebrow">OWNER ALERTS</p>
          <h1>Never miss an order or customer request.</h1>
          <p>Paid orders, rental payments, service enquiries and contact messages are recorded here and can be delivered to your business email and WhatsApp.</p>
        </div>
        <div className="admin-notification-hero-count">
          <BellIcon size={24} />
          <span>Unread</span>
          <strong>{payload?.unreadCount ?? 0}</strong>
        </div>
      </section>

      {error ? <div className="admin-alert error">{error}</div> : null}

      <section className="admin-notification-setup-grid" aria-label="Notification channel setup">
        <article className={payload?.setup.email.configured ? "configured" : "not-configured"}>
          <span className="admin-notification-channel-icon"><MailIcon size={22} /></span>
          <div>
            <p>Email alerts</p>
            <strong>{payload?.setup.email.configured ? "Connected" : "Needs configuration"}</strong>
            <small>{payload?.setup.email.provider ?? "Brevo"} · {payload?.setup.email.recipient ?? "Not configured"}</small>
          </div>
          <button disabled={!payload?.setup.email.configured || busy.startsWith("test:")} type="button" onClick={() => sendTest("email")}>{busy === "test:email" ? "Sending…" : "Send test"}</button>
        </article>

        <article className={payload?.setup.whatsapp.configured ? "configured" : "not-configured"}>
          <span className="admin-notification-channel-icon"><BellIcon size={22} /></span>
          <div>
            <p>WhatsApp alerts</p>
            <strong>{payload?.setup.whatsapp.configured ? "Connected" : "Needs configuration"}</strong>
            <small>{payload?.setup.whatsapp.provider ?? "Twilio WhatsApp"} · {payload?.setup.whatsapp.recipient ?? "Not configured"}</small>
          </div>
          <button disabled={!payload?.setup.whatsapp.configured || busy.startsWith("test:")} type="button" onClick={() => sendTest("whatsapp")}>{busy === "test:whatsapp" ? "Sending…" : "Send test"}</button>
        </article>

        <article className="notification-policy-card">
          <span className="admin-notification-channel-icon"><CreditCardIcon size={22} /></span>
          <div>
            <p>Payment safety</p>
            <strong>Verified payments only</strong>
            <small>Automatic order alerts are created only after Paystack confirmation and duplicate protection.</small>
          </div>
          <button disabled={(!payload?.setup.email.configured && !payload?.setup.whatsapp.configured) || busy.startsWith("test:")} type="button" onClick={() => sendTest("all")}>{busy === "test:all" ? "Sending…" : "Test all"}</button>
        </article>
      </section>

      <section className="admin-panel admin-notification-history">
        <div className="admin-panel-heading admin-notification-toolbar">
          <div>
            <p className="wa-eyebrow">NOTIFICATION HISTORY</p>
            <h2>Business activity</h2>
            <span>Every alert is preserved even when an external channel is unavailable.</span>
          </div>
          <div className="admin-notification-toolbar-actions">
            <div className="admin-notification-filters" role="tablist" aria-label="Notification filters">
              {(["all", "unread", "orders", "enquiries"] as const).map((item) => (
                <button className={filter === item ? "active" : ""} type="button" role="tab" aria-selected={filter === item} key={item} onClick={() => setFilter(item)}>{titleCase(item)}</button>
              ))}
            </div>
            <button type="button" onClick={markAllRead} disabled={!payload?.unreadCount || busy === "all-read"}><CheckIcon size={16} /> {busy === "all-read" ? "Updating…" : "Mark all read"}</button>
          </div>
        </div>

        {!payload ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading notification history…</p></div> : visible.length ? (
          <div className="admin-notification-list">
            {visible.map((notification) => (
              <article className={!notification.read_at && !notification.is_test_data ? "unread" : ""} key={notification.id}>
                <span className="admin-notification-list-icon"><BellIcon size={20} /></span>
                <div className="admin-notification-list-content">
                  <div className="admin-notification-list-title">
                    <span>{titleCase(notification.event_type)}</span>
                    {notification.is_test_data ? <em>TEST</em> : null}
                    {!notification.read_at && !notification.is_test_data ? <i>NEW</i> : null}
                  </div>
                  <h3>{notification.title}</h3>
                  <p>{notification.body}</p>
                  <div className="admin-notification-deliveries">
                    {notification.deliveries.length ? notification.deliveries.map((delivery) => (
                      <span className={delivery.status} key={`${notification.id}:${delivery.channel}`} title={delivery.last_error || undefined}>
                        {titleCase(delivery.channel)} · {deliveryLabel(delivery)}
                      </span>
                    )) : <span className="pending">Dashboard only</span>}
                  </div>
                </div>
                <div className="admin-notification-list-actions">
                  <time>{dateTime.format(new Date(notification.created_at))}</time>
                  {notification.href ? <Link href={notification.href}>Open <ArrowRightIcon size={15} /></Link> : null}
                  {!notification.read_at ? <button type="button" disabled={busy === `read:${notification.id}`} onClick={() => markRead(notification.id)}>{busy === `read:${notification.id}` ? "Saving…" : "Mark read"}</button> : null}
                </div>
              </article>
            ))}
          </div>
        ) : <div className="admin-empty"><h3>No notifications in this view.</h3><p>New paid orders and customer requests will appear here automatically.</p></div>}
      </section>
    </div>
  );
}

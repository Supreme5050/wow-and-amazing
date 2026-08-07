import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type BusinessNotificationType =
  | "order_paid"
  | "rental_paid"
  | "service_inquiry"
  | "contact_message"
  | "payment_review"
  | "low_stock"
  | "test";

type NotificationPayload = {
  eventKey: string;
  eventType: BusinessNotificationType;
  title: string;
  body: string;
  href?: string | null;
  orderId?: string | null;
  serviceInquiryId?: string | null;
  contactMessageId?: string | null;
  isTestData?: boolean;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
  whatsappText: string;
  whatsappVariables?: Record<string, string>;
  forceTestDelivery?: boolean;
  onlyChannels?: Array<"email" | "whatsapp">;
};

type DeliveryResult = {
  channel: "email" | "whatsapp";
  status: "sent" | "failed" | "skipped";
  providerMessageId?: string;
  error?: string;
};

type NotificationConfig = {
  siteUrl: string;
  vendorEmail: string;
  email: {
    configured: boolean;
    apiKey: string;
    senderEmail: string;
    senderName: string;
  };
  whatsapp: {
    configured: boolean;
    accountSid: string;
    authToken: string;
    from: string;
    to: string;
    contentSid: string;
    messagingServiceSid: string;
  };
};

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  total: number | string;
  currency: string | null;
  address: Record<string, unknown> | null;
  status: string;
  is_test_data: boolean;
  created_at: string;
};

type ProductRentalRow = { id: string; name: string; subcategory_slug: string | null; stock_qty: number; is_active: boolean };

type OrderItemRow = {
  product_id: string | null;
  product_name: string;
  variant_name: string | null;
  unit_price: number | string;
  qty: number;
};

function cleanUrl(value: string | undefined) {
  return String(value || "http://localhost:3004").trim().replace(/\/$/, "");
}

function normalizeWhatsAppNumber(value: string) {
  const normalized = value.trim().replace(/^whatsapp:/i, "");
  return normalized ? `whatsapp:${normalized.startsWith("+") ? normalized : `+${normalized}`}` : "";
}

export function getNotificationConfig(): NotificationConfig {
  const vendorEmail = String(process.env.VENDOR_NOTIFICATION_EMAIL || process.env.ADMIN_OWNER_EMAIL || "").trim();
  const brevoApiKey = String(process.env.BREVO_API_KEY || "").trim();
  const senderEmail = String(process.env.BREVO_SENDER_EMAIL || process.env.BUSINESS_EMAIL_FROM || "").trim();
  const senderName = String(process.env.BREVO_SENDER_NAME || "Wow & Amazing").trim();

  const accountSid = String(process.env.TWILIO_ACCOUNT_SID || "").trim();
  const authToken = String(process.env.TWILIO_AUTH_TOKEN || "").trim();
  const from = normalizeWhatsAppNumber(String(process.env.TWILIO_WHATSAPP_FROM || ""));
  const to = normalizeWhatsAppNumber(String(process.env.VENDOR_WHATSAPP_TO || ""));
  const contentSid = String(process.env.TWILIO_WHATSAPP_CONTENT_SID || "").trim();
  const messagingServiceSid = String(process.env.TWILIO_MESSAGING_SERVICE_SID || "").trim();

  return {
    siteUrl: cleanUrl(process.env.NEXT_PUBLIC_SITE_URL),
    vendorEmail,
    email: {
      configured: Boolean(vendorEmail && brevoApiKey && senderEmail),
      apiKey: brevoApiKey,
      senderEmail,
      senderName,
    },
    whatsapp: {
      configured: Boolean(accountSid && authToken && to && ((from && !contentSid) || (contentSid && messagingServiceSid))),
      accountSid,
      authToken,
      from,
      to,
      contentSid,
      messagingServiceSid,
    },
  };
}

export function getPublicNotificationSetup() {
  const config = getNotificationConfig();
  return {
    email: {
      configured: config.email.configured,
      recipient: config.vendorEmail ? maskEmail(config.vendorEmail) : "Not configured",
      provider: "Brevo",
    },
    whatsapp: {
      configured: config.whatsapp.configured,
      recipient: config.whatsapp.to ? maskPhone(config.whatsapp.to.replace(/^whatsapp:/, "")) : "Not configured",
      provider: "Twilio WhatsApp",
      templateMode: Boolean(config.whatsapp.contentSid),
    },
    testDataNotifications: String(process.env.NOTIFY_TEST_DATA || "").trim().toLowerCase() === "true",
  };
}

function maskEmail(value: string) {
  const [local, domain] = value.split("@");
  if (!domain) return value;
  const safeLocal = local.length <= 2 ? `${local[0] || "*"}*` : `${local.slice(0, 2)}***`;
  return `${safeLocal}@${domain}`;
}

function maskPhone(value: string) {
  const digits = value.replace(/\s+/g, "");
  if (digits.length <= 5) return "***";
  return `${digits.slice(0, 4)}***${digits.slice(-3)}`;
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency || "NGN",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency || "NGN"} ${value.toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  }
}

function valueFromAddress(address: Record<string, unknown> | null, ...keys: string[]) {
  for (const key of keys) {
    const value = address?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

async function upsertBusinessNotification(admin: SupabaseClient, payload: NotificationPayload) {
  const record = {
    event_key: payload.eventKey,
    event_type: payload.eventType,
    title: payload.title,
    body: payload.body,
    href: payload.href || null,
    order_id: payload.orderId || null,
    service_inquiry_id: payload.serviceInquiryId || null,
    contact_message_id: payload.contactMessageId || null,
    is_test_data: Boolean(payload.isTestData),
  };

  const { data, error } = await admin
    .from("business_notifications")
    .upsert(record, { onConflict: "event_key" })
    .select("id, is_test_data")
    .single();

  if (error || !data) throw new Error(error?.message || "Unable to queue the owner notification.");
  return data as { id: string; is_test_data: boolean };
}

async function getOrCreateDelivery(
  admin: SupabaseClient,
  notificationId: string,
  channel: "email" | "whatsapp",
  provider: string,
  recipient: string,
) {
  const { data: existing } = await admin
    .from("notification_deliveries")
    .select("id, status, attempts")
    .eq("notification_id", notificationId)
    .eq("channel", channel)
    .eq("recipient", recipient)
    .maybeSingle();

  if (existing) return existing as { id: string; status: string; attempts: number };

  const { data, error } = await admin
    .from("notification_deliveries")
    .insert({ notification_id: notificationId, channel, provider, recipient, status: "pending" })
    .select("id, status, attempts")
    .single();

  if (error || !data) {
    const { data: raced, error: racedError } = await admin
      .from("notification_deliveries")
      .select("id, status, attempts")
      .eq("notification_id", notificationId)
      .eq("channel", channel)
      .eq("recipient", recipient)
      .maybeSingle();
    if (racedError || !raced) throw new Error(error?.message || racedError?.message || "Unable to prepare notification delivery.");
    return raced as { id: string; status: string; attempts: number };
  }

  return data as { id: string; status: string; attempts: number };
}

async function updateDelivery(
  admin: SupabaseClient,
  id: string,
  update: Record<string, unknown>,
) {
  await admin.from("notification_deliveries").update(update).eq("id", id);
}
async function claimDelivery(
  admin: SupabaseClient,
  notificationId: string,
  channel: "email" | "whatsapp",
  provider: string,
  recipient: string,
) {
  const { data, error } = await admin.rpc("claim_notification_delivery", {
    p_notification_id: notificationId,
    p_channel: channel,
    p_provider: provider,
    p_recipient: recipient,
  });
  if (error) throw new Error(error.message);
  const result = (data as Array<{
    result_delivery_id: string;
    result_should_send: boolean;
    result_status: string;
    result_attempts: number;
  }> | null)?.[0];
  if (!result) throw new Error("Unable to claim notification delivery.");
  return result;
}


async function sendBrevoEmail(payload: NotificationPayload, config: NotificationConfig) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": config.email.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: config.email.senderName, email: config.email.senderEmail },
        to: [{ email: config.vendorEmail }],
        subject: payload.emailSubject,
        htmlContent: payload.emailHtml,
        textContent: payload.emailText,
        tags: ["vendor-notification", payload.eventType],
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const result = await response.json().catch(() => ({})) as { messageId?: string; message?: string; code?: string };
    if (!response.ok) throw new Error(result.message || result.code || `Brevo returned ${response.status}.`);
    return { providerMessageId: result.messageId || "" };
  } finally {
    clearTimeout(timeout);
  }
}

async function sendTwilioWhatsApp(payload: NotificationPayload, config: NotificationConfig) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(config.whatsapp.accountSid)}/Messages.json`;
  const form = new URLSearchParams();
  form.set("To", config.whatsapp.to);

  if (config.whatsapp.contentSid) {
    form.set("MessagingServiceSid", config.whatsapp.messagingServiceSid);
    form.set("ContentSid", config.whatsapp.contentSid);
    form.set("ContentVariables", JSON.stringify(payload.whatsappVariables || {}));
  } else {
    form.set("From", config.whatsapp.from);
    form.set("Body", payload.whatsappText);
  }

  if (config.siteUrl.startsWith("https://")) {
    form.set("StatusCallback", `${config.siteUrl}/api/notifications/twilio/status`);
  }

  const auth = Buffer.from(`${config.whatsapp.accountSid}:${config.whatsapp.authToken}`).toString("base64");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
      signal: controller.signal,
      cache: "no-store",
    });
    const result = await response.json().catch(() => ({})) as { sid?: string; message?: string; code?: number };
    if (!response.ok || !result.sid) throw new Error(result.message || `Twilio returned ${response.status}.`);
    return { providerMessageId: result.sid };
  } finally {
    clearTimeout(timeout);
  }
}

async function deliverChannel(
  admin: SupabaseClient,
  notificationId: string,
  payload: NotificationPayload,
  channel: "email" | "whatsapp",
  config: NotificationConfig,
): Promise<DeliveryResult> {
  const configured = channel === "email" ? config.email.configured : config.whatsapp.configured;
  const recipient = channel === "email" ? config.vendorEmail : config.whatsapp.to;
  const provider = channel === "email" ? "brevo" : "twilio";

  if (!configured) {
    const delivery = await getOrCreateDelivery(admin, notificationId, channel, provider, recipient || "not-configured");
    await updateDelivery(admin, delivery.id, {
      status: "skipped",
      attempts: delivery.attempts + 1,
      last_error: `${channel === "email" ? "Brevo email" : "Twilio WhatsApp"} is not configured.`,
    });
    return { channel, status: "skipped", error: "Channel is not configured." };
  }

  const claim = await claimDelivery(admin, notificationId, channel, provider, recipient);
  if (!claim.result_should_send) {
    return { channel, status: ["failed", "skipped"].includes(claim.result_status) ? "skipped" : "sent" };
  }

  try {
    const result = channel === "email"
      ? await sendBrevoEmail(payload, config)
      : await sendTwilioWhatsApp(payload, config);

    await updateDelivery(admin, claim.result_delivery_id, {
      status: channel === "email" ? "sent" : "queued",
      provider_message_id: result.providerMessageId || null,
      sent_at: new Date().toISOString(),
      last_error: null,
    });
    return { channel, status: "sent", providerMessageId: result.providerMessageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Notification delivery failed.";
    await updateDelivery(admin, claim.result_delivery_id, {
      status: "failed",
      last_error: message.slice(0, 1000),
    });
    return { channel, status: "failed", error: message };
  }
}

export async function dispatchBusinessNotification(payload: NotificationPayload) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase server configuration is incomplete.");

  const notification = await upsertBusinessNotification(admin, payload);
  const allowTest = String(process.env.NOTIFY_TEST_DATA || "").trim().toLowerCase() === "true";
  const shouldDeliver = payload.forceTestDelivery || !notification.is_test_data || allowTest;
  const channels = payload.onlyChannels?.length ? payload.onlyChannels : (["email", "whatsapp"] as const);

  if (!shouldDeliver) {
    const config = getNotificationConfig();
    const results: DeliveryResult[] = [];
    for (const channel of channels) {
      const recipient = channel === "email" ? config.vendorEmail : config.whatsapp.to;
      const delivery = await getOrCreateDelivery(admin, notification.id, channel, channel === "email" ? "brevo" : "twilio", recipient || "test-data");
      await updateDelivery(admin, delivery.id, {
        status: "skipped",
        attempts: delivery.attempts + 1,
        last_error: "External delivery is disabled for test data. Use the admin test button or set NOTIFY_TEST_DATA=true.",
      });
      results.push({ channel, status: "skipped", error: "Test-data delivery disabled." });
    }
    return { notificationId: notification.id, results };
  }

  const config = getNotificationConfig();
  const results = await Promise.all(channels.map((channel) => deliverChannel(admin, notification.id, payload, channel, config)));
  return { notificationId: notification.id, results };
}

export async function notifyPaidOrder(orderId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase server configuration is incomplete.");

  const { data: order, error: orderError } = await admin
    .from("orders")
    .select("id, order_number, email, total, currency, address, status, is_test_data, created_at")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError || !order) throw new Error(orderError?.message || "Paid order was not found.");

  const { data: items, error: itemsError } = await admin
    .from("order_items")
    .select("product_id, product_name, variant_name, unit_price, qty")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });
  if (itemsError) throw new Error(itemsError.message);

  const typedOrder = order as OrderRow;
  const typedItems = (items || []) as OrderItemRow[];
  const productIds = typedItems.map((item) => item.product_id).filter((value): value is string => Boolean(value));
  let purchasedProducts: ProductRentalRow[] = [];
  let rentalProductIds = new Set<string>();
  if (productIds.length) {
    const { data: products } = await admin
      .from("products")
      .select("id, name, subcategory_slug, stock_qty, is_active")
      .in("id", productIds);
    purchasedProducts = (products || []) as ProductRentalRow[];
    rentalProductIds = new Set(purchasedProducts.filter((product) => product.subcategory_slug === "houses-for-rent").map((product) => product.id));
  }

  const containsRental = typedItems.some((item) => item.product_id && rentalProductIds.has(item.product_id));
  const customerName = valueFromAddress(typedOrder.address, "fullName", "full_name", "name") || typedOrder.email;
  const phone = valueFromAddress(typedOrder.address, "phone", "phoneNumber", "phone_number");
  const city = valueFromAddress(typedOrder.address, "city");
  const state = valueFromAddress(typedOrder.address, "state");
  const total = formatMoney(Number(typedOrder.total || 0), typedOrder.currency || "NGN");
  const itemCount = typedItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const itemLines = typedItems.map((item) => `${item.qty} × ${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ""}`);
  const config = getNotificationConfig();
  const href = `/admin/orders?order=${encodeURIComponent(orderId)}`;
  const adminLink = `${config.siteUrl}${href}`;
  const title = containsRental ? `New paid rental — ${typedOrder.order_number}` : `New paid order — ${typedOrder.order_number}`;
  const body = `${customerName} paid ${total} for ${itemCount} ${itemCount === 1 ? "item" : "items"}.`;

  const itemRows = typedItems.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e7dfd2;color:#1a1a1a">${escapeHtml(item.product_name)}${item.variant_name ? `<br><small style="color:#6b6b6b">${escapeHtml(item.variant_name)}</small>` : ""}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e7dfd2;text-align:center;color:#1a1a1a">${Number(item.qty)}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e7dfd2;text-align:right;color:#1a1a1a">${escapeHtml(formatMoney(Number(item.unit_price || 0) * Number(item.qty || 0), typedOrder.currency || "NGN"))}</td>
    </tr>`).join("");

  const emailHtml = `
  <div style="background:#f6eee3;padding:32px;font-family:Arial,sans-serif;color:#1a1a1a">
    <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #d9cfbe;border-radius:14px;overflow:hidden">
      <div style="background:#1a1a1a;color:#fff;padding:24px 28px">
        <p style="margin:0 0 8px;color:#d9a900;font-size:12px;letter-spacing:.12em;font-weight:700">WOW &amp; AMAZING</p>
        <h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:400">${escapeHtml(title)}</h1>
      </div>
      <div style="padding:28px">
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6">${escapeHtml(body)}</p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 24px">
          <tr><td style="padding:6px 0;color:#6b6b6b">Customer</td><td style="padding:6px 0;text-align:right;font-weight:700">${escapeHtml(customerName)}</td></tr>
          <tr><td style="padding:6px 0;color:#6b6b6b">Email</td><td style="padding:6px 0;text-align:right">${escapeHtml(typedOrder.email)}</td></tr>
          ${phone ? `<tr><td style="padding:6px 0;color:#6b6b6b">Phone</td><td style="padding:6px 0;text-align:right">${escapeHtml(phone)}</td></tr>` : ""}
          ${city || state ? `<tr><td style="padding:6px 0;color:#6b6b6b">Location</td><td style="padding:6px 0;text-align:right">${escapeHtml([city, state].filter(Boolean).join(", "))}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#6b6b6b">Payment</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#9c6b12">Confirmed — ${escapeHtml(total)}</td></tr>
        </table>
        <table style="width:100%;border-collapse:collapse;margin:0 0 28px">
          <thead><tr><th style="padding:8px 0;text-align:left;font-size:12px;letter-spacing:.08em">ITEM</th><th style="padding:8px 0;text-align:center;font-size:12px;letter-spacing:.08em">QTY</th><th style="padding:8px 0;text-align:right;font-size:12px;letter-spacing:.08em">TOTAL</th></tr></thead>
          <tbody>${itemRows}</tbody>
        </table>
        <a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#b8860b;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Open order in dashboard</a>
      </div>
    </div>
  </div>`;

  const emailText = [
    "WOW & AMAZING",
    title,
    "",
    body,
    `Customer: ${customerName}`,
    `Email: ${typedOrder.email}`,
    phone ? `Phone: ${phone}` : "",
    city || state ? `Location: ${[city, state].filter(Boolean).join(", ")}` : "",
    `Payment: Confirmed — ${total}`,
    "",
    ...itemLines,
    "",
    `Open order: ${adminLink}`,
  ].filter(Boolean).join("\n");

  const whatsappText = [
    "WOW & AMAZING — NEW NOTIFICATION",
    "",
    title,
    `Customer: ${customerName}`,
    `Amount: ${total}`,
    `Items: ${itemCount}`,
    phone ? `Phone: ${phone}` : "",
    city || state ? `Location: ${[city, state].filter(Boolean).join(", ")}` : "",
    "",
    ...itemLines.slice(0, 5),
    typedItems.length > 5 ? `+ ${typedItems.length - 5} more item(s)` : "",
    "",
    `Open: ${adminLink}`,
  ].filter(Boolean).join("\n");

  const orderNotification = await dispatchBusinessNotification({
    eventKey: `order-paid:${typedOrder.id}`,
    eventType: containsRental ? "rental_paid" : "order_paid",
    title,
    body,
    href,
    orderId: typedOrder.id,
    isTestData: typedOrder.is_test_data,
    emailSubject: `[Wow & Amazing] ${title}`,
    emailHtml,
    emailText,
    whatsappText,
    whatsappVariables: {
      "1": containsRental ? "paid rental" : "paid order",
      "2": typedOrder.order_number,
      "3": customerName,
      "4": `${total} — ${itemCount} item(s)`,
      "5": adminLink,
    },
  });

  const lowStockProducts = purchasedProducts.filter((product) => product.is_active && product.stock_qty <= 5 && product.subcategory_slug !== "houses-for-rent");
  let lowStockNotification: Awaited<ReturnType<typeof dispatchBusinessNotification>> | null = null;
  if (lowStockProducts.length) {
    const stockLines = lowStockProducts.map((product) => `${product.name}: ${product.stock_qty} left`);
    const stockBody = `${lowStockProducts.length} purchased ${lowStockProducts.length === 1 ? "item is" : "items are"} now at five units or fewer.`;
    const stockHref = "/admin/products";
    const stockLink = `${config.siteUrl}${stockHref}`;
    lowStockNotification = await dispatchBusinessNotification({
      eventKey: `low-stock-after-order:${typedOrder.id}`,
      eventType: "low_stock",
      title: `Low-stock warning after ${typedOrder.order_number}`,
      body: stockBody,
      href: stockHref,
      orderId: typedOrder.id,
      isTestData: typedOrder.is_test_data,
      emailSubject: `[Wow & Amazing] Low-stock warning`,
      emailHtml: `<div style="font-family:Arial,sans-serif;background:#f6eee3;padding:32px"><div style="max-width:620px;margin:auto;background:#fff;border:1px solid #d9cfbe;border-radius:14px;padding:28px"><p style="color:#9c6b12;font-weight:700;letter-spacing:.12em">STOCK WATCH</p><h1 style="font-family:Georgia,serif;font-weight:400">Low-stock warning</h1><p>${escapeHtml(stockBody)}</p><ul>${stockLines.map((line) => `<li style="margin:8px 0">${escapeHtml(line)}</li>`).join("")}</ul><a href="${escapeHtml(stockLink)}" style="display:inline-block;background:#b8860b;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Manage inventory</a></div></div>`,
      emailText: ["WOW & AMAZING — LOW STOCK", "", stockBody, ...stockLines, "", `Manage: ${stockLink}`].join("\n"),
      whatsappText: ["WOW & AMAZING — LOW STOCK", "", stockBody, ...stockLines, "", `Manage: ${stockLink}`].join("\n"),
      whatsappVariables: { "1": "low-stock warning", "2": typedOrder.order_number, "3": "Inventory", "4": stockLines.join("; "), "5": stockLink },
    });
  }

  return { ...orderNotification, lowStockNotification };
}

export async function notifyServiceInquiry(inquiryId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase server configuration is incomplete.");
  const { data, error } = await admin
    .from("service_inquiries")
    .select("id, service_title, full_name, email, phone, company, budget, preferred_date, message, is_test_data")
    .eq("id", inquiryId)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || "Service enquiry was not found.");

  const config = getNotificationConfig();
  const href = `/admin/inquiries?service=${encodeURIComponent(inquiryId)}`;
  const adminLink = `${config.siteUrl}${href}`;
  const title = `New service enquiry — ${data.service_title}`;
  const body = `${data.full_name} requested ${data.service_title}.`;
  const details = [
    `Customer: ${data.full_name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : "",
    data.company ? `Company: ${data.company}` : "",
    data.budget ? `Budget: ${data.budget}` : "",
    data.preferred_date ? `Preferred date: ${data.preferred_date}` : "",
    "",
    data.message,
    "",
    `Open enquiry: ${adminLink}`,
  ].filter(Boolean).join("\n");

  return dispatchBusinessNotification({
    eventKey: `service-inquiry:${data.id}`,
    eventType: "service_inquiry",
    title,
    body,
    href,
    serviceInquiryId: data.id,
    isTestData: Boolean(data.is_test_data),
    emailSubject: `[Wow & Amazing] ${title}`,
    emailHtml: `<div style="font-family:Arial,sans-serif;background:#f6eee3;padding:32px"><div style="max-width:680px;margin:auto;background:#fff;border:1px solid #d9cfbe;border-radius:14px;padding:28px"><p style="color:#9c6b12;font-weight:700;letter-spacing:.12em">NEW SERVICE ENQUIRY</p><h1 style="font-family:Georgia,serif;font-weight:400">${escapeHtml(data.service_title)}</h1><p><strong>${escapeHtml(data.full_name)}</strong> (${escapeHtml(data.email)}) submitted a new request.</p><p style="white-space:pre-line;line-height:1.6">${escapeHtml(details)}</p><a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#b8860b;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Open enquiry</a></div></div>`,
    emailText: details,
    whatsappText: `WOW & AMAZING — NEW SERVICE ENQUIRY\n\n${details}`,
    whatsappVariables: { "1": "service enquiry", "2": data.service_title, "3": data.full_name, "4": data.email, "5": adminLink },
  });
}

export async function notifyContactMessage(messageId: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase server configuration is incomplete.");
  const { data, error } = await admin
    .from("contact_messages")
    .select("id, full_name, email, phone, subject, message, is_test_data")
    .eq("id", messageId)
    .maybeSingle();
  if (error || !data) throw new Error(error?.message || "Contact message was not found.");

  const config = getNotificationConfig();
  const href = `/admin/inquiries?contact=${encodeURIComponent(messageId)}`;
  const adminLink = `${config.siteUrl}${href}`;
  const title = `New contact message — ${data.subject}`;
  const body = `${data.full_name} sent a new website message.`;
  const details = [
    `Customer: ${data.full_name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : "",
    `Subject: ${data.subject}`,
    "",
    data.message,
    "",
    `Open message: ${adminLink}`,
  ].filter(Boolean).join("\n");

  return dispatchBusinessNotification({
    eventKey: `contact-message:${data.id}`,
    eventType: "contact_message",
    title,
    body,
    href,
    contactMessageId: data.id,
    isTestData: Boolean(data.is_test_data),
    emailSubject: `[Wow & Amazing] ${title}`,
    emailHtml: `<div style="font-family:Arial,sans-serif;background:#f6eee3;padding:32px"><div style="max-width:680px;margin:auto;background:#fff;border:1px solid #d9cfbe;border-radius:14px;padding:28px"><p style="color:#9c6b12;font-weight:700;letter-spacing:.12em">NEW CONTACT MESSAGE</p><h1 style="font-family:Georgia,serif;font-weight:400">${escapeHtml(data.subject)}</h1><p style="white-space:pre-line;line-height:1.6">${escapeHtml(details)}</p><a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#b8860b;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Open message</a></div></div>`,
    emailText: details,
    whatsappText: `WOW & AMAZING — NEW CONTACT MESSAGE\n\n${details}`,
    whatsappVariables: { "1": "contact message", "2": data.subject, "3": data.full_name, "4": data.email, "5": adminLink },
  });
}

export async function notifyPaymentReview(reference: string, reason: string) {
  const admin = getSupabaseAdminClient();
  if (!admin) throw new Error("Supabase server configuration is incomplete.");

  const { data: attempt } = await admin
    .from("payment_attempts")
    .select("reference, email, amount, currency, is_test_data")
    .eq("reference", reference)
    .maybeSingle();

  const config = getNotificationConfig();
  const href = `/admin/payments?reference=${encodeURIComponent(reference)}`;
  const adminLink = `${config.siteUrl}${href}`;
  const amount = attempt ? formatMoney(Number(attempt.amount || 0), String(attempt.currency || "NGN")) : "Unknown amount";
  const title = `Payment requires review — ${reference}`;
  const body = reason.slice(0, 400);
  const details = [
    `Reference: ${reference}`,
    attempt?.email ? `Customer: ${attempt.email}` : "",
    `Amount: ${amount}`,
    `Reason: ${reason}`,
    `Open payment: ${adminLink}`,
  ].filter(Boolean).join("\n");

  return dispatchBusinessNotification({
    eventKey: `payment-review:${reference}`,
    eventType: "payment_review",
    title,
    body,
    href,
    isTestData: Boolean(attempt?.is_test_data),
    emailSubject: `[Wow & Amazing] ${title}`,
    emailHtml: `<div style="font-family:Arial,sans-serif;background:#f6eee3;padding:32px"><div style="max-width:620px;margin:auto;background:#fff;border:1px solid #d9cfbe;border-radius:14px;padding:28px"><p style="color:#9c342f;font-weight:700;letter-spacing:.12em">PAYMENT ATTENTION REQUIRED</p><h1 style="font-family:Georgia,serif;font-weight:400">${escapeHtml(title)}</h1><p style="white-space:pre-line;line-height:1.6">${escapeHtml(details)}</p><a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#1a1a1a;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Review payment</a></div></div>`,
    emailText: details,
    whatsappText: `WOW & AMAZING — PAYMENT REVIEW\n\n${details}`,
    whatsappVariables: { "1": "payment review", "2": reference, "3": attempt?.email || "Customer", "4": amount, "5": adminLink },
  });
}

export async function sendManualTestNotification(channel: "email" | "whatsapp" | "all", ownerName: string) {
  const config = getNotificationConfig();
  const href = "/admin/notifications";
  const adminLink = `${config.siteUrl}${href}`;
  const timestamp = new Date().toISOString();
  const channels = channel === "all" ? (["email", "whatsapp"] as const) : [channel];
  const title = "Vendor notification test";
  const body = `A test notification was requested by ${ownerName}.`;

  return dispatchBusinessNotification({
    eventKey: `manual-test:${crypto.randomUUID()}`,
    eventType: "test",
    title,
    body,
    href,
    isTestData: true,
    forceTestDelivery: true,
    onlyChannels: [...channels],
    emailSubject: "[Wow & Amazing] Vendor notification test",
    emailHtml: `<div style="font-family:Arial,sans-serif;background:#f6eee3;padding:32px"><div style="max-width:620px;margin:auto;background:#fff;border:1px solid #d9cfbe;border-radius:14px;padding:28px"><p style="color:#9c6b12;font-weight:700;letter-spacing:.12em">NOTIFICATION TEST</p><h1 style="font-family:Georgia,serif;font-weight:400">Your vendor alerts are connected.</h1><p>This test was requested by ${escapeHtml(ownerName)} at ${escapeHtml(timestamp)}.</p><a href="${escapeHtml(adminLink)}" style="display:inline-block;background:#b8860b;color:white;text-decoration:none;padding:13px 20px;border-radius:8px;font-weight:700">Open notification centre</a></div></div>`,
    emailText: `Wow & Amazing vendor notification test\nRequested by: ${ownerName}\nTime: ${timestamp}\nOpen: ${adminLink}`,
    whatsappText: `WOW & AMAZING — NOTIFICATION TEST\n\nYour vendor WhatsApp alerts are connected.\nRequested by: ${ownerName}\nTime: ${timestamp}\n\nOpen: ${adminLink}`,
    whatsappVariables: { "1": "notification test", "2": "TEST", "3": ownerName, "4": timestamp, "5": adminLink },
  });
}

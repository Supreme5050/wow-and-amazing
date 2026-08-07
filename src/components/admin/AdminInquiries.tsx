/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import { ownerFetch } from "@/lib/admin/client";

type ServiceInquiry = {
  id: string;
  service_title: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  budget: string | null;
  preferred_date: string | null;
  message: string;
  status: string;
  owner_notes: string | null;
  created_at: string;
};

type ContactMessage = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  owner_notes: string | null;
  created_at: string;
};

type Payload = { serviceInquiries: ServiceInquiry[]; contactMessages: ContactMessage[] };
type Tab = "service" | "contact";

const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });
const serviceStatuses = ["new", "contacted", "quoted", "booked", "completed", "closed"];
const contactStatuses = ["new", "read", "replied", "closed"];

export function AdminInquiries() {
  const [serviceInquiries, setServiceInquiries] = useState<ServiceInquiry[]>([]);
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [tab, setTab] = useState<Tab>("service");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const payload = await ownerFetch<Payload>("/api/admin/inquiries");
      setServiceInquiries(payload.serviceInquiries);
      setContactMessages(payload.contactMessages);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load enquiries.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const visibleServices = useMemo(() => {
    const value = query.trim().toLowerCase();
    return serviceInquiries.filter((item) => (status === "all" || item.status === status) && (!value || `${item.full_name} ${item.email} ${item.service_title} ${item.company ?? ""}`.toLowerCase().includes(value)));
  }, [query, serviceInquiries, status]);

  const visibleContacts = useMemo(() => {
    const value = query.trim().toLowerCase();
    return contactMessages.filter((item) => (status === "all" || item.status === status) && (!value || `${item.full_name} ${item.email} ${item.subject}`.toLowerCase().includes(value)));
  }, [contactMessages, query, status]);

  async function update(type: Tab, id: string, nextStatus: string, notes: string) {
    try {
      await ownerFetch("/api/admin/inquiries", { method: "PATCH", body: JSON.stringify({ type, id, status: nextStatus, ownerNotes: notes }) });
      setMessage("Inbox item updated.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update the inbox item.");
    }
  }

  function changeTab(next: Tab) {
    setTab(next);
    setStatus("all");
    setQuery("");
  }

  const items = tab === "service" ? visibleServices : visibleContacts;
  const statuses = tab === "service" ? serviceStatuses : contactStatuses;

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading"><div><p className="wa-eyebrow">PRIVATE INBOX</p><h1>Enquiries & Messages</h1><p>Review service requests and customer contact messages in one place.</p></div></div>
      {message ? <div className="admin-alert">{message}</div> : null}

      <div className="admin-inquiry-tabs">
        <button className={tab === "service" ? "active" : ""} type="button" onClick={() => changeTab("service")}>Service Enquiries <span>{serviceInquiries.length}</span></button>
        <button className={tab === "contact" ? "active" : ""} type="button" onClick={() => changeTab("contact")}>Contact Messages <span>{contactMessages.length}</span></button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search-field">Search inbox<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email, service, or subject" /></label>
        <label className="admin-search-field">Status<select className="input-field" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        <span>{items.length} items</span>
      </div>

      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading inbox…</p></div> : items.length ? <div className="admin-inquiry-list">
          {tab === "service" ? visibleServices.map((item) => <ServiceInquiryCard item={item} key={item.id} onSave={(nextStatus, notes) => update("service", item.id, nextStatus, notes)} />) : visibleContacts.map((item) => <ContactCard item={item} key={item.id} onSave={(nextStatus, notes) => update("contact", item.id, nextStatus, notes)} />)}
        </div> : <div className="admin-empty"><h2>No inbox items found.</h2><p>New customer submissions will appear here automatically.</p></div>}
      </section>
    </div>
  );
}

function ServiceInquiryCard({ item, onSave }: { item: ServiceInquiry; onSave: (status: string, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.owner_notes ?? "");
  const [saving, setSaving] = useState(false);
  async function save() { setSaving(true); await onSave(status, notes); setSaving(false); }
  return <article className="admin-inquiry-card"><div className="admin-inquiry-card-heading"><div><span className={`admin-status-pill ${item.status}`}>{item.status}</span><h2>{item.service_title}</h2><p>{item.full_name} · <a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? ` · ${item.phone}` : ""}</p></div><time>{date.format(new Date(item.created_at))}</time></div><div className="admin-inquiry-meta"><span><strong>Company</strong>{item.company || "Not supplied"}</span><span><strong>Budget</strong>{item.budget || "To discuss"}</span><span><strong>Preferred date</strong>{item.preferred_date || "Flexible"}</span></div><div className="admin-inquiry-message">{item.message}</div><div className="admin-inquiry-update"><label>Status<select className="input-field" value={status} onChange={(event) => setStatus(event.target.value)}>{serviceStatuses.map((value) => <option value={value} key={value}>{value}</option>)}</select></label><label>Owner notes<textarea className="input-field" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="button-primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save Update"}</button></div></article>;
}

function ContactCard({ item, onSave }: { item: ContactMessage; onSave: (status: string, notes: string) => Promise<void> }) {
  const [status, setStatus] = useState(item.status);
  const [notes, setNotes] = useState(item.owner_notes ?? "");
  const [saving, setSaving] = useState(false);
  async function save() { setSaving(true); await onSave(status, notes); setSaving(false); }
  return <article className="admin-inquiry-card"><div className="admin-inquiry-card-heading"><div><span className={`admin-status-pill ${item.status}`}>{item.status}</span><h2>{item.subject}</h2><p>{item.full_name} · <a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? ` · ${item.phone}` : ""}</p></div><time>{date.format(new Date(item.created_at))}</time></div><div className="admin-inquiry-message">{item.message}</div><div className="admin-inquiry-update"><label>Status<select className="input-field" value={status} onChange={(event) => setStatus(event.target.value)}>{contactStatuses.map((value) => <option value={value} key={value}>{value}</option>)}</select></label><label>Owner notes<textarea className="input-field" rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button className="button-primary" type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save Update"}</button></div></article>;
}

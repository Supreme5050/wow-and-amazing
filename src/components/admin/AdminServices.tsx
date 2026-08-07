/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ownerFetch } from "@/lib/admin/client";
import { formatStoreMoney } from "@/lib/store/currency";

type Service = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string;
  image_url: string | null;
  price_from: number | null;
  turnaround: string | null;
  deliverables: string[];
  is_active: boolean;
  sort_order: number;
};

type Payload = { services: Service[] };

const empty = {
  id: "",
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  imageUrl: "",
  priceFrom: "",
  turnaround: "Timeline confirmed after consultation",
  deliverables: "",
  isActive: true,
  sortOrder: "0",
};

export function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(empty);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const payload = await ownerFetch<Payload>("/api/admin/services");
      setServices(payload.services);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? services.filter((service) => `${service.title} ${service.slug}`.toLowerCase().includes(value)) : services;
  }, [query, services]);

  function edit(service: Service) {
    setForm({
      id: service.id,
      title: service.title,
      slug: service.slug,
      shortDescription: service.short_description ?? "",
      description: service.description,
      imageUrl: service.image_url ?? "",
      priceFrom: service.price_from === null ? "" : String(service.price_from),
      turnaround: service.turnaround ?? "",
      deliverables: (service.deliverables ?? []).join("\n"),
      isActive: service.is_active,
      sortOrder: String(service.sort_order),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await ownerFetch("/api/admin/services", {
        method: form.id ? "PATCH" : "POST",
        body: JSON.stringify({
          ...form,
          deliverables: form.deliverables.split("\n").map((item) => item.trim()).filter(Boolean),
        }),
      });
      setMessage(form.id ? "Service updated." : "Service created.");
      setForm(empty);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save service.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(service: Service) {
    if (!window.confirm(`Delete ${service.title}? Existing enquiries will be preserved without the service record.`)) return;
    try {
      await ownerFetch(`/api/admin/services?id=${encodeURIComponent(service.id)}`, { method: "DELETE" });
      setMessage("Service deleted.");
      if (form.id === service.id) setForm(empty);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete service.");
    }
  }

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading"><div><p className="wa-eyebrow">SERVICES MODULE</p><h1>Services</h1><p>Manage the food, property, media, and equipment-rental services shown on the public Services page.</p></div></div>
      {message ? <div className="admin-alert">{message}</div> : null}

      <section className="admin-panel admin-service-editor-panel">
        <div className="admin-panel-heading"><div><p className="wa-eyebrow">{form.id ? "EDIT SERVICE" : "NEW SERVICE"}</p><h2>{form.id ? form.title : "Add a service"}</h2></div>{form.id ? <button className="button-secondary" type="button" onClick={() => setForm(empty)}>Cancel edit</button> : null}</div>
        <form className="admin-service-form" onSubmit={submit}>
          <div className="admin-service-form-grid">
            <label>Service title<input className="input-field" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required /></label>
            <label>URL slug<input className="input-field" value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} required /></label>
            <label>Starting price (NGN)<input className="input-field" type="number" min="0" step="0.01" value={form.priceFrom} onChange={(event) => setForm((current) => ({ ...current, priceFrom: event.target.value }))} placeholder="Leave blank for custom quotation" /></label>
            <label>Display order<input className="input-field" type="number" min="0" step="1" value={form.sortOrder} onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} /></label>
            <label>Turnaround<input className="input-field" value={form.turnaround} onChange={(event) => setForm((current) => ({ ...current, turnaround: event.target.value }))} /></label>
            <label>Image URL (optional)<input className="input-field" value={form.imageUrl} onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))} /></label>
          </div>
          <label>Short description<textarea className="input-field" rows={2} value={form.shortDescription} onChange={(event) => setForm((current) => ({ ...current, shortDescription: event.target.value }))} required /></label>
          <label>Full description<textarea className="input-field" rows={5} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} required /></label>
          <label>Deliverables — one per line<textarea className="input-field" rows={5} value={form.deliverables} onChange={(event) => setForm((current) => ({ ...current, deliverables: event.target.value }))} /></label>
          <label className="admin-checkbox-row"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} /><span><strong>Published</strong><small>Visible on the public Services page.</small></span></label>
          <button className="button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : form.id ? "Save Changes" : "Create Service"}</button>
        </form>
      </section>

      <div className="admin-toolbar"><label className="admin-search-field">Search services<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Title or slug" /></label><span>{visible.length} services</span></div>
      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading services…</p></div> : visible.length ? <div className="admin-service-list">{visible.map((service) => <article key={service.id}><div><span className={service.is_active ? "admin-status-pill active" : "admin-status-pill"}>{service.is_active ? "Published" : "Draft"}</span><h2>{service.title}</h2><p>{service.short_description}</p><small>{service.price_from === null ? "Custom quotation" : `From ${formatStoreMoney(service.price_from)}`} · {service.turnaround || "Timeline by consultation"}</small></div><div className="admin-service-actions"><button className="button-secondary" type="button" onClick={() => edit(service)}>Edit</button><button className="button-secondary danger" type="button" onClick={() => void remove(service)}>Delete</button></div></article>)}</div> : <div className="admin-empty"><h2>No services found.</h2><p>Create the first public service above.</p></div>}
      </section>
    </div>
  );
}

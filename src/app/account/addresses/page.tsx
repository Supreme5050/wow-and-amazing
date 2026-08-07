/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapPinIcon, TrashIcon } from "@/components/icons/LineIcons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  line_1: string;
  line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

type Draft = Omit<Address, "id">;

const emptyDraft: Draft = {
  label: "Home",
  full_name: "",
  phone: "",
  line_1: "",
  line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "Nigeria",
  is_default: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading addresses…");
  const [saving, setSaving] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const heading = useMemo(() => editingId ? "Edit address" : "Add an address", [editingId]);

  async function load() {
    if (!supabase) return;
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setMessage("Sign in to manage delivery addresses.");
      return;
    }
    if (!auth.user.email_confirmed_at) {
      setMessage("Verify your email address before saving permanent delivery addresses.");
      return;
    }
    setUserId(auth.user.id);

    const [{ data, error }, profileResult] = await Promise.all([
      supabase
        .from("addresses")
        .select("id, label, full_name, phone, line_1, line_2, city, state, postal_code, country, is_default")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true }),
      supabase.from("profiles").select("full_name, phone").eq("id", auth.user.id).maybeSingle(),
    ]);

    setAddresses((data ?? []) as Address[]);
    if (!editingId && !addresses.length) {
      setDraft((current) => ({
        ...current,
        full_name: current.full_name || String(profileResult.data?.full_name ?? ""),
        phone: current.phone || String(profileResult.data?.phone ?? ""),
      }));
    }
    setMessage(error?.message ?? "");
  }

  useEffect(() => {
    if (!supabase) {
      setMessage("Supabase is not configured.");
      return;
    }
    void load();
  }, []);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function editAddress(address: Address) {
    setEditingId(address.id);
    setDraft({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone ?? "",
      line_1: address.line_1,
      line_2: address.line_2 ?? "",
      city: address.city,
      state: address.state ?? "",
      postal_code: address.postal_code ?? "",
      country: address.country,
      is_default: address.is_default,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setDraft(emptyDraft);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !userId) return;
    setSaving(true);
    setMessage(editingId ? "Updating address…" : "Saving address…");

    const values = {
      user_id: userId,
      label: draft.label.trim(),
      full_name: draft.full_name.trim(),
      phone: draft.phone?.trim() || null,
      line_1: draft.line_1.trim(),
      line_2: draft.line_2?.trim() || null,
      city: draft.city.trim(),
      state: draft.state?.trim() || null,
      postal_code: draft.postal_code?.trim() || null,
      country: draft.country.trim(),
      is_default: draft.is_default || addresses.length === 0,
    };

    const result = editingId
      ? await supabase.from("addresses").update(values).eq("id", editingId)
      : await supabase.from("addresses").insert(values);

    if (result.error) {
      setMessage(result.error.message);
      setSaving(false);
      return;
    }

    resetForm();
    await load();
    setMessage(editingId ? "Address updated." : "Address saved.");
    setSaving(false);
  }

  async function makeDefault(address: Address) {
    if (!supabase || address.is_default) return;
    setMessage("Updating your default address…");
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", address.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    await load();
    setMessage(`${address.label} is now your default delivery address.`);
  }

  async function removeAddress(address: Address) {
    if (!supabase || !window.confirm(`Delete the ${address.label} address?`)) return;
    setMessage("Deleting address…");
    const { error } = await supabase.from("addresses").delete().eq("id", address.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (editingId === address.id) resetForm();
    await load();
    setMessage("Address deleted.");
  }

  return (
    <section className="section-shell store-page">
      <div className="site-container">
        <div className="store-page-heading account-subpage-heading">
          <div><p className="wa-eyebrow">SAVED ADDRESSES</p><h1 className="wa-section-heading">Delivery Addresses</h1><p>Add several locations and choose the one checkout should suggest first.</p></div>
          <Link className="button-secondary" href="/account">Back to Account</Link>
        </div>

        {message.startsWith("Sign in") || message.startsWith("Verify") ? (
          <div className="store-empty-card empty-store-state"><h2>Account access required.</h2><p>{message}</p><Link className="button-primary" href={message.startsWith("Verify") ? "/account?mode=verify" : "/account"}>{message.startsWith("Verify") ? "Verify email" : "Sign in"}</Link></div>
        ) : (
          <div className="addresses-grid address-management-grid">
            <div className="address-list">
              {addresses.length ? addresses.map((address) => (
                <article className={address.is_default ? "address-card address-card-default" : "address-card"} key={address.id}>
                  <div className="address-card-heading">
                    <span className="address-icon"><MapPinIcon size={20} /></span>
                    <div><strong>{address.label}</strong>{address.is_default ? <small>Default address</small> : null}</div>
                  </div>
                  <p><strong>{address.full_name}</strong>{address.phone ? <><br />{address.phone}</> : null}</p>
                  <p>{address.line_1}{address.line_2 ? <><br />{address.line_2}</> : null}<br />{address.city}{address.state ? `, ${address.state}` : ""}{address.postal_code ? ` ${address.postal_code}` : ""}<br />{address.country}</p>
                  <div className="address-card-actions">
                    {!address.is_default ? <button type="button" onClick={() => void makeDefault(address)}>Make default</button> : null}
                    <button type="button" onClick={() => editAddress(address)}>Edit</button>
                    <button type="button" className="danger" onClick={() => void removeAddress(address)}><TrashIcon size={16} /> Delete</button>
                  </div>
                </article>
              )) : <div className="address-empty-state"><MapPinIcon size={28} /><h2>No saved addresses yet.</h2><p>Your first saved address will automatically become the default.</p></div>}
            </div>

            <form className="address-form address-editor" onSubmit={submit}>
              <div className="account-card-heading"><p className="wa-eyebrow">{editingId ? "EDIT DELIVERY DETAILS" : "NEW DELIVERY LOCATION"}</p><h2>{heading}</h2><p>These details will be available during checkout.</p></div>
              <div className="address-form-grid">
                <label>Label<input className="input-field" value={draft.label} onChange={(event) => update("label", event.target.value)} placeholder="Home, Office, Studio" required /></label>
                <label>Full name<input className="input-field" value={draft.full_name} onChange={(event) => update("full_name", event.target.value)} required /></label>
                <label className="wide">Phone number<input className="input-field" type="tel" value={draft.phone ?? ""} onChange={(event) => update("phone", event.target.value)} /></label>
                <label className="wide">Address line 1<input className="input-field" value={draft.line_1} onChange={(event) => update("line_1", event.target.value)} required /></label>
                <label className="wide">Address line 2<input className="input-field" value={draft.line_2 ?? ""} onChange={(event) => update("line_2", event.target.value)} placeholder="Apartment, suite, floor (optional)" /></label>
                <label>City<input className="input-field" value={draft.city} onChange={(event) => update("city", event.target.value)} required /></label>
                <label>State<input className="input-field" value={draft.state ?? ""} onChange={(event) => update("state", event.target.value)} /></label>
                <label>Postal code<input className="input-field" value={draft.postal_code ?? ""} onChange={(event) => update("postal_code", event.target.value)} /></label>
                <label>Country<input className="input-field" value={draft.country} onChange={(event) => update("country", event.target.value)} required /></label>
              </div>
              <label className="address-default-checkbox"><input type="checkbox" checked={draft.is_default} onChange={(event) => update("is_default", event.target.checked)} /><span><strong>Use as default address</strong><small>This address will be selected first during checkout.</small></span></label>
              <div className="address-form-actions">
                <button className="button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Update Address" : "Save Address"}</button>
                {editingId ? <button className="button-secondary" type="button" onClick={resetForm}>Cancel</button> : null}
              </div>
              {message && !message.startsWith("Loading") ? <p className="form-message" role="status">{message}</p> : null}
            </form>
          </div>
        )}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { ownerFetch } from "@/lib/admin/client";

type Subscriber = { id: string; email: string; created_at: string };
type Payload = { subscribers: Subscriber[] };
const date = new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" });

export function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    ownerFetch<Payload>("/api/admin/subscribers")
      .then((payload) => setSubscribers(payload.subscribers))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load subscribers."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return value ? subscribers.filter((subscriber) => subscriber.email.toLowerCase().includes(value)) : subscribers;
  }, [query, subscribers]);

  function exportCsv() {
    const rows = [["Email", "Subscribed at"], ...visible.map((subscriber) => [subscriber.email, subscriber.created_at])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wow-and-amazing-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading">
        <div><p className="wa-eyebrow">AUDIENCE</p><h1>Newsletter Subscribers</h1><p>People who asked to receive product news, service updates, and offers.</p></div>
        <button className="button-secondary" type="button" onClick={exportCsv} disabled={!visible.length}>Export CSV</button>
      </div>

      <div className="admin-toolbar">
        <label className="admin-search-field">Search subscribers<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Email address" /></label>
        <span>{visible.length} {visible.length === 1 ? "subscriber" : "subscribers"}</span>
      </div>
      {message ? <div className="admin-alert error">{message}</div> : null}

      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading subscribers…</p></div> : visible.length ? (
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Email address</th><th>Subscribed</th></tr></thead><tbody>{visible.map((subscriber) => <tr key={subscriber.id}><td><strong>{subscriber.email}</strong></td><td>{date.format(new Date(subscriber.created_at))}</td></tr>)}</tbody></table></div>
        ) : <div className="admin-empty"><h2>No subscribers found.</h2><p>New newsletter signups will appear here automatically.</p></div>}
      </section>
    </div>
  );
}

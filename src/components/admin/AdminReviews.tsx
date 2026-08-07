"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RatingStars } from "@/components/catalog/RatingStars";
import { TrashIcon } from "@/components/icons/LineIcons";
import { ownerFetch } from "@/lib/admin/client";

type Review = {
  id: string;
  rating: number;
  comment: string;
  is_visible: boolean;
  owner_response: string | null;
  created_at: string;
  customer: { full_name: string | null; email: string | null };
  product: { name: string; slug: string } | null;
};

type Payload = { reviews: Review[] };

export function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [response, setResponse] = useState("");

  async function load() {
    const data = await ownerFetch<Payload>("/api/admin/reviews");
    setReviews(data.reviews);
  }

  useEffect(() => {
    ownerFetch<Payload>("/api/admin/reviews")
      .then((data) => setReviews(data.reviews))
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load reviews."))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    const value = query.trim().toLowerCase();
    return reviews.filter((review) => {
      const matchesVisibility = visibility === "all" || (visibility === "visible" ? review.is_visible : !review.is_visible);
      const haystack = `${review.product?.name ?? ""} ${review.customer.full_name ?? ""} ${review.customer.email ?? ""} ${review.comment}`.toLowerCase();
      return matchesVisibility && (!value || haystack.includes(value));
    });
  }, [query, reviews, visibility]);

  async function save(review: Review, nextVisible = review.is_visible) {
    setMessage("Saving review moderation…");
    try {
      await ownerFetch("/api/admin/reviews", {
        method: "PATCH",
        body: JSON.stringify({ id: review.id, isVisible: nextVisible, ownerResponse: editing === review.id ? response : review.owner_response ?? "" }),
      });
      await load();
      setEditing(null);
      setResponse("");
      setMessage("Review moderation saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save review moderation.");
    }
  }

  async function remove(review: Review) {
    if (!window.confirm("Permanently delete this customer review?")) return;
    setMessage("Deleting review…");
    try {
      await ownerFetch(`/api/admin/reviews?id=${encodeURIComponent(review.id)}`, { method: "DELETE" });
      await load();
      setMessage("Review deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete review.");
    }
  }

  return (
    <div className="admin-page-stack">
      <div className="admin-page-heading"><div><p className="wa-eyebrow">REVIEW MODERATION</p><h1>Customer Reviews</h1><p>Publish, hide, respond to, or remove verified customer feedback.</p></div></div>

      <div className="admin-toolbar admin-review-toolbar">
        <label className="admin-search-field">Search reviews<input className="input-field" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Product, customer, email, or comment" /></label>
        <label className="admin-search-field">Visibility<select className="input-field" value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="all">All reviews</option><option value="visible">Published</option><option value="hidden">Hidden</option></select></label>
        <span>{visible.length} reviews</span>
      </div>

      {message ? <div className="admin-alert">{message}</div> : null}

      <section className="admin-panel">
        {loading ? <div className="admin-loading-panel"><span className="admin-spinner" /><p>Loading reviews…</p></div> : visible.length ? (
          <div className="admin-review-list">
            {visible.map((review) => (
              <article className="admin-review-card" key={review.id}>
                <div className="admin-review-card-head">
                  <div><span className={review.is_visible ? "admin-status paid" : "admin-status cancelled"}>{review.is_visible ? "Published" : "Hidden"}</span><strong>{review.customer.full_name || "Customer"}</strong><small>{review.customer.email || "Email unavailable"} · {new Date(review.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</small></div>
                  <RatingStars rating={review.rating} />
                </div>
                <div className="admin-review-product">Product: {review.product ? <Link href={`/product/${review.product.slug}`} target="_blank">{review.product.name}</Link> : "Unavailable product"}</div>
                <p className="admin-review-comment">{review.comment}</p>
                {editing === review.id ? (
                  <div className="admin-review-response-editor">
                    <label>Public owner response<textarea className="input-field" value={response} maxLength={1200} onChange={(event) => setResponse(event.target.value)} placeholder="Thank the customer or address their concern professionally." /></label>
                    <div><button className="button-primary" type="button" onClick={() => void save(review)}>Save Response</button><button className="button-secondary" type="button" onClick={() => { setEditing(null); setResponse(""); }}>Cancel</button></div>
                  </div>
                ) : review.owner_response ? <div className="admin-review-owner-response"><strong>Your public response</strong><p>{review.owner_response}</p></div> : null}
                <div className="admin-review-actions">
                  <button type="button" onClick={() => void save(review, !review.is_visible)}>{review.is_visible ? "Hide Review" : "Publish Review"}</button>
                  <button type="button" onClick={() => { setEditing(review.id); setResponse(review.owner_response ?? ""); }}>{review.owner_response ? "Edit Response" : "Add Response"}</button>
                  <button type="button" className="danger" onClick={() => void remove(review)}><TrashIcon size={16} /> Delete</button>
                </div>
              </article>
            ))}
          </div>
        ) : <div className="admin-empty"><h2>No reviews found.</h2><p>Verified customer reviews will appear here after paid customers submit them.</p></div>}
      </section>
    </div>
  );
}

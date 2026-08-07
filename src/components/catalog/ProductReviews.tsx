/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { RatingStars } from "@/components/catalog/RatingStars";
import { StarIcon, TrashIcon } from "@/components/icons/LineIcons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Review = {
  id: string;
  rating: number;
  comment: string;
  ownerResponse: string | null;
  createdAt: string;
  updatedAt: string;
  displayName: string;
  isMine: boolean;
};

type ExistingReview = {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
};

type ReviewPayload = {
  reviews: Review[];
  summary: { rating: number; count: number };
  viewer: {
    signedIn: boolean;
    canReview: boolean;
    existingReview: ExistingReview | null;
  };
};

export function ProductReviews({
  productId,
  productSlug,
  productName,
  initialRating,
  initialReviewCount,
}: {
  productId: string;
  productSlug: string;
  productName: string;
  initialRating: number;
  initialReviewCount: number;
}) {
  const [payload, setPayload] = useState<ReviewPayload | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReviews = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const session = await supabase?.auth.getSession();
    const token = session?.data.session?.access_token;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await fetch(`/api/products/${productId}/reviews`, { headers, cache: "no-store" });
    const data = await response.json() as ReviewPayload & { error?: string };
    if (!response.ok) throw new Error(data.error || "Unable to load customer reviews.");
    setPayload(data);
    if (data.viewer.existingReview) {
      setRating(data.viewer.existingReview.rating);
      setComment(data.viewer.existingReview.comment);
    } else {
      setRating(5);
      setComment("");
    }
  }, [productId]);

  useEffect(() => {
    loadReviews()
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load customer reviews."))
      .finally(() => setLoading(false));
  }, [loadReviews]);

  const visibleRating = payload?.summary.count ? payload.summary.rating : initialRating;
  const visibleCount = payload?.summary.count ? payload.summary.count : initialReviewCount;
  const existing = payload?.viewer.existingReview ?? null;

  const ratingLabel = useMemo(() => `${rating} out of 5 stars`, [rating]);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(existing ? "Updating your review…" : "Publishing your review…");

    try {
      const supabase = getSupabaseBrowserClient();
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) throw new Error("Your session has expired. Sign in again to continue.");

      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to save your review.");

      await loadReviews();
      setMessage(existing ? "Your review has been updated." : "Thank you. Your review is now published.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save your review.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview() {
    if (!window.confirm("Delete your review for this product?")) return;
    setSaving(true);
    setMessage("Deleting your review…");
    try {
      const supabase = getSupabaseBrowserClient();
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) throw new Error("Your session has expired. Sign in again to continue.");
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to delete your review.");
      await loadReviews();
      setMessage("Your review has been deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete your review.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="product-reviews-layout">
      <div className="review-summary-card">
        <p className="wa-eyebrow">CUSTOMER REVIEWS</p>
        <div className="review-score-row">
          <strong>{visibleRating.toFixed(1)}</strong>
          <div>
            <RatingStars rating={visibleRating} />
            <p>Based on {visibleCount} {visibleCount === 1 ? "review" : "reviews"}</p>
          </div>
        </div>
        <p className="review-note">Reviews submitted here are limited to customers with a confirmed paid order for this product.</p>

        {loading ? <p className="store-loading">Checking your review eligibility…</p> : null}

        {!loading && !payload?.viewer.signedIn ? (
          <div className="review-signin-callout">
            <p>Already purchased {productName}? Sign in to write a verified review.</p>
            <Link className="button-secondary" href={`/account?returnTo=/product/${productSlug}%23reviews`}>Sign in to review</Link>
          </div>
        ) : null}

        {!loading && payload?.viewer.signedIn && !payload.viewer.canReview && !existing ? (
          <p className="review-eligibility-note">A review form will become available after a paid order containing this product is linked to your account.</p>
        ) : null}

        {!loading && payload?.viewer.signedIn && (payload.viewer.canReview || existing) ? (
          <form className="review-form" onSubmit={submitReview}>
            <fieldset>
              <legend>{existing ? "Update your rating" : "Your rating"}</legend>
              <div className="review-star-input" role="radiogroup" aria-label={ratingLabel}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={value <= rating ? "selected" : ""}
                    role="radio"
                    aria-checked={value === rating}
                    aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    onClick={() => setRating(value)}
                  >
                    <StarIcon size={24} />
                  </button>
                ))}
              </div>
            </fieldset>
            <label>Your review
              <textarea
                className="input-field review-textarea"
                value={comment}
                minLength={10}
                maxLength={1200}
                required
                onChange={(event) => setComment(event.target.value)}
                placeholder="Share what you liked, how you used it, and what other customers should know."
              />
              <small>{comment.length}/1200 characters</small>
            </label>
            {!existing?.isVisible ? <p className="review-hidden-notice">Your existing review is currently hidden while the owner reviews it. You may still edit it.</p> : null}
            <div className="review-form-actions">
              <button className="button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : existing ? "Update Review" : "Publish Review"}</button>
              {existing ? <button className="button-secondary review-delete-button" type="button" disabled={saving} onClick={deleteReview}><TrashIcon size={17} /> Delete</button> : null}
            </div>
          </form>
        ) : null}
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </div>

      <div className="review-list-panel">
        <div className="review-list-heading">
          <div><p className="wa-eyebrow">VERIFIED FEEDBACK</p><h3>What customers are saying.</h3></div>
          <span>{payload?.summary.count ?? 0} live</span>
        </div>

        {loading ? <p className="store-loading">Loading customer comments…</p> : payload?.reviews.length ? (
          <div className="review-comment-list">
            {payload.reviews.map((review) => (
              <article className="review-comment-card" key={review.id}>
                <div className="review-comment-head">
                  <div><strong>{review.displayName}</strong><span>Verified purchase{review.isMine ? " · Your review" : ""}</span></div>
                  <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}</time>
                </div>
                <RatingStars rating={review.rating} />
                <p>{review.comment}</p>
                {review.ownerResponse ? <div className="review-owner-response"><strong>Response from Wow & Amazing</strong><p>{review.ownerResponse}</p></div> : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="review-empty-state"><h3>No live comments yet.</h3><p>The product rating remains visible from the starter catalog. New verified customer comments will appear here.</p></div>
        )}
      </div>
    </div>
  );
}

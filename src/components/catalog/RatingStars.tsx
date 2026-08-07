import { StarIcon } from "@/components/icons/LineIcons";

export function RatingStars({ rating, reviewCount, size = 16 }: { rating: number; reviewCount?: number; size?: number }) {
  return (
    <div className="product-rating" aria-label={`${rating} out of 5 stars${reviewCount ? ` from ${reviewCount} reviews` : ""}`}>
      <span className="product-stars" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <StarIcon className={index < Math.round(rating) ? "star-filled" : "star-empty"} key={index} size={size} />
        ))}
      </span>
      {typeof reviewCount === "number" ? <span className="product-review-count">({reviewCount})</span> : null}
    </div>
  );
}

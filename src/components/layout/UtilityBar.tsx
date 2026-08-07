import Link from "next/link";

export function UtilityBar() {
  return (
    <div className="utility-bar">
      <div className="site-container utility-bar-inner">
        <p className="utility-announcement">FREE SHIPPING ON ORDERS OVER ₦75,000 <span aria-hidden="true">✦</span></p>
        <div className="utility-actions">
          <Link className="utility-link" href="/track-order">Track Order</Link>
          <Link className="utility-link" href="/support">Help &amp; Support</Link>
        </div>
      </div>
    </div>
  );
}

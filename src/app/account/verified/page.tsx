import type { Metadata } from "next";
import Link from "next/link";
import { CheckIcon, ShieldIcon } from "@/components/icons/LineIcons";

export const metadata: Metadata = {
  title: "Email Verified",
  robots: { index: false, follow: false },
};

export default function AccountVerifiedPage() {
  return (
    <section className="section-shell store-page auth-status-page">
      <div className="site-container auth-status-shell">
        <section className="email-verified-card">
          <div className="email-verified-icon"><CheckIcon size={34} /></div>
          <p className="wa-eyebrow">ACCOUNT ACTIVATED</p>
          <h1>Your email is verified.</h1>
          <p>Your Wow &amp; Amazing account is ready for order history, saved addresses, permanent wishlist syncing, reviews, and secure property rentals.</p>
          <div className="email-verified-actions">
            <Link className="button-primary" href="/account">Open My Account</Link>
            <Link className="button-secondary" href="/category/all">Continue Shopping</Link>
          </div>
          <div className="email-verification-help"><ShieldIcon size={18} /><span>Your sign-in session is securely managed by Supabase.</span></div>
        </section>
      </div>
    </section>
  );
}

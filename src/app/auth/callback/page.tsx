import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackClient } from "@/components/account/AuthCallbackClient";

export const metadata: Metadata = {
  title: "Confirming Account",
  robots: { index: false, follow: false },
};

export default function AuthCallbackPage() {
  return (
    <section className="section-shell store-page auth-status-page">
      <div className="site-container auth-status-shell">
        <Suspense fallback={<p className="store-loading">Confirming your account…</p>}>
          <AuthCallbackClient />
        </Suspense>
      </div>
    </section>
  );
}

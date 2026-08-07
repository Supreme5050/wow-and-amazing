import type { Metadata } from "next";
import { EmailVerificationCard } from "@/components/account/EmailVerificationCard";

export const metadata: Metadata = {
  title: "Check Your Email",
  robots: { index: false, follow: false },
};

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string; next?: string }> }) {
  const params = await searchParams;
  return (
    <section className="section-shell store-page auth-status-page">
      <div className="site-container auth-status-shell">
        <EmailVerificationCard email={params.email ?? ""} nextPath={params.next ?? "/account/verified"} />
      </div>
    </section>
  );
}

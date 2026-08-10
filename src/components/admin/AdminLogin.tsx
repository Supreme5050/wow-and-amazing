"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, EyeIcon, EyeOffIcon, KeyIcon, ShieldIcon } from "@/components/icons/LineIcons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "create">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function bootstrap(accessToken: string) {
    const response = await fetch("/api/admin/bootstrap", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const payload = await response.json() as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Owner access could not be activated.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase is not configured. Add the keys to .env.local first.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "Store Owner").trim();
    setLoading(true);
    setMessage(mode === "signin" ? "Signing in securely…" : "Creating the owner account…");

    try {
      const result = mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (result.error) throw result.error;
      const session = result.data.session;
      if (!session) {
        setMessage("Account created. Confirm the email from your inbox, then return here and sign in.");
        setMode("signin");
        return;
      }
      await bootstrap(session.access_token);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      await supabase.auth.signOut();
      setMessage(error instanceof Error ? error.message : "Owner sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-showcase">
        <div className="admin-auth-showcase-inner">
          <Link className="admin-auth-showcase-logo" href="/" aria-label="Return to Wow & Amazing">
            <Image src="/brand/logo-reversed.png" alt="Wow & Amazing" width={420} height={160} priority />
          </Link>
          <p className="wa-eyebrow">PRIVATE COMMERCE OPERATIONS</p>
          <h1>Everything your business needs, in one secure place.</h1>
          <p>Manage products, rental properties, orders, Paystack payments, enquiries and customer activity without touching the website code.</p>
          <div className="admin-auth-benefits">
            <span><CheckIcon size={17} /> Protected owner-only access</span>
            <span><CheckIcon size={17} /> Live Supabase business data</span>
            <span><CheckIcon size={17} /> Customer store remains separate</span>
          </div>
          <small className="admin-auth-showcase-note">Wow & Amazing · Owner Control Centre</small>
        </div>
      </section>

      <section className="admin-auth-form-panel">
        <div className="admin-auth-card">
          <Link className="admin-auth-logo" href="/" aria-label="Return to Wow & Amazing">
            <Image src="/brand/logo-full.png" alt="Wow & Amazing" width={1081} height={551} priority />
          </Link>
          <span className="admin-auth-lock"><ShieldIcon size={22} /></span>
          <p className="wa-eyebrow">AUTHORISED OWNER ACCESS</p>
          <h2>{mode === "signin" ? "Welcome back." : "First-time owner setup."}</h2>
          <p className="admin-auth-intro">Only the email configured as <strong>ADMIN_OWNER_EMAIL</strong> can enter this dashboard.</p>

          <div className="admin-auth-tabs">
            <button className={mode === "signin" ? "active" : ""} type="button" onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button>
            <button className={mode === "create" ? "active" : ""} type="button" onClick={() => { setMode("create"); setMessage(""); }}>First-time setup</button>
          </div>

          <form className="admin-auth-form" onSubmit={submit}>
            {mode === "create" ? <label>Owner name<input className="input-field" name="fullName" autoComplete="name" placeholder="Full name" required /></label> : null}
            <label>Owner email<input className="input-field" name="email" type="email" autoComplete="email" placeholder="owner@itsamazing.com.ng" required /></label>
            <label>
              Password
              <div className="password-input-shell">
                <input
                  className="input-field password-input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  minLength={8}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder="Minimum 8 characters"
                  required
                />
                <button
                  className="password-visibility-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </label>
            <button className="button-primary" type="submit" disabled={loading}><KeyIcon size={17} />{loading ? "Please wait…" : mode === "signin" ? "Enter Owner Dashboard" : "Create Owner Account"}</button>
          </form>
          {message ? <p className="admin-form-message" role="status">{message}</p> : null}
          <Link className="admin-back-link" href="/">← Return to customer website</Link>
        </div>
      </section>
    </main>
  );
}

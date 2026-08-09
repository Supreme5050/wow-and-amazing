"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, MailIcon, ShieldIcon } from "@/components/icons/LineIcons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/site-url";

function safeNextPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/account/verified";
  return value;
}

export function EmailVerificationCard({ email, nextPath = "/account/verified" }: { email: string; nextPath?: string }) {
  const [currentEmail, setCurrentEmail] = useState(email);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function resend() {
    const normalizedEmail = currentEmail.trim().toLowerCase();
    if (!normalizedEmail) {
      setMessage("Enter the email address used to create the account.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase account configuration is missing from this website.");
      return;
    }

    setSending(true);
    setMessage("Sending a fresh verification email…");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: normalizedEmail,
        options: {
          emailRedirectTo: getAuthCallbackUrl(safeNextPath(nextPath)),
        },
      });
      if (error) throw error;
      setMessage("A new verification email has been sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend the verification email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="email-verification-card">
      <div className="email-verification-icon"><MailIcon size={30} /></div>
      <p className="wa-eyebrow">CHECK YOUR EMAIL</p>
      <h1>Activate your account</h1>
      <p>We sent a verification link to <strong>{currentEmail || "your email address"}</strong>. Click it to activate your Wow &amp; Amazing account.</p>
      <div className="email-verification-steps">
        <span><CheckIcon size={17} /> Open the newest email from Wow &amp; Amazing</span>
        <span><CheckIcon size={17} /> Click “Confirm Email Address”</span>
        <span><CheckIcon size={17} /> Return automatically to your account or checkout</span>
      </div>
      <div className="email-verification-resend">
        <label>Email address<input className="input-field" type="email" value={currentEmail} onChange={(event) => setCurrentEmail(event.target.value)} /></label>
        <button className="button-primary" type="button" disabled={sending} onClick={() => void resend()}>{sending ? "Sending…" : "Resend Verification Email"}</button>
      </div>
      <div className="email-verification-help"><ShieldIcon size={18} /><span>For security, use only the newest verification link. Older links may expire or stop working after a resend.</span></div>
      {message ? <p className="form-message" role="status">{message}</p> : null}
      <Link className="email-verification-back" href="/account">Use another email or return to sign in</Link>
    </section>
  );
}

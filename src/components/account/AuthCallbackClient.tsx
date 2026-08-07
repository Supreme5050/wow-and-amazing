/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckIcon, MailIcon, ShieldIcon } from "@/components/icons/LineIcons";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const publicDataMode = process.env.NEXT_PUBLIC_DATA_MODE === "live" ? "live" : "test";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/account";
  return value;
}

export function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Confirming your secure account link…");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const nextPath = safeNextPath(searchParams.get("next"));
    const authCode = searchParams.get("code");
    const errorDescription = searchParams.get("error_description") || searchParams.get("error");

    if (!supabase) {
      setState("error");
      setMessage("Supabase account configuration is missing from this website.");
      return;
    }

    if (errorDescription) {
      setState("error");
      setMessage(errorDescription.replaceAll("+", " "));
      return;
    }

    let active = true;

    async function completeCallback() {
      try {
        if (authCode) {
          const { error } = await supabase!.auth.exchangeCodeForSession(authCode);
          if (error) throw error;
        }

        const { data, error } = await supabase!.auth.getSession();
        if (error) throw error;
        if (!data.session) throw new Error("This account link is invalid, expired, or has already been used.");

        if (publicDataMode === "live") {
          await fetch("/api/account/live-profile", {
            method: "POST",
            headers: { Authorization: `Bearer ${data.session.access_token}` },
          }).catch(() => undefined);
        }

        if (!active) return;
        setState("success");
        setMessage("Your secure account link has been confirmed.");
        window.setTimeout(() => router.replace(nextPath), 700);
      } catch (error) {
        if (!active) return;
        setState("error");
        setMessage(error instanceof Error ? error.message : "Unable to confirm this account link.");
      }
    }

    void completeCallback();
    return () => { active = false; };
  }, [router, searchParams]);

  return (
    <section className="auth-callback-card" aria-live="polite">
      <div className={`auth-callback-icon ${state}`}>
        {state === "success" ? <CheckIcon size={30} /> : state === "error" ? <ShieldIcon size={30} /> : <MailIcon size={30} />}
      </div>
      <p className="wa-eyebrow">WOW &amp; AMAZING ACCOUNT</p>
      <h1>{state === "loading" ? "Confirming your link" : state === "success" ? "Account confirmed" : "Link could not be confirmed"}</h1>
      <p>{message}</p>
      {state === "loading" ? <span className="auth-callback-progress" aria-hidden="true" /> : null}
      {state === "error" ? (
        <div className="auth-callback-actions">
          <Link className="button-primary" href="/account?mode=verify">Request a New Verification Link</Link>
          <Link className="button-secondary" href="/account">Return to Sign In</Link>
        </div>
      ) : null}
    </section>
  );
}

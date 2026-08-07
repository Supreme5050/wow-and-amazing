/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { ownerFetch } from "@/lib/admin/client";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Checking owner access…");

  useEffect(() => {
    let active = true;
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Add the Supabase values to .env.local before opening the owner dashboard.");
      return;
    }

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }
      try {
        await ownerFetch("/api/admin/session");
        if (active) setReady(true);
      } catch {
        await supabase.auth.signOut();
        router.replace("/admin/login");
      }
    });

    return () => { active = false; };
  }, [router]);

  if (!ready) {
    return (
      <main className="admin-auth-page">
        <div className="admin-loading-card">
          <span className="admin-spinner" aria-hidden="true" />
          <p>{message}</p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

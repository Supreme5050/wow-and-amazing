import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export async function ownerFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error("Supabase browser configuration is incomplete.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Your owner session has expired. Sign in again.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(url, { ...init, headers, cache: "no-store" });
  const payload = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The owner request could not be completed.");
  return payload;
}

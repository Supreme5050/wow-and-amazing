/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { ArrowRightIcon, BagIcon, BoxIcon, CheckIcon, HeartIcon, HeadphonesIcon, MailIcon, MapPinIcon, ShieldIcon, UserIcon } from "@/components/icons/LineIcons";
import { useStore } from "@/components/store/StoreProvider";
import { orderStatusLabel } from "@/lib/orders/status";
import { formatStoreMoney } from "@/lib/store/currency";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const publicDataMode = process.env.NEXT_PUBLIC_DATA_MODE === "live" ? "live" : "test";
const visibleOrderTestFlag = publicDataMode !== "live";

async function promoteLiveCustomerProfile(accessToken: string | undefined) {
  if (publicDataMode !== "live" || !accessToken) return;
  await fetch("/api/account/live-profile", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  }).catch(() => undefined);
}

type Profile = {
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type AuthMode = "signin" | "signup" | "forgot" | "recovery" | "verify";

type AccountOrder = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  created_at: string;
  order_items: { id: string; product_name: string; qty: number; product_image_url: string | null }[];
};

type AccountAddress = {
  id: string;
  label: string;
  line_1: string;
  city: string;
  state: string | null;
  country: string;
  is_default: boolean;
};

export function AccountClient() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [recentOrders, setRecentOrders] = useState<AccountOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const { wishlistProducts } = useStore();

  const returnTo = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("returnTo") ?? "";
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "recovery") setMode("recovery");
      if (params.get("mode") === "signup") setMode("signup");
      if (params.get("mode") === "verify") {
        setMode("verify");
        setPendingEmail(params.get("email") ?? "");
      }
    }

    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;

    async function loadDashboard(userId: string) {
      const [ordersResult, addressesResult] = await Promise.all([
        client
          .from("orders")
          .select("id, order_number, status, total, created_at, order_items(id, product_name, qty, product_image_url)", { count: "exact" })
          .eq("user_id", userId)
          .eq("is_test_data", visibleOrderTestFlag)
          .order("created_at", { ascending: false })
          .limit(3),
        client
          .from("addresses")
          .select("id, label, line_1, city, state, country, is_default")
          .eq("user_id", userId)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: true })
          .limit(2),
      ]);
      setRecentOrders((ordersResult.data ?? []) as AccountOrder[]);
      setTotalOrders(ordersResult.count ?? 0);
      setAddresses((addressesResult.data ?? []) as AccountAddress[]);
    }

    async function hydrate() {
      const { data } = await client.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: profileRow } = await client
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", data.user.id)
          .maybeSingle();
        setProfile((profileRow as Profile | null) ?? null);
        await loadDashboard(data.user.id);
      }
      setLoading(false);
    }

    void hydrate();
    const { data } = client.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") setMode("recovery");
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileRow } = await client
          .from("profiles")
          .select("full_name, email, phone")
          .eq("id", session.user.id)
          .maybeSingle();
        setProfile((profileRow as Profile | null) ?? null);
        await loadDashboard(session.user.id);
      } else {
        setProfile(null);
        setRecentOrders([]);
        setTotalOrders(0);
        setAddresses([]);
      }
    });

    return () => data.subscription.unsubscribe();
  }, [supabase]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Add your Supabase environment variables to enable account access.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const acceptedTerms = form.get("acceptTerms") === "on";
    setPendingEmail(email);
    setMessage("Please wait…");

    const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account";
    const confirmationNext = safeReturnTo === "/account" ? "/account/verified" : safeReturnTo;
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(confirmationNext)}`;

    if (mode === "forgot") {
      setSendingReset(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/account?mode=recovery")}`,
        });

        if (error) {
          const normalized = error.message.toLowerCase();
          if (normalized.includes("rate limit")) {
            setMessage("Too many reset emails were requested recently. Use the newest reset email already sent, or wait before requesting another link.");
          } else {
            setMessage(error.message);
          }
          return;
        }

        setMessage("A secure Wow & Amazing password-reset link has been sent. Check your inbox and spam folder.");
      } finally {
        setSendingReset(false);
      }
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) {
        setMessage("Use a password with at least eight characters.");
        return;
      }
      if (password !== confirmPassword) {
        setMessage("The two passwords do not match.");
        return;
      }
      if (!acceptedTerms) {
        setMessage("Please accept the Terms and Privacy Policy to create your account.");
        return;
      }

      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: callbackUrl,
          data: { full_name: fullName, phone, data_mode: publicDataMode },
        },
      });

      if (result.error) {
        setMessage(result.error.message);
        return;
      }

      if (result.data.session && result.data.user?.email_confirmed_at) {
        setMessage("Account created and signed in successfully.");
        window.setTimeout(() => router.push(safeReturnTo), 200);
        return;
      }

      const params = new URLSearchParams({ email, next: confirmationNext });
      router.push(`/account/check-email?${params.toString()}`);
      return;
    }

    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) {
      const normalized = result.error.message.toLowerCase();
      if (normalized.includes("email not confirmed") || normalized.includes("not confirmed")) {
        setMode("verify");
        setMessage("Your email still needs to be verified before you can sign in.");
      } else {
        setMessage(result.error.message);
      }
      return;
    }

    if (result.data.user && !result.data.user.email_confirmed_at) {
      setMode("verify");
      setMessage("Verify your email address to finish signing in.");
      return;
    }

    await promoteLiveCustomerProfile(result.data.session?.access_token);
    setMessage("Signed in successfully.");
    window.setTimeout(() => router.push(safeReturnTo), 200);
  }

  async function resendVerification(emailOverride?: string) {
    const verificationEmail = (emailOverride ?? pendingEmail).trim().toLowerCase();
    if (!supabase || !verificationEmail) {
      setMessage("Enter the email address used to create the account first.");
      return;
    }

    setResendingVerification(true);
    setMessage("Sending a fresh verification email…");
    try {
      const safeReturnTo = returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/account/verified";
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: verificationEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeReturnTo)}`,
        },
      });
      if (error) throw error;
      setMessage("A new verification email has been sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend the verification email.");
    } finally {
      setResendingVerification(false);
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !user) return;
    setSavingProfile(true);
    setMessage("Saving your profile…");

    try {
      const form = new FormData(event.currentTarget);
      const fullName = String(form.get("fullName") ?? "").trim();
      const phone = String(form.get("phone") ?? "").trim();
      const requestedEmail = String(form.get("email") ?? "").trim().toLowerCase();

      if (!fullName) throw new Error("Your full name is required.");
      if (!requestedEmail) throw new Error("Your email address is required.");

      const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: fullName } });
      if (metadataError) throw metadataError;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: fullName,
        phone: phone || null,
        email: user.email ?? requestedEmail,
      });
      if (profileError) throw profileError;

      let emailMessage = "";
      if (requestedEmail !== String(user.email ?? "").toLowerCase()) {
        const { error: emailError } = await supabase.auth.updateUser({ email: requestedEmail });
        if (emailError) throw emailError;
        emailMessage = " Check your email to confirm the new address before it becomes active.";
      }

      setProfile({ full_name: fullName, phone: phone || null, email: user.email ?? requestedEmail });
      setMessage(`Profile saved.${emailMessage}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save your profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setSavingPassword(true);
    setMessage("Updating your password…");

    try {
      const form = new FormData(event.currentTarget);
      const password = String(form.get("password") ?? "");
      const confirmPassword = String(form.get("confirmPassword") ?? "");
      if (password.length < 8) throw new Error("Use a password with at least eight characters.");
      if (password !== confirmPassword) throw new Error("The two passwords do not match.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      event.currentTarget.reset();
      setMessage("Your password has been updated securely.");
      if (mode === "recovery") {
        window.history.replaceState({}, "", "/account");
        setMode("signin");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) return <p className="store-loading">Loading account…</p>;

  if (mode === "recovery") {
    return (
      <div className="account-auth-card">
        <p className="wa-eyebrow">PASSWORD RECOVERY</p>
        <h2>Create a new password</h2>
        <p>Use a strong password that you have not used on another website.</p>
        <form onSubmit={changePassword}>
          <label>New password<input className="input-field" name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
          <label>Confirm new password<input className="input-field" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" /></label>
          <button className="button-primary" type="submit" disabled={savingPassword}>{savingPassword ? "Updating…" : "Update Password"}</button>
        </form>
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </div>
    );
  }

  if (user && !user.email_confirmed_at) {
    return (
      <div className="account-verification-shell">
        <div className="account-verification-icon"><MailIcon size={28} /></div>
        <p className="wa-eyebrow">ONE LAST SECURE STEP</p>
        <h1>Verify your email address</h1>
        <p>We sent an activation link to <strong>{user.email}</strong>. Confirm it before using permanent account features or renting a property.</p>
        <div className="account-verification-benefits">
          <span><CheckIcon size={17} /> Keep orders connected to your account</span>
          <span><CheckIcon size={17} /> Save addresses and wishlist items</span>
          <span><CheckIcon size={17} /> Complete verified property rentals</span>
        </div>
        <div className="account-verification-actions">
          <button className="button-primary" type="button" disabled={resendingVerification} onClick={() => { const email = user.email ?? ""; setPendingEmail(email); void resendVerification(email); }}>{resendingVerification ? "Sending…" : "Resend Verification Email"}</button>
          <button className="button-secondary" type="button" onClick={() => supabase?.auth.signOut()}>Use another email</button>
        </div>
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </div>
    );
  }

  if (user) {
    const displayName = profile?.full_name || user.user_metadata?.full_name || user.email || "Customer";
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join("") || "WA";
    const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];

    return (
      <div className="premium-account-layout">
        <aside className="premium-account-sidebar">
          <div className="premium-account-sidebar-heading">
            <span className="premium-account-avatar"><UserIcon size={22} /></span>
            <div><small>MY ACCOUNT</small><strong>{displayName}</strong></div>
          </div>
          <nav className="premium-account-nav" aria-label="Account navigation">
            <Link className="active" href="/account"><BoxIcon size={18} /> Overview</Link>
            <Link href="/account/orders"><BagIcon size={18} /> Orders</Link>
            <Link href="/wishlist"><HeartIcon size={18} /> Wishlist</Link>
            <Link href="/account/addresses"><MapPinIcon size={18} /> Addresses</Link>
            <a href="#profile-settings"><UserIcon size={18} /> Profile Settings</a>
            <Link href="/support"><HeadphonesIcon size={18} /> Support</Link>
          </nav>
          <div className="premium-account-sidebar-card">
            <p className="wa-eyebrow">WOW &amp; AMAZING CARE</p>
            <h3>Shopping made personal.</h3>
            <p>Review orders, saved products, delivery details, and account security in one place.</p>
            <Link href="/category/all">Continue shopping <ArrowRightIcon size={16} /></Link>
          </div>
        </aside>

        <div className="premium-account-content">
          <section className="premium-account-welcome">
            <div className="premium-account-welcome-copy">
              <p className="wa-eyebrow">WELCOME BACK</p>
              <h1>Hello, <em>{displayName.split(" ")[0]}</em></h1>
              <p>Everything connected to your Wow &amp; Amazing shopping experience is organised here.</p>
              <div className="premium-account-stats">
                <div><BagIcon size={20} /><span><small>Total orders</small><strong>{totalOrders}</strong></span></div>
                <div><HeartIcon size={20} /><span><small>Wishlist items</small><strong>{wishlistProducts.length}</strong></span></div>
                <div><MapPinIcon size={20} /><span><small>Saved addresses</small><strong>{addresses.length}</strong></span></div>
              </div>
            </div>
            <div className="premium-account-welcome-art" aria-hidden="true">
              <Image src="/catalog/categories/housing-decor.webp" alt="" fill sizes="(max-width: 900px) 100vw, 45vw" />
              <span className="premium-account-welcome-overlay" />
            </div>
          </section>

          <section className="premium-account-quick-actions" aria-label="Quick account actions">
            <h2>Quick actions</h2>
            <div>
              <Link href="/category/all"><BagIcon size={18} /> Shop products</Link>
              <Link href="/account/orders"><BoxIcon size={18} /> View orders</Link>
              <Link href="/account/addresses"><MapPinIcon size={18} /> Manage addresses</Link>
              <a href="#profile-settings"><UserIcon size={18} /> Update profile</a>
            </div>
          </section>

          <div className="premium-account-commerce-grid">
            <section className="premium-account-panel premium-account-orders-panel">
              <div className="premium-account-panel-heading"><div><p className="wa-eyebrow">RECENT ACTIVITY</p><h2>Recent orders</h2></div><Link href="/account/orders">View all <ArrowRightIcon size={16} /></Link></div>
              {recentOrders.length ? (
                <div className="premium-recent-order-list">
                  {recentOrders.map((order) => {
                    const firstItem = order.order_items[0];
                    const itemCount = order.order_items.reduce((sum, item) => sum + Number(item.qty), 0);
                    return (
                      <article key={order.id}>
                        <div className="premium-recent-order-image">
                          {firstItem?.product_image_url ? <Image src={firstItem.product_image_url} alt={firstItem.product_name} width={72} height={72} unoptimized={firstItem.product_image_url.startsWith("http")} /> : <BoxIcon size={22} />}
                        </div>
                        <div><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })} · {itemCount} {itemCount === 1 ? "item" : "items"}</small></div>
                        <strong>{formatStoreMoney(Number(order.total))}</strong>
                        <span className={`order-status order-status-${order.status}`}>{orderStatusLabel(order.status)}</span>
                        <Link href={`/account/orders/${order.id}`} aria-label={`View ${order.order_number}`}><ArrowRightIcon size={18} /></Link>
                      </article>
                    );
                  })}
                </div>
              ) : <div className="premium-panel-empty"><p>No confirmed orders yet.</p><Link href="/category/all">Start shopping</Link></div>}
            </section>

            <section className="premium-account-panel premium-account-wishlist-panel">
              <div className="premium-account-panel-heading"><div><p className="wa-eyebrow">SAVED FOR LATER</p><h2>Wishlist</h2></div><Link href="/wishlist">View all <ArrowRightIcon size={16} /></Link></div>
              {wishlistProducts.length ? (
                <div className="premium-wishlist-preview">
                  {wishlistProducts.slice(0, 4).map((product) => (
                    <Link href={`/product/${product.slug}`} key={product.id}>
                      <Image src={product.image} alt={product.name} width={200} height={200} unoptimized={product.image.startsWith("http")} />
                      <strong>{product.name}</strong>
                      <span>{formatStoreMoney(product.price)}</span>
                    </Link>
                  ))}
                </div>
              ) : <div className="premium-panel-empty"><p>Your wishlist is ready for products you love.</p><Link href="/category/all">Discover products</Link></div>}
            </section>
          </div>

          <div className="premium-account-detail-grid">
            <section className="premium-account-panel premium-address-preview">
              <div className="premium-account-panel-heading"><div><p className="wa-eyebrow">DELIVERY</p><h2>Saved address</h2></div><Link href="/account/addresses">Manage <ArrowRightIcon size={16} /></Link></div>
              {defaultAddress ? <div className="premium-address-card"><span>Default</span><strong>{defaultAddress.label}</strong><p>{defaultAddress.line_1}<br />{defaultAddress.city}{defaultAddress.state ? `, ${defaultAddress.state}` : ""}<br />{defaultAddress.country}</p></div> : <div className="premium-panel-empty"><p>No delivery address saved.</p><Link href="/account/addresses">Add address</Link></div>}
            </section>

            <section id="profile-settings" className="premium-account-panel premium-account-details-card">
              <div className="premium-account-panel-heading"><div><p className="wa-eyebrow">ACCOUNT DETAILS</p><h2>Your profile</h2></div><span className="premium-account-initials">{initials}</span></div>
              <dl><div><dt>Full name</dt><dd>{displayName}</dd></div><div><dt>Email</dt><dd>{user.email}<span className="account-email-verified"><CheckIcon size={13} /> Verified</span></dd></div><div><dt>Phone</dt><dd>{profile?.phone || "Not added"}</dd></div></dl>
            </section>

            <section className="premium-account-panel premium-account-help-card">
              <p className="wa-eyebrow">NEED HELP?</p><h2>We are here for you.</h2><p>Find answers to common questions or contact support for assistance.</p><Link className="button-secondary" href="/support"><HeadphonesIcon size={18} /> Contact Support</Link>
            </section>
          </div>

          <div className="premium-account-settings" id="account-security">
            <form className="account-settings-card" onSubmit={saveProfile}>
              <div className="account-card-heading"><p className="wa-eyebrow">PROFILE SETTINGS</p><h3>Personal information</h3><p>Keep these details accurate for receipts and delivery communication.</p></div>
              <label>Full name<input className="input-field" name="fullName" defaultValue={profile?.full_name || user.user_metadata?.full_name || ""} required /></label>
              <label>Email address<input className="input-field" name="email" type="email" defaultValue={user.email || profile?.email || ""} required /></label>
              <label>Phone number<input className="input-field" name="phone" type="tel" defaultValue={profile?.phone || ""} placeholder="e.g. +234 800 000 0000" /></label>
              <button className="button-primary" type="submit" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save Profile"}</button>
            </form>

            <form className="account-settings-card" onSubmit={changePassword}>
              <div className="account-card-heading"><p className="wa-eyebrow">SECURITY</p><h3>Change password</h3><p>Your new password must contain at least eight characters.</p></div>
              <label>New password<input className="input-field" name="password" type="password" minLength={8} required autoComplete="new-password" /></label>
              <label>Confirm new password<input className="input-field" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" /></label>
              <button className="button-secondary" type="submit" disabled={savingPassword}>{savingPassword ? "Updating…" : "Change Password"}</button>
            </form>
          </div>

          {message ? <p className="form-message account-page-message" role="status">{message}</p> : null}
          <button className="button-secondary account-signout-button" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-auth-shell">
      <aside className="customer-auth-story">
        <div className="customer-auth-story-overlay" />
        <div className="customer-auth-story-copy">
          <p className="wa-eyebrow">YOUR WOW &amp; AMAZING ACCOUNT</p>
          <h1>Shop freely.<br />Keep everything connected.</h1>
          <p>Browse and buy as a guest, or create a verified account for permanent shopping features and secure property rentals.</p>
          <div className="customer-auth-points">
            <span><BagIcon size={19} /> Order history in one place</span>
            <span><HeartIcon size={19} /> Wishlist saved across devices</span>
            <span><ShieldIcon size={19} /> Verified property rental access</span>
          </div>
        </div>
      </aside>

      <section className="account-auth-card customer-auth-card">
        {mode !== "forgot" && mode !== "verify" ? (
          <div className="account-auth-tabs">
            <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => { setMode("signin"); setMessage(""); }}>Sign in</button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setMessage(""); }}>Create account</button>
          </div>
        ) : null}

        {mode === "verify" ? (
          <div className="customer-auth-special-state">
            <div className="customer-auth-state-icon"><MailIcon size={26} /></div>
            <p className="wa-eyebrow">VERIFY YOUR EMAIL</p>
            <h2>Activate your account</h2>
            <p>Enter the email used to register, then request a fresh verification link.</p>
            <label>Email address<input className="input-field" type="email" value={pendingEmail} onChange={(event) => setPendingEmail(event.target.value)} required /></label>
            <button className="button-primary" type="button" disabled={resendingVerification} onClick={() => void resendVerification()}>{resendingVerification ? "Sending…" : "Resend Verification Email"}</button>
            <button className="account-forgot-button" type="button" onClick={() => { setMode("signin"); setMessage(""); }}>Return to sign in</button>
          </div>
        ) : (
          <>
            <div className="account-card-heading">
              <p className="wa-eyebrow">{mode === "signup" ? "CREATE YOUR ACCOUNT" : mode === "forgot" ? "PASSWORD HELP" : "WELCOME BACK"}</p>
              <h2>{mode === "signup" ? "Join Wow & Amazing" : mode === "forgot" ? "Reset your password" : "Sign in securely"}</h2>
              <p>{mode === "signup" ? "Create one verified account for orders, saved addresses, wishlists, reviews, and rentals." : mode === "forgot" ? "Enter your account email and we will send a secure reset link." : "Access your orders, addresses, wishlist, and account details."}</p>
            </div>
            <form onSubmit={submitAuth}>
              {mode === "signup" ? <label>Full name<input className="input-field" name="fullName" required autoComplete="name" /></label> : null}
              <label>Email address<input className="input-field" name="email" type="email" required autoComplete="email" /></label>
              {mode === "signup" ? <label>Phone number<input className="input-field" name="phone" type="tel" required autoComplete="tel" placeholder="e.g. +234 800 000 0000" /></label> : null}
              {mode !== "forgot" ? <label>Password<input className="input-field" name="password" type="password" minLength={8} required autoComplete={mode === "signin" ? "current-password" : "new-password"} /></label> : null}
              {mode === "signup" ? <label>Confirm password<input className="input-field" name="confirmPassword" type="password" minLength={8} required autoComplete="new-password" /></label> : null}
              {mode === "signup" ? <label className="customer-auth-consent"><input type="checkbox" name="acceptTerms" required /><span>I agree to the <Link href="/support">Terms, Privacy Policy, and account communication required to complete orders.</Link></span></label> : null}
              <button className="button-primary" type="submit" disabled={mode === "forgot" && sendingReset}>{mode === "signin" ? "Sign in" : mode === "signup" ? "Create Account & Verify Email" : sendingReset ? "Sending…" : "Send Reset Link"}</button>
            </form>
            {mode === "signin" ? <button className="account-forgot-button" type="button" onClick={() => { setMode("forgot"); setMessage(""); }}>Forgot your password?</button> : null}
            {mode === "forgot" ? <button className="account-forgot-button" type="button" onClick={() => { setMode("signin"); setMessage(""); }}>Return to sign in</button> : null}
          </>
        )}

        <div className="customer-auth-assurance"><ShieldIcon size={18} /><span>Secure authentication powered by Supabase. Payment details are handled separately by Paystack.</span></div>
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </section>
    </div>
  );
}

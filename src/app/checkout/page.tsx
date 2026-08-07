"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckIcon, HomeIcon, MailIcon, MapPinIcon, ShieldIcon, TruckIcon } from "@/components/icons/LineIcons";
import { useStore } from "@/components/store/StoreProvider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatStoreMoney, STORE_CURRENCY } from "@/lib/store/currency";
import { isRentalProduct } from "@/lib/catalog/rentals";

type CheckoutAddress = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type SavedAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  line_1: string;
  line_2: string | null;
  city: string;
  state: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
};

type ProfileDefaults = { fullName: string; email: string; phone: string };

export default function CheckoutPage() {
  const { detailedCart, cartSubtotal } = useStore();
  const [address, setAddress] = useState<CheckoutAddress | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [profileDefaults, setProfileDefaults] = useState<ProfileDefaults>({ fullName: "", email: "", phone: "" });
  const [userId, setUserId] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [useManualAddress, setUseManualAddress] = useState(true);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);
  const [stockRefreshRequired, setStockRefreshRequired] = useState(false);

  const containsRental = detailedCart.some((item) => isRentalProduct(item.product));
  const containsMerchandise = detailedCart.some((item) => !isRentalProduct(item.product));
  const rentalOnly = containsRental && !containsMerchandise;
  const mixedCheckout = containsRental && containsMerchandise;
  const merchandiseSubtotal = detailedCart.filter((item) => !isRentalProduct(item.product)).reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = merchandiseSubtotal === 0 || merchandiseSubtotal >= 50 ? 0 : 5;
  const total = cartSubtotal + shipping;
  const itemPayload = useMemo(() => detailedCart.map((item) => ({ productId: item.productId, variantId: item.variantId, qty: isRentalProduct(item.product) ? 1 : item.qty })), [detailedCart]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      window.setTimeout(() => setAuthReady(true), 0);
      return;
    }

    let active = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      const currentUser = data.user;
      setAccountEmail(currentUser?.email ?? "");
      setEmailVerified(Boolean(currentUser?.email_confirmed_at));
      setUserId(currentUser?.id ?? "");

      if (!currentUser) {
        setAuthReady(true);
        return;
      }

      const [profileResult, addressResult] = await Promise.all([
        supabase.from("profiles").select("full_name, email, phone").eq("id", currentUser.id).maybeSingle(),
        supabase.from("addresses").select("id, label, full_name, phone, line_1, line_2, city, state, postal_code, country, is_default").order("is_default", { ascending: false }).order("created_at", { ascending: true }),
      ]);

      if (!active) return;
      setProfileDefaults({
        fullName: String(profileResult.data?.full_name ?? currentUser.user_metadata?.full_name ?? ""),
        email: String(currentUser.email ?? profileResult.data?.email ?? ""),
        phone: String(profileResult.data?.phone ?? currentUser.user_metadata?.phone ?? ""),
      });

      const rows = (addressResult.data ?? []) as SavedAddress[];
      setSavedAddresses(rows);
      if (rows.length) {
        setSelectedAddressId(rows.find((entry) => entry.is_default)?.id ?? rows[0].id);
        setUseManualAddress(false);
      }
      setAuthReady(true);
    }).catch(() => {
      if (active) setAuthReady(true);
    });

    return () => { active = false; };
  }, []);

  async function resendRentalVerification() {
    if (!accountEmail) {
      setMessage("Sign in with the email used for your customer account first.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase account configuration is missing from this website.");
      return;
    }

    setResendingVerification(true);
    setMessage("Sending a fresh verification email…");
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: accountEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/checkout")}`,
        },
      });
      if (error) throw error;
      setMessage("A fresh verification email has been sent. Check your inbox and spam folder.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to resend the verification email.");
    } finally {
      setResendingVerification(false);
    }
  }

  function continueWithSavedAddress() {
    const selected = savedAddresses.find((entry) => entry.id === selectedAddressId);
    if (!selected) {
      setMessage("Choose a saved address before continuing.");
      return;
    }
    setAddress({
      fullName: selected.full_name,
      email: profileDefaults.email,
      phone: selected.phone || profileDefaults.phone,
      line1: selected.line_1,
      line2: selected.line_2 || "",
      city: selected.city,
      state: selected.state || "",
      postalCode: selected.postal_code || "",
      country: selected.country,
    });
    setMessage("");
    setStep(2);
  }

  async function saveManualAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextAddress: CheckoutAddress = {
      fullName: String(form.get("fullName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      line1: String(form.get("line1") ?? "").trim(),
      line2: String(form.get("line2") ?? "").trim(),
      city: String(form.get("city") ?? "").trim(),
      state: String(form.get("state") ?? "").trim(),
      postalCode: String(form.get("postalCode") ?? "").trim(),
      country: String(form.get("country") ?? "").trim(),
    };

    if (userId && form.get("saveAddress") === "on") {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase!.from("addresses").insert({
        user_id: userId,
        label: String(form.get("label") ?? (rentalOnly ? "Current address" : "Delivery")).trim() || (rentalOnly ? "Current address" : "Delivery"),
        full_name: nextAddress.fullName,
        phone: nextAddress.phone || null,
        line_1: nextAddress.line1,
        line_2: nextAddress.line2 || null,
        city: nextAddress.city,
        state: nextAddress.state || null,
        postal_code: nextAddress.postalCode || null,
        country: nextAddress.country,
        is_default: savedAddresses.length === 0,
      });
      if (error) setMessage(`These details can be used for this checkout, but they could not be saved: ${error.message}`);
    }

    setAddress(nextAddress);
    setStep(2);
  }

  async function pay() {
    if (!address || detailedCart.length === 0) return;
    setProcessing(true);
    setMessage("Preparing your secure Paystack payment…");

    try {
      const session = await getSupabaseBrowserClient()?.auth.getSession();
      const accessToken = session?.data.session?.access_token;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const result = await fetch("/api/payments/paystack/initialize", {
        method: "POST",
        headers,
        body: JSON.stringify({ email: address.email, address, items: itemPayload }),
      });
      const payload = await result.json() as { authorizationUrl?: string; error?: string };
      if (!result.ok || !payload.authorizationUrl) throw new Error(payload.error || "Payment could not be initialized.");
      window.location.assign(payload.authorizationUrl);
    } catch (error) {
      setProcessing(false);
      const rawMessage = error instanceof Error ? error.message : "Payment could not be initialized.";
      const normalized = rawMessage.toLowerCase();
      if (normalized.includes("not have enough stock") || normalized.includes("out of stock") || normalized.includes("stock") || normalized.includes("reserved") || normalized.includes("rented")) {
        setStockRefreshRequired(true);
        setMessage(containsRental ? "A selected property or product is no longer available. Refresh the cart to load the latest availability before paying." : "One of the items in your cart is no longer available in the requested quantity. Refresh the cart to load the latest stock before paying.");
      } else {
        setMessage(rawMessage);
      }
    }
  }

  if (detailedCart.length === 0 && step !== 4) {
    return <section className="section-shell store-page"><div className="site-container"><div className="empty-store-state store-empty-card"><h1>Your cart is empty.</h1><p>Add a product or available property before starting checkout.</p><Link className="button-primary" href="/category/all">Browse the Store</Link></div></div></section>;
  }

  if (containsRental && !authReady) {
    return <section className="section-shell store-page"><div className="site-container"><p className="store-loading">Checking your rental account…</p></div></section>;
  }

  if (containsRental && (!userId || !emailVerified)) {
    const signedInButUnverified = Boolean(userId && !emailVerified);
    return (
      <section className="section-shell store-page rental-auth-page">
        <div className="site-container rental-auth-shell">
          <div className="rental-auth-card">
            <div className="rental-auth-icon">{signedInButUnverified ? <MailIcon size={30} /> : <ShieldIcon size={30} />}</div>
            <p className="wa-eyebrow">VERIFIED RENTAL CHECKOUT</p>
            <h1>{signedInButUnverified ? "Verify your email to continue" : "Sign in before renting a property"}</h1>
            <p>{signedInButUnverified ? <>We need to confirm <strong>{accountEmail}</strong> before accepting a property reservation or rental payment.</> : "Product shopping supports guest checkout, but property rentals require a verified customer account to reduce fake reservations and protect both parties."}</p>
            <div className="rental-auth-benefits">
              <span><CheckIcon size={17} /> Rental connected to a real customer account</span>
              <span><CheckIcon size={17} /> Secure order and payment history</span>
              <span><CheckIcon size={17} /> Reliable contact and property communication</span>
            </div>
            <div className="rental-auth-actions">
              {signedInButUnverified ? (
                <>
                  <button className="button-primary" type="button" disabled={resendingVerification} onClick={() => void resendRentalVerification()}>{resendingVerification ? "Sending…" : "Resend Verification Email"}</button>
                  <Link className="button-secondary" href="/account?returnTo=/checkout">Open Account</Link>
                </>
              ) : (
                <>
                  <Link className="button-primary" href="/account?returnTo=/checkout">Sign In to Continue</Link>
                  <Link className="button-secondary" href="/account?returnTo=/checkout&mode=signup">Create a Verified Account</Link>
                </>
              )}
            </div>
            {message ? <p className="form-message" role="status">{message}</p> : null}
          </div>
          <aside className="rental-auth-summary">
            <p className="wa-eyebrow">YOUR RENTAL SELECTION</p>
            {detailedCart.filter((item) => isRentalProduct(item.product)).map((item) => <div key={`${item.productId}:${item.variantId}`}><span><strong>{item.product.name}</strong><small>{item.product.rentalLocation ?? "Property rental"}</small></span><strong>{formatStoreMoney(item.lineTotal)}</strong></div>)}
            <p>Your rental remains in the cart while you sign in or verify your email.</p>
          </aside>
        </div>
      </section>
    );
  }

  const steps = rentalOnly ? ["1. Contact", "2. Rental Details", "3. Payment & Review", "4. Confirm"] : mixedCheckout ? ["1. Contact & Delivery", "2. Fulfilment", "3. Payment & Review", "4. Confirm"] : ["1. Address", "2. Shipping", "3. Payment & Review", "4. Confirm"];

  return (
    <section className="section-shell store-page">
      <div className="site-container">
        <div className="store-page-heading"><p className="wa-eyebrow">{rentalOnly ? "SECURE RENTAL CHECKOUT" : "SECURE CHECKOUT"}</p><h1 className="wa-section-heading">{rentalOnly ? "Rent this property" : "Checkout"}</h1><p>{rentalOnly ? "Contact details, property confirmation, secure payment, and confirmation." : mixedCheckout ? "Contact, delivery, rental confirmation, payment, review, and confirmation." : "Address, shipping, payment, review, and confirmation."}</p></div>
        <ol className="checkout-steps">{steps.map((label, index) => <li className={step >= index + 1 ? "active" : ""} key={label}>{label}</li>)}</ol>

        {step === 1 ? (
          <div className="checkout-address-stage">
            {savedAddresses.length ? (
              <section className="checkout-saved-addresses">
                <div className="checkout-address-stage-heading"><div><p className="wa-eyebrow">SAVED DETAILS</p><h2>{rentalOnly ? "Choose your contact address" : "Choose where to deliver"}</h2></div><Link href="/account/addresses">Manage addresses</Link></div>
                <div className="checkout-address-choice-grid">
                  {savedAddresses.map((saved) => (
                    <label className={selectedAddressId === saved.id && !useManualAddress ? "checkout-address-choice selected" : "checkout-address-choice"} key={saved.id}>
                      <input type="radio" name="savedAddress" checked={selectedAddressId === saved.id && !useManualAddress} onChange={() => { setSelectedAddressId(saved.id); setUseManualAddress(false); }} />
                      {rentalOnly ? <HomeIcon size={20} /> : <MapPinIcon size={20} />}
                      <span><strong>{saved.label}{saved.is_default ? " · Default" : ""}</strong><small>{saved.full_name}<br />{saved.line_1}, {saved.city}{saved.state ? `, ${saved.state}` : ""}</small></span>
                    </label>
                  ))}
                  <label className={useManualAddress ? "checkout-address-choice selected" : "checkout-address-choice"}>
                    <input type="radio" name="savedAddress" checked={useManualAddress} onChange={() => setUseManualAddress(true)} />
                    {rentalOnly ? <HomeIcon size={20} /> : <MapPinIcon size={20} />}
                    <span><strong>Use different details</strong><small>{rentalOnly ? "Enter your renter contact and current address." : "Enter a new delivery location for this order."}</small></span>
                  </label>
                </div>
                {!useManualAddress ? <button className="button-primary checkout-address-continue" type="button" onClick={continueWithSavedAddress}>Continue with Selected Details</button> : null}
              </section>
            ) : userId ? <div className="checkout-account-note"><strong>No saved addresses yet.</strong><p>Complete the form below and choose “Save these details” to keep them for your next checkout.</p></div> : <div className="checkout-account-note"><strong>Have an account?</strong><p><Link href="/account?returnTo=/checkout">Sign in</Link> before checkout to use saved details and connect the order to your account.</p></div>}

            {useManualAddress ? (
              <form className="checkout-form" onSubmit={saveManualAddress} key={`${profileDefaults.email}-${userId}`}>
                <div className="checkout-address-stage-heading"><div><p className="wa-eyebrow">{rentalOnly ? "RENTER DETAILS" : mixedCheckout ? "CONTACT & DELIVERY DETAILS" : "DELIVERY DETAILS"}</p><h2>{rentalOnly ? "Who is renting this property?" : savedAddresses.length ? "Use another address" : "Where should we deliver?"}</h2></div></div>
                <div className="checkout-field-grid">
                  {userId ? <label>Details label<input className="input-field" name="label" defaultValue={rentalOnly ? "Current address" : "Home"} placeholder={rentalOnly ? "Current address" : "Home, Office, Studio"} /></label> : null}
                  <label>Full name<input className="input-field" name="fullName" defaultValue={profileDefaults.fullName} required /></label>
                  <label>Email address<input className="input-field" name="email" type="email" defaultValue={profileDefaults.email} readOnly={containsRental && Boolean(userId)} required />{containsRental && userId ? <small className="checkout-verified-email-note"><CheckIcon size={13} /> Verified account email</small> : null}</label>
                  <label>Phone<input className="input-field" name="phone" defaultValue={profileDefaults.phone} required /></label>
                  <label>Country<input className="input-field" name="country" defaultValue="Nigeria" required /></label>
                  <label className="wide">{rentalOnly ? "Current address line 1" : "Address line 1"}<input className="input-field" name="line1" required /></label>
                  <label className="wide">{rentalOnly ? "Current address line 2" : "Address line 2"}<input className="input-field" name="line2" /></label>
                  <label>City<input className="input-field" name="city" required /></label>
                  <label>State<input className="input-field" name="state" required /></label>
                  <label>Postal code<input className="input-field" name="postalCode" /></label>
                </div>
                {userId ? <label className="checkout-save-address"><input type="checkbox" name="saveAddress" /><span><strong>Save these details</strong><small>Make checkout faster next time.</small></span></label> : null}
                <button className="button-primary" type="submit">{rentalOnly ? "Continue to Rental Details" : mixedCheckout ? "Continue to Fulfilment" : "Continue to Shipping"}</button>
              </form>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="checkout-panel checkout-fulfilment-panel">
            <h2>{rentalOnly ? "Rental details" : mixedCheckout ? "Order fulfilment" : "Shipping"}</h2>
            {containsRental ? <div className="shipping-option rental-fulfilment-option"><input type="radio" checked readOnly /><HomeIcon size={22} /><span><strong>Secure full rental payment</strong><small>No shipping charge applies. Property availability is confirmed again before Paystack opens.</small></span></div> : null}
            {containsMerchandise ? <div className="shipping-option"><input type="radio" checked readOnly /><TruckIcon size={22} /><span><strong>{shipping === 0 ? "Free Shipping" : "Standard Delivery"}</strong><small>{shipping === 0 ? "Your physical-product order qualifies for free shipping." : formatStoreMoney(shipping)}</small></span></div> : null}
            <div className="checkout-panel-actions"><button className="button-secondary" type="button" onClick={() => setStep(1)}>Back</button><button className="button-primary" type="button" onClick={() => setStep(3)}>Continue to Payment</button></div>
          </div>
        ) : null}

        {step === 3 ? <div className="checkout-review-grid"><div className="checkout-panel"><h2>{rentalOnly ? "Review your rental" : "Review your order"}</h2>{detailedCart.map((item) => { const rental = isRentalProduct(item.product); return <div className="checkout-review-item" key={`${item.productId}:${item.variantId}`}><span>{item.product.name}{rental ? "" : ` × ${item.qty}`}<small>{rental ? `${item.product.rentalLocation ?? "Rental property"} · Single listing` : `${item.variantName}${item.stockQty <= 5 ? ` · Only ${item.stockQty} left` : ""}`}</small></span><strong>{formatStoreMoney(item.lineTotal)}</strong></div>; })}{shipping > 0 ? <div className="checkout-review-item"><span>Standard delivery<small>Physical products only</small></span><strong>{formatStoreMoney(shipping)}</strong></div> : null}<div className="checkout-review-total"><span>Total</span><strong>{formatStoreMoney(total)}</strong></div><p>Payment is processed securely by Paystack in {STORE_CURRENCY}. {containsRental ? "Rental availability is validated on the server immediately before payment." : ""}</p>{stockRefreshRequired ? <div className="checkout-stock-alert" role="alert"><strong>Cart update required</strong><p>{message}</p><div><button className="button-primary" type="button" onClick={() => window.location.reload()}>Refresh Latest Availability</button><Link className="button-secondary" href="/cart">Review Cart</Link></div></div> : null}<div className="checkout-panel-actions"><button className="button-secondary" type="button" onClick={() => setStep(2)}>Back</button><button className="button-primary" type="button" disabled={processing || stockRefreshRequired} onClick={pay}>{processing ? "Processing…" : rentalOnly ? "Pay rent securely" : "Pay now"}</button></div>{message && !stockRefreshRequired ? <p className="form-message" role="status">{message}</p> : null}</div><aside className="checkout-address-summary"><h2>{rentalOnly ? "Renter details" : mixedCheckout ? "Contact & delivery details" : "Delivery address"}</h2><p><strong>{address?.fullName}</strong><br />{address?.line1}<br />{address?.line2 ? <>{address.line2}<br /></> : null}{address?.city}, {address?.state}<br />{address?.country}<br />{address?.phone}<br />{address?.email}</p><button type="button" onClick={() => setStep(1)}>Change details</button></aside></div> : null}

        {step === 4 ? <div className="checkout-confirmation"><p className="wa-eyebrow">{rentalOnly ? "RENTAL CONFIRMED" : "ORDER CONFIRMED"}</p><h2>{rentalOnly ? "Your rental payment is confirmed." : "Thank you for your order."}</h2><p>{message}</p><Link className="button-primary" href="/account/orders">View your orders</Link></div> : null}
      </div>
    </section>
  );
}

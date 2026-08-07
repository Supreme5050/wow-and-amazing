"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setSuccess(false);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json() as { error?: string; alreadySubscribed?: boolean };
      if (!response.ok) throw new Error(payload.error || "Unable to subscribe right now.");
      setSuccess(true);
      setMessage(payload.alreadySubscribed ? "You are already on the Wow & Amazing list." : "Thank you. You are now subscribed.");
      setEmail("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form className="footer-newsletter-form" onSubmit={submit}>
        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input
          className="input-field footer-newsletter-input"
          id="newsletter-email"
          name="email"
          type="email"
          placeholder="Email address"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button className="button-primary footer-subscribe-button" type="submit" disabled={submitting}>{submitting ? "Subscribing…" : "Subscribe"}</button>
      </form>
      {message ? <div className={success ? "newsletter-toast success" : "newsletter-toast error"} role="status">{message}</div> : null}
    </>
  );
}

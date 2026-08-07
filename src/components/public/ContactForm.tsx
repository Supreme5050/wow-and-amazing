"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const payload = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Your message could not be sent.");
      setMessage(payload.message || "Thank you. Your message has been received.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your message could not be sent.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-grid">
        <label>Full name<input className="input-field" name="fullName" required /></label>
        <label>Email address<input className="input-field" name="email" type="email" required /></label>
        <label>Phone number<input className="input-field" name="phone" type="tel" /></label>
        <label>Subject<input className="input-field" name="subject" required /></label>
      </div>
      <label>Message<textarea className="input-field service-message-field" name="message" rows={7} minLength={10} required /></label>
      <button className="button-primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Send Message"}</button>
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </form>
  );
}

"use client";

import { FormEvent, useState } from "react";
import type { ServiceRecord } from "@/lib/services/server";

export function ServiceInquiryForm({ services, initialSlug = "" }: { services: ServiceRecord[]; initialSlug?: string }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/service-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(payload.error || "Your enquiry could not be submitted.");
      setMessage(payload.message || "Your enquiry has been received. We will contact you shortly.");
      form.reset();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Your enquiry could not be submitted.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="service-inquiry-form" onSubmit={submit}>
      <div className="service-form-heading">
        <p className="wa-eyebrow">REQUEST A SERVICE</p>
        <h2>Tell us the service you need.</h2>
        <p>Share the essentials below. The owner will review your request and respond with the next steps.</p>
      </div>

      <div className="service-form-grid">
        <label>Full name<input className="input-field" name="fullName" required /></label>
        <label>Email address<input className="input-field" name="email" type="email" required /></label>
        <label>Phone number<input className="input-field" name="phone" type="tel" /></label>
        <label>Company or brand<input className="input-field" name="company" /></label>
        <label>Service
          <select className="input-field" name="serviceSlug" defaultValue={initialSlug} required>
            <option value="" disabled>Select a service</option>
            {services.map((service) => <option value={service.slug} key={service.id}>{service.title}</option>)}
          </select>
        </label>
        <label>Estimated budget
          <select className="input-field" name="budget" defaultValue="">
            <option value="">Prefer to discuss</option>
            <option value="Below ₦100,000">Below ₦100,000</option>
            <option value="₦100,000 – ₦300,000">₦100,000 – ₦300,000</option>
            <option value="₦300,000 – ₦750,000">₦300,000 – ₦750,000</option>
            <option value="Above ₦750,000">Above ₦750,000</option>
          </select>
        </label>
        <label>Preferred date<input className="input-field" name="preferredDate" type="date" /></label>
      </div>

      <label>Request details<textarea className="input-field service-message-field" name="message" rows={6} minLength={20} required placeholder="Describe the service, quantity or property, location, preferred date, rental period where applicable, and anything else that will help us understand your request." /></label>
      <button className="button-primary" type="submit" disabled={sending}>{sending ? "Sending…" : "Send Enquiry"}</button>
      {message ? <p className="form-message" role="status">{message}</p> : null}
    </form>
  );
}

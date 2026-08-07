import type { Metadata } from "next";
import { ContactForm } from "@/components/public/ContactForm";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <section className="section-shell public-contact-section">
      <div className="site-container public-contact-grid">
        <div className="public-contact-copy">
          <p className="wa-eyebrow">CONTACT</p>
          <h1 className="wa-section-heading">How can we help?</h1>
          <p>Use this form for store questions, partnerships, order support, or general enquiries. For a creative-service request, the dedicated service enquiry form will collect the details needed for a quotation.</p>
          <div className="contact-guidance-card"><strong>Order assistance</strong><p>Include your order number when contacting us about an existing purchase.</p></div>
          <div className="contact-guidance-card"><strong>Creative services</strong><p>Use the Services page to select a service, budget range, and preferred date.</p></div>
          <div className="contact-guidance-card"><strong>Response handling</strong><p>Your message enters the private owner inbox and is not displayed publicly.</p></div>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

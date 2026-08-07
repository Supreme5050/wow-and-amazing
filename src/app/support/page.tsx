import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Help & Support" };

const faqs = [
  ["How do I know whether my order was successful?", "A successful payment creates an order number and displays a confirmation page. You can also find the order in your account or use Track Order with the order number and email address."],
  ["Can I buy more than one product at a time?", "Yes. Add as many available products and quantities as needed, then review everything in the cart before checkout."],
  ["How do product options work?", "Options are versions of the same product, such as size, colour, bundle, or Standard. Stock is tracked separately for each option."],
  ["How can I request a creative service?", "Open the Services page, choose the relevant service, and submit the project enquiry form. The owner will respond with the scope, quotation, and next steps."],
  ["Do I need an account to track an order?", "No. The Track Order page uses the order number and purchase email address."],
  ["What happens when an item is out of stock?", "The item cannot be added beyond its available quantity. Stock is reduced automatically after verified payment."],
];

export default function SupportPage() {
  return (
    <>
      <section className="public-page-hero support-hero">
        <div className="site-container public-page-hero-inner">
          <p className="wa-eyebrow">HELP &amp; SUPPORT</p>
          <h1>Answers when you need them.</h1>
          <p>Find guidance for shopping, payment, orders, accounts, delivery information, and creative-service enquiries.</p>
          <div className="public-cta-actions"><Link className="button-primary" href="/track-order">Track Order</Link><Link className="button-secondary" href="/contact">Contact Support</Link></div>
        </div>
      </section>
      <section className="section-shell faq-section">
        <div className="site-container faq-shell">
          <div className="section-heading-copy"><p className="wa-eyebrow">FREQUENTLY ASKED QUESTIONS</p><h2 className="wa-section-heading">Helpful information, clearly explained.</h2></div>
          <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </div>
      </section>
      <section className="section-shell support-policy-section">
        <div className="site-container support-policy-grid">
          <article id="privacy"><p className="wa-eyebrow">PRIVACY</p><h2>How information is used</h2><p>Customer and enquiry details are used to operate the store, process purchases, deliver orders, respond to requests, prevent fraud, and maintain required business records. Sensitive payment-card details are handled by the payment provider rather than stored by this website.</p></article>
          <article id="terms"><p className="wa-eyebrow">TERMS</p><h2>Store conditions</h2><p>Product availability, prices, service scope, delivery timing, and quotations may change before an order or service engagement is confirmed. A purchase becomes confirmed only after successful payment verification and order creation.</p></article>
          <article id="shipping-returns"><p className="wa-eyebrow">SHIPPING &amp; RETURNS</p><h2>Delivery and issue resolution</h2><p>Delivery details and timing are confirmed using the address supplied at checkout. Customers should report incorrect, damaged, or missing items promptly through Contact Support with the order number and supporting information.</p></article>
        </div>
      </section>
    </>
  );
}

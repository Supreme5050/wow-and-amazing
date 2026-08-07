import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <>
      <section className="public-page-hero">
        <div className="site-container public-page-hero-inner">
          <p className="wa-eyebrow">ABOUT WOW &amp; AMAZING</p>
          <h1>Exceptional quality. Endless possibilities.</h1>
          <p>Wow &amp; Amazing brings premium products and creative services together in one carefully managed destination.</p>
        </div>
      </section>
      <section className="section-shell public-story-section">
        <div className="site-container public-story-grid">
          <article>
            <p className="wa-eyebrow">OUR PURPOSE</p>
            <h2 className="wa-section-heading">A one-owner brand built around trust.</h2>
            <p>This store is operated by one authorised owner who selects the products, manages every order, and oversees each creative-service enquiry. That structure keeps responsibility clear and the customer experience personal.</p>
            <p>Our goal is to offer useful products, strong presentation, secure purchasing, and responsive support without the confusion of a multi-vendor marketplace.</p>
          </article>
          <div className="public-values-grid">
            <article><span>01</span><h3>Quality</h3><p>Products and services are selected and presented with care.</p></article>
            <article><span>02</span><h3>Clarity</h3><p>Pricing, availability, order progress, and service scope are communicated plainly.</p></article>
            <article><span>03</span><h3>Responsibility</h3><p>One owner remains accountable for the operation of the store.</p></article>
            <article><span>04</span><h3>Possibility</h3><p>The catalog and service offering can grow without losing the brand standard.</p></article>
          </div>
        </div>
      </section>
      <section className="section-shell public-cta-section">
        <div className="site-container public-cta-card">
          <div><p className="wa-eyebrow">EXPLORE MORE</p><h2>Products to shop. Services to build with.</h2></div>
          <div className="public-cta-actions"><Link className="button-primary" href="/category/all">Shop Products</Link><Link className="button-secondary" href="/services">Explore Services</Link></div>
        </div>
      </section>
    </>
  );
}

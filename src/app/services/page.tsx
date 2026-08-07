import type { Metadata } from "next";
import Link from "next/link";
import { CameraIcon, ContentIcon, PackageIcon, StylingIcon } from "@/components/icons/LineIcons";
import { ServiceInquiryForm } from "@/components/services/ServiceInquiryForm";
import { getActiveServices } from "@/lib/services/server";
import { formatStoreMoney } from "@/lib/store/currency";

export const metadata: Metadata = {
  title: "Services",
  description: "Food and catering, property and home services, media production, and equipment rentals by Wow & Amazing.",
};

const icons = [CameraIcon, PackageIcon, ContentIcon, StylingIcon];

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const services = await getActiveServices();
  const { service = "" } = await searchParams;

  return (
    <>
      <section className="services-hero">
        <div className="site-container services-hero-inner">
          <p className="wa-eyebrow">OUR SERVICES</p>
          <h1>Practical services, clearly organised.</h1>
          <p>Choose food and catering, property and home support, media production, or gadget and equipment rentals from one professional service page.</p>
          <a className="button-primary" href="#service-enquiry">Request a Service</a>
        </div>
      </section>

      <section className="section-shell services-listing-section">
        <div className="site-container">
          <div className="services-page-grid">
            {services.map((item, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article className="services-page-card" id={item.slug} key={item.id}>
                  <div className="services-page-icon"><Icon size={28} /></div>
                  <p className="wa-eyebrow">SERVICE {String(index + 1).padStart(2, "0")}</p>
                  <h2>{item.title}</h2>
                  <p className="services-page-short">{item.shortDescription}</p>
                  <p>{item.description}</p>
                  {item.deliverables.length ? (
                    <div className="service-deliverables">
                      <strong>Typical deliverables</strong>
                      <ul>{item.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}</ul>
                    </div>
                  ) : null}
                  <div className="service-card-meta">
                    <span>{item.priceFrom === null ? "Custom quotation" : `From ${formatStoreMoney(item.priceFrom)}`}</span>
                    <span>{item.turnaround || "Timeline confirmed after consultation"}</span>
                  </div>
                  <Link className="button-secondary" href={`/services?service=${encodeURIComponent(item.slug)}#service-enquiry`}>Enquire About This Service</Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell service-process-section">
        <div className="site-container">
          <div className="section-heading-copy service-process-heading">
            <p className="wa-eyebrow">HOW IT WORKS</p>
            <h2 className="wa-section-heading">Clear steps. Thoughtful execution.</h2>
          </div>
          <div className="service-process-grid">
            <article><span>01</span><h3>Share your need</h3><p>Tell us the service, timeline, location, and outcome you have in mind.</p></article>
            <article><span>02</span><h3>Receive the scope</h3><p>The owner reviews the request and confirms the deliverables, price, and schedule.</p></article>
            <article><span>03</span><h3>Production begins</h3><p>Work starts after the agreed scope, payment terms, and schedule are confirmed.</p></article>
            <article><span>04</span><h3>Review and delivery</h3><p>You receive the agreed work, revisions where included, and the final approved files.</p></article>
          </div>
        </div>
      </section>

      <section className="section-shell service-enquiry-section" id="service-enquiry">
        <div className="site-container service-enquiry-shell">
          <ServiceInquiryForm services={services} initialSlug={service} />
        </div>
      </section>
    </>
  );
}

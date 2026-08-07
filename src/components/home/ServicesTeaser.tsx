"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, CameraIcon, ContentIcon, PackageIcon, StylingIcon } from "@/components/icons/LineIcons";
import { services } from "@/data/catalog";
import { SectionHeading } from "@/components/home/SectionHeading";
import { Reveal } from "@/components/motion/MotionPrimitives";

const serviceIcons = { camera: CameraIcon, package: PackageIcon, content: ContentIcon, styling: StylingIcon };
const serviceImages: Record<string, string> = {
  "food-catering": "/experience/food-poster.jpg",
  "property-home-services": "/experience/home-decor-poster.jpg",
  "media-production": "/experience/creators-poster.jpg",
  "gadget-equipment-rentals": "/catalog/categories/cinematography.webp",
};

export function ServicesTeaser() {
  return (
    <section className="section-shell home-section services-teaser" aria-labelledby="services-heading">
      <div className="site-container">
        <Reveal><SectionHeading eyebrow="OUR SERVICES" heading="Four clear service areas. One trusted owner." headingId="services-heading" /></Reveal>
        <div className="services-grid services-visual-grid">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <Link className="service-card service-visual-card" href={`/services?service=${service.slug}#service-enquiry`} key={service.slug}>
                <div className="service-card-media">
                  <Image src={serviceImages[service.slug]} alt="" fill sizes="(max-width: 640px) 86vw, (max-width: 1024px) 46vw, 25vw" />
                </div>
                <div className="service-card-shade" aria-hidden="true" />
                <div className="service-card-content">
                  <span className="service-icon-wrap" aria-hidden="true"><Icon size={22} /></span>
                  <div>
                    <p className="service-card-kicker">Wow &amp; Amazing service</p>
                    <h3>{service.title}</h3>
                    <p className="service-card-description">{service.description}</p>
                    <span className="service-card-link">Open service <ArrowRightIcon size={17} /></span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

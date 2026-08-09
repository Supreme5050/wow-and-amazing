"use client";

import Image from "next/image";
import Link from "next/link";
import { publicDepartments } from "@/data/publicDepartments";
import { StaggerGroup, StaggerItem } from "@/components/motion/MotionPrimitives";

const mobileLabels: Record<string, string> = {
  "gadgets-accessories": "Gadgets",
  "food-catering": "Food & Catering",
  "property-home-services": "Property & Home",
  "media-gadget-rentals": "Media & Rentals",
};

export function CategorySection() {
  return (
    <section className="home-category-ribbon" aria-label="Explore departments">
      <div className="site-container mobile-department-heading">
        <strong>Shop departments</strong>
        <Link href="/category/all">View all <span aria-hidden="true">→</span></Link>
      </div>
      <StaggerGroup className="site-container home-category-ribbon-inner" amount={0.12}>
        {publicDepartments.map((department) => (
          <StaggerItem key={department.slug} className="motion-fill">
            <Link className="home-category-ribbon-item" href={`/category/${department.slug}`}>
              <span className="home-category-ribbon-image"><Image src={department.image} alt="" width={120} height={120} /></span>
              <span>
                <strong className="department-label-desktop">{department.name}</strong>
                <strong className="department-label-mobile">{mobileLabels[department.slug] ?? department.name}</strong>
                <small>{department.description}</small>
              </span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

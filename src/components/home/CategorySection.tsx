"use client";

import Image from "next/image";
import Link from "next/link";
import { publicDepartments } from "@/data/publicDepartments";
import { StaggerGroup, StaggerItem } from "@/components/motion/MotionPrimitives";

export function CategorySection() {
  return (
    <section className="home-category-ribbon" aria-label="Explore departments">
      <StaggerGroup className="site-container home-category-ribbon-inner" amount={0.12}>
        {publicDepartments.map((department) => (
          <StaggerItem key={department.slug} className="motion-fill">
            <Link className="home-category-ribbon-item" href={`/category/${department.slug}`}>
              <span className="home-category-ribbon-image"><Image src={department.image} alt="" width={120} height={120} /></span>
              <span><strong>{department.name}</strong><small>{department.description}</small></span>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

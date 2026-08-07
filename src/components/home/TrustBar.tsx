"use client";

import { ChatIcon, CreditCardIcon, HeartIcon, ShieldIcon, TruckIcon } from "@/components/icons/LineIcons";
import { StaggerGroup, StaggerItem } from "@/components/motion/MotionPrimitives";

const trustItems = [
  { label: "Free Shipping", description: "On qualifying orders", icon: TruckIcon },
  { label: "Easy Support", description: "Helpful, human assistance", icon: ChatIcon },
  { label: "Secure Payments", description: "Protected Paystack checkout", icon: CreditCardIcon },
  { label: "Premium Quality", description: "Carefully selected products", icon: ShieldIcon },
  { label: "Curated with Care", description: "Managed by one owner", icon: HeartIcon },
];

export function TrustBar() {
  return (
    <section className="editorial-trust-bar" aria-label="Store benefits">
      <StaggerGroup className="site-container editorial-trust-grid" amount={0.15}>
        {trustItems.map(({ label, description, icon: Icon }) => (
          <StaggerItem key={label} className="motion-fill"><div className="editorial-trust-item"><Icon size={26} /><span><strong>{label}</strong><small>{description}</small></span></div></StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

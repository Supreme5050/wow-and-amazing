import Image from "next/image";
import Link from "next/link";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import {
  FacebookIcon,
  HeadphonesIcon,
  InstagramIcon,
  LinkedinIcon,
  ShieldIcon,
  StarIcon,
  TruckIcon,
} from "@/components/icons/LineIcons";

const featureCallouts = [
  {
    label: "Trusted Quality",
    description: "Premium products you can rely on",
    icon: ShieldIcon,
  },
  {
    label: "Top Rated",
    description: "Loved by thousands of happy customers",
    icon: StarIcon,
  },
  {
    label: "24/7 Support",
    description: "We're here whenever you need us",
    icon: HeadphonesIcon,
  },
  {
    label: "Fast Delivery",
    description: "Quick. Reliable. Right to your door.",
    icon: TruckIcon,
  },
];

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/category/all" },
      { label: "Departments", href: "/category/all" },
      { label: "Wishlist", href: "/wishlist" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help & Support", href: "/support" },
      { label: "Track Order", href: "/track-order" },
      { label: "Account", href: "/account" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/support#privacy" },
      { label: "Terms & Conditions", href: "/support#terms" },
      { label: "Shipping & Returns", href: "/support#shipping-returns" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="site-footer" suppressHydrationWarning>
      <div className="site-container">
        <div className="footer-feature-row">
          {featureCallouts.map(({ label, description, icon: Icon }) => (
            <div className="footer-feature-item" key={label}>
              <Icon className="footer-feature-icon" />
              <div className="footer-feature-copy">
                <p className="footer-feature-label">{label}</p>
                <p className="footer-feature-description">{description}</p>
              </div>
            </div>
          ))}

          <div className="footer-logo-area">
            <Image
              className="footer-logo"
              src="/brand/logo-reversed.png"
              alt="Wow & Amazing"
              width={1081}
              height={551}
            />
          </div>
        </div>

        <div className="footer-main-row">
          <div className="footer-columns">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h2 className="footer-column-title">{column.title}</h2>
                <ul className="footer-link-list">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link className="footer-link" href={link.href}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer-newsletter">
            <p className="footer-column-title">Newsletter</p>
            <p className="footer-newsletter-copy">
              Receive product news, service updates, and curated offers.
            </p>
            <NewsletterForm />

            <div className="footer-social-links" aria-label="Social links">
              <a className="social-link" href="#" aria-label="Instagram">
                <InstagramIcon />
              </a>
              <a className="social-link" href="#" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a className="social-link" href="#" aria-label="LinkedIn">
                <LinkedinIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-copyright" suppressHydrationWarning>© 2026 Wow &amp; Amazing. All rights reserved.</div>
      </div>
    </footer>
  );
}

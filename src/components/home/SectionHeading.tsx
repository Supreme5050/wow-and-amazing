import Link from "next/link";

type SectionHeadingProps = {
  eyebrow: string;
  heading: string;
  actionLabel?: string;
  actionHref?: string;
  headingId?: string;
};

export function SectionHeading({
  eyebrow,
  heading,
  actionLabel,
  actionHref,
  headingId,
}: SectionHeadingProps) {
  return (
    <div className="section-heading-row">
      <div className="section-heading-copy">
        <p className="wa-eyebrow">{eyebrow}</p>
        <h2 id={headingId} className="wa-section-heading section-heading-title">
          {heading}
        </h2>
      </div>

      {actionLabel && actionHref ? (
        <Link className="section-text-link" href={actionHref}>
          <span>{actionLabel}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </div>
  );
}

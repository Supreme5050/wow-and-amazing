import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

const baseProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
};

export function UserIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5.75 19.25c.7-3.28 3.06-5.25 6.25-5.25s5.55 1.97 6.25 5.25" />
    </svg>
  );
}

export function SearchIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="10.75" cy="10.75" r="5.75" />
      <path d="m15.1 15.1 4.15 4.15" />
    </svg>
  );
}

export function HeartIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M20.1 5.9c-1.65-1.65-4.33-1.65-5.98 0L12 8.02 9.88 5.9A4.23 4.23 0 0 0 3.9 11.88L12 20l8.1-8.12a4.23 4.23 0 0 0 0-5.98Z" />
    </svg>
  );
}

export function BagIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M5.25 8.25h13.5l-1 11H6.25l-1-11Z" />
      <path d="M8.5 8.25V6.5a3.5 3.5 0 0 1 7 0v1.75" />
    </svg>
  );
}


export function MailIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" />
    </svg>
  );
}

export function MenuIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m7 9.5 5 5 5-5" />
    </svg>
  );
}

export function TruckIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M3.5 6.25h10v9.5h-10zM13.5 9h3.25l3.75 3.5v3.25h-7" />
      <circle cx="7" cy="17.5" r="1.5" />
      <circle cx="17" cy="17.5" r="1.5" />
    </svg>
  );
}

export function StarIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z" />
    </svg>
  );
}

export function HeadphonesIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13h2.5v6H5a1 1 0 0 1-1-1v-5ZM20 13h-2.5v6H19a1 1 0 0 0 1-1v-5Z" />
    </svg>
  );
}

export function ShieldIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M12 3.5 19 6v5.3c0 4.25-2.8 7.75-7 9.2-4.2-1.45-7-4.95-7-9.2V6l7-2.5Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="12" cy="12" r="3.25" />
      <path d="M17.5 6.5h.01" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M14.5 4h-2a3 3 0 0 0-3 3v3H7v3h2.5v7h3.25v-7h2.5l.5-3h-3V7.75c0-.55.45-1 1-1h1.75V4Z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="4" y="9" width="3" height="11" />
      <path d="M5.5 4.5h.01M10 20V9h3v1.6c.9-1.28 2.15-1.92 3.75-1.92 2.15 0 3.25 1.42 3.25 4.25V20h-3v-6.25c0-1.45-.58-2.18-1.75-2.18-1.5 0-2.25 1-2.25 3V20h-3Z" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export function CreditCardIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 9h17M7 15h3" />
    </svg>
  );
}

export function ChatIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M5 18.5 3.75 21l3.75-1.5h8.75A3.75 3.75 0 0 0 20 15.75v-7A3.75 3.75 0 0 0 16.25 5H7.75A3.75 3.75 0 0 0 4 8.75v6A3.75 3.75 0 0 0 5 18.5Z" />
      <path d="M8 10h8M8 14h5" />
    </svg>
  );
}

export function CameraIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4z" />
      <circle cx="12" cy="13.5" r="3.25" />
    </svg>
  );
}

export function PackageIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m4.5 7 7.5-4 7.5 4v10L12 21l-7.5-4z" />
      <path d="m4.5 7 7.5 4 7.5-4M12 11v10" />
    </svg>
  );
}

export function ContentIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M5 4h10l4 4v12H5z" />
      <path d="M15 4v4h4M8 13h8M8 17h6" />
    </svg>
  );
}

export function StylingIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m4.5 19.5 9-9M12.5 5.5l1-2 1 2 2 1-2 1-1 2-1-2-2-1zM17.5 12.5l.75-1.5.75 1.5 1.5.75-1.5.75-.75 1.5-.75-1.5-1.5-.75z" />
      <path d="m4 16 4 4" />
    </svg>
  );
}

export function PlusIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function MinusIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
    </svg>
  );
}

export function MapPinIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function BoxIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m4.5 7 7.5-4 7.5 4v10L12 21l-7.5-4z" />
      <path d="m4.5 7 7.5 4 7.5-4M12 11v10" />
    </svg>
  );
}

export function CheckIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m5 12.5 4.25 4.25L19 7" />
    </svg>
  );
}

export function HomeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m3.5 10 8.5-7 8.5 7" />
      <path d="M5.5 9v11h13V9M9.5 20v-6h5v6" />
    </svg>
  );
}

export function BedIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 19v-8M20 19v-6.5A2.5 2.5 0 0 0 17.5 10H9v9" />
      <path d="M4 14h16M4 10h5v4H4z" />
    </svg>
  );
}

export function BathIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M4 12h16v2.5A4.5 4.5 0 0 1 15.5 19h-7A4.5 4.5 0 0 1 4 14.5V12Z" />
      <path d="M7 12V6.5A2.5 2.5 0 0 1 9.5 4c1.2 0 2.1.45 2.75 1.35M6 19v1M18 19v1" />
    </svg>
  );
}

export function RulerIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="m4 16 12-12 4 4L8 20l-4-4Z" />
      <path d="m13 7 1.5 1.5M10.5 9.5l1.5 1.5M8 12l1.5 1.5" />
    </svg>
  );
}

export function KeyIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <circle cx="8.5" cy="15.5" r="4.5" />
      <path d="m11.7 12.3 7.8-7.8M16 8l2 2M14 10l2 2" />
    </svg>
  );
}

export function BellIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} {...baseProps} {...props}>
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
      <path d="M10 20h4" />
    </svg>
  );
}

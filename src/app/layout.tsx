import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { getCatalogSnapshot } from "@/lib/catalog/server";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Wow & Amazing",
    template: "%s | Wow & Amazing",
  },
  description: "Premium products, food and catering, property and home services, media production, and equipment rentals from Wow & Amazing.",
  icons: {
    icon: "/brand/favicon.png",
    shortcut: "/brand/favicon.png",
    apple: "/brand/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const catalog = await getCatalogSnapshot();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-cream text-ink antialiased" suppressHydrationWarning>
        <AppShell products={catalog.products}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/motion/PageTransition";
import { Header } from "@/components/layout/Header";
import { UtilityBar } from "@/components/layout/UtilityBar";
import { StoreProvider } from "@/components/store/StoreProvider";
import type { ProductSeed } from "@/data/catalog";
import { publicDepartments } from "@/data/publicDepartments";

export function AppShell({
  children,
  products,
}: {
  children: React.ReactNode;
  products: ProductSeed[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <StoreProvider products={products}>
      <div className="flex min-h-screen flex-col">
        <UtilityBar />
        <Header categories={publicDepartments} />
        <main id="main-content" className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </div>
    </StoreProvider>
  );
}

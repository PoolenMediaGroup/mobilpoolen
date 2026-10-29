import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

export function LegalPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main className="pt-10 pb-[72px] lg:pt-16 lg:pb-[112px]">
        <article
          className="mx-auto px-4 sm:px-6 lg:px-8 text-foreground"
          style={{ maxWidth: 720, lineHeight: 1.7 }}
        >
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

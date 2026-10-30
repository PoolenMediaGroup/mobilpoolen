import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { bild as hamtaBild, type Bildnyckel } from "@/lib/bildbank";
import { bildSrcSet } from "@/lib/guide-images";
import { storMatt } from "@/lib/bildbank-matt";

type TrustPageProps = {
  title: string;
  intro: string;
  children: ReactNode;
  /**
   * Bandbild under hero, hämtad ur bildbanken. Utelämnas på sidor där en
   * bild inte tillför något, som villkor och policyer.
   */
  bild?: Bildnyckel;
  /** object-position för bandbilden, t.ex. "center 35%". Default: center. */
  bildFokus?: string;
  /**
   * Datum då innehållet senast ändrades, skrivet ut ("1 oktober 2026").
   * Visar raden med datum och ansvarig under ingressen.
   */
  updated?: string;
};

export function TrustPage({ title, intro, children, bild, bildFokus, updated }: TrustPageProps) {
  const b = bild ? hamtaBild(bild) : null;
  const band = b ? bildSrcSet(b) : null;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="bg-dark-section text-footer-foreground">
          <div className="mx-auto max-w-[1140px] px-6 py-14 lg:py-20">
            <h1 className="max-w-3xl font-bold">{title}</h1>
            <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-footer-foreground/80">
              {intro}
            </p>
            {updated ? (
              <p className="mt-6 text-[13.5px] text-footer-foreground/70">
                Uppdaterad {updated}. Ansvarig:{" "}
                <Link
                  to="/skribent/leon-hallstrom"
                  className="whitespace-nowrap underline underline-offset-2 hover:text-white"
                >
                  Leon Hallström
                </Link>
                , grundare.
              </p>
            ) : null}
          </div>
        </section>
        {b && band ? (
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: "21 / 9" }}>
            <picture>
              <source srcSet={band.webp} sizes="100vw" type="image/webp" />
              <img
                src={b.jpg}
                srcSet={band.jpg}
                {...storMatt(b.nyckel)}
                sizes="100vw"
                alt={b.alt}
                className="absolute inset-0 h-full w-full object-cover"
                style={bildFokus ? { objectPosition: bildFokus } : undefined}
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>
        ) : null}
        <div className="mx-auto max-w-[900px] px-6 py-14 lg:py-20">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}

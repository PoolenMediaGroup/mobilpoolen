import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBreadcrumbs, type Crumb } from "@/components/page-breadcrumbs";
import { CtaBand } from "@/components/cta-band";
import { FaqSektion } from "@/components/guide-page";
import type { Bildnyckel } from "@/lib/bildbank";
import { datumText } from "@/lib/mobil/berakna";
import { SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { LankKort } from "@/components/mobil/lank-kort";
import { HeroNyckeltal } from "@/components/mobil/hero-nyckeltal";

export type Nyckeltal = { varde: string; text: string };
export type Lank = { href: string; label: string; text?: string };

/**
 * Mall för pelarsidorna (obegränsad surf, utan bindningstid, familj, barn och
 * så vidare). Heron svarar direkt på frågan i ingressen, nyckeltalen räknas ur
 * datan, jämförelsen står högt upp och brödtexten därunder.
 */
export function PelarSida({
  trail,
  rubrik,
  ingress,
  nyckeltal,
  jamforelse,
  jamforelseRubrik,
  jamforelseIngress,
  children,
  faq,
  lankar,
  ctaRubrik,
  ctaIngress,
  ctaBild,
  uppdaterad,
}: {
  trail: Crumb[];
  rubrik: string;
  ingress: ReactNode;
  nyckeltal?: Nyckeltal[];
  jamforelse?: ReactNode;
  jamforelseRubrik?: string;
  jamforelseIngress?: string;
  children?: ReactNode;
  faq?: readonly { q: string; a: string; kalla?: string }[];
  lankar?: Lank[];
  ctaRubrik?: string;
  ctaIngress?: string;
  ctaBild: Bildnyckel;
  /** ISO-datum för när texten senast ändrades. Priserna har sitt eget datum. */
  uppdaterad: string;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden hero-mesh text-white">
          <div className="relative mx-auto max-w-[1140px] px-6 pb-14 pt-8 lg:pb-20 lg:pt-12">
            <PageBreadcrumbs trail={trail} tone="dark" />
            <h1 className="mt-2 max-w-3xl font-bold text-white">{rubrik}</h1>
            <div className="mt-5 max-w-3xl text-[18px] leading-relaxed text-white/85">
              {ingress}
            </div>
            <p className="mt-5 text-[13.5px] text-white/70">
              Priser kontrollerade {datumText(SENAST_KONTROLLERAD)} · Text uppdaterad{" "}
              {datumText(uppdaterad)} · Av{" "}
              <Link
                to="/skribent/leon-hallstrom"
                className="whitespace-nowrap underline underline-offset-2 hover:text-white"
              >
                Leon Hallström
              </Link>
            </p>
            {nyckeltal && nyckeltal.length > 0 && (
              <dl className="mt-6 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
                {nyckeltal.map((n) => (
                  <HeroNyckeltal key={n.text} varde={n.varde} text={n.text} />
                ))}
              </dl>
            )}
          </div>
        </section>

        {jamforelse && (
          <section className="py-14 lg:py-20">
            <div className="mx-auto max-w-[1140px] px-6">
              {jamforelseRubrik && (
                <header className="mb-8">
                  <h2 className="font-bold">{jamforelseRubrik}</h2>
                  {jamforelseIngress && (
                    <p className="mt-3 text-[17px] text-foreground/80">{jamforelseIngress}</p>
                  )}
                </header>
              )}
              {jamforelse}
            </div>
          </section>
        )}

        {children && (
          <section className="border-t border-border bg-surface py-14 lg:py-20">
            <div className="prosa mx-auto max-w-[760px] px-6">{children}</div>
          </section>
        )}

        {faq && faq.length > 0 && <FaqSektion items={faq} rubrik="Vanliga" accent="frågor" />}

        {lankar && lankar.length > 0 && (
          <section className="pb-16 lg:pb-24">
            <div className="mx-auto max-w-[1140px] px-6">
              <h2 className="mb-6 text-[24px] font-bold sm:text-[28px]">Läs vidare</h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lankar.map((l) => (
                  <li key={l.href}>
                    <LankKort href={l.href} label={l.label} text={l.text} />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <CtaBand
          rubrik={ctaRubrik ?? "Betalar du för mycket för mobilen?"}
          ingress={
            ctaIngress ?? "Jämför alla abonnemang på en gång och se vad du kan spara på ett år."
          }
          knapptext="Jämför mobilabonnemang →"
          bildnyckel={ctaBild}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

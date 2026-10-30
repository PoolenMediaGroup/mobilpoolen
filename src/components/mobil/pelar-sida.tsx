import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBreadcrumbs, type Crumb } from "@/components/page-breadcrumbs";
import { CtaBand } from "@/components/cta-band";
import { FaqAccordion } from "@/components/guide-page";
import type { Bildnyckel } from "@/lib/bildbank";
import { datumText } from "@/lib/mobil/berakna";
import { SENAST_KONTROLLERAD } from "@/lib/mobil/data";

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
        <section className="relative overflow-hidden bg-dark-section text-white">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-56 h-[520px] w-[520px] rounded-full"
            style={{ background: "color-mix(in oklab, var(--color-primary) 55%, transparent)" }}
          />
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
              <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                {nyckeltal.map((n) => (
                  <div
                    key={n.text}
                    className="rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 backdrop-blur-sm"
                  >
                    <dt className="sr-only">{n.text}</dt>
                    <dd>
                      <div className="font-display text-[28px] font-bold leading-tight text-white">
                        {n.varde}
                      </div>
                      <div className="mt-1 text-[14px] leading-snug text-white/75">{n.text}</div>
                    </dd>
                  </div>
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

        {faq && faq.length > 0 && (
          <section className="py-14 lg:py-20">
            <div className="mx-auto max-w-[760px] px-6">
              <h2 className="mb-6 font-bold">Vanliga frågor</h2>
              <FaqAccordion items={faq} />
            </div>
          </section>
        )}

        {lankar && lankar.length > 0 && (
          <section className="pb-16 lg:pb-24">
            <div className="mx-auto max-w-[1140px] px-6">
              <h2 className="mb-6 text-[24px] font-bold sm:text-[28px]">Läs vidare</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {lankar.map((l) => (
                  <li key={l.href}>
                    <Link
                      to={l.href as never}
                      className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-kort"
                    >
                      <span className="flex items-center justify-between gap-3 font-display text-[17px] font-bold text-foreground group-hover:text-primary">
                        {l.label}
                        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                      </span>
                      {l.text && (
                        <span className="mt-2 text-[14.5px] text-foreground/70">{l.text}</span>
                      )}
                    </Link>
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

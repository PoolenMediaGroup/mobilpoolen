import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Check, ExternalLink, Minus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { CtaBand } from "@/components/cta-band";
import { FaqAccordion } from "@/components/guide-page";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { ABONNEMANG, MOBILNAT, operator } from "@/lib/mobil/data";
import { datumText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import {
  billigasteFor,
  bindningsSpann,
  operatorFaq,
  parFor,
  parSlug,
  privataFor,
  samtNat,
  SKI_BRANSCH_FORETAG,
  SKI_BRANSCH_PRIVAT,
  SKI_KALLA,
  surfSpann,
} from "@/lib/mobil/sidtexter";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/operatorer/$slug")({
  loader: ({ params }) => {
    const o = operator(params.slug);
    if (!o) throw notFound();
    return { slug: o.slug };
  },
  head: ({ params }) => {
    const o = operator(params.slug);
    if (!o) return {};
    const billigast = billigasteFor(o.slug);
    const title = o.aktiv
      ? `${o.namn} mobilabonnemang 2026 – priser, nät och villkor`
      : `${o.namn} läggs ned – vad gäller och vart byta?`;
    const description = billigast
      ? `${o.namn}s mobilabonnemang jämförda: pris efter kampanjen, bindningstid och surf. Billigast från ${kr(snittForstaAret(billigast))}/mån i snitt första året. Kör i ${MOBILNAT[o.nat].namn}.`
      : `${o.namn}: vilket nät, villkor, kundnöjdhet och alternativ i samma nät. Fakta med källa och datum.`;
    return pageHead({
      title: `${title} | Mobilpoolen`,
      description: description.slice(0, 158),
      canonical: `/operatorer/${o.slug}`,
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Operatörer", path: "/operatorer" },
          { name: o.namn, path: `/operatorer/${o.slug}` },
        ]),
        faqJsonLd(operatorFaq(o)),
      ],
    });
  },
  component: OperatorSida,
});

function OperatorSida() {
  const { slug } = Route.useLoaderData();
  const o = operator(slug)!;
  const nat = MOBILNAT[o.nat];
  const privata = privataFor(o.slug);
  const foretag = ABONNEMANG.filter((a) => a.operator === o.slug && a.kundtyp === "foretag");
  const billigast = billigasteFor(o.slug);
  const faq = operatorFaq(o);
  const grannar = samtNat(o);
  const par = parFor(o.slug).filter((p) => operator(p.a) && operator(p.b));

  const fakta: { t: string; v: string }[] = [
    { t: "Ägare", v: o.agare },
    { t: "Mobilnät", v: nat.namn },
    { t: "Surf", v: surfSpann(privata) ?? "Uppgift saknas" },
    { t: "Bindningstid", v: bindningsSpann(privata) ?? "Framgår inte" },
    { t: "5G", v: o.femg ? "Ja" : "Uppgift saknas" },
    { t: "eSIM", v: o.esim == null ? "Uppgift saknas" : o.esim ? "Ja" : "Nej" },
    { t: "Wifi-samtal", v: o.wifiSamtal == null ? "Uppgift saknas" : o.wifiSamtal ? "Ja" : "Nej" },
    { t: "Uppsägning", v: o.villkor.uppsagningstid ?? "Uppgift saknas" },
    { t: "Startavgift", v: o.villkor.startavgift ?? "Uppgift saknas" },
    { t: "Företagsabonnemang", v: o.harForetag ? "Ja" : "Nej" },
  ];

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
            <PageBreadcrumbs
              tone="dark"
              trail={[
                { name: "Start", path: "/" },
                { name: "Operatörer", path: "/operatorer" },
                { name: o.namn, path: `/operatorer/${o.slug}` },
              ]}
            />
            <div className="mt-3 flex items-center gap-4">
              <OperatorMonogram namn={o.namn} size={56} className="bg-white/95" />
              <h1 className="font-bold text-white">
                {o.aktiv ? `${o.namn} mobilabonnemang` : `${o.namn} läggs ned`}
              </h1>
            </div>
            <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-white/85">{o.om}</p>
            <p className="mt-5 text-[13.5px] text-white/70">
              Kör i {nat.namn} · Priser kontrollerade {datumText(o.kontrollerad)} ·{" "}
              <a
                href={o.webb}
                target="_blank"
                rel="noopener nofollow"
                className="underline underline-offset-2 hover:text-white"
              >
                {o.namn}s webbplats
              </a>
            </p>
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              <Nyckel
                varde={billigast ? kr(snittForstaAret(billigast)) : "–"}
                text={
                  billigast
                    ? "billigaste snittpris per månad första året"
                    : "inga priser kontrollerade"
                }
              />
              <Nyckel
                varde={String(privata.length)}
                text="abonnemang för privatpersoner i jämförelsen"
              />
              <Nyckel
                varde={o.skiPrivat != null ? o.skiPrivat.toString().replace(".", ",") : "–"}
                text={
                  o.skiPrivat != null
                    ? `kundnöjdhet enligt SKI 2025 (branschen ${SKI_BRANSCH_PRIVAT.toString().replace(".", ",")})`
                    : "ingen egen mätning i SKI 2025"
                }
              />
            </dl>
          </div>
        </section>

        {o.status && (
          <div className="border-b border-border bg-cta-soft">
            <p className="mx-auto flex max-w-[1140px] items-start gap-3 px-6 py-4 text-[15.5px] text-foreground">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
              <span>
                {o.status}{" "}
                {grannar.length > 0 && (
                  <>
                    Vill du stanna i samma nät finns{" "}
                    {grannar.slice(0, 3).map((g, i) => (
                      <span key={g.slug}>
                        {i > 0 ? (i === Math.min(grannar.length, 3) - 1 ? " och " : ", ") : ""}
                        <Link
                          to="/operatorer/$slug"
                          params={{ slug: g.slug }}
                          className="font-semibold text-primary underline underline-offset-2"
                        >
                          {g.namn}
                        </Link>
                      </span>
                    ))}
                    .
                  </>
                )}
              </span>
            </p>
          </div>
        )}

        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1140px] px-6">
            <h2 className="font-bold">
              {o.aktiv ? `Alla ${o.namn}s abonnemang` : `${o.namn}s abonnemang`}
            </h2>
            {privata.length > 0 && o.aktiv ? (
              <>
                <p className="mt-3 max-w-[680px] text-[17px] text-foreground/80">
                  Sorterade efter snittpris per månad under första året, med kampanj och startavgift
                  inräknade. Öppna Detaljer för ordinarie pris, EU-surf och källa.
                </p>
                <div className="mt-8">
                  <Jamforelse
                    visaFilter={false}
                    antalForst={30}
                    forval={{ villkorade: true }}
                    urval={(a) => a.operator === o.slug}
                    id="abonnemang"
                  />
                </div>
              </>
            ) : (
              <div className="mt-6 max-w-[760px] rounded-2xl border border-border bg-surface p-6">
                <p className="text-[17px]">
                  {o.aktiv
                    ? `Vi har inte kunnat kontrollera ${o.namn}s aktuella priser direkt hos operatören, så vi visar dem inte i jämförelsen än. Hellre inga priser än fel priser.`
                    : `${o.namn} tar inte emot nya kunder, så abonnemangen finns inte med i jämförelsen.`}
                </p>
                <a
                  href={o.webb}
                  target="_blank"
                  rel="noopener nofollow"
                  className="mt-4 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary underline underline-offset-2"
                >
                  Se priserna hos {o.namn}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </div>
            )}
          </div>
        </section>

        <section className="border-y border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto grid max-w-[1140px] gap-10 px-6 lg:grid-cols-2">
            <div>
              <h2 className="font-bold">Fakta om {o.namn}</h2>
              <dl className="mt-6 divide-y divide-border rounded-2xl border border-border">
                {fakta.map((f) => (
                  <div key={f.t} className="grid grid-cols-[150px_1fr] gap-4 px-5 py-3 text-[15px]">
                    <dt className="text-foreground/65">{f.t}</dt>
                    <dd className="font-medium text-foreground">{f.v}</dd>
                  </div>
                ))}
                {o.kundtjanst && (
                  <div className="grid grid-cols-[150px_1fr] gap-4 px-5 py-3 text-[15px]">
                    <dt className="text-foreground/65">Kundtjänst</dt>
                    <dd className="font-medium text-foreground">{o.kundtjanst}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              {o.starkor.length > 0 && (
                <>
                  <h2 className="font-bold">Passar dig som vill ha</h2>
                  <ul className="mt-6 space-y-3">
                    {o.starkor.map((s) => (
                      <li key={s} className="flex items-start gap-3 text-[16px]">
                        <Check className="mt-1 h-5 w-5 shrink-0 text-savings" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {o.svagheter.length > 0 && (
                <>
                  <h3 className="mt-10 font-bold">Tänk på</h3>
                  <ul className="mt-4 space-y-3">
                    {o.svagheter.map((s) => (
                      <li key={s} className="flex items-start gap-3 text-[16px]">
                        <Minus className="mt-1 h-5 w-5 shrink-0 text-destructive" aria-hidden />
                        {s}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className="mt-6 text-[13.5px] text-foreground/60">
                Punkterna bygger på {o.namn}s egna uppgifter, kontrollerade{" "}
                {datumText(o.kontrollerad)}. Vi sätter inga egna betyg.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="mx-auto grid max-w-[1140px] gap-10 px-6 lg:grid-cols-2">
            <div className="prosa">
              <h2>Nät och täckning</h2>
              <p>
                {o.namn} kör i {nat.namn}. {nat.beskrivning}
              </p>
              <p>
                Täckningen beror på var du bor och rör dig. Kontrollera {o.namn}s täckningskarta för
                din adress innan du byter, och läs vad mätningarna från PTS och Opensignal säger i guiden om{" "}
                <Link to={"/guider/basta-tackning-sverige" as never}>
                  vilket nät som har bäst täckning
                </Link>
                .
              </p>
              <h2>Kundnöjdhet</h2>
              {o.skiPrivat != null ? (
                <p>
                  I Svenskt Kvalitetsindex mätning av mobiloperatörer 2025 fick {o.namn}{" "}
                  {o.skiPrivat.toString().replace(".", ",")} av 100 bland privatkunderna, mot{" "}
                  {SKI_BRANSCH_PRIVAT.toString().replace(".", ",")} för branschen som helhet.
                  {o.skiForetag != null
                    ? ` Bland företagskunderna fick ${o.namn} ${o.skiForetag.toString().replace(".", ",")}, mot ${SKI_BRANSCH_FORETAG.toString().replace(".", ",")} för branschen.`
                    : ""}{" "}
                  <a href={SKI_KALLA} target="_blank" rel="noopener nofollow">
                    Källa: SKI Mobil 2025
                  </a>
                  .
                </p>
              ) : (
                <p>
                  {o.namn} redovisas inte separat i Svenskt Kvalitetsindex mätning 2025, så vi har
                  ingen extern siffra på kundnöjdheten.
                </p>
              )}
              {o.aktiv && (
                <>
                  <h2>Byta till eller från {o.namn}</h2>
                  <p>
                    Du behåller ditt nummer när du byter. Den nya operatören flyttar numret och
                    avslutar det gamla abonnemanget åt dig.{" "}
                    <Link to="/saga-upp/$slug" params={{ slug: o.slug }}>
                      Så säger du upp {o.namn}
                    </Link>
                    .
                  </p>
                </>
              )}
            </div>
            <div className="space-y-8">
              {grannar.length > 0 && (
                <div>
                  <h2 className="text-[24px] font-bold sm:text-[28px]">
                    Andra operatörer i {nat.namn}
                  </h2>
                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {grannar.map((g) => {
                      const b = billigasteFor(g.slug);
                      return (
                        <li key={g.slug}>
                          <Link
                            to="/operatorer/$slug"
                            params={{ slug: g.slug }}
                            className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 hover:shadow-kort"
                          >
                            <OperatorMonogram namn={g.namn} size={36} />
                            <span>
                              <span className="block font-semibold">{g.namn}</span>
                              <span className="block text-[13px] text-foreground/65">
                                {b
                                  ? `Snitt från ${kr(snittForstaAret(b))}/mån`
                                  : "Priser ej kontrollerade"}
                              </span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {par.length > 0 && (
                <div>
                  <h2 className="text-[24px] font-bold sm:text-[28px]">Jämför {o.namn} med</h2>
                  <ul className="mt-5 space-y-2">
                    {par.map((p) => {
                      const annan = operator(p.a === o.slug ? p.b : p.a)!;
                      return (
                        <li key={parSlug(p)}>
                          <Link
                            to="/jamfor/$slug"
                            params={{ slug: parSlug(p) }}
                            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
                          >
                            {operator(p.a)!.namn} eller {operator(p.b)!.namn}?
                            <ArrowRight className="h-4 w-4" aria-hidden />
                          </Link>
                          <span className="sr-only"> Jämförelse med {annan.namn}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {foretag.length > 0 && (
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <h2 className="text-[20px] font-bold">{o.namn} för företag</h2>
                  <p className="mt-2 text-[15px] text-foreground/80">
                    {o.namn} har {foretag.length} företagsabonnemang i vår jämförelse.
                  </p>
                  <Link
                    to="/foretag"
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
                  >
                    Jämför företagsabonnemang
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-[760px] px-6">
            <h2 className="mb-6 font-bold">Vanliga frågor om {o.namn}</h2>
            <FaqAccordion items={faq} />
            <h2 className="mt-12 text-[20px] font-bold">Källor</h2>
            <ul className="mt-3 space-y-1.5 text-[14px] text-foreground/70">
              {o.kallor.slice(0, 8).map((k) => (
                <li key={k} className="[overflow-wrap:anywhere]">
                  <a
                    href={k}
                    target="_blank"
                    rel="noopener nofollow"
                    className="underline underline-offset-2 hover:text-primary"
                  >
                    {k.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[13.5px] text-foreground/60">
              Kontrollerade {datumText(o.kontrollerad)}. Ser du ett fel?{" "}
              <Link to="/kontakt" className="underline underline-offset-2 hover:text-primary">
                Säg till
              </Link>
              , så rättar vi.
            </p>
          </div>
        </section>

        <CtaBand
          rubrik={`Billigare än ${o.namn}?`}
          ingress="Jämför alla operatörer på en gång, sorterat efter vad du betalar på ett år."
          knapptext="Jämför alla abonnemang →"
          hash="alla"
          bildnyckel="mobilmast-bla-himmel"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

function Nyckel({ varde, text }: { varde: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4">
      <dt className="sr-only">{text}</dt>
      <dd>
        <div className="font-display text-[28px] font-bold leading-tight text-white">{varde}</div>
        <div className="mt-1 text-[14px] leading-snug text-white/75">{text}</div>
      </dd>
    </div>
  );
}

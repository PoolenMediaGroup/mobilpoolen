import { createFileRoute, Link } from "@tanstack/react-router";
import { BellRing, Check, ClipboardList, Repeat, ShieldCheck } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { FaqAccordion } from "@/components/guide-page";
import { AutopilotFormular } from "@/components/autopilot/autopilot-formular";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import { PRISINDEX_HISTORIK } from "@/lib/mobil/prisindex-historik";
import { formatTal, kr } from "@/lib/mobil/berakna";
import { AUTOPILOT_LANSERAD } from "@/lib/autopilot";

const PATH = "/autopilot";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Autopilot", path: PATH },
];

// Hur mycket priset stiger när kampanjen tar slut, ur prisindexet (median i kronor).
const HOJNING = PRISINDEX_HISTORIK.at(-1)?.nyckeltal.medianHojningKr ?? null;
const SNITT_HOJNING = PRISINDEX_HISTORIK.at(-1)?.nyckeltal.snittHojning ?? null;

const FAQ = [
  ...(AUTOPILOT_LANSERAD
    ? []
    : [
        {
          q: "När öppnar Autopilot?",
          a: "Inom kort. Du kan anmäla dig redan nu med uppgifterna om ditt abonnemang. När vi öppnar mejlar vi dig en gång och ber dig bekräfta, och då startar bevakningen. Fram till dess skickar vi inga mejl. Intresseanmälan sparas högst 12 månader.",
        },
      ]),
  {
    q: "Vad kostar Mobilpoolen Autopilot?",
    a: "Ingenting. Autopilot är gratis och du förbinder dig inte till något. Du kan avsluta när du vill med länken i våra mejl.",
  },
  {
    q: "Byter ni abonnemang åt mig?",
    a: "Inte än. I dag mejlar vi dig innan din bindningstid eller rabatt tar slut, med de abonnemang som passar dig bäst just då, och du byter själv. Det tar några minuter: du beställer hos den nya operatören och väljer att flytta numret. Vill du att vi byter åt dig med fullmakt när det blir möjligt kan du kryssa i det i formuläret, så hör vi av oss först.",
  },
  {
    q: "Varför vill ni veta så mycket om mitt abonnemang?",
    a: "För att kunna föreslå abonnemang som är minst lika bra som det du har: lika mycket surf, surf i EU och fria samtal. Allt utom kostnaden, surfen och bindningstiden är valfritt.",
  },
  {
    q: "När hör ni av er?",
    a: "En månad innan din bindningstid eller rabatt tar slut, eftersom en nummerflytt tar en till två veckor. Sedan tio dagar innan och samma dag. Har du ingen bindningstid eller rabatt jämför vi priserna åt dig två gånger per år.",
  },
  {
    q: "Vad händer med mina uppgifter?",
    a: "De används bara för Autopilot. Vi säljer dem inte och lämnar inte ut dem till operatörer. Avslutar du raderas uppgifterna efter 90 dagar, och obekräftade anmälningar efter 30 dagar.",
  },
];

export const Route = createFileRoute("/autopilot")({
  head: () =>
    pageHead({
      title: "Mobilpoolen Autopilot: påminnelse innan priset höjs",
      description:
        "Gratis bevakning av ditt mobilabonnemang. Vi mejlar dig innan bindningstiden eller rabatten tar slut, med de abonnemang som passar dig bäst just då.",
      canonical: PATH,
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

const STEG = [
  {
    ikon: ClipboardList,
    t: "Berätta vad du har",
    d: "Operatör, pris, surf och när bindningstiden eller rabatten tar slut. Det tar två minuter.",
  },
  {
    ikon: BellRing,
    t: "Vi håller koll",
    d: "En månad innan priset stiger eller bindningen släpper mejlar vi de abonnemang som passar dig bäst just då.",
  },
  {
    ikon: Repeat,
    t: "Du byter och behåller numret",
    d: "Beställ hos den nya operatören och flytta numret. Sedan bevakar vi ditt nya abonnemang.",
  },
];

function Sida() {
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
          <div className="relative mx-auto grid max-w-[1140px] gap-10 px-6 pb-14 pt-8 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-14 lg:pb-20 lg:pt-12">
            <div>
              <PageBreadcrumbs trail={TRAIL} tone="dark" />
              <h1 className="mt-2 font-bold text-white">Mobilpoolen Autopilot</h1>
              <p className="mt-3 font-display text-[22px] font-semibold text-white/90">
                Vi ser till att du byter i tid.
              </p>
              <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-white/85">
                De flesta abonnemang börjar med ett lågt kampanjpris och blir dyrare när rabatten
                eller bindningstiden tar slut
                {HOJNING != null ? `, i median ${kr(HOJNING)} mer i månaden` : ""}. Autopilot håller
                koll åt dig och mejlar i god tid med de abonnemang som passar dig bäst just då.
              </p>
              {!AUTOPILOT_LANSERAD && (
                <p className="mt-4 max-w-xl text-[15px] text-white/75">
                  Autopilot öppnar inom kort. Anmäl ditt intresse nu, så startar bevakningen när vi
                  öppnar.
                </p>
              )}
              <ul className="mt-7 space-y-3">
                {[
                  "Gratis, utan bindning och utan säljare som ringer",
                  "Påminnelse en månad innan priset stiger",
                  "Du väljer själv om du vill byta",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[16px] text-white">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div id="starta">
              <AutopilotFormular />
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[1140px] px-6">
            <h2 className="font-bold">Så fungerar Autopilot</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {STEG.map((s, i) => (
                <li key={s.t} className="rounded-2xl border border-border bg-surface p-6">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-highlight text-primary">
                      <s.ikon className="h-5 w-5" aria-hidden />
                    </span>
                    <span className="text-[13px] font-semibold text-foreground/60">
                      Steg {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[19px] font-bold">{s.t}</h3>
                  <p className="mt-2 text-[15.5px] text-foreground/75">{s.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-border bg-surface py-14 lg:py-20">
          <div className="prosa mx-auto max-w-[760px] px-6">
            <h2>Därför lönar det sig att byta i tid</h2>
            <p>
              Ett kampanjpris gäller oftast i tre till tolv månader. Sedan betalar du ordinarie
              pris, och bindningstiden kan löpa vidare.
              {SNITT_HOJNING != null
                ? ` Enligt Mobilpoolens prisindex blir priset i snitt ${formatTal(Math.round(SNITT_HOJNING * 10) / 10)} gånger så högt när kampanjen tar slut.`
                : ""}{" "}
              Läs mer om{" "}
              <Link to={"/guider/kampanjpris-efter-kampanjen" as never}>
                vad du betalar efter kampanjen
              </Link>{" "}
              och se hur priserna utvecklas i <Link to="/prisindex">Mobilpoolens prisindex</Link>.
            </p>
            <p>
              Att byta är enkelt. Du beställer hos den nya operatören och väljer att flytta ditt
              nummer. Den nya operatören säger upp det gamla abonnemanget åt dig, och avbrottet får
              vara högst en arbetsdag. Så går det till steg för steg i guiden om att{" "}
              <Link to={"/guider/byta-operator-behalla-nummer" as never}>
                byta operatör och behålla numret
              </Link>
              .
            </p>
            <h2>Det här gör vi, och det här gör vi inte</h2>
            <ul>
              <li>
                Vi mejlar dig innan din bindningstid eller rabatt tar slut, och halvårsvis om du
                saknar båda.
              </li>
              <li>
                Vi föreslår bara abonnemang som är minst lika bra som det du har, sorterade på vad
                de kostar första året.
              </li>
              <li>
                Vi byter inte åt dig och säger inte upp något. Det gör du själv, eller den nya
                operatören när du flyttar numret.
              </li>
              <li>Vi säljer inga uppgifter och ingen ringer dig.</li>
            </ul>
            <p className="flex items-start gap-2 text-[15px] text-foreground/75">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                Mobilpoolen har inga avtal med operatörer och får ingen ersättning när du byter. Läs{" "}
                <Link to={"/autopilot/villkor" as never}>villkoren för Autopilot</Link>.
              </span>
            </p>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-[760px] px-6">
            <h2 className="mb-6 font-bold">Vanliga frågor</h2>
            <FaqAccordion items={FAQ} />
            <a href="#starta" className="btn-cta mt-8 inline-flex">
              {AUTOPILOT_LANSERAD ? "Starta Autopilot" : "Anmäl intresse"}
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

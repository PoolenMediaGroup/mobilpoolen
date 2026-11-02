import { Fragment } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRight,
  BellRing,
  Check,
  ClipboardList,
  Repeat,
  ShieldCheck,
  X,
} from "lucide-react";
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

const NYCKEL = PRISINDEX_HISTORIK.at(-1);
const MANAD = NYCKEL
  ? new Date(`${NYCKEL.manad}-01T12:00:00`).toLocaleDateString("sv-SE", {
      month: "long",
      year: "numeric",
    })
  : null;

const PAMINNELSER = [
  {
    nar: "30 dagar innan",
    d: "Första mejlet, med abonnemangen som passar dig bäst just då. En nummerflytt tar en till två veckor.",
  },
  { nar: "10 dagar innan", d: "En påminnelse om du inte har bytt än." },
  { nar: "Samma dag", d: "Sista påminnelsen, dagen priset stiger eller bindningen släpper." },
];

const GOR = [
  "Mejlar dig innan bindningstid eller rabatt tar slut",
  "Jämför priserna halvårsvis om du saknar båda",
  "Föreslår bara abonnemang som är minst lika bra som ditt",
  "Sorterar på vad abonnemangen kostar första året",
];
const GOR_INTE = [
  "Byter åt dig eller säger upp något",
  "Säljer eller lämnar ut dina uppgifter",
  "Ringer dig",
  "Tar betalt",
];

function Sida() {
  const cta = AUTOPILOT_LANSERAD ? "Starta Autopilot" : "Anmäl intresse";
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        {/* ---------- Hero ---------- */}
        <section
          // Samma höjd som startsidans hero: en vit kant syns längst ner på dator.
          className="relative overflow-hidden hero-mesh text-white lg:flex lg:min-h-[calc(100svh-128px-var(--nav-extra,0px))] lg:flex-col lg:justify-center"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div
              className="svava absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full opacity-60 blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(176,108,245,0.6), transparent 65%)",
              }}
            />
            <div
              className="svava absolute -bottom-56 left-1/4 h-[460px] w-[460px] rounded-full opacity-40 blur-3xl [animation-delay:-7s]"
              style={{
                background: "radial-gradient(circle, rgba(232,132,44,0.45), transparent 65%)",
              }}
            />
          </div>
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_480px] lg:items-center lg:gap-16 lg:px-8 lg:py-12">
            <div>
              <PageBreadcrumbs trail={TRAIL} tone="dark" />
              {!AUTOPILOT_LANSERAD && (
                <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[13px] font-semibold text-white backdrop-blur">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5BE39B] opacity-75 motion-reduce:animate-none" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#5BE39B]" />
                  </span>
                  Öppnar snart · anmäl intresse nu
                </span>
              )}
              <h1
                className="mt-4 font-bold text-white"
                style={{
                  fontSize: "clamp(34px, 4.6vw, 46px)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.03em",
                }}
              >
                Mobilpoolen Autopilot
                <br />
                <span className="text-gradient-ljus">Vi ser till att du byter i tid.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[18px] leading-snug text-white/90 sm:text-[20px]">
                Kampanjpriset tar slut. Vi mejlar dig innan det gör det.
              </p>
              <ul className="mt-8 space-y-3.5">
                {[
                  "Gratis, utan bindning och utan säljare som ringer",
                  "Påminnelse en månad innan priset stiger",
                  "Du väljer själv om du vill byta",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[16.5px] text-white">
                    <Check
                      className="mt-0.5 h-5 w-5 shrink-0"
                      style={{ color: "#5BE39B" }}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div id="starta" className="relative scroll-mt-24">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-[30px] bg-gradient-to-br from-[#b06cf5]/40 via-transparent to-[#e8842c]/30 blur-2xl"
              />
              <div className="relative">
                <AutopilotFormular />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Varför: siffror ur prisindexet ---------- */}
        {NYCKEL &&
          NYCKEL.nyckeltal.kampanjAndel != null &&
          NYCKEL.nyckeltal.medianHojningKr != null &&
          NYCKEL.nyckeltal.snittHojning != null && (
            <section className="bg-surface">
              <div className="mx-auto max-w-[1140px] px-6 py-14 lg:py-16">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-center lg:gap-16">
                  <div>
                    <h2
                      className="font-bold"
                      style={{
                        fontSize: "clamp(28px, 3.6vw, 40px)",
                        lineHeight: 1.1,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      Kampanjpriset är <span className="text-gradient">tillfälligt</span>
                    </h2>
                    <span
                      aria-hidden
                      className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-primary to-[#b06cf5]"
                    />
                    <p className="mt-5 text-[16.5px] leading-relaxed text-foreground/85">
                      De flesta abonnemang börjar med ett lågt kampanjpris som gäller i tre till
                      tolv månader. Sedan betalar du ordinarie pris, och bindningstiden kan löpa
                      vidare. Det är där pengarna försvinner. Autopilot håller koll åt dig och
                      mejlar i god tid med de abonnemang som passar dig bäst just då.
                    </p>
                    <p className="mt-4 text-[13.5px] text-foreground/60">
                      Källa:{" "}
                      <Link
                        to="/prisindex"
                        className="underline underline-offset-2 hover:text-primary"
                      >
                        Mobilpoolens prisindex
                      </Link>
                      {MANAD ? `, ${MANAD}` : ""}. {NYCKEL.nyckeltal.antal} abonnemang från{" "}
                      {NYCKEL.nyckeltal.operatorer} operatörer.
                    </p>
                  </div>
                  <dl className="grid gap-4 sm:grid-cols-3">
                    {[
                      {
                        v: `${formatTal(Math.round(NYCKEL.nyckeltal.kampanjAndel ?? 0))} %`,
                        t: "av abonnemangen har ett kampanjpris",
                      },
                      {
                        v: `+${kr(NYCKEL.nyckeltal.medianHojningKr ?? 0)}`,
                        t: "per månad i median när kampanjen tar slut",
                      },
                      {
                        v: `${formatTal(Math.round((NYCKEL.nyckeltal.snittHojning ?? 0) * 10) / 10)}×`,
                        t: "så högt pris i snitt efter kampanjen",
                      },
                    ].map((k) => (
                      <div
                        key={k.t}
                        className="kort-lyft rounded-2xl border border-border bg-gradient-to-br from-white to-highlight p-6 shadow-kort"
                      >
                        <dd className="text-gradient font-display text-[40px] font-bold leading-none tracking-tight">
                          {k.v}
                        </dd>
                        <dt className="mt-3 text-[14.5px] leading-snug text-foreground/75">
                          {k.t}
                        </dt>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </section>
          )}

        {/* ---------- Så fungerar det ---------- */}
        <section className="hero-mesh text-white">
          <div className="mx-auto max-w-[1140px] px-6 py-14 lg:py-20">
            <h2
              className="font-bold text-white"
              style={{
                fontSize: "clamp(30px, 4.2vw, 44px)",
                lineHeight: 1.12,
                letterSpacing: "-0.025em",
              }}
            >
              Så fungerar Autopilot
            </h2>
            <span
              aria-hidden
              className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-[#ffb877] to-[#d9d3ff]"
            />
            <p className="mt-4 max-w-[640px] text-[18px] leading-relaxed text-dark-muted">
              Tre steg. Du lägger två minuter, sedan håller vi koll åt dig.
            </p>
            <ol className="mt-12 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-5">
              {STEG.map((s, i) => (
                <Fragment key={s.t}>
                  <li className="flex flex-col rounded-[18px] border border-white/15 bg-white/[0.06] p-7 shadow-[0_24px_48px_-16px_rgba(4,6,24,0.5)] backdrop-blur">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_8px_24px_rgba(59,40,204,0.45)]">
                        <s.ikon className="h-7 w-7 text-white" strokeWidth={2.2} aria-hidden />
                      </span>
                      <span
                        className="font-display text-5xl font-extrabold"
                        style={{
                          color: "var(--cta)",
                          textShadow: "0 2px 14px rgba(232,132,44,0.28)",
                        }}
                      >
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 text-[20px] font-semibold text-white">{s.t}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-dark-muted">{s.d}</p>
                  </li>
                  {i < STEG.length - 1 && (
                    <li aria-hidden className="flex items-center justify-center py-1 md:py-0">
                      <ArrowRight
                        className="hidden h-8 w-8 text-dark-accent md:block"
                        strokeWidth={2}
                      />
                      <ArrowDown className="h-7 w-7 text-dark-accent md:hidden" strokeWidth={2.5} />
                    </li>
                  )}
                </Fragment>
              ))}
            </ol>

            {/* Tidslinje för påminnelserna */}
            <div className="mt-14 rounded-[22px] border border-white/15 bg-white/[0.05] p-6 sm:p-8">
              <p className="flex items-center gap-2 font-display text-[18px] font-semibold text-white">
                <BellRing className="h-5 w-5 text-[#ffb877]" aria-hidden />
                När vi hör av oss
              </p>
              <ol className="relative mt-8 grid gap-8 md:grid-cols-3 md:gap-6">
                <span
                  aria-hidden
                  className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#b06cf5] to-[#e8842c] md:left-0 md:right-0 md:top-[7px] md:bottom-auto md:h-0.5 md:w-auto md:bg-gradient-to-r"
                />
                {PAMINNELSER.map((p) => (
                  <li key={p.nar} className="relative pl-8 md:pl-0 md:pt-8">
                    <span
                      aria-hidden
                      className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-white bg-primary shadow-[0_0_0_4px_rgba(124,99,255,0.35)] md:top-0"
                    />
                    <p className="font-display text-[17px] font-semibold text-white">{p.nar}</p>
                    <p className="mt-1.5 text-[14.5px] leading-relaxed text-dark-muted">{p.d}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-8 text-[13.5px] text-dark-muted">
                Har du ingen bindningstid eller rabatt jämför vi priserna åt dig två gånger per år.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Gör / gör inte ---------- */}
        <section className="bg-mesh-light">
          <div className="mx-auto max-w-[1140px] px-6 py-14 lg:py-20">
            <h2
              className="font-bold"
              style={{
                fontSize: "clamp(28px, 3.6vw, 40px)",
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              Det här gör vi, och det här gör vi inte
            </h2>
            <span
              aria-hidden
              className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-primary to-[#b06cf5]"
            />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              <div className="kort-lyft rounded-[22px] border border-primary/15 bg-white p-7 shadow-kort sm:p-8">
                <p className="font-display text-[19px] font-bold">Autopilot gör</p>
                <ul className="mt-5 space-y-3.5">
                  {GOR.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[15.5px] text-foreground/85">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5BE39B]/20 text-[#1f9d57]">
                        <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="kort-lyft rounded-[22px] border border-border bg-white p-7 shadow-kort sm:p-8">
                <p className="font-display text-[19px] font-bold">Autopilot gör inte</p>
                <ul className="mt-5 space-y-3.5">
                  {GOR_INTE.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[15.5px] text-foreground/85">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/60">
                        <X className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              <p className="text-[15.5px] leading-relaxed text-foreground/80">
                Att byta är enkelt. Du beställer hos den nya operatören och väljer att flytta ditt
                nummer. Den nya operatören säger upp det gamla abonnemanget åt dig, och avbrottet
                får vara högst en arbetsdag. Så går det till i guiden om att{" "}
                <Link
                  to={"/guider/byta-operator-behalla-nummer" as never}
                  className="font-semibold text-primary underline underline-offset-2"
                >
                  byta operatör och behålla numret
                </Link>
                .
              </p>
              <p className="flex items-start gap-2 text-[14.5px] leading-relaxed text-foreground/70">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>
                  Mobilpoolen har inga avtal med operatörer och får ingen ersättning när du byter.
                  Läs{" "}
                  <Link
                    to={"/autopilot/villkor" as never}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    villkoren för Autopilot
                  </Link>{" "}
                  och{" "}
                  <Link
                    to={"/guider/kampanjpris-efter-kampanjen" as never}
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    vad du betalar efter kampanjen
                  </Link>
                  .
                </span>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="bg-surface">
          <div className="mx-auto grid max-w-[1140px] gap-10 px-6 py-14 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] lg:gap-16 lg:py-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2
                className="font-bold"
                style={{
                  fontSize: "clamp(30px, 4vw, 44px)",
                  lineHeight: 1.08,
                  letterSpacing: "-0.03em",
                }}
              >
                Frågor om <span className="text-gradient">Autopilot</span>
              </h2>
              <span
                aria-hidden
                className="mt-4 block h-1 w-14 rounded-full bg-gradient-to-r from-primary to-[#b06cf5]"
              />
              <div className="mt-8 overflow-hidden rounded-2xl hero-mesh p-6 text-white shadow-[0_24px_48px_-24px_rgba(22,19,58,0.6)]">
                <p className="font-display text-[19px] font-semibold">Klart på två minuter</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-dark-muted">
                  Fyll i ditt abonnemang, så hör vi av oss innan priset stiger.
                </p>
                <a href="#starta" className="btn-cta mt-5 w-full">
                  {cta}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            </div>
            <FaqAccordion items={FAQ} fot={false} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Baby,
  Briefcase,
  Calculator,
  CalendarX2,
  Check,
  Infinity as InfinityIcon,
  Receipt,
  BellRing,
  Heart,
  Users,
  Wallet,
  Tag,
  GraduationCap,
} from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { CtaBand } from "@/components/cta-band";
import { FaqItem } from "@/components/faq-section";
import { GuideCard } from "@/components/guide-card";
import { SectionHeader, SectionShell } from "@/components/section-layout";
import { Jamforelse, type Forval } from "@/components/mobil/jamforelse";
import { SparKalkyl, type KalkylResultat } from "@/components/mobil/spar-kalkyl";
import { BilligastTabell, billigastPerNiva } from "@/components/mobil/billigast-tabell";
import { SURF_NIVAER } from "@/lib/mobil/surf";
import { pageHead, faqJsonLd, jsonLdScript, SITE_URL } from "@/lib/seo";
import { fragorUrRegistret } from "@/lib/faq";
import { PUBLISHED_GUIDES } from "@/lib/guides";
import { getGuideImage } from "@/lib/guide-images";
import { MOBILNAT, OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { datumText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import { AUTOPILOT_LANSERAD } from "@/lib/autopilot";
import type { NatId } from "@/lib/mobil/typer";

const TITLE = "Jämför mobilabonnemang 2026 – hitta billigaste";
const DESC =
  "Jämför mobilabonnemang från alla stora operatörer. Se pris efter kampanjen, bindningstid och nät, med källa och datum. Privat och företag. Gratis.";

const STARTSIDANS_QA = fragorUrRegistret("/", [
  "Vilket är det billigaste mobilabonnemanget just nu?",
  "Hur mycket surf behöver jag?",
  "Är billiga operatörer sämre än Telia, Tele2 och Telenor?",
  "Kan jag byta operatör och behålla mitt nummer?",
  "Vad händer när kampanjpriset tar slut?",
  "Är Mobilpoolen gratis?",
]);

export const Route = createFileRoute("/")({
  head: () => {
    const head = pageHead({
      title: `${TITLE} | Mobilpoolen`,
      description: DESC,
      canonical: `${SITE_URL}/`,
    });
    return {
      ...head,
      scripts: [
        faqJsonLd(STARTSIDANS_QA),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Billigaste mobilabonnemanget per surfmängd",
          itemListElement: billigastPerNiva().map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${r.niva}: ${operator(r.a.operator)?.namn ?? r.a.operator} ${r.a.namn}, ${kr(snittForstaAret(r.a))} per månad i snitt första året`,
          })),
        }),
      ],
    };
  },
  component: Startsida,
});

// En guide per kategori, tre stycken, så att startsidan visar bredden utan att bli lång.
// Hoppar över guider vars bild redan syns på sidan (samma bild aldrig två gånger).
const STARTSIDANS_GUIDER = (() => {
  const upptagna = new Set<string>(["vanner-middag-utomhus"]);
  const sedda = new Set<string>();
  const ut: typeof PUBLISHED_GUIDES = [];
  for (const g of PUBLISHED_GUIDES) {
    const nyckel = getGuideImage(g.slug)?.nyckel;
    if (sedda.has(g.category) || (nyckel && upptagna.has(nyckel))) continue;
    sedda.add(g.category);
    if (nyckel) upptagna.add(nyckel);
    ut.push(g);
    if (ut.length === 3) break;
  }
  return ut;
})();

const ANTAL_OPERATORER = new Set(PRIVATA.map((a) => a.operator)).size;

function Startsida() {
  const [forval, setForval] = useState<Forval>({});
  const onResultat = (r: KalkylResultat) => {
    setForval(
      r.behovGb >= 1000
        ? { surf: "obegransad", sortering: "snitt-ar" }
        : { behovGb: r.behovGb, sortering: "snitt-ar" },
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <Hero onResultat={onResultat} />
        <OperatorRad />

        <SectionShell id="alla">
          <SectionHeader
            title="Alla mobilabonnemang, sorterade efter vad du faktiskt betalar"
            sub="Kampanjens längd och startavgiften är inräknade. Det billigaste i dag är inte alltid det billigaste på ett år."
          />
          <Jamforelse forval={forval} id="lista" />
        </SectionShell>

        <AutopilotTeaser />

        <SectionShell flushTop>
          <SectionHeader
            title="Billigaste mobilabonnemanget per surfmängd"
            sub="Det billigaste abonnemanget som ger minst så här mycket surf, räknat som snittpris per månad första året."
          />
          <BilligastTabell />
          <Genvagar />
        </SectionShell>

        <SaFungerarDet />
        <NatSektion />
        <ForetagBand />

        <SectionShell flushTop>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2
              className="font-bold text-foreground"
              style={{ fontSize: "clamp(28px, 3.6vw, 38px)", letterSpacing: "-0.025em" }}
            >
              Guider och råd
            </h2>
            <Lank to="/guider">Alla guider</Lank>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {STARTSIDANS_GUIDER.map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
        </SectionShell>

        <section className="bg-surface">
          <SectionShell>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-16">
              <div>
                <h2
                  className="font-bold text-foreground"
                  style={{ fontSize: "clamp(28px, 3.6vw, 38px)", letterSpacing: "-0.025em" }}
                >
                  Vanliga frågor
                </h2>
                <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
                  Hittar du inte svaret? Det finns fler frågor och svar om abonnemang, byten och
                  nät.
                </p>
                <div className="mt-4">
                  <Lank to="/faq">Alla frågor och svar</Lank>
                </div>
              </div>
              <div className="grid gap-3">
                {STARTSIDANS_QA.map((q) => (
                  <FaqItem key={q.q} item={q} />
                ))}
              </div>
            </div>
          </SectionShell>
        </section>

        <CtaBand
          rubrik="Samma samtal. Samma surf. Lägre räkning."
          ingress="Det tar två minuter att se om du betalar för mycket för mobilen."
          knapptext="Jämför mobilabonnemang →"
          hash="alla"
          bildnyckel="vanner-middag-utomhus"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

function Lank({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to as never}
      className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  );
}

/* ---------------- Hero ---------------- */

// Rubriken i två rader som Elpoolens: sökordet först, löftet i accentfärg.
const HERO_RAD_1 = "Jämför mobilabonnemang.";
const HERO_RAD_2 = "Hitta ditt bästa pris.";
const HERO_ACCENT = "#C4BBFF";

function Hero({ onResultat }: { onResultat: (r: KalkylResultat) => void }) {
  const billigast = billigastPerNiva()[0];
  return (
    <section
      id="jamfor"
      // Samma upplägg som Elpoolens hero: centrerad i fönstret på dator och
      // skalad med --hz så att proportionerna blir desamma på alla skärmar.
      className="relative overflow-hidden lg:flex lg:min-h-[calc(100svh-128px-var(--nav-extra,0px))] lg:flex-col lg:justify-center"
      style={{ background: "var(--primary)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full"
        style={{ background: "color-mix(in oklab, white 10%, transparent)", filter: "blur(4px)" }}
      />
      <div className="hero-skala relative mx-auto w-full max-w-7xl px-4 pb-[20px] pt-[28px] sm:px-6 sm:pb-[34px] sm:pt-[56px] lg:px-8 lg:py-[56px]">
        <div className="flex flex-col gap-3 sm:gap-10 lg:flex-row lg:items-start lg:gap-16">
          {/* Vänsterkolumn */}
          <div className="contents lg:flex lg:w-[520px] lg:shrink-0 lg:flex-col lg:self-start">
            <div className="order-1 flex flex-col">
              <h1
                className="font-bold text-white"
                style={{
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  fontSize: "clamp(32px, 6.4vw, 52px)",
                }}
              >
                {HERO_RAD_1}
                <br />
                <span style={{ color: HERO_ACCENT }}>{HERO_RAD_2}</span>
              </h1>
              <p
                className="mt-3 sm:mt-4"
                style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "clamp(16px, 1.9vw, 18px)",
                  lineHeight: 1.5,
                }}
              >
                På bara 30 sekunder. Gratis och enkelt.
              </p>
            </div>

            <div className="order-3 flex flex-col lg:order-2">
              <ul className="mt-1 hidden flex-col gap-2.5 sm:mt-6 sm:flex sm:gap-3.5">
                {[
                  "Pris efter kampanjen, inte bara första månaden",
                  "Ordningen styrs av pris, aldrig av ersättning",
                  "Byt smidigt, numret följer med",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check
                      className="h-[20px] w-[20px] shrink-0"
                      style={{ color: "#5BE39B", marginTop: 2 }}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    <span
                      className="text-white"
                      style={{ fontSize: "clamp(15px, 1.7vw, 17px)", lineHeight: 1.45 }}
                    >
                      {t}
                    </span>
                  </li>
                ))}
              </ul>

              <div
                className="mt-3.5 inline-flex items-center gap-3 self-start sm:mt-5"
                style={{ color: "rgba(226,222,255,0.85)", fontSize: 12.5 }}
              >
                <span className="flex w-[20px] shrink-0 justify-center" aria-hidden>
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: "#5BE39B" }}
                  />
                </span>
                <span>
                  Kontrollerat {datumText(SENAST_KONTROLLERAD)} · Källa: operatörernas egna
                  webbplatser
                </span>
              </div>

              <div className="mt-5 flex flex-col items-start gap-3 sm:mt-10 lg:mt-16">
                <Link
                  to="/autopilot"
                  className="inline-flex items-center gap-2 text-[13.5px] hover:underline"
                  style={{ color: "#DCD8F5" }}
                >
                  <BellRing
                    className="h-4 w-4 shrink-0"
                    style={{ color: HERO_ACCENT }}
                    aria-hidden
                  />
                  Inte redo att byta? Få besked innan kampanjen tar slut →
                </Link>
                <Link
                  to="/foretag"
                  className="inline-flex items-center gap-2 text-[13.5px] hover:underline"
                  style={{ color: "#DCD8F5" }}
                >
                  <Briefcase
                    className="h-4 w-4 shrink-0"
                    style={{ color: HERO_ACCENT }}
                    aria-hidden
                  />
                  Har du företag? Jämför företagsabonnemang →
                </Link>
              </div>
            </div>
          </div>

          {/* Formulärkolumn */}
          <div className="relative order-2 mt-4 lg:mt-0 lg:flex-1 lg:self-start">
            <div className="relative z-10">
              {billigast && (
                <div className="absolute right-3 top-0 z-20 -translate-y-1/2 sm:right-6">
                  <div
                    className="inline-flex items-center px-2 py-1 text-[11px] sm:px-3 sm:py-[7px] sm:text-[13px]"
                    style={{
                      background: "#FFF8EF",
                      border: "1px solid rgba(232,132,44,0.28)",
                      borderRadius: 999,
                      boxShadow: "0 4px 12px rgba(22,19,58,0.18)",
                      fontWeight: 600,
                      color: "#16133A",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Från {kr(snittForstaAret(billigast.a))}/mån i snitt
                  </div>
                </div>
              )}
              <SparKalkyl onResultat={onResultat} />
              <div
                className="text-center"
                style={{ marginTop: 12, fontSize: 13, color: "#DCD8F5" }}
              >
                Jämför på 30 sekunder · Helt gratis · Du väljer själv
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Operatörsrad (ersätter loggor) ---------------- */

function OperatorRad() {
  const lista = OPERATORER.filter((o) => o.aktiv && PRIVATA.some((a) => a.operator === o.slug));
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 sm:px-6 lg:px-8 py-6 lg:flex-row lg:items-center lg:gap-8">
        <p className="shrink-0 text-[14px] font-semibold text-muted-foreground">
          Vi jämför {lista.length} operatörer
        </p>
        <ul className="-mx-6 flex gap-x-5 overflow-x-auto whitespace-nowrap px-6 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:gap-y-1.5 lg:overflow-visible lg:whitespace-normal lg:px-0">
          {lista.map((o) => (
            <li key={o.slug}>
              <Link
                to="/operatorer/$slug"
                params={{ slug: o.slug }}
                className="font-display text-[15.5px] font-semibold text-foreground/55 transition-colors hover:text-primary"
              >
                {o.namn}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------- Autopilot ---------------- */

function AutopilotTeaser() {
  return (
    <SectionShell flushTop>
      <div className="grid items-center gap-8 rounded-[28px] bg-dark-section p-7 text-white sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12 lg:p-12">
        <div className="flex items-start gap-5">
          <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-dark-accent sm:inline-flex">
            <BellRing className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h2
              className="font-bold text-white"
              style={{ fontSize: "clamp(24px, 3vw, 32px)", letterSpacing: "-0.02em" }}
            >
              Missa aldrig när kampanjen tar slut
            </h2>
            <p className="mt-3 max-w-[620px] text-[16.5px] leading-relaxed text-dark-muted">
              Med Mobilpoolen Autopilot mejlar vi dig en månad innan priset stiger eller bindningen
              släpper, med de abonnemang som passar dig bäst just då. Gratis, och du väljer själv om
              du vill byta.
            </p>
          </div>
        </div>
        <Link to="/autopilot" className="btn-cta shrink-0">
          {AUTOPILOT_LANSERAD ? "Starta Autopilot" : "Anmäl intresse"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </SectionShell>
  );
}

/* ---------------- Genvägar ---------------- */

const GENVAGAR = [
  { to: "/billigaste-mobilabonnemang", ikon: Wallet, t: "Billigaste" },
  { to: "/obegransad-surf", ikon: InfinityIcon, t: "Obegränsad surf" },
  { to: "/utan-bindningstid", ikon: CalendarX2, t: "Utan bindningstid" },
  { to: "/kampanjer", ikon: Tag, t: "Kampanjer" },
  { to: "/familjeabonnemang", ikon: Users, t: "Familj" },
  { to: "/barn", ikon: Baby, t: "Barn och unga" },
  { to: "/studentabonnemang", ikon: GraduationCap, t: "Studenter" },
  { to: "/pensionar", ikon: Heart, t: "Pensionärer" },
  { to: "/kontantkort", ikon: Receipt, t: "Kontantkort" },
  { to: "/foretag", ikon: Briefcase, t: "Företag" },
] as const;

const chip =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[14.5px] font-semibold text-foreground transition-colors hover:border-primary/50 hover:text-primary";

function Genvagar() {
  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-x-10 lg:gap-y-6">
      <p className="text-[15px] font-semibold text-foreground lg:pt-2.5">Efter surf</p>
      <ul className="flex flex-wrap gap-2">
        {SURF_NIVAER.map((n) => (
          <li key={n.slug}>
            <Link to={"/surf/$gb" as never} params={{ gb: n.slug } as never} className={chip}>
              {n.gb} GB
            </Link>
          </li>
        ))}
        <li>
          <Link to="/obegransad-surf" className={chip}>
            Obegränsad
          </Link>
        </li>
      </ul>
      <p className="text-[15px] font-semibold text-foreground lg:pt-2.5">Efter behov</p>
      <ul className="flex flex-wrap gap-2">
        {GENVAGAR.map(({ to, ikon: Ikon, t }) => (
          <li key={to}>
            <Link to={to as never} className={chip}>
              <Ikon className="h-4 w-4 text-primary" aria-hidden />
              {t}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Så fungerar det ---------------- */

function SaFungerarDet() {
  const steg = [
    {
      t: "Kolla hur mycket du surfar",
      d: "Se förbrukningen de senaste månaderna i mobilens inställningar. Många behöver mindre än de tror.",
      lank: { to: "/verktyg/hur-mycket-surf-behover-jag", label: "Räkna ut ditt surfbehov" },
    },
    {
      t: "Jämför priset över ett år",
      d: "Tre månader kampanjpris väger lätt över tolv. Vi räknar snittet åt dig, startavgiften inräknad.",
      lank: { to: "/guider/kampanjpris-efter-kampanjen", label: "Så fungerar kampanjpriser" },
    },
    {
      t: "Beställ och behåll numret",
      d: "Nya operatören flyttar numret och avslutar det gamla abonnemanget. Avbrottet är högst en arbetsdag.",
      lank: { to: "/guider/byta-operator-behalla-nummer", label: "Byta operatör steg för steg" },
    },
  ];
  return (
    <section className="bg-surface">
      <SectionShell>
        <SectionHeader
          title="Byt till ett billigare abonnemang på tio minuter"
          sub="Numret följer med och du behöver inte säga upp något själv."
        />
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steg.map((s, i) => (
            <li key={s.t} className="border-t-2 border-primary pt-6">
              <span className="font-display text-[15px] font-bold text-primary">Steg {i + 1}</span>
              <h3 className="mt-2 text-[21px] text-foreground">{s.t}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-muted-foreground">{s.d}</p>
              <div className="mt-3">
                <Lank to={s.lank.to}>{s.lank.label}</Lank>
              </div>
            </li>
          ))}
        </ol>
      </SectionShell>
    </section>
  );
}

/* ---------------- Näten ---------------- */

function NatSektion() {
  const perNat = (Object.keys(MOBILNAT) as NatId[]).map((id) => ({
    nat: MOBILNAT[id],
    operatorer: OPERATORER.filter((o) => o.nat === id && o.aktiv && !o.natNotis),
  }));
  return (
    <SectionShell>
      <SectionHeader
        title="Fyra mobilnät, samma täckning för mindre"
        sub="Alla operatörer kör i något av fyra nät. Väljer du en billigare operatör i samma nät får du samma täckning."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perNat.map(({ nat, operatorer }) => (
          <div
            key={nat.id}
            className="flex flex-col rounded-2xl border border-border bg-surface p-5"
          >
            <Link
              to="/nat/$slug"
              params={{ slug: nat.id }}
              className="font-display text-[19px] font-bold text-foreground hover:text-primary"
            >
              {nat.namn}
            </Link>
            <span className="mt-1 text-[13.5px] text-muted-foreground">{nat.agare}</span>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {operatorer.map((o) => (
                <li key={o.slug}>
                  <Link
                    to="/operatorer/$slug"
                    params={{ slug: o.slug }}
                    className="inline-block rounded-full bg-muted px-2.5 py-1 text-[13px] font-semibold text-foreground hover:bg-highlight hover:text-primary"
                  >
                    {o.namn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap gap-x-6">
        <Lank to="/nat">Vilket nät har bäst täckning?</Lank>
        <Lank to="/operatorer">Alla operatörer</Lank>
        <Lank to="/jamfor">Jämför två operatörer</Lank>
      </div>
    </SectionShell>
  );
}

/* ---------------- Företag ---------------- */

function ForetagBand() {
  return (
    <SectionShell flushTop>
      <div className="grid items-center gap-6 rounded-[28px] border border-border bg-surface p-7 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div>
          <h2
            className="font-bold text-foreground"
            style={{ fontSize: "clamp(24px, 3vw, 32px)", letterSpacing: "-0.02em" }}
          >
            Mobilabonnemang för företag
          </h2>
          <p className="mt-3 max-w-[620px] text-[16.5px] leading-relaxed text-muted-foreground">
            Priser exkl. moms per användare, delad surf och vad som gäller för enskild firma. Räkna
            ut vad hela företaget betalar per år.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/foretag" className="btn-cta">
            Jämför för företag
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/verktyg/foretagskalkylator"
            className="inline-flex min-h-14 items-center gap-2 rounded-[14px] border border-border px-6 font-display font-semibold text-foreground hover:border-primary/50 hover:text-primary"
          >
            <Calculator className="h-4 w-4" aria-hidden />
            Kalkylator
          </Link>
        </div>
      </div>
    </SectionShell>
  );
}

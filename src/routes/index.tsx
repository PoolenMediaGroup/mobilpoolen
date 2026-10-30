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
  Radio,
  Receipt,
  Search,
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
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { pageHead, faqJsonLd, jsonLdScript, SITE_URL } from "@/lib/seo";
import { fragorUrRegistret } from "@/lib/faq";
import { PUBLISHED_GUIDES } from "@/lib/guides";
import { MOBILNAT, OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { arVillkorat, datumText, gbText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import { bild } from "@/lib/bildbank";
import { storMatt } from "@/lib/bildbank-matt";
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

const ANTAL_OPERATORER = new Set(PRIVATA.map((a) => a.operator)).size;
// Samma antal som listan nedan visar: abonnemang som alla kan teckna.
const ALLMANNA = PRIVATA.filter((a) => !arVillkorat(a)).length;
const VILLKORADE = PRIVATA.length - ALLMANNA;

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
        <Fortroenderand />

        <SectionShell id="alla">
          <SectionHeader
            title="Alla mobilabonnemang, sorterade efter vad du faktiskt betalar"
            sub="Vi räknar in kampanjens längd och startavgiften. Det billigaste i dag är inte alltid det billigaste på ett år."
          />
          <Jamforelse forval={forval} id="lista" />
        </SectionShell>

        <section className="border-y border-border bg-surface">
          <SectionShell>
            <SectionHeader
              title="Billigaste mobilabonnemanget per surfmängd"
              sub="Det billigaste abonnemanget som ger minst så här mycket surf, räknat som snittpris per månad under första året."
            />
            <BilligastTabell />
            <nav aria-label="Jämför per surfmängd" className="mt-6">
              <p className="text-[14.5px] font-semibold text-foreground">
                Jämför alla abonnemang med
              </p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {SURF_NIVAER.map((n) => (
                  <li key={n.slug}>
                    <Link
                      to={"/surf/$gb" as never}
                      params={{ gb: n.slug } as never}
                      className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-[14.5px] font-semibold text-foreground hover:border-primary/50 hover:text-primary"
                    >
                      {n.gb} GB
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    to="/obegransad-surf"
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-4 text-[14.5px] font-semibold text-foreground hover:border-primary/50 hover:text-primary"
                  >
                    Obegränsad
                  </Link>
                </li>
              </ul>
            </nav>
            <Link
              to="/billigaste-mobilabonnemang"
              className="mt-6 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
            >
              Så hittar du det billigaste abonnemanget
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </SectionShell>
        </section>

        <Genvagar />
        <SaFungerarDet />
        <NatSektion />
        <OperatorSektion />
        <ForetagSektion />

        <SectionShell flushTop>
          <SectionHeader
            title="Guider och råd"
            sub="Korta svar på det som avgör priset: surf, bindningstid, kampanjer och nät."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PUBLISHED_GUIDES.slice(0, 6).map((g) => (
              <GuideCard key={g.slug} guide={g} />
            ))}
          </div>
          <Link
            to="/guider"
            className="mt-8 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            Alla guider
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </SectionShell>

        <SectionShell flushTop>
          <SectionHeader title="Vanliga frågor om mobilabonnemang" />
          <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
            {STARTSIDANS_QA.map((q) => (
              <FaqItem key={q.q} item={q} />
            ))}
          </div>
          <Link
            to="/faq"
            className="mt-8 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            Fler frågor och svar
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </SectionShell>

        <CtaBand
          rubrik="Samma samtal. Samma surf. Lägre räkning."
          ingress="Många betalar mer än de behöver för mobilen. Det tar två minuter att se om du är en av dem."
          knapptext="Jämför mobilabonnemang →"
          hash="alla"
          bildnyckel="vanner-middag-utomhus"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

/* ---------------- Hero ---------------- */

function Hero({ onResultat }: { onResultat: (r: KalkylResultat) => void }) {
  const billigast = billigastPerNiva()[0];
  return (
    <section id="jamfor" className="relative overflow-hidden bg-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 h-[560px] w-[560px] rounded-full"
        style={{ background: "color-mix(in oklab, white 9%, transparent)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-64 -left-40 h-[520px] w-[520px] rounded-full"
        style={{ background: "color-mix(in oklab, var(--dark-section) 35%, transparent)" }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <h1
            className="font-bold text-white"
            style={{
              fontSize: "clamp(34px, 6.2vw, 58px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Jämför mobilabonnemang och betala mindre varje månad
          </h1>
          <p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/85 sm:text-[18px]">
            {ALLMANNA} abonnemang från {ANTAL_OPERATORER} operatörer som alla kan teckna, plus{" "}
            {VILLKORADE} för studenter, unga och seniorer. Med pris efter kampanjen, bindningstid
            och nät, direkt från operatörernas egna webbplatser.
          </p>
          {/* Bockarna göms i mobilen så att kalkylatorn och listan kommer närmare. */}
          <ul className="mt-7 hidden space-y-3 sm:block">
            {[
              billigast
                ? `Från ${kr(snittForstaAret(billigast.a))} i månaden i snitt första året`
                : "Alla operatörer på ett ställe",
              "Totalkostnad över ett och två år, inte bara kampanjpriset",
              "Gratis, utan konto och utan säljare som ringer",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[16px] text-white">
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-4 w-4" aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#alla" className="btn-cta">
              Visa alla abonnemang
              <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              to="/foretag"
              className="inline-flex min-h-14 items-center gap-2 rounded-[14px] border border-white/40 px-6 font-display font-semibold text-white hover:bg-white/10"
            >
              För företag
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-2 text-[13.5px] text-white/75">
            <span aria-hidden className="inline-block h-2 w-2 rounded-full bg-live" />
            Priserna kontrollerades senast {datumText(SENAST_KONTROLLERAD)}
          </p>
        </div>
        <SparKalkyl onResultat={onResultat} />
      </div>
    </section>
  );
}

function Fortroenderand() {
  const punkter = [
    {
      ikon: Receipt,
      t: "Pris efter kampanjen",
      d: "Vi visar vad du betalar efter kampanjen, inte bara första månaden.",
    },
    {
      ikon: Search,
      t: "Källa på varje pris",
      d: "Länk till operatörens sida och datum för kontrollen.",
    },
    {
      ikon: Radio,
      t: "Nätet står ut",
      d: "Du ser i vilket av de fyra mobilnäten varje operatör kör.",
    },
    {
      ikon: Wallet,
      t: "Ingen betald placering",
      d: "Ordningen styrs av pris, aldrig av ersättning.",
    },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <ul className="mx-auto grid max-w-7xl gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {punkter.map(({ ikon: Ikon, t, d }) => (
          <li key={t} className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight text-primary">
              <Ikon className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block text-[15.5px] font-bold text-foreground">{t}</span>
              <span className="block text-[14px] leading-snug text-foreground/70">{d}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- Genvägar ---------------- */

const GENVAGAR = [
  {
    to: "/billigaste-mobilabonnemang",
    ikon: Wallet,
    t: "Billigaste",
    d: "Lägst totalpris per surfmängd",
  },
  {
    to: "/obegransad-surf",
    ikon: InfinityIcon,
    t: "Obegränsad surf",
    d: "Fri surf utan att räkna GB",
  },
  { to: "/utan-bindningstid", ikon: CalendarX2, t: "Utan bindningstid", d: "Byt när du vill" },
  { to: "/familjeabonnemang", ikon: Users, t: "Familj", d: "Flera kort och delad surf" },
  { to: "/kampanjer", ikon: Tag, t: "Kampanjer", d: "Alla erbjudanden, räknat på hela året" },
  { to: "/barn", ikon: Baby, t: "Barn och unga", d: "Spärrar, kostnadstak och pris" },
  { to: "/studentabonnemang", ikon: GraduationCap, t: "Studenter", d: "Studentpris och mer surf" },
  { to: "/pensionar", ikon: Check, t: "Pensionärer", d: "Enkelt, tryggt och billigt" },
  { to: "/kontantkort", ikon: Receipt, t: "Kontantkort", d: "Ingen faktura, inget avtal" },
  { to: "/foretag", ikon: Briefcase, t: "Företag", d: "Priser exkl. moms, per användare" },
] as const;

function Genvagar() {
  return (
    <SectionShell>
      <SectionHeader
        title="Vad är viktigast för dig?"
        sub="Välj det som styr ditt val, så visar vi abonnemangen som passar och förklarar vad du ska tänka på."
      />
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {GENVAGAR.map(({ to, ikon: Ikon, t, d }) => (
          <li key={to}>
            <Link
              to={to as never}
              className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-kort sm:p-5"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-highlight text-primary">
                <Ikon className="h-5 w-5" aria-hidden />
              </span>
              <span className="mt-3 font-display text-[17px] font-bold text-foreground group-hover:text-primary">
                {t}
              </span>
              <span className="mt-1 text-[14px] leading-snug text-foreground/70">{d}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

/* ---------------- Så fungerar det ---------------- */

function SaFungerarDet() {
  const steg = [
    {
      t: "Ta reda på hur mycket du surfar",
      d: "Kolla förbrukningen de senaste månaderna i mobilens inställningar eller i operatörens app. Många behöver mindre än de tror.",
      lank: { to: "/verktyg/hur-mycket-surf-behover-jag", label: "Räkna ut ditt surfbehov" },
    },
    {
      t: "Jämför priset över ett helt år",
      d: "Ett kampanjpris i tre månader väger lätt över tolv. Vi räknar snittet åt dig, med startavgiften inräknad.",
      lank: { to: "/guider/kampanjpris-efter-kampanjen", label: "Så fungerar kampanjpriser" },
    },
    {
      t: "Beställ och behåll ditt nummer",
      d: "Den nya operatören flyttar numret och avslutar det gamla abonnemanget åt dig. Avbrottet får vara högst en arbetsdag.",
      lank: { to: "/guider/byta-operator-behalla-nummer", label: "Byta operatör steg för steg" },
    },
  ];
  return (
    <section className="bg-dark-section text-white">
      <SectionShell>
        <SectionHeader
          dark
          title="Så byter du till ett billigare abonnemang"
          sub="Tre steg och ungefär tio minuter. Numret följer med, och du behöver inte säga upp något själv."
        />
        <ol className="grid gap-5 md:grid-cols-3">
          {steg.map((s, i) => (
            <li key={s.t} className="rounded-2xl border border-white/12 bg-white/[0.05] p-6">
              <span className="font-display text-[40px] font-bold leading-none text-dark-accent">
                {i + 1}
              </span>
              <h3 className="mt-4 text-white">{s.t}</h3>
              <p className="mt-3 text-[15.5px] leading-relaxed text-dark-muted">{s.d}</p>
              <Link
                to={s.lank.to as never}
                className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-white underline underline-offset-4 hover:text-dark-accent"
              >
                {s.lank.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
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
        title="Fyra mobilnät, många operatörer"
        sub="Alla operatörer i Sverige kör i något av fyra nät. Väljer du en billigare operatör i samma nät får du samma täckning."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {perNat.map(({ nat, operatorer }) => (
          <Link
            key={nat.id}
            to="/nat/$slug"
            params={{ slug: nat.id }}
            className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-kort"
          >
            <span className="font-display text-[19px] font-bold text-foreground group-hover:text-primary">
              {nat.namn}
            </span>
            <span className="mt-1 text-[13.5px] text-foreground/65">{nat.agare}</span>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {operatorer.map((o) => (
                <li
                  key={o.slug}
                  className="rounded-full bg-muted px-2.5 py-1 text-[13px] font-semibold text-foreground"
                >
                  {o.namn}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
      <Link
        to="/nat"
        className="mt-8 inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
      >
        Vilket nät har bäst täckning?
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </SectionShell>
  );
}

/* ---------------- Operatörer ---------------- */

function OperatorSektion() {
  const lista = OPERATORER.filter((o) => PRIVATA.some((a) => a.operator === o.slug));
  return (
    <section className="border-y border-border bg-surface">
      <SectionShell>
        <SectionHeader
          title="Operatörerna vi jämför"
          sub="Varje operatör har en egen sida med alla abonnemang, villkor, nät och vad kunderna tycker enligt Svenskt Kvalitetsindex."
        />
        <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
          {lista.map((o) => {
            // Samma mått som listan: snittpris första året, bland abonnemang alla kan teckna.
            const billigaste = PRIVATA.filter((a) => a.operator === o.slug && !arVillkorat(a)).sort(
              (a, b) => snittForstaAret(a) - snittForstaAret(b),
            )[0];
            return (
              <li key={o.slug}>
                <Link
                  to="/operatorer/$slug"
                  params={{ slug: o.slug }}
                  className="group flex h-full items-center gap-2.5 rounded-2xl border border-border p-3 transition-shadow hover:shadow-kort sm:gap-3 sm:p-4"
                >
                  <OperatorMonogram namn={o.namn} size={36} />
                  <span className="min-w-0">
                    <span className="block font-display text-[16px] font-bold text-foreground group-hover:text-primary">
                      {o.namn}
                    </span>
                    {billigaste && (
                      <span className="block text-[13px] text-foreground/65">
                        Från {kr(snittForstaAret(billigaste))}/mån · {gbText(billigaste.gb)}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-8 flex flex-wrap gap-x-6">
          <Link
            to="/operatorer"
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            Alla operatörer
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            to="/jamfor"
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-primary hover:underline"
          >
            Jämför två operatörer
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </SectionShell>
    </section>
  );
}

/* ---------------- Företag ---------------- */

function ForetagSektion() {
  const b = bild("kontor-motesrum");
  return (
    <SectionShell>
      <div className="grid items-center gap-10 overflow-hidden rounded-[28px] bg-dark-section p-6 text-white sm:p-10 lg:grid-cols-2 lg:p-14">
        <div>
          <h2 className="font-bold text-white" style={{ fontSize: "clamp(28px, 3.6vw, 40px)" }}>
            Mobilabonnemang för företag
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-dark-muted">
            Priser exkl. moms per användare, delad surf, växel och vad som gäller för enskild firma.
            Jämför operatörernas företagsabonnemang och räkna ut vad hela företaget betalar per år.
          </p>
          <ul className="mt-6 space-y-2.5">
            {[
              "Kostnad per anställd och år, med och utan moms",
              "Vad som är förmån och vad som är arbetsredskap",
              "Från enskild firma till 50 anställda",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5 text-[15.5px]">
                <Check className="mt-1 h-4 w-4 shrink-0 text-dark-accent" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/foretag" className="btn-cta">
              Jämför företagsabonnemang
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/verktyg/foretagskalkylator"
              className="inline-flex min-h-14 items-center gap-2 rounded-[14px] border border-white/40 px-6 font-display font-semibold text-white hover:bg-white/10"
            >
              <Calculator className="h-4 w-4" aria-hidden />
              Företagskalkylator
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <picture>
            <source srcSet={b.thumbWebp} type="image/webp" />
            <img
              src={b.thumb}
              alt={b.alt}
              {...storMatt(b.nyckel)}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </picture>
        </div>
      </div>
    </SectionShell>
  );
}

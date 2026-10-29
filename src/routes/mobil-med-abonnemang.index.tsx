import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { GuideTable } from "@/components/guide-page";
import { datumText, kr } from "@/lib/mobil/berakna";
import { operator } from "@/lib/mobil/data";
import { TELEFONERBJUDANDEN } from "@/lib/mobil/telefon-data";
import {
  TELEFONMODELLER,
  TELEFON_FAKTA,
  TELEFON_KONTROLLERAD,
  erbjudandenFor,
  modellNamn,
  opNamn,
  sjalvKop,
} from "@/lib/mobil/telefon";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/mobil-med-abonnemang";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Mobil med abonnemang", path: PATH },
];

const RADER = TELEFONMODELLER.map((m) => {
  const lista = erbjudandenFor(m.slug);
  const billigast = lista.find((e) => e.minstaTotal != null) ?? null;
  const sjalv = billigast ? sjalvKop(m, billigast) : null;
  return { m, lista, billigast, sjalv };
});

const OPS = [...new Set(TELEFONERBJUDANDEN.map((e) => e.operator))];
const SJALV_BILLIGARE = RADER.filter(
  (r) => r.sjalv && r.billigast && r.sjalv.total < (r.billigast.minstaTotal as number),
);
const JAMFORDA = RADER.filter((r) => r.sjalv && r.billigast);
const PAKET_BILLIGARE = JAMFORDA.length - SJALV_BILLIGARE.length;

/** Alla paket med totalkostnad, och hur många av dem som slogs av att köpa själv. */
const ALLA_PAKET = RADER.flatMap((r) =>
  r.lista
    .filter((e) => e.minstaTotal != null)
    .map((e) => ({ e, s: sjalvKop(r.m, e) }))
    .filter((x) => x.s != null),
);
const PAKET_SLAGNA = ALLA_PAKET.filter((x) => x.s!.total < (x.e.minstaTotal as number)).length;

/** Hur varje operatör säljer mobiler, ur deras egna villkor. */
const SA_GOR_OPERATORERNA: { op: string; text: string }[] = [
  {
    op: "telia",
    text: "Räntefri delbetalning i 36 månader. Rabatt på mobilen när du tar ett abonnemang med 24 månaders bindning.",
  },
  {
    op: "tele2",
    text: "Delbetalning i upp till 36 månader med abonnemang och 24 månaders bindning. Samma totalpris om du betalar direkt.",
  },
  {
    op: "telenor",
    text: "Delbetalning i 24 eller 36 månader. Uppläggningsavgift 295 kr på första fakturan.",
  },
  { op: "tre", text: "Räntefri delbetalning utan uppläggningsavgift i 24, 36 eller 48 månader." },
  {
    op: "comviq",
    text: "Räntefri delbetalning i 24 eller 36 månader med abonnemang och 24 månaders bindning.",
  },
  {
    op: "hallon",
    text: "Räntefri delbetalning utan avgifter i 36 månader. Kräver ett Hallon-abonnemang, som betalas separat.",
  },
  {
    op: "vimla",
    text: "Säljer mobilen fristående, med eller utan Vimla-abonnemang. Delbetalning via Klarna.",
  },
];

const FAQ = [
  {
    q: "Är det billigare att köpa mobil med abonnemang?",
    a: `Det beror på operatören. Billigaste paketet var billigare än att köpa mobilen själv för ${PAKET_BILLIGARE} av ${JAMFORDA.length} modeller vi räknat på. Men för ${PAKET_SLAGNA} av ${ALLA_PAKET.length} paket var det billigare att köpa mobilen hos tillverkaren och ta billigaste abonnemanget utan bindning, räknat under samma tid. Operatörerna ger ofta rabatt på mobilen, men abonnemanget i paketet är ofta dyrare.`,
  },
  {
    q: "Hur lång är avbetalningstiden?",
    a: "Oftast 36 månader. Tre erbjuder upp till 48 månader och Telenor och Comviq även 24. Bindningstiden för abonnemanget är oftast 24 månader, kortare än avbetalningen.",
  },
  {
    q: "Kostar det ränta att delbetala mobilen hos operatören?",
    a: "Hos de flesta är det räntefritt. Telenor tar en uppläggningsavgift på 295 kr. Betalar du för sent kan avtalet övergå till kredit med ränta.",
    kalla: "Operatörernas webbplatser och Konsumenternas Bank- och finansbyrå",
  },
  {
    q: "Gör operatören en kreditprövning?",
    a: "Ja. Innan du får delbetala ska kreditgivaren pröva om du har ekonomiska förutsättningar att betala, oavsett beloppets storlek. Du har 14 dagars ångerrätt på kreditavtalet.",
    kalla: "Konsumenternas Bank- och finansbyrå",
  },
  {
    q: "Kan jag byta operatör innan mobilen är betald?",
    a: "Ja, men du betalar resten av mobilen ändå och abonnemanget till bindningstiden är slut. Läs om att byta operatör med bindningstid.",
  },
];

export const Route = createFileRoute("/mobil-med-abonnemang/")({
  head: () =>
    pageHead({
      title: "Mobil med abonnemang: jämför iPhone och Samsung | Mobilpoolen",
      description: `Jämför ${TELEFONMODELLER.length} mobiler med abonnemang hos ${OPS.length} operatörer. Se totalkostnaden och om det är billigare att köpa mobilen själv.`,
      canonical: PATH,
      scripts: [
        breadcrumbJsonLd(TRAIL),
        faqJsonLd(FAQ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Mobiler med abonnemang",
          itemListElement: RADER.map((r, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${modellNamn(r.m)} med abonnemang`,
            url: `https://mobilpoolen.se${PATH}/${r.m.slug}`,
          })),
        }),
      ],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobil med abonnemang: jämför iPhone, Samsung och Pixel"
      ingress={
        <p>
          Billigaste paketet med mobil och abonnemang slog att köpa mobilen själv för{" "}
          {PAKET_BILLIGARE} av {JAMFORDA.length} modeller vi räknat på. Men valet av operatör avgör:
          för {PAKET_SLAGNA} av {ALLA_PAKET.length} paket var det billigare att köpa mobilen hos
          tillverkaren och ta billigaste abonnemanget utan bindningstid. Här ser du totalkostnaden
          för {TELEFONMODELLER.length} populära mobiler hos {OPS.length} operatörer.
        </p>
      }
      nyckeltal={[
        { varde: String(TELEFONMODELLER.length), text: "mobiler jämförda" },
        {
          varde: String(TELEFONERBJUDANDEN.length),
          text: `erbjudanden hos ${OPS.length} operatörer`,
        },
        {
          varde: `${PAKET_SLAGNA} av ${ALLA_PAKET.length}`,
          text: "paket där det var billigare att köpa mobilen själv",
        },
      ]}
      jamforelse={
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {RADER.map((r) => (
            <li key={r.m.slug}>
              <Link
                to={"/mobil-med-abonnemang/$modell" as never}
                params={{ modell: r.m.slug } as never}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-kort-litet transition-[box-shadow,translate] hover:-translate-y-0.5 hover:shadow-kort sm:p-5"
              >
                <span className="font-display text-[17px] font-bold text-foreground group-hover:text-primary">
                  {modellNamn(r.m)}
                </span>
                <span className="mt-1 text-[14px] text-foreground/70">
                  {r.billigast
                    ? `Lägst totalt ${kr(r.billigast.minstaTotal as number)} hos ${opNamn(r.billigast)}`
                    : `${r.lista.length} erbjudanden`}
                </span>
                {r.m.tillverkarpris != null && (
                  <span className="text-[13.5px] text-foreground/60">
                    {r.m.marke}s pris {kr(r.m.tillverkarpris)}
                  </span>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                  Jämför {r.lista.length} operatörer <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      }
      jamforelseRubrik="Välj mobil"
      jamforelseIngress="Totalt betyder mobilen plus operatörens exempelabonnemang under bindningstiden, med engångsavgifter."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/mobil-med-eller-utan-abonnemang",
          label: "Mobil med eller utan abonnemang?",
          text: "Så räknar du på det.",
        },
        {
          href: "/guider/byta-operator-med-bindningstid",
          label: "Byta operatör med bindningstid",
          text: "Vad det kostar att byta innan mobilen är betald.",
        },
        { href: "/utan-bindningstid", label: "Abonnemang utan bindningstid" },
        { href: "/kampanjer", label: "Kampanjer just nu" },
      ]}
      ctaRubrik="Hitta abonnemanget till din nya mobil"
      ctaBild="par-hemma-morgon"
      uppdaterad={TELEFON_KONTROLLERAD}
    >
      <h2>Paketet eller köpa mobilen själv?</h2>
      <p>
        Vi har räknat på billigaste paketet för varje modell och jämfört med att köpa mobilen hos
        tillverkaren och ta billigaste abonnemanget utan bindningstid med minst lika mycket surf,
        under samma tid.
      </p>
      <GuideTable
        brytForsta
        head={["Mobil", "Billigaste paketet", "Köpa själv", "Billigast"]}
        rows={JAMFORDA.map((r) => [
          modellNamn(r.m),
          `${kr(r.billigast!.minstaTotal as number)} (${opNamn(r.billigast!)})`,
          kr(r.sjalv!.total),
          r.sjalv!.total < (r.billigast!.minstaTotal as number) ? "Köpa själv" : "Paketet",
        ])}
      />

      <h2>Så säljer operatörerna mobiler</h2>
      <ul>
        {SA_GOR_OPERATORERNA.filter((s) => OPS.includes(s.op)).map((s) => (
          <li key={s.op}>
            <strong>{operator(s.op)?.namn ?? s.op}:</strong> {s.text}
          </li>
        ))}
      </ul>
      <p>Fello och Chilimobil sålde inga av de här modellerna nya när vi kontrollerade.</p>

      <h2>Regler för delbetalning</h2>
      <ul>
        {TELEFON_FAKTA.filter(
          // Konsumentkreditlagen (2010:1846) ersätts 20 november 2026, så den citeras inte här.
          (f) => /kreditprövning|ränte/i.test(f.pastaende) && !/2010:1846/.test(f.pastaende),
        )
          .slice(0, 4)
          .map((f) => (
            <li key={f.pastaende}>{f.pastaende}</li>
          ))}
      </ul>
      <p className="kalla">
        Källa: operatörernas, Apples, Samsungs och Googles webbplatser, kontrollerade{" "}
        {datumText(TELEFON_KONTROLLERAD)}. Regler: Konsumenternas Bank- och finansbyrå och
        konsumentkreditlagen.
      </p>
    </PelarSida>
  );
}

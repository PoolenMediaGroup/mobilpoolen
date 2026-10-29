import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { PRIVATA, FORETAG, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { MARKNAD, KALLOR } from "@/lib/mobil/fakta";
import { datumText } from "@/lib/mobil/berakna";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead, absoluteUrl } from "@/lib/seo";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Verktyg", path: "/verktyg" },
];

const VERKTYG = [
  {
    href: "/verktyg/hur-mycket-surf-behover-jag",
    namn: "Hur mycket surf behöver jag?",
    text: "Fyll i hur mycket film och musik du strömmar utanför wifi. Du får ett surfbehov i GB per månad och de tre billigaste abonnemangen som räcker.",
  },
  {
    href: "/verktyg/betalar-jag-for-mycket",
    namn: "Betalar jag för mycket?",
    text: "Jämför ditt nuvarande pris med det billigaste abonnemanget med minst samma surf. Räknaren tar med kvarvarande bindningstid och visar om du bör byta nu eller vänta.",
  },
  {
    href: "/verktyg/kampanjkalkylator",
    namn: "Kampanjkalkylator",
    text: "Lägg två eller tre abonnemang bredvid varandra och se totalkostnaden över 12 och 24 månader, med kampanjpris, ordinarie pris och startavgift.",
  },
  {
    href: "/verktyg/foretagskalkylator",
    namn: "Företagskalkylator",
    text: "Räkna ut vad mobilerna kostar företaget per månad och per år, per användare och totalt, både exklusive och inklusive moms.",
  },
  {
    href: "/prisindex",
    namn: "Mobilpoolens prisindex",
    text: "Billigaste, median och dyraste snittpris per surfnivå, andel kampanjer och hur mycket priset stiger när kampanjen tar slut. Tabellerna kan laddas ner som CSV.",
  },
];

const FAQ = [
  {
    q: "Kostar verktygen något?",
    a: "Nej. Alla verktyg är gratis och kräver ingen inloggning. Uträkningen görs i din webbläsare och vi sparar ingenting av det du fyller i.",
  },
  {
    q: "Var kommer priserna i verktygen från?",
    a: `Från operatörernas egna webbplatser. Varje abonnemang har en länk till sidan där priset står, och priserna kontrollerades senast ${datumText(SENAST_KONTROLLERAD)}. Kampanjer ändras ofta, så det som gäller är alltid det operatören visar när du beställer.`,
  },
  {
    q: "Hur mycket surf använder svenskarna i snitt?",
    a: `Abonnemang med samtal och data använde i genomsnitt ${MARKNAD.surfPerManad} GB per månad 2025, enligt PTS. Året innan var snittet ${MARKNAD.surfPerManad2024} GB.`,
    kalla: KALLOR.ptsMarknad.namn,
  },
];

export const Route = createFileRoute("/verktyg/")({
  head: () =>
    pageHead({
      title: "Verktyg och kalkylatorer för mobilabonnemang | Mobilpoolen",
      description:
        "Gratis kalkylatorer: räkna ut hur mycket surf du behöver, om du betalar för mycket, vad en kampanj kostar på två år och vad företagets mobiler kostar.",
      canonical: "/verktyg",
      scripts: [
        breadcrumbJsonLd(TRAIL),
        faqJsonLd(FAQ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Mobilpoolens verktyg",
          itemListElement: VERKTYG.map((v, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: v.namn,
            url: absoluteUrl(v.href),
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
      rubrik="Verktyg och kalkylatorer för mobilabonnemang"
      ingress={
        <p>
          Här räknar du själv. Ta reda på hur mycket surf du behöver, om ditt abonnemang är för
          dyrt, vad en kampanj kostar när den tagit slut och vad företagets mobiler kostar med och
          utan moms. Alla verktyg använder samma priser som jämförelsen, hämtade från operatörernas
          egna sidor.
        </p>
      }
      nyckeltal={[
        { varde: String(PRIVATA.length), text: "abonnemang för privatpersoner i verktygen" },
        { varde: String(FORETAG.length), text: "företagsabonnemang i företagskalkylatorn" },
        {
          varde: `${MARKNAD.surfPerManad} GB`,
          text: "surf per månad i snitt 2025, enligt PTS",
        },
      ]}
      jamforelse={
        <ul className="grid gap-4 md:grid-cols-2">
          {VERKTYG.map((v) => (
            <li key={v.href}>
              <Link
                to={v.href as never}
                className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-kort"
              >
                <span className="flex items-center justify-between gap-3 font-display text-[21px] font-bold group-hover:text-primary">
                  {v.namn}
                  <ArrowRight className="h-5 w-5 shrink-0" aria-hidden />
                </span>
                <span className="mt-2 text-[15.5px] text-foreground/80">{v.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      }
      jamforelseRubrik="Välj ett verktyg"
      faq={FAQ}
      lankar={[
        {
          href: "/sa-jamfor-vi",
          label: "Så jämför vi",
          text: "Varifrån priserna kommer och hur vi räknar snittpriset.",
        },
        {
          href: "/guider/kampanjpris-efter-kampanjen",
          label: "När kampanjpriset tar slut",
          text: "Så räknar du på hela året i stället för första månaden.",
        },
        {
          href: "/saga-upp",
          label: "Säga upp abonnemanget",
          text: "Uppsägningstid, bindningstid och nummerflytt.",
        },
      ]}
      ctaBild="miniraknare-kalkyl"
      uppdaterad="2026-10-29"
    >
      <h2>Hur räknar verktygen?</h2>
      <p>
        Verktygen räknar med samma uppgifter som jämförelsen. För varje abonnemang har vi ordinarie
        pris, eventuellt kampanjpris och hur länge det gäller, startavgift och bindningstid. Det
        ärliga måttet är vad du betalar totalt: ett lågt pris i några månader väger lätt när du
        räknar på ett eller två år.
      </p>
      <p>
        Inget av det du fyller i skickas till oss eller sparas. Läs mer om{" "}
        <Link to="/sa-jamfor-vi">hur vi jämför</Link>.
      </p>
    </PelarSida>
  );
}

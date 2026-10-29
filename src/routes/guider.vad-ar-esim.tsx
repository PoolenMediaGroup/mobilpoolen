import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  H3,
  OL,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { MOBILNAT, OPERATORER, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText } from "@/lib/mobil/berakna";
import type { Operator } from "@/lib/mobil/typer";

const SLUG = "vad-ar-esim";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const AKTIVA = OPERATORER.filter((o) => o.aktiv);
const MED_ESIM = AKTIVA.filter((o) => o.esim === true);
const UTAN_ESIM = AKTIVA.filter((o) => o.esim === false);
const OKANT = AKTIVA.filter((o) => o.esim == null);

function lista(o: Operator[]): string {
  const namn = o.map((x) => x.namn);
  if (namn.length < 2) return namn.join("");
  return `${namn.slice(0, -1).join(", ")} och ${namn[namn.length - 1]}`;
}

function esimText(v: boolean | null): string {
  if (v == null) return "Uppgift saknas";
  return v ? "Ja" : "Nej";
}

const TOC = [
  { id: "vad-ar", label: "Vad är eSIM?" },
  { id: "operatorer", label: "Vilka operatörer har eSIM?" },
  { id: "telefoner", label: "Vilka telefoner stöder eSIM?" },
  { id: "aktivera", label: "Så aktiverar du eSIM" },
  { id: "flytta", label: "Byta telefon eller operatör" },
  { id: "fragor", label: "Vanliga frågor" },
];

function faq() {
  return [
    {
      q: "Vad är eSIM?",
      a: "Ett eSIM är ett SIM-kort som är inbyggt i telefonen. I stället för att sätta i ett plastkort laddar du ned abonnemanget digitalt, oftast genom att skanna en QR-kod eller via operatörens app. Numret och abonnemanget fungerar som vanligt.",
    },
    {
      q: "Vilka operatörer har eSIM?",
      a: `Enligt operatörernas webbplatser erbjuder ${lista(MED_ESIM)} eSIM. ${OKANT.length > 0 ? `För ${lista(OKANT)} har vi inte kunnat bekräfta det.` : ""}`.trim(),
      kalla: `operatörernas webbplatser, kontrollerade ${datumText(SENAST_KONTROLLERAD)}`,
    },
    {
      q: "Kostar eSIM något?",
      a: "Det beror på operatören. Tre och Hallon anger att eSIM är gratis. Flera andra operatörer anger inte någon avgift. Kontrollera i prislistan innan du beställer, särskilt om du vill byta från vanligt SIM-kort.",
    },
    {
      q: "Kan jag ha både eSIM och vanligt SIM-kort?",
      a: "Ja, i många telefoner. Då kan du till exempel ha ett privat och ett jobbnummer i samma telefon. Kontrollera i telefonens specifikationer att den stöder två SIM samtidigt.",
    },
    {
      q: "Går nummerflytten snabbare med eSIM?",
      a: "Det kan gå det, eftersom inget kort ska skickas. Chilimobil anger till exempel cirka två dagar med eSIM och cirka sju arbetsdagar med SIM-kort. Själva avbrottet när numret flyttas får enligt lag vara högst en arbetsdag.",
    },
  ];
}

export const Route = createFileRoute("/guider/vad-ar-esim")({
  head: () =>
    pageHead({
      title: `${guide.title} | Mobilpoolen`,
      description: guide.excerpt,
      socialTitle: guide.title,
      canonical: `/guider/${SLUG}`,
      ogType: "article",
      scripts: [
        guideBreadcrumb(guide.title, `/guider/${SLUG}`),
        articleJsonLd({
          title: guide.title,
          description: guide.excerpt,
          path: `/guider/${SLUG}`,
          publishedIso: guide.publishedIso,
          updatedIso: guide.updatedIso,
        }),
        faqJsonLd(faq()),
      ],
    }),
  component: Page,
});

function Page() {
  const FAQ = faq();
  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med eSIM" }}
    >
      <P>
        Ett eSIM är ett digitalt SIM-kort som är inbyggt i telefonen. Du aktiverar abonnemanget
        genom att skanna en QR-kod eller via operatörens app, utan att vänta på ett kort med posten.
        Av de {AKTIVA.length} operatörer vi har gått igenom erbjuder {MED_ESIM.length} eSIM enligt
        sina webbplatser. Telefonen måste också stödja det.
      </P>

      <H2 id="vad-ar">Vad är eSIM och hur fungerar det?</H2>
      <P>
        Det e som står i eSIM betyder embedded, alltså inbyggt. Chippet sitter fast i telefonen och
        kan laddas med en eller flera operatörers profiler. Abonnemanget fungerar precis som med ett
        vanligt SIM-kort: samma nummer, samma surf och samma nät.
      </P>
      <P>Fördelarna i vardagen:</P>
      <UL>
        <li>Du kan börja använda abonnemanget direkt, utan att vänta på ett kort.</li>
        <li>Inget kort att tappa bort eller byta storlek på.</li>
        <li>
          Många telefoner kan ha både eSIM och vanligt SIM, så du kan ha två nummer i samma telefon.
        </li>
        <li>
          Ett eSIM kan inte tas ut ur en stulen telefon och sättas i en annan, som ett plastkort
          kan.
        </li>
      </UL>
      <P>
        Nackdelen är att det kräver lite mer när du byter telefon. Det kan inte bara flyttas över
        med fingrarna, utan måste överföras eller beställas på nytt. Mer om det längre ned.
      </P>

      <H2 id="operatorer">Vilka operatörer har eSIM?</H2>
      <P>
        Så här ser det ut enligt operatörernas egna webbplatser. &rdquo;Uppgift saknas&rdquo;
        betyder att vi inte har kunnat bekräfta eSIM hos operatören, inte att det saknas.
      </P>
      <GuideTable
        brytForsta
        head={["Operatör", "Nät", "eSIM"]}
        rows={AKTIVA.map((o) => [
          o.namn,
          o.natNotis ? "Anges inte" : MOBILNAT[o.nat].namn,
          esimText(o.esim),
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
        {UTAN_ESIM.length > 0 && ` ${lista(UTAN_ESIM)} anger att eSIM inte erbjuds.`}
      </p>
      <H3>Vad operatörerna själva säger</H3>
      <UL>
        <li>
          <strong>Tre</strong> anger att eSIM är kostnadsfritt och aktiveras med BankID på 5 till 10
          minuter. När eSIM aktiveras slutar det fysiska SIM-kortet att fungera.
        </li>
        <li>
          <strong>Hallon</strong> anger eSIM utan extra kostnad.
        </li>
        <li>
          <strong>Chilimobil</strong> anger att en nummerflytt tar cirka två dagar med eSIM, mot
          cirka sju arbetsdagar med SIM-kort.
        </li>
        <li>
          <strong>Telia</strong> har eSIM för klockor, som kostar 69 kronor i månaden enligt Telia.
        </li>
      </UL>
      <P>
        Alla abonnemang hos operatörer med eSIM finns samlade på sidan om{" "}
        <A href="/esim">mobilabonnemang med eSIM</A>.
      </P>

      <H2 id="telefoner">Vilka telefoner stöder eSIM?</H2>
      <P>
        De flesta nyare iPhone-modeller och många Android-telefoner från de större tillverkarna
        stöder eSIM. Enklare och äldre modeller gör det ofta inte. Telefoner som är köpta utomlands
        kan också skilja sig från samma modell sålda i Sverige.
      </P>
      <P>Så kontrollerar du din telefon:</P>
      <UL>
        <li>
          <strong>iPhone:</strong> gå till Inställningar och Mobilnät. Finns valet att lägga till
          ett eSIM eller en mobilplan stöder telefonen det.
        </li>
        <li>
          <strong>Android:</strong> leta under Anslutningar eller Nätverk och internet, SIM-kort.
          Där finns valet att lägga till eSIM om telefonen har det.
        </li>
        <li>Är du osäker: sök på modellens namn och eSIM hos tillverkaren.</li>
      </UL>
      <Callout>
        En telefon som är låst till en operatör kan inte använda eSIM från en annan. Har du köpt
        telefonen med abonnemang och bindningstiden har gått ut ska operatören ta bort låset
        kostnadsfritt om du ber om det, enligt 12 kap. 15 § lagen om elektronisk kommunikation.
      </Callout>

      <H2 id="aktivera">Så aktiverar du eSIM</H2>
      <P>Exakt hur det går till skiljer sig mellan operatörerna, men grunden är densamma:</P>
      <OL>
        <li>
          Beställ abonnemanget och välj eSIM. Har du redan ett abonnemang kan du ofta byta till eSIM
          i operatörens app eller på Mina sidor.
        </li>
        <li>Identifiera dig, oftast med BankID.</li>
        <li>
          Skanna QR-koden du får, eller följ anvisningarna i appen. Telefonen behöver vara
          uppkopplad mot wifi eller mobildata under tiden.
        </li>
        <li>
          Välj vilket nummer som ska användas för samtal och surf om du har två SIM i telefonen.
        </li>
      </OL>
      <P>
        Flyttar du numret från en annan operatör sköter den nya operatören flytten. Läs mer om{" "}
        <A href="/guider/byta-operator-behalla-nummer">hur du byter operatör och behåller numret</A>
        .
      </P>

      <H2 id="flytta">eSIM när du byter telefon eller operatör</H2>
      <P>
        <strong>Ny telefon:</strong> många telefoner kan föra över eSIM direkt från den gamla när du
        flyttar dina data, särskilt mellan två telefoner av samma märke. Fungerar det inte beställer
        du ett nytt eSIM hos operatören. Radera inte eSIM i den gamla telefonen innan det nya
        fungerar, så att du inte står utan nummer.
      </P>
      <P>
        <strong>Ny operatör:</strong> numret följer med som vanligt. Avbrottet får enligt lag vara
        högst en arbetsdag, och du har rätt att flytta numret i minst en månad efter att det gamla
        avtalet har upphört.
      </P>
      <P>
        <strong>Utomlands:</strong> det finns också eSIM som bara är till för att surfa på resor.
        Inom EU och EES surfar du med ditt vanliga abonnemang, se{" "}
        <A href="/guider/surfa-i-eu">surfa i EU</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

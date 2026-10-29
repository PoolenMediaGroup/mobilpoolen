import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { KALLOR, MARKNAD } from "@/lib/mobil/fakta";
import {
  bindningText,
  datumText,
  formatTal,
  gbText,
  kr,
  snittForstaAret,
  sortera,
} from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "racker-5-gb-surf";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const GB = 5;

/** Netflix Help Center: Automatiskt i mobilen ger cirka 4 timmar per GB. */
const NETFLIX_AUTO_TIMMAR = GB * 4;
/** Netflix Help Center: HD drar upp till 3 GB per timme. */
const NETFLIX_HD_TIMMAR = Math.round((GB / 3) * 10) / 10;
/** Spotify Support: Normal cirka 96 kbit/s, omräknat till MB per timme. */
const SPOTIFY_NORMAL_MB = Math.round((96 * 3600) / 8000);
const SPOTIFY_TIMMAR = Math.round((GB * 1000) / SPOTIFY_NORMAL_MB);

/** Abonnemang utan ålders- eller studentkrav, som alla kan teckna. */
const allmant = (a: Abonnemang) =>
  !a.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung");

/** Ett abonnemang per operatör och surfmängd, det med kortast bindningstid. */
function unika(lista: Abonnemang[]): Abonnemang[] {
  const per = new Map<string, Abonnemang>();
  for (const a of lista) {
    const nyckel = `${a.operator}-${a.gb ?? "obegr"}`;
    const fore = per.get(nyckel);
    if (!fore || (a.bindning ?? 99) < (fore.bindning ?? 99)) per.set(nyckel, a);
  }
  return [...per.values()];
}

const namn = (a: Abonnemang) => `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;

const TOC = [
  { id: "vad-motsvarar", label: "Vad räcker 5 GB till?" },
  { id: "for-vem", label: "Vem räcker 5 GB för?" },
  { id: "priser", label: "Abonnemang med 5 GB just nu" },
  { id: "mer-surf", label: "När lönar sig mer surf?" },
  { id: "fragor", label: "Vanliga frågor" },
];

export const Route = createFileRoute("/guider/racker-5-gb-surf")({
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

/** Alla abonnemang med 5 GB, även kampanjvarianter med bindningstid. */
function femGb() {
  return sortera(
    PRIVATA.filter((a) => a.gb === GB && allmant(a) && !a.kontantkort),
    "snitt-ar",
  );
}

/** Steget upp från 5 GB hos samma operatör, ordinarie pris. */
function stegUpp() {
  return sortera(unika(femGb()), "snitt-ar")
    .map((fem) => {
      const storre = unika(
        PRIVATA.filter(
          (a) =>
            a.operator === fem.operator &&
            a.gb != null &&
            a.gb > GB &&
            allmant(a) &&
            !a.kontantkort,
        ),
      ).sort((a, b) => (a.gb ?? 0) - (b.gb ?? 0))[0];
      return storre ? { fem, storre, skillnad: storre.pris - fem.pris } : null;
    })
    .filter((x): x is { fem: Abonnemang; storre: Abonnemang; skillnad: number } => x != null);
}

function faq() {
  const billigast = femGb()[0];
  return [
    {
      q: "Räcker 5 GB surf i månaden?",
      a: `För många gör det. 5 GB räcker om du mest surfar, chattar och lyssnar på musik och har wifi hemma och på jobbet. Det räcker sämre om du tittar på video utan wifi. Snittet i Sverige var ${MARKNAD.surfPerManad} GB i månaden under 2025 enligt PTS.`,
    },
    {
      q: "Hur många timmar Netflix är 5 GB?",
      a: `Med inställningen Automatiskt i Netflix mobilapp ger 1 GB cirka 4 timmar, så 5 GB räcker till ungefär ${NETFLIX_AUTO_TIMMAR} timmar. I HD, upp till 3 GB i timmen, räcker det till knappt ${formatTal(NETFLIX_HD_TIMMAR)} timmar.`,
      kalla: "Netflix Help Center, omräkning av Mobilpoolen",
    },
    {
      q: "Hur länge kan jag lyssna på Spotify med 5 GB?",
      a: `I normal kvalitet, cirka 96 kbit/s, drar Spotify ungefär ${SPOTIFY_NORMAL_MB} MB i timmen. 5 GB räcker då till runt ${SPOTIFY_TIMMAR} timmar. Musik du laddat ned över wifi drar ingen mobilsurf alls.`,
      kalla: "Spotify Support, omräkning av Mobilpoolen",
    },
    ...(billigast
      ? [
          {
            q: "Vad kostar ett abonnemang med 5 GB surf?",
            a: `Billigast räknat som snittpris första året är just nu ${namn(billigast)}, ${kr(snittForstaAret(billigast))} i månaden i snitt och ${kr(billigast.pris)} ordinarie. ${bindningText(billigast.bindning)}.`,
            kalla: `operatörernas webbplatser, kontrollerade ${datumText(SENAST_KONTROLLERAD)}`,
          },
        ]
      : []),
  ];
}

function Page() {
  const lista = femGb();
  const steg = stegUpp();
  const FAQ = faq();

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med 5 GB" }}
    >
      <P>
        5 GB räcker om du mest chattar, surfar, använder kartor och lyssnar på musik, och har wifi
        hemma. Det motsvarar ungefär {NETFLIX_AUTO_TIMMAR} timmar Netflix i mobilens standardläge
        eller runt {SPOTIFY_TIMMAR} timmar Spotify. Tittar du på video utan wifi varje dag räcker
        det sällan. Snittet i Sverige var {MARKNAD.surfPerManad} GB i månaden 2025.
      </P>

      <H2 id="vad-motsvarar">Vad räcker 5 GB till?</H2>
      <P>
        Räknat med tjänsternas egna siffror räcker 5 GB i månaden ungefär till något av det här. I
        verkligheten blandar du, så se det som en tumregel.
      </P>
      <GuideTable
        head={["Användning", "Ungefär med 5 GB"]}
        rows={[
          ["Netflix, Automatiskt i mobilen (cirka 4 h per GB)", `${NETFLIX_AUTO_TIMMAR} timmar`],
          ["Netflix, Spara data (cirka 6 h per GB)", `${GB * 6} timmar`],
          [
            "Netflix i HD (upp till 3 GB per timme)",
            `knappt ${formatTal(NETFLIX_HD_TIMMAR)} timmar`,
          ],
          [`Spotify, Normal (cirka ${SPOTIFY_NORMAL_MB} MB per timme)`, `${SPOTIFY_TIMMAR} timmar`],
        ]}
      />
      <p className={KALLRAD}>
        Källa: Netflix Help Center och Spotify Support. Timmarna är vår omräkning. Mer om siffrorna
        i guiden <A href="/guider/hur-mycket-surf-drar-appar">hur mycket surf drar appar</A>.
      </p>
      <P>
        Sociala medier med mycket video, som TikTok och YouTube, publicerar inte hur mycket data de
        drar. Har du sådana appar är det bäst att mäta. I telefonens inställningar för mobildata ser
        du hur mycket varje app har använt den senaste perioden.
      </P>

      <H2 id="for-vem">Vem räcker 5 GB för?</H2>
      <P>5 GB brukar räcka bra för dig som:</P>
      <UL>
        <li>har wifi hemma, på jobbet eller i skolan och använder mobilsurfen mest på vägen,</li>
        <li>chattar, mejlar, läser nyheter och använder kartor,</li>
        <li>lyssnar på musik eller poddar, gärna nedladdat,</li>
        <li>vill ha en billig telefon för ett barn eller en förälder som inte strömmar video.</li>
      </UL>
      <P>Det räcker oftast inte om du:</P>
      <UL>
        <li>tittar på film, serier eller korta videoklipp utan wifi flera gånger i veckan,</li>
        <li>delar surf till en dator eller surfplatta,</li>
        <li>reser mycket i Sverige och sällan sitter på wifi.</li>
      </UL>
      <Callout>
        Kolla din egen siffra innan du väljer. Telefonen visar hur mycket mobildata du använt.
        Ligger du stadigt under 4 GB är 5 GB lagom. Ligger du nära eller över 5 GB varje månad
        betalar du sannolikt mindre med en större surfmängd än med att fylla på.
      </Callout>

      <H2 id="priser">Abonnemang med 5 GB just nu</H2>
      <P>
        Här är abonnemangen med 5 GB som alla kan teckna, sorterade efter snittpris per månad första
        året. Abonnemang som kräver en viss ålder eller studentstatus är inte med.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Pris nu", "Ordinarie", "Snitt år 1", "Bindningstid"]}
        rows={lista.map((a) => [
          namn(a),
          a.kampanjpris != null && a.kampanjManader
            ? `${kr(a.kampanjpris)} i ${a.kampanjManader} mån`
            : `${kr(a.pris)}/mån`,
          `${kr(a.pris)}/mån`,
          `${kr(snittForstaAret(a))}/mån`,
          bindningText(a.bindning),
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Kampanjer
        ändras ofta, kontrollera hos operatören innan du beställer.
      </p>
      <P>
        Vill du se alla små abonnemang, även de med lite mindre eller lite mer surf, finns de i{" "}
        <A href="/billigaste-mobilabonnemang">de billigaste mobilabonnemangen</A>. Flera operatörer
        har också särskilda abonnemang för <A href="/pensionar">pensionärer</A> med liknande
        surfmängd.
      </P>

      <H2 id="mer-surf">När lönar det sig att ta mer surf?</H2>
      <P>
        Steget upp från 5 GB är ofta billigare än man tror. Så här mycket mer kostar nästa surfmängd
        hos samma operatör, räknat på ordinarie pris:
      </P>
      <GuideTable
        brytForsta
        head={["Operatör", "5 GB", "Nästa nivå", "Skillnad per månad"]}
        rows={steg.map(({ fem, storre, skillnad }) => [
          operator(fem.operator)?.namn ?? fem.operator,
          `${kr(fem.pris)}/mån`,
          `${gbText(storre.gb)}: ${kr(storre.pris)}/mån`,
          `${kr(skillnad)}`,
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Ordinarie
        priser, utan kampanj.
      </p>
      <P>
        Tar surfen slut de flesta månader är det värt att jämföra den skillnaden med vad det kostar
        att fylla på hos din operatör. Fyller du på varje månad är ett större abonnemang ofta
        enklare och inte sällan billigare. Läs mer i guiden om{" "}
        <A href="/guider/nar-surfen-tar-slut">när surfen tar slut</A>.
      </P>
      <P>
        Ett annat sätt att få marginal är sparad surf. Då flyttas det du inte använt till nästa
        månad, så en lugn månad betalar för en intensiv. Se{" "}
        <A href="/guider/sparad-surf-dubbel-surf">sparad surf och dubbel surf</A>.
      </P>
      <p className={KALLRAD}>
        Snittet {MARKNAD.surfPerManad} GB per månad gäller abonnemang med samtal och data 2025.
        Källa:{" "}
        <a href={KALLOR.ptsMarknad.url} className="underline underline-offset-2">
          {KALLOR.ptsMarknad.namn}
        </a>
        .
      </p>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

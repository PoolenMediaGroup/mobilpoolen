import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  OL,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { datumText, gbText, kr } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "nar-surfen-tar-slut";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

/** Tellus Mobils prislista (uppdaterad 2025-03-24): extra surf. */
const TELLUS_EXTRA = [
  { gb: 1, pris: 50 },
  { gb: 3, pris: 100 },
  { gb: 5, pris: 150 },
];

const allmant = (a: Abonnemang) =>
  !a.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung");

const TOC = [
  { id: "vad-hander", label: "Vad händer när surfen tar slut?" },
  { id: "strypt", label: "Vad räcker strypt hastighet till?" },
  { id: "fylla-pa", label: "Fylla på eller byta abonnemang?" },
  { id: "undvika", label: "Så undviker du att surfen tar slut" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad händer när mobilsurfen tar slut?",
    a: "Det beror på operatören och abonnemanget. Antingen sänks hastigheten kraftigt resten av månaden, eller så stängs surfen tills du köper mer. Samtal och sms fungerar som vanligt. Vad som gäller för dig står i operatörens prislista eller villkor.",
  },
  {
    q: "Kostar det extra när surfen tar slut?",
    a: "Det beror på abonnemanget, så kontrollera operatörens prislista. Det kostar när du själv köper extra surf. Priset för extra surf är ofta högre per GB än surfen i ett större abonnemang.",
  },
  {
    q: "Är det billigare att fylla på surf eller byta till ett större abonnemang?",
    a: "Fyller du på någon enstaka gång är påfyllning oftast billigast. Fyller du på de flesta månader lönar det sig nästan alltid att byta till en större surfmängd. Utan bindningstid kan du byta upp och ned när du vill.",
  },
  {
    q: "Gäller strypt surf även i EU?",
    a: "Surf i EU och EES räknas oftast mot samma pott, med ett eget tak för EU-surf på stora och obegränsade abonnemang. Telia anger till exempel högst 50 GB i månaden i EU/EES och därefter 31 kronor per GB enligt sin prislista.",
    kalla: `Telias prislista, kontrollerad ${datumText(SENAST_KONTROLLERAD)}`,
  },
];

export const Route = createFileRoute("/guider/nar-surfen-tar-slut")({
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
        faqJsonLd(FAQ),
      ],
    }),
  component: Page,
});

function Page() {
  // Tellus: ordinarie abonnemang som alla kan teckna, minst först.
  const tellus = PRIVATA.filter((a) => a.operator === "tellus" && allmant(a) && a.gb != null).sort(
    (a, b) => (a.gb ?? 0) - (b.gb ?? 0),
  );
  const tio = tellus.find((a) => a.gb === 10);
  const nasta = tio ? tellus.find((a) => (a.gb ?? 0) > 10) : undefined;
  const femExtra = TELLUS_EXTRA.find((e) => e.gb === 5);
  const tellusNamn = operator("tellus")?.namn ?? "Tellus Mobil";
  const tellusObegr = PRIVATA.find((a) => a.operator === "tellus" && a.gb == null);

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med mer surf" }}
    >
      <P>
        När månadens surf är slut sänker de flesta operatörer hastigheten kraftigt eller stänger
        surfen tills du köper mer. Samtal och sms fungerar som vanligt. Du kan fylla på med extra
        surf eller vänta till nästa månad. Tar surfen slut ofta är det nästan alltid billigare att
        byta till en större surfmängd.
      </P>

      <H2 id="vad-hander">Vad händer när surfen tar slut?</H2>
      <P>
        Operatörerna gör på olika sätt, och det kan skilja mellan abonnemang hos samma operatör:
      </P>
      <UL>
        <li>
          <strong>Strypt hastighet.</strong> Du kan fortsätta surfa, men mycket långsamt, fram till
          nästa månad.
        </li>
        <li>
          <strong>Stängd surf.</strong> Mobildatan slutar fungera tills du köper mer eller en ny
          månad börjar.
        </li>
        <li>
          <strong>Ny pott automatiskt.</strong> Vissa obegränsade abonnemang har ett tak för rimlig
          användning och fyller sedan på utan kostnad.{" "}
          {tellusObegr && tellusObegr.notis
            ? `${tellusNamn} anger till exempel för ${tellusObegr.namn.toLowerCase()}: ${tellusObegr.notis.charAt(0).toLowerCase()}${tellusObegr.notis.slice(1)}.`
            : ""}
        </li>
      </UL>
      <P>
        Vad som gäller för ditt abonnemang står i operatörens prislista eller allmänna villkor, ofta
        under rubriker som surf, hastighet eller förbrukad surf. Har du sparad surf används den
        först, se <A href="/guider/sparad-surf-dubbel-surf">sparad surf och dubbel surf</A>.
      </P>
      <Callout>
        Samtal, sms och wifi påverkas inte. Är du hemma eller på jobbet med wifi märker du inte att
        mobilsurfen är slut.
      </Callout>

      <H2 id="strypt">Vad räcker strypt hastighet till?</H2>
      <P>
        Hur långsamt det blir skiljer sig mellan operatörerna. Ju lägre den strypta hastigheten är,
        desto mer begränsas du till enkla saker: meddelanden i text, mejl utan stora bilagor och en
        karta som redan är laddad. Video och musik kräver betydligt mer.
      </P>
      <P>
        Operatörerna anger inte alltid den strypta hastigheten tydligt på sina prissidor. Behöver du
        veta exakt, fråga kundtjänsten eller sök i prislistan.
      </P>

      <H2 id="fylla-pa">Fylla på eller byta abonnemang?</H2>
      <P>
        De flesta operatörer säljer extra surf i appen eller på Mina sidor. Det är praktiskt när
        surfen tar slut någon enstaka gång. Men påfyllning kostar oftast mer per GB än surfen i ett
        större abonnemang. Ett exempel från {tellusNamn}s prislista:
      </P>
      <GuideTable
        head={["Extra surf", "Pris", "Pris per GB"]}
        rows={TELLUS_EXTRA.map((e) => [gbText(e.gb), kr(e.pris), kr(e.pris / e.gb)])}
      />
      <p className={KALLRAD}>Källa: {tellusNamn}s prislista, uppdaterad 24 mars 2025.</p>
      {tio && nasta && femExtra && (
        <P>
          Har du {tellusNamn}s {gbText(tio.gb)} för {kr(tio.pris)} i månaden och fyller på 5 GB
          betalar du {kr(tio.pris + femExtra.pris)} den månaden. Abonnemanget med {gbText(nasta.gb)}{" "}
          kostar {kr(nasta.pris)} i månaden, alltså {kr(tio.pris + femExtra.pris - nasta.pris)}{" "}
          mindre och med mer surf.
        </P>
      )}
      <p className={KALLRAD}>
        Abonnemangspriser: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}
        .
      </p>
      <P>En tumregel:</P>
      <UL>
        <li>
          <strong>Fyll på</strong> om surfen tar slut någon gång om året, till exempel på semestern.
        </li>
        <li>
          <strong>Byt till mer surf</strong> om du fyller på de flesta månader. Har du ingen
          bindningstid kan du byta när du vill, och ofta byta tillbaka.
        </li>
        <li>
          <strong>Överväg obegränsad surf</strong> om du ändå hamnar högt varje månad. Se{" "}
          <A href="/obegransad-surf">abonnemang med obegränsad surf</A>.
        </li>
      </UL>
      <P>
        Vissa operatörer säljer också tillfällig full hastighet under ett eller flera dygn.
        Chilimobil, som prissätter efter hastighet i stället för GB, anger till exempel att Full
        Fart kan köpas för 24, 72 eller 168 timmar.
      </P>

      <H2 id="undvika">Så undviker du att surfen tar slut</H2>
      <OL>
        <li>
          <strong>Se hur mycket du använder.</strong> I telefonens inställningar för mobildata ser
          du förbrukningen per app. Där kan du också ofta ställa in en varning eller en gräns.
        </li>
        <li>
          <strong>Använd wifi när du kan.</strong> Ladda ned film, musik och poddar hemma och se dem
          offline.
        </li>
        <li>
          <strong>Sänk videokvaliteten.</strong> Netflix och flera andra appar har ett läge för att
          spara data på mobilnät. Läs mer i{" "}
          <A href="/guider/hur-mycket-surf-drar-appar">hur mycket surf appar drar</A>.
        </li>
        <li>
          <strong>Stäng av automatiska uppdateringar och säkerhetskopior på mobilnät.</strong> Låt
          dem gå över wifi i stället.
        </li>
        <li>
          <strong>Välj rätt surfmängd.</strong> Räkna med verktyget{" "}
          <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf behöver jag</A>, eller läs{" "}
          <A href="/guider/racker-5-gb-surf">om 5 GB räcker</A>.
        </li>
      </OL>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

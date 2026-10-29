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
import { ABONNEMANG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, gbText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "ringa-utomlands-billigt";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "eu", label: "Ringa till ett annat EU-land" },
  { id: "varlden", label: "Ringa till resten av världen" },
  { id: "utlandsminuter", label: "Abonnemang med utlandsminuter" },
  { id: "appar", label: "Ringa via appar" },
  { id: "skillnad", label: "Ringa hem från utlandet är något annat" },
  { id: "fragor", label: "Vanliga frågor" },
];

/** Utlandsminuter enligt operatörernas egna uppgifter (Comviq och Lyca Mobile). */
const UTLANDSMINUTER: { id: string; minuter: number }[] = [
  { id: "comviq-comviq-20-gb", minuter: 100 },
  { id: "comviq-comviq-100-gb", minuter: 1000 },
  { id: "lycamobile-lyca-fast-pris-99", minuter: 100 },
  { id: "lycamobile-lyca-fast-pris-149", minuter: 300 },
  { id: "lycamobile-lyca-fast-pris-199", minuter: 500 },
  { id: "lycamobile-lyca-fast-pris-238", minuter: 500 },
  { id: "lycamobile-lyca-fast-pris-340", minuter: 1000 },
  { id: "lycamobile-lyca-fast-pris-398", minuter: 1000 },
];

const FAQ = [
  {
    q: "Vad kostar det att ringa från Sverige till ett annat EU-land?",
    a: "Högst 0,19 euro per minut och 0,06 euro per sms, exklusive moms. Det är EU:s pristak för samtal och sms från hemlandet till ett annat EU- eller EES-land. Många operatörer tar mindre, och vissa har minuter som ingår.",
  },
  {
    q: "Ingår samtal till utlandet i mitt abonnemang?",
    a: "Oftast inte. Fria samtal i abonnemanget gäller samtal inom Sverige, och när du reser i EU. Samtal från Sverige till ett utländskt nummer kostar extra, om inte abonnemanget har utlandsminuter. Hallon skriver till exempel uttryckligen att samtal och sms till utlandet inte ingår.",
  },
  {
    q: "Vilket abonnemang är billigast för att ringa utomlands?",
    a: "Ringer du mycket till utlandet kan ett abonnemang med utlandsminuter löna sig, till exempel Comviq 20 GB eller 100 GB eller Lyca Mobiles paket. Ringer du sällan räcker oftast en app som WhatsApp eller FaceTime över wifi.",
  },
  {
    q: "Ändras pristaket för samtal till EU?",
    a: "Ja. Pristaket förlängdes genom EU:s gigabitförordning, och från den 1 januari 2029 får operatörerna inte ta ut något tillägg alls jämfört med samtal inom landet.",
  },
];

export const Route = createFileRoute("/guider/ringa-utomlands-billigt")({
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
  const rader = UTLANDSMINUTER.flatMap(({ id, minuter }) => {
    const a = ABONNEMANG.find((x) => x.id === id);
    if (!a) return [];
    return [
      [
        `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`,
        gbText(a.gb),
        `${minuter} min`,
        kr(a.pris),
        `${kr(snittForstaAret(a))}/mån`,
      ],
    ];
  });

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför mobilabonnemang" }}
    >
      <P>
        Ett samtal från Sverige till ett annat EU-land får kosta högst 0,19 euro per minut exklusive
        moms, och ett sms högst 0,06 euro. Till länder utanför EU sätter operatören sitt eget pris.
        Billigast är oftast att ringa via en app över wifi, eller att välja ett abonnemang där
        utlandsminuter ingår.
      </P>

      <H2 id="eu">Ringa till ett annat EU-land</H2>
      <P>
        Sedan den 15 maj 2019 finns ett EU-pristak för samtal och sms från hemlandet till ett annat
        EU- eller EES-land. Ringer du från Sverige till ett tyskt eller polskt nummer får det kosta
        högst 0,19 euro per minut och 0,06 euro per sms, exklusive moms. Taket har förlängts genom
        EU:s gigabitförordning. Från den 1 januari 2029 får operatörerna inte ta något tillägg alls
        jämfört med samtal inom landet.
      </P>
      <Callout>
        Pristaket är ett tak, inte ett pris. Din operatör får ta mindre. Se efter i
        utlandsprislistan vad just ditt abonnemang kostar per minut till ett EU-land.
      </Callout>

      <H2 id="varlden">Ringa till resten av världen</H2>
      <P>
        Till länder utanför EU och EES finns inget pristak. Priset per minut står i operatörens
        utlandsprislista och skiljer mycket mellan länder. Det kan också finnas en öppningsavgift
        per samtal. Ringer du till ett land ofta lönar det sig att jämföra just det landet hos flera
        operatörer.
      </P>
      <P>
        Tänk på att fria samtal i ett abonnemang betyder samtal inom Sverige. Samtal till utländska
        nummer ingår oftast inte.
      </P>

      <H2 id="utlandsminuter">Abonnemang med utlandsminuter</H2>
      <P>
        Några operatörer har minuter till utlandet som ingår varje månad. Tabellen visar de
        abonnemang i vår jämförelse där operatören anger ett antal utlandsminuter.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Surf", "Utlandsminuter", "Pris/mån", "Snitt år 1"]}
        rows={rader}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser och prislistor, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}. Lyca Mobile är kontantkort som förnyas var 30:e dag. Vilka
        länder minuterna gäller står i operatörens villkor.
      </p>
      <P>
        Lyca Mobile anger att minuterna gäller till bland annat EU-länderna, Norge, Island,
        Storbritannien, USA, Kanada, Indien, Kina, Thailand, Brasilien och Marocko, i vissa länder
        bara till fasta nummer. Comviqs 5 GB har inga utlandsminuter. Läs mer om{" "}
        <A href="/operatorer/lycamobile">Lyca Mobile</A> och <A href="/operatorer/comviq">Comviq</A>
        , eller jämför <A href="/kontantkort">kontantkort</A>.
      </P>

      <H2 id="appar">Ringa via appar</H2>
      <P>
        Ringer du till någon som har samma app är det oftast gratis att ringa över internet. Det
        gäller till exempel WhatsApp, FaceTime, Signal och Messenger.
      </P>
      <UL>
        <li>
          <strong>Över wifi</strong> kostar samtalet ingenting extra.
        </li>
        <li>
          <strong>Över mobilnätet</strong> drar samtalet surf ur abonnemanget, särskilt med video.
        </li>
        <li>
          <strong>Kvaliteten</strong> beror på uppkopplingen i båda ändar.
        </li>
      </UL>
      <P>
        Vill du ringa ett vanligt telefonnummer, till exempel en myndighet eller en äldre släkting
        utan smarttelefon, behöver du ett vanligt samtal eller en tjänst som ringer till fasta
        nummer.
      </P>

      <H2 id="skillnad">Ringa hem från utlandet är något annat</H2>
      <P>
        Pristaket ovan gäller när du är i Sverige och ringer till ett annat land. När du själv reser
        i EU och ringer hem gäller i stället Roam like at home. Då kostar samtalet samma som hemma.
        Läs mer i <A href="/guider/surfa-i-eu">surfa i EU</A> och{" "}
        <A href="/guider/surfa-utanfor-eu">surfa utanför EU</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: Arcep om reglerade priser för samtal till Europa (förordning (EU) 2018/1971 och (EU)
        2024/1309); {KALLOR.roaming.namn}; operatörernas prislistor.
      </p>
    </GuidePage>
  );
}

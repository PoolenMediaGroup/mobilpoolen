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
import { FORETAG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, gbText, kr, momsText, prisNu } from "@/lib/mobil/berakna";

const SLUG = "moms-mobilabonnemang";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";
const SKV_MOMS =
  "https://skatteverket.se/foretag/moms/kopavarorochtjanster/inkoptillforetaget.4.7459477810df5bccdd480005156.html";

const TOC = [
  { id: "avdrag", label: "När får företaget dra av momsen?" },
  { id: "privat", label: "Om mobilen används privat" },
  { id: "rakna", label: "Räkna mellan exkl. och inkl." },
  { id: "operatorer", label: "Hur operatörerna anger moms" },
  { id: "misstag", label: "Vanliga misstag" },
  { id: "fragor", label: "Vanliga frågor" },
];

const SLUT = "Reglerna kan ändras och Skatteverket har sista ordet.";

const FAQ = [
  {
    q: "Får företaget dra av momsen på mobilabonnemanget?",
    a: `Ja, om företaget är momsregistrerat och abonnemanget används i verksamheten. Används det även privat får företaget bara dra av momsen för verksamhetsdelen. ${SLUT}`,
    kalla: "Skatteverket, inköp till företaget",
  },
  {
    q: "Hur räknar jag ut priset inkl. moms?",
    a: "Multiplicera priset exkl. moms med 1,25. Tres exempel: 299 kr i månaden exkl. moms blir 373,75 kr inkl. moms, och företaget kan återfå 74,75 kr i moms.",
    kalla: "Tre, överlåtelse",
  },
  {
    q: "Hur mycket moms får jag dra av om jag ringer privat?",
    a: `Bara den del som hör till verksamheten, efter en skälig fördelning som du ska kunna visa med anteckningar eller beräkningar. I Skatteverkets exempel ger 50 procent privat användning 50 procents avdrag. ${SLUT}`,
    kalla: "Skatteverket",
  },
  {
    q: "Anger alla operatörer företagspriser exkl. moms?",
    a: "Nej. Tre och Telavox skriver uttryckligen exkl. moms. Telia, Tele2 och Hallon anger inte moms på sina abonnemangssidor. Fråga operatören om det inte framgår.",
  },
  {
    q: "Vad gäller om företaget inte är momsregistrerat?",
    a: `Då finns ingen moms att dra av, och priset inkl. moms är den verkliga kostnaden. Jämför därför alla priser inkl. moms. ${SLUT}`,
    kalla: "Skatteverket, inköp till företaget",
  },
];

export const Route = createFileRoute("/guider/moms-mobilabonnemang")({
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
  const rader = [...FORETAG].sort((a, b) => prisNu(a) - prisNu(b));
  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför företagsabonnemang", to: "/foretag" }}
    >
      <P>
        Företagsabonnemang anges oftast exkl. moms. Ett momsregistrerat företag får dra av momsen,
        25 procent, för den del av abonnemanget som används i verksamheten. Används mobilen också
        privat dras bara verksamhetsdelen av. För att jämföra med ett privat pris multiplicerar du
        priset exkl. moms med 1,25.
      </P>

      <H2 id="avdrag">När får företaget dra av momsen?</H2>
      <P>
        Enligt Skatteverket får ett momsregistrerat företag dra av den ingående momsen på inköp som
        används i verksamheten. För ett mobilabonnemang är momsen 25 procent. Är företaget inte
        momsregistrerat finns ingen moms att dra av, och då är priset inkl. moms den verkliga
        kostnaden.
      </P>
      <P>
        Det avgörande är att inköpet används i verksamheten och att fakturan går att bokföra där.
        Fråga din redovisningskonsult om abonnemanget står på dig privat men betalas av ett
        aktiebolag.
      </P>

      <H2 id="privat">Om mobilen används både i jobbet och privat</H2>
      <P>
        Används abonnemanget både i verksamheten och privat får företaget bara dra av den del av
        momsen som hör till verksamheten. Fördelningen ska vara skälig, och du ska kunna visa hur du
        har räknat, till exempel med anteckningar eller beräkningar.
      </P>
      <Callout>
        Skatteverkets exempel: används inköpet till 50 procent privat får företaget dra av 50
        procent av momsen.
      </Callout>
      <P>
        Momsen är en sak, inkomstskatten en annan. För anställda gäller förmånsreglerna, se{" "}
        <A href="/guider/jobbmobil-formansskatt">jobbmobil och förmånsskatt</A>. För enskild firma
        gäller uttagsbeskattning, se{" "}
        <A href="/guider/avdrag-mobilabonnemang-enskild-firma">avdrag i enskild firma</A>.
      </P>
      <P>{SLUT}</P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={SKV_MOMS} target="_blank" rel="noopener nofollow">
          Skatteverket, inköp till företaget
        </a>
        .
      </p>

      <H2 id="rakna">Räkna mellan exkl. och inkl. moms</H2>
      <UL>
        <li>
          <strong>Exkl. till inkl.:</strong> multiplicera med 1,25.
        </li>
        <li>
          <strong>Inkl. till exkl.:</strong> dela med 1,25.
        </li>
        <li>
          <strong>Momsen i ett pris inkl. moms:</strong> 20 procent av priset.
        </li>
      </UL>
      <Callout>
        Exempel från Tre: 299 kr i månaden exkl. moms blir 373,75 kr inkl. moms. Ett momsregistrerat
        företag kan återfå 74,75 kr i moms.
      </Callout>
      <P>
        Om du jämför ett företagspris med ett privat, räkna alltid om till samma moms. Annars ser
        företagsabonnemanget 20 procent billigare ut än det är för den som inte får dra av momsen.
      </P>

      <H2 id="operatorer">Hur anger operatörerna moms?</H2>
      <P>
        Tre och Telavox skriver uttryckligen att företagspriserna är exkl. moms. Telia, Tele2 och
        Hallon anger inte moms på sina abonnemangssidor. Därför räknar vi inte om deras priser. Vi
        visar vad operatören själv skriver.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Surf", "Pris första mån", "Moms enligt operatören"]}
        rows={rader.map((a) => [
          `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`,
          gbText(a.gb),
          a.moms === "exkl" ? `${kr(prisNu(a))} (${kr(prisNu(a) * 1.25)} inkl.)` : kr(prisNu(a)),
          momsText(a.moms) ?? "moms anges inte",
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>
      <P>
        Hitta det billigaste på{" "}
        <A href="/foretag/billigaste-foretagsabonnemang">billigaste företagsabonnemang</A> eller
        räkna på hela företaget i <A href="/verktyg/foretagskalkylator">företagskalkylatorn</A>.
      </P>

      <H2 id="misstag">Vanliga misstag med moms på mobilen</H2>
      <UL>
        <li>
          <strong>Att jämföra exkl. med inkl.</strong> Ett företagspris exkl. moms och ett privat
          pris inkl. moms går inte att jämföra rakt av. Räkna om till samma moms först.
        </li>
        <li>
          <strong>Att tro att priset alltid är exkl. moms.</strong> Telia, Tele2 och Hallon anger
          inte moms på sina abonnemangssidor. Fråga operatören, och be gärna om priset skriftligt.
        </li>
        <li>
          <strong>Att dra av all moms trots privat användning.</strong> Används mobilen också privat
          får bara verksamhetsdelens moms dras av.
        </li>
        <li>
          <strong>Att inte spara underlaget.</strong> Fördelningen mellan jobb och privat ska gå att
          visa. Spara anteckningar eller beräkningar tillsammans med bokföringen.
        </li>
      </UL>
      <P>
        Inte momsregistrerad? Då kan företaget inte dra av någon moms, och det är priset inkl. moms
        som är kostnaden. För dig kan ett privat abonnemang vara lika bra som ett
        företagsabonnemang, särskilt om du har enskild firma. Se{" "}
        <A href="/foretag/enskild-firma">mobilabonnemang för enskild firma</A> och{" "}
        <A href="/guider/privat-eller-foretagsabonnemang">privat- eller företagsabonnemang</A>.{" "}
        {SLUT}
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

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

const SLUG = "overlata-abonnemang-till-foretag";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";
const TRE_OVERLATELSE = "https://www.tre.se/support/overlatelse";
const PTSFS =
  "https://www.pts.se/globalassets/startpage/dokument/legala-dokument/foreskrifter/telefoni/ny-lek-2022/ptsfs-2022_4-om-nummerportabilitet.pdf";

const TOC = [
  { id: "overlatelse", label: "Överlåtelse eller portering?" },
  { id: "steg", label: "Så går en överlåtelse till" },
  { id: "tre", label: "Exempel: Tre" },
  { id: "bindning", label: "Bindningstiden följer med" },
  { id: "checklista", label: "Checklista" },
  { id: "byta", label: "Byta operatör samtidigt" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Kan jag flytta mitt privata nummer till mitt företag?",
    a: "Ja, genom att överlåta abonnemanget till företaget. Då blir företaget ny abonnent. Hos Tre görs det gratis i Mitt3 med BankID. Kontrollera med din operatör att numret följer med.",
    kalla: "Tre, överlåtelse",
  },
  {
    q: "Följer bindningstiden med vid överlåtelse?",
    a: "Ja, hos Tre följer återstående bindningstid med till den nya abonnenten. Andra operatörers villkor har vi inte kontrollerat.",
    kalla: "Tre, överlåtelse",
  },
  {
    q: "Kostar det något att överlåta ett abonnemang?",
    a: "Hos Tre är det gratis i Mitt3 med BankID. Med blankett kostar det 250 kr per abonnemang för privatkunder och är gratis för företagsabonnemang.",
    kalla: "Tre, överlåtelse",
  },
  {
    q: "Hindrar bindningstid att jag byter operatör?",
    a: "Nej. Bindningstid eller obetalda fakturor hindrar inte nummerportering, men den återstående bindningstiden ska betalas. Den gamla operatören får inte ta betalt för att lämna ifrån sig numret.",
    kalla: "PTSFS 2022:4",
  },
  {
    q: "Hur lång tid tar en överlåtelse?",
    a: "Hos Tre tar handläggningen cirka 10 arbetsdagar. Andra operatörers handläggningstider har vi inte kontrollerat.",
    kalla: "Tre, överlåtelse",
  },
];

export const Route = createFileRoute("/guider/overlata-abonnemang-till-foretag")({
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
        För att flytta ett privat mobilnummer till ditt företag överlåter du abonnemanget, så att
        företaget blir ny abonnent. Hos Tre görs det gratis i Mitt3 med BankID och tar cirka 10
        arbetsdagar. Återstående bindningstid följer med. Vill du samtidigt byta operatör kan numret
        porteras, men den återstående bindningstiden ska betalas.
      </P>

      <H2 id="overlatelse">Överlåtelse eller portering?</H2>
      <P>Det är två olika saker, och ibland behövs båda:</P>
      <UL>
        <li>
          <strong>Överlåtelse</strong> byter vem som är abonnent. Abonnemanget går från dig som
          privatperson till ditt företag, eller tvärtom. Operatören är densamma.
        </li>
        <li>
          <strong>Nummerportering</strong> flyttar numret till en annan operatör. Abonnenten är
          densamma.
        </li>
      </UL>
      <P>
        Numret följer abonnenten. Ska numret både bli företagets och flytta till en annan operatör
        behöver det därför normalt först överlåtas till företaget. Hur det går till skiljer sig
        mellan operatörerna, så fråga din operatör.
      </P>

      <H2 id="steg">Så går en överlåtelse till</H2>
      <OL>
        <li>Kontrollera din operatörs villkor för överlåtelse, och om numret behålls.</li>
        <li>Se till att alla förfallna fakturor är betalda.</li>
        <li>
          Gör överlåtelsen digitalt eller med blankett. Båda parter, du och företaget, behöver
          godkänna.
        </li>
        <li>Den nya abonnenten kreditprövas.</li>
        <li>När överlåtelsen är klar går fakturan till företaget.</li>
      </OL>

      <H2 id="tre">Exempel: så fungerar det hos Tre</H2>
      <P>
        Tre är den operatör där vi har kunnat kontrollera villkoren för överlåtelse. Andra
        operatörers regler har vi inte verifierat.
      </P>
      <GuideTable
        brytForsta
        head={["", "Så gäller hos Tre"]}
        rows={[
          ["Digitalt", "I Mitt3 med BankID, gratis"],
          ["Med blankett", "250 kr per abonnemang för privatkunder, gratis för företagsabonnemang"],
          ["Krav på mottagaren", "Över 18 år och godkänd i kreditkontrollen"],
          ["Fakturor", "Förfallna fakturor ska vara betalda"],
          ["Handläggningstid", "Cirka 10 arbetsdagar"],
          ["Bindningstid", "Återstående bindningstid följer med"],
          [
            "Abonnemang efteråt",
            "3Företag Obegränsad för 299 kr/mån exkl. moms (373,75 kr inkl. moms)",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={TRE_OVERLATELSE} target="_blank" rel="noopener nofollow">
          tre.se, överlåtelse
        </a>
        . Tre anger inte uttryckligen att numret alltid behålls, så fråga Tre.
      </p>
      <Callout>
        Ett privatabonnemang som överlåts till företag hos Tre blir ett företagsabonnemang med pris
        exkl. moms. Är företaget momsregistrerat kan det dra av momsen för verksamhetsdelen. Läs{" "}
        <A href="/guider/moms-mobilabonnemang">moms på mobilabonnemang</A>.
      </Callout>

      <H2 id="bindning">Bindningstiden följer med</H2>
      <P>
        Hos Tre tar den nya abonnenten över den återstående bindningstiden. Det betyder att
        företaget får betala resten av den. Överlåter du ett abonnemang mitt i en kampanj,
        kontrollera vad priset blir efter överlåtelsen.
      </P>

      <H2 id="checklista">Checklista före överlåtelsen</H2>
      <UL>
        <li>
          <strong>Kolla bindningstiden.</strong> Hur lång tid är kvar, och vad kostar abonnemanget
          för företaget under den tiden?
        </li>
        <li>
          <strong>Kolla priset efteråt.</strong> Hos Tre blir ett överlåtet privatabonnemang
          3Företag Obegränsad. Jämför med andra{" "}
          <A href="/foretag/billigaste-foretagsabonnemang">företagsabonnemang</A>.
        </li>
        <li>
          <strong>Betala gamla fakturor.</strong> Förfallna fakturor ska vara betalda innan
          överlåtelsen.
        </li>
        <li>
          <strong>Fråga om numret.</strong> Be operatören bekräfta att numret följer med till
          företaget.
        </li>
        <li>
          <strong>Planera för handläggningstiden.</strong> Hos Tre tar det cirka 10 arbetsdagar.
        </li>
        <li>
          <strong>Tänk på moms och skatt.</strong> När företaget betalar abonnemanget gäller
          reglerna för moms och förmån eller uttag. Se{" "}
          <A href="/guider/jobbmobil-formansskatt">jobbmobil och förmånsskatt</A> och{" "}
          <A href="/guider/avdrag-mobilabonnemang-enskild-firma">avdrag i enskild firma</A>.
        </li>
      </UL>

      <H2 id="byta">Byta operatör samtidigt</H2>
      <P>
        Vill du att företaget ska ha en annan operatör kan numret porteras. Enligt PTS föreskrift om
        nummerportabilitet gäller bland annat:
      </P>
      <UL>
        <li>Bindningstid eller obetalda fakturor hindrar inte portering.</li>
        <li>Återstående bindningstid ska ändå betalas till den gamla operatören.</li>
        <li>Den gamla operatören får inte ta betalt för att lämna ifrån sig numret.</li>
        <li>Numret kan porteras minst en månad efter att avtalet har upphört.</li>
        <li>Misslyckas porteringen ska den gamla operatören återaktivera numret.</li>
      </UL>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={PTSFS} target="_blank" rel="noopener nofollow">
          PTSFS 2022:4 om nummerportabilitet
        </a>
        .
      </p>
      <P>
        Den nya operatören sköter flytten. Läs mer i{" "}
        <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>. Hitta
        ett nytt abonnemang för företaget på <A href="/foretag">mobilabonnemang för företag</A>,
        eller läs <A href="/foretag/enskild-firma">mobilabonnemang för enskild firma</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

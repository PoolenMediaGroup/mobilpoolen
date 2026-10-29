import { createFileRoute } from "@tanstack/react-router";
import { A, Callout, FaqAccordion, GuidePage, H2, P, UL } from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "jobbmobil-formansskatt";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";
const SKV_2018 =
  "https://www.faronline.se/dokument/skatteverket/stallningstaganden2/2018/skvstallningst2018060701/";
const SLUT = "Reglerna kan ändras och Skatteverket har sista ordet.";

const TOC = [
  { id: "huvudregel", label: "Huvudregeln" },
  { id: "villkor", label: "När är det skattefritt?" },
  { id: "skattepliktigt", label: "När blir det en förmån?" },
  { id: "avtal", label: "Skriv in det i avtalet" },
  { id: "agare", label: "Ägare i AB och enskild firma" },
  { id: "checklista", label: "Checklista för arbetsgivaren" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Är en jobbmobil en skattepliktig förmån?",
    a: `Inte om mobilen och abonnemanget normalt behövs i arbetet. Då är privat användning skattefri enligt Skatteverket. Behövs de inte i arbetet och arbetsgivaren tillåter privat användning blir det en skattepliktig förmån till marknadsvärde. ${SLUT}`,
    kalla: "Skatteverket, arbetsredskap",
  },
  {
    q: "Måste jag betala skatt för privata samtal med jobbmobilen?",
    a: `Samtal som ingår i den fasta avgiften räknas som en del av abonnemanget. Privata tjänster som debiteras utöver den fasta avgiften, till exempel betalsamtal och utlandssamtal som går att särskilja, är skattepliktiga om arbetsgivaren betalar dem. ${SLUT}`,
    kalla: "Skatteverket, arbetsredskap",
  },
  {
    q: "Räknas surf och sms in i abonnemanget?",
    a: `Ja. Enligt Skatteverket räknas ett abonnemang mot fast avgift som en tjänst även om det innehåller samtal, sms, mms och data. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2018-06-07",
  },
  {
    q: "Gäller förmånsreglerna mig som har enskild firma?",
    a: `Nej. Den som har enskild firma är inte anställd i sitt eget företag. I stället gäller uttagsbeskattning för den privata användningen. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Var redovisar arbetsgivaren en skattepliktig mobilförmån?",
    a: `I arbetsgivardeklarationen. Det gäller när mobilen inte behövs i arbetet men får användas privat, och när arbetsgivaren betalar privata tjänster utöver den fasta avgiften. ${SLUT}`,
    kalla: "Skatteverket, arbetsredskap",
  },
];

export const Route = createFileRoute("/guider/jobbmobil-formansskatt")({
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
        En jobbmobil med abonnemang är inte en skattepliktig förmån om den normalt behövs i arbetet.
        Då får den anställda använda den privat utan att betala skatt för det. Privata tjänster som
        debiteras utöver den fasta avgiften, som betalsamtal, är däremot skattepliktiga om
        arbetsgivaren betalar dem. {SLUT}
      </P>

      <H2 id="huvudregel">Vad säger Skatteverket om jobbmobilen?</H2>
      <P>
        Får en anställd använda arbetsgivarens mobil, dator eller dataabonnemang privat är det inte
        en skattepliktig förmån om utrustningen normalt är nödvändig för arbetet. Det framgår av
        Skatteverkets sida om arbetsredskap och av ställningstagandet Förmånsbeskattning av
        elektronisk utrustning eller abonnemang mot fast avgift från 7 juni 2018. Det ersatte ett
        tidigare ställningstagande från 2014.
      </P>
      <P>
        Ett abonnemang mot fast avgift räknas som en tjänst, även om det innehåller samtal, sms, mms
        och data. Det betyder att den privata surfen och de privata samtalen som ingår i den fasta
        avgiften inte ska förmånsbeskattas, om villkoren nedan är uppfyllda.
      </P>

      <H2 id="villkor">När är privat användning skattefri?</H2>
      <P>
        Enligt ställningstagandet från 2018 är privat användning utanför arbetsplatsen skattefri om:
      </P>
      <UL>
        <li>utrustningen eller abonnemanget behövs i arbetet,</li>
        <li>den privata nyttan är svår att skilja från tjänstenyttan, och</li>
        <li>värdet är begränsat.</li>
      </UL>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={SKV_2018} target="_blank" rel="noopener nofollow">
          Skatteverket, ställningstagande 2018-06-07
        </a>
        .
      </p>

      <H2 id="skattepliktigt">När blir jobbmobilen en skattepliktig förmån?</H2>
      <UL>
        <li>
          <strong>Mobilen behövs inte i arbetet.</strong> Om arbetsgivaren ändå tillåter privat
          användning blir det en skattepliktig förmån till marknadsvärde. Förmånen ska redovisas i
          arbetsgivardeklarationen.
        </li>
        <li>
          <strong>Tjänster utöver den fasta avgiften.</strong> Privata tjänster som debiteras
          separat, till exempel betalsamtal eller utlandssamtal som går att särskilja, är alltid
          skattepliktiga om arbetsgivaren betalar dem.
        </li>
      </UL>
      <Callout>
        Välj gärna ett abonnemang där samtal, sms och surf ingår i den fasta avgiften. Då blir det
        tydligare vad som är rörliga kostnader. Se{" "}
        <A href="/foretag">mobilabonnemang för företag</A>.
      </Callout>

      <H2 id="avtal">Skriv in det i avtalet</H2>
      <P>
        Om mobilen inte är nödvändig i arbetet bör avtalet med den anställda ange att privat
        användning inte är tillåten. Då undviks förmånsbeskattning. Är mobilen nödvändig i arbetet
        är det ändå en bra idé att skriva ned vilka tjänster arbetsgivaren betalar, så att det går
        att skilja ut privata extratjänster.
      </P>
      <P>{SLUT}</P>

      <H2 id="agare">Ägare i aktiebolag och enskild firma</H2>
      <P>
        I ett aktiebolag är abonnemanget bolagets kostnad. Ägaren och de anställda omfattas av
        förmånsreglerna, så privat användning är skattefri om mobilen behövs i arbetet.
      </P>
      <P>
        Har du enskild firma gäller inte förmånsreglerna, eftersom du inte är anställd i ditt eget
        företag. I stället gäller uttagsbeskattning för den privata användningen. Läs mer i{" "}
        <A href="/guider/avdrag-mobilabonnemang-enskild-firma">mobilabonnemang i enskild firma</A>.
        Momsen på abonnemanget får dras av bara för verksamhetsdelen, se{" "}
        <A href="/guider/moms-mobilabonnemang">moms på mobilabonnemang</A>.
      </P>
      <P>
        Kontrollera alltid Skatteverkets aktuella uppgifter innan du bestämmer hur företaget ska
        göra. {SLUT}
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.skatteverketArbetsredskap.url} target="_blank" rel="noopener nofollow">
          {KALLOR.skatteverketArbetsredskap.namn}
        </a>
        .
      </p>

      <H2 id="checklista">Checklista för arbetsgivaren</H2>
      <UL>
        <li>
          <strong>Behövs mobilen i arbetet?</strong> Det är grunden för att privat användning ska
          vara skattefri. Fundera på om den anställda normalt behöver mobilen för att göra sitt
          jobb.
        </li>
        <li>
          <strong>Välj abonnemang med fast avgift.</strong> Samtal, sms och surf som ingår i den
          fasta avgiften räknas som en del av tjänsten. Se{" "}
          <A href="/foretag/billigaste-foretagsabonnemang">billigaste företagsabonnemang</A>.
        </li>
        <li>
          <strong>Håll koll på extratjänster.</strong> Betalsamtal, köp via mobilräkningen och
          utlandssamtal som faktureras separat ska förmånsbeskattas om företaget betalar privata
          sådana.
        </li>
        <li>
          <strong>Skriv en policy.</strong> Ange vad som är tillåtet och vem som betalar vad. Behövs
          inte mobilen i arbetet, skriv att privat användning inte är tillåten.
        </li>
        <li>
          <strong>Redovisa förmåner.</strong> En skattepliktig förmån ska redovisas i
          arbetsgivardeklarationen.
        </li>
      </UL>
      <P>{SLUT}</P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

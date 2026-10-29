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
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "avdrag-mobilabonnemang-enskild-firma";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";
const SKV_2015 =
  "https://www.faronline.se/dokument/skatteverket/stallningstaganden2/2015/skvstallningst2015082502/";
const SKV_MOMS =
  "https://skatteverket.se/foretag/moms/kopavarorochtjanster/inkoptillforetaget.4.7459477810df5bccdd480005156.html";
const SLUT = "Reglerna kan ändras och Skatteverket har sista ordet.";

const TOC = [
  { id: "grund", label: "Varför uttag och inte förmån?" },
  { id: "tva-satt", label: "Två sätt att göra avdrag" },
  { id: "fast", label: "Fast telefon hemma" },
  { id: "moms", label: "Momsen" },
  { id: "ab", label: "Skillnaden mot aktiebolag" },
  { id: "val", label: "Privat eller företag?" },
  { id: "praktiskt", label: "Så gör du i praktiken" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Får jag dra av mobilabonnemanget i min enskilda firma?",
    a: `Ja. Enligt Skatteverket kan ett mobilabonnemang som bokförs i verksamheten dras av direkt, men den privata användningen ska uttagsbeskattas. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Hur stor del får jag dra av om jag använder mobilen privat också?",
    a: `Avdraget ska vara skäligt för den del som hör till verksamheten. Vid jämn fördelning mellan jobb och privat kan hälften av utgiften ligga till grund för avdraget. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Kan jag dra av mitt fasta telefonabonnemang hemma?",
    a: `Nej. Ett fast telefonabonnemang i bostaden är aldrig avdragsgillt. Bara rörliga samtalskostnader i verksamheten får dras av. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Måste jag ha ett företagsabonnemang för att få göra avdrag?",
    a: `Nej. Om mobilen och abonnemanget köps privat ges skäligt avdrag för verksamhetsdelen. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Ska jag ha privat- eller företagsabonnemang i min enskilda firma?",
    a: `Båda fungerar. Skatteverkets regler handlar om hur abonnemanget bokförs och används, inte om vilken sorts abonnemang det är. Välj efter pris, villkor och vilka tjänster du behöver. ${SLUT}`,
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
];

export const Route = createFileRoute("/guider/avdrag-mobilabonnemang-enskild-firma")({
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
      cta={{ label: "Jämför abonnemang för enskild firma", to: "/foretag/enskild-firma" }}
    >
      <P>
        I enskild firma kan du dra av ett mobilabonnemang som bokförs i verksamheten, men den
        privata användningen ska då uttagsbeskattas. Köper du abonnemanget privat får du i stället
        ett skäligt avdrag för verksamhetsdelen, till exempel hälften vid jämn fördelning. Det
        följer av Skatteverkets ställningstagande från 2015. {SLUT}
      </P>

      <H2 id="grund">Varför uttag och inte förmån?</H2>
      <P>
        Som enskild näringsidkare är du inte anställd i ditt eget företag. Förmånsreglerna, som gör
        jobbmobilen skattefri för anställda, gäller därför inte dig. I stället gäller
        uttagsbeskattning: det du tar ut ur verksamheten för privat bruk ska beskattas.
      </P>
      <P>
        Skatteverket har beskrivit hur det fungerar för mobil och dator i ställningstagandet
        Utgifter för dator och telefon i enskild näringsverksamhet, från 25 augusti 2015.
      </P>

      <H2 id="tva-satt">Två sätt att göra avdrag för mobilen</H2>
      <GuideTable
        brytForsta
        head={["", "Bokförs i firman", "Köps privat"]}
        rows={[
          [
            "Avdrag",
            "Abonnemanget och en mobil av mindre värde dras av direkt",
            "Skäligt avdrag för den del som hör till verksamheten",
          ],
          ["Privat användning", "Uttagsbeskattas", "Ingår inte i avdraget"],
          [
            "Jämn fördelning",
            "Uttag för den privata delen",
            "Hälften av utgiften kan ligga till grund",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={SKV_2015} target="_blank" rel="noopener nofollow">
          Skatteverket, ställningstagande 2015-08-25
        </a>
        .
      </p>
      <P>
        Vilket som passar dig beror på hur du använder mobilen. Ringer du nästan bara i jobbet kan
        det vara enklast att bokföra abonnemanget i firman. Är det en vanlig privat mobil som du
        också jobbar med kan det vara enklare att behålla det privata abonnemanget och göra ett
        skäligt avdrag.
      </P>
      <P>{SLUT}</P>

      <H2 id="fast">Fast telefon hemma är inte avdragsgill</H2>
      <P>
        Ett fast telefonabonnemang i bostaden är aldrig avdragsgillt. Bara de rörliga
        samtalskostnaderna i verksamheten får dras av. Det gäller alltså inte mobilabonnemanget, men
        det är bra att känna till om du också har en fast linje hemma.
      </P>

      <H2 id="moms">Momsen i enskild firma</H2>
      <P>
        Är firman momsregistrerad får du dra av den ingående momsen, 25 procent, för den del som
        används i verksamheten. Används abonnemanget även privat dras bara verksamhetsdelens moms
        av, efter en skälig fördelning som du ska kunna visa med anteckningar eller beräkningar. I
        Skatteverkets exempel ger 50 procent privat användning 50 procents avdrag. {SLUT}
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={SKV_MOMS} target="_blank" rel="noopener nofollow">
          Skatteverket, inköp till företaget
        </a>
        . Läs mer i <A href="/guider/moms-mobilabonnemang">moms på mobilabonnemang</A>.
      </p>

      <H2 id="ab">Skillnaden mot aktiebolag</H2>
      <P>
        I ett aktiebolag är abonnemanget bolagets kostnad. Ägaren och de anställda omfattas av
        förmånsreglerna, så privat användning är skattefri om mobilen behövs i arbetet. I enskild
        firma dras kostnaden av i firman och den privata delen uttagsbeskattas, eller så görs en
        skälig fördelning. I båda fallen dras momsen av bara för verksamhetsdelen. Läs mer i{" "}
        <A href="/guider/jobbmobil-formansskatt">jobbmobil och förmånsskatt</A>.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.skatteverketArbetsredskap.url} target="_blank" rel="noopener nofollow">
          {KALLOR.skatteverketArbetsredskap.namn}
        </a>
        .
      </p>

      <H2 id="val">Privat eller företagsabonnemang i firman?</H2>
      <P>
        Skatteverkets regler säger inget om vilken sorts abonnemang du ska ha. Det avgörande är hur
        det bokförs och hur mycket du använder det i verksamheten. Därför kan du välja efter pris
        och villkor.
      </P>
      <UL>
        <li>
          <strong>Privat abonnemang</strong> anges inkl. moms och har konsumentskyddet, till exempel
          högst en månads uppsägningstid. Det finns många utan bindningstid.
        </li>
        <li>
          <strong>Företagsabonnemang</strong> anges oftast exkl. moms och har tjänster som växel och
          extra sim. Om operatörerna godtar enskild firma framgår inte av deras sidor, så fråga
          innan du beställer.
        </li>
      </UL>
      <P>
        Jämför alltid med samma moms. Är firman inte momsregistrerad är det priset inkl. moms som
        gäller för dig. {SLUT}
      </P>

      <H2 id="praktiskt">Så gör du i praktiken</H2>
      <UL>
        <li>
          <strong>Bestäm hur du använder mobilen.</strong> Uppskatta hur stor del som är jobb och
          hur stor del som är privat.
        </li>
        <li>
          <strong>Dokumentera fördelningen.</strong> Spara anteckningar eller beräkningar som visar
          hur du kommit fram till den. Det gäller både moms och inkomstskatt.
        </li>
        <li>
          <strong>Välj ett abonnemang med fast avgift.</strong> Då blir det enklare att se vad som
          är rörliga kostnader i verksamheten.
        </li>
        <li>
          <strong>Fråga om du är osäker.</strong> Skatteverket eller en redovisningskonsult kan
          bedöma just din situation.
        </li>
      </UL>
      <Callout>
        {SLUT} Den här guiden återger Skatteverkets ställningstaganden och ersätter inte rådgivning.
      </Callout>
      <P>
        Se vilka abonnemang som är billigast för en enskild firma på{" "}
        <A href="/foretag/enskild-firma">mobilabonnemang för enskild firma</A>, och om du vill
        flytta numret till firman, läs{" "}
        <A href="/guider/overlata-abonnemang-till-foretag">överlåtelse till företag</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

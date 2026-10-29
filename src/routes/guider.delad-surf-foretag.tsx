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
import { datumText, kr, snittForstaAret, sortera } from "@/lib/mobil/berakna";

const SLUG = "delad-surf-foretag";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "vad", label: "Vad är delad surf?" },
  { id: "operatorer", label: "Vad operatörerna erbjuder" },
  { id: "lonar", label: "När lönar det sig?" },
  { id: "rakna", label: "Så räknar du" },
  { id: "alternativ", label: "Alternativ till delad surf" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad är delad surf för företag?",
    a: "Delad eller poolad surf betyder att flera sim-kort använder samma surfmängd. I stället för att varje person har ett eget surfpaket delar företaget på en gemensam pott.",
  },
  {
    q: "Vilka operatörer har delad surf för företag?",
    a: "Ingen av de operatörer vi har granskat har en öppet prissatt surfpool för hela företaget. Tre har ett datakort som delar surf med huvudabonnemanget och ingår i 3Företag Obegränsad Max. Telia har ett extra datasim i Obegränsad Max och Premium.",
    kalla: "Operatörernas webbplatser och prislistor",
  },
  {
    q: "Hur mycket surf kan Tres datakort använda?",
    a: "Datakortet delar surfmängd med huvudabonnemanget, med högst 100 GB i månaden i Sverige enligt Tres prislista.",
    kalla: "Tre, prislista för röstabonnemang",
  },
  {
    q: "Är delad surf billigare än separata abonnemang?",
    a: "Det beror på hur mycket varje person surfar. Använder ni lite var kan ett billigt abonnemang med fast surf per person räcka. Obegränsad surf gör delning onödig för telefonerna.",
  },
  {
    q: "Drar surf över wifi från företagets surfmängd?",
    a: "Nej. Surf över wifi går via det fasta nätet och drar inte från mobilabonnemangets surf. Med wifi på kontoret räcker en mindre surfmängd ofta längre.",
  },
];

export const Route = createFileRoute("/guider/delad-surf-foretag")({
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
  const treMax = FORETAG.find((a) => a.id === "tre-ftg-3foretag-obegransad-max");
  const fast = sortera(
    FORETAG.filter((a) => a.gb != null),
    "snitt-ar",
  );
  const obegr = sortera(
    FORETAG.filter((a) => a.gb == null),
    "snitt-ar",
  )[0];
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
        Delad surf betyder att flera sim-kort använder samma surfmängd. Ingen av operatörerna vi har
        granskat har en öppet prissatt surfpool för hela företaget. Det som finns är extra sim som
        delar surf med ett huvudabonnemang, som Tres datakort och Telias extra datasim. För större
        företag kan ramavtal vara vägen.
      </P>

      <H2 id="vad">Vad är delad surf?</H2>
      <P>
        Med delad, eller poolad, surf har företaget en gemensam surfpott som alla sim-kort använder.
        Den som surfar mycket en månad tar av samma pott som den som knappt surfar alls. Tanken är
        att ni betalar för den totala förbrukningen i stället för att varje person har ett eget
        paket med marginal.
      </P>
      <P>
        En enklare variant är ett extra sim, ofta kallat datakort eller datasim, som delar surf med
        ett huvudabonnemang. Det passar till en surfplatta, en dator eller en router.
      </P>

      <H2 id="operatorer">Vad erbjuder operatörerna?</H2>
      <GuideTable
        brytForsta
        head={["Operatör", "Delad surf eller extra sim", "Pris"]}
        rows={[
          [
            "Tre",
            "3Företag Datakort delar surfmängd med huvudabonnemanget, högst 100 GB/mån i Sverige. Ingår i 3Företag Obegränsad Max.",
            treMax ? `Ingår i Max (${kr(treMax.pris)} ordinarie exkl. moms)` : "Ingår i Max",
          ],
          [
            "Telia",
            "Ett extra datasim ingår i Företag Obegränsad Max och Premium. Telia skriver att du med ett extra simkort kan dela surfen med andra enheter.",
            "Ingår i Max och Premium",
          ],
          [
            "Tele2",
            "Extra datakort finns. Om det delar huvudabonnemangets surf framgår inte.",
            "99 kr/mån",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källa: tre.se, Tres prislista för röstabonnemang, telia.se och tele2.se, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}. Moms anges inte för Telias och Tele2s priser.
      </p>
      <P>
        Tele2 har i stället andra fördelar för flera användare: upp till nio kollegor kan få
        Obegränsad Max 50 kronor billigare i månaden, och samtal till kollegor inom samma
        organisationsnummer är fria. Telia och Tele2 har ramavtal för större företag. Tele2s
        ramavtal kräver minst 10 anställda.
      </P>

      <H2 id="lonar">När lönar det sig att dela surf?</H2>
      <P>
        Delad surf lönar sig mest när förbrukningen är ojämn: några surfar mycket och andra nästan
        inget. Använder alla ungefär lika mycket är det ofta lika billigt med ett abonnemang per
        person.
      </P>
      <P>
        Jämför med vad separata abonnemang kostar.
        {fast[0] && (
          <>
            {" "}
            Det billigaste företagsabonnemanget med fast surf är just nu{" "}
            {operator(fast[0].operator)?.namn ?? fast[0].operator} {fast[0].namn}
            för {kr(snittForstaAret(fast[0]))} i månaden i snitt första året.
          </>
        )}
        {obegr && (
          <> Billigaste obegränsade kostar {kr(snittForstaAret(obegr))} i månaden i snitt.</>
        )}{" "}
        Med obegränsad surf i varje telefon behövs ingen delning för telefonerna, men ett datakort
        till en dator eller router kan ändå vara praktiskt.
      </P>
      <Callout>
        Räkna på totalen per månad för hela företaget, med moms på samma sätt för alla alternativ.
        Använd <A href="/verktyg/foretagskalkylator">företagskalkylatorn</A>.
      </Callout>

      <H2 id="rakna">Så räknar du på surfen för hela företaget</H2>
      <P>Gör så här innan du väljer upplägg:</P>
      <UL>
        <li>
          <strong>Ta reda på förbrukningen.</strong> Be varje person kolla dataförbrukningen i
          telefonens inställningar, eller titta på fakturorna för de senaste månaderna.
        </li>
        <li>
          <strong>Dela upp i grupper.</strong> De som surfar mycket, de som surfar lite och de
          enheter som bara behöver data, som surfplattor och routrar.
        </li>
        <li>
          <strong>Räkna på två upplägg.</strong> Ett abonnemang per person med rätt surfmängd,
          jämfört med obegränsat till några och datakort till enheterna.
        </li>
        <li>
          <strong>Ta med hela avtalstiden.</strong> Hos Tre gäller introduktionspriset på 3Företag
          Obegränsad Max i 24 månader, sedan ordinarie pris. Räkna på båda.
        </li>
      </UL>
      <P>
        Se <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf du behöver</A> om du är
        osäker på förbrukningen.
      </P>

      <H2 id="alternativ">Alternativ till delad surf</H2>
      <UL>
        <li>
          <strong>Obegränsad surf till de som surfar mycket</strong> och ett billigt paket till
          resten. Se{" "}
          <A href="/foretag/billigaste-foretagsabonnemang">billigaste företagsabonnemang</A>.
        </li>
        <li>
          <strong>Ett datakort</strong> till surfplattan eller datorn i stället för ett eget
          abonnemang.
        </li>
        <li>
          <strong>Wifi på kontoret.</strong> Surf över wifi drar inte från mobilens surfmängd.
        </li>
        <li>
          <strong>Ramavtal</strong> om ni är många. Fråga Telia eller Tele2 om villkoren.
        </li>
      </UL>
      <P>
        Läs också <A href="/guider/vaxel-eller-mobil">växel eller bara mobil</A> och{" "}
        <A href="/foretag">mobilabonnemang för företag</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

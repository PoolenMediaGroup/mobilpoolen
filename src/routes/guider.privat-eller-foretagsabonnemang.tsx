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
import { FORETAG, PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, kr, momsText, snittForstaAret, sortera } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "privat-eller-foretagsabonnemang";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "skillnaden", label: "Vad är skillnaden?" },
  { id: "moms", label: "Moms och pris" },
  { id: "skydd", label: "Konsumentskyddet" },
  { id: "tjanster", label: "Tjänster för företag" },
  { id: "jamfor", label: "Jämför priserna" },
  { id: "valj", label: "Vilket ska du välja?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad är skillnaden mellan privat- och företagsabonnemang?",
    a: "Ett företagsabonnemang tecknas av företaget och priset anges oftast exkl. moms. Det har tjänster för flera användare, som växel och extra sim. Ett privat abonnemang har ett starkare konsumentskydd, till exempel högst en månads uppsägningstid.",
  },
  {
    q: "Gäller konsumentskyddet för företag?",
    a: "Delvis. Gränsen på 24 månaders bindningstid och rätten till en avtalssammanfattning gäller även mikroföretag och små företag, om de inte uttryckligen avstår. Regeln om högst en månads uppsägningstid gäller däremot bara konsumenter.",
    kalla: "Lagen (2022:482) om elektronisk kommunikation, 12 kap.",
  },
  {
    q: "Är företagsabonnemang billigare än privata?",
    a: "Inte nödvändigtvis. Priset exkl. moms ser lägre ut, men räknat inkl. moms kan ett privat abonnemang vara billigare. Jämför samma sak: multiplicera priset exkl. moms med 1,25.",
  },
  {
    q: "Kan jag som har enskild firma ha ett privat abonnemang?",
    a: "Ja. Många med enskild firma har ett privat abonnemang och gör avdrag för den del som används i verksamheten. Privat användning ska då uttagsbeskattas om abonnemanget bokförs i firman. Reglerna kan ändras och Skatteverket har sista ordet.",
    kalla: "Skatteverket",
  },
];

export const Route = createFileRoute("/guider/privat-eller-foretagsabonnemang")({
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

const namn = (a: Abonnemang) => `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;

function Page() {
  const privatObegr = sortera(
    PRIVATA.filter((a) => a.gb == null && !(a.malgrupp ?? []).length),
    "snitt-ar",
  )[0];
  const ftgObegr = sortera(
    FORETAG.filter((a) => a.gb == null),
    "snitt-ar",
  )[0];
  const ftgExklObegr = sortera(
    FORETAG.filter((a) => a.gb == null && a.moms === "exkl"),
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
        Ett företagsabonnemang tecknas av företaget, prissätts oftast exkl. moms och har tjänster
        för flera användare, som växel och extra sim. Ett privat abonnemang anges inkl. moms och har
        ett starkare konsumentskydd. För en enskild firma eller ett litet bolag kan båda fungera.
        Jämför alltid priset med samma moms.
      </P>

      <H2 id="skillnaden">Vad är skillnaden mellan privat och företag?</H2>
      <P>
        Tekniskt är det samma sak: ett sim-kort, ett nummer, surf och samtal i samma mobilnät.
        Skillnaden ligger i vem som är kund och vad avtalet innehåller.
      </P>
      <GuideTable
        head={["", "Privat", "Företag"]}
        rows={[
          ["Kund", "Privatperson", "Företaget, med organisationsnummer"],
          ["Pris", "Inkl. moms", "Oftast exkl. moms, men inte alltid angivet"],
          ["Max bindningstid", "24 månader", "24 månader för små företag, om de inte avstår"],
          ["Uppsägningstid", "Högst 1 månad", "Kan vara längre"],
          ["Växel, extra sim", "Sällan", "Ofta som tillägg eller ingår"],
          ["Faktura", "Till dig", "Till företaget"],
        ]}
      />
      <p className={KALLRAD}>
        Källa: lagen (2022:482) om elektronisk kommunikation, 12 kap., och operatörernas
        webbplatser.
      </p>

      <H2 id="moms">Moms och pris: jämför samma sak</H2>
      <P>
        Privata priser anges alltid inkl. moms. Företagspriser anges i regel exkl. moms, men inte
        alltid. Tre och Telavox skriver uttryckligen exkl. moms. Telia, Tele2 och Hallon anger inte
        moms på sina abonnemangssidor.
      </P>
      <P>
        Vill du jämföra ett företagspris exkl. moms med ett privat pris, multiplicera med 1,25.
        {ftgExklObegr && (
          <>
            {" "}
            {namn(ftgExklObegr)} kostar i snitt {kr(snittForstaAret(ftgExklObegr))} i månaden första
            året exkl. moms, vilket blir {kr(snittForstaAret(ftgExklObegr) * 1.25)} inkl. moms.
          </>
        )}
      </P>
      <Callout>
        Är företaget momsregistrerat får det dra av momsen för den del av abonnemanget som används i
        verksamheten. Då är priset exkl. moms den verkliga kostnaden för den delen. Läs mer i{" "}
        <A href="/guider/moms-mobilabonnemang">moms på mobilabonnemang</A>.
      </Callout>

      <H2 id="skydd">Konsumentskyddet: vad gäller för företag?</H2>
      <P>
        Lagen om elektronisk kommunikation skyddar konsumenter, men en del av skyddet gäller också
        små företag:
      </P>
      <UL>
        <li>
          <strong>Högst 24 månaders bindningstid</strong> gäller även mikroföretag, andra små
          företag och ideella organisationer, om de inte uttryckligen har gått med på avsteg. Ett
          mikroföretag har färre än 10 sysselsatta och högst 2 miljoner euro i omsättning eller
          balansomslutning, ett småföretag färre än 50 sysselsatta och högst 10 miljoner euro.
        </li>
        <li>
          <strong>Avtalssammanfattning och förhandsinformation</strong> ska ges även till små
          företag, om de inte uttryckligen avstår.
        </li>
        <li>
          <strong>Villkorsändringar</strong> ska aviseras minst en månad i förväg till alla kunder,
          även företag. Den som inte godtar en ändring till sin nackdel får säga upp avtalet utan
          kostnad inom tre månader.
        </li>
        <li>
          <strong>Högst en månads uppsägningstid</strong> gäller bara konsumenter. Ett företag kan
          alltså få längre uppsägningstid.
        </li>
        <li>
          <strong>Operatörslås</strong> som tas bort gratis efter bindningstiden gäller bara
          konsumenter.
        </li>
      </UL>
      <p className={KALLRAD}>
        Källa: lagen (2022:482) om elektronisk kommunikation, 12 kap. 8–16 §§.
      </p>

      <H2 id="tjanster">Tjänster som bara finns för företag</H2>
      <P>Det som oftast gör företagsabonnemanget värt pengarna är tjänsterna runt omkring:</P>
      <UL>
        <li>
          <strong>Växel.</strong> Telias Smart Connect ingår i Företag Obegränsad Max. Tre har
          3Koppla och Telavox har växel från Premium. Se{" "}
          <A href="/guider/vaxel-eller-mobil">växel eller bara mobil</A>.
        </li>
        <li>
          <strong>Extra sim och datakort.</strong> Tre har ett datakort som delar surfen med
          huvudabonnemanget. Se <A href="/guider/delad-surf-foretag">delad surf för företag</A>.
        </li>
        <li>
          <strong>Kollegarabatt.</strong> Hos Tele2 kan upp till nio kollegor få Obegränsad Max 50
          kr billigare i månaden, och samtal till kollegor inom samma organisationsnummer är fria.
        </li>
        <li>
          <strong>Ramavtal.</strong> Tele2 har ramavtal för företag med minst 10 anställda. Telia
          har ett mobilt ramavtal med egen kundtjänst och samlad faktura.
        </li>
      </UL>

      <H2 id="jamfor">Jämför priserna</H2>
      <P>Så här ser det billigaste obegränsade abonnemanget ut i de båda kategorierna just nu:</P>
      <GuideTable
        brytForsta
        head={["Kategori", "Abonnemang", "Snitt år 1", "Moms"]}
        rows={[
          ...(privatObegr
            ? [
                [
                  "Privat",
                  namn(privatObegr),
                  `${kr(snittForstaAret(privatObegr))}/mån`,
                  "inkl. moms",
                ],
              ]
            : []),
          ...(ftgObegr
            ? [
                [
                  "Företag",
                  namn(ftgObegr),
                  `${kr(snittForstaAret(ftgObegr))}/mån`,
                  momsText(ftgObegr.moms) ?? "moms anges inte",
                ],
              ]
            : []),
        ]}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Obegränsad
        surf i båda fallen.
      </p>

      <H2 id="valj">Vilket ska du välja?</H2>
      <UL>
        <li>
          <strong>Välj privat</strong> om du är ensam i firman, inte behöver växel och vill ha
          konsumentskyddet och många abonnemang utan bindningstid att välja bland.
        </li>
        <li>
          <strong>Välj företag</strong> om ni är flera, vill ha samlad faktura, växel eller extra
          sim, eller vill slippa privat användning i ett privat avtal.
        </li>
      </UL>
      <P>
        Har du enskild firma, läs{" "}
        <A href="/foretag/enskild-firma">mobilabonnemang för enskild firma</A>. Vill du flytta ett
        privat nummer till företaget, se{" "}
        <A href="/guider/overlata-abonnemang-till-foretag">överlåtelse till företag</A>. Alla
        företagsabonnemang finns på <A href="/foretag">mobilabonnemang för företag</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

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
import { FORETAG, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, kr, momsText, prisNu } from "@/lib/mobil/berakna";

const SLUG = "vaxel-eller-mobil";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "vad", label: "Vad gör en mobil växel?" },
  { id: "racker", label: "När räcker vanliga mobiler?" },
  { id: "telia", label: "Telia Smart Connect" },
  { id: "tre", label: "Tre 3Koppla" },
  { id: "telavox", label: "Telavox" },
  { id: "ovriga", label: "Tele2 och andra" },
  { id: "valj", label: "Så väljer du" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad kostar en mobil växel för ett litet företag?",
    a: "Telia Smart Connect kostar från 49 kr i månaden per användare och Tre 3Koppla 129 kr i månaden per användare som tillägg, enligt operatörerna. Ingen av dem anger moms för priset. Hos Telavox ingår växel i Obegränsad Premium, som kostar 399 kr i månaden exkl. moms.",
    kalla: "Telia, Tre och Telavox webbplatser",
  },
  {
    q: "Behöver ett enmansföretag en växel?",
    a: "Oftast inte. En vanlig mobil med röstbrevlåda räcker långt. En växel blir intressant när flera ska svara på samma nummer, när du vill ha öppettider och köer eller när du vill att kunderna ska ringa ett fast nummer.",
  },
  {
    q: "Ingår växel i något mobilabonnemang?",
    a: "Ja. Telias Företag Obegränsad Max har Smart Connect-växeln, och hos Telavox ingår växel från Obegränsad Premium. Tre 3Koppla är en tilläggstjänst.",
  },
  {
    q: "Kan jag behålla mitt nummer om jag byter till en växel?",
    a: "Numret följer abonnenten och kan porteras mellan operatörer. Telavox anger att en nummerflytt kan göras på några timmar. Fråga operatören hur det fungerar för just din växel.",
  },
];

export const Route = createFileRoute("/guider/vaxel-eller-mobil")({
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
  const telavox = FORETAG.filter((a) => a.operator === "telavox").sort((a, b) => a.pris - b.pris);
  const teliaMax = FORETAG.find((a) => a.id === "telia-ftg-foretag-obegransad-max");
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
        Ett litet företag klarar sig ofta med vanliga mobilabonnemang. En mobil växel lönar sig när
        flera ska svara på samma nummer, eller när du vill ha öppettider, köer och menyval. Telia
        Smart Connect kostar från 49 kronor per användare och månad, och Tre 3Koppla 129 kronor. Hos
        Telavox ingår växel från Premium.
      </P>

      <H2 id="vad">Vad gör en mobil växel?</H2>
      <P>
        En mobil växel kopplar ihop företagets mobiler under ett gemensamt nummer. Den som ringer
        kommer till företaget, inte till en person. Typiska funktioner är:
      </P>
      <UL>
        <li>ett fast eller gemensamt företagsnummer,</li>
        <li>öppettider och vad som händer utanför dem,</li>
        <li>menyval och köer,</li>
        <li>röstbrevlåda och vidarekoppling,</li>
        <li>statistik och integration med andra system i de dyrare paketen.</li>
      </UL>

      <H2 id="racker">När räcker vanliga mobiler?</H2>
      <P>
        Är du ensam i firman, eller har varje person sina egna kunder, räcker oftast ett vanligt
        mobilabonnemang med röstbrevlåda. Då betalar du inte för funktioner du inte använder.
      </P>
      <P>En växel blir intressant när:</P>
      <UL>
        <li>flera ska kunna svara när kunder ringer,</li>
        <li>du vill visa ett fast nummer utåt,</li>
        <li>samtal ska styras efter öppettider eller till rätt person,</li>
        <li>ni vill se statistik över missade samtal och köer.</li>
      </UL>

      <H2 id="telia">Telia Smart Connect</H2>
      <P>
        Telias mobila växel för små företag finns i flera nivåer. Kontroll på inringande samtal
        kostar 49 kronor i månaden per användare, som ett just nu-pris. Det ger växel och fast
        nummer, öppettider, menyval, köer och röstbrevlåda utanför öppettid. Professionellt med
        lokalt nummer kostar från 118 kronor i månaden. Större lösningar görs enligt offert.
      </P>
      <P>
        Ett extra funktionsnummer kostar 99 kronor i månaden och ett extra telefonnummer till en
        användare 39 kronor i månaden. Telia anger inte om priserna är exkl. eller inkl. moms, och
        inte heller bindningstid.
        {teliaMax && (
          <>
            {" "}
            Smart Connect ingår i {teliaMax.namn}, som har ordinarie pris {kr(teliaMax.pris)} i
            månaden.
          </>
        )}
      </P>

      <H2 id="tre">Tre 3Koppla</H2>
      <P>
        3Koppla är Tres mobila växel och kostar 129 kronor i månaden per användare som
        tilläggstjänst. Tre anger inte moms för just det priset. I 3Koppla ingår bland annat 8
        företagsnummer, webbchatt, återuppringning i stället för kö och köstatistik i realtid. Den
        går att koppla till Microsoft 365, Teams och Google Workspace, och det finns appar för
        HubSpot, Salesforce och WhatsApp Business. Ett externt nummer till växeln kostar 49 kronor i
        månaden exkl. moms enligt prislistan.
      </P>

      <H2 id="telavox">Telavox: växel i abonnemanget</H2>
      <P>
        Telavox bygger ihop mobilabonnemang, växel, app och AI. Priserna anges exkl. moms. Växel
        ingår från Premium.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Pris/mån", "Växel"]}
        rows={telavox.map((a) => [
          a.namn,
          `${kr(prisNu(a))} ${momsText(a.moms) ?? ""}`.trim(),
          a.notis?.toLowerCase().includes("ingen växel") ? "Nej" : "Ja",
        ])}
      />
      <p className={KALLRAD}>Källa: telavox.se, kontrollerad {datumText(SENAST_KONTROLLERAD)}.</p>
      <P>
        Premium har växel, fria interna samtal världen över, app för mobil och dator och AI Assist.
        Max lägger till ärendehantering, CRM- och Teams-integration, samtalsinspelning och avancerad
        statistik. Behöver ni bara fast telefoni med växel utan mobil finns Fixed Premium för 219
        kronor i månaden exkl. moms. Telavox anger att det finns en startavgift, men inte beloppet.
      </P>

      <H2 id="ovriga">Tele2 och andra operatörer</H2>
      <P>
        Tele2 har Tele2 Växel i tre paket för små företag, men priserna redovisas inte öppet på
        Tele2s sida. Därför skriver vi inga priser för den. Telenor har en företagsväxel som vi inte
        har kunnat kontrollera. Fråga operatören om offert.
      </P>

      <H2 id="valj">Så väljer du</H2>
      <UL>
        <li>
          <strong>Ensam eller få personer:</strong> vanliga{" "}
          <A href="/foretag">mobilabonnemang för företag</A> räcker oftast.
        </li>
        <li>
          <strong>Behov av gemensamt nummer och öppettider:</strong> en enkel växel som Telia Smart
          Connect på lägsta nivån.
        </li>
        <li>
          <strong>Integration med CRM, Teams eller chatt:</strong> 3Koppla eller Telavox.
        </li>
      </UL>
      <Callout>
        Räkna på totalen: abonnemang plus växel per användare, gånger antalet användare. Vår{" "}
        <A href="/verktyg/foretagskalkylator">företagskalkylator</A> hjälper dig. Kontrollera moms
        och bindningstid hos operatören innan du beställer.
      </Callout>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}

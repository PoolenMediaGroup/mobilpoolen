import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  CopyTemplate,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  P,
  UL,
  OL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "klaga-pa-operatoren";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "ordning", label: "I vilken ordning ska du klaga?" },
  { id: "operatoren", label: "Klaga hos operatören" },
  { id: "mall", label: "Mall för reklamation" },
  { id: "telekomradgivarna", label: "Telekområdgivarna" },
  { id: "arn", label: "Allmänna reklamationsnämnden" },
  { id: "fragor", label: "Vanliga frågor" },
];

const MALL = `Hej,

Jag vill reklamera [vad det gäller, t.ex. fakturan för september / avbrott i tjänsten].

Kundnummer: [ditt kundnummer]
Telefonnummer: [numret det gäller]

Vad som har hänt: [beskriv kort med datum].

Jag anser att [vad som är fel, t.ex. att avgiften inte stämmer med avtalet / att tjänsten inte har fungerat mellan datum och datum].

Jag vill att ni [vad du vill ha, t.ex. krediterar avgiften / sänker priset för perioden / rättar fakturan].

Jag betalar den del av fakturan som jag inte bestrider.

Jag ser fram emot ett skriftligt svar.

Vänliga hälsningar
[Namn]
[Datum]`;

const FAQ = [
  {
    q: "Var klagar jag på min mobiloperatör?",
    a: "Börja alltid hos operatören, skriftligt. Får du inte rätt kan du få gratis råd från Telekområdgivarna. Som sista steg kan du anmäla tvisten till Allmänna reklamationsnämnden, ARN, som prövar tvister mellan konsumenter och företag.",
  },
  {
    q: "Måste jag betala en faktura som jag tycker är fel?",
    a: "Bestrid den del du anser är fel, skriftligt och helst innan förfallodagen. Betala den del du inte bestrider. Då visar du att du inte vägrar betala, bara att du ifrågasätter en del.",
  },
  {
    q: "Kostar det att få hjälp av Telekområdgivarna?",
    a: "Nej. Telekområdgivarna ger gratis och opartisk rådgivning till konsumenter om telefoni, bredband och tv. De kan också kontakta operatören för din räkning.",
  },
  {
    q: "Kan jag säga upp avtalet om operatören höjer priset?",
    a: "Ja, om ändringen inte enbart är till din fördel. Operatören ska ge besked minst en månad innan, och du kan säga upp avtalet utan extra kostnad inom tre månader från beskedet (12 kap. 12 § LEK).",
  },
];

export const Route = createFileRoute("/guider/klaga-pa-operatoren")({
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
      cta={{ label: "Jämför och byt operatör" }}
    >
      <P>
        Klaga först skriftligt hos operatören och spara svaret. Får du inte rätt kan du få gratis
        råd av Telekområdgivarna, som också kan kontakta operatören åt dig. Som sista steg kan du
        anmäla tvisten till Allmänna reklamationsnämnden, ARN. Din kommuns konsumentvägledning och
        Konsumentverkets Hallå konsument kan också ge råd.
      </P>

      <H2 id="ordning">I vilken ordning ska du klaga?</H2>
      <GuideTable
        head={["Steg", "Vem", "Vad de gör"]}
        rows={[
          ["1", "Operatören", "Rättar fel, krediterar eller förklarar fakturan"],
          [
            "2",
            "Telekområdgivarna",
            "Gratis råd om telefoni, bredband och tv, kan kontakta operatören",
          ],
          [
            "3",
            "Konsumentvägledning och Hallå konsument",
            "Allmänna råd om dina rättigheter som konsument",
          ],
          ["4", "Allmänna reklamationsnämnden (ARN)", "Prövar tvisten och ger en rekommendation"],
          ["5", "Domstol", "Om tvisten inte går att lösa på annat sätt"],
        ]}
      />
      <P>
        Gör det i den ordningen. ARN kräver normalt att du först har klagat hos företaget och fått
        nej, helt eller delvis.
      </P>

      <H2 id="operatoren">Klaga hos operatören</H2>
      <OL>
        <li>
          <strong>Samla underlag.</strong> Avtalet eller avtalssammanfattningen, fakturan,
          skärmdumpar och datum för det som hänt.
        </li>
        <li>
          <strong>Klaga skriftligt.</strong> Mejl, chatt med sparad historik eller formulär på Mina
          sidor. Skriftligt går att visa i efterhand.
        </li>
        <li>
          <strong>Var konkret.</strong> Skriv vad som är fel och vad du vill att operatören ska
          göra.
        </li>
        <li>
          <strong>Bestrid fakturan</strong> om den är fel, och betala den del du inte bestrider.
        </li>
        <li>
          <strong>Spara svaret.</strong> Du behöver det om du går vidare.
        </li>
        <li>
          <strong>Klaga i tid.</strong> Hör av dig så snart du märker felet. Väntar du länge blir
          det svårare att få rätt.
        </li>
      </OL>
      <Callout>
        Vanliga skäl att klaga: en faktura som inte stämmer med avtalet, en prishöjning utan besked,
        ett avbrott, en nummerflytt som dröjt, eller ett abonnemang du inte har beställt.
      </Callout>
      <P>Några regler i lagen om elektronisk kommunikation (LEK) som ofta är relevanta:</P>
      <UL>
        <li>
          Prishöjning och andra ändringar till din nackdel ska meddelas minst en månad innan, och du
          kan då säga upp avtalet utan extra kostnad inom tre månader från beskedet.
        </li>
        <li>Uppsägningstiden får för konsumenter vara högst en månad.</li>
        <li>Vid nummerflytt får avbrottet vara högst en arbetsdag.</li>
        <li>
          Har du blivit uppringd och sålt ett abonnemang gäller avtalet bara om du godkänt
          erbjudandet skriftligt efter samtalet (distansavtalslagen).
        </li>
      </UL>
      <P>
        Läs mer i <A href="/guider/prishojning-mobilabonnemang">prishöjning på mobilabonnemang</A>,{" "}
        <A href="/guider/bindningstid-uppsagningstid">bindningstid och uppsägningstid</A> och{" "}
        <A href="/guider/angerratt-mobilabonnemang">ångerrätt</A>.
      </P>

      <H2 id="mall">Mall för reklamation</H2>
      <P>Kopiera texten, fyll i det som står inom hakparentes och skicka den till operatören.</P>
      <CopyTemplate title="Reklamation till mobiloperatören" text={MALL} />

      <H2 id="telekomradgivarna">Telekområdgivarna</H2>
      <P>
        Telekområdgivarna ger gratis och opartiska råd till konsumenter om telefoni, bredband och
        tv. De kan förklara vad som gäller i ditt fall och kontakta operatören för din räkning. Du
        når dem via telekomradgivarna.se.
      </P>
      <P>
        Telekområdgivarna står också bakom bluff-sms-numret 7726, och varnar för bedragare som utger
        sig för att vara dem. De ringer inte och ber dig legitimera dig med BankID. Läs mer i{" "}
        <A href="/guider/bedrageri-sim-swap-och-bluffsamtal">bluffsamtal och SIM-kapning</A>.
      </P>

      <H2 id="arn">Allmänna reklamationsnämnden</H2>
      <P>
        ARN är en statlig myndighet som prövar tvister mellan konsumenter och företag. Det är gratis
        att anmäla. Nämnden ger en rekommendation om hur tvisten bör lösas. Rekommendationen är inte
        bindande.
      </P>
      <UL>
        <li>Anmälan görs på arn.se.</li>
        <li>Bifoga avtal, faktura och operatörens skriftliga svar.</li>
        <li>
          ARN har regler om vilka ärenden som prövas, bland annat om beloppsgränser och hur lång tid
          som gått. Läs dem på arn.se innan du anmäler.
        </li>
      </UL>
      <P>
        Ibland är det enklare att byta operatör. Numret följer med och avbrottet får vara högst en
        arbetsdag. Se <A href="/guider/byta-operator-behalla-nummer">så byter du operatör</A> och{" "}
        <A href="/saga-upp">hur du säger upp abonnemanget</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: {KALLOR.lek.namn}, 12 kap. 12–13 och 19–20 §§; {KALLOR.distansavtal.namn}, 2 kap. 3
        a §; {KALLOR.telekomradgivarna.namn}.
      </p>
    </GuidePage>
  );
}

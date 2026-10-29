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
  OL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";

const SLUG = "sparra-kop-barn-mobil";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "vad-kostar", label: "Vad kan bli dyrt?" },
  { id: "operatoren", label: "Spärra hos operatören" },
  { id: "telefonen", label: "Inställningar i telefonen" },
  { id: "utland", label: "Surf och samtal utomlands" },
  { id: "om-det-hant", label: "Om det redan har hänt" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Hur spärrar jag köp via mobilräkningen?",
    a: "Kontakta operatören via appen, Mina sidor eller kundtjänst och be om en spärr för betaltjänster och köp som debiteras på mobilräkningen. Fråga samtidigt om spärr för betalnummer och betalsms.",
  },
  {
    q: "Räcker det med föräldrakontroll i telefonen?",
    a: "Inte helt. Föräldrakontrollen i iPhone eller Android styr köp i appbutiken, men köp och tjänster som debiteras via operatören stoppas säkrast med en spärr hos operatören. Använd båda.",
  },
  {
    q: "Vad gör jag om barnet har fått en dyr räkning?",
    a: "Kontakta operatören direkt, be om en specificerad faktura och fråga vad posterna är. Bestrid det du anser är fel innan förfallodagen. Få du inte rätt, kan du få hjälp av Telekområdgivarna.",
  },
  {
    q: "Vad gör jag med bluff-sms på barnets mobil?",
    a: "Klicka inte på länken. Vidarebefordra sms:et till 7726 och radera det sedan. Numret togs fram av Telekområdgivarna tillsammans med Polisen och mobiloperatörerna.",
  },
];

export const Route = createFileRoute("/guider/sparra-kop-barn-mobil")({
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
      cta={{ label: "Jämför abonnemang för barn", to: "/barn" }}
    >
      <P>
        Be operatören spärra betaltjänster, betalsms och betalnummer på barnets abonnemang. Det
        stoppar köp som annars hamnar på mobilräkningen. Slå sedan på föräldrakontrollen i
        telefonen, så att köp i appar kräver ditt godkännande. Stäng av dataroaming inför resor
        utanför EU. Tillsammans skyddar det mot de vanligaste dyra överraskningarna.
      </P>

      <H2 id="vad-kostar">Vad kan bli dyrt?</H2>
      <P>
        Ett vanligt abonnemang med fast pris kostar samma varje månad. Det som gör räkningen högre
        är nästan alltid något som läggs till utöver månadsavgiften:
      </P>
      <GuideTable
        head={["Vad", "Hur det händer", "Så stoppar du det"]}
        rows={[
          [
            "Betalsms och betaltjänster",
            "Barnet svarar på ett sms eller går med i en tävling",
            "Spärr hos operatören",
          ],
          [
            "Köp via mobilräkningen",
            "Köp i spel eller tjänster som debiteras operatören",
            "Spärr hos operatören",
          ],
          ["Betalnummer", "Samtal till nummer som kostar per minut", "Spärr hos operatören"],
          ["Köp i appar", "Köp i spel via appbutiken", "Föräldrakontroll i telefonen"],
          ["Surf utanför EU", "Roaming i länder utan EU:s regler", "Stäng av dataroaming"],
          ["Extra surf", "Barnet köper mer surf när den tar slut", "Fråga operatören om spärr"],
        ]}
      />

      <H2 id="operatoren">Spärra hos operatören</H2>
      <P>
        Spärrarna läggs på abonnemanget och gäller oavsett telefon. Det är därför den viktigaste
        åtgärden. Så här gör du:
      </P>
      <OL>
        <li>Logga in i operatörens app eller på Mina sidor som den som står på avtalet.</li>
        <li>Leta efter spärrar, säkerhet eller betaltjänster under abonnemangets inställningar.</li>
        <li>
          Spärra betaltjänster och köp via mobilräkningen, betalsms och samtal till betalnummer.
        </li>
        <li>Hittar du inte inställningen, ring eller chatta med kundtjänst och be om spärrarna.</li>
        <li>Kontrollera nästa faktura att inget oväntat har kommit med.</li>
      </OL>
      <Callout>
        Vilka spärrar som finns, och om de kostar något, skiljer mellan operatörerna. Fråga innan du
        tecknar abonnemanget om det är viktigt för dig.
      </Callout>

      <H2 id="telefonen">Inställningar i telefonen</H2>
      <UL>
        <li>
          <strong>iPhone:</strong> Under Skärmtid finns begränsningar för köp i App Store och köp i
          appar. Med Familjedelning kan barnet be om lov innan ett köp genomförs.
        </li>
        <li>
          <strong>Android:</strong> I Google Play kan du kräva lösenord eller godkännande för köp.
          Med Google Family Link styr du köp och appar från din egen telefon.
        </li>
        <li>
          <strong>Inget kort i appbutiken:</strong> Koppla inte ett betalkort till barnets konto.
          Använd presentkort om barnet ska kunna köpa något.
        </li>
      </UL>
      <P>
        Prata också med barnet om bluff-sms. Ett sms om ett paket, en vinst eller en obetald avgift
        med en länk är nästan alltid bedrägeri. Läs mer i guiden om{" "}
        <A href="/guider/bedrageri-sim-swap-och-bluffsamtal">bluffsamtal och bluff-sms</A>.
      </P>

      <H2 id="utland">Surf och samtal utomlands</H2>
      <P>
        Inom EU, Norge, Island och Liechtenstein surfar barnet som hemma, inom abonnemangets
        EU-surf. Utanför EU kan surfen kosta mycket. Stäng av dataroaming i telefonens inställningar
        innan resan, eller köp ett resepaket. Läs <A href="/guider/surfa-i-eu">surfa i EU</A> och{" "}
        <A href="/guider/surfa-utanfor-eu">surfa utanför EU</A>.
      </P>
      <P>
        Vill du ha full kontroll är ett kontantkort ett alternativ. Då kan barnet aldrig använda mer
        än det som är laddat. Jämför i guiden{" "}
        <A href="/guider/kontantkort-eller-abonnemang">kontantkort eller abonnemang</A>.
      </P>

      <H2 id="om-det-hant">Om det redan har hänt</H2>
      <OL>
        <li>Lägg spärrarna direkt så att det inte händer igen.</li>
        <li>Be operatören om en specificerad faktura och fråga vad posterna är.</li>
        <li>Bestrid det du anser är fel skriftligt, innan förfallodagen.</li>
        <li>Betala den del du inte bestrider.</li>
        <li>
          Får du inte rätt, läs <A href="/guider/klaga-pa-operatoren">så klagar du på operatören</A>
          .
        </li>
      </OL>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: Tre, pressmeddelande om 7726 (27 november 2023); EU:s regler om Roam like at home
        (Your Europe). Spärrar och avgifter enligt respektive operatör.
      </p>
    </GuidePage>
  );
}

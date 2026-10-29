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

const SLUG = "bedrageri-sim-swap-och-bluffsamtal";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "bluffsamtal", label: "Bluffsamtal och falska nummer" },
  { id: "blockerar", label: "Vad operatörerna blockerar" },
  { id: "bluff-sms", label: "Bluff-sms och 7726" },
  { id: "bankid", label: "BankID och falska rådgivare" },
  { id: "sim-kapning", label: "Om numret kapas" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vart skickar jag bluff-sms?",
    a: "Vidarebefordra sms:et till 7726, som motsvarar SPAM på knappsatsen. Tjänsten togs fram av Telekområdgivarna tillsammans med Polisen och mobiloperatörerna och har funnits sedan november 2023.",
  },
  {
    q: "Kan bedragare ringa från ett svenskt nummer?",
    a: "De kan försöka. Sedan PTS föreskrifter PTSFS 2024:2 ska operatörerna stoppa samtal från utlandet som visar ett svenskt fast nummer (från 4 november 2024) eller ett svenskt mobilnummer (från 3 mars 2025). Ett svenskt nummer på displayen är ändå ingen garanti för att samtalet är äkta.",
  },
  {
    q: "Vad är SIM-kapning?",
    a: "Det betyder att en bedragare får ditt telefonnummer flyttat till ett SIM-kort som bedragaren kontrollerar, till exempel genom att lura operatören. Då kan bedragaren ta emot dina samtal och sms, även engångskoder.",
  },
  {
    q: "Vad gör jag om jag har legitimerat mig med BankID åt en bedragare?",
    a: "Kontakta din bank direkt, så att de kan spärra och stoppa transaktioner. Polisanmäl också. Det rådet ger Telekområdgivarna.",
  },
];

export const Route = createFileRoute("/guider/bedrageri-sim-swap-och-bluffsamtal")({
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
      cta={{ label: "Jämför mobilabonnemang" }}
    >
      <P>
        Lägg på om någon ringer och ber dig legitimera dig med BankID. Vidarebefordra bluff-sms till
        7726. Operatörerna ska enligt PTS regler stoppa samtal från utlandet som visar ett falskt
        svenskt nummer, men alla stoppas inte. Tappar mobilen plötsligt täckningen utan förklaring,
        kontakta operatören och banken direkt. Numret kan ha kapats.
      </P>

      <H2 id="bluffsamtal">Bluffsamtal och falska nummer</H2>
      <P>
        Bedragare ringer ofta från utlandet men låter det se ut som ett svenskt nummer på displayen.
        Det kallas spoofing. Numret kan likna din banks, en myndighets eller ett vanligt
        mobilnummer. Syftet är att du ska lita på samtalet.
      </P>
      <P>
        En annan metod är wangiri. Du får ett missat samtal från ett utländskt nummer, och om du
        ringer tillbaka hamnar du på ett betalnummer. Ring aldrig tillbaka till okända utländska
        nummer.
      </P>

      <H2 id="blockerar">Vad operatörerna blockerar</H2>
      <P>
        PTS föreskrifter PTSFS 2024:2 kräver att operatörerna stoppar vissa samtal från utlandet:
      </P>
      <GuideTable
        head={["Samtal från utlandet som visar", "Ska stoppas från", "Undantag"]}
        rows={[
          ["Ett svenskt fast nummer", "4 november 2024", "I vissa fall döljs numret i stället"],
          [
            "Ett svenskt mobilnummer",
            "3 mars 2025",
            "Efter kontroll att numret inte faktiskt används utomlands",
          ],
        ]}
      />
      <p className={KALLRAD}>Källa: PTS, Telephone scams / spoofing, PTSFS 2024:2.</p>
      <P>
        Operatörerna stoppar mycket. Telia uppger att de stoppade 54 miljoner bedrägerisamtal 2024,
        varav 17 miljoner med falska nummer och 37 miljoner wangiri-samtal. Under första halvåret
        2025 stoppade Telia över 31 miljoner bluffsamtal. Våren 2025 anslöt Telia också till en
        gemensam branschlösning mot falska nummer mellan operatörernas nät.
      </P>
      <p className={KALLRAD}>Källa: Telias pressmeddelanden 19 december 2024 och 10 juli 2025.</p>
      <Callout>
        Blockeringen tar inte bort risken. Ett samtal kan komma från ett svenskt nummer som
        bedragarna faktiskt använder. Lita aldrig på numret på displayen.
      </Callout>

      <H2 id="bluff-sms">Bluff-sms och 7726</H2>
      <P>
        Bluff-sms handlar ofta om ett paket som inte kunnat levereras, en obetald avgift, en vinst
        eller ett konto som ska spärras. Det finns alltid en länk eller ett nummer att ringa.
      </P>
      <OL>
        <li>Klicka inte på länken och svara inte.</li>
        <li>Vidarebefordra sms:et till 7726. Det motsvarar SPAM på knappsatsen.</li>
        <li>Radera sms:et.</li>
        <li>Har du redan lämnat uppgifter, kontakta banken direkt.</li>
      </OL>
      <P>
        Nummer 7726 finns sedan november 2023 och togs fram av Telekområdgivarna tillsammans med
        Polisen, Tre och andra mobiloperatörer. Lär även barnen detta. Se{" "}
        <A href="/guider/sparra-kop-barn-mobil">spärra köp på barnens mobil</A>.
      </P>

      <H2 id="bankid">BankID och falska rådgivare</H2>
      <P>
        Den vanligaste vägen till dina pengar är att få dig att legitimera dig eller signera med
        BankID. Telekområdgivarna ger rådet: logga aldrig in med BankID på någon annans uppmaning om
        du inte är helt säker på vem motparten är.
      </P>
      <UL>
        <li>Ingen bank, myndighet eller operatör ringer och ber dig legitimera dig med BankID.</li>
        <li>Har du lämnat ut uppgifter eller godkänt något, kontakta banken och polisanmäl.</li>
        <li>
          Telekområdgivarna varnar för bedragare som utger sig för att vara just dem och påstår att
          abonnemang har tecknats i ditt namn.
        </li>
      </UL>
      <P>
        Säljer någon ett abonnemang per telefon gäller avtalet bara om du efter samtalet godkänner
        erbjudandet skriftligt. Det följer av distansavtalslagen. Läs mer om{" "}
        <A href="/guider/angerratt-mobilabonnemang">ångerrätt på mobilabonnemang</A>. Vill du klaga
        på något operatören har gjort, se{" "}
        <A href="/guider/klaga-pa-operatoren">så klagar du på operatören</A>.
      </P>

      <H2 id="sim-kapning">Om numret kapas</H2>
      <P>
        Vid SIM-kapning, även kallat SIM-swap, lyckas en bedragare flytta ditt nummer till ett
        SIM-kort de kontrollerar. Det kan ske genom att de lurar operatören att skicka ett nytt
        SIM-kort eller eSIM. Då får bedragaren dina sms och samtal, och kan ta emot engångskoder.
      </P>
      <P>Tecken på att något är fel:</P>
      <UL>
        <li>Mobilen tappar plötsligt täckningen och visar ingen tjänst, utan förklaring.</li>
        <li>Du får besked om att ditt SIM-kort eller eSIM har bytts, utan att du bett om det.</li>
        <li>Du kan inte längre logga in på tjänster som skickar koder via sms.</li>
      </UL>
      <P>Gör så här direkt:</P>
      <OL>
        <li>Kontakta din operatör från en annan telefon och be dem spärra SIM-kortet.</li>
        <li>Ring din bank och be dem spärra kort och inloggningar.</li>
        <li>Byt lösenord till e-post och andra viktiga konton.</li>
        <li>Polisanmäl.</li>
      </OL>
      <P>
        Förebygg genom att använda en app för inloggning i stället för sms-koder där det går, och
        fråga din operatör vilket skydd som finns mot obehöriga SIM-byten. Läs också{" "}
        <A href="/guider/vad-ar-esim">vad är eSIM?</A>
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: PTS om spoofing och PTSFS 2024:2; Telekområdgivarna, bedrägerivarning (uppdaterad 23
        oktober 2025); Tre om 7726 (27 november 2023); Telias pressmeddelanden 2024 och 2025;
        distansavtalslagen (2005:59), 2 kap. 3 a §.
      </p>
    </GuidePage>
  );
}

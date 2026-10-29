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
import { ABONNEMANG, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "surfa-utanfor-eu";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "varfor-dyrt", label: "Varför är det dyrt utanför EU?" },
  { id: "lander", label: "USA, Thailand, Turkiet och Storbritannien" },
  { id: "fore-resan", label: "Gör så här före resan" },
  { id: "alternativ", label: "Resepaket, rese-eSIM eller lokalt SIM" },
  { id: "abonnemang", label: "Abonnemang med surf utanför EU" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad kostar det att surfa i USA med ett svenskt abonnemang?",
    a: "Det beror helt på operatören. USA omfattas inte av EU:s roamingregler, så varje operatör sätter sitt eget pris. Se efter i din operatörs utlandsprislista eller app, och köp ett resepaket om operatören har ett.",
  },
  {
    q: "Ingår Turkiet i EU-surfen?",
    a: "Nej. Turkiet är inte med i EU eller EES och omfattas inte av Roam like at home. Kontrollera vad din operatör tar för surf där innan du reser.",
  },
  {
    q: "Ingår Storbritannien i EU-surfen?",
    a: "Storbritannien omfattas inte av EU:s regler efter brexit. Flera svenska operatörer tar ändå med det frivilligt, ibland med ett lägre tak. Läs din operatörs villkor.",
  },
  {
    q: "Hur stänger jag av mobildata utomlands?",
    a: "Stäng av dataroaming i telefonens inställningar under Mobilnät eller Anslutningar. Då kan telefonen inte surfa via utländska nät, men du kan fortfarande använda wifi. Samtal och sms kan fortfarande kosta.",
  },
];

export const Route = createFileRoute("/guider/surfa-utanfor-eu")({
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
  const max = ABONNEMANG.find((a) => a.id === "tele2-mobil-obegransad-max");

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
        Utanför EU och EES gäller inte Roam like at home. Varje operatör sätter då sitt eget pris
        för surf, samtal och sms, och det kan bli dyrt. Kontrollera operatörens utlandsprislista
        före resan, köp ett resepaket om det finns och stäng av dataroaming tills du vet vad det
        kostar. Ett rese-eSIM eller lokalt SIM-kort kan vara billigare.
      </P>

      <H2 id="varfor-dyrt">Varför är det dyrt utanför EU?</H2>
      <P>
        Inom EU finns pristak för vad operatörerna får ta av varandra och av dig. Utanför EU finns
        inga sådana regler. Din svenska operatör betalar den utländska operatören för trafiken och
        tar sedan betalt av dig enligt sin egen prislista. Priset per MB kan vara mycket högre än
        hemma.
      </P>
      <P>
        Det betyder också att det skiljer mellan operatörerna. En operatör kan ha ett bra resepaket
        för USA medan en annan bara tar betalt per MB. Därför finns inget enkelt svar på vad det
        kostar att surfa i ett land utanför EU. Svaret står i just din operatörs prislista.
      </P>

      <H2 id="lander">USA, Thailand, Turkiet och Storbritannien</H2>
      <GuideTable
        head={["Land", "Omfattas av EU-reglerna?", "Det här gäller"]}
        rows={[
          ["USA", "Nej", "Operatörens eget pris. Kontrollera resepaket."],
          ["Thailand", "Nej", "Operatörens eget pris. Lokalt SIM är vanligt."],
          ["Turkiet", "Nej", "Operatörens eget pris, trots närheten till EU."],
          ["Storbritannien", "Nej", "Ingår frivilligt hos vissa operatörer, ibland med lägre tak."],
          ["Schweiz", "Nej", "Ingår frivilligt hos vissa operatörer, ibland med lägre tak."],
          ["Norge, Island", "Ja (EES)", "Som hemma, inom abonnemangets EU-surf."],
        ]}
      />
      <p className={KALLRAD}>
        Källa: {KALLOR.roaming.namn}. Hallon tar enligt sina villkor med Storbritannien i EU-surfen,
        och Lyca Mobile har ett lägre tak för Storbritannien och Schweiz.
      </p>

      <H2 id="fore-resan">Gör så här före resan</H2>
      <OL>
        <li>
          <strong>Läs operatörens utlandsprislista.</strong> Sök efter landet i operatörens app
          eller på webbplatsen. Se vad surf, samtal och sms kostar.
        </li>
        <li>
          <strong>Kolla om det finns ett resepaket.</strong> Många operatörer säljer dags- eller
          veckopaket för länder utanför EU. De är oftast mycket billigare än att betala per MB.
        </li>
        <li>
          <strong>Stäng av dataroaming</strong> tills du har bestämt dig. Då surfar telefonen bara
          på wifi.
        </li>
        <li>
          <strong>Stäng av automatiska uppdateringar och säkerhetskopiering</strong> över mobilnät.
          De kan dra mycket data i bakgrunden.
        </li>
        <li>
          <strong>Ladda ner kartor och underhållning</strong> innan du åker.
        </li>
      </OL>
      <Callout>
        Kryssning och flyg är ett eget fall. Ombord kopplar telefonen ofta upp mot ett satellitnät
        som inte omfattas av någon EU-regel, inte ens på Östersjön. Stäng av dataroaming när du går
        ombord.
      </Callout>

      <H2 id="alternativ">Resepaket, rese-eSIM eller lokalt SIM</H2>
      <UL>
        <li>
          <strong>Resepaket från din operatör.</strong> Enklast. Du behåller ditt nummer och betalar
          på vanliga fakturan. Jämför priset med alternativen.
        </li>
        <li>
          <strong>Rese-eSIM.</strong> Ett eSIM med bara surf som du köper för ett visst land eller
          område och laddar ner före resan. Det kräver att telefonen stöder eSIM och kan ha två
          abonnemang samtidigt. Ditt vanliga nummer kan ligga kvar för sms. Läs{" "}
          <A href="/guider/vad-ar-esim">vad är eSIM?</A>
        </li>
        <li>
          <strong>Lokalt SIM-kort.</strong> Köps på plats, ofta på flygplatsen. Ofta billigast för
          långa resor. Du får ett utländskt nummer under resan.
        </li>
        <li>
          <strong>Bara wifi.</strong> Fungerar för korta resor om du inte behöver navigera eller
          vara nåbar hela tiden.
        </li>
      </UL>
      <P>
        Kontrollera att telefonen inte är operatörslåst innan du köper ett utländskt SIM-kort. När
        bindningstiden för en subventionerad telefon gått ut ska operatören ta bort låset gratis.
      </P>

      <H2 id="abonnemang">Abonnemang med surf utanför EU</H2>
      <P>
        Några abonnemang har surf utanför EU inbyggd. Ett exempel i vår jämförelse är Tele2s Mobil
        Obegränsad Max, som enligt Tele2 ger upp till 60 GB surf i över 170 länder.
        {max
          ? ` Ordinarie pris är ${kr(max.pris)} i månaden${
              max.kampanjpris != null && max.kampanjManader
                ? `, med kampanjpris ${kr(max.kampanjpris)} i ${max.kampanjManader} månader`
                : ""
            }${max.bindning ? ` och ${max.bindning} månaders bindningstid` : ""}. Snittet första året blir ${kr(snittForstaAret(max))} i månaden.`
          : ""}
      </P>
      <p className={KALLRAD}>
        Källa: Tele2s webbplats, kontrollerad {datumText(SENAST_KONTROLLERAD)}. Vilka länder som
        ingår står i Tele2s villkor.
      </p>
      <P>
        Reser du mest inom Europa räcker det med ett abonnemang med mycket EU-surf. Läs{" "}
        <A href="/guider/surfa-i-eu">surfa i EU</A> och jämför{" "}
        <A href="/obegransad-surf">abonnemang med obegränsad surf</A>. Ska du ringa hem, se{" "}
        <A href="/guider/ringa-utomlands-billigt">ringa till utlandet billigt</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: {KALLOR.roaming.namn}; lagen (2022:482) om elektronisk kommunikation, 12 kap. 15 §;
        operatörernas webbplatser.
      </p>
    </GuidePage>
  );
}

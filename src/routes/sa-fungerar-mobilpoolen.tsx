import { createFileRoute, Link } from "@tanstack/react-router";
import { TrustPage } from "@/components/trust-page";
import { FaqAccordion } from "@/components/guide-page";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";

const HEAD_TITLE = "Så fungerar Mobilpoolen";
const DESC =
  "Mobilpoolen jämför mobilabonnemang gratis. Du väljer här och beställer direkt hos operatören. Vi sparar inga uppgifter om dig och säljer inga abonnemang själva.";
const PATH = "/sa-fungerar-mobilpoolen";

const FAQ = [
  {
    q: "Kostar det något att använda Mobilpoolen?",
    a: "Nej. Jämförelsen, kalkylatorerna och guiderna är gratis, och du behöver inget konto.",
  },
  {
    q: "Var beställer jag abonnemanget?",
    a: "Direkt hos operatören. Knappen vid varje abonnemang leder till operatörens egen sida, och avtalet gäller mellan dig och operatören.",
  },
  {
    q: "Sparar ni några uppgifter om mig?",
    a: "Inte när du jämför. Kalkylatorerna räknar i din webbläsare och skickar inget till oss. Vi räknar bara antalet besök per dag på servern, utan cookies och utan att spara din IP-adress.",
  },
];

export const Route = createFileRoute("/sa-fungerar-mobilpoolen")({
  head: () =>
    pageHead({
      title: `${HEAD_TITLE}: jämför mobilabonnemang gratis`,
      description: DESC,
      socialTitle: HEAD_TITLE,
      canonical: PATH,
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Så fungerar Mobilpoolen", path: PATH },
        ]),
        faqJsonLd(FAQ),
      ],
    }),
  component: Sida,
});

function Sida() {
  return (
    <TrustPage
      title="Så fungerar Mobilpoolen"
      intro="Mobilpoolen samlar mobilabonnemangen från operatörerna på ett ställe och räknar på vad de kostar över tid. Du jämför här och beställer direkt hos operatören. Det är gratis och kräver inget konto."
      updated="29 oktober 2026"
    >
      <div className="prosa">
        <h2>1. Ta reda på vad du behöver</h2>
        <p>
          Börja med hur mycket du surfar. Kolla förbrukningen i telefonens inställningar eller
          använd <Link to={"/verktyg/hur-mycket-surf-behover-jag" as never}>surfkalkylatorn</Link>.
          Fundera också på om du vill ha bindningstid, och i vilket nät täckningen är bäst där du
          bor.
        </p>
        <h2>2. Jämför</h2>
        <p>
          <Link to="/" hash="alla">
            Jämförelsen
          </Link>{" "}
          visar alla abonnemang vi har kontrollerat, sorterade efter snittpris per månad under
          första året. Filtrera på surf, bindningstid, 5G och nät. Öppna Detaljer för ordinarie
          pris, EU-surf, totalkostnad över två år och länk till källan.
        </p>
        <h2>3. Beställ hos operatören</h2>
        <p>
          När du har hittat rätt abonnemang leder knappen till operatörens egen sida. Där beställer
          du och väljer om du vill flytta ditt nummer. Den nya operatören sköter flytten och
          avslutar det gamla abonnemanget. Läs mer i guiden om att{" "}
          <Link to={"/guider/byta-operator-behalla-nummer" as never}>
            byta operatör och behålla numret
          </Link>
          .
        </p>
        <h2>För företag</h2>
        <p>
          Företagsabonnemangen jämförs på en egen sida, där vi visar om operatören anger priset
          exkl. eller inkl. moms. Med{" "}
          <Link to={"/verktyg/foretagskalkylator" as never}>företagskalkylatorn</Link> räknar du ut
          kostnaden för alla anställda per år.
        </p>
        <h2>Vem står bakom?</h2>
        <p>
          Mobilpoolen drivs av PMG Poolen Media Group AB, som också driver jämförelsetjänsterna
          Elpoolen och Larmpoolen. Läs mer <Link to="/om-oss">om oss</Link>, om{" "}
          <Link to="/sa-jamfor-vi">hur vi jämför</Link> och om{" "}
          <Link to="/sa-tjanar-vi-pengar">hur vi tjänar pengar</Link>.
        </p>
        <h2>Vanliga frågor</h2>
      </div>
      <div className="mt-6">
        <FaqAccordion items={FAQ} />
      </div>
    </TrustPage>
  );
}

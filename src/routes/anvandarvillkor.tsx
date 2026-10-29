import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/anvandarvillkor")({
  head: () =>
    pageHead({
      title: "Användarvillkor | Mobilpoolen",
      description:
        "Villkor för att använda Mobilpoolens kostnadsfria jämförelse av mobilabonnemang: vad tjänsten är, prisuppgifterna, länkar till operatörer och ansvar.",
      canonical: "https://mobilpoolen.se/anvandarvillkor",
    }),
  component: AnvandarvillkorPage,
});

const H2 = "text-xl font-semibold mt-10 mb-3";
const LANK = "text-primary hover:underline";

function AnvandarvillkorPage() {
  return (
    <LegalPage>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Användarvillkor</h1>
      <p className="text-sm text-muted-foreground mb-8">Senast uppdaterade: 29 oktober 2026</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Om tjänsten</h2>
      <p>
        Mobilpoolen drivs av PMG Poolen Media Group AB, org.nr 559602-5287, Valfrid Palmgrens gata
        12, 113 69 Stockholm. Mobilpoolen är en kostnadsfri tjänst där du kan jämföra
        mobilabonnemang för privatpersoner och företag, läsa guider och använda kalkylatorer. Vi
        säljer inga abonnemang och tar inte emot beställningar. Du behöver inget konto och lämnar
        inga uppgifter för att använda tjänsten.
      </p>

      <h2 className={H2}>2. Kostnadsfritt</h2>
      <p>
        Tjänsten är gratis för dig. I dag får vi ingen ersättning från någon operatör. Längre fram
        kan vi få ersättning från operatörer när någon beställer via oss. Länkar som kan ge oss
        ersättning märks i så fall vid knappen, och ersättningen påverkar aldrig ordningen i
        jämförelsen. Läs mer på sidan{" "}
        <Link to="/sa-tjanar-vi-pengar" className={LANK}>
          Så tjänar vi pengar
        </Link>
        .
      </p>

      <h2 className={H2}>3. Prisuppgifter</h2>
      <p>
        Priser och villkor hämtas från operatörernas egna webbplatser och prislistor och visas med
        källa och kontrolldatum. Jämförelsen omfattar inte alla operatörer eller alla abonnemang på
        marknaden. Operatörerna kan ändra priser, kampanjer och villkor när som helst, och det kan
        dröja innan ändringen syns hos oss. Det som gäller är alltid det operatören visar när du
        beställer.{" "}
        <Link to="/sa-jamfor-vi" className={LANK}>
          Så jämför vi
        </Link>
        .
      </p>

      <h2 className={H2}>4. Kalkylatorer och guider</h2>
      <p>
        Kalkylatorerna ger en uppskattning utifrån det du fyller i och de priser vi har
        kontrollerat. Guiderna är allmän information och inte juridisk eller ekonomisk rådgivning
        för just din situation. Kontrollera alltid villkoren hos operatören innan du bestämmer dig.
      </p>

      <h2 className={H2}>5. Länkar till operatörer</h2>
      <p>
        När du klickar vidare till en operatör lämnar du Mobilpoolen. Beställer du ett abonnemang
        ingås avtalet direkt mellan dig och operatören, och operatörens villkor gäller. Mobilpoolen
        är inte part i avtalet. Läs avtalssammanfattningen som operatören ska ge dig innan du
        bekräftar.
      </p>

      <h2 className={H2}>6. Ångerrätt för privatpersoner</h2>
      <p>
        Tecknar du som konsument ett abonnemang på distans, till exempel på nätet eller per telefon,
        har du normalt 14 dagars ångerrätt enligt lagen om distansavtal och avtal utanför
        affärslokaler. Ångerrätten gäller mot operatören. Läs mer i vår{" "}
        <Link to={"/guider/angerratt-mobilabonnemang" as never} className={LANK}>
          guide om ångerrätt och telefonförsäljning
        </Link>
        .
      </p>

      <h2 className={H2}>7. Företag</h2>
      <p>
        Företag räknas inte som konsumenter, och konsumentskyddsregler som ångerrätt gäller därför
        normalt inte avtal som ett företag ingår med en operatör. Vissa regler i lagen om
        elektronisk kommunikation gäller även mikroföretag, småföretag och ideella organisationer,
        se våra guider för företag.
      </p>

      <h2 className={H2}>8. Personuppgifter</h2>
      <p>
        Vi behandlar personuppgifter enligt vår{" "}
        <Link to="/integritetspolicy" className={LANK}>
          integritetspolicy
        </Link>{" "}
        och gällande dataskyddslagstiftning (GDPR).
      </p>

      <h2 className={H2}>9. Ansvarsbegränsning</h2>
      <p>
        Vi tillhandahåller tjänsten i befintligt skick och gör vårt bästa för att uppgifterna ska
        stämma, men kan inte garantera att de alltid är fullständiga eller aktuella. Vi ansvarar
        inte för operatörernas abonnemang, priser, nät, kundtjänst eller fullgörande av avtal, och
        inte för indirekta skador. Ingenting i villkoren begränsar dina rättigheter som konsument
        enligt tvingande lag.
      </p>

      <h2 className={H2}>10. Immateriella rättigheter</h2>
      <p>
        Texter, uträkningar, varumärke och övrigt material på Mobilpoolen tillhör PMG Poolen Media
        Group AB och får inte kopieras eller användas kommersiellt utan tillstånd. Operatörernas
        namn och varumärken tillhör respektive operatör.
      </p>

      <h2 className={H2}>11. Ändringar och tvist</h2>
      <p>
        Vi kan uppdatera villkoren, och den senaste versionen publiceras alltid här med datum.
        Svensk lag gäller. Tvist prövas av allmän domstol. Har du en tvist med din operatör kan du
        som konsument vända dig till Allmänna reklamationsnämnden (ARN), och Telekområdgivarna ger
        kostnadsfri vägledning.
      </p>

      <p className="mt-8">
        Kontakt:{" "}
        <a href="mailto:info@mobilpoolen.se" className={LANK}>
          info@mobilpoolen.se
        </a>
      </p>
    </LegalPage>
  );
}

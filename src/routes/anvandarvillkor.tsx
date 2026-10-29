import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/anvandarvillkor")({
  head: () =>
    pageHead({
      title: "Användarvillkor | Mobilpoolen",
      description:
        "Villkor för att använda Mobilpoolens kostnadsfria jämförelsetjänst för hemlarm.",
      canonical: "https://mobilpoolen.se/anvandarvillkor",
    }),
  component: AnvandarvillkorPage,
});

function AnvandarvillkorPage() {
  return (
    <LegalPage>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Användarvillkor</h1>
      <p className="text-sm text-muted-foreground mb-8">Senast uppdaterade: 2 oktober 2026</p>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Om tjänsten</h2>
      <p>
        Mobilpoolen drivs av PMG Poolen Media Group AB, org.nr 559602-5287, Valfrid Palmgrens gata
        12, 113 69 Stockholm. Mobilpoolen är en kostnadsfri tjänst där du kan jämföra larmbolagens
        publicerade startpaket och ställa dig på en väntelista. Offertförmedlingen har inte öppnat
        än: i dag skickas inga förfrågningar till larmbolag. Vi säljer, installerar och levererar
        inga larm själva. Läs hur det går till på{" "}
        <Link to="/sa-fungerar-mobilpoolen" className="text-primary hover:underline">
          Så fungerar Mobilpoolen
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">2. Kostnadsfritt</h2>
      <p>
        Tjänsten är gratis för dig. I dag får vi ingen ersättning från något larmbolag. När
        offertförmedlingen öppnar kommer vi att få ersättning från de larmbolag vi förmedlar
        förfrågningar till. Ersättningen påverkar inte priset du betalar. Läs mer på sidan{" "}
        <Link to="/sa-tjanar-vi-pengar" className="text-primary hover:underline">
          Så tjänar vi pengar
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">3. Prisuppgifter</h2>
      <p>
        Priserna hämtas från larmbolagens egna webbplatser och visas med källa och datum.
        Jämförelsen omfattar inte alla larmbolag på marknaden. Priser och villkor kan ändras av
        bolagen. Det som gäller är alltid det larmbolaget bekräftar i sin offert eller sitt avtal.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">4. Väntelistan och offertförfrågan</h2>
      <p>
        Anmäler du dig till väntelistan sparar vi din e-postadress för att meddela dig när
        offertförmedlingen öppnar. Ingenting skickas till något larmbolag. Du binder dig inte till
        något.
      </p>
      <p className="mt-4">
        När offertförmedlingen öppnar uppdaterar vi de här villkoren. Ett eventuellt avtal med ett
        larmbolag ingås alltid direkt mellan dig och larmbolaget, och Mobilpoolen är inte part i
        avtalet.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">5. Ångerrätt för privatpersoner</h2>
      <p>
        Tecknar du som konsument ett avtal med ett larmbolag på distans eller utanför larmbolagets
        affärslokaler har du normalt 14 dagars ångerrätt enligt lagen om distansavtal och avtal
        utanför affärslokaler. Läs mer i vår{" "}
        <Link to="/guider/dorrforsaljning-och-angerratt" className="text-primary hover:underline">
          guide om dörrförsäljning och ångerrätt
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">
        6. Företag, bostadsrättsföreningar och föreningar
      </h2>
      <p>
        Den som anmäler en organisation till väntelistan intygar att hen har rätt att lämna
        uppgifterna för organisationens räkning. Organisationer räknas inte som konsumenter, och
        konsumentskyddsregler som ångerrätt gäller därför normalt inte avtal som organisationen
        ingår med larmbolaget.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">7. Personuppgifter</h2>
      <p>
        Vi behandlar personuppgifter enligt vår{" "}
        <Link to="/integritetspolicy" className="text-primary hover:underline">
          integritetspolicy
        </Link>{" "}
        och gällande dataskyddslagstiftning (GDPR).
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">8. Åldersgräns</h2>
      <p>Privatpersoner som skickar en förfrågan ska vara minst 18 år.</p>

      <h2 className="text-xl font-semibold mt-10 mb-3">9. Ansvarsbegränsning</h2>
      <p>
        Vi tillhandahåller tjänsten i befintligt skick. Vi ansvarar inte för larmbolagens offerter,
        produkter, installation eller fullgörande av avtal, och inte för indirekta skador. Ingenting
        i villkoren begränsar dina rättigheter som konsument enligt tvingande lag.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">10. Immateriella rättigheter</h2>
      <p>
        Innehåll, varumärke och material på Mobilpoolen tillhör PMG Poolen Media Group AB eller våra
        samarbetspartner och får inte användas utan tillstånd.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">11. Ändringar och tvist</h2>
      <p>
        Vi kan uppdatera villkoren, och den senaste versionen publiceras alltid här. Svensk lag
        gäller. Tvist prövas av allmän domstol. Som konsument kan du även vända dig till Allmänna
        reklamationsnämnden (ARN).
      </p>

      <p className="mt-8">Kontakt: info@mobilpoolen.se</p>
    </LegalPage>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/integritetspolicy")({
  head: () =>
    pageHead({
      title: "Integritetspolicy | Mobilpoolen",
      description:
        "Så samlar Mobilpoolen in, använder och skyddar dina personuppgifter. Skrivet på vanlig svenska.",
      canonical: "https://mobilpoolen.se/integritetspolicy",
    }),
  component: IntegritetspolicyPage,
});

function IntegritetspolicyPage() {
  return (
    <LegalPage>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Integritetspolicy</h1>
      <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: 25 oktober 2026</p>

      <p>
        Här förklarar vi på vanlig svenska vilka uppgifter vi samlar in, varför vi behöver dem, vem
        som får dem och vilka rättigheter du har. Policyn beskriver det sajten gör i dag.
        Mobilpoolen har ännu inte öppnat för offerter, så inga uppgifter lämnas till larmbolag. När
        det ändras uppdaterar vi policyn innan den nya behandlingen börjar.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">1. Vem ansvarar för dina uppgifter?</h2>
      <p>
        Personuppgiftsansvarig är PMG Poolen Media Group AB, org.nr 559602-5287, Valfrid Palmgrens
        gata 12, 113 69 Stockholm. Du når oss på info@mobilpoolen.se.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">
        2. Vilka uppgifter samlar vi in, och när?
      </h2>
      <p className="font-semibold">När du ställer dig på väntelistan:</p>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>Din e-postadress.</li>
        <li>
          Om du anger det, bostadstyp och postnummer. Anmäler du dig från sidorna för företag, BRF
          eller föreningar sparar vi vilken typ av organisation det gäller.
        </li>
        <li>Vilken sida du anmälde dig från.</li>
        <li>Att du har samtyckt, den exakta samtyckestexten som visades och när du anmälde dig.</li>
      </ul>
      <p className="mt-6 font-semibold">När du kontaktar oss:</p>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>Namn, e-postadress, ämne och innehållet i ditt meddelande.</li>
      </ul>
      <p id="ai-chatt" className="mt-6 scroll-mt-28 font-semibold">
        När du använder AI-chatten:
      </p>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>
          Dina frågor och chattens svar, vilken sida du stod på och ett slumpat id för samtalet, så
          att frågorna i samma samtal hänger ihop.
        </li>
      </ul>
      <p className="mt-4">
        Chatten är en AI-assistent, inte en människa. Samtalet skickas till oss och vidare till
        Anthropic, som skriver svaren för vår räkning. Svaren kan bli fel, så kontrollera det som är
        viktigt för dig. Skriv inga personuppgifter i chatten. Innan frågor och svar sparas försöker
        vi automatiskt ta bort e-postadresser, telefonnummer, personnummer och andra långa nummer.
        De sparas i 90 dagar. Vi sparar ingen IP-adress, och ingenting sparas i din webbläsare:
        samtalet försvinner när du stänger sidan. IP-adressen används bara tillfälligt, i minnet,
        för att begränsa hur många frågor som kan skickas på kort tid. Anthropic använder inte
        uppgifterna för att träna sina AI-modeller, men kan spara dem en kortare tid för drift och
        säkerhet. Ställer du dig på väntelistan i chatten gäller samma sak som för väntelistan ovan,
        och chatten ser aldrig din e-postadress.
      </p>
      <p className="mt-6 font-semibold">När du besöker en sida:</p>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>
          Vi räknar hur många som besöker varje sida och varifrån de kommer, till exempel en
          sökmotor, en AI-tjänst eller en länk (bara domännamnet), och om besöket kom från mobil
          eller dator. Vi räknar också hur ofta sökmotorers och AI-tjänsters robotar hämtar våra
          sidor.
        </li>
      </ul>
      <p className="mt-4">
        Det räknas på vår server när sidan skickas till dig och sparas bara som antal per dag.
        Ingenting sparas i din webbläsare och inget skript för statistik körs där. Vi sparar inte
        din IP-adress eller något annat som kan kopplas till dig. Vi använder inga verktyg för
        marknadsföring.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">
        3. Varför behandlar vi uppgifterna, och med vilken rätt?
      </h2>
      <p>Varje ändamål har en egen rättslig grund enligt dataskyddsförordningen (GDPR):</p>
      <ul className="mt-3 list-disc pl-6 space-y-3">
        <li>
          <strong>Mejla dig när Mobilpoolen öppnar för offerter.</strong> Grund: ditt samtycke. Vi
          använder inte adressen till något annat, och vi lämnar den inte till larmbolag.
        </li>
        <li>
          <strong>Dokumentera samtycket</strong>, så att vi kan visa vad du godkände och när. Grund:
          rättslig förpliktelse, eftersom vi enligt GDPR ska kunna visa att samtycke har lämnats.
        </li>
        <li>
          <strong>Förhindra missbruk av formulären</strong>, till exempel genom att begränsa hur
          många anmälningar eller meddelanden som kan skickas på kort tid. Grund: berättigat
          intresse av att skydda tjänsten.
        </li>
        <li>
          <strong>Besvara meddelanden</strong> som du skickar via kontaktformuläret eller e-post.
          Grund: berättigat intresse av att kunna svara dig.
        </li>
        <li>
          <strong>Svara på frågor i AI-chatten</strong> och förbättra svaren och sajten. Grund:
          berättigat intresse av att kunna svara dig och förbättra tjänsten.
        </li>
        <li>
          <strong>Räkna besök</strong>, så att vi ser vilka sidor som används och hur besökare
          hittar till oss. Grund: berättigat intresse av att förbättra sajten.
        </li>
      </ul>
      <p className="mt-4">
        När vi stöder oss på berättigat intresse har vi vägt vårt intresse mot ditt. Du har alltid
        rätt att invända, se punkt 7.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">4. Vem delar vi uppgifter med?</h2>
      <p>
        Vi säljer inga uppgifter och lämnar inga uppgifter till larmbolag. Vi använder leverantörer
        som behandlar uppgifter för vår räkning, som personuppgiftsbiträden enligt avtal och våra
        instruktioner:
      </p>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>
          Supabase: databas där väntelistan och besöksstatistiken lagras, och funktionen som tar
          emot kontaktformuläret. Datacentret ligger i Stockholm (EU).
        </li>
        <li>
          Resend: utskick av e-post. Meddelanden från kontaktformuläret skickas via Resend till vår
          inkorg. Utskicken går via ett konto som PMG Poolen Media Group AB också använder för
          Elpoolen.
        </li>
        <li>Cloudflare: drift av webbplatsen.</li>
        <li>Anthropic: skriver svaren i AI-chatten.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-10 mb-3">5. Överföring utanför EU och EES</h2>
      <p>
        Vi strävar efter att uppgifterna behandlas inom EU och EES. Resend, Cloudflare och Anthropic
        kan behandla uppgifter utanför EU och EES. En sådan överföring sker bara med stöd av ett
        skydd som dataskyddsförordningen godtar, till exempel EU:s beslut om dataskyddsramverket
        mellan EU och USA eller EU-kommissionens standardavtalsklausuler. Vill du veta vilket skydd
        som gäller kan du mejla oss.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">6. Hur länge sparar vi uppgifterna?</h2>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>
          <strong>Väntelistan:</strong> tills vi har mejlat dig att vi har öppnat, dock högst 12
          månader från anmälan. Återkallar du samtycket raderar vi adressen direkt.
        </li>
        <li>
          <strong>Meddelanden via kontaktformuläret:</strong> högst 12 månader efter att ärendet är
          avslutat.
        </li>
        <li>
          <strong>Frågor och svar i AI-chatten:</strong> 90 dagar. E-postadresser, telefonnummer och
          personnummer tas automatiskt bort så långt det går.
        </li>
        <li>
          <strong>Besöksstatistiken:</strong> sparas bara som antal per dag, utan uppgifter som kan
          kopplas till dig.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-10 mb-3">7. Dina rättigheter</h2>
      <p>Du har rätt att:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Få veta vilka uppgifter vi har om dig (registerutdrag)</li>
        <li>Få felaktiga uppgifter rättade</li>
        <li>Få dina uppgifter raderade</li>
        <li>Begära att behandlingen begränsas</li>
        <li>Återkalla ditt samtycke</li>
        <li>Invända mot behandling som bygger på berättigat intresse</li>
        <li>Få ut dina uppgifter i maskinläsbart format (dataportabilitet)</li>
      </ul>
      <p className="mt-4">
        Mejla info@mobilpoolen.se för att använda dina rättigheter, till exempel för att lämna
        väntelistan. Vi svarar normalt inom en månad. Du har alltid rätt att klaga hos
        Integritetsskyddsmyndigheten (IMY),{" "}
        <a
          href="https://www.imy.se"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          www.imy.se
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">8. Säkerhet</h2>
      <p>
        Vi begränsar åtkomsten till personuppgifter och använder tekniska och organisatoriska skydd
        för att minska risken för obehörig åtkomst, förlust eller ändring. Väntelistan kan inte
        läsas via sajten, bara av oss.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">9. Cookies</h2>
      <p>
        Vi använder bara den lagring i webbläsaren som krävs för att sajten ska fungera. Mer
        information finns i vår{" "}
        <Link to="/cookiepolicy" className="text-primary hover:underline">
          cookiepolicy
        </Link>
        .
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">10. Ändringar i policyn</h2>
      <p>
        Ändrar vi policyn på ett sätt som påverkar dig, till exempel när vi öppnar för offerter,
        meddelar vi dig via den e-postadress du har lämnat innan ändringen börjar gälla.
      </p>

      <p className="mt-10 text-sm text-muted-foreground">Kontakt: info@mobilpoolen.se</p>
    </LegalPage>
  );
}

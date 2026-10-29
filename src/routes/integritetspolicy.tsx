import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/integritetspolicy")({
  head: () =>
    pageHead({
      title: "Integritetspolicy | Mobilpoolen",
      description:
        "Mobilpoolen har ingen inloggning, inga formulär och inga spårande kakor. Här står vilka uppgifter som ändå behandlas, varför och vilka rättigheter du har.",
      canonical: "https://mobilpoolen.se/integritetspolicy",
    }),
  component: IntegritetspolicyPage,
});

const H2 = "text-xl font-semibold mt-10 mb-3";

function IntegritetspolicyPage() {
  return (
    <LegalPage>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Integritetspolicy</h1>
      <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: 29 oktober 2026</p>

      <p>
        Här förklarar vi på vanlig svenska vilka uppgifter som behandlas när du använder
        Mobilpoolen, varför och vilka rättigheter du har. Kort sagt: du kan använda hela sajten utan
        att lämna några uppgifter om dig själv. Vi har ingen inloggning och inga formulär, och vi
        använder inga kakor för statistik eller marknadsföring. Policyn beskriver det sajten gör i
        dag. Ändras det uppdaterar vi policyn innan den nya behandlingen börjar.
      </p>

      <h2 className={H2}>1. Vem ansvarar för dina uppgifter?</h2>
      <p>
        Personuppgiftsansvarig är PMG Poolen Media Group AB, org.nr 559602-5287, Valfrid Palmgrens
        gata 12, 113 69 Stockholm. Du når oss på{" "}
        <a href="mailto:info@mobilpoolen.se" className="text-primary hover:underline">
          info@mobilpoolen.se
        </a>
        .
      </p>

      <h2 className={H2}>2. Vilka uppgifter behandlas, och när?</h2>
      <p className="font-semibold">När du besöker en sida:</p>
      <p className="mt-3">
        Vi räknar hur många som besöker varje sida, varifrån de kommer (till exempel en sökmotor, en
        AI-tjänst eller en länk, och då bara domännamnet) och om besöket kom från mobil eller dator.
        Vi räknar också hur ofta sökmotorers och AI-tjänsters robotar hämtar våra sidor.
      </p>
      <p className="mt-3">
        Räkningen görs på vår server när sidan skickas till dig, och det enda som sparas är antal
        per dag. Vi sparar inte din IP-adress, din webbläsares identifiering eller något annat som
        kan kopplas till dig. Inget skript för statistik körs i din webbläsare och ingenting sparas
        där. Vår driftleverantör behöver tekniskt din IP-adress för att kunna skicka sidan till dig,
        men vi sparar den inte.
      </p>

      <p className="mt-6 font-semibold">När du använder kalkylatorerna och jämförelsen:</p>
      <p className="mt-3">
        Kalkylatorerna och filtren i jämförelsen räknar i din webbläsare. Det du fyller i, till
        exempel hur mycket surf du använder eller vad du betalar i dag, skickas inte till oss och
        sparas inte.
      </p>

      <p className="mt-6 font-semibold">När du klickar vidare till en operatör:</p>
      <p className="mt-3">
        Knapparna i jämförelsen leder till operatörens egen webbplats. Vi skickar inga uppgifter om
        dig till operatören. När du är på operatörens sida gäller operatörens integritetspolicy och
        villkor, och det är operatören som ansvarar för det du lämnar där, till exempel när du
        beställer.
      </p>

      <p className="mt-6 font-semibold">När du mejlar oss:</p>
      <p className="mt-3">
        Vi får din e-postadress, ditt namn om det står i mejlet och det du skriver. Skriv inga
        känsliga uppgifter, som personnummer.
      </p>

      <p id="ai-chatt" className="mt-6 scroll-mt-28 font-semibold">
        AI-chatt:
      </p>
      <p className="mt-3">
        Mobilpoolen har ingen AI-chatt i bruk. Om vi inför en chatt uppdaterar vi den här policyn
        innan den används, med vad som sparas, hur länge och vilka leverantörer som behandlar
        uppgifterna.
      </p>

      <h2 className={H2}>3. Varför behandlar vi uppgifterna, och med vilken rätt?</h2>
      <p>Varje ändamål har en rättslig grund enligt dataskyddsförordningen (GDPR):</p>
      <ul className="mt-3 list-disc pl-6 space-y-3">
        <li>
          <strong>Besvara mejl</strong> som du skickar till oss. Grund: berättigat intresse av att
          kunna svara dig och rätta fel som du rapporterar.
        </li>
        <li>
          <strong>Räkna besök</strong>, så att vi ser vilka sidor som används och hur besökare
          hittar till oss. Räkningen sparar inga personuppgifter. Den tekniska hanteringen när sidan
          skickas stöder sig på berättigat intresse av att kunna driva och förbättra sajten.
        </li>
      </ul>
      <p className="mt-4">
        När vi stöder oss på berättigat intresse har vi vägt vårt intresse mot ditt. Du har alltid
        rätt att invända, se punkt 7.
      </p>

      <h2 className={H2}>4. Vem delar vi uppgifter med?</h2>
      <p>
        Vi säljer inga uppgifter och lämnar inga uppgifter till operatörer. Vi använder leverantörer
        som behandlar uppgifter för vår räkning:
      </p>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>Cloudflare: drift av webbplatsen.</li>
        <li>Supabase: databas där besöksräkningen lagras som antal per dag.</li>
        <li>Vår e-postleverantör: tar emot och lagrar mejl som du skickar till oss.</li>
      </ul>

      <h2 className={H2}>5. Överföring utanför EU och EES</h2>
      <p>
        Vi strävar efter att uppgifterna behandlas inom EU och EES. Om en leverantör behandlar
        personuppgifter utanför EU och EES sker det bara med stöd av ett skydd som
        dataskyddsförordningen godtar, till exempel EU:s beslut om dataskyddsramverket mellan EU och
        USA eller EU-kommissionens standardavtalsklausuler. Vill du veta vilket skydd som gäller kan
        du mejla oss.
      </p>

      <h2 className={H2}>6. Hur länge sparar vi uppgifterna?</h2>
      <ul className="mt-3 list-disc pl-6 space-y-2">
        <li>
          <strong>Mejl till oss:</strong> så länge det behövs för att hantera ärendet, och högst 12
          månader efter att det är avslutat.
        </li>
        <li>
          <strong>Besöksräkningen:</strong> sparas bara som antal per dag, utan uppgifter som kan
          kopplas till dig.
        </li>
      </ul>

      <h2 className={H2}>7. Dina rättigheter</h2>
      <p>Du har rätt att:</p>
      <ul className="list-disc pl-6 space-y-1">
        <li>Få veta vilka uppgifter vi har om dig (registerutdrag)</li>
        <li>Få felaktiga uppgifter rättade</li>
        <li>Få dina uppgifter raderade</li>
        <li>Begära att behandlingen begränsas</li>
        <li>Invända mot behandling som bygger på berättigat intresse</li>
        <li>Få ut dina uppgifter i maskinläsbart format (dataportabilitet)</li>
      </ul>
      <p className="mt-4">
        Mejla info@mobilpoolen.se för att använda dina rättigheter. Vi svarar normalt inom en månad.
        Du har alltid rätt att klaga hos tillsynsmyndigheten Integritetsskyddsmyndigheten (IMY),{" "}
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

      <h2 className={H2}>8. Säkerhet</h2>
      <p>
        Vi begränsar åtkomsten till personuppgifter och använder tekniska och organisatoriska skydd
        för att minska risken för obehörig åtkomst, förlust eller ändring. Besöksräkningen kan inte
        läsas via sajten, bara av oss.
      </p>

      <h2 className={H2}>9. Kakor och lagring i webbläsaren</h2>
      <p>
        Vi använder bara den lagring i webbläsaren som behövs för att sajten ska fungera, och därför
        visar vi ingen cookieruta. Mer finns i vår{" "}
        <Link to="/cookiepolicy" className="text-primary hover:underline">
          cookiepolicy
        </Link>
        .
      </p>

      <h2 className={H2}>10. Ändringar i policyn</h2>
      <p>
        Ändrar vi hur vi behandlar personuppgifter, till exempel om vi inför ett formulär, en chatt
        eller ett nytt mätverktyg, uppdaterar vi policyn här innan ändringen börjar gälla och
        skriver ut datumet överst.
      </p>

      <p className="mt-10 text-sm text-muted-foreground">Kontakt: info@mobilpoolen.se</p>
    </LegalPage>
  );
}

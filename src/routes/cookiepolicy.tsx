import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/cookiepolicy")({
  head: () =>
    pageHead({
      title: "Cookiepolicy | Mobilpoolen",
      description:
        "Mobilpoolen sätter inga kakor för statistik eller marknadsföring och visar därför ingen cookieruta. Här står den enda lagring sajten använder.",
      canonical: "https://mobilpoolen.se/cookiepolicy",
    }),
  component: CookiepolicyPage,
});

function CookiepolicyPage() {
  return (
    <LegalPage>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Cookiepolicy</h1>
      <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: 29 oktober 2026</p>

      <p>
        Mobilpoolen drivs av PMG Poolen Media Group AB, org.nr 559602-5287. Kontakt:
        info@mobilpoolen.se.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Vad är kakor?</h2>
      <p>
        Kakor (cookies) är små textfiler som sparas i din webbläsare. Liknande tekniker, som lokal
        lagring och sessionslagring, omfattas också av den här policyn.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">2. Vad använder Mobilpoolen?</h2>
      <h3 className="text-lg font-semibold mt-6 mb-2">Kakor</h3>
      <p>Mobilpoolen sätter inga kakor.</p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Sessionslagring (sessionStorage)</h3>
      <ul className="list-disc pl-6 space-y-1 mt-2">
        <li>
          <strong>lp-scroll:</strong> följt av sidans adress: hur långt ned du hade scrollat, så att
          du hamnar på samma ställe när du går tillbaka till en sida. Det är nödvändigt för att
          sajten ska fungera som du väntar dig och kräver inget samtycke.
        </li>
      </ul>
      <p className="mt-4">
        Uppgifterna i sessionStorage raderas automatiskt när du stänger webbläsarfliken. De skickas
        aldrig till oss.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Kalkylatorerna och jämförelsen</h3>
      <p>
        Kalkylatorerna och filtren räknar i din webbläsare och sparar inget, varken i kakor eller i
        annan lagring.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Statistik och marknadsföring</h3>
      <p>
        Vi använder inga kakor, skript eller annan lagring i webbläsaren för statistik eller
        marknadsföring. Besök räknas på vår server när sidan skickas till dig, som antal per dag och
        utan IP-adress. Läs mer i vår{" "}
        <Link to="/integritetspolicy" className="underline">
          integritetspolicy
        </Link>
        .
      </p>
      <p className="mt-4">
        Därför visar vi ingen cookieruta: lagring som krävs för att sajten ska fungera behöver inget
        samtycke. Om vi inför något som sparar eller läser information i din webbläsare för
        statistik eller marknadsföring frågar vi först om ditt samtycke.
      </p>

      <h3 className="text-lg font-semibold mt-6 mb-2">Operatörernas webbplatser</h3>
      <p>
        När du klickar vidare till en operatör lämnar du Mobilpoolen. Operatörens webbplats kan
        använda egna kakor, och då gäller operatörens cookiepolicy.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">3. Hantera lagring</h2>
      <p>
        Du kan när som helst rensa kakor och lagring i din webbläsares inställningar. Sajten
        fungerar även utan.
      </p>

      <p className="mt-6">Frågor? Kontakta oss på info@mobilpoolen.se.</p>
    </LegalPage>
  );
}

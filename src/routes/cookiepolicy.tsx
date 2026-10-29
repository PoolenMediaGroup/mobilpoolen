import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/cookiepolicy")({
  head: () =>
    pageHead({
      title: "Cookiepolicy | Mobilpoolen",
      description:
        "Mobilpoolen sätter inga cookies och använder ingen lagring i webbläsaren för statistik eller marknadsföring. Bara det som krävs för att sajten ska fungera.",
      canonical: "https://mobilpoolen.se/cookiepolicy",
    }),
  component: CookiepolicyPage,
});

function CookiepolicyPage() {
  return (
    <LegalPage>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Cookiepolicy</h1>
      <p className="text-sm text-muted-foreground mb-8">Senast uppdaterad: 24 oktober 2026</p>

      <p>
        Mobilpoolen drivs av PMG Poolen Media Group AB, org.nr 559602-5287. Kontakt:
        info@mobilpoolen.se.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-3">1. Vad är cookies?</h2>
      <p>
        Cookies är små textfiler som sparas i din webbläsare. Liknande tekniker, som lokal lagring
        och sessionslagring, omfattas också av denna policy.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">2. Vad använder Mobilpoolen?</h2>
      <h3 className="text-lg font-semibold mt-6 mb-2">Nödvändiga (kräver inget samtycke)</h3>
      <ul className="list-disc pl-6 space-y-1 mt-2">
        <li>
          <strong>Cookies:</strong> Mobilpoolen sätter inga cookies.
        </li>
        <li>
          <strong>Supabase</strong>: vår databas, som tar emot uppgifter du skickar via formulär.
          Sätter inga cookies.
        </li>
      </ul>
      <h3 className="text-lg font-semibold mt-6 mb-2">Sessionslagring (sessionStorage)</h3>
      <ul className="list-disc pl-6 space-y-1 mt-2">
        <li>
          <strong>lp-scroll:</strong> följt av sidans adress: hur långt ned du hade scrollat, så att
          du hamnar på samma ställe när du går tillbaka till en sida.
        </li>
      </ul>
      <p className="mt-4">
        Uppgifterna i sessionStorage raderas automatiskt när du stänger webbläsarfliken.
      </p>
      <h3 className="text-lg font-semibold mt-6 mb-2">Lokal lagring (localStorage)</h3>
      <ul className="list-disc pl-6 space-y-1 mt-2">
        <li>
          <strong>mobilpoolen:skyddschecklista:v1:</strong> vilka punkter du har bockat av i
          skyddschecklistan i guiden om att förebygga inbrott. Sparas bara när du själv bockar av
          något, och skickas aldrig till oss. Du tar bort det med knappen under checklistan eller
          genom att rensa webbläsarens lagring.
        </li>
      </ul>
      <p className="mt-4">
        Vi använder inga cookies eller annan lagring för statistik eller marknadsföring. Besök
        räknas på vår server när sidan skickas till dig, utan att något sparas i eller läses från
        din webbläsare. Läs mer i vår{" "}
        <a href="/integritetspolicy" className="underline">
          integritetspolicy
        </a>
        . Därför visar vi ingen cookieruta: lagring som krävs för att sajten ska fungera behöver
        inget samtycke. Om vi inför något som sparar eller läser information i din webbläsare för
        statistik eller marknadsföring frågar vi först om ditt samtycke.
      </p>

      <h2 className="text-xl font-semibold mt-10 mb-3">3. Hantera lagring</h2>
      <p>
        Du kan när som helst rensa cookies och lokal lagring i din webbläsares inställningar.
        Sajtens grundfunktioner fungerar även utan.
      </p>

      <p className="mt-6">Frågor? Kontakta oss på info@mobilpoolen.se.</p>
    </LegalPage>
  );
}

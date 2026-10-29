import { createFileRoute, Link } from "@tanstack/react-router";
import { TrustPage } from "@/components/trust-page";
import { breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const HEAD_TITLE = "Så tjänar Mobilpoolen pengar: vem betalar?";
const DESC =
  "Mobilpoolen är gratis för dig. När vi öppnar för offerter kommer larmbolagen att betala oss. Här står vem som betalar, vad det påverkar och inte påverkar.";
const UPPDATERAD = "2 oktober 2026";
const UPPDATERAD_ISO = "2026-10-02";

/**
 * Korta faktameningar som går att citera var för sig. Håll dem i linje med
 * FAQ-svaret "Hur tjänar ni pengar då?", användarvillkoren punkt 2 och
 * /sa-jamfor-vi.
 */
const FAKTA: { fraga: string; svar: string }[] = [
  {
    fraga: "Vem betalar Mobilpoolen?",
    svar: "I dag ingen. När vi öppnar för offerter betalar larmbolagen. Du betalar aldrig.",
  },
  {
    fraga: "Vad kostar tjänsten för dig?",
    svar: "Ingenting, varken att jämföra priser eller att begära offerter när vi öppnar.",
  },
  {
    fraga: "Hur många bolag kommer att få din förfrågan?",
    svar: "Två till tre larmbolag. Aldrig fler. I dag skickas ingen förfrågan vidare.",
  },
  {
    fraga: "Påverkar ersättningen ditt pris?",
    svar: "Nej. Priset du får av larmbolaget påverkas inte av att du kom via oss.",
  },
  {
    fraga: "Påverkar ersättningen prisjämförelsen?",
    svar: "Nej. Alla bolag vi bevakar visas, och ordningen styrs av pris, inte av avtal.",
  },
  {
    fraga: "Är Mobilpoolen oberoende?",
    svar: "Nej. Vi kommer att få betalt av larmbolag och kallar oss därför inte oberoende.",
  },
];

export const Route = createFileRoute("/sa-tjanar-vi-pengar")({
  head: () =>
    pageHead({
      title: `${HEAD_TITLE} | Mobilpoolen`,
      description: DESC,
      socialTitle: HEAD_TITLE,
      canonical: "https://mobilpoolen.se/sa-tjanar-vi-pengar",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Så tjänar vi pengar", path: "/sa-tjanar-vi-pengar" },
        ]),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: HEAD_TITLE,
          description: DESC,
          url: "https://mobilpoolen.se/sa-tjanar-vi-pengar",
          inLanguage: "sv-SE",
          dateModified: UPPDATERAD_ISO,
          author: { "@id": "https://mobilpoolen.se/om-oss#leon" },
          publisher: { "@id": "https://mobilpoolen.se/#organization" },
          isPartOf: { "@id": "https://mobilpoolen.se/#website" },
        }),
      ],
    }),
  component: SaTjanarViPengarPage,
});

function SaTjanarViPengarPage() {
  return (
    <TrustPage
      title="Så tjänar Mobilpoolen pengar"
      intro="Mobilpoolen är gratis för dig. När vi öppnar för offerter kommer vi att få ersättning av de larmbolag vi skickar förfrågningar till. Det gör oss till en part med ett eget intresse, och därför står här hur det kommer att fungera."
      updated={UPPDATERAD}
    >
      <div className="max-w-[680px] space-y-12 text-[17px] leading-relaxed">
        <section className="rounded-xl border border-border bg-surface p-5 text-[16px]">
          <h2 className="font-bold">Läget i dag</h2>
          <p className="mt-3 text-foreground/90">
            <strong>Det här fungerar redan:</strong> prisjämförelsen, guiderna och väntelistan.
            Inget av det kostar något, och vi tjänar inga pengar på det.
          </p>
          <p className="mt-3 text-foreground/90">
            <strong>Det här fungerar inte än:</strong> offerter. Vi har ännu inga avtal med
            larmbolag och får ingen ersättning från något bolag. Det som står nedan beskriver hur
            det kommer att fungera när vi öppnar.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Kort svar</h2>
          <dl className="mt-5 divide-y divide-border rounded-xl border border-border">
            {FAKTA.map((rad) => (
              <div
                key={rad.fraga}
                className="grid gap-1 px-5 py-4 sm:grid-cols-[240px_1fr] sm:gap-6"
              >
                <dt className="font-semibold text-foreground">{rad.fraga}</dt>
                <dd className="text-foreground/90">{rad.svar}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[14px] text-foreground/65">Gäller från {UPPDATERAD}.</p>
        </section>

        <section>
          <h2 className="font-bold">Larmbolagen kommer att betala oss</h2>
          <p className="mt-4 text-foreground/90">
            Mobilpoolen drivs av PMG Poolen Media Group AB. När vi öppnar kommer bolaget att få
            ersättning av de larmbolag som tar emot förfrågningar via Mobilpoolen. Vi tar aldrig
            betalt av dig, och vi säljer inga larm själva.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Hur ersättningen räknas</h2>
          <p className="mt-4 text-foreground/90">
            Ersättningen kommer att betalas enligt avtal mellan oss och varje larmbolag. Hur den
            räknas skriver vi här när avtalen är klara.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Det här påverkar ersättningen inte</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-foreground/90">
            <li>
              <strong>Ditt pris.</strong> Priset och villkoren i offerten bestämmer larmbolaget. Det
              som gäller är alltid det bolaget bekräftar i sin offert eller sitt avtal.
            </li>
            <li>
              <strong>Vilka bolag som står i prisjämförelsen.</strong> Jämförelsen visar alla bolag
              vi bevakar, även bolag vi inte har avtal med och alltså inte tjänar något på.
            </li>
            <li>
              <strong>Ordningen i tabellen.</strong> Bolag som publicerar hela priset visas först,
              sorterade efter lägst kostnad första året. Du kan också sortera på månadsavgift eller
              startkostnad. Bolag som inte publicerar hela priset står i en egen lista.
            </li>
            <li>
              <strong>Vad vi skriver om bolagen.</strong> Priser och villkor hämtas från
              larmbolagens egna webbplatser, med källa och datum.{" "}
              <Link to="/sa-jamfor-vi" className="text-primary underline underline-offset-2">
                Så jämför vi
              </Link>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold">Det här påverkar ersättningen</h2>
          <p className="mt-4 text-foreground/90">
            Din förfrågan kommer bara att gå till larmbolag vi har avtal med. Det betyder att ett
            bolag kan stå i prisjämförelsen utan att kunna få din förfrågan. Vi kommer också att ha
            ett eget intresse av att du begär offert, eftersom det är så tjänsten ska finansieras.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Två till tre bolag, aldrig fler</h2>
          <p className="mt-4 text-foreground/90">
            När vi öppnar kommer en förfrågan att gå till två till tre larmbolag. Det är de bolagen
            som kontaktar dig med offerter. Du väljer själv om du vill gå vidare, och du binder dig
            inte till något genom att skicka förfrågan.{" "}
            <Link
              to="/sa-fungerar-mobilpoolen"
              className="text-primary underline underline-offset-2"
            >
              Så fungerar Mobilpoolen steg för steg
            </Link>
            .
          </p>
        </section>

        <section className="card-soft p-6 sm:p-8">
          <h2 className="font-bold">Därför kallar vi oss inte oberoende</h2>
          <p className="mt-4 text-foreground/90">
            En tjänst som får betalt av de bolag den förmedlar kunder till är inte oberoende, och
            det ska du veta när du läser våra sidor. När offerterna öppnar kommer ersättningen att
            stå vid varje knapp där du begär offert, i{" "}
            <Link to="/anvandarvillkor" className="text-primary underline underline-offset-2">
              användarvillkoren
            </Link>{" "}
            och här. Väg in det när du jämför, och läs alltid offerten och avtalet själv innan du
            skriver under. Vem som står bakom Mobilpoolen står på{" "}
            <Link to="/om-oss" className="text-primary underline underline-offset-2">
              om oss
            </Link>
            . Har du frågor om ersättningen,{" "}
            <Link to="/kontakt" className="text-primary underline underline-offset-2">
              kontakta oss
            </Link>
            .
          </p>
        </section>

        <div>
          <div className="flex flex-wrap gap-4">
            <Link to="/" hash="priser" className="btn-cta">
              Jämför priserna
            </Link>
            <Link to="/sa-jamfor-vi" className="btn-secondary-outline">
              Läs vår jämförelsemetod
            </Link>
          </div>
        </div>
      </div>
    </TrustPage>
  );
}

/**
 * Cookierutan. Samma fil på Larmpoolen, Mobilpoolen och Solcellspoolen, och samma
 * utseende som Elpoolens: stor ruta mitt på skärmen, logga, tre flikar (Samtycke,
 * Information, Om) och knapparna längst ned. Texten byggs ur de påslagna tjänsterna
 * i lib/samtycke.ts, så att den alltid säger vilka som faktiskt får uppgifterna.
 * Utan påslagna tjänster renderas ingenting.
 *
 * Ren HTML utan React-state: allt styrs av skriptet i <head> (lib/samtycke.ts) via
 * data-samtycke-knapp och attribut på <html>, så att knapparna fungerar redan innan
 * sidan har hydrerats. Visas, döljs och byter flik med CSS i styles.css (.samtycke).
 *
 * Juridiken (LEK 9 kap. 28 §, GDPR art. 4.11 och 7, EDPB:s cookie banner taskforce
 * 2023, IMY:s beslut mot ATG och Aller Media 2025):
 *  - Neka finns i första vyn, som en lika stor knapp som Godkänn alla. Leons val
 *    7 nov 2026: Neka vit med ram (som Anpassa), Godkänn alla fylld. Gör aldrig Neka
 *    mindre, blekare eller till en länk, och ta aldrig bort den ur första vyn.
 *  - Inga förifyllda rutor. Inget sätts innan besökaren har sagt ja.
 *  - Texten säger vilka som får uppgifterna, varför, och hur man återkallar.
 */
import { BrandLogo } from "@/components/brand-logo";
import {
  AKTIVA_TJANSTER,
  SAMTYCKE_AKTIV,
  SAMTYCKE_GILTIG_DAGAR,
  SAMTYCKE_SAJT,
  mottagareText,
} from "@/lib/samtycke";

const KNAPP =
  "inline-flex min-h-12 flex-1 items-center justify-center rounded-lg px-5 text-[15px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:text-[16px]";
// Godkänn alla: fylld.
const KNAPP_VAL = `${KNAPP} bg-primary text-primary-foreground hover:bg-primary/90`;
// Neka, Anpassa och Spara val: vit med tjock ram, samma storlek som Godkänn alla.
const KNAPP_RAM = `${KNAPP} border-2 border-primary bg-white text-primary hover:bg-primary/5`;

const FLIK =
  "samtycke-flik flex-1 border-b-[3px] border-transparent px-2 py-4 text-center text-[15px] font-semibold text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary sm:text-[17px]";

const LANK = "text-primary underline underline-offset-2";
const MANADER = Math.round(SAMTYCKE_GILTIG_DAGAR / 30.4);

function syftesText(): string {
  const statistik = AKTIVA_TJANSTER.some((t) => t.kategori === "statistik");
  const annonser = AKTIVA_TJANSTER.some((t) => t.kategori === "marknadsforing");
  if (statistik && annonser) return "förstå hur sajten används och mäta våra annonser";
  if (statistik) return "förstå hur sajten används";
  return "mäta våra annonser";
}

const KATEGORI_NAMN = { statistik: "Statistik", marknadsforing: "Marknadsföring" } as const;

export function SamtyckeBanner() {
  if (!SAMTYCKE_AKTIV) return null;
  const mottagare = mottagareText();
  const annonser = AKTIVA_TJANSTER.some((t) => t.kategori === "marknadsforing");
  const verktyg = AKTIVA_TJANSTER.map((t) => t.namn);
  const verktygText =
    verktyg.length > 1 ? `${verktyg.slice(0, -1).join(", ")} och ${verktyg.at(-1)}` : verktyg[0];

  return (
    <div className="samtycke" data-nosnippet="">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="samtycke-rubrik"
        className="samtycke-ruta flex max-h-[92svh] w-full flex-col overflow-hidden rounded-2xl bg-white text-foreground shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center px-5 pb-3 pt-4 sm:px-10 sm:pt-7">
          <BrandLogo width={190} mobileWidth={140} />
        </div>

        <div className="flex border-y border-border" role="tablist">
          <button
            type="button"
            role="tab"
            data-samtycke-knapp="flik"
            data-flik="samtycke"
            className={`${FLIK} samtycke-flik-samtycke`}
          >
            Samtycke
          </button>
          <button
            type="button"
            role="tab"
            data-samtycke-knapp="flik"
            data-flik="installningar"
            className={`${FLIK} samtycke-flik-installningar`}
          >
            Information
          </button>
          <button
            type="button"
            role="tab"
            data-samtycke-knapp="flik"
            data-flik="om"
            className={`${FLIK} samtycke-flik-om`}
          >
            Om
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-10 sm:py-8">
          {/* Ingen h2: rutan finns på varje sida och ska inte synas i sidans struktur. */}
          <div className="samtycke-forsta">
            <p
              id="samtycke-rubrik"
              tabIndex={-1}
              className="text-[17px] font-semibold outline-none sm:text-[19px]"
            >
              Vi använder kakor
            </p>
            <p className="mt-4 max-w-none text-[15px] leading-relaxed sm:text-[17px] sm:leading-[1.75]">
              Vi vill använda kakor för att {syftesText()} hos {mottagare}.
              {annonser ? " De kan kombinera uppgifterna med annat de vet om dig." : ""} Inget sätts
              om du nekar, och du kan ändra dig när som helst under Cookieinställningar längst ned
              på sidan.
            </p>
            <details className="samtycke-mer group mt-3">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-[15px] font-semibold text-primary sm:text-[16px] [&::-webkit-details-marker]:hidden">
                Läs mer
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                >
                  <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" />
                </svg>
              </summary>
              <p className="mt-3 max-w-none text-[15px] leading-relaxed text-muted-foreground sm:text-[16px]">
                Vi använder {verktygText}. Om du godkänner delar vi information om hur du använder
                sajten med {mottagare}
                {annonser
                  ? ", som kan kombinera den med information som du har gett dem eller som de har samlat in när du har använt deras tjänster"
                  : ""}
                . Uppgifterna kan föras över till USA. Säger du nej laddas ingenting från dem och
                sajten fungerar precis likadant. Ditt val gäller i {MANADER} månader. Varje tjänst
                kan väljas för sig under Information. Läs mer i vår{" "}
                <a href="/cookiepolicy" className={LANK}>
                  cookiepolicy
                </a>
                .
              </p>
            </details>
          </div>

          <div className="samtycke-installningar">
            <ul className="divide-y divide-border text-[15px] leading-relaxed sm:text-[16px]">
              <li className="flex items-start justify-between gap-6 pb-5">
                <div>
                  <p className="font-semibold">Nödvändiga</p>
                  <p className="mt-1 text-muted-foreground">
                    Sparar ditt cookieval i webbläsaren (lokal lagring, {SAMTYCKE_SAJT.nyckel},{" "}
                    {MANADER} månader) så att vi inte frågar igen. Kräver inget samtycke och är
                    alltid på.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked
                  disabled
                  readOnly
                  aria-label="Nödvändiga, alltid på"
                  className="samtycke-brytare"
                />
              </li>
              {AKTIVA_TJANSTER.map((t) => (
                <li key={t.id} className="py-5 last:pb-0">
                  <label className="flex cursor-pointer items-start justify-between gap-6">
                    <span>
                      <span className="block font-semibold">
                        {KATEGORI_NAMN[t.kategori]}: {t.namn}
                      </span>
                      <span className="mt-1 block text-muted-foreground">
                        {t.namn} från {t.leverantor}. {t.syfte} Cookies: {t.cookies}.
                        {t.gemensamtAnsvar
                          ? ` ${t.mottagare.split(" ")[0]} och vi är gemensamt ansvariga för insamlingen.`
                          : ""}
                      </span>
                    </span>
                    <input
                      id={`samtycke-${t.id}`}
                      type="checkbox"
                      aria-label={`${KATEGORI_NAMN[t.kategori]}: ${t.namn}`}
                      className="samtycke-brytare"
                    />
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="samtycke-om text-[15px] leading-relaxed sm:text-[17px] sm:leading-[1.75] [&_p]:max-w-none">
            <p>
              Kakor (cookies) är små textfiler som en webbplats sparar i din webbläsare. Liknande
              tekniker, som lokal lagring och pixlar, räknas på samma sätt.
            </p>
            <p className="mt-4">
              Enligt lagen om elektronisk kommunikation får vi bara spara sådant på din enhet utan
              att fråga om det behövs för att sajten ska fungera. För allt annat behöver vi ditt
              samtycke.
            </p>
            <p className="mt-4">
              Ditt val gäller i {MANADER} månader, sedan frågar vi igen. Vi sparar valet, tiden och
              ett slumpat id hos oss, utan IP-adress, så att vi kan visa vad du har valt. Du kan när
              som helst ändra eller återkalla ditt samtycke via Cookieinställningar längst ned på
              varje sida. Att återkalla är lika enkelt som att godkänna.
            </p>
            <p className="mt-4">
              Personuppgiftsansvarig är PMG Poolen Media Group AB, org.nr 559602-5287. Frågor:{" "}
              {SAMTYCKE_SAJT.kontakt}. Mer i vår{" "}
              <a href="/cookiepolicy" className={LANK}>
                cookiepolicy
              </a>{" "}
              och{" "}
              <a href="/integritetspolicy" className={LANK}>
                integritetspolicy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 border-t border-border px-5 py-4 sm:flex-row sm:gap-4 sm:px-10 sm:py-6">
          <button type="button" data-samtycke-knapp="neka" className={KNAPP_RAM}>
            Neka
          </button>
          <button
            type="button"
            data-samtycke-knapp="flik"
            data-flik="installningar"
            className={`${KNAPP_RAM} samtycke-anpassa`}
          >
            Anpassa
          </button>
          <button
            type="button"
            data-samtycke-knapp="spara"
            className={`${KNAPP_RAM} samtycke-spara`}
          >
            Spara val
          </button>
          <button type="button" data-samtycke-knapp="alla" className={KNAPP_VAL}>
            Godkänn alla
          </button>
        </div>
      </section>
    </div>
  );
}

/**
 * Avsnittet i cookiepolicyn om tjänsterna som kräver samtycke. Byggs ur samma lista
 * som rutan, så att policyn alltid stämmer med det som faktiskt används.
 */
export function SamtyckePolicyAvsnitt() {
  if (!SAMTYCKE_AKTIV) {
    return (
      <p className="mt-4">
        Vi använder i dag inga cookies eller liknande tekniker för statistik eller marknadsföring,
        och därför visas ingen cookieruta. Inför vi något som kräver samtycke frågar vi först.
      </p>
    );
  }
  return (
    <>
      <h3 className="text-lg font-semibold mt-6 mb-2">
        Statistik och marknadsföring (bara med ditt samtycke)
      </h3>
      <ul className="list-disc pl-6 space-y-1 mt-2">
        {AKTIVA_TJANSTER.map((t) => (
          <li key={t.id}>
            <strong>{t.namn}</strong> ({t.leverantor}, cookies: {t.cookies}): {t.syfte} Vi skickar
            aldrig namn, e-post, telefonnummer eller personnummer.
            {t.gemensamtAnsvar
              ? ` ${t.mottagare.split(" ")[0]} och vi är gemensamt personuppgiftsansvariga för insamlingen.`
              : ""}{" "}
            Överföring till USA kan ske och sker då med stöd av EU-kommissionens
            standardavtalsklausuler.
          </li>
        ))}
      </ul>
      <p className="mt-2">
        {mottagareText()} kan kombinera uppgifterna med annan information som du har gett dem eller
        som de har samlat in när du har använt deras tjänster, enligt deras egna villkor. Säger du
        nej laddas ingenting från dem och ingenting skickas dit. Sajten fungerar precis likadant
        oavsett vad du väljer.
      </p>
      <p className="mt-4">
        <strong>Ditt cookieval</strong> (lokal lagring: {SAMTYCKE_SAJT.nyckel}) sparar vad du har
        valt, när och ett slumpat id, så att vi inte frågar igen. Vi frågar på nytt efter {MANADER}{" "}
        månader. Vi sparar valet, tiden, sidan och det slumpade id:t hos oss, utan IP-adress, så att
        vi kan visa att samtycket gavs. Det kräver inget samtycke.
      </p>
      <p className="mt-4">
        Du kan när som helst ändra eller återkalla ditt samtycke via{" "}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") window.poolenSamtycke?.visa();
          }}
          className="text-primary hover:underline"
        >
          Cookieinställningar
        </button>{" "}
        längst ned på varje sida.
      </p>
    </>
  );
}

/**
 * Stycket i integritetspolicyn om mätverktygen. Visas bara när någon tjänst är
 * påslagen; annars står sajtens vanliga text om att bara nödvändig lagring används.
 */
export function SamtyckeIntegritetAvsnitt() {
  if (!SAMTYCKE_AKTIV) return null;
  const verktyg = AKTIVA_TJANSTER.map((t) => t.namn);
  const verktygText =
    verktyg.length > 1 ? `${verktyg.slice(0, -1).join(", ")} och ${verktyg.at(-1)}` : verktyg[0];
  const gemensamt = AKTIVA_TJANSTER.filter((t) => t.gemensamtAnsvar).map(
    (t) => t.mottagare.split(" ")[0],
  );
  return (
    <p>
      Utöver den lagring som krävs för att sajten ska fungera använder vi, bara om du har sagt ja i
      cookierutan, {verktygText}. Då får {mottagareText()} uppgift om vilka sidor du besöker och
      händelser som att du skickar en förfrågan eller klickar vidare, tillsammans med din IP-adress,
      din webbläsare och deras cookies. Vi skickar aldrig namn, e-post, telefonnummer eller
      personnummer. Rättslig grund är ditt samtycke (artikel 6.1 a i dataskyddsförordningen), som du
      kan återkalla när som helst via Cookieinställningar längst ned på varje sida.
      {gemensamt.length
        ? ` ${gemensamt.join(" och ")} och vi är gemensamt personuppgiftsansvariga för insamlingen och överföringen.`
        : ""}{" "}
      Överföring till USA kan ske och sker då med stöd av EU-kommissionens standardavtalsklausuler.
      Varje val sparas hos oss med ett slumpat id, tid och sida, utan IP-adress, i högst 25 månader,
      så att vi kan visa att samtycket gavs (rättslig grund: berättigat intresse). Mer finns i vår{" "}
      <a href="/cookiepolicy" className="text-primary hover:underline">
        cookiepolicy
      </a>
      .
    </p>
  );
}

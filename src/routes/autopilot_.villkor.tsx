import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { pageHead } from "@/lib/seo";
import { SAMTYCKE } from "@/lib/autopilot";

export const Route = createFileRoute("/autopilot_/villkor")({
  head: () =>
    pageHead({
      title: "Villkor för Mobilpoolen Autopilot",
      description:
        "Villkoren för Mobilpoolen Autopilot: vad tjänsten gör, vad den inte gör, hur du avslutar och hur vi hanterar dina uppgifter.",
      canonical: "/autopilot/villkor",
    }),
  component: Sida,
});

const H2 = "text-xl font-semibold mt-10 mb-3";
const LANK = "text-primary hover:underline";

function Sida() {
  return (
    <LegalPage>
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        Villkor för Mobilpoolen Autopilot
      </h1>
      <p className="mb-8 text-sm text-muted-foreground">Gäller från 31 oktober 2026</p>

      <h2 className="mb-3 mt-6 text-xl font-semibold">1. Vad Autopilot är</h2>
      <p>
        Mobilpoolen Autopilot är en kostnadsfri bevakning av ditt mobilabonnemang. Du berättar vad
        du har och när bindningstiden eller rabatten tar slut. Vi mejlar dig innan dess med de
        abonnemang i Mobilpoolens jämförelse som passar dig bäst just då. Tjänsten tillhandahålls av
        PMG Poolen Media Group AB, org.nr 559602-5287.
      </p>

      <h2 className={H2}>2. Så startar du</h2>
      <p>
        Du fyller i formuläret på{" "}
        <Link to={"/autopilot" as never} className={LANK}>
          mobilpoolen.se/autopilot
        </Link>{" "}
        och godkänner texten: "{SAMTYCKE}" Bevakningen börjar när du har bekräftat din e-post med
        länken vi skickar.
      </p>

      <h2 className={H2}>3. Det här gör vi</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          Vi mejlar dig cirka 30 dagar och 10 dagar innan din bindningstid eller rabatt tar slut,
          och samma dag. Sedan jämför vi priserna åt dig igen varje halvår.
        </li>
        <li>Saknar du bindningstid och rabatt mejlar vi dig högst två gånger per år.</li>
        <li>
          Förslagen är de abonnemang i vår jämförelse som har minst lika mycket surf som du angett,
          sorterade på snittpris per månad första året. De bygger på operatörernas egna priser vid
          det senaste kontrolldatumet.
        </li>
      </ul>

      <h2 className={H2}>4. Det här gör vi inte</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          Vi byter inte abonnemang åt dig, säger inte upp ditt abonnemang och tecknar inget i ditt
          namn. Det gör du själv, eller den nya operatören när du flyttar ditt nummer.
        </li>
        <li>
          Vi ser inte ditt abonnemang hos operatören. Bevakningen bygger på det du har fyllt i.
          Ändras ditt abonnemang, fyll i formuläret igen med samma e-post.
        </li>
        <li>
          Vi lovar inte att ett visst abonnemang finns eller kostar det vi angav. Det som gäller är
          alltid det operatören visar när du beställer.
        </li>
        <li>Vi säljer inga uppgifter och lämnar dem inte till operatörer.</li>
      </ul>

      <h2 className={H2}>5. Fullmakt</h2>
      <p>
        I dag ger du ingen fullmakt till Mobilpoolen. Har du kryssat i att du är intresserad av att
        vi byter åt dig när det blir möjligt, hör vi av oss och förklarar hur det skulle gå till.
        Ingenting händer förrän du har godkänt en fullmakt med egna villkor.
      </p>

      <h2 className={H2}>6. Kostnad och ersättning</h2>
      <p>
        Autopilot är gratis. Mobilpoolen har i dag inga avtal med operatörer och får ingen
        ersättning när du byter. Får vi ersättning längre fram står det vid förslagen, och den
        påverkar aldrig ordningen. Läs mer om{" "}
        <Link to="/sa-tjanar-vi-pengar" className={LANK}>
          hur vi tjänar pengar
        </Link>
        .
      </p>

      <h2 className={H2}>7. Avsluta</h2>
      <p>
        Du kan avsluta när du vill med länken längst ner i varje mejl, eller genom att mejla
        info@mobilpoolen.se. Vi kan också avsluta tjänsten för alla med 30 dagars varsel per mejl.
      </p>

      <h2 className={H2}>8. Personuppgifter</h2>
      <p>
        Vilka uppgifter vi sparar, varför och hur länge står i{" "}
        <Link to="/integritetspolicy" hash="autopilot" className={LANK}>
          integritetspolicyn
        </Link>
        . Kort: vi sparar det du fyller i så länge bevakningen är igång. Avslutar du tar vi bort
        ditt mobilnummer direkt och resten efter 90 dagar.
      </p>

      <h2 className={H2}>9. Ansvar</h2>
      <p>
        Vi gör vårt bästa för att påminnelserna kommer i tid och att förslagen stämmer, men vi
        ansvarar inte för att ett mejl når fram, för operatörernas priser eller villkor eller för
        kostnader om du inte byter i tid. Ingenting i villkoren begränsar dina rättigheter som
        konsument enligt tvingande lag. I övrigt gäller Mobilpoolens{" "}
        <Link to="/anvandarvillkor" className={LANK}>
          användarvillkor
        </Link>
        .
      </p>

      <p className="mt-10 text-sm text-muted-foreground">Kontakt: info@mobilpoolen.se</p>
    </LegalPage>
  );
}

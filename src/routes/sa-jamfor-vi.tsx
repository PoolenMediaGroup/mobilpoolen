import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { TrustPage } from "@/components/trust-page";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";
import { ABONNEMANG, AELDST_KONTROLLERAD, OPERATORER, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText } from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";

const HEAD_TITLE = "Så jämför vi mobilabonnemang: metod och källor";
const DESC =
  "Så räknar Mobilpoolen: priser från operatörernas egna sidor, snittpris första året med kampanj och startavgift, källa och kontrolldatum per abonnemang.";

const UPPGIFTER = [
  "Ordinarie månadspris och eventuellt kampanjpris med kampanjens längd",
  "Surf per månad och surf inom EU/EES",
  "Bindningstid, uppsägningstid och startavgift",
  "Om 5G, eSIM, sparad surf och wifi-samtal ingår",
  "Vilket av de fyra mobilnäten operatören kör i",
  "Länk till sidan där uppgiften står och datum då vi kontrollerade den",
];

const GRANSER = [
  "Vi ser bara det operatörerna publicerar. Erbjudanden som bara finns i butik, i telefon eller för befintliga kunder kommer inte med.",
  "Kampanjer ändras ofta. Det som gäller är alltid det operatören visar när du beställer.",
  "Vi jämför inte alla operatörer i Sverige. Saknas en operatör beror det på att vi inte har kunnat kontrollera priserna.",
  "Vi mäter inte täckning eller hastighet själva. Om näten citerar vi PTS och Opensignal, med period och källa.",
  "Vi sätter inga egna betyg och visar inga stjärnor. Kundnöjdhet hämtar vi från Svenskt Kvalitetsindex.",
];

export const Route = createFileRoute("/sa-jamfor-vi")({
  head: () =>
    pageHead({
      title: `${HEAD_TITLE} | Mobilpoolen`,
      description: DESC,
      socialTitle: HEAD_TITLE,
      canonical: "/sa-jamfor-vi",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Så jämför vi", path: "/sa-jamfor-vi" },
        ]),
      ],
    }),
  component: Sida,
});

function Sida() {
  const medPriser = OPERATORER.filter((o) => ABONNEMANG.some((a) => a.operator === o.slug));
  const utanPriser = OPERATORER.filter(
    (o) => o.aktiv && !ABONNEMANG.some((a) => a.operator === o.slug),
  );
  return (
    <TrustPage
      title="Så jämför vi mobilabonnemang"
      intro="Vi hämtar priser och villkor direkt från operatörerna, räknar på vad du faktiskt betalar under ett år och visar alltid var uppgiften kommer ifrån. Ordningen styrs av pris, aldrig av ersättning."
      updated="29 oktober 2026"
    >
      <div className="prosa">
        <h2>Varifrån priserna kommer</h2>
        <p>
          Varje pris och villkor kommer från operatörens egen webbplats eller prislista. Vi använder
          inte andra jämförelsesajters uppgifter. För varje abonnemang sparar vi länken till källan,
          och varje operatör har ett datum för när vi senast kontrollerade priserna. Just nu är
          kontrolldatumen mellan {datumText(AELDST_KONTROLLERAD)} och{" "}
          {datumText(SENAST_KONTROLLERAD)}.
        </p>
        <p>Det här sparar vi för varje abonnemang:</p>
        <ul>
          {UPPGIFTER.map((u) => (
            <li key={u}>{u}</li>
          ))}
        </ul>

        <h2>Hur vi sorterar</h2>
        <p>
          Standardordningen är <strong>snittpris per månad under första året</strong>. Vi räknar
          kampanjpriset för de månader det gäller, ordinarie pris för resten av året och lägger till
          startavgiften om operatören tar en. Exempel: ett abonnemang för 29 kronor i fyra månader
          och sedan 159 kronor kostar 4 × 29 + 8 × 159 = 1 388 kronor första året, alltså 116 kronor
          i snitt per månad.
        </p>
        <p>
          Vi gör så för att kampanjpriset annars ger en skev bild. Ett abonnemang som kostar 19
          kronor i månaden i fyra månader kan bli dyrare över ett år än ett som kostar 120 kronor
          hela tiden. Du kan också sortera på pris första månaden, pris per GB eller mest surf, och
          i detaljerna ser du totalkostnaden över 24 månader.
        </p>
        <p>
          Har ett abonnemang ingen angiven bindningstid står det "Bindningstid framgår inte", och
          det visas inte när du filtrerar på abonnemang utan bindningstid.
        </p>

        <h2>Operatörerna vi jämför</h2>
        <p>
          Abonnemang från {medPriser.length} operatörer finns i jämförelsen:{" "}
          {medPriser.map((o, i) => (
            <span key={o.slug}>
              {i > 0 ? ", " : ""}
              <Link to="/operatorer/$slug" params={{ slug: o.slug }}>
                {o.namn}
              </Link>
            </span>
          ))}
          .
        </p>
        {utanPriser.length > 0 && (
          <p>
            Hos {utanPriser.map((o) => o.namn).join(", ")} har vi ännu inte kunnat kontrollera
            aktuella priser direkt hos operatören. De har en operatörssida med fakta om nät och
            villkor, men finns inte med i prisjämförelsen förrän priserna är kontrollerade.
          </p>
        )}

        <h2>Nät och kundnöjdhet</h2>
        <p>
          Vi gör inga egna mätningar av täckning eller hastighet. Om näten citerar vi{" "}
          <a href={KALLOR.ptsTackning.url} target="_blank" rel="noopener nofollow">
            PTS kartläggning
          </a>{" "}
          och{" "}
          <a href={KALLOR.opensignal.url} target="_blank" rel="noopener nofollow">
            Opensignals rapport
          </a>
          , alltid med mätperiod. Kundnöjdhet hämtar vi från{" "}
          <a href={KALLOR.ski.url} target="_blank" rel="noopener nofollow">
            Svenskt Kvalitetsindex
          </a>
          . Vi sätter inga egna betyg, eftersom vi inte har testat abonnemangen på ett sätt som
          skulle göra ett betyg rättvist.
        </p>

        <h2>Det här ser vi inte</h2>
        <ul className="!list-none !pl-0">
          {GRANSER.map((g) => (
            <li key={g} className="flex items-start gap-3">
              <Check className="mt-1.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{g}</span>
            </li>
          ))}
        </ul>

        <h2>Ersättning påverkar inte ordningen</h2>
        <p>
          I dag får vi ingen ersättning från någon operatör. Om vi får det framöver står det vid
          knappen till den operatören, och sorteringen förblir densamma. Läs mer om{" "}
          <Link to="/sa-tjanar-vi-pengar">hur vi tjänar pengar</Link>.
        </p>

        <h2>Hittar du ett fel?</h2>
        <p>
          Priser ändras ofta. Ser du ett pris som inte stämmer med operatörens sida,{" "}
          <Link to="/kontakt">hör av dig</Link> så kontrollerar vi och rättar samma dag om vi kan.
        </p>
      </div>
    </TrustPage>
  );
}

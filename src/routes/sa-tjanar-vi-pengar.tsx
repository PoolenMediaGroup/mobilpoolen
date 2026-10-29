import { createFileRoute, Link } from "@tanstack/react-router";
import { TrustPage } from "@/components/trust-page";
import { breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import { OPERATORER } from "@/lib/mobil/data";

const HEAD_TITLE = "Så tjänar Mobilpoolen pengar: vem betalar?";
const DESC =
  "Mobilpoolen är gratis och får i dag ingen ersättning från operatörer. Här står hur det kan bli framöver och vad ersättning aldrig får påverka.";
const UPPDATERAD = "29 oktober 2026";
const UPPDATERAD_ISO = "2026-10-29";

/**
 * Korta faktameningar som går att citera var för sig. Håll dem i linje med
 * FAQ-svaren om ersättning i faq-section.tsx, användarvillkoren punkt 2 och
 * /sa-jamfor-vi.
 */
const FAKTA: { fraga: string; svar: string }[] = [
  {
    fraga: "Vem betalar Mobilpoolen?",
    svar: "I dag ingen. Vi har inga avtal med operatörer och får ingen ersättning.",
  },
  {
    fraga: "Vad kostar tjänsten för dig?",
    svar: "Ingenting. Du jämför gratis och beställer direkt hos operatören.",
  },
  {
    fraga: "Kan det ändras?",
    svar: "Ja. Längre fram kan vi få ersättning från operatörer när någon beställer via oss.",
  },
  {
    fraga: "Påverkar ersättning ordningen?",
    svar: "Nej, aldrig. Ordningen styrs av pris och ditt urval, inte av avtal.",
  },
  {
    fraga: "Ser du om en länk ger oss ersättning?",
    svar: "Ja. En sådan länk får en rad vid knappen som säger det.",
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

const LANK = "text-primary underline underline-offset-2";

function SaTjanarViPengarPage() {
  const partner = OPERATORER.filter((o) => o.partner);
  return (
    <TrustPage
      title="Så tjänar Mobilpoolen pengar"
      intro="Mobilpoolen är gratis för dig och får i dag ingen ersättning från någon operatör. Längre fram kan vi få betalt när någon beställer ett abonnemang via oss. Här står hur det i så fall fungerar och vad ersättningen aldrig får påverka."
      updated={UPPDATERAD}
    >
      <div className="max-w-[680px] space-y-12 text-[17px] leading-relaxed">
        <section className="rounded-xl border border-border bg-surface p-5 text-[16px]">
          <h2 className="font-bold">Läget i dag</h2>
          <p className="mt-3 text-foreground/90">
            {partner.length === 0
              ? "Vi har inga avtal med någon operatör och får ingen ersättning. Prisjämförelsen, guiderna och kalkylatorerna kostar ingenting, och vi tjänar inga pengar på dem."
              : `Vi har avtal med ${partner.map((o) => o.namn).join(", ")}. Länkar till dem är märkta vid knappen.`}
          </p>
          <p className="mt-3 text-foreground/90">
            Du beställer alltid direkt hos operatören. Mobilpoolen säljer inga abonnemang och är
            aldrig part i ditt avtal.
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
          <h2 className="font-bold">Hur kan Mobilpoolen få betalt framöver?</h2>
          <p className="mt-4 text-foreground/90">
            Mobilpoolen drivs av PMG Poolen Media Group AB. Modellen vi planerar är vanlig för
            jämförelsetjänster: en operatör kan betala oss när någon klickar vidare från Mobilpoolen
            och beställer ett abonnemang, så kallad affiliate. Du betalar aldrig oss, och du
            beställer på operatörens egen sida, på operatörens villkor.
          </p>
          <p className="mt-4 text-foreground/90">
            Hur ersättningen räknas bestäms i avtal med varje operatör. Vi beskriver det här när det
            finns ett avtal.
          </p>
        </section>

        <section>
          <h2 className="font-bold">Det här lovar vi</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-foreground/90">
            <li>
              <strong>Ordningen styrs aldrig av ersättning.</strong> Standardordningen är snittpris
              per månad under första året. Du kan själv sortera på pris första månaden, pris per GB
              eller mest surf. Ett avtal flyttar inte en operatör uppåt.
            </li>
            <li>
              <strong>Länkar till partner märks.</strong> Leder en knapp till en operatör vi har
              avtal med står det på en rad direkt vid knappen. Länken får också attributet
              rel=&quot;sponsored&quot;, som talar om för sökmotorer att den är betald.
            </li>
            <li>
              <strong>Operatörer utan avtal syns lika mycket.</strong> Alla operatörer vars priser
              vi har kontrollerat står i jämförelsen, oavsett om vi tjänar något på dem eller inte.
              De har samma knapp, samma uppgifter och samma plats i sorteringen.
            </li>
            <li>
              <strong>Det vi skriver påverkas inte.</strong> Priser och villkor hämtas från
              operatörernas egna webbplatser, med källa och datum. Kundnöjdhet och nät redovisar vi
              från Svenskt Kvalitetsindex, PTS och Opensignal.{" "}
              <Link to="/sa-jamfor-vi" className={LANK}>
                Så jämför vi
              </Link>
              .
            </li>
            <li>
              <strong>Ditt pris påverkas inte.</strong> Priset och villkoren bestämmer operatören.
              Det som gäller är alltid det operatören visar när du beställer.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold">Varför vi märker betalda länkar</h2>
          <p className="mt-4 text-foreground/90">
            Marknadsföringslagen kräver att reklam ska gå att känna igen som reklam. En länk som ger
            oss betalt är marknadsföring, och då ska du se det där du klickar, inte bara på en sida
            längre bort. Därför står upplysningen vid knappen, och därför finns den här sidan.
          </p>
        </section>

        <section className="card-soft p-6 sm:p-8">
          <h2 className="font-bold">Vad betyder det för dig?</h2>
          <p className="mt-4 text-foreground/90">
            En tjänst som kan få betalt av de bolag den jämför har ett eget intresse, och det ska du
            veta när du läser våra sidor. Läs alltid operatörens villkor och avtalssammanfattning
            innan du beställer. Ersättningen beskrivs också i{" "}
            <Link to="/anvandarvillkor" className={LANK}>
              användarvillkoren
            </Link>
            . Vem som står bakom Mobilpoolen står på{" "}
            <Link to="/om-oss" className={LANK}>
              om oss
            </Link>
            . Har du frågor om ersättningen,{" "}
            <Link to="/kontakt" className={LANK}>
              kontakta oss
            </Link>
            .
          </p>
        </section>

        <div>
          <div className="flex flex-wrap gap-4">
            <Link to="/" hash="lista" className="btn-cta">
              Jämför abonnemang
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

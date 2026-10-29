import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import leonAsset from "@/assets/leon-portratt.jpg.asset.json";

const HEAD_TITLE = "Om Mobilpoolen: vilka vi är och hur vi arbetar";
const DESC =
  "Mobilpoolen drivs av PMG Poolen Media Group AB och grundades av Leon Hallström. Så arbetar vi med källor, offerter och ersättning.";
const UPPDATERAD = "1 oktober 2026";
const UPPDATERAD_ISO = "2026-10-01";

/**
 * Organization definieras en gång, i __root.tsx (@id #organization), och
 * Person en gång, på skribentsidan (@id om-oss#leon). Här pekar vi bara på
 * dem, så att samma @id inte får två olika url:er.
 */
export const Route = createFileRoute("/om-oss")({
  head: () =>
    pageHead({
      title: `${HEAD_TITLE} | Mobilpoolen`,
      description: DESC,
      socialTitle: HEAD_TITLE,
      canonical: "https://mobilpoolen.se/om-oss",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Om oss", path: "/om-oss" },
        ]),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: HEAD_TITLE,
          description: DESC,
          url: "https://mobilpoolen.se/om-oss",
          inLanguage: "sv-SE",
          dateModified: UPPDATERAD_ISO,
          about: { "@id": "https://mobilpoolen.se/#organization" },
          mainEntity: { "@id": "https://mobilpoolen.se/#organization" },
          author: { "@id": "https://mobilpoolen.se/om-oss#leon" },
          isPartOf: { "@id": "https://mobilpoolen.se/#website" },
        }),
      ],
    }),
  component: OmOssPage,
});

const RUBRIK = "pt-6 text-2xl font-bold tracking-tight";
const LANK = "text-primary underline underline-offset-2 hover:opacity-80";

function OmOssPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <section className="bg-dark-section text-footer-foreground">
        <div className="mx-auto max-w-[1140px] px-6 py-12 sm:py-16">
          <h1
            className="font-bold tracking-tight"
            style={{ fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.15 }}
          >
            Om Mobilpoolen
          </h1>
          <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-footer-foreground/80">
            Mobilpoolen är en svensk jämförelsetjänst för larm till hem, företag och föreningar. Vi
            visar vad larmbolagen själva publicerar om pris och villkor, med källa och datum. Snart
            kan du också få offerter från två till tre larmbolag. Tjänsten drivs av PMG Poolen Media
            Group AB i Stockholm.
          </p>
          <p className="mt-6 text-[13.5px] text-footer-foreground/70">
            Uppdaterad {UPPDATERAD}. Ansvarig:{" "}
            <Link
              to="/skribent/leon-hallstrom"
              className="underline underline-offset-2 hover:text-white"
            >
              Leon Hallström
            </Link>
            , grundare.
          </p>
        </div>
      </section>

      <main>
        <section className="pb-20 pt-12 lg:pb-28 lg:pt-16">
          <div className="mx-auto w-full max-w-[1140px] px-6">
            <div className="grid gap-10 lg:grid-cols-[340px_1fr] lg:items-start lg:gap-16">
              <div id="leon" className="scroll-mt-24 lg:sticky lg:top-28" data-reveal>
                <div
                  className="overflow-hidden"
                  style={{
                    borderRadius: 20,
                    boxShadow: "var(--shadow-portratt)",
                    maxWidth: 340,
                    aspectRatio: "3 / 4",
                  }}
                >
                  <img
                    src={leonAsset.url}
                    alt="Leon Hallström, grundare av Mobilpoolen"
                    width={600}
                    height={800}
                    className="h-full w-full object-cover object-top"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                <p className="mt-4 text-[14px] text-foreground/65">
                  Leon Hallström, grundare av Mobilpoolen
                </p>
              </div>

              <div className="max-w-[680px] space-y-6 text-[18px] leading-[1.7]">
                <h2 className={RUBRIK}>Varför Mobilpoolen finns</h2>
                <p>
                  Jag heter Leon och driver Mobilpoolen tillsammans med mitt team. Vi startade
                  tjänsten av en enkel anledning: det gick inte att ta reda på vad ett hemlarm
                  kostar utan att först prata med en säljare.
                </p>
                <p>
                  Mönstret känner många igen. En säljare ringer på dörren eller hör av sig på
                  telefon. Erbjudandet gäller bara idag, installationen är gratis och månadsavgiften
                  låter rimlig. Du skriver på i hallen utan att ha sett ett enda annat pris. Sedan
                  löper avtalet i två år, avgiften höjs längs vägen och uppsägningstiden är längre
                  än du trodde. Det är ingen slump, utan en affärsmodell som bygger på att du inte
                  hinner jämföra.
                </p>
                <p>Mobilpoolen gör jämförelsen innan du bestämmer dig.</p>

                <h2 className={RUBRIK}>Vem som står bakom</h2>
                <p>
                  Mobilpoolen grundades av Leon Hallström. Han är byggingenjör från Nackademin med
                  inriktningen Hållbart byggande, har arbetat tre år som arbetsledare i ett
                  bostadsprojekt på cirka 400 miljoner kronor och utsågs 2024 till en av Årets
                  Byggtalanger.
                </p>
                <p>
                  Ett larm är en installation i en byggnad, med avtal, avbetalning och villkor som
                  löper i många år. Den typen av upphandling går att göra begriplig, och det är det
                  Mobilpoolen försöker göra. Leon står bakom guiderna, jämförelserna och
                  prisuppgifterna på sajten.{" "}
                  <Link to="/skribent/leon-hallstrom" className={LANK}>
                    Mer om Leon Hallström
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Så arbetar vi med källor</h2>
                <p>
                  Vi hämtar priser och villkor från larmbolagens egna webbplatser och skriver ut
                  startkostnad, månadsavgift, bindningstid och vad som ingår, med källa och datum
                  för varje uppgift. Publicerar ett bolag inte sitt pris säger vi det rakt ut i
                  stället för att gissa. Vi använder inte andra jämförelsetjänsters siffror. Om
                  regler och statistik hänvisar vi till myndigheter som Integritetsskyddsmyndigheten
                  och Brottsförebyggande rådet.{" "}
                  <Link to="/sa-jamfor-vi" className={LANK}>
                    Så jämför vi
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Så fungerar tjänsten</h2>
                <p>
                  I dag jämför vi bolagens publicerade priser och villkor. När vi öppnar för
                  offerter kommer vi att skicka din förfrågan till två till tre larmbolag som
                  passar. Du väljer själv vem du svarar, och du binder dig inte till något.{" "}
                  <Link to="/sa-fungerar-mobilpoolen" className={LANK}>
                    Så fungerar Mobilpoolen steg för steg
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Så tjänar vi pengar</h2>
                <p>
                  Tjänsten är gratis för dig. När vi öppnar för offerter kommer vi att få ersättning
                  av de larmbolag vi skickar förfrågningar till. Det påverkar inte priset du
                  betalar, men det gör att vi inte kallar oss oberoende.{" "}
                  <Link to="/sa-tjanar-vi-pengar" className={LANK}>
                    Läs hur ersättningen fungerar
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Företaget bakom Mobilpoolen</h2>
                <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-border p-5 text-[16px] sm:grid-cols-[160px_1fr]">
                  <dt className="font-semibold">Bolag</dt>
                  <dd>PMG Poolen Media Group AB</dd>
                  <dt className="font-semibold">Org.nr</dt>
                  <dd>559602-5287</dd>
                  <dt className="font-semibold">Adress</dt>
                  <dd>Valfrid Palmgrens gata 12, 113 69 Stockholm</dd>
                  <dt className="font-semibold">E-post</dt>
                  <dd>
                    <a href="mailto:info@mobilpoolen.se" className={LANK}>
                      info@mobilpoolen.se
                    </a>
                  </dd>
                </dl>
                <p>
                  Samma bolag driver också{" "}
                  <a href="https://elpoolen.se" className={LANK}>
                    Elpoolen
                  </a>
                  , en jämförelsetjänst för elavtal.
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to="/" hash="priser" className="btn-cta">
                    Jämför priserna
                  </Link>
                  <Link to="/kontakt" className="btn-secondary-outline">
                    Kontakta oss
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

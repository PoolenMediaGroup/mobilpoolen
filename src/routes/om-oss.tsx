import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import leonAsset from "@/assets/leon-portratt.jpg.asset.json";

const HEAD_TITLE = "Om Mobilpoolen: vilka vi är och hur vi jämför";
const DESC =
  "Mobilpoolen jämför mobilabonnemang för privatpersoner och företag. Drivs av PMG Poolen Media Group AB och grundades av Leon Hallström.";
const UPPDATERAD = "29 oktober 2026";
const UPPDATERAD_ISO = "2026-10-29";

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
            Mobilpoolen är en svensk jämförelsetjänst för mobilabonnemang, för privatpersoner och
            företag. Vi visar vad operatörerna själva publicerar om pris och villkor, med källa och
            datum, och räknar på vad abonnemanget kostar under ett helt år. Tjänsten drivs av PMG
            Poolen Media Group AB i Stockholm.
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
                  Ett mobilabonnemang ser enkelt ut, men priset du ser först är ofta inte det du
                  betalar. Kampanjpriser gäller några månader, startavgifter läggs till och surfen
                  räknas på olika sätt. Det gör det svårt att se vilket abonnemang som faktiskt är
                  billigast för dig.
                </p>
                <p>
                  Mobilpoolen finns för att göra den jämförelsen åt dig. Vi ställer abonnemangen mot
                  varandra på samma sätt, visar vad de kostar i snitt under första året och skriver
                  ut bindningstid, uppsägningstid och vilket nät operatören kör i.
                </p>

                <h2 className={RUBRIK}>Vem som står bakom</h2>
                <p>
                  Mobilpoolen grundades av Leon Hallström. Han driver också syskonsajterna Elpoolen
                  och Larmpoolen och är ansvarig för innehållet på Mobilpoolen: guiderna,
                  jämförelserna och prisuppgifterna.{" "}
                  <Link to="/skribent/leon-hallstrom" className={LANK}>
                    Mer om Leon Hallström
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Hur jämför vi?</h2>
                <p>
                  Vi hämtar priser och villkor från operatörernas egna webbplatser och prislistor.
                  Varje abonnemang har en länk till källan, och varje operatör har ett datum för när
                  vi senast kontrollerade priserna. Har vi inte kunnat kontrollera en operatörs
                  priser står den inte med i prisjämförelsen, i stället för att vi gissar. Vi sätter
                  inga egna betyg. Om nät och kundnöjdhet hänvisar vi till PTS, Opensignal och
                  Svenskt Kvalitetsindex, med källa.{" "}
                  <Link to="/sa-jamfor-vi" className={LANK}>
                    Så jämför vi
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Tjänar Mobilpoolen pengar på operatörerna?</h2>
                <p>
                  Nej, inte i dag. Vi har inga avtal med operatörer och får ingen ersättning. Du
                  beställer alltid direkt hos operatören. Längre fram kan vi få ersättning när någon
                  beställer via oss. Då står det vid knappen till den operatören, och det påverkar
                  aldrig ordningen i jämförelsen.{" "}
                  <Link to="/sa-tjanar-vi-pengar" className={LANK}>
                    Så tjänar vi pengar
                  </Link>
                  .
                </p>

                <h2 className={RUBRIK}>Företaget bakom Mobilpoolen</h2>
                <dl className="grid gap-x-6 gap-y-2 rounded-xl border border-border p-5 text-[16px] sm:grid-cols-[160px_1fr]">
                  <dt className="font-semibold">Bolag</dt>
                  <dd>PMG Poolen Media Group AB</dd>
                  <dt className="font-semibold">Org.nr</dt>
                  <dd>559602-5287</dd>
                  <dt className="font-semibold">Postadress</dt>
                  <dd>Valfrid Palmgrens gata 12, 113 69 Stockholm</dd>
                  <dt className="font-semibold">E-post</dt>
                  <dd>
                    <a href="mailto:info@mobilpoolen.se" className={LANK}>
                      info@mobilpoolen.se
                    </a>
                  </dd>
                </dl>
                <p>
                  Samma bolag driver också syskonsajterna{" "}
                  <a href="https://elpoolen.se" className={LANK}>
                    Elpoolen
                  </a>{" "}
                  och{" "}
                  <a href="https://larmpoolen.se" className={LANK}>
                    Larmpoolen
                  </a>
                  .
                </p>

                <div className="flex flex-wrap gap-4 pt-4">
                  <Link to="/" hash="lista" className="btn-cta">
                    Jämför abonnemang
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

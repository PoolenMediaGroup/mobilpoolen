import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { CtaBand } from "@/components/cta-band";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeader, SectionShell } from "@/components/section-layout";
import { A, H2, P, UL } from "@/components/guide-page";
import { breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import { GUIDE_CATEGORIES, PUBLISHED_GUIDES } from "@/lib/guides";
import leonAsset from "@/assets/leon-portratt.jpg.asset.json";

const TITLE = "Leon Hallström, grundare av Mobilpoolen";
const HEAD_TITLE = "Leon Hallström: grundare av Mobilpoolen";
const DESC =
  "Leon Hallström är grundare av Mobilpoolen, Elpoolen och Larmpoolen och ansvarig för innehållet. Här står vad han skriver och hur du når honom.";
const UPPDATERAD = "29 oktober 2026";

export const Route = createFileRoute("/skribent/leon-hallstrom")({
  head: () =>
    pageHead({
      title: `${HEAD_TITLE} | Mobilpoolen`,
      description: DESC,
      socialTitle: HEAD_TITLE,
      canonical: "/skribent/leon-hallstrom",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Leon Hallström", path: "/skribent/leon-hallstrom" },
        ]),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: "https://mobilpoolen.se/skribent/leon-hallstrom",
          inLanguage: "sv-SE",
          dateModified: "2026-10-29",
          mainEntity: { "@id": "https://mobilpoolen.se/om-oss#leon" },
          about: { "@id": "https://mobilpoolen.se/om-oss#leon" },
          isPartOf: { "@id": "https://mobilpoolen.se/#website" },
        }),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "Person",
          "@id": "https://mobilpoolen.se/om-oss#leon",
          name: "Leon Hallström",
          jobTitle: "Grundare",
          description:
            "Grundare av Mobilpoolen, Elpoolen och Larmpoolen och ansvarig för innehållet på Mobilpoolen. Byggingenjör från Nackademin och utsedd till en av Årets Byggtalanger 2024.",
          url: "https://mobilpoolen.se/skribent/leon-hallstrom",
          alumniOf: { "@type": "EducationalOrganization", name: "Nackademin" },
          award: "En av Årets Byggtalanger 2024",
          knowsAbout: ["Mobilabonnemang", "Mobiloperatörer", "Elavtal", "Hållbart byggande"],
          worksFor: { "@id": "https://mobilpoolen.se/#organization" },
        }),
      ],
    }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="bg-dark-section text-footer-foreground">
          <div className="mx-auto max-w-[1140px] px-6 py-16 lg:py-24">
            <h1 className="max-w-3xl font-bold text-white">{TITLE}</h1>
            <p className="mt-5 max-w-3xl text-[18px] leading-relaxed text-white/80">
              Leon Hallström är grundare av Mobilpoolen och ansvarig för innehållet här. Han står
              bakom guiderna, jämförelserna och prisuppgifterna. Han har också grundat
              syskonsajterna Elpoolen och Larmpoolen.
            </p>
            <p className="mt-6 text-[13.5px] text-white/70">Uppdaterad {UPPDATERAD}.</p>
          </div>
        </section>

        <SectionShell className="bg-surface">
          <div className="grid gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
            <div data-reveal>
              <div
                className="overflow-hidden"
                style={{
                  borderRadius: 20,
                  boxShadow: "var(--shadow-portratt)",
                  maxWidth: 300,
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
            </div>
            <div className="max-w-[760px]">
              <H2 id="bakgrund">Bakgrund</H2>
              <P>
                Leon driver PMG Poolen Media Group AB, bolaget bakom Mobilpoolen, Elpoolen och
                Larmpoolen. Han är byggingenjör från Nackademin med inriktningen Hållbart byggande
                och utsågs 2024 till en av Årets Byggtalanger.
              </P>
              <P>
                Tanken bakom alla tre sajterna är densamma: ett avtal som löper i månader eller år
                ska gå att jämföra innan du skriver på, med samma mått för alla bolag och en källa
                för varje uppgift.
              </P>

              <H2 id="vad-leon-skriver">Vad Leon står bakom här</H2>
              <UL>
                <li>
                  Guiderna under /guider, om pris och avtal, surf och nät, byte, utland och företag.
                </li>
                <li>
                  Jämförelserna av mobilabonnemang, operatörssidorna under /operatorer och sidorna
                  om de fyra mobilnäten under /nat.
                </li>
                <li>Kalkylatorerna under /verktyg och ordlistan.</li>
              </UL>

              <H2 id="sa-arbetar-vi">Så tas uppgifterna fram</H2>
              <P>
                Varje pris och villkor kontrolleras mot operatörens egen webbplats eller prislista
                och får ett datum. Har en operatörs priser inte gått att kontrollera står den inte i
                prisjämförelsen, i stället för att vi gissar. Lagregler hämtas ur lagtexten och PTS
                föreskrifter, och om nät och kundnöjdhet hänvisar vi till PTS, Opensignal och
                Svenskt Kvalitetsindex. <A href="/sa-jamfor-vi">Läs hela metoden</A>.
              </P>
              <P>
                Mobilpoolen får i dag ingen ersättning från någon operatör. Om det ändras står det
                vid knappen till den operatören, och det påverkar aldrig ordningen i jämförelsen.{" "}
                <A href="/sa-tjanar-vi-pengar">Så tjänar vi pengar</A>.
              </P>

              <H2 id="guider">Guider av Leon Hallström</H2>
              {GUIDE_CATEGORIES.map((kategori) => {
                const guider = PUBLISHED_GUIDES.filter((g) => g.category === kategori);
                if (guider.length === 0) return null;
                return (
                  <div key={kategori} className="mt-6">
                    <h3 className="text-[17px] font-bold">{kategori}</h3>
                    <UL>
                      {guider.map((g) => (
                        <li key={g.slug}>
                          <A href={`/guider/${g.slug}`}>{g.title}</A>
                        </li>
                      ))}
                    </UL>
                  </div>
                );
              })}

              <H2 id="kontakt">Kontakt</H2>
              <P>
                Har du hittat ett pris som inte stämmer, eller en operatör vi borde ta med? Hör av
                dig via <A href="/kontakt">kontaktsidan</A>. Rättelser är alltid välkomna, och vi
                skriver ut när en sida senast uppdaterades.
              </P>
              <P>
                Mer om företaget bakom tjänsten finns på <A href="/om-oss">om oss</A>.
              </P>
            </div>
          </div>
        </SectionShell>

        <CtaBand
          rubrik="Betalar du för mycket för mobilen?"
          ingress="Jämför alla abonnemang på en gång, sorterat efter vad du betalar på ett år."
          knapptext="Jämför mobilabonnemang →"
          hash="alla"
          bildnyckel="pappa-barn-promenad"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { CtaBand } from "@/components/cta-band";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeader, SectionShell } from "@/components/section-layout";
import { A, H2, P, UL } from "@/components/guide-page";
import { breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import leonAsset from "@/assets/leon-portratt.jpg.asset.json";

const TITLE = "Leon Hallström, grundare av Mobilpoolen";
const HEAD_TITLE = "Leon Hallström: grundare av Mobilpoolen";
const DESC =
  "Leon Hallström är byggingenjör och grundare av Mobilpoolen. Här står vem som skriver sidorna, vad han bygger på och hur du når honom.";
const UPPDATERAD = "22 september 2026";

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
          dateModified: "2026-09-22",
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
            "Byggingenjör och grundare av Mobilpoolen. Tidigare arbetsledare i ett bostadsprojekt på cirka 400 miljoner kronor och utsedd till en av Årets Byggtalanger 2024.",
          url: "https://mobilpoolen.se/skribent/leon-hallstrom",
          alumniOf: { "@type": "EducationalOrganization", name: "Nackademin" },
          award: "En av Årets Byggtalanger 2024",
          knowsAbout: ["Hemlarm", "Inbrottsskydd", "Hållbart byggande", "Bostadsprojekt"],
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
              Leon Hallström är byggingenjör och grundare av Mobilpoolen. Han står bakom guiderna,
              jämförelserna och prisuppgifterna här på sajten.
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
                Leon är byggingenjör från Nackademin med inriktningen Hållbart byggande. Han har
                arbetat tre år som arbetsledare i ett bostadsprojekt på cirka 400 miljoner kronor
                och utsågs 2024 till en av Årets Byggtalanger.
              </P>
              <P>
                Erfarenheten från byggsidan är också skälet till att Mobilpoolen finns. Ett larm är
                en installation i en byggnad, med avtal, avbetalning och villkor som löper i många
                år. Den typen av upphandling går att göra begriplig, men larmbranschen har sällan
                gjort det.
              </P>

              <H2 id="vad-leon-skriver">Vad Leon står bakom här</H2>
              <UL>
                <li>Guiderna under /guider, från kostnad och bindningstid till kameraregler.</li>
                <li>Pelarsidorna för villa, radhus, lägenhet och fritidshus.</li>
                <li>
                  Jämförelserna under /jamfor och bolagssidorna under /larmbolag, där priser och
                  villkor hämtas från larmbolagens egna webbplatser.
                </li>
              </UL>

              <H2 id="sa-arbetar-vi">Så tas uppgifterna fram</H2>
              <P>
                Varje pris och villkor kontrolleras mot larmbolagets egen webbplats och får ett
                datum. Publicerar ett bolag inte en uppgift står det att den saknas, i stället för
                en gissning. Vi hämtar aldrig siffror från andra jämförelsetjänster.{" "}
                <A href="/sa-jamfor-vi">Läs hela metoden</A>.
              </P>
              <P>
                När Mobilpoolen öppnar kommer vi att få ersättning av de larmbolag vi har avtal med.
                Det är så tjänsten ska finansieras, och det påverkar inte vilka uppgifter som
                publiceras. <A href="/sa-tjanar-vi-pengar">Så tjänar vi pengar</A>.
              </P>

              <H2 id="kontakt">Kontakt</H2>
              <P>
                Har du hittat en uppgift som inte stämmer, eller ett larmbolag vi borde ta med? Hör
                av dig via <A href="/kontakt">kontaktsidan</A>. Rättelser är alltid välkomna, och vi
                skriver ut när en sida senast uppdaterades.
              </P>
              <P>
                Mer om företaget bakom tjänsten finns på <A href="/om-oss">om oss</A>.
              </P>
            </div>
          </div>
        </SectionShell>

        <CtaBand
          rubrik="Jämför hemlarm för din bostad"
          ingress="Mobilpoolen öppnar snart. Lämna din e-post så hör vi av oss när du kan begära offert."
          knapptext="Jämför hemlarm →"
          bildnyckel="pappa-barn-promenad"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

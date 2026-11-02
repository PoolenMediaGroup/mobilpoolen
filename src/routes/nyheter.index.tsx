import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { CtaBand } from "@/components/cta-band";
import { NyhetKort } from "@/components/nyhet-kort";
import { HAR_NYHETER, NYHETER } from "@/lib/nyheter";
import { absoluteUrl, breadcrumbJsonLd, jsonLdScript, pageHead, SITE_URL } from "@/lib/seo";

const TITLE = "Nyheter om mobilabonnemang";
const DESC =
  "Nyheter om mobilabonnemang, priser, operatörer, mobilnät och regler i Sverige. Varje nyhet med källa och datum, och vad den betyder för dig.";

const CRUMBS = [
  { name: "Start", path: "/" },
  { name: "Nyheter", path: "/nyheter" },
];

export const Route = createFileRoute("/nyheter/")({
  head: () =>
    pageHead({
      title: `${TITLE} | Mobilpoolen`,
      description: DESC,
      socialTitle: TITLE,
      canonical: "/nyheter",
      // Tom lista ska inte indexeras. Första nyheten slår på indexeringen.
      noindex: !HAR_NYHETER,
      links: [
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: "Mobilpoolen: nyheter",
          href: `${SITE_URL}/nyheter/rss.xml`,
        },
      ],
      scripts: [
        breadcrumbJsonLd(CRUMBS),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          url: absoluteUrl("/nyheter"),
          inLanguage: "sv-SE",
          publisher: { "@id": `${SITE_URL}/#organization` },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: NYHETER.map((n, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(`/nyheter/${n.slug}`),
              name: n.titel,
            })),
          },
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
        <section className="relative overflow-hidden hero-mesh">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full"
            style={{
              background: "color-mix(in srgb, var(--primary) 35%, transparent)",
              filter: "blur(4px)",
            }}
          />
          <div className="relative mx-auto max-w-[1140px] px-6 pt-8 pb-8 lg:pt-12 lg:pb-10">
            <PageBreadcrumbs trail={CRUMBS} tone="dark" />
            <h1
              className="font-bold text-white"
              style={{
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                fontSize: "clamp(28px, 4.4vw, 40px)",
              }}
            >
              Nyheter om mobilabonnemang
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/82">
              Priser, operatörer, mobilnät och regler. Varje nyhet bygger på en källa du kan läsa
              själv, och säger vad den betyder för dig.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1140px] px-6 pt-10 pb-[64px] lg:pb-[96px]">
          {HAR_NYHETER ? (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {NYHETER.map((n) => (
                <li key={n.slug}>
                  <NyhetKort nyhet={n} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="max-w-[680px] text-[17px]">
              Här kommer vi att publicera nyheter om mobilabonnemang. Under tiden hittar du priser
              som ändrats nyligen på{" "}
              <Link to="/prisindex" className="text-primary underline underline-offset-2">
                prisindex
              </Link>{" "}
              och aktuella erbjudanden bland{" "}
              <Link to="/kampanjer" className="text-primary underline underline-offset-2">
                kampanjerna just nu
              </Link>
              .
            </p>
          )}

          <p className="mt-10 max-w-[680px] text-[16px] text-muted-foreground">
            Datumet på varje nyhet är dagen källan publicerades. Vill du följa flödet finns det som{" "}
            <a href="/nyheter/rss.xml" className="text-primary underline underline-offset-2">
              RSS
            </a>
            . Längre genomgångar finns bland våra{" "}
            <Link to="/guider" className="text-primary underline underline-offset-2">
              guider
            </Link>
            .
          </p>
        </div>

        <CtaBand
          rubrik="Betalar du för mycket för mobilen?"
          ingress="Jämför operatörernas priser efter kampanjen, sorterade efter vad du betalar första året."
          knapptext="Jämför mobilabonnemang →"
          hash="alla"
          bildnyckel="kvinna-soffa-mobil"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

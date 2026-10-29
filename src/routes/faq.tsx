import { createFileRoute } from "@tanstack/react-router";
import { pageHead, faqJsonLd } from "@/lib/seo";
import { useState } from "react";
import { Search } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { FullFaqPage, FAQ_PA_FAQSIDAN } from "@/components/faq-section";

const TITLE = "Frågor och svar";
const DESC =
  "Svar om mobilabonnemang: bindningstid, nummerflytt, surf, nät, EU-surf, företag och hur Mobilpoolens jämförelse fungerar.";

export const Route = createFileRoute("/faq")({
  head: () =>
    pageHead({
      title: `${TITLE} | Mobilpoolen`,
      description: DESC,
      canonical: "https://mobilpoolen.se/faq",
      scripts: [faqJsonLd(FAQ_PA_FAQSIDAN.flatMap((g) => g.items))],
    }),
  component: FaqPage,
});

function FaqPage() {
  const [query, setQuery] = useState("");
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden bg-dark-section">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:pt-12 lg:pb-10">
            <h1
              className="font-bold"
              style={{
                color: "var(--footer-foreground)",
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                fontSize: "clamp(28px, 4.4vw, 40px)",
              }}
            >
              {TITLE}
            </h1>
            <p
              className="mt-3 max-w-2xl leading-relaxed"
              style={{ color: "color-mix(in srgb, white 82%, transparent)", fontSize: 17 }}
            >
              Svar på det du undrar över om mobilabonnemang, byte av operatör och hur vår jämförelse
              fungerar.
            </p>

            <div className="relative mt-6 max-w-md">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sök bland frågorna"
                aria-label="Sök bland frågorna"
                className="w-full rounded-[20px] border-0 bg-surface py-3.5 pr-4 pl-11 text-[16px] outline-none shadow-sokfalt focus:ring-2 focus:ring-white/60"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-[64px] lg:pb-[96px]">
          <FullFaqPage query={query} setQuery={setQuery} hideSearch grupper={FAQ_PA_FAQSIDAN} />
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

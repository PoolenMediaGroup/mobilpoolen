import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { GuideCard } from "@/components/guide-card";
import { PUBLISHED_GUIDES, GUIDE_CATEGORIES } from "@/lib/guides";
import { unikaKortbilder } from "@/lib/guide-images";

const TITLE = "Guider om mobilabonnemang";
const DESC =
  "Guider om mobilabonnemang: surf, bindningstid, kampanjer, nät, byte av operatör och företag. Korta svar med källor, skrivet på svenska.";

export const Route = createFileRoute("/guider/")({
  head: () =>
    pageHead({
      title: `${TITLE} | Mobilpoolen`,
      description: DESC,
      socialTitle: TITLE,
      canonical: "https://mobilpoolen.se/guider",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Guider och råd", path: "/guider" },
        ]),
      ],
    }),
  component: Page,
});

function Page() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Alla");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PUBLISHED_GUIDES.filter((g) => {
      const catOk = category === "Alla" || g.category === category;
      const qOk = !q || g.title.toLowerCase().includes(q) || g.excerpt.toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [query, category]);

  const chips = ["Alla", ...GUIDE_CATEGORIES];
  // Korten står grupperade per kategori. Bilderna fördelas i den ordningen,
  // så att ingen bild syns två gånger bland de kort som visas.
  const grupper = GUIDE_CATEGORIES.map((c) => ({
    kategori: c,
    guider: filtered.filter((g) => g.category === c),
  })).filter((gr) => gr.guider.length > 0);
  const kortbilder = unikaKortbilder(grupper.flatMap((gr) => gr.guider.map((g) => g.slug)));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden bg-dark-section">
          {/* Dekorcirkel som i Elpoolens hero, i Mobilpoolens krimson. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full"
            style={{
              background: "color-mix(in srgb, var(--primary) 35%, transparent)",
              filter: "blur(4px)",
            }}
          />
          <div className="relative mx-auto max-w-[1140px] px-6 pt-8 pb-8 lg:pt-12 lg:pb-10">
            <h1
              className="font-bold text-white"
              style={{
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                fontSize: "clamp(28px, 4.4vw, 40px)",
              }}
            >
              Guider &amp; råd
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/82">
              Korta, konkreta guider om allt som avgör vad du betalar för mobilen: surf, kampanjer,
              bindningstid, nät och byte av operatör.
            </p>

            <div className="mt-6 max-w-md relative">
              <Search
                className="w-[18px] h-[18px] text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sök bland guider"
                aria-label="Sök bland guider"
                className="w-full rounded-[20px] border-0 bg-surface pl-11 pr-4 py-3.5 text-[16px] outline-none shadow-sokfalt focus:ring-2 focus:ring-white/60"
              />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1140px] px-6 pt-10 pb-[64px] lg:pb-[96px]">
          <div className="flex flex-wrap gap-2">
            {chips.map((c) => {
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={active}
                  className={`inline-flex min-h-11 items-center rounded-full px-4 py-2 text-[14px] font-medium border transition ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[13px] text-muted-foreground">
            Visar {filtered.length} av {PUBLISHED_GUIDES.length} guider
          </p>

          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-semibold">
            <Link
              to="/verktyg/hur-mycket-surf-behover-jag"
              className="inline-flex min-h-11 items-center text-primary underline underline-offset-2"
            >
              Hur mycket surf behöver jag?
            </Link>
            <Link
              to="/prisindex"
              className="inline-flex min-h-11 items-center text-primary underline underline-offset-2"
            >
              Mobilpoolens prisindex
            </Link>
            <Link
              to="/ordlista"
              className="inline-flex min-h-11 items-center text-primary underline underline-offset-2"
            >
              Ordlista för mobilabonnemang
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="mt-6 card-soft p-8 text-center">
              <p className="text-[15px] text-muted-foreground">Inga guider matchar din sökning.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setCategory("Alla");
                }}
                className="mt-4 text-[14px] font-semibold text-primary"
              >
                Rensa filter
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-14">
              {grupper.map(({ kategori, guider }) => (
                <section key={kategori}>
                  <h2 className="text-xl sm:text-2xl font-semibold text-foreground">{kategori}</h2>
                  <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                    {guider.map((g) => (
                      <GuideCard
                        key={g.slug}
                        guide={g}
                        bild={kortbilder.get(g.slug) ?? null}
                        kompakt
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

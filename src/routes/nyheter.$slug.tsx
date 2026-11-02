import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { CtaBand } from "@/components/cta-band";
import { NyckeltalYta, NyhetKort, NyhetText } from "@/components/nyhet-kort";
import { NYHETER, getNyhet, nyhetsdatum, type NyhetBlock } from "@/lib/nyheter";
import { bild } from "@/lib/bildbank";
import { absoluteUrl, breadcrumbJsonLd, newsArticleJsonLd, pageHead } from "@/lib/seo";

export const Route = createFileRoute("/nyheter/$slug")({
  loader: ({ params }) => {
    const nyhet = getNyhet(params.slug);
    if (!nyhet) throw notFound();
    return nyhet;
  },
  head: ({ loaderData: nyhet }) => {
    if (!nyhet) {
      return {
        meta: [
          { title: "Nyheten hittades inte | Mobilpoolen" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const path = `/nyheter/${nyhet.slug}`;
    const b = nyhet.bild ? bild(nyhet.bild) : null;
    return pageHead({
      title: `${nyhet.seoTitel} | Mobilpoolen`,
      description: nyhet.ingress,
      socialTitle: nyhet.titel,
      canonical: path,
      ogType: "article",
      meta: [
        { property: "article:published_time", content: nyhet.publiceradIso },
        { property: "article:modified_time", content: nyhet.uppdateradIso },
        ...(b
          ? [
              { property: "og:image", content: absoluteUrl(b.jpg) },
              { property: "og:image:alt", content: b.alt },
            ]
          : []),
      ],
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Nyheter", path: "/nyheter" },
          { name: nyhet.seoTitel, path },
        ]),
        newsArticleJsonLd({
          title: nyhet.titel,
          description: nyhet.ingress,
          path,
          publishedIso: nyhet.publiceradIso,
          updatedIso: nyhet.uppdateradIso,
          image: b?.jpg,
          citation: nyhet.kallor.map((k) => k.url),
        }),
      ],
    });
  },
  component: Page,
});

function Block({ b }: { b: NyhetBlock }) {
  if (b.typ === "h2") {
    return (
      <h2 id={b.id} className="mt-10 mb-4 scroll-mt-24 text-xl font-semibold sm:text-2xl">
        {b.text}
      </h2>
    );
  }
  if (b.typ === "ul") {
    return (
      <ul className="mb-5 list-disc space-y-2 pl-5 text-[18px]">
        {b.punkter.map((p, i) => (
          <li key={i}>
            <NyhetText text={p} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mb-5 text-[18px]">
      <NyhetText text={b.text} />
    </p>
  );
}

function Page() {
  const nyhet = Route.useLoaderData();
  const fler = NYHETER.filter((n) => n.slug !== nyhet.slug).slice(0, 3);
  const andrad = nyhet.uppdateradIso !== nyhet.publiceradIso;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <div className="mx-auto max-w-[1140px] px-6 pt-10 pb-[64px] lg:pt-16 lg:pb-[96px]">
          <article className="mx-auto text-foreground" style={{ maxWidth: 720, lineHeight: 1.75 }}>
            <PageBreadcrumbs
              trail={[
                { name: "Start", path: "/" },
                { name: "Nyheter", path: "/nyheter" },
                { name: nyhet.seoTitel, path: `/nyheter/${nyhet.slug}` },
              ]}
            />

            <div className="mb-8 overflow-hidden rounded-2xl" style={{ aspectRatio: "16 / 7" }}>
              <NyckeltalYta nyhet={nyhet} stor />
            </div>

            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl [overflow-wrap:anywhere]">
              {nyhet.titel}
            </h1>

            <div className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
              <span>
                Av{" "}
                <Link
                  to="/skribent/leon-hallstrom"
                  rel="author"
                  className="whitespace-nowrap text-primary underline underline-offset-2 hover:opacity-80"
                >
                  Leon Hallström
                </Link>
                , grundare av Mobilpoolen
              </span>
              <span aria-hidden>·</span>
              <span>
                Publicerad{" "}
                <time dateTime={nyhet.publiceradIso}>{nyhetsdatum(nyhet.publiceradIso)}</time>
              </span>
              {andrad && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    Uppdaterad{" "}
                    <time dateTime={nyhet.uppdateradIso}>{nyhetsdatum(nyhet.uppdateradIso)}</time>
                  </span>
                </>
              )}
            </div>

            <p className="mb-8 text-[20px] font-medium leading-relaxed">{nyhet.ingress}</p>

            {nyhet.innehall.map((b, i) => (
              <Block key={i} b={b} />
            ))}

            <section className="mt-10 rounded-xl border border-border bg-muted/40 p-5">
              <h2 className="text-[17px] font-semibold">Källor</h2>
              <ul className="mt-3 space-y-2 text-[15px]" style={{ lineHeight: 1.5 }}>
                {nyhet.kallor.map((k) => (
                  <li key={k.url + k.titel}>
                    {k.utgivare}:{" "}
                    <a
                      href={k.url}
                      rel="noopener"
                      className="text-primary underline underline-offset-2"
                    >
                      {k.titel}
                    </a>
                    , {k.datum}
                  </li>
                ))}
              </ul>
            </section>

            {nyhet.relaterat.length > 0 && (
              <section className="mt-8">
                <h2 className="text-[17px] font-semibold">Läs mer hos oss</h2>
                <ul className="mt-3 space-y-2 text-[16px]">
                  {nyhet.relaterat.map((r) => (
                    <li key={r.href}>
                      <Link
                        to={r.href as never}
                        className="text-primary underline underline-offset-2"
                      >
                        {r.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <p className="mt-10 border-t border-border pt-5 text-[14px] text-muted-foreground">
              Ansvarig för innehållet är{" "}
              <Link
                to="/skribent/leon-hallstrom"
                rel="author"
                className="underline hover:no-underline"
              >
                Leon Hallström
              </Link>
              , grundare av Mobilpoolen. Läs{" "}
              <Link to="/sa-tjanar-vi-pengar" className="underline hover:no-underline">
                hur Mobilpoolen tjänar pengar
              </Link>
              .
            </p>
          </article>

          {fler.length > 0 && (
            <section className="mt-16">
              <div className="mb-6 flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold sm:text-2xl">Fler nyheter</h2>
                <Link to="/nyheter" className="text-[15px] font-semibold text-primary">
                  Alla nyheter →
                </Link>
              </div>
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {fler.map((n) => (
                  <li key={n.slug}>
                    <NyhetKort nyhet={n} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <CtaBand
          rubrik="Vad betalar du för mobilen?"
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

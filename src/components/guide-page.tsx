import { useEffect, useRef, useState, type ReactNode } from "react";
import { Ersattningsrad } from "@/components/ersattningsrad";
import { Link } from "@tanstack/react-router";
import { ChevronDown, Clock, Plus } from "lucide-react";
import { SiteNav } from "@/components/site-nav";
import { CtaBand } from "@/components/cta-band";
import { SiteFooter } from "@/components/site-footer";
import { GuideCard } from "@/components/guide-card";
import { PageBreadcrumbs } from "@/components/page-breadcrumbs";
import { bildSrcSet, getGuideCtaImage, getGuideImage } from "@/lib/guide-images";
import { sidansFragor } from "@/lib/faq";
import { storMatt } from "@/lib/bildbank-matt";
import { getGuide, relatedGuides, guidePlaceholderColors } from "@/lib/guides";

type Cta = { label: string; to?: string; hash?: string };
export type TocItem = { id: string; label: string };

/** Guidens knapp är sajtens huvudknapp (btn-cta): Sora, minst 56 px. */
function CtaButton({ cta, className = "" }: { cta: Cta; className?: string }) {
  return (
    <Link
      to={cta.to ?? "/"}
      hash={cta.hash ?? (cta.to ? undefined : "alla")}
      className={`btn-cta text-center ${className}`}
    >
      {cta.label}
    </Link>
  );
}

/**
 * Innehållsförteckning i sidokolumnen på dator, som på Elpoolen. Markerar
 * avsnittet du läser just nu. Markeringen räknas ut i webbläsaren, länkarna
 * serverrenderas. Rubriken står i gemener (Mobilpoolens regel).
 */
export function SidebarToc({ toc }: { toc: TocItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const visible = new Map<string, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        if (visible.size) {
          // Översta rubriken i läsfältet vinner.
          const [id] = [...visible.entries()].sort((a, b) => a[1] - b[1])[0];
          setActive(id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [toc]);

  return (
    <nav
      aria-label="På denna sida"
      className="min-h-0 overflow-y-auto rounded-2xl border border-border bg-surface/70 p-5"
    >
      <div className="text-[14px] font-bold text-foreground">På denna sida</div>
      <ul className="mt-3 border-l border-border">
        {toc.map((t) => {
          const isActive = active === t.id;
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pl-3 text-[14px] leading-snug transition-colors ${
                  isActive
                    ? "border-primary font-semibold text-primary"
                    : "border-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                {t.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarCta({ upplysning = true }: { upplysning?: boolean }) {
  return (
    // Ljust kort med orange topplist, som Elpoolens. Utan intoning: kortet syns
    // direkt i sidokolumnen och ska inte se inaktivt ut.
    <div data-no-reveal className="card-stripe shrink-0 p-6">
      {/* Inte en rubrik: kortet står två gånger i guiden (sidospalt och mobil) och
          ska inte bli två likadana H2 i sidans disposition. */}
      <p className="text-[17px] font-semibold text-foreground">Betalar du för mycket?</p>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Jämför alla mobilabonnemang efter vad de kostar på ett år, med kampanj och startavgift
        inräknade.
      </p>
      <CtaButton cta={{ label: "Jämför abonnemang →" }} className="mt-4 w-full" />
      {upplysning && <Ersattningsrad />}
    </div>
  );
}

export function GuidePage({
  title,
  slug,
  cta,
  toc,
  children,
  breadcrumb = false,
  collapsibleToc = false,
  ctaBand,
  relatedTitle = "Relaterade guider",
}: {
  title: string;
  slug?: string;
  cta: Cta;
  toc?: TocItem[];
  children: ReactNode;
  breadcrumb?: boolean;
  collapsibleToc?: boolean;
  ctaBand?: { title: string; text: string; label: string };
  relatedTitle?: string;
}) {
  const image = slug ? getGuideImage(slug) : undefined;
  const meta = slug ? getGuide(slug) : undefined;
  const related = slug ? relatedGuides(slug, 3) : [];
  const colors = guidePlaceholderColors(slug ?? title);
  const hjalte = image ? bildSrcSet({ ...image, jpg: image.url }) : null;
  // Korten visar respektive guides egen bild, så CTA-bandet får räkna med dem.
  const kortensBilder = related.flatMap((g) => getGuideImage(g.slug)?.nyckel ?? []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <div className="pt-10 pb-[64px] lg:pt-16 lg:pb-[96px]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_300px] gap-10 lg:gap-14 items-start">
              <article
                className="min-w-0 text-foreground"
                style={{ maxWidth: 720, lineHeight: 1.75 }}
              >
                {/* Samma steg som guideBreadcrumb i JSON-LD. */}
                {breadcrumb && (
                  <PageBreadcrumbs
                    trail={[
                      { name: "Start", path: "/" },
                      { name: "Guider och råd", path: "/guider" },
                      { name: breadcrumbLabel(title), path: slug ? `/guider/${slug}` : "" },
                    ]}
                  />
                )}
                <div
                  className="mb-8 overflow-hidden rounded-2xl border border-border"
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {image && hjalte ? (
                    <picture>
                      {/* Artikelspalten är högst 720px bred, på mobil hela skärmen. */}
                      <source
                        srcSet={hjalte.webp}
                        sizes="(min-width: 768px) 720px, 100vw"
                        type="image/webp"
                      />
                      <img
                        src={image.url}
                        srcSet={hjalte.jpg}
                        {...storMatt(image.nyckel)}
                        sizes="(min-width: 768px) 720px, 100vw"
                        alt={image.alt}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </picture>
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                      }}
                      aria-hidden
                    />
                  )}
                </div>

                {/* Kategorin står i bylinen under rubriken, inte som etikett ovanför (CLAUDE.md). */}
                <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight mb-3 [overflow-wrap:anywhere]">
                  {title}
                </h1>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground mb-10">
                  <span>
                    Av{" "}
                    <Link
                      to="/skribent/leon-hallstrom"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      Leon Hallström
                    </Link>
                    , grundare av Mobilpoolen
                  </span>
                  <span aria-hidden>·</span>
                  <span>
                    <Link
                      to="/sa-jamfor-vi"
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      Så jämför vi
                    </Link>
                  </span>
                  {meta?.published && (
                    <>
                      <span aria-hidden>·</span>
                      <span>Publicerad {meta.published}</span>
                    </>
                  )}
                  {meta?.updated && (
                    <>
                      <span aria-hidden>·</span>
                      <span>Uppdaterad {meta.updated}</span>
                    </>
                  )}
                  {meta?.readingTime && (
                    <>
                      <span aria-hidden>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" aria-hidden />
                        {meta.readingTime}
                      </span>
                    </>
                  )}
                  {meta?.category && (
                    <>
                      <span aria-hidden>·</span>
                      <span>{meta.category}</span>
                    </>
                  )}
                </div>

                {/* I texten bara under lg. På dator ligger förteckningen i sidokolumnen. */}
                {toc && toc.length > 1 && (
                  <nav
                    aria-label="På denna sida"
                    className="mb-10 rounded-xl border border-border bg-surface p-5 lg:hidden"
                  >
                    {collapsibleToc ? (
                      <details className="group">
                        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[14px] font-bold text-foreground [&::-webkit-details-marker]:hidden">
                          På denna sida
                          <ChevronDown
                            className="h-4 w-4 transition-transform duration-300 group-open:rotate-180 motion-reduce:transition-none"
                            aria-hidden
                          />
                        </summary>
                        <ul className="mt-1">
                          {toc.map((t) => (
                            <li key={t.id}>
                              <a
                                href={`#${t.id}`}
                                className="inline-flex min-h-11 items-center text-[15px] text-primary hover:underline"
                              >
                                {t.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                    <div className={collapsibleToc ? "hidden" : ""}>
                      <div className="text-[14px] font-bold text-foreground">På denna sida</div>
                      <ul className="mt-3 space-y-2">
                        {toc.map((t) => (
                          <li key={t.id}>
                            <a
                              href={`#${t.id}`}
                              className="text-[15px] text-primary hover:underline"
                            >
                              {t.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </nav>
                )}

                <div className="text-[18px]">{children}</div>

                <div className="mt-12 pt-8 border-t border-border">
                  <CtaButton cta={cta} />
                  <Ersattningsrad />
                </div>

                {/* På mobil ligger kortet direkt under knappen ovan. Raden där
                    räcker, två likadana inom en skärmhöjd blir brus. */}
                <div className="lg:hidden mt-8">
                  <SidebarCta upplysning={false} />
                </div>
              </article>

              {/* Klistrad sidokolumn som på Elpoolen: förteckning och knapp. */}
              <aside className="hidden lg:flex lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] flex-col gap-6">
                {toc && toc.length > 1 && <SidebarToc toc={toc} />}
                <SidebarCta />
              </aside>
            </div>

            {related.length > 0 && (
              <section className="mt-20">
                <h2 className="text-xl sm:text-2xl font-semibold mb-6">{relatedTitle}</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {related.map((g) => (
                    <GuideCard key={g.slug} guide={g} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <CtaBand
          rubrik={ctaBand?.title ?? "Hitta ett billigare mobilabonnemang"}
          ingress={
            ctaBand?.text ??
            "Se alla operatörers priser efter kampanjen, sorterade efter vad du betalar på ett år."
          }
          knapptext={ctaBand?.label ?? "Jämför mobilabonnemang →"}
          hash="alla"
          bildnyckel={getGuideCtaImage(slug, kortensBilder)}
        />
      </main>
      <SiteFooter />
    </div>
  );
}

export function H2({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h2 id={id} className="text-xl sm:text-2xl font-semibold mt-12 mb-4 scroll-mt-24">
      {children}
    </h2>
  );
}
export function H3({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <h3 id={id} className="text-lg font-semibold mt-8 mb-3 scroll-mt-24">
      {children}
    </h3>
  );
}
export function P({ children }: { children: ReactNode }) {
  return <p className="mb-5 text-[18px]">{children}</p>;
}

/** Intern länk i brödtext. Fungerar även mot sidor som byggs senare. */
export function A({ href, children }: { href: string; children: ReactNode }) {
  const [path, hash] = href.split("#");
  return (
    <Link
      to={(path || "/") as never}
      hash={hash}
      className="text-primary underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </Link>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="mb-5 space-y-2 pl-5 list-disc text-[18px]">{children}</ul>;
}

/** Visas i guider där brödtexten inte är skriven än. */
export function GuideDraft({ children }: { children?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted/40 p-6">
      <p className="text-[15px] text-muted-foreground">
        {children ?? "Innehållet till den här guiden är på väg. Vi fyller på inom kort."}
      </p>
    </div>
  );
}

function breadcrumbLabel(title: string) {
  return title.split("?")[0]!.split(",")[0]!.trim();
}

export function OL({ children }: { children: ReactNode }) {
  return <ol className="mb-5 space-y-2 pl-5 list-decimal text-[18px]">{children}</ol>;
}

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mb-6 rounded-xl border border-border bg-muted/50 p-5 text-[17px] font-medium text-foreground">
      {children}
    </div>
  );
}

/**
 * En mall att kopiera, till exempel en uppsägningstext. Texten står som vanlig
 * text i HTML:en, så den går att läsa och markera även utan JavaScript.
 * Knappen kopierar exakt samma sträng som visas.
 */
export function CopyTemplate({ title, text }: { title: string; text: string }) {
  // Knappen visas först när sidan har JavaScript och webbläsaren har ett
  // urklipp att skriva till. Utan det finns bara texten, som går att markera.
  const [kanKopiera, setKanKopiera] = useState(false);
  const [status, setStatus] = useState<"" | "kopierad" | "fel">("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    setKanKopiera(typeof navigator !== "undefined" && !!navigator.clipboard?.writeText);
    return () => window.clearTimeout(timer.current);
  }, []);
  async function kopiera() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("kopierad");
    } catch {
      setStatus("fel");
    }
    timer.current = window.setTimeout(() => setStatus(""), 4000);
  }
  return (
    <figure className="mb-6 rounded-xl border border-border bg-surface">
      <figcaption className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <span className="text-[15px] font-semibold text-foreground">{title}</span>
        {kanKopiera ? (
          <button
            type="button"
            onClick={kopiera}
            aria-label={`Kopiera texten: ${title}`}
            className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-[14px] font-semibold text-primary hover:bg-muted/60"
          >
            {status === "kopierad" ? "Kopierad" : "Kopiera texten"}
          </button>
        ) : null}
      </figcaption>
      <p className="whitespace-pre-line px-5 py-4 text-[16px] leading-relaxed text-foreground/90">
        {text}
      </p>
      <p role="status" className="px-5 pb-3 text-[14px] text-foreground/65 empty:hidden">
        {status === "kopierad"
          ? "Texten är kopierad. Klistra in den i ditt mejl eller dokument."
          : status === "fel"
            ? "Det gick inte att kopiera. Markera texten och kopiera den själv."
            : ""}
      </p>
    </figure>
  );
}

/**
 * Tabell i guiderna, som på Elpoolen. Under 640 px blir varje rad ett litet
 * kort: första cellen som rubrik och övriga celler som "Etikett: värde", så
 * att inget kapas eller behöver rullas på mobil. Etiketten kommer från
 * data-label, rubrikraden finns kvar för skärmläsare.
 *
 * `brytForsta` låter första kolumnen radbrytas. Används när den bär bolag och
 * paket i samma cell, så att en bred pristabell ryms i artikelspalten.
 */
export function GuideTable({
  head,
  rows,
  brytForsta = false,
}: {
  head: string[];
  rows: string[][];
  brytForsta?: boolean;
}) {
  // Tabeller med fem kolumner eller fler får mindre text och luft, så att de ryms i
  // guidens textspalt utan att sista kolumnen klipps.
  const tat = head.length >= 5;
  const px = tat ? "px-3" : "px-4";
  return (
    <div className="mb-6 overflow-x-auto rounded-xl border border-border bg-surface">
      <table
        className={`w-full border-collapse ${tat ? "text-[14px]" : "text-[15px]"} max-sm:block`}
      >
        <thead className="max-sm:sr-only">
          <tr className="bg-muted/60 text-left">
            {head.map((h) => (
              <th key={h} className={`${px} py-3 align-bottom font-semibold text-foreground`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {rows.map((r, i) => (
            <tr
              key={i}
              className="border-t border-border max-sm:block max-sm:px-4 max-sm:py-3 max-sm:first:border-t-0"
            >
              {r.map((c, j) => (
                <td
                  key={j}
                  data-label={head[j] ?? ""}
                  className={
                    j === 0
                      ? `${px} py-3 align-top text-muted-foreground ${brytForsta ? "min-w-[170px]" : "whitespace-nowrap"} max-sm:block max-sm:p-0 max-sm:pb-1 max-sm:font-semibold max-sm:text-foreground max-sm:whitespace-normal`
                      : // Mobil: etiketten på egen rad ovanför värdet, vänsterställt. Långa
                        // värden blev svårlästa högerställda bredvid etiketten.
                        `${px} py-3 align-top text-muted-foreground max-sm:block max-sm:p-0 max-sm:py-1 max-sm:text-[14px] max-sm:text-foreground/80 max-sm:before:block max-sm:before:text-[12.5px] max-sm:before:font-medium max-sm:before:text-foreground/65 max-sm:before:content-[attr(data-label)]`
                  }
                >
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * FAQ på en undersida: högst tre frågor och en länk till de allmänna frågorna.
 *
 * Komponenten kapar listan som skyddsnät, men sidan måste ändå skicka in en
 * lista som gått genom sidansFragor, eftersom faqJsonLd ska byggas av exakt
 * samma frågor som visas här. `kalla` visas under svaret. `antal` skickas
 * bara av sidor som själva valt ett annat antal i sidansFragor.
 */
/**
 * Visar de frågor sidan skickar in. `items` ska vara samma lista som går in i
 * faqJsonLd, så som standard visas alla. `antal` behövs bara för att visa färre.
 */
export function FaqAccordion({
  items,
  antal,
}: {
  items: readonly { q: string; a: ReactNode; kalla?: string }[];
  antal?: number;
}) {
  return (
    <div className="mb-6">
      <div className="space-y-3">
        {sidansFragor(items, antal ?? items.length).map((it) => (
          <details key={it.q} className="group rounded-xl border border-border bg-surface p-5">
            {/* Plustecknet vrids till ett kryss när frågan är öppen, som på Elpoolen. */}
            <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-4 text-[17px] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              {it.q}
              {/* Ikon, inte ett tecken, så att frågans text i HTML:en förblir ren. */}
              <Plus
                aria-hidden
                className="mt-1 h-5 w-5 shrink-0 text-primary transition-transform group-open:rotate-45 motion-reduce:transition-none"
              />
            </summary>
            <p className="mt-3 text-[16px] text-muted-foreground">{it.a}</p>
            {it.kalla ? (
              <p className="mt-2 text-[14px] text-muted-foreground">{`Källa: ${it.kalla}.`}</p>
            ) : null}
          </details>
        ))}
      </div>
      <Link
        to="/faq"
        className="mt-5 inline-flex min-h-11 items-center text-[15px] font-semibold text-primary underline underline-offset-2"
      >
        Fler frågor och svar →
      </Link>
    </div>
  );
}

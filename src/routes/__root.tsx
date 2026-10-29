import { SOCIAL_PROFILES } from "@/lib/seo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { AutoReveal } from "../components/auto-reveal";
import ScrollToTop from "@/components/scroll-to-top";
import { ChattKnapp } from "@/components/chatt/chatt-knapp";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const OG_IMAGE_URL = "https://mobilpoolen.se/og-image.png";

function NotFoundComponent() {
  const vidare =
    "inline-flex min-h-11 items-center text-primary underline underline-offset-4 hover:text-primary/80";
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNav />
      <main className="flex flex-1 items-center px-4 py-16 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="font-bold text-foreground text-[clamp(32px,5vw,44px)] leading-[1.15]">
            Sidan finns inte
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/90">
            Länken kan vara gammal, eller så har sidan flyttat (felkod 404). Letar du efter ett billigare mobilabonnemang
            kan du jämföra operatörernas priser direkt.
          </p>
          <div className="mt-7">
            <a href="/#alla" className="btn-cta">
              Jämför mobilabonnemang
            </a>
          </div>
          <nav
            aria-label="Vägar vidare"
            className="mt-6 flex flex-col items-start gap-1 text-sm font-semibold"
          >
            <Link to="/" className={vidare}>
              Till startsidan
            </Link>
            <Link to="/guider" className={vidare}>
              Guider och råd
            </Link>
            <Link to="/faq" className={vidare}>
              Alla vanliga frågor
            </Link>
            <Link to="/kontakt" className={vidare}>
              Kontakta oss
            </Link>
          </nav>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Något gick fel</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sidan kunde inte laddas. Försök igen om en stund eller gå till startsidan.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Försök igen
          </button>
          <a
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Till startsidan
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => {
    // En okänd URL ger globalNotFound på rotmatchningen, inte status "notFound".
    const sidanFinnsInte = matches.some(
      (match) =>
        (match as { _notFound?: boolean })._notFound ||
        (match as { globalNotFound?: boolean }).globalNotFound ||
        match.status === "notFound",
    );
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          // 404 får sin titel här i stället för ett eget <title> i komponenten,
          // så att sidan bara får ett <title>-element.
          title: sidanFinnsInte
            ? "Sidan finns inte | Mobilpoolen"
            : "Mobilpoolen – Jämför mobilabonnemang och betala mindre",
        },
        // Sajten är indexerbar. Bara 404-sidan säger noindex, utöver sidor som
        // själva sätter pageHead({ noindex: true }).
        ...(sidanFinnsInte ? [{ name: "robots", content: "noindex, nofollow" }] : []),
        {
          name: "description",
          content:
            "Mobilpoolen jämför mobilabonnemang för privatpersoner och företag. Pris efter kampanjen, bindningstid och nät, med källa och datum.",
        },
        { name: "author", content: "Mobilpoolen" },
        { name: "theme-color", content: "#3B28CC" },
        { property: "og:title", content: "Mobilpoolen – Jämför mobilabonnemang" },
        {
          property: "og:description",
          content:
            "Mobilpoolen jämför mobilabonnemang för privatpersoner och företag. Pris efter kampanjen, bindningstid och nät, med källa och datum.",
        },
        { property: "og:url", content: "https://mobilpoolen.se" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "sv_SE" },
        { property: "og:site_name", content: "Mobilpoolen" },
        { property: "og:image", content: OG_IMAGE_URL },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Mobilpoolen – Jämför mobilabonnemang" },
        {
          name: "twitter:description",
          content:
            "Mobilpoolen jämför mobilabonnemang för privatpersoner och företag. Pris efter kampanjen, bindningstid och nät, med källa och datum.",
        },
        { name: "twitter:image", content: OG_IMAGE_URL },
      ],
      scripts: [
        {
          // Körs före hydration så webbläsaren inte återställer gammal scrollposition.
          id: "scroll-restoration",
          children:
            "if('scrollRestoration' in window.history){window.history.scrollRestoration='manual';}",
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://mobilpoolen.se/#organization",
                name: "Mobilpoolen",
                legalName: "PMG Poolen Media Group AB",
                taxID: "559602-5287",
                url: "https://mobilpoolen.se",
                logo: {
                  "@type": "ImageObject",
                  url: "https://mobilpoolen.se/icon-512.png",
                  width: 512,
                  height: 512,
                },
                image: OG_IMAGE_URL,
                description:
                  "Mobilpoolen jämför mobilabonnemang: operatörernas publicerade priser och villkor, med källa och datum.",
                email: "info@mobilpoolen.se",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Valfrid Palmgrens gata 12",
                  postalCode: "113 69",
                  addressLocality: "Stockholm",
                  addressCountry: "SE",
                },
                areaServed: "SE",
                ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
              },
              {
                "@type": "WebSite",
                "@id": "https://mobilpoolen.se/#website",
                name: "Mobilpoolen",
                url: "https://mobilpoolen.se",
                inLanguage: "sv-SE",
                publisher: { "@id": "https://mobilpoolen.se/#organization" },
              },
            ],
          }),
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico?v=2", sizes: "16x16 32x32 48x48" },
        { rel: "icon", href: "/favicon-16.png?v=2", type: "image/png", sizes: "16x16" },
        { rel: "icon", href: "/favicon-32.png?v=2", type: "image/png", sizes: "32x32" },
        { rel: "icon", href: "/favicon-48.png?v=2", type: "image/png", sizes: "48x48" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2", sizes: "180x180" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isSitemap = pathname === "/sitemap.xml";

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTop />
      {isSitemap ? (
        <Outlet />
      ) : (
        <>
          <AutoReveal />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <ChattKnapp />
        </>
      )}
    </QueryClientProvider>
  );
}

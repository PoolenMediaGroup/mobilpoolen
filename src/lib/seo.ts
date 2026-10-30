/**
 * Central SEO-hjälpare. Varje sida skickar in title, description och canonical.
 * Hjälparen bygger absolut canonical + og:url (utan trailing slash, utan query),
 * och håller og:title/twitter:title identiska.
 */

export const SITE_URL = "https://mobilpoolen.se";

type Tag = Record<string, unknown>;

/** Gör en absolut URL utan query, hash eller trailing slash. */
export function absoluteUrl(pathOrUrl: string): string {
  const raw = pathOrUrl.startsWith("http") ? pathOrUrl.replace(/^https?:\/\/[^/]+/, "") : pathOrUrl;
  const path = raw.split("?")[0].split("#")[0];
  const clean = path.replace(/\/+$/, "");
  if (!clean || clean === "/") return SITE_URL;
  return `${SITE_URL}${clean.startsWith("/") ? clean : `/${clean}`}`;
}

export type PageSeo = {
  /** Fullständig <title> för sidan. */
  title: string;
  description: string;
  /** Sökväg ("/om-oss") eller absolut URL. */
  canonical: string;
  /** Används för og:title och twitter:title. Standard: title. */
  socialTitle?: string;
  /** Används för og:description och twitter:description. Standard: description. */
  socialDescription?: string;
  ogType?: "website" | "article";
  noindex?: boolean;
  /** Extra meta-taggar utöver standarduppsättningen. */
  meta?: Tag[];
  links?: Tag[];
  scripts?: Tag[];
};

export function pageHead(seo: PageSeo): { meta: Tag[]; links: Tag[]; scripts?: Tag[] } {
  const url = absoluteUrl(seo.canonical);
  const socialTitle = seo.socialTitle ?? seo.title.replace(/ \| Mobilpoolen$/, "");
  const socialDescription = seo.socialDescription ?? seo.description;

  // Google kapar titlar kring 60 tecken. Ryms inte varumärket tas det bort,
  // så att sökordet och det sidan lovar syns i stället för "| Mobilp…".
  const title =
    seo.title.length > 60 && seo.title.endsWith(" | Mobilpoolen")
      ? seo.title.slice(0, -" | Mobilpoolen".length)
      : seo.title;

  const meta: Tag[] = [
    { title },
    { name: "description", content: seo.description },
    { property: "og:title", content: socialTitle },
    { name: "twitter:title", content: socialTitle },
    { property: "og:description", content: socialDescription },
    { name: "twitter:description", content: socialDescription },
    { property: "og:type", content: seo.ogType ?? "website" },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    ...(seo.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
    ...(seo.meta ?? []),
  ];

  const links: Tag[] = [{ rel: "canonical", href: url }, ...(seo.links ?? [])];

  return seo.scripts ? { meta, links, scripts: seo.scripts } : { meta, links };
}

/** Officiella sociala konton för Mobilpoolen (används som sameAs i Organization). */
export const SOCIAL_PROFILES: string[] = [];

export function jsonLdScript(data: unknown): Tag {
  return { type: "application/ld+json", children: JSON.stringify(data) };
}

/** Article-schema för en guidesida. */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  publishedIso: string;
  updatedIso: string;
  image?: string;
}): Tag {
  const url = absoluteUrl(input.path);
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    mainEntityOfPage: url,
    datePublished: input.publishedIso,
    dateModified: input.updatedIso,
    inLanguage: "sv-SE",
    author: {
      "@type": "Person",
      "@id": "https://mobilpoolen.se/om-oss#leon",
      name: "Leon Hallström",
      jobTitle: "Grundare",
      url: "https://mobilpoolen.se/skribent/leon-hallstrom",
    },
    publisher: { "@id": "https://mobilpoolen.se/#organization" },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
  });
}

/**
 * FAQPage byggd från samma data som visas i UI:t. En källrad som visas under
 * svaret följer med i svarstexten.
 */
export function faqJsonLd(items: readonly { q: string; a: string; kalla?: string }[]): Tag {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.kalla ? `${item.a} Källa: ${item.kalla}.` : item.a,
      },
    })),
  });
}

/** BreadcrumbList. Sista steget ska peka på sidan själv. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]): Tag {
  return jsonLdScript({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: absoluteUrl(step.path),
    })),
  });
}

/** Brödsmulor för en guidesida: Start > Guider och råd > guiden. */
export function guideBreadcrumb(name: string, path: string): Tag {
  return breadcrumbJsonLd([
    { name: "Start", path: "/" },
    { name: "Guider och råd", path: "/guider" },
    { name, path },
  ]);
}

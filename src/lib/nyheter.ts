// Nyhetsflödet: registret över alla nyheter på /nyheter.
//
// En nyhet är kort (150 till 400 ord), skriven med egna ord och bygger bara på
// källor som går att länka till, i första hand PTS, Konsumentverket, regeringen
// och riksdagen, EU-kommissionen, operatörernas egna pressmeddelanden och vår
// egen prisdata. Varje källa har ett datum.
//
// Lägg till en nyhet genom att lägga en post i NYHETER_OSORTERADE. Den blir då
// synlig på /nyheter, /nyheter/<slug>, i sitemap.xml och i rss.xml.
// Lägg också en rad under "Nyheter" i public/llms.txt.
//
// Nyhetsroboten (schemalagd uppgift, se docs/nyhetsroboten.md) skriver nyheter
// enligt samma regler. Ändra reglerna här och i docs/nyhetsroboten.md samtidigt.
//
// Så länge registret är tomt är /nyheter noindex och står varken i sitemap,
// meny eller llms.txt. Den första nyheten slår på allt automatiskt.
//
// Länkar i brödtexten skrivs [text](/sökväg). Interna sökvägar blir Link,
// adresser som börjar med https:// blir vanliga länkar.
//
// Datumen:
// - handelseIso är dagen källan publicerades. Listan sorteras på den.
// - publiceradIso och uppdateradIso är när Mobilpoolen publicerade och senast
//   ändrade texten. De går in i NewsArticle, sitemap och RSS.

import type { Bildnyckel } from "@/lib/bildbank";

export type NyhetBlock =
  | { typ: "p"; text: string }
  | { typ: "h2"; text: string; id?: string }
  | { typ: "ul"; punkter: string[] };

export type NyhetKalla = {
  /** Vem som publicerat, till exempel "PTS" eller "Telia". */
  utgivare: string;
  /** Titel på dokumentet eller sidan. */
  titel: string;
  url: string;
  /** När källan publicerades eller uppdaterades, i klartext. */
  datum: string;
};

export const NYHET_KATEGORIER = [
  "Priser och villkor",
  "Operatörer",
  "Nät och täckning",
  "Regler och konsument",
] as const;
export type NyhetKategori = (typeof NYHET_KATEGORIER)[number];

export type Nyhet = {
  slug: string;
  /** Rubriken på sidan (H1). */
  titel: string;
  /** Kort rubrik till <title>. Högst 46 tecken, så att " | Mobilpoolen" ryms inom 60. */
  seoTitel: string;
  /** Ingressen. Visas överst och används som meta description, högst 155 tecken. */
  ingress: string;
  /** Avsändaren som visas i listan bredvid datumet, till exempel "PTS". */
  avsandare: string;
  kategori: NyhetKategori;
  /**
   * Foto ur bildbanken (src/lib/bildbank.ts). Saknas det visas bara nyckeltalet
   * på en indigo bakgrund. Samma bild ska inte användas på två nyheter i rad.
   */
  bild?: Bildnyckel;
  /** Den viktigaste siffran i nyheten, visas stort på kortet. */
  nyckeltal: { varde: string; text: string };
  handelseIso: string;
  publiceradIso: string;
  uppdateradIso: string;
  innehall: NyhetBlock[];
  kallor: NyhetKalla[];
  /** Våra egna sidor som hör ihop med nyheten, 2 till 4 stycken. */
  relaterat: { href: string; label: string }[];
};

const NYHETER_OSORTERADE: Nyhet[] = [];

/** Alla nyheter, nyast först (efter dagen källan publicerades). */
export const NYHETER: Nyhet[] = [...NYHETER_OSORTERADE].sort(
  (a, b) =>
    b.handelseIso.localeCompare(a.handelseIso) || b.publiceradIso.localeCompare(a.publiceradIso),
);

/** Sant när det finns minst en nyhet. Styr sitemap, meny och noindex på /nyheter. */
export const HAR_NYHETER = NYHETER.length > 0;

export function getNyhet(slug: string): Nyhet | undefined {
  return NYHETER.find((n) => n.slug === slug);
}

/** Senaste ändringen i flödet. Används som lastmod för /nyheter. */
export const NYHETER_SENAST_ANDRAD: string =
  NYHETER.map((n) => n.uppdateradIso)
    .sort()
    .at(-1) ?? "2026-11-02";

/** "2026-10-14" blir "14 oktober 2026". */
export function nyhetsdatum(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  });
}

export type Textdel = { text: string; href?: string };

/** Delar upp "[text](/sökväg)" i text och länkar. */
export function textdelar(text: string): Textdel[] {
  // Tusentalsavgränsare som hårt mellanslag, så att "1 081 kr" inte bryts.
  text = text.replace(/(\d) (\d{3})(?!\d)/g, "$1 $2");
  const delar: Textdel[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let senast = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > senast) delar.push({ text: text.slice(senast, start) });
    delar.push({ text: m[1]!, href: m[2]! });
    senast = start + m[0].length;
  }
  if (senast < text.length) delar.push({ text: text.slice(senast) });
  return delar;
}

/** Texten utan länkmarkering, för RSS och räkning av ord. */
export function rentext(text: string): string {
  return textdelar(text)
    .map((d) => d.text)
    .join("");
}

/** Bakgrund per kategori för nyckeltalskortet. Alla i sajtens indigoskala. */
export const KATEGORI_BAKGRUND: Record<NyhetKategori, string> = {
  "Priser och villkor": "linear-gradient(135deg, #3b28cc 0%, #2a1c94 100%)",
  Operatörer: "linear-gradient(135deg, #2a1f6e 0%, #16133a 100%)",
  "Nät och täckning": "linear-gradient(135deg, #4a3fb0 0%, #2b2470 100%)",
  "Regler och konsument": "linear-gradient(135deg, #241d5c 0%, #110e2c 100%)",
};

/**
 * Operatörernas logotyper i public/logos, hämtade från operatörernas egna
 * webbplatser (1 november 2026). Måtten är bildens egna och används för att
 * reservera rätt plats innan bilden laddats. Operatörer utan logotyp här
 * (t.ex. katshing och Halebop) visas med initialer.
 *
 * Telenor och Tre visar bara sin symbol, så som de gör i sina egna sidhuvuden.
 * Lingon och Tellus har vit text i originalet; texten är mörkad för vit bakgrund.
 */
export type Logotyp = { src: string; w: number; h: number };

const L: Record<string, Logotyp> = {
  telia: { src: "/logos/telia.svg", w: 82, h: 32 },
  tele2: { src: "/logos/tele2.svg", w: 401, h: 150 },
  telenor: { src: "/logos/telenor.svg", w: 140, h: 130 },
  tre: { src: "/logos/tre.svg", w: 48, h: 48 },
  comviq: { src: "/logos/comviq.svg", w: 104, h: 24 },
  hallon: { src: "/logos/hallon.svg", w: 241, h: 48 },
  vimla: { src: "/logos/vimla.svg", w: 255, h: 74 },
  fello: { src: "/logos/fello.svg", w: 520, h: 183 },
  mybeat: { src: "/logos/mybeat.svg", w: 142, h: 40 },
  telavox: { src: "/logos/telavox.svg", w: 300, h: 50 },
  lycamobile: { src: "/logos/lycamobile.webp", w: 314, h: 123 },
  fibio: { src: "/logos/fibio.webp", w: 289, h: 98 },
  chilimobil: { src: "/logos/chilimobil.webp", w: 249, h: 160 },
  lingon: { src: "/logos/lingon.webp", w: 480, h: 126 },
  tellus: { src: "/logos/tellus.webp", w: 121, h: 75 },
};

/** Namn som de står i datan, till nyckeln ovan. */
const NAMN: Record<string, string> = {
  telia: "telia",
  tele2: "tele2",
  telenor: "telenor",
  tre: "tre",
  comviq: "comviq",
  hallon: "hallon",
  vimla: "vimla",
  fello: "fello",
  "my beat": "mybeat",
  mybeat: "mybeat",
  telavox: "telavox",
  "lyca mobile": "lycamobile",
  lycamobile: "lycamobile",
  fibio: "fibio",
  chilimobil: "chilimobil",
  "lingon mobil": "lingon",
  lingon: "lingon",
  "tellus mobil": "tellus",
  tellus: "tellus",
};

/** Logotyp för en operatör, sökt på slug eller namn. Null om vi saknar den. */
export function logotyp(slugEllerNamn: string): Logotyp | null {
  const k = slugEllerNamn.trim().toLowerCase();
  return L[k] ?? L[NAMN[k] ?? ""] ?? null;
}

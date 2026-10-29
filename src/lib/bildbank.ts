/**
 * Mobilpoolens bildbank.
 *
 * Alla redaktionella bilder på sajten kommer härifrån. Varje bild finns i
 * `src/assets/bildbank/` i fyra filer:
 *   <namn>.jpg / <namn>.webp          stor, max 1600px bred
 *   <namn>-800.jpg / <namn>-800.webp  liten, 800px bred (kort och listor)
 *
 * Lägga till en bild:
 *   1. Lägg in de fyra filerna i src/assets/bildbank/
 *      (stor: max 1600px bred och under ~280 kB)
 *   2. Lägg till en rad i BILDER nedan med alt-text, kategori och taggar,
 *      och fotograf och källa (t.ex. "Pixabay 315874") när de är kända
 *   3. Lägg till måtten i src/lib/bildbank-matt.ts
 *
 * Använda en bild:
 *   const b = bild("villa-tradgard");
 *   <picture>
 *     <source srcSet={b.webp} type="image/webp" />
 *     <img src={b.jpg} alt={b.alt} loading="lazy" />
 *   </picture>
 *
 * I ett kort eller en lista: använd b.thumbWebp och b.thumb i stället.
 *
 * Alt-texten hör till bilden, inte till sidan. Beskriver den bara dekor kan
 * du sätta alt="" på plats, men skriv aldrig om den till en nyckelordsräcka.
 */

const jpgFiler = import.meta.glob("../assets/bildbank/*.jpg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const webpFiler = import.meta.glob("../assets/bildbank/*.webp", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function url(files: Record<string, string>, namn: string, ext: string): string {
  const träff = files[`../assets/bildbank/${namn}.${ext}`];
  if (!träff) {
    throw new Error(`Bildbanken saknar filen ${namn}.${ext}. Lägg den i src/assets/bildbank/.`);
  }
  return träff;
}

export type Kategori =
  | "bostad"
  | "fritidshus"
  | "familj"
  | "inbrott"
  | "kamera"
  | "utrustning"
  | "brand"
  | "lokal"
  | "ovrigt";

type Post = {
  /** Alt-text på svenska. Beskriver vad som syns, inte vad sidan handlar om. */
  alt: string;
  kategori: Kategori;
  /** Vad bilden passar till. Används när man letar bild till en ny sida. */
  taggar: string[];
  /** Sant för bilder som inte bör användas som huvudbild på en larmsida. */
  sparsam?: boolean;
  /** Fotografens namn hos källan. Ifyllt för bilder som lagts in från Pixabay. */
  fotograf?: string;
  /** Var bilden kommer ifrån, t.ex. "Pixabay 315874" (Pixabay Content License). */
  kalla?: string;
};

export const BILDER = {
  "mobil-hemapp-villa": {
    alt: "Händer som styr hemmet i en mobil framför en modern villa",
    kategori: "bostad",
    taggar: ["app", "mobil", "smart hem", "villa", "fjärrstyrning"],
    fotograf: "geralt",
    kalla: "Pixabay 3395994",
  },
  "kvinna-soffa-mobil": {
    alt: "Leende kvinna som ligger i soffan hemma och tittar i mobilen",
    kategori: "familj",
    taggar: ["hemma", "app", "mobil", "trygghet", "lägenhet", "kvadratisk"],
    fotograf: "Feygrace",
    kalla: "Pixabay 10383559",
  },
  "stuga-akerkant-vinter": {
    alt: "Liten stuga vid en åkerkant en vinterdag",
    kategori: "fritidshus",
    taggar: ["fritidshus", "stuga", "vinter", "obebott", "tomt hus"],
  },
  "sjobodar-smogen": {
    alt: "Färgglada sjöbodar och småbåtar i en hamn på västkusten",
    kategori: "fritidshus",
    taggar: ["sjöbod", "hamn", "skärgård", "sommarstuga", "båt"],
  },
  "stuga-natt-sno": {
    alt: "Upplyst stuga bland snötäckta granar en vinterkväll",
    kategori: "fritidshus",
    taggar: ["fritidshus", "stuga", "vinter", "natt", "fjäll"],
    fotograf: "JerzyGórecki",
    kalla: "Pixabay 3373432",
  },
  "familj-hostpromenad": {
    alt: "Ett par som går hand i hand med sin hund på en skogsstig full av höstlöv",
    kategori: "familj",
    taggar: ["familj", "promenad", "bortrest", "höst", "avslutande cta"],
    fotograf: "jatocreate",
    kalla: "Pixabay 2366129",
  },
  "pappa-barn-promenad": {
    alt: "Vuxen som håller ett litet barn i handen på en grusväg",
    kategori: "familj",
    taggar: ["barnfamilj", "trygghet", "hemma", "promenad"],
    kalla: "Pixabay 1853657",
  },
  "barn-pa-trappa": {
    alt: "Två små barn som sitter på en trappa utanför en ytterdörr",
    kategori: "familj",
    taggar: ["barn", "ytterdörr", "entré", "hemma"],
  },
  "barn-cyklar-alle": {
    alt: "Två barn som cyklar på en allé i motljus",
    kategori: "familj",
    taggar: ["barn", "hemkomst", "ensam hemma", "eftermiddag"],
  },
  "aldre-par-parkbank": {
    alt: "Äldre par som sitter tillsammans på en parkbänk",
    kategori: "familj",
    taggar: ["seniorer", "trygghetslarm", "pensionär"],
  },
  "vanner-middag-utomhus": {
    alt: "Vänner som äter middag tillsammans utomhus",
    kategori: "familj",
    taggar: ["umgänge", "hemma", "sommar", "livsstil"],
  },
  "aldre-kvinna-fatolj": {
    alt: "Äldre kvinna som sitter i en fåtölj och bläddrar i ett fotoalbum",
    kategori: "familj",
    taggar: ["seniorer", "äldre", "ensamboende", "hemma", "trygghetslarm"],
    fotograf: "geralt",
    kalla: "Pixabay 10215679",
  },
  "kontor-motesrum": {
    alt: "Tomt mötesrum med vita bord, svarta stolar och whiteboardtavlor",
    kategori: "lokal",
    taggar: ["företag", "kontor", "arbetsplats", "larmklass"],
    fotograf: "Pexels",
    kalla: "Pixabay 2181980",
  },
  "kundvagnar-rad": {
    alt: "Kundvagnar i stål som står på rad utanför en butik",
    kategori: "lokal",
    taggar: ["butik", "handla", "köpa"],
    fotograf: "652234",
    kalla: "Pixabay 1275480",
  },
  "par-hemma-morgon": {
    alt: "Två personer hemma på morgonen med en kaffekopp",
    kategori: "ovrigt",
    taggar: ["hemma", "morgon", "livsstil"],
    sparsam: true,
  },
  "stromavbrott-ljus": {
    alt: "Tända stearinljus och en digital klocka i ett mörkt rum",
    kategori: "ovrigt",
    taggar: ["strömavbrott", "mörker", "el", "batteri"],
    fotograf: "Boyan_Chen",
    kalla: "Pixabay 3194287",
  },
  "flyttkartong-nyckel": {
    alt: "Gammal nyckel knuten med snöre runt en packad flyttkartong",
    kategori: "ovrigt",
    taggar: ["flytt", "nyckel", "ny bostad"],
    fotograf: "congerdesign",
    kalla: "Pixabay 2481718",
  },
  "anteckningsblock-kuvert": {
    alt: "Hand som skriver i ett anteckningsblock bredvid ett kuvert och en kaffekopp",
    kategori: "ovrigt",
    taggar: ["uppsägning", "brev", "avtal"],
    kalla: "Pixabay 3202747",
  },
  "underskrift-brev": {
    alt: "Hand som skriver under ett brev med reservoarpenna",
    kategori: "ovrigt",
    taggar: ["avtal", "uppsägning", "underskrift"],
    kalla: "Pixabay 428334",
  },
  "spargris-tra": {
    alt: "Vit spargris på ett träbord",
    kategori: "ovrigt",
    taggar: ["pris", "spara", "billigt"],
    kalla: "Pixabay 1595992",
  },
  "husbil-natt": {
    alt: "Husbil med tända fönster på en camping under stjärnhimmel",
    kategori: "fritidshus",
    taggar: ["husbil", "husvagn", "camping"],
    kalla: "Pixabay 2788677",
  },
  "miniraknare-kvitton": {
    alt: "Miniräknare ovanpå en hög med kvitton",
    kategori: "ovrigt",
    taggar: ["pris", "prishöjning", "faktura"],
    kalla: "Pixabay 8206242",
  },
  "anteckningar-skrivplatta": {
    alt: "Person som antecknar på en skrivplatta",
    kategori: "ovrigt",
    taggar: ["test", "jämförelse", "utvärdering"],
    kalla: "Pixabay 3934298",
  },
  "underskrift-avtal": {
    alt: "Person i kavaj som skriver under ett papper vid ett skrivbord",
    kategori: "ovrigt",
    taggar: ["avtal", "bindningstid", "underskrift"],
    kalla: "Pixabay 5710164",
  },
  "tomt-kontor": {
    alt: "Tomt kontor med långbord och tegelvägg",
    kategori: "lokal",
    taggar: ["konkurs", "företag", "kontor"],
    kalla: "Pixabay 2181920",
  },
  fingeravtryck: {
    alt: "Fingeravtryck i svart bläck på papper",
    kategori: "inbrott",
    taggar: ["märkning", "spår", "polis"],
    kalla: "Pixabay 255899",
  },
  "kontrollrum-skarmar": {
    alt: "Operatörer framför många skärmar i ett kontrollrum",
    kategori: "utrustning",
    taggar: ["larmcentral", "övervakning", "operatör"],
    kalla: "Pixabay 693251",
  },
  "miniraknare-kalkyl": {
    alt: "Miniräknare och penna på en uträkning med siffror",
    kategori: "ovrigt",
    taggar: ["skatt", "avdrag", "kalkyl"],
    kalla: "Pixabay 761599",
  },
  "myntstaplar-okar": {
    alt: "Staplar av mynt som blir högre från vänster till höger",
    kategori: "ovrigt",
    taggar: ["pris", "prishöjning", "kostnad"],
    kalla: "Pixabay 2180330",
  },
  "kort-laptop-betalning": {
    alt: "Hand som håller ett betalkort framför en bärbar dator",
    kategori: "ovrigt",
    taggar: ["betalning", "avbetalning", "kort"],
    kalla: "Pixabay 4334491",
  },
  "mobilmast-bla-himmel": {
    alt: "Mobilmast med antenner mot blå himmel",
    kategori: "utrustning",
    taggar: ["mobilnät", "2g", "3g"],
    kalla: "Pixabay 2172041",
  },
  "kuvert-reservoarpenna": {
    alt: "Kuvert, brevpapper och reservoarpenna på ett träbord med tulpaner",
    kategori: "ovrigt",
    taggar: ["uppsägning", "brev", "avtal"],
    kalla: "Pixabay 2111546",
  },
  "hus-norrsken": {
    alt: "Hus med tända fönster i snön under norrsken",
    kategori: "bostad",
    taggar: ["belysning", "villa", "vinter", "mörker"],
    kalla: "Pixabay 2616327",
  },
  "mast-stjarnhimmel": {
    alt: "Antennmast med röda och vita fält mot stjärnhimmel",
    kategori: "utrustning",
    taggar: ["radio", "störsändare", "signal"],
    kalla: "Pixabay 820001",
  },
  "glasogon-finstilt": {
    alt: "Läsglasögon som förstorar tät, finstilt text i en uppslagen bok",
    kategori: "ovrigt",
    taggar: ["avtal", "villkor", "granskning"],
    fotograf: "felix_w",
    kalla: "Pixabay 3101151",
  },
} satisfies Record<string, Post>;

export type Bildnyckel = keyof typeof BILDER;

export type Bild = {
  nyckel: Bildnyckel;
  /** Stor bild, max 1600px bred. */
  jpg: string;
  webp: string;
  /** 800px bred. Använd i kort, listor och allt som visas litet. */
  thumb: string;
  thumbWebp: string;
  alt: string;
  kategori: Kategori;
  taggar: string[];
};

/** Hämtar en bild ur bildbanken. `alt` kan skrivas över när sammanhanget kräver det. */
export function bild(nyckel: Bildnyckel, alt?: string): Bild {
  const post = BILDER[nyckel] as Post;
  return {
    nyckel,
    jpg: url(jpgFiler, nyckel, "jpg"),
    webp: url(webpFiler, nyckel, "webp"),
    thumb: url(jpgFiler, `${nyckel}-800`, "jpg"),
    thumbWebp: url(webpFiler, `${nyckel}-800`, "webp"),
    alt: alt ?? post.alt,
    kategori: post.kategori,
    taggar: post.taggar,
  };
}

/** Alla bilder i en kategori. Praktiskt när man letar bild till en ny sida. */
export function bilderIKategori(kategori: Kategori): Bild[] {
  return (Object.keys(BILDER) as Bildnyckel[])
    .filter((n) => (BILDER[n] as Post).kategori === kategori)
    .map((n) => bild(n));
}

/** Alla nycklar i bildbanken. */
export const BILDNYCKLAR = Object.keys(BILDER) as Bildnyckel[];

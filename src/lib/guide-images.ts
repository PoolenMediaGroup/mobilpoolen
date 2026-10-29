// Bild per guide. Alla bilder hämtas ur bildbanken i src/lib/bildbank.ts.
// Byta bild på en guide: peka om raden nedan till en annan nyckel i BILDER.

import { bild, type Bild, type Bildnyckel } from "@/lib/bildbank";

export type GuideImage = {
  nyckel: Bildnyckel;
  url: string;
  alt: string;
  thumb: string;
  webp: string;
  thumbWebp: string;
};

/** Nyckel ur bildbanken, med möjlighet att skriva om alt-texten för sammanhanget. */
function fran(nyckel: Bildnyckel, alt?: string): GuideImage {
  const b = bild(nyckel, alt);
  return {
    nyckel,
    url: b.jpg,
    thumb: b.thumb,
    webp: b.webp,
    thumbWebp: b.thumbWebp,
    alt: b.alt,
  };
}

export const GUIDE_IMAGES: Record<string, GuideImage> = {
  "kampanjpris-efter-kampanjen": fran("miniraknare-kvitton"),
  "bindningstid-uppsagningstid": fran("underskrift-avtal"),
  "sank-mobilrakningen": fran("spargris-tra"),
  "prishojning-mobilabonnemang": fran("myntstaplar-okar"),
  "angerratt-mobilabonnemang": fran("underskrift-brev"),
  "mobil-med-eller-utan-abonnemang": fran("kort-laptop-betalning"),
  "kontantkort-eller-abonnemang": fran("kundvagnar-rad"),
  "forhandla-med-operatoren": fran("anteckningar-skrivplatta"),
  "hur-mycket-surf-drar-appar": fran("kvinna-soffa-mobil"),
  "racker-5-gb-surf": fran("par-hemma-morgon"),
  "basta-tackning-sverige": fran("mobilmast-bla-himmel"),
  "vilket-nat-anvander-operatoren": fran("mast-stjarnhimmel"),
  "virtuella-operatorer": fran("kontrollrum-skarmar"),
  "behover-jag-5g": fran("mobilmast-bla-himmel"),
  "vad-ar-esim": fran("kvinna-soffa-mobil"),
  "sparad-surf-dubbel-surf": fran("par-hemma-morgon"),
  "nar-surfen-tar-slut": fran("stromavbrott-ljus"),
  "wifi-samtal-och-dalig-tackning": fran("stuga-natt-sno"),
  "2g-3g-nedslackning": fran("mast-stjarnhimmel"),
  "byta-operator-behalla-nummer": fran("flyttkartong-nyckel"),
  "byta-operator-med-bindningstid": fran("miniraknare-kalkyl"),
  "halebop-laggs-ned": fran("flyttkartong-nyckel"),
  "surfa-i-eu": fran("husbil-natt"),
  "surfa-utanfor-eu": fran("sjobodar-smogen"),
  "ringa-utomlands-billigt": fran("vanner-middag-utomhus"),
  "forsta-mobilabonnemang-barn": fran("barn-pa-trappa"),
  "sparra-kop-barn-mobil": fran("barn-cyklar-alle"),
  "bedrageri-sim-swap-och-bluffsamtal": fran("fingeravtryck"),
  "klaga-pa-operatoren": fran("kuvert-reservoarpenna"),
  "mobilmarknaden-i-siffror": fran("kontrollrum-skarmar"),
  "privat-eller-foretagsabonnemang": fran("kontor-motesrum"),
  "moms-mobilabonnemang": fran("miniraknare-kalkyl"),
  "jobbmobil-formansskatt": fran("anteckningsblock-kuvert"),
  "avdrag-mobilabonnemang-enskild-firma": fran("glasogon-finstilt"),
  "vaxel-eller-mobil": fran("tomt-kontor"),
  "delad-surf-foretag": fran("kontor-motesrum"),
  "overlata-abonnemang-till-foretag": fran("underskrift-avtal"),
};

export function getGuideImage(slug: string) {
  return GUIDE_IMAGES[slug];
}

/**
 * Önskad bild i guidens avslutande CTA-band. Det är ett önskemål, inte ett
 * löfte: getGuideCtaImage byter till en reservbild om samma bild redan syns
 * som hjältebild eller i ett relaterat kort på sidan.
 */
export const GUIDE_CTA_IMAGES: Record<string, Bildnyckel> = {};

/**
 * Reservbilder när den önskade bilden redan syns på sidan. Bara scener, så att
 * de tål både breda CTA-band och kort. I den här ordningen.
 */
const RESERVBILDER: Bildnyckel[] = [
  "vanner-middag-utomhus",
  "familj-hostpromenad",
  "par-hemma-morgon",
  "sjobodar-smogen",
  "pappa-barn-promenad",
  "hus-norrsken",
];

/** Den önskade bilden om den inte redan syns på sidan, annars första lediga reservbild. */
export function ledigBild(onskad: Bildnyckel, upptagna: Iterable<Bildnyckel>): Bildnyckel {
  const tagna = new Set(upptagna);
  if (!tagna.has(onskad)) return onskad;
  return RESERVBILDER.find((n) => !tagna.has(n)) ?? onskad;
}

/**
 * Bild per kort i en lista med många guider, som /guider. Flera guider delar
 * hjältebild, och samma bild ska aldrig synas två gånger på en sida. Första
 * kortet med en bild får den, senare kort med samma bild får null och visar
 * en tonad platshållare (som Elpoolens kort utan bild). Guidernas egna
 * hjältebilder ändras inte. Kortet visar guidens egen bild eller ingen, så
 * ingen reservbild används här.
 */
export function unikaKortbilder(slugs: string[]): Map<string, GuideImage | null> {
  const sedda = new Set<Bildnyckel>();
  const ut = new Map<string, GuideImage | null>();
  for (const slug of slugs) {
    const img = GUIDE_IMAGES[slug];
    if (img && !sedda.has(img.nyckel)) {
      sedda.add(img.nyckel);
      ut.set(slug, img);
    } else {
      ut.set(slug, null);
    }
  }
  return ut;
}

/**
 * CTA-bilden för en guide. `upptagna` är bilderna som redan syns på sidan:
 * hjältebilden och de relaterade korten. Så visas samma bild aldrig två gånger.
 */
export function getGuideCtaImage(
  slug: string | undefined,
  upptagna: Iterable<Bildnyckel> = [],
): Bildnyckel {
  const onskad = (slug && GUIDE_CTA_IMAGES[slug]) || "vanner-middag-utomhus";
  const hjalte = slug ? GUIDE_IMAGES[slug]?.nyckel : undefined;
  return ledigBild(onskad, hjalte ? [hjalte, ...upptagna] : upptagna);
}

/**
 * Faktisk bredd på den stora filen. Bildbanken tar max 1600px, men några
 * original var mindre. Bilder som saknas här är 1600px breda. Alla små filer
 * är 800px.
 */
const STOR_BREDD: Partial<Record<Bildnyckel, number>> = {
  "barn-cyklar-alle": 1400,
  "stuga-akerkant-vinter": 1200,
  "aldre-kvinna-fatolj": 1280,
  "anteckningsblock-kuvert": 1280,
  "underskrift-brev": 1280,
  "glasogon-finstilt": 1280,
  "spargris-tra": 1280,
  "husbil-natt": 1280,
  "miniraknare-kvitton": 1280,
  "anteckningar-skrivplatta": 1280,
  "underskrift-avtal": 1280,
  "tomt-kontor": 1280,
  fingeravtryck: 1280,
  "kontrollrum-skarmar": 1280,
  "miniraknare-kalkyl": 1280,
  "myntstaplar-okar": 1280,
  "kort-laptop-betalning": 1280,
  "mobilmast-bla-himmel": 1280,
  "kuvert-reservoarpenna": 1280,
  "hus-norrsken": 1280,
  "mast-stjarnhimmel": 1280,
  "mobil-hemapp-villa": 1280,
  "kvinna-soffa-mobil": 1280,
  "familj-hostpromenad": 1280,
  "pappa-barn-promenad": 1280,
  "flyttkartong-nyckel": 1280,
  "kontor-motesrum": 1280,
  "stromavbrott-ljus": 1280,
  "stuga-natt-sno": 1280,
};

/**
 * srcSet för en stor bild (band och hjälte), så att webbläsaren väljer
 * 800px-filen när den räcker. Används med `sizes` på plats.
 */
export function bildSrcSet(b: Pick<Bild, "nyckel" | "jpg" | "webp" | "thumb" | "thumbWebp">): {
  jpg: string;
  webp: string;
} {
  const stor = STOR_BREDD[b.nyckel] ?? 1600;
  return {
    jpg: `${b.thumb} 800w, ${b.jpg} ${stor}w`,
    webp: `${b.thumbWebp} 800w, ${b.webp} ${stor}w`,
  };
}

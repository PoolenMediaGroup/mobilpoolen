/**
 * Pixelmått för bildbankens filer, så att varje <img> kan få width och height
 * och webbläsaren reserverar rätt yta innan bilden laddats (ingen CLS).
 *
 * Genererad ur src/assets/bildbank/. Lägger du till en bild i banken, lägg
 * också till en rad här: [stor bredd, stor höjd, liten bredd, liten höjd].
 *   cd src/assets/bildbank && python3 -c "from PIL import Image; print(Image.open('NAMN.jpg').size, Image.open('NAMN-800.jpg').size)"
 * Saknas raden faller komponenterna tillbaka på 16:10 i rätt bredd.
 */

const MATT: Record<string, readonly [number, number, number, number]> = {
  "aldre-kvinna-fatolj": [1280, 714, 800, 446],
  "aldre-par-parkbank": [1600, 1067, 800, 534],
  "anteckningar-skrivplatta": [1280, 853, 800, 533],
  "anteckningsblock-kuvert": [1280, 745, 800, 466],
  "barn-cyklar-alle": [1400, 809, 800, 462],
  "barn-pa-trappa": [1600, 1067, 800, 534],
  "familj-hostpromenad": [1280, 853, 800, 533],
  fingeravtryck: [1280, 853, 800, 533],
  "flyttkartong-nyckel": [1280, 835, 800, 522],
  "hus-norrsken": [1280, 854, 800, 534],
  "husbil-natt": [1280, 853, 800, 533],
  "kontor-motesrum": [1280, 854, 800, 534],
  "kontrollrum-skarmar": [1280, 746, 800, 466],
  "kort-laptop-betalning": [1280, 853, 800, 533],
  "kuvert-reservoarpenna": [1280, 960, 800, 600],
  "kvinna-soffa-mobil": [1280, 1280, 800, 800],
  "mast-stjarnhimmel": [1280, 853, 800, 533],
  "miniraknare-kalkyl": [1280, 917, 800, 573],
  "miniraknare-kvitton": [1280, 853, 800, 533],
  "mobil-hemapp-villa": [1280, 829, 800, 518],
  "mobilmast-bla-himmel": [1280, 853, 800, 533],
  "myntstaplar-okar": [1280, 853, 800, 533],
  "pappa-barn-promenad": [1280, 853, 800, 533],
  "par-hemma-morgon": [1600, 1067, 800, 534],
  "sjobodar-smogen": [1600, 1067, 800, 534],
  "spargris-tra": [1280, 853, 800, 533],
  "stromavbrott-ljus": [1280, 853, 800, 533],
  "stuga-akerkant-vinter": [1200, 780, 800, 520],
  "stuga-natt-sno": [1280, 802, 800, 501],
  "tomt-kontor": [1280, 853, 800, 533],
  "underskrift-avtal": [1280, 853, 800, 533],
  "underskrift-brev": [1280, 851, 800, 532],
  "glasogon-finstilt": [1280, 853, 800, 533],
  "vanner-middag-utomhus": [1600, 1067, 800, 534],
};

export type Matt = { width: number; height: number };

/** Mått för den stora filen (.jpg/.webp, max 1600 px bred). */
export function storMatt(nyckel: string): Matt {
  const m = MATT[nyckel];
  return m ? { width: m[0], height: m[1] } : { width: 1600, height: 1000 };
}

/** Mått för den lilla filen (-800.jpg/-800.webp). */
export function litenMatt(nyckel: string): Matt {
  const m = MATT[nyckel];
  return m ? { width: m[2], height: m[3] } : { width: 800, height: 500 };
}

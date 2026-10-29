import type { Bildnyckel } from "@/lib/bildbank";
import type { Abonnemang, NatId } from "./typer";
import { MOBILNAT, PRIVATA, operator } from "./data";
import { arVillkorat, billigastForBehov, prisPerGb, snittForstaAret, sortera } from "./berakna";

/**
 * Sidorna per surfmängd (/surf/10-gb osv.). Varje nivå har ett spann så att
 * abonnemang på till exempel 15 eller 25 GB räknas till 20 GB-nivån. Vi bygger
 * bara nivåer där datan räcker till en egen lista. 5 GB och obegränsat har
 * egna sidor sedan tidigare (guiden om 5 GB och /obegransad-surf).
 */
export type SurfNiva = {
  slug: string;
  gb: number;
  fran: number;
  till: number;
  /** Bild till CTA-bandet. Får inte krocka med något annat på sidan. */
  bild: Bildnyckel;
};

export const SURF_NIVAER: SurfNiva[] = [
  { slug: "10-gb", gb: 10, fran: 8, till: 14, bild: "par-hemma-morgon" },
  { slug: "20-gb", gb: 20, fran: 15, till: 25, bild: "kvinna-soffa-mobil" },
  { slug: "50-gb", gb: 50, fran: 40, till: 60, bild: "hus-norrsken" },
  { slug: "100-gb", gb: 100, fran: 80, till: 150, bild: "husbil-natt" },
];

export function surfNiva(slug: string): SurfNiva | undefined {
  return SURF_NIVAER.find((n) => n.slug === slug);
}

/** Abonnemang som alla kan teckna, utan ålders- eller studentkrav. */
const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));

export function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}${a.kontantkort ? " (kontantkort)" : ""}`;
}

export function natFor(a: Abonnemang): NatId | undefined {
  return operator(a.operator)?.nat;
}

/** Netflix Help Center (data per timme) och Spotify Support (kbit/s). */
export const ANVANDNING = {
  netflixHd: 3,
  netflixMedium: 0.7,
  spotifyNormalMb: 43,
  netflixKalla: "https://help.netflix.com/en/node/87",
  spotifyKalla: "https://support.spotify.com/article/audio-quality",
};

export type NivaData = ReturnType<typeof nivaData>;

/** Allt som räknas fram för en nivå. Allt kommer ur prisdatan. */
export function nivaData(n: SurfNiva) {
  const iNivan = sortera(
    OPPNA.filter((a) => a.gb != null && a.gb >= n.fran && a.gb <= n.till),
    "snitt-ar",
  );
  const minst = billigastForBehov(OPPNA, n.gb);
  const minstUtan = billigastForBehov(
    OPPNA.filter((a) => a.bindning === 0),
    n.gb,
  );
  const nivanUtan = iNivan.find((a) => a.bindning === 0) ?? null;
  const billigast = iNivan[0] ?? null;
  const operatorer = new Set(iNivan.map((a) => a.operator)).size;

  const index = SURF_NIVAER.findIndex((x) => x.slug === n.slug);
  const lagre = index > 0 ? SURF_NIVAER[index - 1] : null;
  const hogre = index < SURF_NIVAER.length - 1 ? SURF_NIVAER[index + 1] : null;
  const billigastLagre = lagre ? billigastForBehov(OPPNA, lagre.gb) : billigastForBehov(OPPNA, 5);
  const billigastHogre = hogre ? billigastForBehov(OPPNA, hogre.gb) : null;
  const billigastObegr = sortera(
    OPPNA.filter((a) => a.gb == null),
    "snitt-ar",
  )[0];

  const perNat = (Object.keys(MOBILNAT) as NatId[]).map((id) => ({
    id,
    namn: MOBILNAT[id].namn,
    a: iNivan.find((a) => natFor(a) === id) ?? null,
  }));

  const kronorPerGb = iNivan
    .map(prisPerGb)
    .filter((x): x is number => x != null)
    .sort((a, b) => a - b);

  const priser = iNivan.map(snittForstaAret);
  const median = priser.length
    ? [...priser].sort((a, b) => a - b)[Math.floor(priser.length / 2)]
    : 0;

  return {
    iNivan,
    billigast,
    minst,
    minstUtan,
    nivanUtan,
    operatorer,
    lagre,
    hogre,
    billigastLagre,
    billigastHogre,
    billigastObegr,
    perNat,
    kronorPerGb,
    median,
    utanBindning: iNivan.filter((a) => a.bindning === 0).length,
    medBindning: iNivan.filter((a) => a.bindning != null && a.bindning > 0).length,
    okandBindning: iNivan.filter((a) => a.bindning == null).length,
    sparad: iNivan.filter((a) => a.sparadSurf === true).length,
    femg: iNivan.filter((a) => a.femg).length,
    hdTimmar: Math.floor(n.gb / ANVANDNING.netflixHd),
    mediumTimmar: Math.floor(n.gb / ANVANDNING.netflixMedium),
    musikTimmar: Math.floor((n.gb * 1000) / ANVANDNING.spotifyNormalMb),
  };
}

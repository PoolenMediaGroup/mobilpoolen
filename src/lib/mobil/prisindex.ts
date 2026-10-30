// Prisindexets uträkningar. Används av /prisindex och av scripts/prisindex_manad.ts,
// som sparar en ögonblicksbild per månad så att indexet kan följas över tid.

import { arVillkorat, formatTal, prisPerGb, snittForstaAret } from "./berakna";
import type { Abonnemang } from "./typer";

export const INDEX_NIVAER = [1, 5, 10, 20, 50, 100] as const;
/** Ett abonnemang räknas till en nivå om det har minst nivån och högst tre gånger så mycket surf. */
export const INDEX_TAK = 3;

export type NivaRad = {
  niva: string;
  regel: string;
  antal: number;
  min: number | null;
  med: number | null;
  max: number | null;
  kampanjAndel: number | null;
};

export type IndexNyckeltal = {
  antal: number;
  operatorer: number;
  kampanjAndel: number;
  snittHojning: number | null;
  medianHojningKr: number | null;
  utanBindningAndel: number;
  medianPerGb: number | null;
};

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export function harKampanj(a: Abonnemang): boolean {
  return a.kampanjpris != null && (a.kampanjManader ?? 0) > 0 && a.kampanjpris < a.pris;
}

/** Abonnemang som alla kan teckna: privat och utan ålders- eller studentkrav. */
export function indexUrval(privata: Abonnemang[]): Abonnemang[] {
  return privata.filter((a) => !arVillkorat(a));
}

function nivaRad(niva: string, regel: string, lista: Abonnemang[]): NivaRad {
  const p = lista.map(snittForstaAret);
  return {
    niva,
    regel,
    antal: lista.length,
    min: p.length ? Math.min(...p) : null,
    med: median(p),
    max: p.length ? Math.max(...p) : null,
    kampanjAndel: lista.length ? (lista.filter(harKampanj).length / lista.length) * 100 : null,
  };
}

export function perNiva(urval: Abonnemang[]): NivaRad[] {
  return [
    ...INDEX_NIVAER.map((n) =>
      nivaRad(
        `${n} GB`,
        `${formatTal(n)}–${formatTal(n * INDEX_TAK)} GB`,
        urval.filter((a) => a.gb != null && a.gb >= n && a.gb <= n * INDEX_TAK),
      ),
    ),
    nivaRad(
      "Obegränsad",
      "Obegränsad surf",
      urval.filter((a) => a.gb == null),
    ),
  ];
}

export function indexNyckeltal(urval: Abonnemang[]): IndexNyckeltal {
  const medKampanj = urval.filter(harKampanj);
  const hojningar = medKampanj.map((a) => a.pris / (a.kampanjpris as number));
  const perGb = urval.map(prisPerGb).filter((x): x is number => x != null);
  return {
    antal: urval.length,
    operatorer: new Set(urval.map((a) => a.operator)).size,
    kampanjAndel: urval.length ? (medKampanj.length / urval.length) * 100 : 0,
    snittHojning: hojningar.length ? hojningar.reduce((s, x) => s + x, 0) / hojningar.length : null,
    medianHojningKr: median(medKampanj.map((a) => a.pris - (a.kampanjpris as number))),
    utanBindningAndel: urval.length
      ? (urval.filter((a) => a.bindning === 0).length / urval.length) * 100
      : 0,
    medianPerGb: median(perGb),
  };
}

/** En sparad månad i prisindexet. */
export type IndexManad = {
  manad: string; // "2026-10"
  kontrollerad: string; // senaste kontrolldatum den månaden
  perNiva: NivaRad[];
  nyckeltal: IndexNyckeltal;
};

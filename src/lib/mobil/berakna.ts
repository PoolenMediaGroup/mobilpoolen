import type { Abonnemang } from "./typer";

/** Pris första månaden: kampanjpris om det finns, annars ordinarie. */
export function prisNu(a: Abonnemang): number {
  return a.kampanjpris != null && (a.kampanjManader ?? 0) > 0 ? a.kampanjpris : a.pris;
}

/**
 * Total kostnad för ett antal månader, inklusive startavgift och kampanjens
 * längd. Det här är det ärliga måttet: ett kampanjpris i tre månader väger
 * lätt över två år.
 */
export function totalKostnad(a: Abonnemang, manader: number): number {
  const kampanjMan = a.kampanjpris != null ? Math.min(a.kampanjManader ?? 0, manader) : 0;
  const kampanj = kampanjMan * (a.kampanjpris ?? a.pris);
  const ordinarie = (manader - kampanjMan) * a.pris;
  return Math.round(kampanj + ordinarie + (a.startavgift ?? 0));
}

/** Snittpris per månad över ett år, inklusive kampanj och startavgift. */
export function snittForstaAret(a: Abonnemang): number {
  return Math.round(totalKostnad(a, 12) / 12);
}

/** Kronor per GB vid ordinarie pris. `null` för obegränsad surf. */
export function prisPerGb(a: Abonnemang): number | null {
  if (a.gb == null || a.gb === 0) return null;
  return Math.round((a.pris / a.gb) * 10) / 10;
}

export function gbText(gb: number | null): string {
  return gb == null ? "Obegränsad" : `${formatTal(gb)} GB`;
}

export function kr(n: number): string {
  return `${formatTal(Math.round(n))} kr`;
}

export function formatTal(n: number): string {
  return new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 1 }).format(n);
}

export function bindningText(m: number | null): string {
  if (m == null) return "Bindningstid framgår inte";
  return m === 0 ? "Ingen bindningstid" : `${m} mån bindningstid`;
}

export function momsText(moms: "exkl" | "inkl" | "okand" | undefined): string | null {
  if (moms === "exkl") return "exkl. moms";
  if (moms === "inkl") return "inkl. moms";
  if (moms === "okand") return "moms anges inte";
  return null;
}

const MANADER = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

/** "2026-10-29" → "29 oktober 2026". */
export function datumText(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MANADER[m - 1]} ${y}`;
}

/* ---------------- Filter ---------------- */

export type SurfIntervall = "alla" | "upp-till-5" | "5-20" | "20-50" | "50-plus" | "obegransad";

export const SURF_INTERVALL: { id: SurfIntervall; label: string }[] = [
  { id: "alla", label: "All surf" },
  { id: "upp-till-5", label: "Upp till 5 GB" },
  { id: "5-20", label: "5–20 GB" },
  { id: "20-50", label: "20–50 GB" },
  { id: "50-plus", label: "Över 50 GB" },
  { id: "obegransad", label: "Obegränsad" },
];

export function iSurfIntervall(a: Abonnemang, s: SurfIntervall): boolean {
  const gb = a.gb;
  switch (s) {
    case "alla":
      return true;
    case "obegransad":
      return gb == null;
    case "upp-till-5":
      return gb != null && gb <= 5;
    case "5-20":
      return gb != null && gb > 5 && gb <= 20;
    case "20-50":
      return gb != null && gb > 20 && gb <= 50;
    case "50-plus":
      return gb != null && gb > 50;
  }
}

/** Minsta surf som täcker ett behov i GB. Obegränsad täcker allt. */
export function tackerBehov(a: Abonnemang, behovGb: number): boolean {
  return a.gb == null || a.gb >= behovGb;
}

export type Sortering = "pris-nu" | "snitt-ar" | "pris-per-gb" | "mest-surf";

export const SORTERINGAR: { id: Sortering; label: string }[] = [
  { id: "snitt-ar", label: "Lägst snittpris första året" },
  { id: "pris-nu", label: "Lägst pris första månaden" },
  { id: "pris-per-gb", label: "Lägst pris per GB" },
  { id: "mest-surf", label: "Mest surf" },
];

export function sortera(lista: Abonnemang[], s: Sortering): Abonnemang[] {
  const kopia = [...lista];
  const gbVarde = (a: Abonnemang) => (a.gb == null ? Number.POSITIVE_INFINITY : a.gb);
  switch (s) {
    case "pris-nu":
      return kopia.sort((a, b) => prisNu(a) - prisNu(b) || snittForstaAret(a) - snittForstaAret(b));
    case "snitt-ar":
      return kopia.sort(
        (a, b) => snittForstaAret(a) - snittForstaAret(b) || gbVarde(b) - gbVarde(a),
      );
    case "pris-per-gb":
      return kopia.sort(
        (a, b) =>
          (prisPerGb(a) ?? Number.POSITIVE_INFINITY) - (prisPerGb(b) ?? Number.POSITIVE_INFINITY),
      );
    case "mest-surf":
      return kopia.sort((a, b) => gbVarde(b) - gbVarde(a) || a.pris - b.pris);
  }
}

/**
 * Det billigaste abonnemanget som täcker ett surfbehov, mätt som snittpris
 * första året. Används av besparingsräknaren i heron.
 */
export function billigastForBehov(lista: Abonnemang[], behovGb: number): Abonnemang | null {
  const kandidater = lista.filter((a) => tackerBehov(a, behovGb));
  return sortera(kandidater, "snitt-ar")[0] ?? null;
}

/** Abonnemang som bara kan köpas av vissa (ålderskrav eller student). */
export function arVillkorat(a: Abonnemang): boolean {
  return Boolean(a.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung"));
}

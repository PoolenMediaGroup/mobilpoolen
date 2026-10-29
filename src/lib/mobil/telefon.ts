import type { Abonnemang, Telefonerbjudande, Telefonmodell } from "./typer";
import { TELEFONERBJUDANDEN, TELEFONMODELLER } from "./telefon-data";
import { PRIVATA, operator } from "./data";
import { arVillkorat, billigastForBehov, totalKostnad } from "./berakna";

export { TELEFON_FAKTA, TELEFON_KONTROLLERAD, TELEFONMODELLER } from "./telefon-data";

export function telefonmodell(slug: string): Telefonmodell | undefined {
  return TELEFONMODELLER.find((m) => m.slug === slug);
}

export function opNamn(e: Telefonerbjudande): string {
  return operator(e.operator)?.namn ?? e.operator;
}

/** Kortare modellnamn utan lagring, till rubriker ("Apple iPhone 17"). */
export function modellNamn(m: Telefonmodell): string {
  return m.namn.replace(/\s+\d+\s*GB$/i, "");
}

/** Lagringen som står i modellnamnet ("256 GB"). */
export function lagring(m: Telefonmodell): string | null {
  return m.namn.match(/(\d+\s*GB)$/i)?.[1] ?? null;
}

/**
 * Erbjudandena för en modell. Först de med en uträknad totalkostnad, billigast
 * först, sedan de där abonnemanget väljs fritt (sorterade på mobilens pris).
 */
export function erbjudandenFor(slug: string): Telefonerbjudande[] {
  const lista = TELEFONERBJUDANDEN.filter((e) => e.modell === slug);
  const medTotal = lista
    .filter((e) => e.minstaTotal != null)
    .sort((a, b) => (a.minstaTotal as number) - (b.minstaTotal as number));
  const ovriga = lista
    .filter((e) => e.minstaTotal == null)
    .sort(
      (a, b) =>
        (a.telefonTotalt ?? a.kontantpris ?? Infinity) -
        (b.telefonTotalt ?? b.kontantpris ?? Infinity),
    );
  return [...medTotal, ...ovriga];
}

const UTAN_BINDNING = PRIVATA.filter((a) => !arVillkorat(a) && a.bindning === 0);

export type SjalvKop = { abonnemang: Abonnemang; manader: number; total: number };

/**
 * Alternativet att köpa mobilen hos tillverkaren och ta billigaste abonnemanget
 * utan bindning med minst lika mycket surf, under samma tid som operatörens
 * bindning. Null när något av priserna saknas.
 */
export function sjalvKop(m: Telefonmodell, e: Telefonerbjudande): SjalvKop | null {
  if (m.tillverkarpris == null || e.abonnemangGb == null || e.bindning == null) return null;
  const a = billigastForBehov(UTAN_BINDNING, e.abonnemangGb);
  if (!a) return null;
  return {
    abonnemang: a,
    manader: e.bindning,
    total: m.tillverkarpris + totalKostnad(a, e.bindning),
  };
}

/** Rabatt (positiv) eller merpris (negativ) på mobilen jämfört med tillverkarens pris. */
export function mobilRabatt(m: Telefonmodell, e: Telefonerbjudande): number | null {
  const pris = e.telefonTotalt ?? e.kontantpris;
  if (m.tillverkarpris == null || pris == null) return null;
  return m.tillverkarpris - pris;
}

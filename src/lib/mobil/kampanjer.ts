import type { Abonnemang } from "./typer";
import { PRIVATA, operator } from "./data";
import { arVillkorat, snittForstaAret, totalKostnad } from "./berakna";

/**
 * Slutdatum som operatören själv anger. Bara kampanjer där datumet står på
 * operatörens sida, kontrollerat 29 oktober 2026. Efter datumet visas
 * kampanjen som "kontrollera hos operatören" tills datan är uppdaterad.
 */
export const KAMPANJ_SLUT: Record<string, { datum: string; text: string }> = {
  fello: { datum: "2026-11-01", text: "Fellos kampanj gäller till och med 1 november 2026." },
  comviq: {
    datum: "2026-11-10",
    text: "Comviqs erbjudande med dubbel surf och 12 månaders bindning gäller till och med 10 november 2026. Slutdatum för kampanjen utan bindning framgår inte.",
  },
};

export type Kampanj = {
  a: Abonnemang;
  kampanjpris: number;
  manader: number;
  hojning: number;
  rabatt: number;
  snitt: number;
  total24: number;
};

function tillKampanj(a: Abonnemang): Kampanj | null {
  if (a.kampanjpris == null || !a.kampanjManader || a.kampanjpris >= a.pris) return null;
  return {
    a,
    kampanjpris: a.kampanjpris,
    manader: a.kampanjManader,
    hojning: a.pris - a.kampanjpris,
    rabatt: (a.pris - a.kampanjpris) * a.kampanjManader,
    snitt: snittForstaAret(a),
    total24: totalKostnad(a, 24),
  };
}

/** Alla privata kampanjer, billigast snittpris första året först. */
export const KAMPANJER: Kampanj[] = PRIVATA.map(tillKampanj)
  .filter((k): k is Kampanj => k != null)
  .sort((x, y) => x.snitt - y.snitt);

export const OPPNA_KAMPANJER = KAMPANJER.filter((k) => !arVillkorat(k.a));
export const VILLKORADE_KAMPANJER = KAMPANJER.filter((k) => arVillkorat(k.a));

export function opNamn(a: Abonnemang): string {
  return operator(a.operator)?.namn ?? a.operator;
}

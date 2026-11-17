import type { Abonnemang } from "./typer";
import { PRIVATA, operator } from "./data";
import { arVillkorat, snittForstaAret, totalKostnad } from "./berakna";

/**
 * Slutdatum som operatören själv anger. Bara kampanjer där datumet står på
 * operatörens sida, kontrollerat 17 november 2026. Efter datumet visas
 * kampanjen som "kontrollera hos operatören" tills datan är uppdaterad.
 */
export const KAMPANJ_SLUT: Record<string, { datum: string; text: string }> = {
  telia: {
    datum: "2026-11-30",
    text: "Telia skriver att Black Week pågår 16 till 30 november 2026. Det gäller halva priset i sex månader på Obegränsad och Obegränsad Plus med 24 månaders bindningstid.",
  },
  tele2: {
    datum: "2026-11-30",
    text: "Tele2 skriver att erbjudandena under Black Cheap Weeks gäller till och med 30 november 2026.",
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

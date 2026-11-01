// De billigaste abonnemangen som täcker ett angivet behov. Används av formuläret på
// /autopilot (besparingen direkt) och av /api/autopilot/forslag (mejlen från Autopilot).

import { OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "./data";
import {
  arVillkorat,
  bindningText,
  gbText,
  kr,
  snittForstaAret,
  sortera,
  tackerBehov,
} from "./berakna";
import type { Abonnemang } from "./typer";

export type Behov = {
  /** Minsta surf i GB per månad. Null betyder att surfen inte är känd. */
  gb: number | null;
  obegransad: boolean;
  /** Minsta EU-surf i GB. Null betyder inget krav. */
  euGb: number | null;
};

export type Forslag = {
  id: string;
  operator: string;
  namn: string;
  surf: string;
  snittForstaAret: number;
  pris: number;
  kampanj: string | null;
  bindning: string;
  url: string;
};

const AKTIVA = new Set(OPERATORER.filter((o) => o.aktiv).map((o) => o.slug));

/** Abonnemang som alla kan teckna hos aktiva operatörer, billigast första året först. */
export function forslagFor(behov: Behov, antal = 3): Abonnemang[] {
  const lista = PRIVATA.filter((a) => AKTIVA.has(a.operator) && !arVillkorat(a)).filter((a) => {
    if (behov.obegransad) return a.gb == null;
    if (behov.gb != null && !tackerBehov(a, behov.gb)) return false;
    // EU-surf: ett abonnemang utan uppgift räknas inte som att det täcker kravet.
    if (behov.euGb != null && behov.euGb > 0) {
      if (a.euGb == null) return false;
      if (a.euGb < behov.euGb) return false;
    }
    return true;
  });
  return sortera(lista, "snitt-ar").slice(0, antal);
}

/**
 * Länken i mejlen: abonnemangets källa om den är en vanlig sida, annars operatörens
 * webbplats. Några källor är prislistor (pdf) eller operatörens API, som inte passar kunder.
 */
function lankTill(a: Abonnemang): string {
  try {
    const u = new URL(a.kalla);
    if (!u.hostname.startsWith("api.") && !/\.pdf$/i.test(u.pathname)) return a.kalla;
  } catch {
    // ogiltig källa, använd operatörens webbplats
  }
  return operator(a.operator)?.webb ?? a.kalla;
}

export function tillForslag(a: Abonnemang): Forslag {
  return {
    id: a.id,
    operator: operator(a.operator)?.namn ?? a.operator,
    namn: a.namn,
    surf: a.gb == null ? "Obegränsad surf" : `${gbText(a.gb)} surf`,
    snittForstaAret: Math.round(snittForstaAret(a)),
    pris: a.pris,
    kampanj:
      a.kampanjpris != null && a.kampanjManader
        ? `${kr(a.kampanjpris)}/mån i ${a.kampanjManader} mån, sedan ${kr(a.pris)}`
        : null,
    bindning: bindningText(a.bindning),
    url: lankTill(a),
  };
}

export const FORSLAG_KONTROLLERAD = SENAST_KONTROLLERAD;

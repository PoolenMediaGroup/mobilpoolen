import type { Abonnemang, MobilNat, NatId, Operator } from "./typer";
import { OPERATORER_DATA, ABONNEMANG_DATA } from "./operatorer-data";

/**
 * Sveriges tre mobilnät. Alla operatörer på sajten kör i något av dem.
 * Beskrivningarna hålls till det som går att belägga.
 */
export const MOBILNAT: Record<NatId, MobilNat> = {
  telia: {
    id: "telia",
    namn: "Telias nät",
    kortText: "Telias nät",
    agare: "Telia Company",
    beskrivning:
      "Telia bygger och driver sitt eget mobilnät för 4G och 5G. Fello och flera mindre operatörer hyr in sig i det.",
  },
  tele2: {
    id: "tele2",
    namn: "Tele2s nät",
    kortText: "Tele2s nät",
    agare: "Tele2, via Net4Mobility tillsammans med Telenor",
    beskrivning:
      "Tele2 och Telenor delar radionätet för 4G och 5G genom det samägda bolaget Net4Mobility. Comviq ägs av Tele2 och kör i Tele2s nät, liksom flera mindre operatörer.",
  },
  telenor: {
    id: "telenor",
    namn: "Telenors nät",
    kortText: "Telenors nät",
    agare: "Telenor, via Net4Mobility tillsammans med Tele2",
    beskrivning:
      "Telenor delar radionätet för 4G och 5G med Tele2 genom Net4Mobility. Vimla ägs av Telenor och kör i Telenors nät, liksom flera mindre operatörer.",
  },
  tre: {
    id: "tre",
    namn: "Tres nät",
    kortText: "Tres nät",
    agare: "Hi3G Access (Tre)",
    beskrivning:
      "Tre driver ett eget mobilnät. Hallon ägs av Tre och kör i samma nät, liksom flera mindre operatörer.",
  },
};

export const OPERATORER: Operator[] = OPERATORER_DATA;
export const ABONNEMANG: Abonnemang[] = ABONNEMANG_DATA;

const PER_SLUG = new Map(OPERATORER.map((o) => [o.slug, o]));

export function operator(slug: string): Operator | undefined {
  return PER_SLUG.get(slug);
}

export function abonnemangFor(slug: string, kundtyp?: Abonnemang["kundtyp"]): Abonnemang[] {
  return ABONNEMANG.filter((a) => a.operator === slug && (!kundtyp || a.kundtyp === kundtyp));
}

/** Senaste kontrolldatum över alla operatörer (ISO). */
export const SENAST_KONTROLLERAD: string = OPERATORER.reduce(
  (max, o) => (o.kontrollerad > max ? o.kontrollerad : max),
  "2000-01-01",
);

/** Äldsta kontrolldatum, för ärlig redovisning i metodtexten. */
export const AELDST_KONTROLLERAD: string = OPERATORER.reduce(
  (min, o) => (o.kontrollerad < min ? o.kontrollerad : min),
  "2999-12-31",
);

export const PRIVATA = ABONNEMANG.filter((a) => a.kundtyp === "privat");
export const FORETAG = ABONNEMANG.filter((a) => a.kundtyp === "foretag");

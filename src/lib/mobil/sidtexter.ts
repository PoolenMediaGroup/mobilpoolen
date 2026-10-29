/**
 * Texter och frågor som räknas fram ur operatörsdatan, så att operatörssidor,
 * jämförelsesidor och uppsägningssidor alltid säger samma sak som tabellerna.
 * Inget här får påstå något som inte står i datan.
 */
import { ABONNEMANG, MOBILNAT, OPERATORER, operator } from "./data";
import { arVillkorat, bindningText, gbText, kr, snittForstaAret, sortera } from "./berakna";
import type { Abonnemang, Operator } from "./typer";

export const SKI_BRANSCH_PRIVAT = 65.8;
export const SKI_BRANSCH_FORETAG = 67.1;
export const SKI_KALLA =
  "https://www.kvalitetsindex.se/wp-content/uploads/2025/10/ski-mobil-2025.pdf";

export function privataFor(slug: string): Abonnemang[] {
  return ABONNEMANG.filter((a) => a.operator === slug && a.kundtyp === "privat");
}

/** Billigaste abonnemanget som alla kan köpa (utan ålders- eller studentkrav), annars billigaste totalt. */
export function billigasteFor(slug: string): Abonnemang | undefined {
  const alla = privataFor(slug);
  const oppna = alla.filter((a) => !arVillkorat(a));
  return sortera(oppna.length ? oppna : alla, "snitt-ar")[0];
}

export function samtNat(o: Operator): Operator[] {
  return OPERATORER.filter((x) => x.nat === o.nat && x.slug !== o.slug && x.aktiv);
}

/** "Ingen bindningstid", "0–24 mån" eller null om inget är känt. */
export function bindningsSpann(lista: Abonnemang[]): string | null {
  const kanda = lista.map((a) => a.bindning).filter((b): b is number => b != null);
  if (!kanda.length) return null;
  const min = Math.min(...kanda);
  const max = Math.max(...kanda);
  if (max === 0) return "Ingen bindningstid";
  if (min === max) return `${max} mån`;
  return `${min}–${max} mån`;
}

export function surfSpann(lista: Abonnemang[]): string | null {
  if (!lista.length) return null;
  const gbs = lista.filter((a) => a.gb != null).map((a) => a.gb as number);
  const harObegr = lista.some((a) => a.gb == null);
  if (!gbs.length) return "Obegränsad";
  const min = Math.min(...gbs);
  const max = Math.max(...gbs);
  return `${gbText(min)}${harObegr ? " till obegränsad" : min !== max ? ` till ${gbText(max)}` : ""}`;
}

export type Qa = { q: string; a: string; kalla?: string };

/** Frågor på operatörssidan, byggda ur datan. */
export function operatorFaq(o: Operator): Qa[] {
  const nat = MOBILNAT[o.nat];
  const lista = privataFor(o.slug);
  const billigast = billigasteFor(o.slug);
  const fragor: Qa[] = [];
  fragor.push({
    q: `Vilket nät använder ${o.namn}?`,
    a:
      o.grupp === "natagare"
        ? `${o.namn} äger och driver ${nat.namn} själv.${o.nat === "tele2" || o.nat === "telenor" ? " Radionätet för 4G och 5G delas med " + (o.nat === "tele2" ? "Telenor" : "Tele2") + " genom det samägda bolaget Net4Mobility." : ""}`
        : `${o.namn} kör i ${nat.namn}. Täckningen är därför densamma som för andra operatörer i samma nät.`,
  });
  if (billigast) {
    fragor.push({
      q: `Vad kostar ${o.namn}s billigaste mobilabonnemang?`,
      a: `${o.namn} ${billigast.namn} med ${gbText(billigast.gb).toLowerCase()} surf kostar ${kr(billigast.pris)} i månaden ordinarie${
        billigast.kampanjpris != null && billigast.kampanjManader
          ? `, med kampanjpris ${kr(billigast.kampanjpris)} de första ${billigast.kampanjManader} månaderna`
          : ""
      }. I snitt blir det ${kr(snittForstaAret(billigast))} per månad första året. ${bindningText(billigast.bindning)}.`,
      kalla: `${o.namn}s webbplats, kontrollerad ${o.kontrollerad}`,
    });
  }
  const bindning = bindningsSpann(lista);
  if (bindning) {
    fragor.push({
      q: `Har ${o.namn} bindningstid?`,
      a:
        bindning === "Ingen bindningstid"
          ? `Nej, de abonnemang vi jämför hos ${o.namn} har ingen bindningstid.${o.villkor.uppsagningstid ? ` Uppsägning: ${o.villkor.uppsagningstid}` : ""}`
          : `Det beror på abonnemanget. Hos ${o.namn} har de abonnemang vi jämför ${bindning} bindningstid.${o.villkor.uppsagningstid ? ` Uppsägning: ${o.villkor.uppsagningstid}` : ""}`,
    });
  }
  if (o.esim != null) {
    fragor.push({
      q: `Har ${o.namn} eSIM?`,
      a: o.esim
        ? `Ja, ${o.namn} erbjuder eSIM. Din telefon måste stödja eSIM.`
        : `Nej, enligt ${o.namn}s webbplats erbjuds inte eSIM i dag.`,
    });
  }
  if (o.skiPrivat != null) {
    fragor.push({
      q: `Hur nöjda är ${o.namn}s kunder?`,
      a: `I Svenskt Kvalitetsindex mätning 2025 fick ${o.namn} ${o.skiPrivat.toString().replace(".", ",")} av 100 bland privatkunderna. Snittet för branschen var ${SKI_BRANSCH_PRIVAT.toString().replace(".", ",")}.`,
      kalla: "Svenskt Kvalitetsindex, SKI Mobil 2025",
    });
  }
  return fragor;
}

/* ---------------- Jämförelser mellan två operatörer ---------------- */

export type Par = { a: string; b: string };

/**
 * Paren som har en egen jämförelsesida. Ordningen i slugen följer listan
 * här, och den omvända ordningen leder inte till en egen sida.
 */
export const PAR: Par[] = [
  { a: "hallon", b: "comviq" },
  { a: "telia", b: "tele2" },
  { a: "telia", b: "telenor" },
  { a: "vimla", b: "hallon" },
  { a: "tele2", b: "telenor" },
  { a: "tre", b: "telia" },
  { a: "comviq", b: "tele2" },
  { a: "hallon", b: "tre" },
  { a: "fello", b: "telia" },
  { a: "vimla", b: "telenor" },
  { a: "vimla", b: "comviq" },
  { a: "chilimobil", b: "hallon" },
  { a: "fello", b: "vimla" },
  { a: "tellus", b: "comviq" },
  { a: "tre", b: "tele2" },
  { a: "katshing", b: "hallon" },
];

export function parSlug(p: Par): string {
  return `${p.a}-vs-${p.b}`;
}

export function hittaPar(slug: string): Par | undefined {
  return PAR.find((p) => parSlug(p) === slug);
}

export function parFor(slug: string): Par[] {
  return PAR.filter((p) => p.a === slug || p.b === slug);
}

/** Paren där båda operatörerna finns i datan. */
export const GILTIGA_PAR = PAR.filter((p) => operator(p.a) && operator(p.b));

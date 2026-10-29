import type { Bredband } from "./typer";
import { BREDBAND_DATA } from "./bredband-data";
import { operator } from "./data";

export { BREDBAND_FAKTA, BREDBAND_KONTROLLERAD } from "./bredband-data";

/** Total kostnad för ett antal månader, med kampanj och startavgift. Routern räknas inte in. */
export function bbTotal(b: Bredband, manader: number): number {
  const pris = b.pris ?? 0;
  const kamp = b.kampanjpris != null ? Math.min(b.kampanjManader ?? 0, manader) : 0;
  return Math.round(
    kamp * (b.kampanjpris ?? pris) + (manader - kamp) * pris + (b.startavgift ?? 0),
  );
}

export function bbSnitt(b: Bredband): number {
  return Math.round(bbTotal(b, 12) / 12);
}

/** Operatörer med mobilt bredband som inte har mobilabonnemang i jämförelsen. */
const EXTRA_NAMN: Record<string, string> = { bredband2: "Bredband2" };

export function bbOperator(b: Bredband): string {
  return operator(b.operator)?.namn ?? EXTRA_NAMN[b.operator] ?? b.operator;
}

/** Erbjudandets namn utan operatörens namn först ("Fello Mobilt Bredband 5 GB" blir "Mobilt Bredband 5 GB"). */
export function bbKortNamn(b: Bredband): string {
  const op = bbOperator(b);
  const forsta = op.split(" ")[0];
  for (const p of [op, forsta]) {
    if (b.namn.startsWith(p + " ")) return b.namn.slice(p.length + 1);
  }
  return b.namn;
}

export function bbNamn(b: Bredband): string {
  return `${bbOperator(b)} ${bbKortNamn(b)}`;
}

/** Länk till erbjudandet. Källor som är operatörens API ersätts med operatörens webbplats. */
export function bbLank(b: Bredband): string {
  return /\/\/api\./.test(b.kalla) ? (operator(b.operator)?.webb ?? b.kalla) : b.kalla;
}

const sortera = (l: Bredband[]) => [...l].sort((a, b) => bbSnitt(a) - bbSnitt(b));

/** Erbjudanden i jämförelsen, billigast snittpris första året först. */
export const BREDBAND = sortera(
  BREDBAND_DATA.filter((b) => b.kategori === "jamfor" && b.pris != null),
);
export const BB_STUGA = BREDBAND_DATA.filter((b) => b.kategori === "stuga");
export const BB_EXTRA = sortera(
  BREDBAND_DATA.filter((b) => b.kategori === "extra" && b.pris != null),
);

export const BB_OBEGR = BREDBAND.filter((b) => b.gb == null);
export const BB_ROUTER = BREDBAND.filter((b) => b.typ === "router");
export const BB_SURFSIM = BREDBAND.filter((b) => b.typ === "surfsim");
export const BB_UTAN = BREDBAND.filter((b) => b.bindning === 0);
export const BB_OPERATORER = [...new Set(BREDBAND.map((b) => b.operator))];

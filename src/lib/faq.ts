import { FAQ_GROUPS, type FaqSida, type FragaPa, type Qa } from "@/components/faq-section";

/**
 * Regeln för FAQ på undersidor.
 *
 * En undersida visar högst tre frågor. Strukturerad data får bara innehålla
 * de frågor som faktiskt syns på sidan, annars bryter vi mot Googles
 * riktlinjer för FAQPage. Därför ska både faqJsonLd och FaqAccordion matas
 * med samma lista, och den listan ska gå genom sidansFragor.
 */
export const FRAGOR_PA_UNDERSIDA = 3;

/**
 * `antal` är valfritt och används bara av pelarsidorna, som visar alla sina
 * frågor eftersom det är de som ska ranka på dem. Övriga sidor använder
 * standardvärdet.
 */
export function sidansFragor<T>(alla: readonly T[], antal: number = FRAGOR_PA_UNDERSIDA): T[] {
  return alla.slice(0, antal);
}

/**
 * Hämtar en sidas frågor ur FAQ_GROUPS på frågetext, i den ordning de listas.
 * Svaren underhålls bara i registret.
 *
 * `fragor` är typad mot sidans egen grupp. En felstavad fråga, eller en fråga
 * som hör till en annan sida, ger därför fel redan i `tsc`. Kontrollen vid
 * körning finns kvar som skyddsnät.
 */
export function fragorUrRegistret<S extends FaqSida>(sida: S, fragor: readonly FragaPa<S>[]): Qa[] {
  const grupper: readonly { sida: string; items: readonly Qa[] }[] = FAQ_GROUPS;
  const egna = grupper.filter((g) => g.sida === sida).flatMap((g) => g.items);
  return fragor.map((q) => {
    const traff = egna.find((it) => it.q === q);
    if (!traff) {
      throw new Error(`fragorUrRegistret: frågan "${q}" finns inte i FAQ_GROUPS för ${sida}.`);
    }
    return traff;
  });
}

/**
 * Fyller i platshållare som {datum} eller {manadsavgift} i registrets svar och
 * källor. Uppgifter som kommer ur databasen skrivs aldrig in för hand i
 * registret, eftersom de då glider isär från siffrorna på samma sida.
 *
 * Saknas ett värde (null) tas meningen med platshållaren bort ur svaret, och
 * källan tas bort helt. Hellre ett kortare svar än en siffra utan underlag.
 */
export function fyllPlatshallare(
  fragor: readonly Qa[],
  varden: Record<string, string | null>,
): Qa[] {
  const fyll = (text: string): string | null => {
    let saknas = false;
    const ut = text.replace(/\{(\w+)\}/g, (hel, nyckel: string) => {
      const varde = varden[nyckel];
      if (varde === null || varde === undefined) {
        saknas = true;
        return hel;
      }
      return varde;
    });
    return saknas ? null : ut;
  };
  return fragor.map((fraga) => {
    const meningar = fraga.a.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [fraga.a];
    const a = meningar
      .map(fyll)
      .filter((m): m is string => m !== null)
      .join("")
      .trim();
    const kalla = fraga.kalla ? (fyll(fraga.kalla) ?? undefined) : undefined;
    return { ...fraga, a, kalla };
  });
}

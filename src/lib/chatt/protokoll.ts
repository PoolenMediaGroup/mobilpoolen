/**
 * AI-chatten: det som delas mellan webbläsaren och servern.
 *
 * Samma fil finns i Mobilpoolens repo. Ändra i båda.
 *
 * Flödet:
 *  1. Webbläsaren skickar hela samtalet (bara text) till POST /api/chatt.
 *  2. Servern svarar med en ström av JSON-rader (NDJSON), en händelse per rad.
 *  3. Samtalet finns bara i webbläsarens minne. Inget sparas i webbläsaren.
 */

export type ChattRoll = "user" | "assistant";

export type ChattMeddelande = { roll: ChattRoll; text: string };

/** Knapp som chatten visar under ett svar. `id` styr vad knappen gör. */
export type ChattAtgard = {
  id: string;
  etikett: string;
  /** Intern sökväg. Saknas den är det ett formulär i chatten (t.ex. väntelistan). */
  href?: string;
};

export type ChattHandelse =
  /** En bit av svaret. Läggs på det som redan visats. */
  | { t: "text"; d: string }
  /** Kort lägesrad medan ett verktyg körs, t.ex. "Läser Elpriset idag". */
  | { t: "status"; d: string }
  | { t: "atgard"; atgard: ChattAtgard }
  | { t: "klar" }
  | { t: "fel"; kod: ChattFelkod };

export type ChattFelkod =
  | "inte_igang"
  | "for_manga"
  | "dagstak"
  | "for_langt"
  | "ogiltig"
  | "ai_fel"
  | "natverk";

export const CHATT_FELTEXT: Record<ChattFelkod, string> = {
  inte_igang: "Chatten är inte igång just nu.",
  for_manga: "Du har skickat många frågor på kort tid. Vänta en stund och försök igen.",
  dagstak: "Chatten har fått väldigt många frågor i dag. Försök igen i morgon.",
  for_langt: "Samtalet har blivit långt. Börja om för att ställa fler frågor.",
  ogiltig: "Meddelandet gick inte att skicka. Försök igen.",
  ai_fel: "Något gick fel när svaret skulle skrivas. Försök igen.",
  natverk: "Det gick inte att nå oss. Kontrollera anslutningen och försök igen.",
};

export const CHATT_GRANSER = {
  /** Meddelanden i ett samtal, frågor och svar räknade var för sig. */
  maxMeddelanden: 30,
  /** Tecken i en fråga från besökaren. */
  maxFraga: 600,
  /** Tecken i ett tidigare svar som skickas tillbaka. Längre svar kortas. */
  maxSvar: 4000,
  /** Tecken i hela samtalet. */
  maxTotalt: 40_000,
} as const;

/**
 * Kontrollerar och rensar samtalet från webbläsaren. Returnerar null om det
 * inte går att använda. Körs på servern, och i webbläsaren innan det skickas.
 */
export function rensaSamtal(v: unknown): ChattMeddelande[] | null {
  if (!Array.isArray(v) || v.length === 0) return null;
  if (v.length > CHATT_GRANSER.maxMeddelanden) return null;
  const ut: ChattMeddelande[] = [];
  let totalt = 0;
  for (const m of v) {
    if (!m || typeof m !== "object") return null;
    const { roll, text } = m as Record<string, unknown>;
    if (roll !== "user" && roll !== "assistant") return null;
    if (typeof text !== "string") return null;
    const ren = text.split(String.fromCharCode(0)).join("").trim();
    if (!ren) continue;
    if (roll === "user" && ren.length > CHATT_GRANSER.maxFraga) return null;
    const kortad = roll === "assistant" ? ren.slice(0, CHATT_GRANSER.maxSvar) : ren;
    totalt += kortad.length;
    // Två meddelanden från samma roll i rad slås ihop, så att API:t får växelvis ordning.
    const sista = ut[ut.length - 1];
    if (sista && sista.roll === roll) sista.text += `\n\n${kortad}`;
    else ut.push({ roll, text: kortad });
  }
  if (totalt > CHATT_GRANSER.maxTotalt) return null;
  if (!ut.length || ut[0].roll !== "user" || ut[ut.length - 1].roll !== "user") return null;
  return ut;
}

/** True om samtalet är för långt för att skickas, så att besökaren får börja om. */
export function arForLangt(samtal: { text: string }[]): boolean {
  if (samtal.length > CHATT_GRANSER.maxMeddelanden) return true;
  const totalt = samtal.reduce((n, m) => n + Math.min(m.text.length, CHATT_GRANSER.maxSvar), 0);
  return totalt > CHATT_GRANSER.maxTotalt;
}

/** Bara egna sökvägar. Skyddar mot länkar ut från sajten och mot javascript:-länkar. */
export function arInternSokvag(href: string): boolean {
  return /^\/(?!\/)[a-z0-9\-/._~%?=&#]*$/i.test(href) && !href.includes("..");
}

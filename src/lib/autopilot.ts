/**
 * Mobilpoolen Autopilot på sajten: adressen till funktionen i Supabase och texterna
 * som kunden godkänner. Samma texter står i supabase/functions/autopilot/index.ts, där
 * de sparas. Ändras en text här ska den ändras där också.
 *
 * Autopilot har ett eget Supabase-projekt (Mobilpoolen), skilt från Elpoolens.
 * Den publika nyckeln får stå i koden: tabellerna har RLS utan policyer, så nyckeln
 * kan bara anropa funktionen, inte läsa några uppgifter.
 */

/** Sätts när Supabase-projektet Mobilpoolen finns. Null: formuläret visar att Autopilot öppnar snart. */
export const AUTOPILOT_URL: string | null = null;
export const AUTOPILOT_NYCKEL: string | null = null;

export const AUTOPILOT_OPPEN = AUTOPILOT_URL != null && AUTOPILOT_NYCKEL != null;

export const SAMTYCKE =
  "Ja, mejla mig innan min bindningstid eller rabatt tar slut, med de abonnemang som passar mig bäst just då. Utan bindningstid eller rabatt mejlar ni mig högst två gånger per år. Jag väljer själv om jag vill byta och kan avsluta när jag vill.";
export const SMS_SAMTYCKE =
  "Ja, sms:a mig också innan min bindningstid eller rabatt tar slut, när Mobilpoolen börjar skicka sms.";
export const NYHETSBREV = "Ja, skicka mig Mobilpoolens nyhetsbrev med spartips.";
export const FULLMAKT_INTRESSE =
  "Jag är intresserad av att Mobilpoolen byter åt mig med fullmakt när det blir möjligt.";

type Svar = { ok: boolean; status?: string; fel?: string; fornamn?: string };

export async function anropaAutopilot(kropp: Record<string, unknown>): Promise<Svar> {
  if (!AUTOPILOT_URL || !AUTOPILOT_NYCKEL) return { ok: false, fel: "stangd" };
  try {
    const res = await fetch(AUTOPILOT_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: AUTOPILOT_NYCKEL,
        authorization: `Bearer ${AUTOPILOT_NYCKEL}`,
      },
      body: JSON.stringify(kropp),
    });
    const data = (await res.json().catch(() => ({}))) as Svar;
    return { ...data, ok: res.ok && data.ok !== false };
  } catch {
    return { ok: false, fel: "natverk" };
  }
}

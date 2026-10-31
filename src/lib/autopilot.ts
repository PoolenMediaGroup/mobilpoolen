/**
 * Mobilpoolen Autopilot på sajten: adressen till funktionen i Supabase och texterna
 * som kunden godkänner. Samma texter står i supabase/functions/mobilpoolen-autopilot/index.ts, där
 * de sparas. Ändras en text här ska den ändras där också.
 *
 * Autopilot ligger i PMG:s gemensamma Supabase-projekt (Elpoolen), med egna tabeller och
 * funktioner som börjar på mobilpoolen_. Den publika nyckeln får stå i koden: tabellerna
 * har RLS utan policyer, så nyckeln kan bara anropa funktionen, inte läsa några uppgifter.
 */
import { mobilpoolenSupabase } from "@/lib/mobilpoolen-supabase";

/** Null: formuläret visar att Autopilot öppnar snart. */
export const AUTOPILOT_URL: string | null =
  "https://rilpjkuozcglwnxwfxgl.supabase.co/functions/v1/mobilpoolen-autopilot";
export const AUTOPILOT_NYCKEL: string | null = "sb_publishable__kv9a1vIC2DQ1lGIwt0Fdg_0qZYfWaU";

export const AUTOPILOT_OPPEN = AUTOPILOT_URL != null && AUTOPILOT_NYCKEL != null;

/**
 * `false` före lansering: formuläret är öppet, men sista steget blir en intresseanmälan
 * (tabellen mobilpoolen_autopilot_intresse, SQL i supabase/autopilot/intresse.sql). Inga mejl
 * skickas. När bevakningen och mejlen är igång: sätt till `true`, mejla intresseanmälningarna
 * en gång och be dem bekräfta.
 */
export const AUTOPILOT_LANSERAD = false;

/** Samma text står i funktionen mobilpoolen_autopilot_intresse i intresse.sql. Ändra båda. */
export const INTRESSE_SAMTYCKE =
  "Ja, mejla mig när Mobilpoolen Autopilot öppnar och spara uppgifterna om mitt abonnemang till dess. Bevakningen startar först när jag har bekräftat i mejlet.";

export async function anmalIntresse(kropp: {
  namn: string;
  epost: string;
  webbplats: string;
  samtycke: boolean;
  nyhetsbrev: boolean;
  fullmakt_intresse: boolean;
  kalla: string;
  uppgifter: Record<string, unknown>;
}): Promise<Svar> {
  if (!mobilpoolenSupabase) return { ok: false, fel: "stangd" };
  try {
    const { error } = await mobilpoolenSupabase.rpc("mobilpoolen_autopilot_intresse", {
      p: kropp,
    });
    return error ? { ok: false, fel: error.message } : { ok: true };
  } catch {
    return { ok: false, fel: "natverk" };
  }
}

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

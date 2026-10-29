/**
 * AI-chatten: hämtar de sidor som troligen svarar på frågan innan Claude anropas.
 *
 * Samma fil finns i Mobilpoolens repo. Ändra i båda.
 *
 * Varför: när Claude själv läser en sida med verktyget las_sida krävs ett extra
 * varv mot API:t, och svaret efter ett verktygsanrop kommer i ett klump i stället
 * för ord för ord. Med sidorna redan i frågan räcker oftast ett varv, och svaret
 * strömmar. Verktyget finns kvar för det som förhämtningen missar.
 *
 * Urvalet är enkel ordmatchning mot llms.txt: rubrik, beskrivning och sökväg.
 */

export type LlmsSida = { titel: string; sokvag: string; beskrivning: string };

const STOPPORD = new Set(
  (
    "och att det som för med den till har inte på jag kan vad hur är var om ett en " +
    "min mitt mina du dig din ditt vi oss er ni de dem man när nu så också eller men " +
    "från hos vid över under efter innan mer mest bara alla allt någon något kan ska " +
    "skulle vill vilken vilket vilka finns får blir bli hej tack bra mycket lite"
  ).split(" "),
);

/** Ordstammar: gemener, bara bokstäver och siffror, högst fem tecken. */
export function stammar(text: string): string[] {
  return (text.toLowerCase().match(/[a-zåäöé0-9]+/g) ?? [])
    .filter((o) => o.length >= 3 && !STOPPORD.has(o))
    .map((o) => o.slice(0, 5));
}

/** Läser listan över sidor ur llms.txt ("- [Titel](https://sajt/sokvag): beskrivning"). */
export function tolkaLlms(llms: string): LlmsSida[] {
  const ut: LlmsSida[] = [];
  const sett = new Set<string>();
  for (const rad of llms.split("\n")) {
    const m = rad.match(/^\s*-\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*:?\s*(.*)$/);
    if (!m) continue;
    let sokvag: string;
    try {
      const u = new URL(m[2]);
      if (u.hash) continue;
      sokvag = u.pathname.replace(/\/+$/, "") || "/";
    } catch {
      continue;
    }
    if (sett.has(sokvag)) continue;
    sett.add(sokvag);
    ut.push({ titel: m[1], sokvag, beskrivning: m[3].slice(0, 400) });
  }
  return ut;
}

/**
 * Väljer de sidor som bäst matchar frågan. Rubriken väger tyngst, sedan sökvägen,
 * sedan beskrivningen. Sidor under `minstPoang` tas inte med.
 */
export function valjSidor(sidor: LlmsSida[], fraga: string, max = 2, minstPoang = 3): LlmsSida[] {
  const ord = [...new Set(stammar(fraga))];
  if (!ord.length) return [];
  const poang = sidor.map((s) => {
    const t = new Set(stammar(s.titel));
    const v = new Set(stammar(s.sokvag.replace(/[-/]/g, " ")));
    const b = new Set(stammar(s.beskrivning));
    let p = 0;
    for (const o of ord) {
      if (t.has(o)) p += 3;
      if (v.has(o)) p += 2;
      if (b.has(o)) p += 1;
    }
    // Korta, generella sidor (startsidan) ska inte vinna på bara ett ord.
    if (s.sokvag === "/") p -= 1;
    return { s, p };
  });
  const basta = Math.max(0, ...poang.map((x) => x.p));
  // Bara sidor nära den bästa träffen: en svag andraträff kostar mer än den ger.
  return poang
    .filter((x) => x.p >= minstPoang && x.p >= basta * 0.6)
    .sort((a, b) => b.p - a.p)
    .slice(0, max)
    .map((x) => x.s);
}

/** Lägger ihop hämtade texter till ett block som läggs före besökarens fråga. */
export function sajtinnehall(delar: string[]): string | null {
  const fyllda = delar.filter((d) => d && d.trim());
  if (!fyllda.length) return null;
  return `<sajtinnehall>\nHämtat automatiskt från sajten för den här frågan. Använd det i första hand. Läs fler sidor med las_sida bara om det här inte räcker.\n\n${fyllda.join("\n\n---\n\n")}\n</sajtinnehall>`;
}

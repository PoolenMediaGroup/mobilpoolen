// Prisvakt för mobilpoolen.se. Körs en gång per dygn från Elpoolens Supabase-projekt
// (samma upplägg som mobilpoolen-vakthund och Elpoolens daglig-synk).
//
// Hämtar varje bolags källsida (startpaket.kalla_url) och letar efter exakt de belopp
// som står i databasen. Datumet flyttas fram BARA på rader där varje publicerat belopp
// hittas på källsidan i dag. Ändrar aldrig något pris. Allt som inte stämmer lämnas
// orört och mejlas, så att en människa kontrollerar och rättar.
//
// Rader utan publicerat pris bekräftas om sidan svarar och fortfarande inte visar
// något månadspris. Visar sidan plötsligt "kr/mån" flaggas raden i stället.
//
// Anrop: POST med x-autopilot-secret. Body {"dry_run": true} kör allt utan att skriva
// eller mejla och returnerar resultatet per rad.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Mobilpoolen prisvakt <hej@send.elpoolen.se>";
const NOTIFY = "vakthunden@mobilpoolen.se";
// Mobilpoolens publika nyckel, samma som webbläsaren använder. Ska ligga i klartext.
const LARM_REST = "https://ceafpihnphtcysdnowdg.supabase.co/rest/v1";
const LARM_KEY = "sb_publishable__Q_b3eEnZyBQBO0SsJXlwA_78XW2-eH";
const UA =
  "Mozilla/5.0 (compatible; MobilpoolenPrisvakt/1.0; +https://mobilpoolen.se/sa-jamfor-vi; info@mobilpoolen.se)";
const UPPREPA_EFTER_TIMMAR = 72;

type Rad = {
  paket_id: string;
  bolag: string;
  paket: string;
  startkostnad_kr: number | null;
  manadsavgift_kr: number | null;
  arsavgift_kr: number | null;
  kalla_url: string | null;
  kontrollerad_datum: string | null;
};

type Utfall = "bekraftad" | "avvikelse" | "ej_nadd" | "kontrollera";

type Resultat = {
  paket_id: string;
  bolag: string;
  paket: string;
  utfall: Utfall;
  orsak?: string;
  hittade?: number[];
  saknas?: number[];
};

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

function likaNycklar(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hemlighet(db: SupabaseClient, name: string) {
  const { data } = await db.from("app_secrets").select("value").eq("name", name).maybeSingle();
  return data?.value ? String(data.value) : null;
}

async function hamta(url: string, ms: number, init: RequestInit = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Gör alla sorters mellanslag (nbsp, smalt mellanslag, entiteter) till vanliga. */
export function normalisera(html: string): string {
  return html
    .replace(/&(nbsp|thinsp|ensp|emsp);/gi, " ")
    .replace(/&#(160|8201|8239|8194|8195);/g, " ")
    .replace(/&#x(a0|2009|202f|2002|2003);/gi, " ")
    .replace(/[\u00a0\u2009\u202f\u2002\u2003]/g, " ");
}

/**
 * Finns beloppet som ett eget tal på sidan? Godtar "3990", "3 990", "3.990" och "3,990",
 * men inte "13 990", "449 000" eller "4499". Decimaler som "449,00" godtas.
 */
export function finnsBelopp(text: string, belopp: number): boolean {
  const s = String(Math.round(belopp));
  const monster = s.length > 3 ? `${s.slice(0, -3)}[ .,]?${s.slice(-3)}` : s;
  const re = new RegExp(`(?<!\\d)(?<!\\d[ .,])${monster}(?!\\d)(?![ .,]\\d{3}(?!\\d))`);
  return re.test(text);
}

/** Ser sidan ut att visa ett månadspris? Används för rader där vi säger att priset inte publiceras. */
export function visarManadspris(text: string): boolean {
  return /\d[\d ]*(,\d{2})?\s?(kr|:-)\s?(\/|per|i)\s?(mån|månad)/i.test(text);
}

function belopp(r: Rad): number[] {
  return [r.startkostnad_kr, r.manadsavgift_kr, r.arsavgift_kr]
    .map((v) => (v === null || v === undefined ? null : Number(v)))
    .filter((v): v is number => v !== null && Number.isFinite(v) && v > 0);
}

function stockholmIdag() {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
}

const fingerprint = (r: Resultat[]) =>
  r
    .filter((x) => x.utfall !== "bekraftad")
    .map((x) => `${x.paket_id}:${x.utfall}`)
    .sort()
    .join("|");

async function sendEmail(subject: string, text: string) {
  if (!RESEND_API_KEY) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [NOTIFY], subject, text }),
  });
  if (!res.ok) console.error("resend fel:", res.status, (await res.text()).slice(0, 200));
  return res.ok;
}

function mejltext(problem: Resultat[], bekraftade: number) {
  const etikett: Record<Utfall, string> = {
    bekraftad: "",
    avvikelse: "Beloppet hittas inte längre på källsidan",
    ej_nadd: "Källsidan gick inte att läsa",
    kontrollera: "Sidan visar nu ett månadspris, men vi säger att priset inte publiceras",
  };
  const rader = problem.map((p, i) => {
    const delar = [`${i + 1}. ${p.bolag}, ${p.paket}: ${etikett[p.utfall]}`];
    if (p.saknas?.length) delar.push(`   Saknas på sidan: ${p.saknas.join(", ")} kr`);
    if (p.orsak) delar.push(`   ${p.orsak}`);
    return delar.join("\n");
  });
  return (
    `Prisvakten kontrollerade larmbolagens källsidor ${stockholmIdag()}.\n\n` +
    `${bekraftade} rader stämmer och har fått dagens datum.\n` +
    `${problem.length} rader behöver ses över. Deras datum har inte rörts, och inga priser har ändrats:\n\n` +
    rader.join("\n\n") +
    `\n\nSå länge en rad står kvar flyttas inte datumet i startsidans hero, eftersom det visar det äldsta kontrolldatumet.` +
    `\nRätta beloppet i tabellen startpaket (och lägg en rad i prisandring) när du har läst källan själv.` +
    `\n\nSamma lista mejlas igen tidigast om ${UPPREPA_EFTER_TIMMAR} timmar om inget ändras.`
  );
}

Deno.serve(async (req) => {
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const nyckel = await hemlighet(db, "autopilot");
  const given = req.headers.get("x-autopilot-secret");
  if (!nyckel || !given || !likaNycklar(given, nyckel))
    return json({ ok: false, error: "forbidden" }, 403);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    /* tomt anrop är ok */
  }
  const dryRun = body.dry_run === true;

  const larmHeaders = { apikey: LARM_KEY, Authorization: `Bearer ${LARM_KEY}` };

  // 1. Raderna, precis som besökaren ser dem
  const res = await hamta(
    `${LARM_REST}/v_startpaket?select=paket_id,bolag,paket,startkostnad_kr,manadsavgift_kr,arsavgift_kr,kalla_url,kontrollerad_datum`,
    15000,
    { headers: larmHeaders },
  );
  if (!res.ok) return json({ ok: false, error: `v_startpaket svarar ${res.status}` }, 502);
  const rader = (await res.json()) as Rad[];

  // 2. Varje källsida hämtas en gång, även om flera paket delar den
  const sidor = new Map<string, { status: number | null; text: string; fel?: string }>();
  for (const url of new Set(rader.map((r) => r.kalla_url).filter((u): u is string => !!u))) {
    try {
      const r = await hamta(url, 20000, {
        redirect: "follow",
        headers: {
          "User-Agent": UA,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "sv-SE,sv;q=0.9",
        },
      });
      sidor.set(url, { status: r.status, text: normalisera(await r.text()) });
    } catch (e) {
      sidor.set(url, { status: null, text: "", fel: String(e).slice(0, 120) });
    }
  }

  // 3. Jämför
  const resultat: Resultat[] = rader.map((r) => {
    const bas = { paket_id: r.paket_id, bolag: r.bolag, paket: r.paket };
    if (!r.kalla_url) return { ...bas, utfall: "ej_nadd", orsak: "Raden saknar källa (kalla_url)" };
    const sida = sidor.get(r.kalla_url)!;
    if (sida.status !== 200 || sida.text.length < 2000) {
      return {
        ...bas,
        utfall: "ej_nadd",
        orsak: sida.fel ?? `${r.kalla_url} svarar ${sida.status} (${sida.text.length} tecken)`,
      };
    }
    const b = belopp(r);
    if (b.length === 0) {
      return visarManadspris(sida.text)
        ? { ...bas, utfall: "kontrollera", orsak: r.kalla_url }
        : { ...bas, utfall: "bekraftad" };
    }
    const hittade = b.filter((v) => finnsBelopp(sida.text, v));
    const saknas = b.filter((v) => !finnsBelopp(sida.text, v));
    return saknas.length
      ? { ...bas, utfall: "avvikelse", hittade, saknas, orsak: r.kalla_url }
      : { ...bas, utfall: "bekraftad", hittade };
  });

  const ok = resultat.filter((r) => r.utfall === "bekraftad");
  const problem = resultat.filter((r) => r.utfall !== "bekraftad");

  if (dryRun)
    return json({
      ok: problem.length === 0,
      dry_run: true,
      bekraftade: ok.length,
      problem,
      resultat,
    });

  // 4. Flytta fram datumet på de rader som stämmer. Inga priser ändras.
  let uppdaterade = 0;
  let skrivfel: string | null = null;
  if (ok.length) {
    try {
      const token = await hemlighet(db, "mobilpoolen_vakthund");
      if (!token) throw new Error("token saknas i app_secrets (mobilpoolen_vakthund)");
      const r = await hamta(`${LARM_REST}/rpc/prisvakt_bekrafta`, 15000, {
        method: "POST",
        headers: { ...larmHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ p_token: token, p_paket: ok.map((x) => x.paket_id) }),
      });
      if (!r.ok)
        throw new Error(`prisvakt_bekrafta svarar ${r.status}: ${(await r.text()).slice(0, 160)}`);
      uppdaterade = Number(await r.json()) || 0;
    } catch (e) {
      skrivfel = String(e).slice(0, 200);
    }
  }

  // 5. Mejla när något behöver ses över, men inte samma lista varje dag
  const finger = fingerprint(resultat);
  const { data: sista } = await db
    .from("mobilpoolen_prisvakt")
    .select("run_at, fingerprint")
    .eq("alerted", true)
    .order("run_at", { ascending: false })
    .limit(1);
  const timmar = sista?.[0]?.run_at
    ? (Date.now() - new Date(sista[0].run_at as string).getTime()) / 3600000
    : 999;
  const upprepning = sista?.[0]?.fingerprint === finger && timmar < UPPREPA_EFTER_TIMMAR;

  let alerted = false;
  if (skrivfel) {
    alerted = await sendEmail(
      "Prisvakt: kunde inte uppdatera kontrolldatum på mobilpoolen.se",
      `Kontrollen gick igenom men datumet kunde inte sparas.\n\n${skrivfel}`,
    );
  } else if (problem.length && !upprepning) {
    alerted = await sendEmail(
      `Prisvakt: ${problem.length} priser att se över på mobilpoolen.se`,
      mejltext(problem, ok.length),
    );
  }

  await db.from("mobilpoolen_prisvakt").insert({
    bekraftade: ok.length,
    uppdaterade,
    problem,
    fingerprint: finger,
    skrivfel,
    alerted,
  });

  return json({
    ok: problem.length === 0 && !skrivfel,
    bekraftade: ok.length,
    uppdaterade,
    problem,
    skrivfel,
    alerted,
  });
});

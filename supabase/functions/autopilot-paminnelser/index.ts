// Daglig bevakning för Mobilpoolen Autopilot. Anropas av pg_cron med headern
// x-autopilot-nyckel (värdet ligger i tabellen app_secrets, namn 'autopilot_cron').
// Body: { "mode": "dry" } listar bara, { "mode": "send" } skickar.
//
// Steg för en bindningstid eller rabatt som tar slut (bevaka_datum):
//   t30  30 dagar innan: dags att välja nytt, nummerflytten tar en till två veckor
//   t10  10 dagar innan: sista påminnelsen
//   t0   samma dag: priset går upp eller bindningen är slut, och bevakningen rullar ett halvår
// Utan bindningstid eller rabatt finns bara t0: en koll av priserna varje halvår.
//
// Varje steg loggas i autopilot_handelser med bevaka_datum, så att samma påminnelse
// aldrig skickas två gånger (unikt index i schema.sql).
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  FROM,
  REPLY_TO,
  SITE,
  avslutaLank,
  avslutsHuvuden,
  dagarTill,
  datumText,
  esc,
  forslagHtml,
  forslagText,
  hamtaForslag,
  knapp,
  kr,
  mejlram,
  plusManader,
  skickaMejl,
  textfot,
} from "../_delad/autopilot.ts";

type Steg = "t30" | "t10" | "t0";

const svar = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

// Konstant tid, så att svarstiden inte avslöjar hur många tecken som stämde.
function lika(a: string, b: string) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function steg(dagar: number, harAvtal: boolean): Steg | null {
  if (dagar <= 0 && dagar >= -7) return "t0";
  if (!harAvtal) return null;
  if (dagar <= 10 && dagar > 0) return "t10";
  if (dagar <= 30 && dagar > 10) return "t30";
  return null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return svar({ ok: false }, 405);
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: hemlig } = await db
    .from("app_secrets")
    .select("varde")
    .eq("namn", "autopilot_cron")
    .maybeSingle();
  const nyckel = req.headers.get("x-autopilot-nyckel") ?? "";
  if (!hemlig?.varde || !lika(nyckel, String(hemlig.varde))) return svar({ ok: false }, 401);

  let mode = "dry";
  try {
    mode = (await req.json()).mode === "send" ? "send" : "dry";
  } catch {
    // tom body betyder dry
  }

  const grans = plusManader(new Date().toISOString().slice(0, 10), 2);
  const { data: lista, error } = await db
    .from("autopilot_anmalningar")
    .select("*")
    .not("bekraftad", "is", null)
    .is("avslutad", null)
    .lte("bevaka_datum", grans);
  if (error) return svar({ ok: false, fel: error.message }, 500);

  const rapport: { id: string; steg: Steg; dagar: number; skickat: boolean }[] = [];
  const forslagCache = new Map<string, Awaited<ReturnType<typeof hamtaForslag>>>();

  for (const a of lista ?? []) {
    const dagar = dagarTill(a.bevaka_datum);
    const harAvtal = a.bevaka_datum === a.bindning_slutar || a.bevaka_datum === a.rabatt_slutar;
    const s = steg(dagar, harAvtal);
    if (!s) continue;

    const { data: gjord } = await db
      .from("autopilot_handelser")
      .select("id")
      .eq("anmalan_id", a.id)
      .eq("typ", `paminnelse_${s}`)
      .eq("data->>bevaka_datum", a.bevaka_datum)
      .limit(1);
    if (gjord && gjord.length) continue;

    if (mode === "dry") {
      rapport.push({ id: a.id, steg: s, dagar, skickat: false });
      continue;
    }

    const cacheNyckel = `${a.obegransad}|${a.surf_gb}|${a.eu_surf_gb}`;
    if (!forslagCache.has(cacheNyckel)) forslagCache.set(cacheNyckel, await hamtaForslag(a));
    const tre = forslagCache.get(cacheNyckel)!.forslag.slice(0, 3);

    const fornamn = String(a.namn).split(" ")[0];
    const rabatt = a.bevaka_datum === a.rabatt_slutar;
    const kostnad = a.manadskostnad != null ? Number(a.manadskostnad) : null;
    const efter = rabatt && a.ordinarie_pris != null ? Number(a.ordinarie_pris) : kostnad;
    const billigast = tre[0]?.snittForstaAret ?? null;
    const spar =
      efter != null && billigast != null && efter - billigast >= 20 ? efter - billigast : null;
    const nar = datumText(a.bevaka_datum);

    let amne: string;
    let ingress: string;
    if (!harAvtal) {
      amne = spar
        ? `Du kan sänka mobilräkningen med ${kr(spar)} i månaden`
        : "Halvårskoll av ditt mobilabonnemang";
      ingress = "Det har gått ett halvår, så vi har jämfört priserna åt dig igen.";
    } else if (s === "t30") {
      amne = rabatt ? `Din rabatt tar slut ${nar}` : `Din bindningstid går ut ${nar}`;
      ingress = rabatt
        ? `Om en månad, ${nar}, tar din rabatt hos ${a.operator ?? "operatören"} slut${efter != null ? ` och du betalar ${kr(efter)} i månaden` : ""}. Nu är en bra tid att välja nytt: en nummerflytt tar oftast en till två veckor.`
        : `Om en månad, ${nar}, går din bindningstid hos ${a.operator ?? "operatören"} ut. Då kan du byta utan kostnad. En nummerflytt tar oftast en till två veckor, så välj gärna nu.`;
    } else if (s === "t10") {
      amne = rabatt ? `Tio dagar kvar på din rabatt` : `Tio dagar kvar på din bindningstid`;
      ingress = `${nar} ${rabatt ? "tar din rabatt slut" : "går din bindningstid ut"}. Vill du inte betala mer än du behöver är det dags att välja nu.`;
    } else {
      amne = rabatt ? "Din rabatt har tagit slut" : "Din bindningstid har gått ut";
      ingress = rabatt
        ? `Din rabatt tog slut ${nar}${efter != null ? `, så nu betalar du ${kr(efter)} i månaden` : ""}. Du kan byta när som helst.`
        : `Din bindningstid gick ut ${nar}. Nu kan du byta utan kostnad.`;
    }

    const avsluta = avslutaLank(a.avsluta_token);
    const html = `<p>Hej ${esc(fornamn)}!</p>
<p>${esc(ingress)}</p>
${spar ? `<p><strong>Det billigaste abonnemanget med minst lika mycket surf kostar ${kr(billigast!)} i månaden i snitt första året, ${kr(spar)} mindre än ${rabatt && harAvtal ? "ditt pris efter rabatten" : "du betalar i dag"}.</strong></p>` : ""}
${tre.length ? `<table style="width:100%;border-collapse:collapse;font-size:14px">${forslagHtml(tre)}</table>` : ""}
${knapp(`${SITE}/#alla`, "Jämför alla abonnemang")}
<p>Du behöver inte säga upp ditt gamla abonnemang själv. Beställ hos den nya operatören och välj att flytta numret, så sköter de resten. <a href="${SITE}/guider/byta-operator-behalla-nummer" style="color:#3b28cc">Så byter du steg för steg</a>.</p>
<p>Har du redan bytt? Fyll i <a href="${SITE}/autopilot" style="color:#3b28cc">formuläret</a> igen med samma e-post, så bevakar vi ditt nya abonnemang.</p>
<p>Vänliga hälsningar<br>Leon, Mobilpoolen</p>`;

    const ok = await skickaMejl({
      from: FROM,
      to: [a.epost],
      reply_to: REPLY_TO,
      subject: amne,
      html: mejlram(html, avsluta),
      text: `Hej ${fornamn}!\n\n${ingress}\n\n${tre.length ? `Billigast just nu för dig:\n${forslagText(tre)}\n\n` : ""}Jämför alla: ${SITE}/#alla\n\nDu behöver inte säga upp ditt gamla abonnemang själv. Beställ hos den nya operatören och välj att flytta numret.\n\nVänliga hälsningar\nLeon, Mobilpoolen\n\n${textfot(avsluta)}`,
      headers: avslutsHuvuden(a.avsluta_token),
    });

    if (ok) {
      await db.from("autopilot_handelser").insert({
        anmalan_id: a.id,
        typ: `paminnelse_${s}`,
        data: { bevaka_datum: a.bevaka_datum, forslag: tre.map((f) => `${f.operator} ${f.namn}`) },
      });
      // Efter sista steget rullar bevakningen ett halvår, så att kunden aldrig tappas bort.
      if (s === "t0") {
        await db
          .from("autopilot_anmalningar")
          .update({ bevaka_datum: plusManader(a.bevaka_datum, 6) })
          .eq("id", a.id);
      }
    }
    rapport.push({ id: a.id, steg: s, dagar, skickat: ok });
  }

  return svar({ ok: true, mode, antal: rapport.length, rapport });
});

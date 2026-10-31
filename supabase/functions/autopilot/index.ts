// Mobilpoolen Autopilot: anmälan, bekräftelse och avslut.
//
// POST { action: "anmalan", ...uppgifter }  sparar och mejlar en bekräftelselänk
// POST { action: "bekrafta", token }        bekräftar e-posten, och först då börjar bevakningen
// POST { action: "avsluta", token }         avslutar (även List-Unsubscribe-Post med ?token=)
//
// Bekräftelse och avslut sker med en knapp på sajten, aldrig direkt när länken öppnas:
// mejlprogram förhämtar länkar för att leta skadlig kod.
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  NOTIFY,
  REPLY_TO,
  FROM,
  SITE,
  avslutaLank,
  avslutsHuvuden,
  dagarTill,
  datumText,
  esc,
  forslagHtml,
  forslagText,
  hamtaForslag,
  idag,
  knapp,
  kr,
  mejlram,
  plusManader,
  skickaMejl,
  textfot,
} from "../_delad/autopilot.ts";

const TILLATNA = ["https://mobilpoolen.se", "https://www.mobilpoolen.se"];
const tillaten = (o: string | null) =>
  !!o &&
  (TILLATNA.includes(o) ||
    /^https:\/\/[a-z0-9-]+-mobilpoolen\.leon-393\.workers\.dev$/.test(o) ||
    /^http:\/\/localhost:\d+$/.test(o));

function cors(o: string | null) {
  return {
    "Access-Control-Allow-Origin": tillaten(o) ? o! : TILLATNA[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
const svar = (b: unknown, s: number, o: string | null) =>
  new Response(JSON.stringify(b), {
    status: s,
    headers: { ...cors(o), "Content-Type": "application/json" },
  });

const EPOST_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATUM_RE = /^\d{4}-\d{2}-\d{2}$/;

// Samtyckestexterna sätts här, inte av klienten, så att det som sparas är det kunden såg.
// Samma texter står i src/lib/autopilot.ts.
const SAMTYCKE =
  "Ja, mejla mig innan min bindningstid eller rabatt tar slut, med de abonnemang som passar mig bäst just då. Utan bindningstid eller rabatt mejlar ni mig högst två gånger per år. Jag väljer själv om jag vill byta och kan avsluta när jag vill.";
const NYHETSBREV = "Ja, skicka mig Mobilpoolens nyhetsbrev med spartips.";
const SMS =
  "Ja, sms:a mig också innan min bindningstid eller rabatt tar slut, när Mobilpoolen börjar skicka sms.";
const FULLMAKT_INTRESSE =
  "Jag är intresserad av att Mobilpoolen byter åt mig med fullmakt när det blir möjligt.";

const supa = () =>
  createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

const text = (v: unknown, max: number) =>
  String(v ?? "")
    .trim()
    .replace(/[\r\n]+/g, " ")
    .slice(0, max);
const tal = (v: unknown, min: number, max: number): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", ".").replace(/\s/g, ""));
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};
const janej = (v: unknown): boolean | null => (v === true ? true : v === false ? false : null);

/** Datum direkt, eller räknat från antal månader kvar. Bara framtida datum inom fyra år. */
function slutdatum(datum: unknown, manader: unknown): string | null {
  const d = String(datum ?? "").trim();
  if (DATUM_RE.test(d) && !isNaN(new Date(d + "T00:00:00Z").getTime())) {
    const dagar = dagarTill(d);
    return dagar >= -31 && dagar <= 4 * 366 ? d : null;
  }
  const m = tal(manader, 0, 48);
  return m != null ? plusManader(idag(), Math.round(m)) : null;
}

async function anmalan(b: Record<string, unknown>, o: string | null) {
  // Honungsfält: botar fyller i det, människor ser det inte.
  if (typeof b.webbplats === "string" && b.webbplats.trim() !== "")
    return svar({ ok: true }, 200, o);
  if (b.samtycke !== true) return svar({ ok: false, fel: "samtycke" }, 400, o);

  const namn = text(b.namn, 100);
  const epost = text(b.epost, 200).toLowerCase();
  let mobil: string | null = text(b.mobil, 20).replace(/[\s-]/g, "") || null;
  if (mobil && /^07\d{8}$/.test(mobil)) mobil = "+46" + mobil.slice(1);
  if (!namn) return svar({ ok: false, fel: "namn" }, 400, o);
  if (!EPOST_RE.test(epost)) return svar({ ok: false, fel: "epost" }, 400, o);
  if (mobil && !/^\+467\d{8}$/.test(mobil)) return svar({ ok: false, fel: "mobil" }, 400, o);

  const bindning = ["ingen", "har", "vet_ej"].includes(String(b.bindning))
    ? String(b.bindning)
    : "vet_ej";
  const harRabatt = janej(b.har_rabatt);
  const bindningSlutar =
    bindning === "har" ? slutdatum(b.bindning_slutar, b.bindning_manader) : null;
  const rabattSlutar = harRabatt ? slutdatum(b.rabatt_slutar, b.rabatt_manader) : null;
  const obegransad = b.obegransad === true;

  // Vi bevakar det som kommer först: när rabatten tar slut stiger priset, när bindningen tar
  // slut kan kunden byta utan kostnad. Finns inget av dem tittar vi till om ett halvår.
  const datum = [bindningSlutar, rabattSlutar].filter((d): d is string => !!d).sort();
  const bevaka = datum[0] ?? plusManader(idag(), 6);

  const nyhetsbrev = b.nyhetsbrev === true;
  const fullmaktIntresse = b.fullmakt_intresse === true;
  const smsSamtycke = b.sms === true && !!mobil;

  const rad: Record<string, unknown> = {
    namn,
    epost,
    mobil,
    operator: text(b.operator, 60) || null,
    abonnemang: text(b.abonnemang, 120) || null,
    manadskostnad: tal(b.manadskostnad, 0, 5000),
    har_rabatt: harRabatt,
    ordinarie_pris: harRabatt ? tal(b.ordinarie_pris, 0, 5000) : null,
    rabatt_slutar: rabattSlutar,
    surf_gb: obegransad ? null : tal(b.surf_gb, 0, 5000),
    obegransad,
    fria_samtal: janej(b.fria_samtal),
    fria_sms: janej(b.fria_sms),
    eu_surf_gb: tal(b.eu_surf_gb, 0, 5000),
    utlandssamtal: ["ingar", "kostar", "anvander_inte", "vet_ej"].includes(String(b.utlandssamtal))
      ? String(b.utlandssamtal)
      : null,
    antal_sim: tal(b.antal_sim, 1, 20),
    femg: janej(b.femg),
    esim: janej(b.esim),
    bindning,
    bindning_slutar: bindningSlutar,
    uppsagningstid_man: tal(b.uppsagningstid_man, 0, 3),
    telefon_avbetalning: janej(b.telefon_avbetalning),
    avbetalning_slutar:
      b.telefon_avbetalning === true
        ? slutdatum(b.avbetalning_slutar, b.avbetalning_manader)
        : null,
    bevaka_datum: bevaka,
    vill_byta_nu: b.vill_byta_nu === true,
    fullmakt_intresse: fullmaktIntresse,
    nyhetsbrev,
    sms: smsSamtycke,
    samtycke_text: [
      SAMTYCKE,
      smsSamtycke ? SMS : null,
      nyhetsbrev ? NYHETSBREV : null,
      fullmaktIntresse ? FULLMAKT_INTRESSE : null,
    ]
      .filter(Boolean)
      .join(" "),
    kalla: ["autopilot", "jamforelse", "saga-upp", "startsida"].includes(String(b.kalla))
      ? String(b.kalla)
      : "autopilot",
    avslutad: null,
  };

  const db = supa();
  const { data: finns } = await db
    .from("autopilot_anmalningar")
    .select("id,uppdaterad")
    .ilike("epost", epost)
    .maybeSingle();

  // Spärr: samma adress sparas och mejlas högst en gång per tio minuter, så att ingen kan
  // fylla någon annans inkorg genom att skicka formuläret om och om igen.
  if (finns?.uppdaterad && Date.now() - new Date(finns.uppdaterad).getTime() < 10 * 60 * 1000) {
    return svar({ ok: true }, 200, o);
  }

  // En ändring måste bekräftas från inkorgen igen. Annars kan den som känner till en
  // e-postadress skriva över någon annans uppgifter. Bevakningen pausar tills dess.
  const bekraftaToken = crypto.randomUUID();
  rad.bekrafta_token = bekraftaToken;
  rad.bekraftad = null;

  const { error } = finns
    ? await db.from("autopilot_anmalningar").update(rad).eq("id", finns.id)
    : await db.from("autopilot_anmalningar").insert(rad);
  if (error) {
    console.error("spara fel:", error.message);
    return svar({ ok: false, fel: "spara" }, 500, o);
  }

  const fornamn = namn.split(" ")[0];
  const lank = `${SITE}/autopilot/bekrafta?token=${bekraftaToken}`;
  await skickaMejl({
    from: FROM,
    to: [epost],
    reply_to: REPLY_TO,
    subject: finns
      ? "Bekräfta dina nya uppgifter"
      : "Bekräfta din e-post för Mobilpoolen Autopilot",
    html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#16133a;max-width:540px">
<p>Hej ${esc(fornamn)}!</p>
<p>${finns ? "Du har ändrat dina uppgifter i Mobilpoolen Autopilot." : "Tack för att du startade Mobilpoolen Autopilot."} Klicka på knappen så att vi vet att det är din e-post. Bevakningen börjar när du har bekräftat.</p>
${knapp(lank, "Bekräfta och starta")}
<p style="font-size:13px;color:#6b6890">Var det inte du? Gör ingenting. Obekräftade uppgifter raderas efter 30 dagar.</p>
</div>`,
    text: `Hej ${fornamn}!\n\n${finns ? "Du har ändrat dina uppgifter i Mobilpoolen Autopilot." : "Tack för att du startade Mobilpoolen Autopilot."} Bekräfta din e-post så börjar bevakningen:\n${lank}\n\nVar det inte du? Gör ingenting. Obekräftade uppgifter raderas efter 30 dagar.`,
  });

  return svar({ ok: true }, 200, o);
}

async function bekrafta(b: Record<string, unknown>, o: string | null) {
  const token = String(b.token ?? "");
  if (!UUID_RE.test(token)) return svar({ ok: false, status: "ogiltig" }, 400, o);
  const db = supa();
  const { data: a } = await db
    .from("autopilot_anmalningar")
    .select("*")
    .eq("bekrafta_token", token)
    .maybeSingle();
  if (!a) return svar({ ok: false, status: "ogiltig" }, 404, o);
  const fornamn = String(a.namn).split(" ")[0];
  if (a.bekraftad && !a.avslutad) return svar({ ok: true, status: "redan", fornamn }, 200, o);

  await db
    .from("autopilot_anmalningar")
    .update({ bekraftad: new Date().toISOString(), avslutad: null })
    .eq("id", a.id);
  await db.from("autopilot_handelser").insert({ anmalan_id: a.id, typ: "bekraftad" });

  // Välkomstmejl: vad vi har registrerat, när vi hör av oss, och vad som är billigast just nu.
  const { forslag } = await hamtaForslag(a);
  const tre = forslag.slice(0, 3);
  const kostnad = a.manadskostnad != null ? Number(a.manadskostnad) : null;
  const billigast = tre[0]?.snittForstaAret ?? null;
  const spar =
    kostnad != null && billigast != null && kostnad - billigast >= 20 ? kostnad - billigast : null;
  const kanBytaNu =
    a.bindning === "ingen" || (a.bindning_slutar && dagarTill(a.bindning_slutar) <= 0);
  const avsluta = avslutaLank(a.avsluta_token);

  const narText =
    a.bindning_slutar || a.rabatt_slutar
      ? `Vi mejlar dig en månad innan ${datumText(a.bevaka_datum)}, när ${
          a.rabatt_slutar === a.bevaka_datum ? "din rabatt tar slut" : "din bindningstid går ut"
        }, och igen strax innan.`
      : `Du har ingen bindningstid eller rabatt som vi bevakar, så vi tittar till priserna åt dig igen ${datumText(a.bevaka_datum)}.`;

  const uppgifter = [
    a.operator ? `Operatör: ${a.operator}${a.abonnemang ? `, ${a.abonnemang}` : ""}` : null,
    kostnad != null ? `Du betalar: ${kr(kostnad)}/mån` : null,
    a.obegransad ? "Surf: obegränsad" : a.surf_gb != null ? `Surf: ${a.surf_gb} GB` : null,
    a.bindning_slutar ? `Bindningstid till: ${datumText(a.bindning_slutar)}` : null,
    a.rabatt_slutar ? `Rabatt till: ${datumText(a.rabatt_slutar)}` : null,
  ].filter(Boolean) as string[];

  const html = `<p>Hej ${esc(fornamn)}!</p>
<p>Klart, Mobilpoolen Autopilot är igång. ${esc(narText)} Du väljer alltid själv om du vill byta.</p>
${
  spar && kanBytaNu
    ? `<p><strong>Du kan byta redan nu.</strong> Det billigaste abonnemanget med minst lika mycket surf kostar ${kr(billigast!)} i månaden i snitt första året, ${kr(spar)} mindre än du betalar i dag.</p>`
    : ""
}
${tre.length ? `<p><strong>Billigast just nu för dig:</strong></p><table style="width:100%;border-collapse:collapse;font-size:14px">${forslagHtml(tre)}</table>` : ""}
${knapp(`${SITE}/#alla`, "Jämför alla abonnemang")}
<p><strong>Så här har vi registrerat dig:</strong><br>${uppgifter.map(esc).join("<br>")}</p>
<p>Har du bytt eller stämmer något inte? Fyll i formuläret på <a href="${SITE}/autopilot" style="color:#3b28cc">mobilpoolen.se/autopilot</a> igen med samma e-post, så uppdaterar vi.</p>
<p>Vänliga hälsningar<br>Leon, Mobilpoolen</p>`;

  await skickaMejl({
    from: FROM,
    to: [a.epost],
    reply_to: REPLY_TO,
    subject:
      spar && kanBytaNu
        ? `Du kan spara ${kr(spar)} i månaden redan nu`
        : "Klart, Autopilot bevakar ditt abonnemang",
    html: mejlram(html, avsluta),
    text: `Hej ${fornamn}!\n\nKlart, Mobilpoolen Autopilot är igång. ${narText} Du väljer alltid själv om du vill byta.\n\n${tre.length ? `Billigast just nu för dig:\n${forslagText(tre)}\n\n` : ""}Så här har vi registrerat dig:\n${uppgifter.join("\n")}\n\nVänliga hälsningar\nLeon, Mobilpoolen\n\n${textfot(avsluta)}`,
    headers: avslutsHuvuden(a.avsluta_token),
  });

  await skickaMejl({
    from: FROM,
    to: [NOTIFY],
    subject: `Ny Autopilot: ${a.namn}`.slice(0, 150),
    text: [
      `Namn: ${a.namn}`,
      `E-post: ${a.epost}`,
      `Mobil: ${a.mobil ?? "-"}`,
      `Operatör: ${a.operator ?? "-"} ${a.abonnemang ?? ""}`,
      `Kostnad: ${kostnad ?? "-"} kr/mån`,
      `Surf: ${a.obegransad ? "obegränsad" : (a.surf_gb ?? "-")} GB, EU ${a.eu_surf_gb ?? "-"} GB`,
      `Bindning: ${a.bindning} ${a.bindning_slutar ?? ""}`,
      `Rabatt: ${a.har_rabatt ? `ja, till ${a.rabatt_slutar ?? "?"}` : "nej"}`,
      `Bevakas: ${a.bevaka_datum}`,
      `Vill byta nu: ${a.vill_byta_nu ? "ja" : "nej"}`,
      `Intresserad av fullmakt: ${a.fullmakt_intresse ? "ja" : "nej"}`,
      `Sms: ${a.sms ? "ja" : "nej"}`,
      `Nyhetsbrev: ${a.nyhetsbrev ? "ja" : "nej"}`,
      `Källa: ${a.kalla}`,
    ].join("\n"),
  });

  return svar({ ok: true, status: "ok", fornamn }, 200, o);
}

async function avsluta(token: string, o: string | null) {
  if (!UUID_RE.test(token)) return svar({ ok: false, status: "ogiltig" }, 400, o);
  const db = supa();
  const { data: a } = await db
    .from("autopilot_anmalningar")
    .select("id,avslutad")
    .eq("avsluta_token", token)
    .maybeSingle();
  if (!a) return svar({ ok: false, status: "ogiltig" }, 404, o);
  if (a.avslutad) return svar({ ok: true, status: "redan" }, 200, o);
  // Telefonnumret behövs inte längre. Resten gallras efter 90 dagar (autopilot_gallra).
  await db
    .from("autopilot_anmalningar")
    .update({ avslutad: new Date().toISOString(), mobil: null, sms: false, nyhetsbrev: false })
    .eq("id", a.id);
  await db.from("autopilot_handelser").insert({ anmalan_id: a.id, typ: "avslutad" });
  return svar({ ok: true, status: "ok" }, 200, o);
}

Deno.serve(async (req) => {
  const o = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(o) });
  if (req.method !== "POST") return svar({ ok: false, fel: "metod" }, 405, o);

  // Ett-klicks-avslut från mejlprogrammet (RFC 8058): POST med ?token= och formulärdata.
  const url = new URL(req.url);
  if (url.searchParams.get("token") && url.searchParams.get("action") === "avsluta") {
    return avsluta(url.searchParams.get("token")!, o);
  }

  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return svar({ ok: false, fel: "json" }, 400, o);
  }
  if (b.action === "anmalan") return anmalan(b, o);
  if (b.action === "bekrafta") return bekrafta(b, o);
  if (b.action === "avsluta") return avsluta(String(b.token ?? ""), o);
  return svar({ ok: false, fel: "action" }, 400, o);
});

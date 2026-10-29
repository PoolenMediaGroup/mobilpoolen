// Notis och bekräftelse när någon skickar en offertförfrågan på mobilpoolen.se.
// Anropas av triggern offertforfragan_notis i Mobilpoolens databas (pg_net) med
// headern x-notis-secret. Körs i Elpoolens projekt eftersom det är där Resend
// och avsändardomänen send.elpoolen.se finns.
//
// Två mejl skickas:
//   1. Intern notis till gruppen Reg Offert (reg.offert@mobilpoolen.se).
//   2. Bekräftelse till kunden: vad som händer nu, vilka uppgifter som skickats
//      och hur man drar tillbaka förfrågan. Nytt i version 4 (1 oktober 2026).
//
// VERSION 4 ÄR INTE DRIFTSATT. Den ligger i repot för granskning. Driftsätt med
// Supabase MCP (deploy_edge_function, projekt rilpjkuozcglwnxwfxgl,
// verify_jwt=false) när Leon har godkänt texten i kundmejlet.
import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Mobilpoolen <hej@send.elpoolen.se>";
const NOTIFY = "reg.offert@mobilpoolen.se";
const REPLY_TO = "info@mobilpoolen.se";
const SITE = "https://mobilpoolen.se";

const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });

function likaNycklar(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const v = (x: unknown) => {
  if (x === null || x === undefined || x === "") return "-";
  if (typeof x === "boolean") return x ? "ja" : "nej";
  if (Array.isArray(x)) return x.length ? x.join(", ") : "-";
  return String(x)
    .replace(/[\r\n]+/g, " ")
    .slice(0, 2000);
};

const BOSTAD: Record<string, string> = {
  villa: "Villa",
  radhus: "Radhus",
  parhus: "Parhus",
  kedjehus: "Kedjehus",
  lagenhet: "Lägenhet",
  fritidshus: "Fritidshus",
};
const KUNDTYP: Record<string, string> = { foretag: "Företag", brf: "BRF", forening: "Förening" };
const START: Record<string, string> = {
  snarast: "Så snart som möjligt",
  inom_3_manader: "Inom tre månader",
  senare: "Senare",
  vet_inte: "Vet inte än",
};

async function sendEmail(payload: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error("resend fel:", res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

function kundmejl(r: Record<string, unknown>) {
  const forsta =
    String(r.fornamn ?? "")
      .trim()
      .split(/\s+/)[0] ?? "";
  const halsning = forsta ? `Hej ${forsta}!` : "Hej!";
  const org = r.kundtyp && r.kundtyp !== "privat";
  const vad = org
    ? `${KUNDTYP[String(r.kundtyp)] ?? "Organisation"}: ${v(r.organisation)}`
    : `${BOSTAD[String(r.bostadstyp)] ?? "Bostad"}${r.boyta_kvm ? `, ${r.boyta_kvm} kvm` : ""}`;
  const uppgifter = [
    vad,
    `Postnummer ${v(r.postnummer)}`,
    `Telefon ${v(r.telefon)}`,
    `E-post ${v(r.epost)}`,
  ];
  const stycken = [
    "Tack för din förfrågan. Vi skickar den till två till tre larmbolag som passar det du beskrev. De kontaktar dig med varsin offert.",
    "Du binder dig inte till något. Jämför offerterna i lugn och ro och välj själv om du vill gå vidare. Läs avtalet innan du skriver under, särskilt bindningstid och uppsägningstid.",
    "Mobilpoolen är gratis för dig. Vi får ersättning av larmbolagen när vi förmedlar en förfrågan.",
    "Vill du dra tillbaka förfrågan eller rätta en uppgift, svara på det här mejlet så ordnar vi det.",
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:520px">
<p>${esc(halsning)}</p>
${stycken.map((p) => `<p>${esc(p)}</p>`).join("\n")}
<p><strong>Det här skickade du:</strong><br>${uppgifter.map(esc).join("<br>")}</p>
<p>Vill du läsa på medan du väntar? <a href="${SITE}/guider/vad-kostar-ett-hemlarm" style="color:#A4161A">Så jämför du offerter på hemlarm</a>.</p>
<p>Vänliga hälsningar<br>Leon, Mobilpoolen</p>
<hr style="border:none;border-top:1px solid #e6e1e0;margin:24px 0">
<p style="font-size:12px;color:#6b6260">Du får det här mejlet eftersom du begärde offerter på mobilpoolen.se. Mobilpoolen drivs av PMG Poolen Media Group AB, org.nr 559602-5287. <a href="${SITE}/integritetspolicy" style="color:#A4161A">Integritetspolicy</a> · <a href="${SITE}/sa-tjanar-vi-pengar" style="color:#A4161A">Så tjänar vi pengar</a></p>
</div>`;
  const text = `${halsning}\n\n${stycken.join("\n\n")}\n\nDet här skickade du:\n${uppgifter.join("\n")}\n\nSå jämför du offerter på hemlarm: ${SITE}/guider/vad-kostar-ett-hemlarm\n\nVänliga hälsningar\nLeon, Mobilpoolen\n\n--\nMobilpoolen drivs av PMG Poolen Media Group AB, org.nr 559602-5287.\nIntegritetspolicy: ${SITE}/integritetspolicy`;
  return { html, text };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405);
  if (!RESEND_API_KEY) return json({ ok: false, error: "not_configured" }, 500);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const given = req.headers.get("x-notis-secret") ?? "";
  const { data: s } = await supabase
    .from("app_secrets")
    .select("value")
    .eq("name", "mobilpoolen_offertnotis")
    .maybeSingle();
  if (!given || !s?.value || !likaNycklar(given, String(s.value)))
    return json({ ok: false, error: "forbidden" }, 403);

  let r: Record<string, unknown>;
  try {
    r = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  const namn = `${v(r.fornamn)} ${r.efternamn ? v(r.efternamn) : ""}`.trim();
  const foretag = r.kundtyp && r.kundtyp !== "privat";
  const skapad = r.skapad_at
    ? new Date(String(r.skapad_at)).toLocaleString("sv-SE", { timeZone: "Europe/Stockholm" })
    : "-";
  const epost = typeof r.epost === "string" && r.epost.includes("@") ? r.epost : null;

  // 1. Bekräftelse till kunden. Skickas bara när samtycke finns (RLS kräver det redan).
  let kundOk = false;
  if (epost && r.samtycke_delning === true) {
    const { html, text } = kundmejl(r);
    kundOk = await sendEmail({
      from: FROM,
      to: [epost],
      reply_to: REPLY_TO,
      subject: "Vi har tagit emot din förfrågan om larm",
      html,
      text,
    });
  }

  // 2. Intern notis.
  const rader: [string, unknown][] = [
    ["Namn", namn],
    ["E-post", r.epost],
    ["Telefon", r.telefon],
    ["Postnummer", r.postnummer],
    ["Ort", r.ort],
    ["Kundtyp", r.kundtyp],
    ...(foretag
      ? ([
          ["Organisation", r.organisation],
          ["Org.nr", r.orgnr],
          ["Kontaktroll", r.kontaktroll],
          ["Objekttyp", r.objekttyp],
          ["Antal objekt", r.antal_objekt],
          ["Försäkringskrav", r.forsakringskrav],
        ] as [string, unknown][])
      : []),
    ["Bostadstyp", r.bostadstyp],
    ["Boyta (kvm)", r.boyta_kvm],
    ["Entrédörrar", r.antal_entredorrar],
    ["Ägandeform", r.agandeform],
    ["Har larm i dag", r.har_larm_idag],
    ["Nuvarande larmbolag", r.nuvarande_larmbolag],
    ["Vill ha brandskydd", r.vill_ha_brandskydd],
    ["Vill ha kamera", r.vill_ha_kamera],
    ["Vill ha väktarutryckning", r.vill_ha_vaktarutryckning],
    ["Husdjur", r.har_husdjur],
    ["Önskad start", r.onskad_start ? (START[String(r.onskad_start)] ?? r.onskad_start) : null],
    ["Bevaka", r.bevaka],
    ["Meddelande", r.meddelande],
    ["Samtycke till delning", r.samtycke_delning],
    ["Källa", [r.utm_source, r.utm_medium, r.utm_campaign].filter(Boolean).join(" / ") || "-"],
    ["Bekräftelse till kunden", epost ? (kundOk ? "skickad" : "MISSLYCKADES") : "ingen e-post"],
    ["Skapad", skapad],
    ["ID", r.id],
  ];

  const text = rader.map(([k, x]) => `${k}: ${v(x)}`).join("\n");
  const ok = await sendEmail({
    from: FROM,
    to: [NOTIFY],
    reply_to: epost ?? undefined,
    subject: `Mobilpoolen: ny offertförfrågan från ${namn}${r.ort ? `, ${v(r.ort)}` : ""}`.slice(
      0,
      150,
    ),
    text,
  });
  if (!ok) return json({ ok: false, error: "send_failed", bekraftelse: kundOk }, 502);
  return json({ ok: true, bekraftelse: kundOk });
});

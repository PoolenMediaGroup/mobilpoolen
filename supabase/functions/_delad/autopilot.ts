// Delat mellan funktionerna mobilpoolen-autopilot och mobilpoolen-autopilot-paminnelser.

export const SITE = "https://mobilpoolen.se";
export const FROM = "Mobilpoolen <hej@send.mobilpoolen.se>";
export const REPLY_TO = "info@mobilpoolen.se";
// Interna notiser om nya anmälningar. Sätts som hemlighet AUTOPILOT_NOTIS, annars info@.
export const NOTIFY = Deno.env.get("AUTOPILOT_NOTIS") ?? "info@mobilpoolen.se";
export const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

export const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

const MANADER = [
  "januari",
  "februari",
  "mars",
  "april",
  "maj",
  "juni",
  "juli",
  "augusti",
  "september",
  "oktober",
  "november",
  "december",
];

/** "2026-12-01" blir "1 december 2026". Kundmejl visar aldrig ISO-datum. */
export function datumText(d: string) {
  const [y, m, dag] = d.split("-");
  return `${Number(dag)} ${MANADER[Number(m) - 1]} ${y}`;
}

export function idag() {
  return new Date().toISOString().slice(0, 10);
}

export function dagarTill(iso: string) {
  return Math.round(
    (new Date(iso + "T00:00:00Z").getTime() - new Date(idag() + "T00:00:00Z").getTime()) / 864e5,
  );
}

/** Lägg till hela månader till ett datum, utan att hamna i nästa månad (31 jan + 1 = 28 feb). */
export function plusManader(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const mal = new Date(Date.UTC(y, m - 1 + n, 1));
  const sista = new Date(Date.UTC(mal.getUTCFullYear(), mal.getUTCMonth() + 1, 0)).getUTCDate();
  mal.setUTCDate(Math.min(d, sista));
  return mal.toISOString().slice(0, 10);
}

export const kr = (n: number) =>
  `${new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 }).format(Math.round(n))} kr`;

export async function skickaMejl(payload: Record<string, unknown>) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY saknas");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) console.error("resend fel:", res.status, (await res.text()).slice(0, 300));
  return res.ok;
}

/** Huvudknappen i mejlen: Mobilpoolens orange. */
export const knapp = (href: string, text: string) =>
  `<p style="margin:28px 0"><a href="${href}" style="background:#E8842C;color:#1a1300;text-decoration:none;padding:14px 26px;border-radius:10px;font-weight:bold;display:inline-block">${text}</a></p>`;

export function mejlram(html: string, avslutaUrl: string) {
  return `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#16133a;max-width:540px">
${html}
<hr style="border:none;border-top:1px solid #e4e1f5;margin:24px 0">
<p style="font-size:12px;color:#6b6890">Du får det här mejlet eftersom du startade Mobilpoolen Autopilot på mobilpoolen.se. <a href="${avslutaUrl}" style="color:#3b28cc">Avsluta Autopilot</a> · <a href="${SITE}/autopilot/villkor" style="color:#3b28cc">Villkor</a> · <a href="${SITE}/integritetspolicy" style="color:#3b28cc">Integritetspolicy</a></p>
</div>`;
}

export function textfot(avslutaUrl: string) {
  return `--\nAvsluta Autopilot: ${avslutaUrl}\nVillkor: ${SITE}/autopilot/villkor\nIntegritetspolicy: ${SITE}/integritetspolicy`;
}

export const avslutaLank = (token: string) => `${SITE}/autopilot/avsluta?token=${token}`;

/** Ett-klicks-avslut för mejlprogrammens avslutsknapp (List-Unsubscribe-Post, RFC 8058). */
export const ettKlickAvslut = (token: string) =>
  `${Deno.env.get("SUPABASE_URL")}/functions/v1/mobilpoolen-autopilot?action=avsluta&token=${token}`;

export const avslutsHuvuden = (token: string) => ({
  "List-Unsubscribe": `<${ettKlickAvslut(token)}>, <mailto:${REPLY_TO}?subject=Avsluta%20Autopilot>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

/** Förslag från sajten: de billigaste abonnemangen som täcker kundens behov. */
export type Forslag = {
  operator: string;
  namn: string;
  surf: string;
  snittForstaAret: number;
  pris: number;
  kampanj: string | null;
  bindning: string;
  url: string;
};

export async function hamtaForslag(a: {
  surf_gb: number | null;
  obegransad: boolean;
  eu_surf_gb: number | null;
}): Promise<{ forslag: Forslag[]; kontrollerad: string | null }> {
  const p = new URLSearchParams();
  if (a.obegransad) p.set("obegransad", "1");
  else if (a.surf_gb != null) p.set("gb", String(a.surf_gb));
  if (a.eu_surf_gb != null) p.set("eu", String(a.eu_surf_gb));
  try {
    const res = await fetch(`${SITE}/api/autopilot/forslag?${p}`, {
      headers: { "user-agent": "mobilpoolen-autopilot" },
    });
    if (!res.ok) return { forslag: [], kontrollerad: null };
    return await res.json();
  } catch (e) {
    console.error("förslag fel:", String(e));
    return { forslag: [], kontrollerad: null };
  }
}

export function forslagHtml(lista: Forslag[]) {
  return lista
    .map(
      (f) => `<tr>
<td style="padding:12px 0;border-top:1px solid #e4e1f5"><strong>${esc(f.operator)} ${esc(f.namn)}</strong><br><span style="color:#6b6890;font-size:13px">${esc(f.surf)} · ${esc(f.bindning)}${f.kampanj ? ` · ${esc(f.kampanj)}` : ""}</span></td>
<td style="padding:12px 0 12px 12px;border-top:1px solid #e4e1f5;text-align:right;white-space:nowrap"><strong>${kr(f.snittForstaAret)}/mån</strong><br><span style="color:#6b6890;font-size:12px">snitt första året</span><br><a href="${esc(f.url)}" style="color:#3b28cc;font-size:13px">Till ${esc(f.operator)}</a></td>
</tr>`,
    )
    .join("");
}

export function forslagText(lista: Forslag[]) {
  return lista
    .map(
      (f) =>
        `- ${f.operator} ${f.namn}: ${kr(f.snittForstaAret)}/mån i snitt första året (${f.surf}, ${f.bindning}). ${f.url}`,
    )
    .join("\n");
}

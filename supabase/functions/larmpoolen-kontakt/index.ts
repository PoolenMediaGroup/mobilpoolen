// Kontaktformuläret på mobilpoolen.se. Validerar och skickar via Resend.
//
// Ligger i Elpoolens Supabase-projekt (rilpjkuozcglwnxwfxgl), eftersom det är
// där Resend-nyckeln och avsändardomänen send.elpoolen.se finns, precis som
// mobilpoolen-offertnotis. Inget sparas i någon databas: meddelandet går bara
// vidare som mejl till rätt brevlåda.
//
// verify_jwt = false: formuläret är publikt och en publik nyckel ger inget
// skydd. Skyddet är honeypot, validering, CORS och en enkel gräns per IP.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM = "Mobilpoolen <kontakt@send.elpoolen.se>";

const RECIPIENTS: Record<string, string> = {
  "Allmän fråga": "info@mobilpoolen.se",
  "Larmbolag eller samarbete": "samarbeten@mobilpoolen.se",
};

const ALLOWED_ORIGINS = ["https://mobilpoolen.se", "https://www.mobilpoolen.se"];

function corsHeaders(origin: string | null) {
  const ok =
    origin &&
    (ALLOWED_ORIGINS.includes(origin) ||
      /^https:\/\/[a-z0-9-]+(--[a-z0-9-]+)?\.lovable\.app$/.test(origin) ||
      /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/.test(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));
  return {
    "Access-Control-Allow-Origin": ok ? origin! : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Enkel gräns per IP och instans: 5 meddelanden per 10 minuter.
const FONSTER_MS = 10 * 60 * 1000;
const MAX_PER_FONSTER = 5;
const traffar = new Map<string, number[]>();
function forMangaForsok(ip: string) {
  const nu = Date.now();
  const lista = (traffar.get(ip) ?? []).filter((t) => nu - t < FONSTER_MS);
  lista.push(nu);
  traffar.set(ip, lista);
  return lista.length > MAX_PER_FONSTER;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, origin);
  if (!RESEND_API_KEY) return json({ ok: false, error: "not_configured" }, 500, origin);

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "okand";
  if (forMangaForsok(ip)) return json({ ok: false, error: "rate_limited" }, 429, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400, origin);
  }
  // Honeypot: ett ifyllt dolt fält betyder bot. Svara ok så att boten inte försöker igen.
  if (typeof body.website === "string" && body.website.trim() !== "")
    return json({ ok: true }, 200, origin);

  const subject = String(body.subject ?? "").trim();
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  const to = RECIPIENTS[subject];
  if (!to) return json({ ok: false, error: "invalid_subject" }, 400, origin);
  if (name.length < 1 || name.length > 100)
    return json({ ok: false, error: "invalid_name" }, 400, origin);
  if (!EMAIL_RE.test(email) || email.length > 200)
    return json({ ok: false, error: "invalid_email" }, 400, origin);
  if (message.length < 2 || message.length > 5000)
    return json({ ok: false, error: "invalid_message" }, 400, origin);

  const safeName = name.replace(/[\r\n]/g, " ");
  const html = `<p><strong>Ärende:</strong> ${escapeHtml(subject)}</p><p><strong>Namn:</strong> ${escapeHtml(safeName)}<br><strong>E-post:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p><hr><p style="color:#888;font-size:12px">Skickat via kontaktformuläret på mobilpoolen.se. Svara direkt på mejlet för att nå avsändaren.</p>`;
  const text = `Ärende: ${subject}\nNamn: ${safeName}\nE-post: ${email}\n\n${message}\n\n--\nSkickat via kontaktformuläret på mobilpoolen.se`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      reply_to: email,
      subject: `Mobilpoolen, ${subject}: ${safeName}`.slice(0, 150),
      html,
      text,
    }),
  });
  if (!res.ok) {
    console.error("resend fel:", res.status, (await res.text()).slice(0, 300));
    return json({ ok: false, error: "send_failed" }, 502, origin);
  }
  return json({ ok: true }, 200, origin);
});

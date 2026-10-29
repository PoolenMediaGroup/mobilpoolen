// Serverbaserad besöks- och robotlogg. Samma modell som Elpoolen.
//
// Besök från människor räknas per dag, kanal (Google, ChatGPT, direkt och så
// vidare), källa, landningssida och enhet i Supabase-tabellen mobilpoolen_besok_dag
// via funktionen mobilpoolen_logga_besok(). Sök- och AI-robotars sidhämtningar
// räknas per dag, robot och sida i mobilpoolen_ai_bot_hits via
// mobilpoolen_logga_ai_bot(), som själv avgör vilka user agents som räknas.
//
// Körs på servern när sidan skickas. Inga cookies, ingen lagring i webbläsaren
// och inget skript där. Varken IP-adress, user agent eller hela adressen sparas,
// bara räknare. Därför behövs ingen cookieruta.

import { mobilpoolenSupabase } from "@/lib/mobilpoolen-supabase";

type Besok = { kanal: string; kalla: string; sida: string; enhet: "mobil" | "dator" };

// Robotar, verktyg och övervakning räknas aldrig som besök.
const ROBOT =
  /bot\b|bot\/|crawl|spider|slurp|preview|monitor|curl|wget|python|headless|lighthouse|pagespeed|facebookexternalhit|embedly|axios|node-fetch|undici|go-http|java\/|httpclient|okhttp|scrapy|ahrefs|semrush|mj12|petal|bytespider|chatgpt|oai-|claude|perplexity|anthropic|applebot|yandex|baidu|sogou|seznam|uptime|pingdom|statuscake|deno|supabase|inspectiontool/i;

const VARD = /(^|\.)mobilpoolen\.se$/;

const SOK = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|yandex|qwant|startpage|brave)\./;
const AI =
  /(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|gemini\.google\.com|claude\.ai|copilot\.microsoft\.com|you\.com|phind\.com)$/;
const SOCIALA =
  /(^|\.)(facebook\.com|instagram\.com|t\.co|twitter\.com|x\.com|linkedin\.com|lnkd\.in|reddit\.com|tiktok\.com|youtube\.com|pinterest\.com|threads\.net|flashback\.org)$/;
const MEJL = /(^|\.)(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|mail\.yahoo\.com)$/;

// Filer och vägar som inte säger något om vad någon läser.
const HOPPA_OVER_PREFIX = ["/assets/", "/img/", "/logos/", "/_serverFn", "/_build/"];
const HOPPA_OVER_FILANDELSE =
  /\.(js|mjs|css|map|png|jpe?g|gif|webp|avif|svg|ico|xml|txt|json|webmanifest|woff2?|ttf|mp4|webm|pdf)$/i;

function utanWww(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

/** Grov kanal för att se var trafiken kommer ifrån. Samma regler som Elpoolen. */
export function klassaKanal(
  refHost: string | null,
  utmSource: string | null,
  utmMedium: string | null,
  clickId: string | null,
): string {
  const src = (utmSource ?? "").toLowerCase();
  const med = (utmMedium ?? "").toLowerCase();

  if (clickId === "gclid" || clickId === "msclkid") return "sok_betald";
  if (clickId === "fbclid" && /cpc|paid|ads?/.test(med)) return "social_betald";
  if (/cpc|ppc|paid|sem/.test(med)) return "sok_betald";
  if (/email|e-post|epost|mejl|newsletter|nyhetsbrev/.test(med)) return "mejl";
  if (/affiliate|partner/.test(med)) return "affiliate";
  if (/chatgpt|openai|perplexity|gemini|claude|copilot/.test(src)) return "ai";
  if (/social/.test(med)) return "social";
  if (src) return `utm:${src.replace(/[^a-z0-9._-]/g, "").slice(0, 40)}`;

  if (!refHost) return clickId === "fbclid" ? "social" : "direkt";
  if (AI.test(refHost)) return "ai";
  if (SOK.test(refHost)) return "sok_organisk";
  if (SOCIALA.test(refHost) || /^(l|lm|m)\.facebook\.com$/.test(refHost)) return "social";
  if (MEJL.test(refHost)) return "mejl";
  return "lank";
}

/** Tolkar en sidladdning. Null om den inte ska räknas som ett besök. */
export function tolkaBesok(request: Request): Besok | null {
  const h = request.headers;
  const url = new URL(request.url);
  if (!VARD.test(url.hostname)) return null;

  // Webbläsare skickar Sec-Fetch-Mode: navigate när någon öppnar en sida.
  // Robotar och skript gör det nästan aldrig, och förhämtningar märks med Sec-Purpose.
  if (h.get("sec-fetch-mode") !== "navigate") return null;
  const dest = h.get("sec-fetch-dest");
  if (dest && dest !== "document") return null;
  if (h.get("sec-purpose") || h.get("purpose") === "prefetch") return null;

  const ua = h.get("user-agent") ?? "";
  if (!ua || ROBOT.test(ua)) return null;

  let refHost: string | null = null;
  const ref = h.get("referer");
  if (ref) {
    try {
      refHost = utanWww(new URL(ref).hostname);
    } catch {
      refHost = null;
    }
  }
  // Omladdning eller hopp inom sajten är inget nytt besök.
  if (refHost && refHost === utanWww(url.hostname)) return null;

  const p = url.searchParams;
  const utmSource = (p.get("utm_source") ?? "").trim().toLowerCase() || null;
  const clickId = p.get("gclid")
    ? "gclid"
    : p.get("msclkid")
      ? "msclkid"
      : p.get("fbclid")
        ? "fbclid"
        : null;

  return {
    kanal: klassaKanal(refHost, utmSource, p.get("utm_medium"), clickId),
    kalla: utmSource ?? refHost ?? "(ingen)",
    sida: url.pathname,
    enhet: /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobil" : "dator",
  };
}

/** Bara GET av sidor som svarade 200 med HTML räknas. */
export function skaLoggas(request: Request, response: Response): boolean {
  if (request.method !== "GET" || response.status !== 200) return false;
  if (!(response.headers.get("content-type") ?? "").includes("text/html")) return false;
  const { pathname } = new URL(request.url);
  if (HOPPA_OVER_PREFIX.some((p) => pathname.startsWith(p))) return false;
  return !HOPPA_OVER_FILANDELSE.test(pathname);
}

async function loggaBesok(besok: Besok): Promise<void> {
  if (!mobilpoolenSupabase) return;
  try {
    const { error } = await mobilpoolenSupabase.rpc("mobilpoolen_logga_besok", {
      p_kanal: besok.kanal.slice(0, 40),
      p_kalla: besok.kalla.slice(0, 60),
      p_sida: besok.sida.slice(0, 120),
      p_enhet: besok.enhet,
    });
    if (error) console.error("[matning]", error.message);
  } catch (err) {
    console.error("[matning]", err);
  }
}

async function loggaRobot(request: Request): Promise<void> {
  if (!mobilpoolenSupabase) return;
  try {
    const ua = request.headers.get("user-agent");
    if (!ua) return;
    const { error } = await mobilpoolenSupabase.rpc("mobilpoolen_logga_ai_bot", {
      p_ua: ua.slice(0, 512),
      p_path: new URL(request.url).pathname.slice(0, 512),
    });
    if (error) console.error("[matning]", error.message);
  } catch (err) {
    console.error("[matning]", err);
  }
}

type RequestMedWaitUntil = Request & { waitUntil?: (promise: Promise<unknown>) => void };

/**
 * Startar loggningen utan att vänta på den. På Cloudflare lämnas löftet till
 * waitUntil (som Nitro sätter på requesten) så att anropet inte avbryts när
 * svaret redan skickats. Får aldrig påverka svaret till besökaren.
 */
export function registreraSidvisning(request: Request, response: Response): void {
  try {
    if (!skaLoggas(request, response)) return;
    const besok = tolkaBesok(request);
    const jobb = besok ? loggaBesok(besok) : loggaRobot(request);
    const waitUntil = (request as RequestMedWaitUntil).waitUntil;
    if (typeof waitUntil === "function") waitUntil(jobb);
  } catch (err) {
    console.error("[matning]", err);
  }
}

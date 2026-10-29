/**
 * AI-chatten: läser en sida på den egna sajten åt Claude. Körs bara på servern.
 *
 * Samma fil finns i Mobilpoolens repo. Ändra i båda.
 *
 * Sidan renderas i samma worker (inget nätverksanrop ut och ingen loggning som
 * besök), görs om till text och sparas en stund i minnet. Bara sökvägar som
 * passerar `sokvagTillaten` läses.
 */
import { sidaTillText } from "./sidtext";

type ServerEntry = {
  fetch: (request: Request, env?: unknown, ctx?: unknown) => Promise<Response> | Response;
};

let entry: Promise<ServerEntry> | undefined;
function serverEntry(): Promise<ServerEntry> {
  entry ??= import("@tanstack/react-start/server-entry").then(
    (m) => ((m as { default?: ServerEntry }).default ?? m) as ServerEntry,
  );
  return entry;
}

const CACHE_MS = 10 * 60_000;
const CACHE_MAX = 80;
const cache = new Map<string, { tid: number; text: string }>();

export type LasSidaOpt = {
  origin: string;
  /** Sökvägar som aldrig får läsas (formulär, API, flöden med personuppgifter). */
  sparrade: RegExp;
  userAgent: string;
  /** Högsta antal tecken text. Förhämtningen tar mindre än verktyget, för snabbare svar. */
  maxTecken?: number;
};

export function normaliseraSokvag(v: unknown): string | null {
  if (typeof v !== "string") return null;
  let s = v.trim();
  // Hela adresser till den egna sajten godtas och görs om till sökväg.
  s = s.replace(/^https?:\/\/(www\.)?[a-z0-9.-]+\.se(?=\/|$)/i, "");
  if (s === "") s = "/";
  s = s.split("#")[0].split("?")[0];
  if (!/^\/(?!\/)[a-z0-9\-/._]*$/i.test(s) || s.includes("..")) return null;
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s.toLowerCase();
}

export async function lasSida(sokvagIn: unknown, opt: LasSidaOpt): Promise<string> {
  const sokvag = normaliseraSokvag(sokvagIn);
  if (!sokvag) return "Ogiltig sökväg. Ange en sökväg på sajten, till exempel /faq.";
  if (opt.sparrade.test(sokvag)) return `Sidan ${sokvag} går inte att läsa härifrån.`;

  const traff = cache.get(`${sokvag}|${opt.maxTecken ?? 0}`);
  if (traff && Date.now() - traff.tid < CACHE_MS) return traff.text;

  const handler = await serverEntry();
  let url = new URL(sokvag, opt.origin);
  let res: Response | null = null;
  for (let steg = 0; steg < 3; steg++) {
    res = await handler.fetch(
      new Request(url, { headers: { accept: "text/html", "user-agent": opt.userAgent } }),
    );
    const plats = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && plats) {
      const nasta = new URL(plats, url);
      if (nasta.origin !== url.origin) break;
      if (opt.sparrade.test(nasta.pathname.toLowerCase()))
        return `Sidan ${sokvag} går inte att läsa härifrån.`;
      url = nasta;
      continue;
    }
    break;
  }
  if (!res) return "Sidan gick inte att läsa.";
  if (res.status === 404)
    return `Sidan ${sokvag} finns inte. Välj en sida ur kartan i instruktionerna.`;
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("text/html")) {
    return `Sidan ${sokvag} gick inte att läsa just nu.`;
  }
  const { titel, text } = sidaTillText(await res.text(), opt.maxTecken);
  const slutlig = url.pathname;
  const svar = `Sida: ${slutlig}\nTitel: ${titel ?? "okänd"}\n\n${text}`;

  if (cache.size >= CACHE_MAX) {
    const aldst = cache.keys().next().value;
    if (aldst !== undefined) cache.delete(aldst);
  }
  cache.set(`${sokvag}|${opt.maxTecken ?? 0}`, { tid: Date.now(), text: svar });
  return svar;
}

/**
 * AI-chatten: skydd mot missbruk och loggning utan personuppgifter. Körs bara på servern.
 *
 * Samma fil finns i Mobilpoolens repo. Ändra i båda.
 *
 * Tre spärrar mot att någon kör upp kostnaden:
 *  1. Bara anrop från den egna sajten (Origin-rubriken).
 *  2. Per besökare: högst ett antal frågor per kvart och per dygn. IP-adressen
 *     hashas och hålls bara i minnet i den här workern, den sparas aldrig.
 *  3. Dagstak för hela sajten, räknat i databasen (chatt_kvot). Går databasen
 *     inte att nå gäller i stället ett tak per worker.
 * Lägg dessutom gärna en Rate limiting-regel för /api/chatt i Cloudflares WAF.
 */

export const PER_KVART = 15;
export const PER_DYGN = 80;
const KVART = 15 * 60_000;
const DYGN = 24 * 60 * 60_000;

const anrop = new Map<string, number[]>();
let workerDag = { dag: "", n: 0 };

/**
 * Bara anrop från samma adress som workern svarar på. Webbläsaren skickar alltid
 * Origin vid POST, och en annan sajt kan inte sätta den till vår. Därmed fungerar
 * även Cloudflares förhandsadresser och lokal utveckling utan undantag.
 */
export function tillatenOrigin(request: Request, vardar: readonly string[]): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    const fran = new URL(origin);
    const hit = new URL(request.url);
    if (fran.host !== hit.host) return false;
    if (vardar.includes(hit.hostname)) return fran.protocol === "https:";
    return true;
  } catch {
    return false;
  }
}

// Slumpat salt per worker: hashen går inte att räkna fram ur en IP-adress utanför den.
// Skapas vid första anropet, Cloudflare tillåter inte slumptal när workern laddas.
let salt = "";
function saltet(): string {
  if (!salt)
    salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16)).join("");
  return salt;
}

export async function besokarnyckel(request: Request): Promise<string> {
  const ip =
    request.headers.get("cf-connecting-ip") ??
    (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ??
    "okand";
  const d = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${saltet()}:${ip || "okand"}`),
  );
  return Array.from(new Uint8Array(d).slice(0, 8), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Räknar frågan och svarar true om besökaren har ställt för många. */
export function forManga(nyckel: string, nu = Date.now()): boolean {
  const lista = (anrop.get(nyckel) ?? []).filter((t) => nu - t < DYGN);
  const senaste = lista.filter((t) => nu - t < KVART).length;
  if (senaste >= PER_KVART || lista.length >= PER_DYGN) {
    anrop.set(nyckel, lista);
    return true;
  }
  lista.push(nu);
  anrop.set(nyckel, lista);
  // Håll minnet litet: rensa gamla besökare då och då.
  if (anrop.size > 5000) {
    for (const [k, v] of anrop) if (!v.some((t) => nu - t < DYGN)) anrop.delete(k);
  }
  return false;
}

type Rpc = (
  fn: string,
  args: Record<string, unknown>,
) => PromiseLike<{ data: unknown; error: unknown }>;

/** True om sajten har kvar av dagens tak. */
export async function underDagstak(
  rpc: Rpc,
  sajt: string,
  tak: number,
  nyckel?: string,
): Promise<boolean> {
  const idag = new Date().toISOString().slice(0, 10);
  if (workerDag.dag !== idag) workerDag = { dag: idag, n: 0 };
  workerDag.n++;
  try {
    const { data, error } = await rpc("chatt_kvot", {
      p_sajt: sajt,
      p_tak: tak,
      p_nyckel: nyckel ?? null,
    });
    if (!error && typeof data === "boolean") return data;
  } catch {
    /* faller tillbaka på taket per worker */
  }
  return workerDag.n <= Math.max(50, Math.floor(tak / 4));
}

/** Tar bort sådant som kan peka ut en person innan text sparas i loggen. */
export function rensaPersonuppgifter(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[e-post]")
    .replace(/\b(19|20)?\d{6}[-+ ]?\d{4}\b/g, "[personnummer]")
    .replace(/(\+46|0046|\b0)[\s-]?7[\d\s-]{7,11}\d/g, "[telefon]")
    .replace(/(\+46|0046|\b0)[1-9][\d\s-]{6,11}\d\b/g, "[telefon]")
    .replace(/\b\d{8,}\b/g, "[nummer]");
}

export type ChattLoggrad = {
  sajt: string;
  samtal_id: string | null;
  tur: number;
  sida: string | null;
  fraga: string;
  svar: string;
  verktyg: string[];
  atgarder: string[];
  modell: string;
  tokens_in: number;
  tokens_ut: number;
  cache_las: number;
  cache_skriv: number;
  svarstid_ms: number;
  fel: string | null;
};

/** Sparar en rad. Saknas tabellen eller funktionen fungerar chatten ändå. */
export async function loggaChatt(rpc: Rpc, rad: ChattLoggrad, nyckel?: string): Promise<void> {
  try {
    const { error } = await rpc("logga_chatt", {
      p_rad: {
        ...rad,
        fraga: rensaPersonuppgifter(rad.fraga).slice(0, 1000),
        svar: rensaPersonuppgifter(rad.svar).slice(0, 4000),
      },
      p_nyckel: nyckel ?? null,
    });
    if (error) console.warn("[chatt] logg", (error as { code?: string }).code ?? "fel");
  } catch {
    /* loggen får aldrig störa chatten */
  }
}

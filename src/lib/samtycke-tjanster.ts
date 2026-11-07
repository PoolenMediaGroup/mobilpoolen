/**
 * Mobilpoolens inställningar för cookiesamtycket. Allt annat ligger i lib/samtycke.ts och
 * components/samtycke-banner.tsx, som är likadana på Larmpoolen, Mobilpoolen och
 * Solcellspoolen.
 *
 * Slå på ett mätverktyg: fyll i id:t nedan och höj SAMTYCKE_VERSION, så att alla
 * tillfrågas igen. Tomt id = avstängt. Cookierutan, länken Cookieinställningar i
 * sidfoten och avsnitten i cookie- och integritetspolicyn visas först när minst ett
 * verktyg har ett giltigt id, och de beskriver då bara de verktyg som är påslagna.
 *
 *  - google-analytics: mätnings-id, t.ex. "G-ABC123DEF4"
 *  - meta: Meta Pixel-id, bara siffror
 *  - google-ads: konverterings-id, t.ex. "AW-123456789"
 *  - tiktok: TikTok Pixel-id, t.ex. "C1ABCDEFGHIJ2KLMNOPQ"
 */
export const SAMTYCKE_ID: Record<"google-analytics" | "meta" | "google-ads" | "tiktok", string> = {
  "google-analytics": "",
  meta: "",
  "google-ads": "",
  tiktok: "",
};

/** Höj när ett verktyg slås på eller texten i rutan ändras i sak. */
export const SAMTYCKE_VERSION = 1;

export const SAMTYCKE_SAJT = {
  namn: "Mobilpoolen",
  kontakt: "info@mobilpoolen.se",
  /** Nyckeln i besökarens lokala lagring. */
  nyckel: "mobilpoolen_samtycke",
  /** Loggen i Supabase (SQL: supabase/migrations/20261107120000_mobilpoolen_samtycken.sql). Publik nyckel, får bara anropa funktionen. */
  rpc: "https://rilpjkuozcglwnxwfxgl.supabase.co/rest/v1/rpc/mobilpoolen_logga_samtycke",
  rpcNyckel: "sb_publishable__kv9a1vIC2DQ1lGIwt0Fdg_0qZYfWaU",
} as const;

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Mobilpoolen använder PMG:s gemensamma databas (Supabase-projektet Elpoolen),
// med egna tabeller och funktioner som börjar på mobilpoolen_. Samma upplägg som
// Larmpoolens larmpoolen_-tabeller. Den publika nyckeln får stå i koden: den
// kan bara anropa funktionerna som uttryckligen tillåter det, inte läsa tabellerna.
// Kan skrivas över vid bygget med VITE_SUPABASE_URL och VITE_SUPABASE_PUBLISHABLE_KEY.
const URL =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ??
  "https://rilpjkuozcglwnxwfxgl.supabase.co";
const KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  "sb_publishable__kv9a1vIC2DQ1lGIwt0Fdg_0qZYfWaU";

export const mobilpoolenSupabase: SupabaseClient | null =
  URL && KEY
    ? createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

export const MOBILPOOLEN_SUPABASE_URL_PUBLIC = URL ?? null;

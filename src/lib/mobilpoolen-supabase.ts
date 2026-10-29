import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Mobilpoolens egen databas. Adress och publik nyckel sätts vid bygget
// (VITE_SUPABASE_URL och VITE_SUPABASE_PUBLISHABLE_KEY, se README). Saknas de
// körs sajten utan databas: besöksmätningen och chattloggen hoppas då över.
const URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const mobilpoolenSupabase: SupabaseClient | null =
  URL && KEY
    ? createClient(URL, KEY, { auth: { persistSession: false, autoRefreshToken: false } })
    : null;

export const MOBILPOOLEN_SUPABASE_URL_PUBLIC = URL ?? null;

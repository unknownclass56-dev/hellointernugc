import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anon);

if (!supabaseConfigured) {
  console.warn(
    "Supabase is not configured – ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in a .env file."
  );
}

export const supabase: SupabaseClient = supabaseConfigured
  ? createClient(url!, anon!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : // placeholder client – will always fail, but prevents crashes
    (createClient("https://placeholder.supabase.co", "placeholder-key") as SupabaseClient);

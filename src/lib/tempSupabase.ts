// Temporary Supabase client for one-off auth operations (e.g. signUp during registration)
// without conflicting with the main singleton session.
//
// Uses a unique storageKey so it doesn't share the same localStorage bucket,
// which eliminates the "Multiple GoTrueClient instances" warning.

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const tempSupabase = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
    storageKey: "sb-temp-auth-token",
  },
});

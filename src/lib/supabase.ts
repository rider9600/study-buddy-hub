import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Read Vite env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // Throwing during module initialization helps catch misconfiguration early in builds.
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variable");
}

// Create typed Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper to get current user (returns null on error)
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    // Keep logging concise and non-blocking
    console.warn("getCurrentUser error:", error.message);
    return null;
  }
  return data?.user ?? null;
};

// Helper to get current session (returns null on error)
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("getCurrentSession error:", error.message);
    return null;
  }
  return data?.session ?? null;
};
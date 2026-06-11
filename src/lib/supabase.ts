import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno: VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. " +
      "Definilas en tu archivo .env (en la raíz del proyecto)."
  );
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      storageKey: "prode.supabase.auth",
    },
  }
);

export type AppSupabaseClient = typeof supabase;

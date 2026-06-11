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

function normalizeSupabaseUrl(raw: string): string {
  // Si la URL tiene el path /rest/v1 al final, lo sacamos para que
  // el cliente interno de supabase-js no lo duplique.
  return raw.replace(/\/rest\/v1\/?$/, "");
}

const cleanUrl = normalizeSupabaseUrl(supabaseUrl);

export const supabase: SupabaseClient<Database> = createClient<Database>(
  cleanUrl,
  supabaseAnonKey,
  {
    auth: {
      // Como no usamos Supabase Auth, desactivamos persistencia de sesión
      // para evitar conflictos con el storage local del prode.
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

/* ─── Debug de conexión (dev) ─── */
if (import.meta.env.DEV) {
  console.log("[supabase] URL base:", cleanUrl);
  console.log("[supabase] Anon key presente:", !!supabaseAnonKey);

  // Test directo: hacemos un fetch manual a la API de Supabase para ver
  // qué headers realmente se envían y qué responde.
  void (async () => {
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/profiles?select=id,username&limit=1`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      });
      console.log("[supabase] test fetch status:", res.status, res.statusText);
      const body = await res.text();
      console.log("[supabase] test fetch body:", body.slice(0, 200));
    } catch (err) {
      console.error("[supabase] test fetch error:", err);
    }
  })();
}

export type AppSupabaseClient = typeof supabase;

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types";

const PLAYER_ID_KEY = "prode.player_id";
const USERNAME_KEY = "prode.username";
const DNI_KEY = "prode.dni";

type AuthState = {
  player: Player | null;
  isAuthenticated: boolean;

  initialize: () => void;
  enterGame: (dni: string, username: string) => Promise<void>;
  loginWithDni: (dni: string) => Promise<boolean>;
  logout: () => void;
};

function readFromStorage(): Player | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(PLAYER_ID_KEY);
  const username = window.localStorage.getItem(USERNAME_KEY);
  const dni = window.localStorage.getItem(DNI_KEY);
  if (!id || !username || !dni) return null;
  return { id, username, dni };
}

function persist(player: Player) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_ID_KEY, player.id);
  window.localStorage.setItem(USERNAME_KEY, player.username);
  window.localStorage.setItem(DNI_KEY, player.dni);
}

function clearStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PLAYER_ID_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(DNI_KEY);
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "p_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const initialPlayer = readFromStorage();

export const useAuthStore = create<AuthState>()((set) => ({
  player: initialPlayer,
  isAuthenticated: !!initialPlayer,

  initialize: () => {
    const player = readFromStorage();
    set({ player, isAuthenticated: !!player });
  },

  loginWithDni: async (rawDni) => {
    const dni = rawDni.trim();
    if (!/^\d{7,8}$/.test(dni)) {
      throw new Error("El DNI debe tener 7 u 8 dígitos.");
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("dni", dni)
      .maybeSingle();

    if (error) {
      throw new Error("Error al buscar tu perfil. Probá de nuevo.");
    }

    if (!data) {
      return false;
    }

    const player: Player = {
      id: data.id,
      username: data.username,
      dni: data.dni ?? dni,
    };

    persist(player);
    set({ player, isAuthenticated: true });
    return true;
  },

  enterGame: async (rawDni, rawUsername) => {
    const dni = rawDni.trim();
    const username = rawUsername.trim();

    if (!/^\d{7,8}$/.test(dni)) {
      throw new Error("El DNI debe tener 7 u 8 dígitos.");
    }
    if (username.length < 2) {
      throw new Error("El nombre tiene que tener al menos 2 caracteres.");
    }

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("dni", dni)
      .maybeSingle();

    if (existing) {
      throw new Error("Ya existe un perfil con ese DNI. Solo necesitás tu DNI para entrar.");
    }

    const id = generateId();
    const player: Player = { id, username, dni };

    const { error } = await supabase
      .from("profiles")
      .insert({
        id,
        username,
        dni,
        avatar_url: null,
        is_admin: false,
      });

    if (error) {
      throw new Error(
        error.message || "No pudimos registrarte. Probá de nuevo."
      );
    }

    persist(player);
    set({ player, isAuthenticated: true });
  },

  logout: () => {
    clearStorage();
    set({ player: null, isAuthenticated: false });
  },
}));

export const usePlayer = () => useAuthStore((s) => s.player);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useEnterGame = () => useAuthStore((s) => s.enterGame);
export const useLoginWithDni = () => useAuthStore((s) => s.loginWithDni);
export const useLogout = () => useAuthStore((s) => s.logout);

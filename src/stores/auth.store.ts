import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types";

const PLAYER_ID_KEY = "prode.player_id";
const USERNAME_KEY = "prode.username";
const DNI_KEY = "prode.dni";
const CHAMPION_KEY = "prode.champion";

type AuthState = {
  player: Player | null;
  isAuthenticated: boolean;

  initialize: () => void;
  enterGame: (dni: string, username: string, champion: string) => Promise<void>;
  loginWithDni: (dni: string) => Promise<boolean>;
  logout: () => void;
};

function readFromStorage(): Player | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(PLAYER_ID_KEY);
  if (!id) return null;
  const username = window.localStorage.getItem(USERNAME_KEY) || "";
  const dni = window.localStorage.getItem(DNI_KEY) || "";
  const champion = window.localStorage.getItem(CHAMPION_KEY) || undefined;
  return { id, username, dni, champion };
}

function persist(player: Player) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_ID_KEY, player.id);
  window.localStorage.setItem(USERNAME_KEY, player.username);
  window.localStorage.setItem(DNI_KEY, player.dni);
  if (player.champion) {
    window.localStorage.setItem(CHAMPION_KEY, player.champion);
  } else {
    window.localStorage.removeItem(CHAMPION_KEY);
  }
}

function clearStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PLAYER_ID_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
  window.localStorage.removeItem(DNI_KEY);
  window.localStorage.removeItem(CHAMPION_KEY);
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

  initialize: async () => {
    const player = readFromStorage();
    if (!player) {
      set({ player: null, isAuthenticated: false });
      return;
    }
    set({ player, isAuthenticated: true });

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", player.id)
        .maybeSingle();
      if (data && !error) {
        const updatedPlayer: Player = {
          id: data.id,
          username: data.username,
          dni: data.dni || player.dni,
          champion: data.champion || undefined,
        };
        persist(updatedPlayer);
        set({ player: updatedPlayer, isAuthenticated: true });
      }
    } catch (err) {
      console.error("Error updating player profile on initialize:", err);
    }
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
      champion: data.champion ?? undefined,
    };

    persist(player);
    set({ player, isAuthenticated: true });
    return true;
  },

  enterGame: async (rawDni, rawUsername, champion) => {
    const dni = rawDni.trim();
    const username = rawUsername.trim();

    if (!/^\d{7,8}$/.test(dni)) {
      throw new Error("El DNI debe tener 7 u 8 dígitos.");
    }
    if (username.length < 2) {
      throw new Error("El nombre tiene que tener al menos 2 caracteres.");
    }
    if (!champion) {
      throw new Error("Tenés que seleccionar un campeón.");
    }

    const KICKOFF_DATE = new Date("2026-06-20T21:00:00Z");
    if (new Date() > KICKOFF_DATE) {
      throw new Error("El torneo ya ha comenzado. No es posible seleccionar o modificar el campeón.");
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
    const player: Player = { id, username, dni, champion };

    const { error } = await supabase
      .from("profiles")
      .insert({
        id,
        username,
        dni,
        avatar_url: null,
        is_admin: false,
        champion,
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

import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { Player } from "@/types";

const PLAYER_ID_KEY = "prode.player_id";
const USERNAME_KEY = "prode.username";

type AuthState = {
  player: Player | null;
  isAuthenticated: boolean;

  initialize: () => void;
  enterGame: (username: string) => Promise<void>;
  logout: () => void;
};

function readFromStorage(): Player | null {
  if (typeof window === "undefined") return null;
  const id = window.localStorage.getItem(PLAYER_ID_KEY);
  const username = window.localStorage.getItem(USERNAME_KEY);
  if (!id || !username) return null;
  return { id, username };
}

function persist(player: Player) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PLAYER_ID_KEY, player.id);
  window.localStorage.setItem(USERNAME_KEY, player.username);
}

function clearStorage() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PLAYER_ID_KEY);
  window.localStorage.removeItem(USERNAME_KEY);
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback muy improbable (navegadores modernos siempre tienen crypto.randomUUID)
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

  enterGame: async (rawUsername) => {
    const username = rawUsername.trim();
    if (username.length < 2) {
      throw new Error("El nombre tiene que tener al menos 2 caracteres.");
    }

    const id = generateId();
    const player: Player = { id, username };

    const { error } = await supabase
      .from("profiles")
      .insert({
        id,
        username,
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

/* TODO(admin):
 * Para el panel admin, agregar:
 *   - useIsAdmin() que lea profiles.is_admin del player actual
 *   - un fetchProfile(id) que cachee el resultado y exponga el flag
 *   - rutas protegidas para /admin/*
 */

export const usePlayer = () => useAuthStore((s) => s.player);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useEnterGame = () => useAuthStore((s) => s.enterGame);
export const useLogout = () => useAuthStore((s) => s.logout);

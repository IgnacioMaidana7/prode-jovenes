import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  points: number;
  rank: number;
};

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePoints: (delta: number) => void;
};

const MOCK_USER: User = {
  id: "u-001",
  name: "Hincha",
  email: "hincha@prode.ar",
  points: 1250,
  rank: 8,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: MOCK_USER,
      isAuthenticated: true,
      login: async (email) => {
        await new Promise((r) => setTimeout(r, 600));
        set({
          user: { ...MOCK_USER, email: email || MOCK_USER.email },
          isAuthenticated: true,
        });
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
      updatePoints: (delta) => {
        set((state) =>
          state.user
            ? { user: { ...state.user, points: state.user.points + delta } }
            : state
        );
      },
    }),
    {
      name: "prode.auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () =>
  useAuthStore((s) => s.isAuthenticated);
export const useLogin = () => useAuthStore((s) => s.login);
export const useLogout = () => useAuthStore((s) => s.logout);

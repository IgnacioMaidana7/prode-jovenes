import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GroupId } from "@/data/groups";

type UiState = {
  activeGroup: GroupId;
  setActiveGroup: (id: GroupId) => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeGroup: "A",
      setActiveGroup: (id) => set({ activeGroup: id }),
      sidebarOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebar: (open) => set({ sidebarOpen: open }),
    }),
    {
      name: "prode.ui",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeGroup: state.activeGroup }),
    }
  )
);

export const useActiveGroup = () => useUiStore((s) => s.activeGroup);
export const useSetActiveGroup = () => useUiStore((s) => s.setActiveGroup);

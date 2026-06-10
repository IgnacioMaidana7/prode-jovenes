import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Prediction = {
  matchId: string;
  homeScore: number;
  awayScore: number;
  savedAt: string;
};

type PredictionsState = {
  byMatch: Record<string, Prediction>;
  savePrediction: (matchId: string, home: number, away: number) => void;
  getPrediction: (matchId: string) => Prediction | undefined;
  clearAll: () => void;
  count: () => number;
};

export const usePredictionsStore = create<PredictionsState>()(
  persist(
    (set, get) => ({
      byMatch: {},
      savePrediction: (matchId, home, away) => {
        set((state) => ({
          byMatch: {
            ...state.byMatch,
            [matchId]: {
              matchId,
              homeScore: home,
              awayScore: away,
              savedAt: new Date().toISOString(),
            },
          },
        }));
      },
      getPrediction: (matchId) => get().byMatch[matchId],
      clearAll: () => set({ byMatch: {} }),
      count: () => Object.keys(get().byMatch).length,
    }),
    {
      name: "prode.predictions",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const usePrediction = (matchId: string) =>
  usePredictionsStore((s) => s.byMatch[matchId]);

export const useSavePrediction = () =>
  usePredictionsStore((s) => s.savePrediction);

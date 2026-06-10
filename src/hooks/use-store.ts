import { useStore } from "zustand";
import type { StoreApi, UseBoundStore } from "zustand";

export function useStoreSelector<TState, TSlice>(
  store: UseBoundStore<StoreApi<TState>>,
  selector: (state: TState) => TSlice
): TSlice {
  return useStore(store, selector);
}

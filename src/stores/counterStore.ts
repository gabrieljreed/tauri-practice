import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { temporal } from "zundo";

interface CounterState {
  count: number;
  increment: () => void;
  reset: () => void;
  updateCount: (newCount: number) => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
  updateCount: (newCount) => set({ count: newCount }),
}));

export const useStoreWithUndo = create<CounterState>()(
  temporal((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    reset: () => set({ count: 0 }),
    updateCount: (newCount) => set({ count: newCount }),
  }))
);

interface RustCounterState {
  count: number;
  isCalculating: boolean;
  doHardCalculation: () => Promise<void>;
}

export const useRustCounterStore = create<RustCounterState>((set, get) => ({
  count: 7,
  isCalculating: false,
  doHardCalculation: async () => {
    // Set isCalculating to true while we do a long calculation
    set({ isCalculating: true });

    // Do the long calculation
    const result = await invoke<number>("hard_calculation", {
      currentCount: get().count,
    });

    // Set the result, set isCalculating back to false
    set({ count: result, isCalculating: false });
  },
}));

export const useTemporalRustCounterStore = create<RustCounterState>()(
  temporal((set, get) => ({
    count: 7,
    isCalculating: false,
    doHardCalculation: async () => {
      set({ isCalculating: true });
      const result = await invoke<number>("hard_calculation", {
        currentCount: get().count,
      });
      set({ count: result, isCalculating: false });
    },
  }))
);

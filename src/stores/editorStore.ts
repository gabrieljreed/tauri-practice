import { create } from "zustand";
import { Direction, CursorPosition } from "@/types/puzzle";

interface EditorState {
  cursor: CursorPosition | null;
  direction: Direction;

  // Actions
  setCursor: (pos: CursorPosition | null) => void;
  toggleDirection: () => void;
  moveCursor: (dRow: number, dCol: number) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  cursor: null,
  direction: "across",

  setCursor: (cursor) => set({ cursor }),

  toggleDirection: () =>
    set((state) => ({
      direction: state.direction === "across" ? "down" : "across",
    })),

  moveCursor: (dRow, dCol) =>
    set((state) => {
      if (!state.cursor) return state;
      return {
        cursor: {
          row: state.cursor.row + dRow,
          col: state.cursor.col + dCol,
        },
      };
    }),
}));

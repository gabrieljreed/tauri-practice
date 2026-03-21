import { create } from "zustand";
import { temporal } from "zundo";
import { Puzzle, Grid, Cell, Direction } from "@/types/puzzle";

// TODO: Use the one from utils
export function makeEmptyGrid(width: number, height: number): Grid {
  const cells = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => ({
      letter: "",
      isBlack: false,
      number: null,
      isSelected: false,
      isHighlighted: false,
    }))
  );
  return { cells, width, height };
}

interface PuzzleState {
  puzzle: Puzzle | null;

  // Actions
  newPuzzle: (width: number, height: number) => void;
  setCell: (row: number, col: number, updates: Partial<Cell>) => void;
  toggleBlack: (row: number, col: number) => void;
  setClue: (number: number, direction: Direction, text: string) => void;
}

export const usePuzzleStore = create<PuzzleState>()(
  temporal((set, get) => ({
    puzzle: null,

    newPuzzle: (width, height) =>
      set({
        puzzle: {
          id: null,
          title: "Untitled",
          author: "",
          grid: makeEmptyGrid(width, height),
          clues: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      }),

    setCell: (row, col, updates) =>
      set((state) => {
        if (!state.puzzle) return state;
        const cells = state.puzzle.grid.cells.map((r) => [...r]); // Shallow copy
        cells[row][col] = { ...cells[row][col], ...updates };
        return {
          puzzle: {
            ...state.puzzle,
            grid: { ...state.puzzle.grid, cells },
          },
        };
      }),

    toggleBlack: (row, col) => {
      const { puzzle, setCell } = get();
      if (!puzzle) return;
      const isBlack = !puzzle.grid.cells[row][col].isBlack;
      setCell(row, col, { isBlack, letter: "" });
      const mirrorRow = puzzle.grid.height - 1 - row;
      const mirrorCol = puzzle.grid.height - 1 - col;
      setCell(mirrorRow, mirrorCol, { isBlack, letter: "" });
    },

    setClue: (number, direction, text) =>
      set((state) => {
        if (!state.puzzle) return state;
        const clues = state.puzzle.clues.map((c) =>
          c.number === number && c.direction === direction ? { ...c, text } : c
        );
        return { puzzle: { ...state.puzzle, clues } };
      }),
  }))
);

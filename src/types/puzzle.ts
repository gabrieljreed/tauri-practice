export type Direction = "across" | "down";

export interface Cell {
  letter: string;
  isBlack: boolean;
  number: number | null;
  isSelected: boolean;
  isHighlighted: boolean;
}

export interface Grid {
  cells: Cell[][];
  width: number;
  height: number;
}

export interface CursorPosition {
  row: number;
  col: number;
}

export interface Clue {
  number: number;
  direction: Direction;
  text: string;
  startRow: number;
  startCol: number;
  length: number;
}

export interface Puzzle {
  id: string | null; // Null until first save
  title: string;
  author: string;
  grid: Grid;
  clues: Clue[];
  createdAt: string;
  updatedAt: string;
}

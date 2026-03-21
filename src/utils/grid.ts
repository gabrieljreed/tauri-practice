import { Grid, Cell } from "@/types/puzzle";

export function makeEmptyGrid(width: number, height: number): Grid {
  const cells: Cell[][] = Array.from({ length: height }, () =>
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

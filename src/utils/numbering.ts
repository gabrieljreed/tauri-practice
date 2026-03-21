import { Grid } from "@/types/puzzle";

export function computeNumbers(grid: Grid): Grid {
  const { cells, width, height } = grid;

  // Deep copy so we don't mutate the store directly
  const numbered = cells.map((row) =>
    row.map((cell) => ({ ...cell, number: null }))
  );

  let n = 1;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const cell = cells[row][col];
      if (cell.isBlack) continue;

      const startsAcross =
        (col === 0 || cells[row][col - 1].isBlack) &&
        col + 1 < width &&
        !cells[row][col + 1].isBlack;

      const startsDown =
        (row === 0 || cells[row - 1][col].isBlack) &&
        row + 1 < height &&
        !cells[row + 1][col].isBlack;

      if (startsAcross || startsDown) {
        numbered[row][col].number = n++;
      }
    }
  }

  return { ...grid, cells: numbered };
}

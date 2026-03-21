import { Grid, Cell, CursorPosition, Direction } from "@/types/puzzle";

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

export interface WordSpan {
  cells: CursorPosition[]; // Ordered list of {row, col} in the word
  startRow: number;
  startCol: number;
}

export function getActiveWord(
  grid: Grid,
  cursor: CursorPosition,
  direction: Direction
): WordSpan {
  const { row, col } = cursor;
  const cells: CursorPosition[] = [];

  if (direction === "across") {
    // Walk left to find the start of the word
    let startCol = col;
    while (startCol > 0 && !grid.cells[row][startCol - 1].isBlack) {
      startCol--;
    }
    // Walk right to find the end
    let endCol = startCol;
    while (endCol < grid.width && !grid.cells[row][endCol].isBlack) {
      cells.push({ row, col: endCol });
      endCol++;
    }
    return { cells, startRow: row, startCol };
  } else {
    // Walk up to find the start of the word
    let startRow = row;
    while (startRow > 0 && !grid.cells[startRow - 1][col].isBlack) {
      startRow--;
    }
    // Walk down to find the end of the word
    let endRow = startRow;
    while (endRow < grid.height && !grid.cells[endRow][col].isBlack) {
      cells.push({ row: endRow, col });
      endRow++;
    }
    return { cells, startRow, startCol: col };
  }
}

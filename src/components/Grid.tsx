import { usePuzzleStore } from "@/stores/puzzleStore";
import { useEditorStore } from "@/stores/editorStore";
import { Cell } from "@/types/puzzle";
import { useRef, useEffect } from "react";
import { getActiveWord, getWordStarts } from "@/utils/grid";

export function Grid() {
  const puzzle = usePuzzleStore((s) => s.puzzle);
  const cursor = useEditorStore((s) => s.cursor);
  const setCursor = useEditorStore((s) => s.setCursor);
  const toggleDirection = useEditorStore((s) => s.toggleDirection);
  const toggleBlack = usePuzzleStore((s) => s.toggleBlack);
  const setCell = usePuzzleStore((s) => s.setCell);
  const direction = useEditorStore((s) => s.direction);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (puzzle) gridRef.current?.focus();
    console.log("focusing");
  }, [puzzle]);

  if (!puzzle) return <div>No puzzle loaded</div>;

  const { grid } = puzzle;
  const activeWord =
    cursor && !grid.cells[cursor.row][cursor.col].isBlack
      ? getActiveWord(grid, cursor, direction)
      : null;
  const highlightedKeys = new Set(
    activeWord?.cells.map(({ row, col }) => `${row},${col}`) ?? []
  );
  console.log(highlightedKeys);
  // How does this get updated? There's no useState or anything?

  function handleCellClick(row: number, col: number) {
    // Clicking on already selected cell toggles direction
    if (cursor?.row === row && cursor?.col === col) {
      toggleDirection();
    } else {
      setCursor({ row, col });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!cursor) return;
    e.preventDefault();

    const { row, col } = cursor;

    // Space toggles black square
    if (e.key === " ") {
      toggleBlack(row, col);
      return;
    }

    // Handle tab navigation
    if (e.key === "Tab") {
      const wordStarts = getWordStarts(grid, direction);
      if (wordStarts.length === 0) return;

      const activeWord = cursor ? getActiveWord(grid, cursor, direction) : null;

      // Find where we are in the word list
      const currentStart = activeWord
        ? `${activeWord.startRow},${activeWord.startCol}`
        : "";
      const currentIndex = wordStarts.findIndex(
        ({ row, col }) => `${row},${col}` === currentStart
      );
      // Tab: next word; Shift+Tab: previous word
      const delta = e.shiftKey ? -1 : 1;
      const nextIndex =
        (currentIndex + delta + wordStarts.length) % wordStarts.length;
      setCursor(wordStarts[nextIndex]);
      return;
    }

    // Arrow key navigation
    const arrows: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };

    if (arrows[e.key]) {
      const [dRow, dCol] = arrows[e.key];
      const newRow = Math.max(0, Math.min(grid.height - 1, row + dRow));
      const newCol = Math.max(0, Math.min(grid.width - 1, col + dCol));
      setCursor({ row: newRow, col: newCol });
      return;
    }

    // Backspace
    if (e.key === "Backspace") {
      const cell = grid.cells[row][col];
      if (cell.letter !== "") {
        // If cell has letter, clear it
        setCell(row, col, { letter: "" });
      } else {
        // Cell is empty, move back and clear previous cell
        const [dRow, dCol] = direction === "across" ? [0, -1] : [-1, 0];
        const newRow = Math.max(0, row + dRow);
        const newCol = Math.max(0, col + dCol);
        setCursor({ row: newRow, col: newCol });
        setCell(newRow, newCol, { letter: "" });
      }
      console.log("returning!");
      return;
    }

    // Letter entry
    if (e.key.length === 1 && e.key.match(/[a-zA-Z]/)) {
      const cell = grid.cells[row][col];
      if (cell.isBlack) return;
      setCell(row, col, { letter: e.key.toUpperCase() });

      // Advance cursor
      const [dRow, dCol] = direction === "across" ? [0, 1] : [1, 0];
      const newRow = Math.min(grid.height, row + dRow);
      const newCol = Math.min(grid.width, col + dCol);

      // Only advance if the next square is not black
      if (!grid.cells[newRow][newCol].isBlack) {
        setCursor({ row: newRow, col: newCol });
      }
      return;
    }
  }

  return (
    <div
      className="inline-block border-2 border-black"
      ref={gridRef}
      tabIndex={0} // makes div focusable for keydown
      onKeyDown={handleKeyDown}
    >
      {grid.cells.map((row, rowIdx) => (
        <div key={rowIdx} className="flex">
          {row.map((cell, colIdx) => (
            <GridCell
              key={colIdx}
              cell={cell}
              isSelected={cursor?.row === rowIdx && cursor?.col === colIdx}
              isHighlighted={highlightedKeys.has(`${rowIdx},${colIdx}`)}
              onClick={() => handleCellClick(rowIdx, colIdx)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface GridCellProps {
  cell: Cell;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}

function GridCell({ cell, isSelected, isHighlighted, onClick }: GridCellProps) {
  let bgColor = "bg-white";
  if (cell.isBlack) bgColor = "bg-black";
  else if (isSelected) bgColor = "bg-blue-400";
  else if (isHighlighted) bgColor = "bg-blue-100";

  return (
    <div
      onClick={onClick}
      className={`
        relative w-9 h-9 border border-black cursor-pointer
        flex items-center justify-center
        ${bgColor}
      `}
    >
      {/* Cell number in top-left corner */}
      {cell.number !== null && (
        <span className="absolute top-0 left-0.5 text-[9px] leading-none">
          {cell.number}
        </span>
      )}

      {/* Letter in center */}
      {!cell.isBlack && (
        <span className="text-sm font-bold uppercase">{cell.letter}</span>
      )}
    </div>
  );
}

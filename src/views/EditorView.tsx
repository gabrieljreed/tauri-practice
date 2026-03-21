import { Grid } from "@/components/Grid";
import { usePuzzleStore } from "@/stores/puzzleStore";

export function EditorView() {
  const newPuzzle = usePuzzleStore((s) => s.newPuzzle);

  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => newPuzzle(15, 15)}
      >
        New 15x15 Puzzle
      </button>
      <Grid />
    </div>
  );
}

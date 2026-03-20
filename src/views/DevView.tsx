import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface CellData {
  row: number;
  col: number;
  is_black: boolean;
  letter: string | null;
  number: number | null;
}

interface ClueData {
  number: number;
  direction: string;
  clue_text: string | null;
}

interface PuzzleData {
  id: number | null;
  title: string | null;
  author: string | null;
  notes: string | null;
  rows: number;
  cols: number;
  symmetry: string;
  cells: CellData[];
  clues: ClueData[];
}

// A minimal 3x3 test puzzle
const TEST_PUZZLE: PuzzleData = {
  id: null,
  title: "Test Puzzle",
  author: "Test Author",
  notes: null,
  rows: 3,
  cols: 3,
  symmetry: "rotational",
  cells: [
    { row: 0, col: 0, is_black: false, letter: "C", number: 1 },
    { row: 0, col: 1, is_black: false, letter: "A", number: 2 },
    { row: 0, col: 2, is_black: false, letter: "T", number: null },
    { row: 1, col: 0, is_black: true, letter: null, number: null },
    { row: 1, col: 1, is_black: false, letter: "B", number: null },
    { row: 1, col: 2, is_black: true, letter: null, number: null },
    { row: 2, col: 0, is_black: false, letter: "D", number: 3 },
    { row: 2, col: 1, is_black: false, letter: "O", number: null },
    { row: 2, col: 2, is_black: false, letter: "G", number: null },
  ],
  clues: [
    { number: 1, direction: "across", clue_text: "Feline" },
    { number: 3, direction: "across", clue_text: "Canine" },
    { number: 1, direction: "down", clue_text: "Cold remedy" },
    { number: 2, direction: "down", clue_text: "Insect home" },
  ],
};

export function DevView() {
  const [savedId, setSavedId] = useState<number | null>(null);
  const [loadedPuzzle, setLoadedPuzzle] = useState<PuzzleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    try {
      const id = await invoke<number>("save_puzzle", { puzzle: TEST_PUZZLE });
      setSavedId(id);
      console.log("Saved puzzle with id:", id);
    } catch (e) {
      setError(`Save failed: ${e}`);
    }
  }

  async function handleLoad() {
    if (savedId === null) {
      setError("Save a puzzle first to get an ID");
      return;
    }
    setError(null);
    try {
      console.log("savedId:", savedId);
      const puzzle = await invoke<PuzzleData>("load_puzzle", {
        puzzleId: savedId,
      });
      setLoadedPuzzle(puzzle);
      console.log("Loaded puzzle", puzzle);
    } catch (e) {
      setError(`Load failed: ${e}`);
    }
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>DB Test</h1>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleSave}>Save Test Puzzle</button>
        {savedId !== null && (
          <span style={{ marginLeft: "1rem" }}>✓ Saved with id: {savedId}</span>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleLoad} disabled={savedId === null}>
          Load Puzzle {savedId ?? ""}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {loadedPuzzle && (
        <div>
          <h2>Loaded Puzzle</h2>
          <pre>{JSON.stringify(loadedPuzzle, null, 2)}</pre>
        </div>
      )}
    </main>
  );
}

import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Button } from "@/components/ui/button";
import { CardDemo } from "./components/ui/card-demo";
import { create } from "zustand";

const useCount = create((set) => ({
  count: 0,
  doIncrement: () => set((state: { count: number }) => ({ count: state.count + 1 })),
  resetCount: () => set({ count: 0 }),
  updateCount: (newCount: number) => set({ count: newCount }),
}))

function App() {
  const [rustMsg, setRustMsg] = useState("");
  const { count, doIncrement, resetCount, updateCount } = useCount();

  async function callRust() {
    try {
      const result = await invoke<string>("create_grid", { size: { rows: 15, cols: 15 } });
      setRustMsg(result);
    } catch (error) {
      setRustMsg(`Error: ${error}`);
    }
  }

  return (
    <main className="container bg-foreground">
      <Button onClick={callRust}>Call Rust Function</Button>
      <p className="text-white font-sans">{rustMsg}</p>
      <CardDemo />
    </main>
  );
}

export default App;

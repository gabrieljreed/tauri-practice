import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { Button } from "@/components/ui/button";
import { CardDemoUndo } from "./components/ui/card-demo-undo";
import { CardDemoRust } from "./components/ui/card-demo-rust";
import { CardDemoBasic } from "./components/ui/counter-demo-basic";
import { CounterDemoRustUndo } from "./components/ui/counter-demo-rust-undo";


function App() {
  const [rustMsg, setRustMsg] = useState("");

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
      <CardDemoBasic />
      <CardDemoRust />
      <CardDemoUndo />
      <CounterDemoRustUndo />
    </main>
  );
}

export default App;

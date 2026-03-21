import { useEffect } from "react";
import "./App.css";
import { useSettingsStore } from "./stores/useSettingsStore";
import { create } from "zustand";
import { EditorView } from "./views/EditorView";
import { DevView } from "./views/DevView";
import { SettingsView } from "./views/SettingsView";

type View = "editor" | "settings" | "dev";

interface NavState {
  currentView: View;
  navigate: (view: View) => void;
}

export const useNavStore = create<NavState>((set) => ({
  currentView: "editor",
  navigate: (view) => set({ currentView: view }),
}));

function App() {
  const { settings, updateSetting, loadSettings, isLoaded } =
    useSettingsStore();
  const { currentView, navigate } = useNavStore();

  useEffect(() => {
    loadSettings();
  }, []); // Empty array: run once on mount (like __init__)

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <nav
        style={{
          padding: "0.5rem",
          borderBottom: "1px solid #ccc",
          display: "flex",
          gap: "1rem",
        }}
      >
        {(["editor", "settings", "dev"] as View[]).map((view) => (
          <button
            key={view}
            onClick={() => navigate(view)}
            style={{
              fontWeight: currentView === view ? "bold" : "normal",
              textDecoration: currentView === view ? "underline" : "none",
              cursor: "pointer",
            }}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </nav>

      {currentView === "editor" && <EditorView />}
      {currentView === "settings" && <SettingsView />}
      {currentView === "dev" && <DevView />}
    </main>
  );
}

export default App;

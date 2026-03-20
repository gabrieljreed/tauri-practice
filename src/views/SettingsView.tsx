import { useSettingsStore } from "@/stores/useSettingsStore";

export function SettingsView() {
  const { settings, updateSetting } = useSettingsStore();

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace" }}>
      <h1>Settings</h1>
      <p>Default grid size: {settings.editor.defaultRows} x {settings.editor.defaultCols}</p>
      <p>Theme: {settings.ui.theme}</p>
      <button onClick={() =>
        updateSetting("ui", { ...settings.ui, theme: settings.ui.theme === "light" ? "dark" : "light" })
      }>
        Toggle theme
      </button>
      <pre>{JSON.stringify(settings, null, 2)}</pre>
    </main>
  );
}

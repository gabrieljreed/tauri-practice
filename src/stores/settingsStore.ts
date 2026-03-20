import { load } from "@tauri-apps/plugin-store";

export const DEFAULT_SETTINGS = {
  // Keybinds - tinykeys format
  keybinds: {
    toggleBlackSquare: "Space",
    moveUp: "ArrowUp",
    moveDown: "ArrowDown",
    moveLeft: "ArrowLeft",
    moveRight: "ArrowRight",
    toggleDirection: "Tab",
    undo: "$mod+z",
    redo: "$mod+Shift+z",
    save: "$mod+s",
  },
  ui: {
    theme: "dark" as "light" | "dark",
    fontSize: 14,
  },
  editor: {
    defaultRows: 15,
    defaultCols: 15,
    defaultSymmetry: "rotational" as "rotational" | "vertical" | "horizontal" | "none",
  },
};

export type Settings = typeof DEFAULT_SETTINGS;

export async function getSettingsStore() {
  return await load("settings.json", { autoSave: true, defaults: {} });
}

export async function getSetting<K extends keyof Settings>(
  key: K
): Promise<Settings[K]> {
  const store = await getSettingsStore();
  const value = await store.get<Settings[K]>(key);
  return value ?? DEFAULT_SETTINGS[key];
}

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K]
): Promise<void> {
  const store = await getSettingsStore();
  await store.set(key, value);
}

import { create } from "zustand";
import {
  DEFAULT_SETTINGS,
  Settings,
  getSetting,
  setSetting,
} from "./settingsStore";

interface SettingsState {
  settings: Settings;
  isLoaded: boolean;
  // Load all settings from disk
  loadSettings: () => Promise<void>;
  updateSetting: <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    const keybinds = await getSetting("keybinds");
    const ui = await getSetting("ui");
    const editor = await getSetting("editor");

    set({
      settings: { keybinds, ui, editor },
      isLoaded: true,
    });
  },

  updateSetting: async (key, value) => {
    // Update Zustand
    set((state) => ({
      settings: { ...state.settings, [key]: value },
    }));
    // Persist setting to disk
    await setSetting(key, value);
  },
}));

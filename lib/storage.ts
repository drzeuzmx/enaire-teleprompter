import { DEFAULT_SETTINGS, PrompterSettings, SavedScript } from "./types";

const SCRIPTS_KEY = "enaire:scripts";
const SETTINGS_KEY = "enaire:settings";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadScripts(): SavedScript[] {
  if (typeof window === "undefined") return [];
  return safeParse<SavedScript[]>(localStorage.getItem(SCRIPTS_KEY), []);
}

export function saveScript(script: SavedScript) {
  if (typeof window === "undefined") return;
  const existing = loadScripts().filter((s) => s.id !== script.id);
  const updated = [script, ...existing].slice(0, 20);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(updated));
}

export function deleteScript(id: string) {
  if (typeof window === "undefined") return;
  const updated = loadScripts().filter((s) => s.id !== id);
  localStorage.setItem(SCRIPTS_KEY, JSON.stringify(updated));
}

export function clearScripts() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SCRIPTS_KEY);
}

export function loadSettings(): PrompterSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...safeParse<Partial<PrompterSettings>>(localStorage.getItem(SETTINGS_KEY), {}),
  };
}

export function saveSettings(settings: PrompterSettings) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

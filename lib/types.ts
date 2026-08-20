export type ScrollMode = "voice" | "constant";

export type FontStyle = "legible" | "serif" | "mono" | "body";

export type DictationLang = "es-MX" | "es-ES" | "en-US" | "en-GB" | "pt-BR";

export interface PrompterSettings {
  fontStyle: FontStyle;
  fontSize: number; // px
  lineSpacing: number; // multiplier
  align: "left" | "center";
  theme: "dark" | "light";
  mirrorH: boolean;
  mirrorV: boolean;
  activeLinePosition: number; // 0-100 (% from top)
  lookaheadWords: number;
  dictationLang: DictationLang;
  scrollMode: ScrollMode;
  constantSpeed: number; // words per second, used only in constant mode
  highlightWord: boolean;
}

export const DEFAULT_SETTINGS: PrompterSettings = {
  fontStyle: "legible",
  fontSize: 44,
  lineSpacing: 1.4,
  align: "left",
  theme: "dark",
  mirrorH: false,
  mirrorV: false,
  activeLinePosition: 38,
  lookaheadWords: 8,
  dictationLang: "es-MX",
  scrollMode: "voice",
  constantSpeed: 2.4,
  highlightWord: true,
};

export interface SavedScript {
  id: string;
  title: string;
  text: string;
  savedAt: number;
  sourceDocUrl?: string;
}

"use client";

import { DictationLang, FontStyle, PrompterSettings } from "@/lib/types";

interface SettingsPanelProps {
  settings: PrompterSettings;
  onChange: (patch: Partial<PrompterSettings>) => void;
  voiceSupported: boolean;
  compact?: boolean;
}

const LANGS: { value: DictationLang; label: string }[] = [
  { value: "es-MX", label: "Español (México)" },
  { value: "es-ES", label: "Español (España)" },
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "pt-BR", label: "Português (Brasil)" },
];

const FONTS: { value: FontStyle; label: string }[] = [
  { value: "legible", label: "Legible" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
          {label}
        </label>
      </div>
      {children}
      {hint && <p className="text-[11px] text-steel/80 leading-snug">{hint}</p>}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onSelect,
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={opt.disabled}
          onClick={() => onSelect(opt.value)}
          className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "bg-signal text-void"
              : opt.disabled
              ? "text-steel/40 cursor-not-allowed"
              : "text-ink/70 hover:text-ink"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-black/40 px-3 py-2"
    >
      <span className="text-sm text-ink/85">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-signal" : "bg-white/15"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPanel({ settings, onChange, voiceSupported, compact }: SettingsPanelProps) {
  return (
    <div className={`space-y-5 ${compact ? "" : ""}`}>
      <Field label="Modo de desplazamiento">
        <Segmented
          value={settings.scrollMode}
          onSelect={(v) => onChange({ scrollMode: v })}
          options={[
            { value: "voice", label: "Por voz", disabled: !voiceSupported },
            { value: "constant", label: "Constante" },
          ]}
        />
        {!voiceSupported && (
          <p className="text-[11px] text-cue leading-snug">
            Tu navegador no soporta reconocimiento de voz. Usa Chrome, Edge o Safari para el modo por voz —
            por ahora quedó en modo constante.
          </p>
        )}
      </Field>

      {settings.scrollMode === "constant" && (
        <Field label={`Velocidad · ${settings.constantSpeed.toFixed(1)} palabras/seg`}>
          <input
            type="range"
            min={0.8}
            max={5}
            step={0.1}
            value={settings.constantSpeed}
            onChange={(e) => onChange({ constantSpeed: parseFloat(e.target.value) })}
            className="w-full"
          />
        </Field>
      )}

      {settings.scrollMode === "voice" && (
        <Field label="Idioma de dictado">
          <select
            value={settings.dictationLang}
            onChange={(e) => onChange({ dictationLang: e.target.value as DictationLang })}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-ink"
          >
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Tipografía">
        <Segmented value={settings.fontStyle} onSelect={(v) => onChange({ fontStyle: v })} options={FONTS} />
      </Field>

      <Field label={`Tamaño de letra · ${settings.fontSize}px`}>
        <input
          type="range"
          min={24}
          max={96}
          step={2}
          value={settings.fontSize}
          onChange={(e) => onChange({ fontSize: parseInt(e.target.value, 10) })}
          className="w-full"
        />
      </Field>

      <Field label={`Interlineado · ${settings.lineSpacing.toFixed(1)}x`}>
        <input
          type="range"
          min={1.1}
          max={2.2}
          step={0.1}
          value={settings.lineSpacing}
          onChange={(e) => onChange({ lineSpacing: parseFloat(e.target.value) })}
          className="w-full"
        />
      </Field>

      <Field label={`Posición de lectura · ${settings.activeLinePosition}% desde arriba`}>
        <input
          type="range"
          min={15}
          max={65}
          step={1}
          value={settings.activeLinePosition}
          onChange={(e) => onChange({ activeLinePosition: parseInt(e.target.value, 10) })}
          className="w-full"
        />
      </Field>

      <Field label="Alineación">
        <Segmented
          value={settings.align}
          onSelect={(v) => onChange({ align: v })}
          options={[
            { value: "left", label: "Izquierda" },
            { value: "center", label: "Centro" },
          ]}
        />
      </Field>

      <Field label="Tema">
        <Segmented
          value={settings.theme}
          onSelect={(v) => onChange({ theme: v })}
          options={[
            { value: "dark", label: "Oscuro" },
            { value: "light", label: "Claro" },
          ]}
        />
      </Field>

      <div className="grid grid-cols-1 gap-2">
        <Toggle
          checked={settings.highlightWord}
          onChange={(v) => onChange({ highlightWord: v })}
          label="Subrayar palabra actual"
        />
        <Toggle
          checked={settings.mirrorH}
          onChange={(v) => onChange({ mirrorH: v })}
          label="Espejo horizontal (vidrio teleprompter)"
        />
        <Toggle
          checked={settings.mirrorV}
          onChange={(v) => onChange({ mirrorV: v })}
          label="Espejo vertical"
        />
      </div>

      <details className="group">
        <summary className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
          Avanzado
        </summary>
        <div className="mt-3">
          <Field
            label={`Ventana de coincidencia · ${settings.lookaheadWords} palabras`}
            hint="Qué tan adelante busca tu voz en el guion. Súbelo si el prompter se atrasa; bájalo si salta de más."
          >
            <input
              type="range"
              min={6}
              max={30}
              step={1}
              value={settings.lookaheadWords}
              onChange={(e) => onChange({ lookaheadWords: parseInt(e.target.value, 10) })}
              className="w-full"
            />
          </Field>
        </div>
      </details>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { FileText, Link2, Mic, Play, Trash2, X } from "lucide-react";
import { PrompterSettings, SavedScript } from "@/lib/types";
import SettingsPanel from "./SettingsPanel";

interface SetupScreenProps {
  script: string;
  title: string;
  onScriptChange: (text: string) => void;
  onTitleChange: (title: string) => void;
  onImportDoc: (url: string) => Promise<void>;
  importing: boolean;
  importError: string | null;
  recentScripts: SavedScript[];
  onLoadScript: (script: SavedScript) => void;
  onDeleteScript: (id: string) => void;
  onClearScripts: () => void;
  settings: PrompterSettings;
  onSettingsChange: (patch: Partial<PrompterSettings>) => void;
  voiceSupported: boolean;
  onStart: () => void;
}

export default function SetupScreen({
  script,
  title,
  onScriptChange,
  onTitleChange,
  onImportDoc,
  importing,
  importError,
  recentScripts,
  onLoadScript,
  onDeleteScript,
  onClearScripts,
  settings,
  onSettingsChange,
  voiceSupported,
  onStart,
}: SetupScreenProps) {
  const [docUrl, setDocUrl] = useState("");

  const wordCount = useMemo(
    () => (script.match(/\S+/g) || []).length,
    [script]
  );
  const estMinutes = useMemo(() => {
    const wps = settings.scrollMode === "constant" ? settings.constantSpeed : 2.4;
    return wordCount / wps / 60;
  }, [wordCount, settings.scrollMode, settings.constantSpeed]);

  const handleImport = async () => {
    if (!docUrl.trim()) return;
    await onImportDoc(docUrl.trim());
  };

  return (
    <div className="min-h-screen bg-void text-ink">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-tally animate-pulse-tally" />
            <span className="font-display text-2xl tracking-tight">
              En<span className="text-signal">Aire</span>
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
            Teleprompter por voz
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1fr_360px]">
        {/* Script column */}
        <section className="space-y-4">
          <div>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Título del guion (opcional)"
              className="w-full bg-transparent font-display text-xl text-ink placeholder:text-steel/60 focus:outline-none"
            />
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-stage px-3 py-2">
                <Link2 size={15} className="shrink-0 text-steel" />
                <input
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  placeholder="Pega el link de tu Google Doc (compartido como 'Cualquiera con el enlace')"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-steel/60 focus:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleImport()}
                />
              </div>
              <button
                onClick={handleImport}
                disabled={importing || !docUrl.trim()}
                className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {importing ? "Importando…" : "Importar"}
              </button>
            </div>
            {importError && (
              <p className="mt-2 text-[13px] leading-snug text-tally">{importError}</p>
            )}
          </div>

          <textarea
            value={script}
            onChange={(e) => onScriptChange(e.target.value)}
            placeholder="Pega o escribe aquí tu guion…"
            className="h-[420px] w-full resize-none rounded-xl border border-white/10 bg-stage p-5 font-body text-[15px] leading-relaxed text-ink/90 placeholder:text-steel/50 focus:border-signal/40 focus:outline-none"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] uppercase tracking-wider text-steel">
              {wordCount} palabras · ~{estMinutes < 1 ? "<1" : Math.round(estMinutes)} min de lectura
            </span>
            <button
              onClick={onStart}
              disabled={wordCount === 0}
              className="flex items-center gap-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-void transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
            >
              <Play size={16} fill="currentColor" />
              Iniciar Teleprompter
            </button>
          </div>

          {recentScripts.length > 0 && (
            <div className="pt-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-steel">
                  Guiones recientes
                </h3>
                <button
                  onClick={onClearScripts}
                  className="text-[11px] text-steel/80 hover:text-tally"
                >
                  Borrar historial
                </button>
              </div>
              <ul className="space-y-1.5">
                {recentScripts.map((s) => (
                  <li
                    key={s.id}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-stage px-3 py-2.5"
                  >
                    <button
                      onClick={() => onLoadScript(s)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                    >
                      <FileText size={14} className="shrink-0 text-steel" />
                      <span className="truncate text-sm text-ink/85">{s.title}</span>
                      <span className="shrink-0 font-mono text-[10px] text-steel">
                        {(s.text.match(/\S+/g) || []).length}p
                      </span>
                    </button>
                    <button
                      onClick={() => onDeleteScript(s.id)}
                      className="shrink-0 text-steel/60 opacity-0 transition-opacity hover:text-tally group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Settings column */}
        <aside className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-stage px-3 py-2.5">
            <Mic size={15} className={voiceSupported ? "text-signal" : "text-tally"} />
            <span className="text-[13px] text-ink/80">
              {voiceSupported
                ? "Reconocimiento de voz disponible en este navegador."
                : "Este navegador no soporta reconocimiento de voz — usa Chrome, Edge o Safari."}
            </span>
          </div>
          <div className="rounded-xl border border-white/10 bg-stage p-5">
            <SettingsPanel
              settings={settings}
              onChange={onSettingsChange}
              voiceSupported={voiceSupported}
            />
          </div>
        </aside>
      </main>
    </div>
  );
}

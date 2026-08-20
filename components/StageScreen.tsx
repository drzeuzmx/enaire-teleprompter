"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  X,
} from "lucide-react";
import { PrompterSettings } from "@/lib/types";
import { TextMatcher, detectVoiceCommand } from "@/lib/textMatcher";
import { useSpeechRecognition } from "@/lib/useSpeechRecognition";
import VuTally from "./VuTally";
import SettingsPanel from "./SettingsPanel";

interface StageScreenProps {
  script: string;
  settings: PrompterSettings;
  onSettingsChange: (patch: Partial<PrompterSettings>) => void;
  onExit: () => void;
  voiceSupported: boolean;
}

export default function StageScreen({
  script,
  settings,
  onSettingsChange,
  onExit,
  voiceSupported,
}: StageScreenProps) {
  const matcherRef = useRef<TextMatcher>(new TextMatcher(script, settings.lookaheadWords));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [chromeVisible, setChromeVisible] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const wordRefs = useRef<Map<number, HTMLSpanElement>>(new Map());
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    matcherRef.current.lookahead = settings.lookaheadWords;
  }, [settings.lookaheadWords]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const container = containerRef.current;
      const el = wordRefs.current.get(index);
      if (!container || !el) return;
      const targetTop =
        el.offsetTop - container.clientHeight * (settings.activeLinePosition / 100);
      container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    },
    [settings.activeLinePosition]
  );

  const applyIndex = useCallback(
    (index: number) => {
      matcherRef.current.jumpTo(index);
      setCurrentIndex(matcherRef.current.currentIndex);
      scrollToIndex(matcherRef.current.currentIndex);
    },
    [scrollToIndex]
  );

  const handleTranscript = useCallback(
    (transcript: string) => {
      const command = detectVoiceCommand(transcript);
      if (command) {
        if (command === "pause") setPaused(true);
        else if (command === "resume") setPaused(false);
        else if (command === "restart") applyIndex(0);
        else if (command === "end") applyIndex(matcherRef.current.total - 1);
        else if (command === "back") applyIndex(matcherRef.current.currentIndex - 20);
        return;
      }
      if (paused) return;
      const tailWords = transcript.trim().split(/\s+/).slice(-8).join(" ");
      const newIndex = matcherRef.current.consumeTranscript(tailWords);
      setCurrentIndex(newIndex);
      scrollToIndex(newIndex);
    },
    [applyIndex, paused, scrollToIndex]
  );

  const speech = useSpeechRecognition({
    lang: settings.dictationLang,
    onTranscript: handleTranscript,
  });

  const usingVoice = settings.scrollMode === "voice" && voiceSupported;

  // Voice mode: start/stop recognition with pause state.
  useEffect(() => {
    if (!usingVoice) return;
    if (paused) {
      speech.stop();
    } else {
      speech.start();
    }
    return () => speech.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usingVoice, paused]);

  // Constant mode: advance on a raf loop at configured words/sec.
  useEffect(() => {
    if (usingVoice || paused) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
      return;
    }
    const step = (t: number) => {
      if (!lastTickRef.current) lastTickRef.current = t;
      const elapsed = t - lastTickRef.current;
      const msPerWord = 1000 / settings.constantSpeed;
      if (elapsed >= msPerWord) {
        const wordsToAdvance = Math.floor(elapsed / msPerWord);
        lastTickRef.current = t;
        const next = Math.min(
          matcherRef.current.total - 1,
          matcherRef.current.currentIndex + wordsToAdvance
        );
        if (next !== matcherRef.current.currentIndex) {
          matcherRef.current.jumpTo(next);
          setCurrentIndex(next);
          scrollToIndex(next);
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [usingVoice, paused, settings.constantSpeed, scrollToIndex]);

  // Auto-hide chrome after inactivity.
  useEffect(() => {
    const reveal = () => {
      setChromeVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => setChromeVisible(false), 3200);
    };
    reveal();
    window.addEventListener("mousemove", reveal);
    window.addEventListener("touchstart", reveal);
    window.addEventListener("keydown", reveal);
    return () => {
      window.removeEventListener("mousemove", reveal);
      window.removeEventListener("touchstart", reveal);
      window.removeEventListener("keydown", reveal);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Keyboard shortcuts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setPaused((p) => !p);
      } else if (e.code === "Escape") {
        onExit();
      } else if (e.code === "ArrowDown") {
        applyIndex(matcherRef.current.currentIndex + 8);
      } else if (e.code === "ArrowUp") {
        applyIndex(matcherRef.current.currentIndex - 8);
      } else if (e.key === "+" || e.key === "=") {
        onSettingsChange({ fontSize: Math.min(96, settings.fontSize + 2) });
      } else if (e.key === "-" || e.key === "_") {
        onSettingsChange({ fontSize: Math.max(24, settings.fontSize - 2) });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyIndex, onExit, onSettingsChange, settings.fontSize]);

  const fontClass = useMemo(() => {
    switch (settings.fontStyle) {
      case "serif":
        return "font-serif";
      case "mono":
        return "font-mono";
      default:
        return "font-legible";
    }
  }, [settings.fontStyle]);

  const mirrorClass = settings.mirrorH && settings.mirrorV ? "mirror-hv" : settings.mirrorH ? "mirror-h" : settings.mirrorV ? "mirror-v" : "";

  const isDark = settings.theme === "dark";
  const bgClass = isDark ? "bg-void" : "bg-paper";
  const textColor = isDark ? "text-ink" : "text-[#1a1a1a]";

  const progress = matcherRef.current.progress();

  return (
    <div className={`relative h-screen w-screen overflow-hidden ${bgClass}`}>
      {/* progress bar */}
      <div className="absolute left-0 right-0 top-0 z-30 h-[2px] bg-white/10">
        <div
          className="h-full bg-signal transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* top chrome */}
      <div
        className={`absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 pt-4 transition-opacity duration-500 ${
          chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <VuTally
          active={!paused}
          hearingSound={speech.isHearingSound}
          paused={paused}
          mode={usingVoice ? "voice" : "constant"}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => applyIndex(0)}
            title="Reiniciar (desde el inicio)"
            className="rounded-full border border-white/10 bg-black/70 p-2 text-ink/80 backdrop-blur-md hover:text-ink"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setPaused((p) => !p)}
            title="Pausar / reanudar (barra espaciadora)"
            className="rounded-full border border-white/10 bg-black/70 p-2 text-ink/80 backdrop-blur-md hover:text-ink"
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            title="Ajustes"
            className="rounded-full border border-white/10 bg-black/70 p-2 text-ink/80 backdrop-blur-md hover:text-ink"
          >
            <Settings2 size={16} />
          </button>
          <button
            onClick={onExit}
            title="Salir (Esc)"
            className="rounded-full border border-white/10 bg-black/70 p-2 text-ink/80 backdrop-blur-md hover:text-tally"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* mic permission / error banner */}
      {usingVoice && speech.error && (
        <div className="absolute left-1/2 top-16 z-30 w-[92%] max-w-md -translate-x-1/2 rounded-lg border border-tally/40 bg-black/85 px-4 py-3 text-center text-sm text-ink backdrop-blur-md">
          {speech.error === "not-allowed"
            ? "Necesito permiso de micrófono para seguir tu voz. Actívalo en el navegador y presiona reanudar."
            : speech.error === "no-mic"
            ? "No detecto un micrófono conectado."
            : "El reconocimiento de voz tuvo un problema. Intentando reconectar…"}
        </div>
      )}

      {/* settings drawer */}
      {showSettings && (
        <div className="absolute right-0 top-0 z-40 h-full w-[320px] overflow-y-auto border-l border-white/10 bg-void/95 p-5 pt-16 backdrop-blur-md">
          <SettingsPanel settings={settings} onChange={onSettingsChange} voiceSupported={voiceSupported} compact />
        </div>
      )}

      {/* script */}
      <div
        ref={containerRef}
        className={`stage-scroll h-full overflow-y-auto ${mirrorClass}`}
        style={{ paddingTop: "45vh", paddingBottom: "60vh" }}
      >
        <div
          className={`mx-auto max-w-4xl px-8 ${fontClass} ${textColor} ${
            settings.align === "center" ? "text-center" : "text-left"
          }`}
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineSpacing,
          }}
        >
          {matcherRef.current.words.map((w) => (
            <span
              key={w.index}
              ref={(el) => {
                if (el) wordRefs.current.set(w.index, el);
              }}
              onClick={() => applyIndex(w.index)}
              className={`script-word cursor-pointer ${
                w.index === currentIndex && settings.highlightWord ? "active text-signal" : ""
              } ${w.index < currentIndex ? "opacity-40" : "opacity-100"}`}
            >
              {w.raw}{" "}
            </span>
          ))}
        </div>
      </div>

      {/* manual nudge controls, bottom */}
      <div
        className={`absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 transition-opacity duration-500 ${
          chromeVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => applyIndex(currentIndex - 8)}
          className="rounded-full border border-white/10 bg-black/70 p-2.5 text-ink/80 backdrop-blur-md hover:text-ink"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => onSettingsChange({ fontSize: Math.max(24, settings.fontSize - 2) })}
          className="rounded-full border border-white/10 bg-black/70 p-2.5 text-ink/80 backdrop-blur-md hover:text-ink"
        >
          <Minus size={16} />
        </button>
        <span className="rounded-full border border-white/10 bg-black/70 px-3 py-2 font-mono text-[11px] text-ink/70 backdrop-blur-md">
          {Math.round(progress)}%
        </span>
        <button
          onClick={() => onSettingsChange({ fontSize: Math.min(96, settings.fontSize + 2) })}
          className="rounded-full border border-white/10 bg-black/70 p-2.5 text-ink/80 backdrop-blur-md hover:text-ink"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => applyIndex(currentIndex + 8)}
          className="rounded-full border border-white/10 bg-black/70 p-2.5 text-ink/80 backdrop-blur-md hover:text-ink"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

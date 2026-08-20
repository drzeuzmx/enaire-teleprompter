"use client";

import { useEffect, useState } from "react";
import LoginScreen from "@/components/LoginScreen";
import SetupScreen from "@/components/SetupScreen";
import StageScreen from "@/components/StageScreen";
import { DEFAULT_SETTINGS, PrompterSettings, SavedScript } from "@/lib/types";
import {
  clearScripts,
  deleteScript,
  loadScripts,
  loadSettings,
  saveScript,
  saveSettings,
} from "@/lib/storage";

const AUTH_KEY = "enaire:auth";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [script, setScript] = useState("");
  const [title, setTitle] = useState("");
  const [settings, setSettings] = useState<PrompterSettings>(DEFAULT_SETTINGS);
  const [recentScripts, setRecentScripts] = useState<SavedScript[]>([]);
  const [stage, setStage] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [sourceDocUrl, setSourceDocUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSettings(loadSettings());
    setRecentScripts(loadScripts());
    setAuthenticated(typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "ok");
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setVoiceSupported(Boolean(Ctor));
    if (!Ctor) {
      setSettings((s) => (s.scrollMode === "voice" ? { ...s, scrollMode: "constant" } : s));
    }
  }, []);

  const handleLoginSuccess = () => {
    sessionStorage.setItem(AUTH_KEY, "ok");
    setAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setAuthenticated(false);
    setStage(false);
  };

  const handleSettingsChange = (patch: Partial<PrompterSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  const handleImportDoc = async (url: string) => {
    setImporting(true);
    setImportError(null);
    try {
      const res = await fetch("/api/import-doc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setImportError(data.error || "No pude importar el documento.");
        return;
      }
      setScript(data.text || "");
      setTitle(data.title || "Documento importado");
      setSourceDocUrl(url);
    } catch {
      setImportError("No pude conectar con Google Docs. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setImporting(false);
    }
  };

  const persistCurrentScript = () => {
    if (!script.trim()) return;
    const saved: SavedScript = {
      id: sourceDocUrl ? `doc:${sourceDocUrl}` : `local:${Date.now()}`,
      title: title.trim() || "Guion sin título",
      text: script,
      savedAt: Date.now(),
      sourceDocUrl,
    };
    saveScript(saved);
    setRecentScripts(loadScripts());
  };

  const handleStart = () => {
    if (!script.trim()) return;
    persistCurrentScript();
    try {
      document.documentElement.requestFullscreen?.();
    } catch {
      // best-effort only
    }
    setStage(true);
  };

  const handleExit = () => {
    try {
      if (document.fullscreenElement) document.exitFullscreen?.();
    } catch {
      // ignore
    }
    setStage(false);
  };

  const handleLoadScript = (saved: SavedScript) => {
    setScript(saved.text);
    setTitle(saved.title);
    setSourceDocUrl(saved.sourceDocUrl);
  };

  const handleDeleteScript = (id: string) => {
    deleteScript(id);
    setRecentScripts(loadScripts());
  };

  const handleClearScripts = () => {
    clearScripts();
    setRecentScripts([]);
  };

  if (!authenticated) {
    return <LoginScreen onSuccess={handleLoginSuccess} />;
  }

  if (stage) {
    return (
      <StageScreen
        script={script}
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onExit={handleExit}
        voiceSupported={voiceSupported}
      />
    );
  }

  return (
    <SetupScreen
      script={script}
      title={title}
      onScriptChange={setScript}
      onTitleChange={setTitle}
      onImportDoc={handleImportDoc}
      importing={importing}
      importError={importError}
      recentScripts={recentScripts}
      onLoadScript={handleLoadScript}
      onDeleteScript={handleDeleteScript}
      onClearScripts={handleClearScripts}
      settings={settings}
      onSettingsChange={handleSettingsChange}
      voiceSupported={voiceSupported}
      onStart={handleStart}
      onLogout={handleLogout}
    />
  );
}

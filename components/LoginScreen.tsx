"use client";

import { useState } from "react";
import { Lock, User } from "lucide-react";

// Demo-only credentials, intentionally hardcoded in the client bundle.
// This is NOT real authentication -- anyone can read these from devtools.
// Fine for a sample/demo gate, not for protecting anything sensitive.
const DEMO_USERNAME = "tester1";
const DEMO_PASSWORD = "Tester2026";

interface LoginScreenProps {
  onSuccess: () => void;
}

export default function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setError(null);
      onSuccess();
    } else {
      setError("Usuario o contraseña incorrectos.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-void px-5 text-ink">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-5 rounded-xl border border-white/10 bg-stage p-7"
      >
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-tally animate-pulse-tally" />
            <span className="font-display text-2xl tracking-tight">
              En<span className="text-signal">Aire</span>
            </span>
          </div>
          <p className="mt-1.5 text-[13px] text-steel">Acceso de muestra — solo para pruebas.</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5">
            <User size={15} className="shrink-0 text-steel" />
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario"
              autoComplete="username"
              className="w-full bg-transparent text-sm text-ink placeholder:text-steel/60 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2.5">
            <Lock size={15} className="shrink-0 text-steel" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              autoComplete="current-password"
              className="w-full bg-transparent text-sm text-ink placeholder:text-steel/60 focus:outline-none"
            />
          </div>
        </div>

        {error && <p className="text-[13px] text-tally">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-signal py-2.5 text-sm font-semibold text-void transition-transform hover:scale-[1.02]"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

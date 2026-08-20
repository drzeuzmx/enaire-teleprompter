"use client";

interface VuTallyProps {
  active: boolean; // stage is running (voice or constant mode)
  hearingSound: boolean;
  paused: boolean;
  mode: "voice" | "constant";
}

export default function VuTally({ active, hearingSound, paused, mode }: VuTallyProps) {
  let dotColor = "bg-steel";
  let label = "PAUSADO";
  let ringClass = "";

  if (active && !paused) {
    if (mode === "constant") {
      dotColor = "bg-cue";
      label = "AVANCE CONSTANTE";
    } else if (hearingSound) {
      dotColor = "bg-signal";
      label = "SIGUIENDO TU VOZ";
    } else {
      dotColor = "bg-tally";
      label = "EN ESPERA";
      ringClass = "animate-pulse-tally";
    }
  }

  const bars = [0, 1, 2, 3, 4];

  return (
    <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 backdrop-blur-md">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotColor} ${ringClass}`} />
      <span className="font-mono text-[10px] tracking-[0.14em] text-ink/80 whitespace-nowrap">
        {label}
      </span>
      <span className="flex items-end gap-[2px] h-3">
        {bars.map((i) => (
          <span
            key={i}
            className="w-[2.5px] rounded-full bg-signal/80"
            style={{
              height: hearingSound && active && !paused ? undefined : "3px",
              animation:
                hearingSound && active && !paused
                  ? `vuBar 0.${6 + i}s ease-in-out infinite alternate`
                  : "none",
              animationDelay: `${i * 70}ms`,
            }}
          />
        ))}
      </span>
      <style jsx>{`
        @keyframes vuBar {
          from {
            height: 3px;
            opacity: 0.5;
          }
          to {
            height: 12px;
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

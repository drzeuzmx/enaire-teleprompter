import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0C",
        stage: "#0E0E11",
        paper: "#F5F1E6",
        ink: "#EDEDED",
        tally: "#E4312B",
        signal: "#2BE4A6",
        cue: "#FFB400",
        steel: "#6B7280",
        line: "#1F1F24",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        serif: ["var(--font-serif)", "serif"],
        legible: ["var(--font-legible)", "sans-serif"],
      },
      keyframes: {
        pulseTally: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        blinkCursor: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        "pulse-tally": "pulseTally 1.4s ease-in-out infinite",
        "blink-cursor": "blinkCursor 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;

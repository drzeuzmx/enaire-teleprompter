import type { Metadata } from "next";
import {
  Barlow_Condensed,
  Inter,
  Space_Mono,
  Source_Serif_4,
  Atkinson_Hyperlegible,
} from "next/font/google";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-serif",
});

const legible = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-legible",
});

export const metadata: Metadata = {
  title: "EnAire · Teleprompter por voz",
  description:
    "Teleprompter que avanza y se detiene con tu voz, con importación directa desde Google Docs.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${body.variable} ${mono.variable} ${serif.variable} ${legible.variable} font-body`}
      >
        {children}
      </body>
    </html>
  );
}

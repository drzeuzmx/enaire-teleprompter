"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseSpeechRecognitionArgs {
  lang: string;
  onTranscript: (transcript: string, isFinal: boolean) => void;
}

export type SpeechErrorKind = "not-allowed" | "no-mic" | "other" | null;

export function useSpeechRecognition({ lang, onTranscript }: UseSpeechRecognitionArgs) {
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isHearingSound, setIsHearingSound] = useState(false);
  const [error, setError] = useState<SpeechErrorKind>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldListenRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const langRef = useRef(lang);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  onTranscriptRef.current = onTranscript;
  langRef.current = lang;

  useEffect(() => {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    setIsSupported(Boolean(Ctor));
  }, []);

  const buildRecognition = useCallback((): SpeechRecognitionLike | null => {
    const Ctor =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (!Ctor) return null;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = langRef.current;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript ?? "";
        if (transcript.trim()) {
          onTranscriptRef.current(transcript, result.isFinal);
        }
      }
    };

    recognition.onsoundstart = () => setIsHearingSound(true);
    recognition.onsoundend = () => setIsHearingSound(false);
    recognition.onspeechstart = () => setIsHearingSound(true);
    recognition.onspeechend = () => setIsHearingSound(false);

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("not-allowed");
        shouldListenRef.current = false;
      } else if (event.error === "audio-capture") {
        setError("no-mic");
        shouldListenRef.current = false;
      } else if (event.error === "no-speech" || event.error === "aborted") {
        // benign -- onend will handle restart
      } else {
        setError("other");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsHearingSound(false);
      if (shouldListenRef.current) {
        restartTimerRef.current = setTimeout(() => {
          try {
            recognitionRef.current?.start();
          } catch {
            // already running / transient -- ignored, next onend will retry
          }
        }, 200);
      }
    };

    return recognition;
  }, []);

  const start = useCallback(() => {
    if (!isSupported) return;
    shouldListenRef.current = true;
    setError(null);
    if (!recognitionRef.current) {
      recognitionRef.current = buildRecognition();
    }
    try {
      recognitionRef.current?.start();
    } catch {
      // ignore -- e.g. already started
    }
  }, [buildRecognition, isSupported]);

  const stop = useCallback(() => {
    shouldListenRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    // Restart cleanly whenever the dictation language changes mid-session.
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  return { isSupported, isListening, isHearingSound, error, start, stop };
}

// Matches live speech-recognition transcripts against a script, advancing a
// "current word" pointer only when spoken words are actually recognized in
// the upcoming part of the script. Never jumps backward on its own, and does
// nothing during silence -- which is what makes the prompter stop on its own
// when the reader stops talking.

export interface ScriptWord {
  index: number;
  raw: string; // original text, with punctuation, for display
  normalized: string; // lowercase, accent-stripped, punctuation-stripped
  paragraphStart: boolean;
}

function stripAccents(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeWord(word: string): string {
  return stripAccents(word.toLowerCase())
    .replace(/[^a-z0-9']/g, "")
    .trim();
}

export function tokenizeScript(script: string): ScriptWord[] {
  const paragraphs = script.split(/\n+/);
  const words: ScriptWord[] = [];
  let idx = 0;
  paragraphs.forEach((para) => {
    const raw = para.match(/\S+/g) || [];
    raw.forEach((w, i) => {
      words.push({
        index: idx++,
        raw: w,
        normalized: normalizeWord(w),
        paragraphStart: i === 0,
      });
    });
  });
  return words;
}

// Cheap edit-distance check, capped so it never does more work than needed
// for short words -- good enough to tolerate ASR near-misses.
function withinEditDistance(a: string, b: string, max: number): boolean {
  if (Math.abs(a.length - b.length) > max) return false;
  if (a === b) return true;
  const dp: number[] = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) dp[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = dp[j];
      dp[j] =
        a[i - 1] === b[j - 1]
          ? prev
          : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = temp;
    }
  }
  return dp[b.length] <= max;
}

function wordsMatch(spoken: string, script: string): boolean {
  if (!spoken || !script) return false;
  if (spoken === script) return true;
  if (script.length <= 3 || spoken.length <= 3) return false;
  const maxDist = script.length >= 7 ? 2 : 1;
  return withinEditDistance(spoken, script, maxDist);
}

export class TextMatcher {
  words: ScriptWord[];
  currentIndex: number;
  lookahead: number;

  constructor(script: string, lookahead = 8) {
    this.words = tokenizeScript(script);
    this.currentIndex = 0;
    this.lookahead = lookahead;
  }

  get total() {
    return this.words.length;
  }

  reset() {
    this.currentIndex = 0;
  }

  jumpTo(index: number) {
    this.currentIndex = Math.max(0, Math.min(this.words.length - 1, index));
  }

  jumpBy(delta: number) {
    this.jumpTo(this.currentIndex + delta);
  }

  /**
   * Feed a chunk of recognized speech (interim or final). Returns the
   * updated currentIndex if it moved forward, otherwise the unchanged value.
   */
  consumeTranscript(transcript: string): number {
    const spokenWords = transcript
      .split(/\s+/)
      .map(normalizeWord)
      .filter(Boolean);

    let cursor = this.currentIndex;

    for (const spoken of spokenWords) {
      const windowEnd = Math.min(
        this.words.length,
        cursor + this.lookahead
      );
      let bestMatchPos = -1;
      for (let p = cursor; p < windowEnd; p++) {
        if (wordsMatch(spoken, this.words[p].normalized)) {
          bestMatchPos = p;
          break; // earliest match in the window wins -- keeps pace steady
        }
      }
      if (bestMatchPos !== -1) {
        cursor = bestMatchPos + 1;
      }
    }

    this.currentIndex = cursor;
    return this.currentIndex;
  }

  progress(): number {
    if (this.words.length === 0) return 0;
    return Math.min(100, (this.currentIndex / this.words.length) * 100);
  }
}

// Simple voice-command detection, checked before matching consumes the
// transcript. Supports Spanish and English phrasing.
export type VoiceCommand = "pause" | "resume" | "restart" | "end" | "back" | null;

const COMMAND_PATTERNS: [RegExp, VoiceCommand][] = [
  [/\b(pausa|pausar|detente|para el? prompter|stop prompter|pause)\b/, "pause"],
  [/\b(continua|contin[uú]a|reanuda|resume|sigue)\b/, "resume"],
  [/\b(ve al? inicio|ir al? inicio|go to start|reinicia|restart)\b/, "restart"],
  [/\b(ve al? final|ir al? final|go to end|al final)\b/, "end"],
  [/\b(regresa|ve atras|go back|atras)\b/, "back"],
];

export function detectVoiceCommand(transcript: string): VoiceCommand {
  const normalized = stripAccents(transcript.toLowerCase());
  for (const [pattern, command] of COMMAND_PATTERNS) {
    if (pattern.test(normalized)) return command;
  }
  return null;
}

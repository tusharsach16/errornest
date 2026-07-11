"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   The three "lines" that type in. Each is a sequence of spans
   with different colours — pre-split so we can replay exactly.
───────────────────────────────────────────────────────────── */
interface Segment {
  text: string;
  className?: string;
}

// Three error payloads typing in to demonstrate deduplication
const LINES: Segment[][] = [
  [
    { text: "POST /api/errors/ingest  ", className: "text-gray-400" },
    { text: "TypeError: Cannot read properties of null", className: "text-red-400" },
  ],
  [
    { text: "POST /api/errors/ingest  ", className: "text-gray-400" },
    { text: "TypeError: Cannot read properties of null", className: "text-red-400" },
  ],
  [
    { text: "POST /api/errors/ingest  ", className: "text-gray-400" },
    { text: "TypeError: Cannot read properties of null", className: "text-red-400" },
  ],
];

const CHARS_PER_MS = 40; // ms per character
const LINE_GAP_MS = 180; // pause between lines

/** Flatten segments → plain string (for measuring total char count per line). */
function lineText(segments: Segment[]): string {
  return segments.map((s) => s.text).join("");
}

/** Render a line up to `revealed` characters, coloring per-segment. */
function renderLine(segments: Segment[], revealed: number): (JSX.Element | null)[] {
  let remaining = revealed;
  return segments.map((seg, i) => {
    if (remaining <= 0) return null;
    const slice = seg.text.slice(0, remaining);
    remaining -= seg.text.length;
    return (
      <span key={i} className={seg.className}>
        {slice}
      </span>
    );
  });
}

export default function AnimatedTerminal() {
  // revealedChars[lineIndex] = how many chars of that line are shown
  const [revealedChars, setRevealedChars] = useState<number[]>([0, 0, 0]);
  const [activeLine, setActiveLine] = useState(0); // which line is currently typing
  const [done, setDone] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion on mount
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      // Instantly show end state
      setRevealedChars(LINES.map((l) => lineText(l).length));
      setDone(true);
      setReducedMotion(true);
      return;
    }

    let currentLine = 0;
    let lineStartTime: number | null = null;
    const totalChars = LINES.map((l) => lineText(l).length);

    function tick(now: number) {
      if (currentLine >= LINES.length) {
        setDone(true);
        return;
      }

      if (lineStartTime === null) lineStartTime = now;
      const elapsed = now - lineStartTime;
      const chars = Math.min(
        Math.floor(elapsed / CHARS_PER_MS),
        totalChars[currentLine] ?? 0
      );

      setRevealedChars((prev) => {
        const next = [...prev];
        next[currentLine] = chars;
        return next;
      });

      if (chars >= (totalChars[currentLine] ?? 0)) {
        // Line finished — wait LINE_GAP_MS then move to next
        setTimeout(() => {
          currentLine++;
          lineStartTime = null;
          setActiveLine(currentLine);
          rafRef.current = requestAnimationFrame(tick);
        }, LINE_GAP_MS);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="mx-auto mt-12 max-w-[640px] overflow-hidden rounded-card border border-gray-200 bg-gray-950 text-left shadow-xl animate-hero-delay-2"
      role="img"
      aria-label="Animated terminal showing three identical errors being received and grouped into one issue by ErrorNest"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-gray-800 px-4 py-3">
        <span aria-hidden="true" className="h-3 w-3 rounded-pill bg-red-500 opacity-70" />
        <span aria-hidden="true" className="h-3 w-3 rounded-pill bg-yellow-500 opacity-70" />
        <span aria-hidden="true" className="h-3 w-3 rounded-pill bg-green-500 opacity-70" />
        <span className="ml-2 font-mono text-xs text-gray-500 select-none">errornest · ingestion log</span>
      </div>

      {/* Lines */}
      <div className="px-6 py-5 font-mono text-xs leading-loose">
        {/* Intro comment — static */}
        <div className="mb-3 text-gray-500 select-none"># same error, three requests — watch ErrorNest deduplicate it</div>

        {LINES.map((segments, idx) => {
          const isTyping = activeLine === idx && !done;
          const isVisible = revealedChars[idx]! > 0 || reducedMotion;
          if (!isVisible) return null;

          return (
            <div key={idx} className="flex items-center gap-3 mb-1">
              {/* Line number / arrow */}
              <span className="text-gray-600 select-none w-4 text-right shrink-0">{idx + 1}</span>
              <span className="text-gray-700 select-none shrink-0">›</span>
              {/* Content */}
              <span>
                {renderLine(segments, revealedChars[idx] ?? 0)}
                {isTyping && <span className="cursor-blink text-gray-300" aria-hidden="true" />}
              </span>
            </div>
          );
        })}

        {/* Grouped badge — fades in after all lines are done */}
        {done && (
          <div className="mt-4 animate-badge-in">
            <span className="inline-flex items-center gap-2 rounded-[8px] border border-zinc-800/60 bg-zinc-950/80 px-3 py-2 font-mono text-xs text-zinc-300">
              <svg
                aria-hidden="true"
                className="h-3 w-3 shrink-0 text-zinc-400"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
              </svg>
              <span>
                <span className="text-zinc-100 font-semibold">3 requests</span>
                <span className="text-zinc-400"> → grouped as </span>
                <span className="text-zinc-100 font-semibold">1 issue</span>
                <span className="text-zinc-400"> · occurrences: </span>
                <span className="text-zinc-100 font-semibold">3</span>
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

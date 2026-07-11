"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────
   Data
───────────────────────────────────────────────────── */
type Severity = "CRITICAL" | "ERROR" | "WARNING";

interface ErrorEntry {
  title: string;
  location: string;
  severity: Severity;
  count: number;
  time: string;
}

const ERRORS: ErrorEntry[] = [
  {
    title: "TypeError: Cannot read properties of null",
    location: "checkout.js:142",
    severity: "CRITICAL",
    count: 1247,
    time: "2s ago",
  },
  {
    title: "RangeError: Maximum call stack exceeded",
    location: "reducer.ts:89",
    severity: "ERROR",
    count: 89,
    time: "1m ago",
  },
  {
    title: "UnhandledPromiseRejection: fetch failed",
    location: "api/cart.ts:34",
    severity: "WARNING",
    count: 23,
    time: "5m ago",
  },
];

const SEV_CONFIG: Record<Severity, { pill: string; dot: string; rowBg: string }> = {
  CRITICAL: {
    pill: "border border-red-900/60 bg-red-950 text-red-400",
    dot: "bg-red-500",
    rowBg: "hover:bg-red-950/20",
  },
  ERROR: {
    pill: "border border-orange-900/60 bg-orange-950 text-orange-400",
    dot: "bg-orange-400",
    rowBg: "hover:bg-orange-950/10",
  },
  WARNING: {
    pill: "border border-yellow-900/60 bg-yellow-950 text-yellow-400",
    dot: "bg-yellow-400",
    rowBg: "hover:bg-yellow-950/10",
  },
};

/* ─────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────── */
export default function DashboardPreview() {
  const [visibleRows, setVisibleRows] = useState(0);
  const [counts, setCounts] = useState(ERRORS.map((e) => e.count));
  const [showLive, setShowLive] = useState(false);
  // tracks which index just ticked up so we can flash it
  const [ticking, setTicking] = useState<number | null>(null);
  const prevCount0 = useRef(counts[0]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      setVisibleRows(ERRORS.length);
      setShowLive(true);
      return;
    }

    const t: ReturnType<typeof setTimeout>[] = [];

    // 1. error rows reveal one by one
    ERRORS.forEach((_, i) =>
      t.push(setTimeout(() => setVisibleRows((v) => Math.max(v, i + 1)), 300 + i * 340))
    );

    // 2. LIVE badge
    t.push(setTimeout(() => setShowLive(true), 300 + ERRORS.length * 340 + 200));

    // 3. Live count increments on row 0
    t.push(
      setTimeout(() => setCounts((p) => p.map((c, i) => (i === 0 ? c + 1 : c))), 3200)
    );
    t.push(
      setTimeout(() => setCounts((p) => p.map((c, i) => (i === 0 ? c + 1 : c))), 5100)
    );

    return () => t.forEach(clearTimeout);
  }, []);

  // Flash effect when count[0] changes
  useEffect(() => {
    if (counts[0] !== prevCount0.current) {
      prevCount0.current = counts[0];
      setTicking(0);
      const t = setTimeout(() => setTicking(null), 700);
      return () => clearTimeout(t);
    }
  }, [counts]);

  return (
    <div
      aria-hidden="true"
      className="animate-float relative overflow-hidden rounded-card border border-zinc-200/70 dark:border-zinc-800/80 bg-gray-950 shadow-2xl"
    >
      {/* ── Window chrome ── */}
      <div className="flex items-center justify-between border-b border-gray-800/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-pill bg-red-500/80" />
          <span className="h-3 w-3 rounded-pill bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-pill bg-green-500/80" />
          <span className="ml-3 font-mono text-xs text-gray-400">
            myapp &middot; production
          </span>
        </div>
        <div>
          {showLive ? (
            <span className="inline-flex items-center gap-1 rounded-pill border border-green-900 bg-green-950 px-2 py-1 font-mono text-[10px] font-semibold text-green-400">
              <span className="live-dot h-1.5 w-1.5 rounded-pill bg-green-400" />
              LIVE
            </span>
          ) : (
            <span className="block h-5 w-12 animate-pulse rounded-pill bg-gray-800/60" />
          )}
        </div>
      </div>

      {/* ── Error rows ── */}
      <div className="divide-y divide-gray-800/40" style={{ minHeight: "172px" }}>
        {visibleRows === 0 && (
          <div className="flex h-[172px] items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 rounded-pill bg-gray-700"
                style={{
                  animation: `loadingDot 900ms ease-in-out ${i * 220}ms infinite`,
                }}
              />
            ))}
          </div>
        )}

        {ERRORS.slice(0, visibleRows).map((err, idx) => {
          const cfg = SEV_CONFIG[err.severity];
          const isFlashing = ticking === idx;
          return (
            <div
              key={err.title}
              className={`flex items-start justify-between gap-3 px-4 py-3 transition-colors duration-[150ms] ${cfg.rowBg}`}
              style={{ animation: "slideInRow 280ms ease-out both" }}
            >
              <div className="flex min-w-0 items-start gap-2">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-pill ${cfg.dot}`} />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] leading-snug text-gray-200">
                    {err.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-gray-600">
                    {err.location} &middot; {err.time}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide ${cfg.pill}`}
                >
                  {err.severity}
                </span>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums transition-colors duration-[600ms] ${
                    isFlashing ? "text-zinc-100" : "text-gray-400"
                  }`}
                >
                  &times;{counts[idx]?.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

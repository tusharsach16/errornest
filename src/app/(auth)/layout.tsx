"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex min-h-screen flex-col bg-page text-ink antialiased transition-colors duration-[150ms]">
      {/* ── Simplified Header ── */}
      <header className="w-full border-b border-gray-200 dark:border-zinc-800 bg-[#FDFDFD]/90 dark:bg-zinc-950/90 backdrop-blur-sm transition-colors duration-[150ms]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <Link
            href="/"
            aria-label="ErrorNest home"
            className="flex items-center gap-2 font-sans text-lg font-bold tracking-tight text-ink transition-all duration-[150ms] hover:opacity-85 hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-sm font-bold select-none"
            >
              E
            </span>
            <span>
              Error<span className="text-zinc-500 dark:text-zinc-400">Nest</span>
            </span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-11 w-11 items-center justify-center rounded-pill border border-gray-200 dark:border-zinc-800 bg-[#FDFDFD] dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 hover:scale-[1.05] active:scale-[0.97] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            {mounted && resolvedTheme === "dark" ? (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="M4.93 4.93l1.41 1.41" />
                <path d="M17.66 17.66l1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="M6.34 17.66l-1.41 1.41" />
                <path d="M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <main className="flex flex-1 items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
        {/* Dot-grid background layer */}
        <div
          className="hero-dot-grid pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
        />

        {/* Center Card */}
        <div className="w-full max-w-md rounded-card border border-gray-200 dark:border-zinc-800 bg-[#FDFDFD]/90 dark:bg-zinc-900/60 p-6 sm:p-8 shadow-xl z-10 backdrop-blur-xs">
          {children}
        </div>
      </main>
    </div>
  );
}

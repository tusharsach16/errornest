"use client";

import { useEffect, useState } from "react";

interface TopBarProps {
  userName: string | null;
  userEmail: string | null;
  onOpenCommandPalette: () => void;
}

export default function TopBar({ userName, userEmail, onOpenCommandPalette }: TopBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenCommandPalette();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onOpenCommandPalette]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl transition-colors duration-150">
      <div className="flex items-center justify-between px-6 py-3">
        {/* ── Left: spacer for mobile hamburger ── */}
        <div className="w-10 lg:w-0 shrink-0" />

        {/* ── Center/Right: Search trigger ── */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 rounded-[10px] border border-gray-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50 px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400 transition-all duration-150 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800/60 hover:text-zinc-700 dark:hover:text-zinc-300 max-w-md w-full ml-4 lg:ml-0"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="truncate">Search projects, navigate…</span>
          {mounted && (
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded-md border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-zinc-500 dark:text-zinc-400">
              {typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent) ? "⌘" : "Ctrl"}+K
            </kbd>
          )}
        </button>

        {/* ── Right: spacer ── */}
        <div className="w-4 shrink-0" />
      </div>
    </header>
  );
}

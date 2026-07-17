"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { HamburgerIcon } from "@/components/icons/HamburgerIcon";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Docs", href: "#docs" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-zinc-800 bg-[#FDFDFD]/90 dark:bg-zinc-950/90 backdrop-blur-sm transition-colors duration-[150ms]">
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

        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-8"
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="inline-block text-sm font-medium text-gray-500 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:text-ink dark:hover:text-white hover:scale-[1.05] active:scale-[0.97] focus-visible:rounded motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center text-sm font-medium text-gray-500 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:text-ink dark:hover:text-white hover:scale-[1.05] active:scale-[0.97] focus-visible:rounded min-h-[44px] motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center min-h-[44px] rounded-pill bg-zinc-900 dark:bg-zinc-100 px-6 py-2 text-sm font-semibold text-white dark:text-zinc-950 transition-all duration-[150ms] ease-out hover:bg-black dark:hover:bg-white hover:scale-[1.03] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            Sign up
          </Link>
          
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

        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-[8px] text-gray-700 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:bg-gray-100 dark:hover:bg-zinc-800 hover:scale-[1.05] active:scale-[0.97] focus-visible:rounded motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </div>

      <div
        id="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
        className={[
          "md:hidden overflow-hidden border-t border-gray-200 dark:border-zinc-800 bg-[#FDFDFD]/95 dark:bg-zinc-950/95 backdrop-blur-sm",
          "transition-[max-height,opacity] duration-[250ms] ease-out",
          menuOpen ? "max-h-[360px] opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center min-h-[44px] text-sm font-medium text-gray-700 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:text-ink dark:hover:text-white hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              {label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center min-h-[44px] rounded-[8px] border border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center min-h-[44px] rounded-pill bg-zinc-900 dark:bg-zinc-100 text-sm font-semibold text-white dark:text-zinc-950 transition-all duration-[150ms] ease-out hover:bg-zinc-800 dark:hover:bg-white hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              Sign up
            </Link>
            
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center justify-center min-h-[44px] rounded-pill border border-gray-200 dark:border-zinc-800 text-sm font-medium text-gray-700 dark:text-zinc-400 transition-all duration-[150ms] ease-out hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:scale-[1.02] active:scale-[0.98] focus-visible:rounded-pill motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
            >
              Toggle Light/Dark
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
